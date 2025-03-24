declare module '@tsndr/cloudflare-worker-jwt' {
  interface JwtPayload {
    [key: string]: unknown
  }

  interface VerifyOptions {
    complete?: boolean
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
    options?: VerifyOptions
  ): Promise<DecodedToken | JwtPayload>

  export function sign(
    payload: JwtPayload,
    secret: string
  ): Promise<string>
} 