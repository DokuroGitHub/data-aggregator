export interface DecodedToken {
  nbf?: number;
  exp?: number;
  iss?: string;
  aud?: string;
  client_id?: string;
  sub?: string;
  auth_time?: number;
  idp?: string;
  preferred_username?: string;
  name?: string;
  scope?: string[];
  amr?: string[];
  mobilePhone?: string;
  [key: string]: any;
}

export interface IJwtService {
  decodeUserToken(token?: string): DecodedToken | null;
  decodeToken(token: string): DecodedToken | null;
}
