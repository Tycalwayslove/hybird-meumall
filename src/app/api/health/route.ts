export function GET() {
  return Response.json({
    ok: true,
    service: "hybird-meumall-h5",
    renderMode: "ssr"
  });
}
