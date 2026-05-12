export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{ body?: string }>;
}) {
  const { body } = await searchParams;

  return (
    <main>
      <h1>Test Page</h1>
      <p>Hello from a server-rendered App Router page.</p>
      {body ? (
        <section>
          <h2>POST body (from /api/test)</h2>
          <pre>{body}</pre>
        </section>
      ) : (
        <p>
          <em>
            No POST body received. Send a POST to <code>/api/test</code> to see it rendered here.
          </em>
        </p>
      )}
    </main>
  );
}
