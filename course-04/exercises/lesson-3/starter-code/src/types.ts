export interface Token {
  header: { kid?: string };
  payload: {
    sub: string;
    name: string;
    iat: number;
  };
}
