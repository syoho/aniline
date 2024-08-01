import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/generateImage';
import { convertToSvg } from '@/lib/convertToSvg';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Step 1: Generate image
    const imageBuffer = await generateImage(text);

    // Step 2: Convert image to SVG
    const svgString = await convertToSvg(imageBuffer);

    // Return the SVG string
    return new NextResponse(svgString, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}