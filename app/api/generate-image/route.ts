import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/generateImage';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(`Generating image for text: "${text}"`);
    const imageBuffer = await generateImage(text);
    console.log('Image generated successfully');
    console.log('Image buffer size:', imageBuffer.length, 'bytes');

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ image: dataUrl }, { status: 200 });
  } catch (error) {
    console.error('Error in generateImage:', error);
    return NextResponse.json({ 
      error: 'Image generation failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}