export async function getUserFromToken(context) {
  const authHeader = context.request.headers.get('Authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  // Example logic: decode JWT or lookup in session DB
  return { id: 'user_1' } // mock for now
}
