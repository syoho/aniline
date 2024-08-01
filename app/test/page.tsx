'use client';

import { useState } from 'react';

export default function TestSvgConversion() {
  const [file, setFile] = useState<File | null>(null);
  const [svgResult, setSvgResult] = useState<string | null>(null);
  const [edgeDetectionThreshold, setEdgeDetectionThreshold] = useState(50);
  const [simplificationTolerance, setSimplificationTolerance] = useState(1);
  const [minPathLength, setMinPathLength] = useState(3);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('edgeDetectionThreshold', edgeDetectionThreshold.toString());
    formData.append('simplificationTolerance', simplificationTolerance.toString());
    formData.append('minPathLength', minPathLength.toString());

    try {
      const response = await fetch('/api/convert-to-svg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('SVG conversion failed');
      }

      const svgString = await response.text();
      setSvgResult(svgString);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to convert image to SVG');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test SVG Conversion</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="mb-2">
          <label className="block">
            Edge Detection Threshold:
            <input
              type="number"
              value={edgeDetectionThreshold}
              onChange={(e) => setEdgeDetectionThreshold(Number(e.target.value))}
              className="ml-2 border px-2 py-1"
            />
          </label>
        </div>
        <div className="mb-2">
          <label className="block">
            Simplification Tolerance:
            <input
              type="number"
              step="0.1"
              value={simplificationTolerance}
              onChange={(e) => setSimplificationTolerance(Number(e.target.value))}
              className="ml-2 border px-2 py-1"
            />
          </label>
        </div>
        <div className="mb-2">
          <label className="block">
            Min Path Length:
            <input
              type="number"
              value={minPathLength}
              onChange={(e) => setMinPathLength(Number(e.target.value))}
              className="ml-2 border px-2 py-1"
            />
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Convert to SVG
        </button>
      </form>
      {svgResult && (
        <div>
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <div dangerouslySetInnerHTML={{ __html: svgResult }} className="border p-2" />
        </div>
      )}
    </div>
  );
}