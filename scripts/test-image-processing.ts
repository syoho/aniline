import fs from 'fs/promises';
import path from 'path';
import { generateImage } from '../lib/generateImage';
import { convertToSvg } from '../lib/convertToSvg';

async function testImageProcessing() {
  try {
    const testText = 'a cute cat';
    console.log(`Testing image processing with text: "${testText}"`);

    // Step 1: Generate image
    console.log('Generating image...');
    const imageBuffer = await generateImage(testText);
    console.log('Image generated successfully');
    console.log('Image buffer size:', imageBuffer.length, 'bytes');

    // Save the original image
    const originalImagePath = path.join(__dirname, '..', 'test-output', 'original-image.png');
    await fs.writeFile(originalImagePath, imageBuffer);
    console.log('Original image saved to:', originalImagePath);

    // Step 2: Convert image to SVG
    console.log('Converting image to SVG...');
    const svgString = await convertToSvg(imageBuffer);
    console.log('SVG generated successfully');
    console.log('SVG string length:', svgString.length);

    // Save the SVG
    const svgPath = path.join(__dirname, '..', 'test-output', 'converted-image.svg');
    await fs.writeFile(svgPath, svgString);
    console.log('SVG saved to:', svgPath);

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error in testImageProcessing:', error);
  }
}

testImageProcessing();