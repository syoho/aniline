import { NextRequest, NextResponse } from 'next/server';
import { convertToSvg } from '@/lib/convertToSvg';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const image = data.get('image') as File;
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const options = {
      maxSize: 800,
      edgeLowerThreshold: 40,
      edgeUpperThreshold: 80,
      weakEdgeValue: 25,
      strongEdgeValue: 255,
      minPathLength: 3,
      simplifyTolerance: 1,
    };

    const svgString = await convertToSvg(buffer, options);
    return new NextResponse(svgString, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  } catch (error) {
    console.error('Error in convertToSvg:', error);
    return NextResponse.json({ error: 'SVG conversion failed' }, { status: 500 });
  }
}