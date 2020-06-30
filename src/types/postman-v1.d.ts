declare namespace PostmanV1 {
  export interface PropertyBaseDefinition {
    description?: string | Description;
  }

  export interface Property extends PropertyBaseDefinition {
    id?: string;
    name?: string;
    disabled?: boolean;
  }

  export interface Folder extends Property {
    collection_id?: string;
    collection?: string;
    auth?: RequestAuth;
    events?: Event[];
    variables?: Variable[];
    order: string[];
    folders_order?: string[];
    folders?: Folder[];
  }

  export interface Collection extends Folder {
    schema: string;
    version?: Version | string;
    requests: Request[];
  }

  export interface Cookie {
    key?: string;
    value?: string;
    expires?: string;
    maxAge?: number;
    domain: string;
    path: string;
    secure?: boolean;
    httpOnly?: boolean;
    hostOnly?: boolean;
    session?: boolean;
    extensions?: { key: string; value: string }[];
  }

  export interface Description {
    content: string;
    type?: string;
  }

  export interface Event extends Property {
    listen?: string;
    script: Script;
  }

  export interface Data extends Property {
    key: string;
    value?: any;
    contentType?: string;
    enabled?: boolean;
    type?: 'file' | 'text';
  }

  export interface Header extends Property {
    key?: string;
    value?: string;
    system?: boolean;
  }

  export interface QueryParam extends Property {
    key: string | null;
    value: string | null;
  }

  export interface Request extends Property {
    collectionId?: string;
    collection?: string;
    folder?: string;
    url: string | Url;
    dataMode?: 'raw' | 'urlencoded' | 'params' | 'binary' | 'graphql';
    dataOptions?: any;
    dataDisabled?: boolean;
    data?: Data;
    method?:
      | (
          | 'GET'
          | 'PUT'
          | 'POST'
          | 'PATCH'
          | 'DELETE'
          | 'COPY'
          | 'HEAD'
          | 'OPTIONS'
          | 'LINK'
          | 'UNLINK'
          | 'PURGE'
          | 'LOCK'
          | 'UNLOCK'
          | 'PROPFIND'
          | 'VIEW'
        )
      | string;
    headers?: string;
    headerData?: Header[];
    pathVariableData?: Variable[];
    queryParams?: QueryParam[] | string;
    auth?: RequestAuth;
    pathVariables?: string | any;
    variables?: Variable[];
    events?: Event[];
    time?: number;
    currentHelper?: string;
    helperAttributes?: string | { id: RequestAuthType };
    responses?: Response[];
    rawModeData?: string[] | string;
    graphqlModeData?: any;
  }

  export type RequestAuthType =
    | 'apikey'
    | 'awsv4'
    | 'basic'
    | 'bearer'
    | 'digest'
    | 'edgegrid'
    | 'hawk'
    | 'noauth'
    | 'oauth1'
    | 'oauth2'
    | 'ntlm';

  export interface RequestAuth extends Property {
    type?: RequestAuthType;
    noauth?: Variable[];
    apikey?: Variable[];
    awsv4?: Variable[];
    basic?: Variable[];
    bearer?: Variable[];
    digest?: Variable[];
    edgegrid?: Variable[];
    hawk?: Variable[];
    ntlm?: Variable[];
    oauth1?: Variable[];
    oauth2?: Variable[];
  }

  export interface Response extends Property {
    mime?: string;
    text?: string;
    rawDataType?: string;
    cookies?: Cookie[];
    headers?: Header[];
    request: Request;
    responseCode: {
      code: number;
      name: string;
      detail?: string;
    };
    time?: number;
  }

  export interface Script extends Property {
    type?: string;
    src?: Url;
    exec?: string[] | string;
  }

  export interface Url {
    raw?: string;
    protocol?: string;
    hash?: string;
    host?: string | string[];
    path:
      | string
      | string[]
      | {
          type?: string;
          value?: string;
        }[];
    port?: string;
    query: QueryParam[];
    variable: Variable[];
  }

  export interface Variable extends Property {
    value?: any;
    type?: string;
    key?: string;
  }

  export interface Version extends PropertyBaseDefinition {
    build?: string;
    major?: string;
    minor?: string;
    patch?: string;
    prerelease?: string;
    raw?: string;
    string?: string;
  }
}
