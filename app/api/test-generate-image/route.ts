import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/generateImage';
import { convertToSvg } from '@/lib/convertToSvg';

export async function GET() {
  try {
    const testText = 'a cute cat';
    console.log(`Testing generateImage with text: "${testText}"`);

    const imageBuffer = await generateImage(testText);
    console.log('Image generated successfully');
    console.log('Image buffer size:', imageBuffer.length, 'bytes');

    console.log('Converting image to SVG...');
    const svgString = await convertToSvg(imageBuffer);
    console.log('SVG generated successfully');
    console.log('SVG string length:', svgString.length);

    // Return the SVG
    return new NextResponse(svgString, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  } catch (error) {
    console.error('Error in testGenerateImage:', error);
    return NextResponse.json({ 
      error: 'Image processing failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}