declare module '@tsndr/cloudflare-worker-jwt' {
  interface JwtPayload {
    [key: string]: unknown
  }

  interface DecodedToken {
    header: {
      alg: string
      typ: string
    }
    payload: JwtPayload
    signature: string
  }

  export function verify(
    token: string,
    secret: string,
    options?: { complete?: boolean }
  ): Promise<DecodedToken | JwtPayload>

  export function sign(
    payload: JwtPayload,
    secret: string
  ): Promise<string>
} 