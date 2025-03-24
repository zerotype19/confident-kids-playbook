import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client("GOOGLE_CLIENT_ID")

export async function getUserFromToken(request) {
  // Placeholder: implement real token logic later
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  return { id: 'user_1', token }
}

export async function verifyGoogleToken(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: "GOOGLE_CLIENT_ID"
  })
  const payload = ticket.getPayload()
  if (!payload) throw new Error("Invalid token")
  return {
    email: payload.email!,
    name: payload.name!,
    picture: payload.picture!
  }
}

export function generateJWT(userId: string): string {
  // TODO: Implement JWT generation
  return "dummy-jwt"
}
