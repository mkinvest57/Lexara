import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'not_pdf' }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'too_large' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Dynamic import so pdf-parse doesn't break SSR
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer, { max: 0 });

    const title = (data.info?.Title as string | undefined)?.trim()
      || file.name.replace(/\.pdf$/i, '');
    const text = data.text?.trim() ?? '';

    if (!text) return NextResponse.json({ error: 'no_text' }, { status: 422 });

    return NextResponse.json({ title, text, pages: data.numpages });
  } catch {
    return NextResponse.json({ error: 'extract_failed' }, { status: 500 });
  }
}
