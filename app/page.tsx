"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [animatedSvg, setAnimatedSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const svgRef = useRef<HTMLDivElement>(null);

  const fullPlaceholder = "Enter your text here";

  useEffect(() => {
    if (!isInputFocused) {
      let index = 0;
      let increasing = true;

      intervalIdRef.current = setInterval(() => {
        if (increasing) {
          setPlaceholder(fullPlaceholder.slice(0, index + 1));
          index++;
          if (index === fullPlaceholder.length) {
            increasing = false;
          }
        } else {
          setPlaceholder(fullPlaceholder.slice(0, index - 1));
          index--;
          if (index === 0) {
            increasing = true;
          }
        }
      }, 200);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [isInputFocused]);

  useEffect(() => {
    if (animatedSvg && svgRef.current) {
      const svgElement = svgRef.current.querySelector("svg");
      if (svgElement) {
        svgElement.style.opacity = "0";
        setTimeout(() => {
          svgElement.style.opacity = "1";
          svgElement.style.transition = "opacity 0.5s ease-in-out";
        }, 100);
      }
    }
  }, [animatedSvg]);

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    setPlaceholder(fullPlaceholder);
  };

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

  const modifySvgForRepeat = (svgString: string): string => {
    // 使用正则表达式查找所有的 animate 标签
    const animateRegex = /<animate[^>]*>/g;

    // 替换每个 animate 标签，添加 repeatCount="indefinite"
    return svgString.replace(animateRegex, (match) => {
      if (match.includes("repeatCount")) {
        // 如果已经有 repeatCount，则替换它
        return match.replace(/repeatCount="[^"]*"/, 'repeatCount="indefinite"');
      } else {
        // 如果没有 repeatCount，则添加它
        return match.slice(0, -1) + ' repeatCount="indefinite">';
      }
    });
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

          <div className="flex w-full max-w-xl items-center mb-8 space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={handleInputFocus}
              className="w-3/5 flex-grow px-5 py-3 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              placeholder={placeholder}
            />
            <button
              onClick={handleGenerateAnimatedSvg}
              disabled={isLoading}
              // className="w-1/5 px-5 py-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 animate-gradient"
              className={`button animate-gradient`}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          {animatedSvg && (
            <div className="mt-8 bg-gray-100 rounded-lg p-6 w-full max-w-6xl">
              <h2 className="text-2xl font-semibold text-black mb-4">
                Generated Animated SVG
              </h2>
              <div
                ref={svgRef}
                dangerouslySetInnerHTML={{ __html: animatedSvg }}
                // className="w-full mb-4 border border-gray-300 rounded p-2 bg-white"
                className="w-full mb-4 border border-gray-300 rounded p-2 bg-white flex items-center justify-center"
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
