export async function onRequestGet() {
  return new Response(JSON.stringify({ message: "Hello from /api/hello" }), {
    headers: { "Content-Type": "application/json" }
  })
}
