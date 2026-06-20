// App Router Route Handler: an exported `GET` with no JSDoc. Exercises the Next
// override that turns off jsdoc/require-jsdoc for route.ts entry files.
export function GET() {
  return Response.json({ ok: true });
}
