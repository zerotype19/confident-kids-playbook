import { Router } from 'itty-router'
import { getUserFromToken } from './auth'

const router = Router()

router.get('/api/hello', async () => {
  return new Response(JSON.stringify({ message: 'hello world' }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

export default {
  fetch: async (request, env, ctx) => {
    return router.handle(request, env, ctx)
  }
}
