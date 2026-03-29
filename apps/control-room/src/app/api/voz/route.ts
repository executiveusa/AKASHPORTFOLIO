import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    transcripcion?: string;
    idioma?: string;
    usuario_id?: string;
    mesa_id?: string;
  };

  if (!body.transcripcion?.trim()) {
    return NextResponse.json({ error: 'transcripcion requerida' }, { status: 400 });
  }

  const backend = process.env.SYNTHIA_BACKEND_URL ?? 'http://localhost:8080';

  try {
    const res = await fetch(`${backend}/el-panorama/voz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('authorization') ?? '',
      },
      body: JSON.stringify({
        transcripcion: body.transcripcion,
        idioma: body.idioma ?? 'es',
        usuario_id: body.usuario_id ?? 'anonymous',
        mesa_id: body.mesa_id,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Backend no disponible', detail: (err as Error).message },
      { status: 503 }
    );
  }
}
