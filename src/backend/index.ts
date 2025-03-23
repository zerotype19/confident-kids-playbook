import { Router } from 'itty-router'
import { getUserFromToken } from './auth'

const router = Router()

router.get('/api/hello', async () => {
  return new Response(JSON.stringify({ message: 'hello world' }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// 🔧 Add this fallback route to prevent 1101 crash
router.all('*', () =>
  new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  })
)

export default {
  fetch: async (request, env, ctx) => {
    return router.handle(request, env, ctx)
  }
}
