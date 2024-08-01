import { NextRequest, NextResponse } from 'next/server';
import { convertToSvg } from '@/lib/convertToSvg';
import { convertToAnimate } from '@/lib/convertToAnimate';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // SVG conversion options
    const svgOptions = {
      maxSize: Number(formData.get('maxSize') || 800),
      edgeLowerThreshold: Number(formData.get('edgeLowerThreshold') || 40),
      edgeUpperThreshold: Number(formData.get('edgeUpperThreshold') || 80),
      weakEdgeValue: Number(formData.get('weakEdgeValue') || 25),
      strongEdgeValue: Number(formData.get('strongEdgeValue') || 255),
      minPathLength: Number(formData.get('minPathLength') || 3),
      simplifyTolerance: Number(formData.get('simplifyTolerance') || 1),
    };

    console.log('Converting image to SVG with options:', svgOptions);
    const svgString = await convertToSvg(buffer, svgOptions);
    console.log('SVG conversion completed. SVG length:', svgString.length);

    // Animation options
    const animationOptions = {
      duration: Number(formData.get('duration') || 5),
      delay: Number(formData.get('delay') || 0),
      type: (formData.get('type') as 'delayed' | 'sync' | 'oneByOne' | 'scenario' | 'scenario-sync') || 'oneByOne',
    };

    console.log('Converting SVG to animated SVG with options:', animationOptions);
    const animatedSvgString = convertToAnimate(svgString, animationOptions);
    console.log('Animation conversion completed. Animated SVG length:', animatedSvgString.length);

    return new NextResponse(animatedSvgString, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  } catch (error) {
    console.error('Error in conversion:', error);
    return NextResponse.json({ 
      error: 'Conversion failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}