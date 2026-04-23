export const runtime = 'edge'

export async function GET() {
  return Response.redirect('/', 302)
}