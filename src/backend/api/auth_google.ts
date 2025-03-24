import { verifyGoogleTokenAndCreateJwt } from '../lib/googleAuth'

interface Env {
  JWT_SECRET: string
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json()
    const { credential } = body

    if (!credential) {
      return new Response(JSON.stringify({ error: 'Missing credential' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await verifyGoogleTokenAndCreateJwt(credential, env.JWT_SECRET)
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: `${err}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 