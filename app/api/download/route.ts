export const dynamic = 'force-dynamic';

const CHUNK_SIZE = 65536;
const DURATION_MS = 10_000;

export async function GET() {
  const startTime = Date.now();
  const chunk = new Uint8Array(CHUNK_SIZE);
  for (let i = 0; i < CHUNK_SIZE; i++) {
    chunk[i] = (i * 31 + 17) & 0xff;
  }

  let closed = false;

  const stream = new ReadableStream({
    pull(controller) {
      if (closed) return;
      if (Date.now() - startTime >= DURATION_MS) {
        closed = true;
        controller.close();
        return;
      }
      controller.enqueue(new Uint8Array(chunk));
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
