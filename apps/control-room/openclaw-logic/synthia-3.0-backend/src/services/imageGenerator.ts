import { GoogleGenAI } from "@google/genai";

export async function generateHeroImage() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: "A high-end, editorial magazine-style hero section for a brand called 'SYNTHIA 3.0'. The background is a serene, misty desert landscape at dawn with soft, warm lighting and subtle fog. In the center, the word 'SYNTHIA' is written in a large, elegant, white serif font with tight tracking. Directly below it, '3.0' is written in a smaller, sophisticated amber-colored font, centered. Below the title, there is a thin horizontal white line and a subtitle in a refined, italicized serif font. The overall mood is sophisticated, minimalist, premium, and harmonious. 16:9 aspect ratio.",
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
