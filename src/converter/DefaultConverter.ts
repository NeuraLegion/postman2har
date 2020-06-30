import { Converter } from './Converter';
import HarV1 from 'har-format';
import { ok } from 'assert';
import { format, parse, URL } from 'url';
import { ParsedUrlQuery, parse as parseQS, stringify } from 'querystring';
import faker from 'faker';

export class DefaultConverter implements Converter {
  constructor(
    private readonly options: {
      baseUri?: string;
    }
  ) {}

  public async convert(
    collection: PostmanV2.Collection
  ): Promise<HarV1.Request[]> {
    return this.traverse(collection);
  }

  private traverse(
    folder: PostmanV2.ItemGroup,
    parent?: PostmanV2.ItemGroup
  ): HarV1.Request[] {
    return folder.item
      .map((x: PostmanV2.ItemGroup | PostmanV2.Item) =>
        this.isGroup(x)
          ? this.traverse(x, folder)
          : this.convertRequest(x, {
              ...parent,
              ...folder
            })
      )
      .flat(100)
      .filter((x: HarV1.Request | undefined) => x != null) as HarV1.Request[];
  }

  private isGroup(x: any): x is PostmanV2.ItemGroup {
    return Array.isArray(x.item);
  }

  private convertRequest(
    item: PostmanV2.Item,
    folder?: PostmanV2.ItemGroup
  ): HarV1.Request | undefined {
    if (item.request) {
      const { method, url: urlObject, header, body, auth } = item.request;

      ok(method, 'Method is not defined.');

      const url: string = this.convertUrl(urlObject, folder);

      const request: HarV1.Request = {
        url,
        method: (method ?? 'GET').toUpperCase(),
        headers: this.convertHeaders(header!, folder),
        queryString: this.convertQuery(url, folder),
        cookies: [],
        postData: body && this.convertBody(body, folder),
        headersSize: -1,
        bodySize: -1,
        httpVersion: 'HTTP/1.1'
      };

      if (auth) {
        this.authRequest(request, auth);
      }

      return request;
    }
  }

  private authRequest(
    request: HarV1.Request,
    auth: PostmanV2.RequestAuth
  ): void {
    const params: PostmanV2.Variable[] | undefined = auth[auth.type];

    if (!params) {
      return;
    }

    const options: { [p: string]: string } = Object.fromEntries(
      params.map((val: PostmanV2.Variable) => [val.key, val.value])
    );

    switch (auth.type) {
      case 'apikey': {
        const target: 'queryString' | 'headers' = {
          query: 'queryString',
          header: 'headers'
        }[options.addTokenTo ?? 'header'];

        const idx = request[target].findIndex(
          (x: HarV1.QueryString | HarV1.Header) =>
            x.name.toLowerCase() === options.key.toLowerCase()
        );

        if (idx !== -1) {
          request[target].splice(idx, 1);
        }

        request[target].push({
          name: options.key,
          value: options.value
        });

        break;
      }
      case 'basic': {
        const idx = request.headers.findIndex(
          (x: HarV1.Header) => x.name.toLowerCase() === 'authorization'
        );

        if (idx !== -1) {
          request.headers.splice(idx, 1);
        }

        request.headers.push({
          name: '',
          value:
            'Basic ' +
            Buffer.from(
              `${options.username}:${options.password}`,
              'utf8'
            ).toString('base64')
        });
        break;
      }
      case 'bearer': {
        const idx = request.headers.findIndex(
          (x: HarV1.Header) => x.name.toLowerCase() === 'authorization'
        );

        if (idx !== -1) {
          request.headers.splice(idx, 1);
        }

        request.headers.push({
          name: 'Authorization',
          value: 'Bearer ' + options.token.replace(/^Bearer/, '').trim()
        });
        break;
      }
      case 'oauth2': {
        if (!options.accessToken || options.tokenType === 'mac') {
          break;
        }

        const headerIdx = request.headers.findIndex(
          (x: HarV1.Header) => x.name.toLowerCase() === 'authorization'
        );

        if (headerIdx !== -1) {
          request.headers.splice(headerIdx, 1);
        }

        const queryIdx = request.queryString.findIndex(
          (x: HarV1.QueryString) => x.name.toLowerCase() === 'access_token'
        );

        if (queryIdx !== -1) {
          request.queryString.splice(queryIdx, 1);
        }

        const target: 'queryString' | 'headers' = {
          query: 'queryString',
          header: 'headers'
        }[options.addTokenTo ?? 'header'];

        if (target === 'queryString') {
          request.queryString.push({
            name: 'access_token',
            value: options.accessToken
          });
        } else {
          const headerPrefix = !options.headerPrefix
            ? 'Bearer '
            : options.headerPrefix;

          request.headers.push({
            name: 'Authorization',
            value: `${headerPrefix.trim()} ${options.accessToken}`
          });
        }
        break;
      }
      case 'noauth':
      default:
        break;
    }
  }

