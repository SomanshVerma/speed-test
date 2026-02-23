import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 52_428_800;

export async function POST(request: Request) {
  let totalBytes = 0;

  try {
    if (request.body) {
      const reader = request.body.getReader();
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          totalBytes += result.value.byteLength;
          if (totalBytes > MAX_BYTES) {
            reader.cancel();
            return NextResponse.json(
              { error: 'Payload too large', bytesReceived: totalBytes },
              { status: 413 }
            );
          }
        }
      }
    }
  } catch {
    // Client may have aborted
  }

  return NextResponse.json({ ok: true, bytesReceived: totalBytes });
}
