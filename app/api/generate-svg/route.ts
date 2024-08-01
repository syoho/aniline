import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/generateImage';
import { convertToSvg } from '@/lib/convertToSvg';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(`Generating image and SVG for text: "${text}"`);
    const imageBuffer = await generateImage(text);
    console.log('Image generated successfully');
    console.log('Image buffer size:', imageBuffer.length, 'bytes');

    console.log('Converting image to SVG...');
    const svgString = await convertToSvg(imageBuffer);
    console.log('SVG generated successfully');
    console.log('SVG string length:', svgString.length);

    return new NextResponse(svgString, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  } catch (error) {
    console.error('Error in generateSvg:', error);
    return NextResponse.json({ 
      error: 'SVG generation failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}