  private convertBody(
    body: PostmanV2.RequestBody,
    _scope?: PostmanV2.VariableScope
  ): HarV1.PostData {
    return {
      ...this.encodeBody(body),
      comment:
        typeof body.description === 'string'
          ? body.description
          : body.description?.content
    };
  }

  private encodeBody(body: PostmanV2.RequestBody): HarV1.PostData {
    switch (body.mode) {
      case 'raw':
        return {
          params: [],
          mimeType: this.getMimetype(body.options?.raw?.language ?? 'json'),
          text: body.raw ?? ''
        };
      case 'urlencoded':
        return {
          mimeType: 'application/x-www-form-urlencoded',
          params: Array.isArray(body.urlencoded)
            ? body.urlencoded.map((x: PostmanV2.QueryParam) => ({
                name: x.key!,
                value: x.value
              }))
            : Object.entries(parseQS(body.urlencoded!)).map(
                ([name, value]) => ({
                  name,
                  value: Array.isArray(value) ? value.join('&') : value
                })
              ),
          text:
            typeof body.urlencoded === 'string'
              ? body.urlencoded
              : stringify(
                  Object.fromEntries(
                    body.urlencoded!.map((x: PostmanV2.QueryParam) => [
                      x.key,
                      x.value
                    ])
                  )
                )
        };
      case 'formdata':
        return {
          mimeType: 'multipart/form-data',
          params: Array.isArray(body.formdata)
            ? body.formdata.map((x: PostmanV2.FormParam) => ({
                name: x.key!,
                value: x.value,
                contentType: x.contentType
              }))
            : [],
          text: ''
        };
      case 'file':
        return {
          mimeType: 'application/octet-stream',
          params: [],
          text: typeof body.file === 'string' ? body.file : body.file?.content!
        };
      default:
        throw new Error('"mode" is not supported.');
    }
  }

  private getMimetype(
    lang: 'json' | 'text' | 'javascript' | 'html' | 'xml' | string
  ): string {
    switch (lang) {
      case 'json':
        return 'application/json';
      case 'javascript':
      case 'js':
        return 'application/javascript';
      case 'html':
        return 'text/html';
      case 'xml':
        return 'application/xml';
      case 'text':
      default:
        return 'text/plain';
    }
  }

  private convertHeaders(
    headers: PostmanV2.Header[] | string,
    scope?: PostmanV2.VariableScope
  ): HarV1.Header[] {
    if (Array.isArray(headers)) {
      return headers.map((x: PostmanV2.Header) => ({
        name: x.key!,
        value: this.isVariable(x.key!)
          ? (this.resolveVariable(x.key!, scope) as string)
          : x.value!,
        comment:
          typeof x.description === 'string'
            ? x.description
            : x.description?.content
      }));
    }

    return headers.split('\n').map((x: string) => {
      const [name, value] = x.split(': ');

      return {
        name,
        value
      };
    });
  }

