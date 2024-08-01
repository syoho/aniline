const engineId = "stable-diffusion-v1-6";
const apiHost = process.env.API_HOST ?? "https://api.stability.ai";
const apiKey = process.env.STABILITY_API_KEY;

async function translateToEnglish(text: string): Promise<string> {
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
        text
      )}`
    );

    if (!response.ok) {
      throw new Error("Translation API returned an error");
    }

    const data = await response.json();
    return data[0][0][0];
  } catch (error) {
    console.error("Translation failed:", error);
    throw error;
  }
}

export async function generateImage(text: string): Promise<Buffer> {
  if (!apiKey) {
    throw new Error("Missing Stability API key");
  }

  let translatedText = text;
  try {
    // Attempt to translate text to English
    translatedText = await translateToEnglish(text);
    console.log(`Original text: ${text}`);
    console.log(`Translated text: ${translatedText}`);
  } catch (error) {
    console.warn("Translation failed, using original text:", error);
    // If translation fails, we'll use the original text
  }

  try {
    const response = await fetch(
      `${apiHost}/v1/generation/${engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text:
                translatedText +
                ", from behind, abstract, hand-drawn illustration, minimalist graphic, line art, monochrome, bold outline, bold strokes, line drawing, minimalism, only use black, white background",
            },
          ],
          cfg_scale: 7,
          height: 512,
          width: 512,
          steps: 30,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Stability AI API error! status: ${response.status}`);
    }

    const result = await response.json();
    return Buffer.from(result.artifacts[0].base64, "base64");
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}
