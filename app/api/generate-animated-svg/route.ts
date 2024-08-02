import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/generateImage";
import { convertToSvg } from "@/lib/convertToSvg";
import { convertToAnimate } from "@/lib/convertToAnimate";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Step 1: Generate initial image
    const imageBuffer = await generateImage(text);

    // Step 2: Convert image to SVG
    const svgString = await convertToSvg(imageBuffer, {
      maxSize: 800,
      edgeLowerThreshold: 40,
      edgeUpperThreshold: 80,
      weakEdgeValue: 25,
      strongEdgeValue: 255,
      minPathLength: 3,
      simplifyTolerance: 1,
    });

    // Step 3: Convert SVG to animated SVG
    const animatedSvgString = convertToAnimate(svgString, {
      duration: 50,
      delay: 0,
      type: "oneByOne",
    });

    return NextResponse.json(
      { animatedSvg: animatedSvgString },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in generateAnimatedSvg:", error);
    return NextResponse.json(
      {
        error: "Animated SVG generation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