  private convertUrl(
    url: PostmanV2.Url | string,
    scope?: PostmanV2.VariableScope
  ): string {
    if (typeof url === 'string') {
      return url;
    }

    const host: string | undefined = Array.isArray(url.host)
      ? url.host
          .map((x: string) =>
            this.resolveVariable(x, {
              ...scope,
              ...url
            })
          )
          .join('.')
      : url.host;

    ok(host, 'Host is not defined.');

    const protocol: string = (url.protocol = url.protocol ?? 'https').endsWith(
      ':'
    )
      ? url.protocol
      : url.protocol + ':';

    const pathname: string = Array.isArray(url.path)
      ? url.path
          .map((x: string | PostmanV2.Variable) =>
            typeof x === 'string'
              ? this.resolveVariable(x, {
                  ...scope,
                  ...url
                })
              : this.resolveVariable(x.name!, {
                  ...scope,
                  ...url
                })
          )
          .join('/')
      : url.path;

    const query: ParsedUrlQuery | undefined = Array.isArray(url.query)
      ? url.query.reduce((params: ParsedUrlQuery, x: PostmanV2.QueryParam) => {
          params[x.key!] = this.isVariable(x.key!)
            ? (this.resolveVariable(x.key!, {
                ...scope,
                ...url
              }) as string)
            : x.value;

          return params;
        }, {})
      : undefined;

    let auth: string = '';

    if (url.auth) {
      if (url.auth.user) {
        auth += url.auth.user;
      }

      if (url.auth.password) {
        auth += ':' + url.auth.password;
      }
    }

    let urlObject = {
      auth,
      pathname,
      query,
      protocol,
      host: this.options.baseUri,
      port: url.port,
      hash: url.hash
    };

    if (this.options.baseUri) {
      const { host, port, protocol } = new URL(this.options.baseUri);

      urlObject = {
        ...urlObject,
        host,
        port,
        protocol
      };
    }

    return format(urlObject);
  }

  private convertQuery(
    url: PostmanV2.Url | string,
    scope?: PostmanV2.VariableScope
  ): HarV1.QueryString[] {
    let query: ParsedUrlQuery | undefined;

    if (typeof url === 'string') {
      query = parse(url, true).query;
    } else {
      query = Array.isArray(url.query)
        ? url.query.reduce(
            (params: ParsedUrlQuery, x: PostmanV2.QueryParam) => {
              params[x.key!] = this.isVariable(x.key!)
                ? (this.resolveVariable(x.key!, {
                    ...scope,
                    ...url
                  }) as string)
                : x.value;

              return params;
            },
            {}
          )
        : undefined;
    }

    if (!query) {
      return [];
    }

    return Object.entries(query).map(
      ([name, value]: [string, undefined | string | string[]]) => ({
        name,
        value: Array.isArray(value) ? value.join(',') : value!
      })
    );
  }

  private resolveVariable(
    name: string,
    scope?: PostmanV2.VariableScope
  ): unknown | undefined {
    if (this.isVariable(name)) {
      const normalized = name
        .replace(/^:/, '')
        .replace(/^{{/, '')
        .replace(/}}$/, '');

      const variable: PostmanV2.Variable | undefined = scope?.variable?.find(
        (x: PostmanV2.Variable) => x.key === normalized
      );

      if (variable) {
        if (variable.value && variable.value !== 'schema type not provided') {
          return variable.value;
        }

        switch (variable.type?.toLowerCase()) {
          case 'string':
          case 'text':
            return faker.random.word();
          case 'number':
            return ~~(Math.random() * (1000 + 1));
          case 'boolean':
            return faker.random.boolean();
          case 'any':
          default:
            return faker.random.arrayElement([
              faker.random.alphaNumeric(10),
              faker.random.number({ min: 1, max: 99 }),
              faker.random.uuid()
            ]);
        }
      }
    }

    return name;
  }

  private isVariable(name: string): boolean {
    return (
      name.startsWith(':') || (name.startsWith('{{') && name.endsWith('}}'))
    );
  }
}
