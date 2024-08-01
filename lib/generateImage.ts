const engineId = 'stable-diffusion-v1-6';
const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
const apiKey = process.env.STABILITY_API_KEY;

export async function generateImage(text: string): Promise<Buffer> {
  if (!apiKey) {
    throw new Error('Missing Stability API key');
  }

  const response = await fetch(`${apiHost}/v1/generation/${engineId}/text-to-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text_prompts: [
        {
          text: text + ', from behind, abstract, hand-drawn illustration, minimalist graphic, line art, monochrome, bold outline, bold strokes, line drawing, minimalism, only use black, white background',
        },
      ],
      cfg_scale: 7,
      height: 512,
      width: 512,
      steps: 30,
      samples: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return Buffer.from(result.artifacts[0].base64, 'base64');
}