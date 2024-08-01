"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [animatedSvg, setAnimatedSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAnimatedSvg = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-animated-svg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate animated SVG");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAnimatedSvg(data.animatedSvg);
    } catch (error) {
      console.error("Error generating animated SVG:", error);
      alert("Failed to generate animated SVG");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAnimatedSvg = () => {
    if (!animatedSvg) return;
    const blob = new Blob([animatedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "animated.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-full w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-5xl font-bold text-black">AniLine</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center py-2 pt-24">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6">
            Animated SVG <span className="text-gray-700">Generator</span>
          </h1>

          <p className="mt-3 text-xl sm:text-2xl text-gray-600 mb-8">
            Transform your text into animated SVG art
          </p>

          <div className="flex w-full max-w-md items-center mb-8">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow px-5 py-3 text-gray-700 bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder="Enter your text here"
            />
            <button
              onClick={handleGenerateAnimatedSvg}
              disabled={isLoading}
              className={`px-5 py-3 bg-black text-white rounded-r-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-800"
              }`}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          {animatedSvg && (
            <div className="mt-8 bg-gray-100 rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-semibold text-black mb-4">
                Generated Animated SVG
              </h2>
              <div
                dangerouslySetInnerHTML={{ __html: animatedSvg }}
                className="w-full mb-4 border border-gray-300 rounded p-2 bg-white"
              />
              <button
                onClick={handleDownloadAnimatedSvg}
                className="px-5 py-3 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Download Animated SVG
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
