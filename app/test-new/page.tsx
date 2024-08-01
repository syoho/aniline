'use client';

import { useState } from 'react';
import { convertToAnimate } from '@/lib/convertToAnimate';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [singleLineSvg, setSingleLineSvg] = useState<string | null>(null);
  const [animatedSvg, setAnimatedSvg] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setInitialImage(data.image);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
    }
  };

  const handleConvertToSvg = async () => {
    if (!initialImage) return;
    try {
      const formData = new FormData();
      const blob = await fetch(initialImage).then(r => r.blob());
      formData.append('image', blob, 'image.png');

      const response = await fetch('/api/convert-to-svg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('SVG conversion failed');
      }

      const svgString = await response.text();
      setSingleLineSvg(svgString);
    } catch (error) {
      console.error('Error converting to SVG:', error);
      alert('Failed to convert to SVG');
    }
  };

  const handleConvertToAnimatedSvg = () => {
    if (!singleLineSvg) return;
    try {
      const animatedSvgString = convertToAnimate(singleLineSvg, {
        duration: 5,
        delay: 0,
        type: 'oneByOne',
      });
      setAnimatedSvg(animatedSvgString);
    } catch (error) {
      console.error('Error converting to animated SVG:', error);
      alert('Failed to convert to animated SVG');
    }
  };

  const handleDownloadAnimatedSvg = () => {
    if (!animatedSvg) return;
    const blob = new Blob([animatedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animated.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">SVG Image Generator</h1>
      
      <div className="mb-6">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Enter text for image generation"
        />
        <button 
          onClick={handleGenerateImage} 
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          Generate Image
        </button>
      </div>

      {initialImage && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Generated Image</h2>
          <img src={initialImage} alt="Generated" className="w-full mb-2 border rounded" />
          <button 
            onClick={handleConvertToSvg} 
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
          >
            Convert to Single Line SVG
          </button>
        </div>
      )}

      {singleLineSvg && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Single Line SVG</h2>
          <div 
            dangerouslySetInnerHTML={{ __html: singleLineSvg }} 
            className="w-full mb-2 border rounded p-2"
          />
          <button 
            onClick={handleConvertToAnimatedSvg} 
            className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition-colors"
          >
            Convert to Animated SVG
          </button>
        </div>
      )}

      {animatedSvg && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Animated SVG</h2>
          <div 
            dangerouslySetInnerHTML={{ __html: animatedSvg }} 
            className="w-full mb-2 border rounded p-2"
          />
          <button 
            onClick={handleDownloadAnimatedSvg} 
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
          >
            Download Animated SVG
          </button>
        </div>
      )}
    </main>
  );
}