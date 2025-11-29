import { GoogleGenAI, Type } from "@google/genai";
import { CaptionResult } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateImageCaptions = async (
  imageFile: File,
  tone: string = "fun and viral"
): Promise<CaptionResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Image = await fileToGenerativePart(imageFile);

    const prompt = `
      Analyze this image for social media.
      Tone: ${tone}.
      
      Generate a JSON response with:
      1. 'captions': An array of 3 distinct, engaging captions.
      2. 'hashtags': An array of 20 relevant, high-reach hashtags.
      3. 'strategy': A short 1-sentence tip on when to post this for maximum engagement.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            captions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            strategy: { type: Type.STRING }
          },
          required: ["captions", "hashtags", "strategy"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CaptionResult;
    }
    
    throw new Error("No response generated");

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};