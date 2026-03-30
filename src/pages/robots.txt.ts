export async function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: https://413septic.com/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
}
