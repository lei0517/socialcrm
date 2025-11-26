import { GoogleGenAI } from "@google/genai";
import { AiTextModel, AiImageModel, Platform } from "../types";

// Note: In a real production app, never expose keys in client code.
// However, per instructions, we access process.env.API_KEY.
const apiKey = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateCopywriting = async (
  prompt: string,
  modelName: AiTextModel,
  platform: Platform
): Promise<string> => {
  if (!ai) throw new Error("API Key not configured");

  // Since we only have Gemini keys, we simulate other models by prompting Gemini to act like them
  let systemInstruction = `You are a professional social media operations expert for ${
    platform === Platform.XIAOHONGSHU ? 'Xiaohongshu (Little Red Book)' : 'Xianyu (Idle Fish)'
  }. `;

  if (platform === Platform.XIAOHONGSHU) {
    systemInstruction += "Use emojis liberally. Tone should be excited, sharing, 'sisters', 'yyds', 'authentic'. Use tags.";
  } else {
    systemInstruction += "Tone should be direct, efficient, value-for-money, trustworthy. Focus on product condition and price.";
  }

  // Simulate selected model persona
  if (modelName === AiTextModel.DEEPSEEK) {
      systemInstruction += " You are simulating the DeepSeek-V3 model. Be extremely logical, deep, and structured in your reasoning, yet creative in output. Optimize for high engagement and conversion.";
  } else if (modelName !== AiTextModel.GEMINI) {
    systemInstruction += ` Simulate the writing style of the ${modelName} AI model.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      },
    });

    return response.text || "生成失败，请重试。";
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const generateImage = async (
  prompt: string,
  style: AiImageModel
): Promise<string> => {
  if (!ai) throw new Error("API Key not configured");

  // Enhance prompt based on style selection
  let enhancedPrompt = prompt;
  if (style === AiImageModel.DOUBAO) {
     enhancedPrompt += ", highly detailed, vibrant colors, asian aesthetic, social media style, high quality, commercial photography";
  } else if (style === AiImageModel.JIMENG) {
     enhancedPrompt += ", dreamy, artistic, soft lighting, creative composition, 4k resolution, cinematic";
  } else {
     enhancedPrompt += ", professional photography, high resolution";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Using Nano Banana model as requested for general image tasks
      contents: {
        parts: [
          { text: enhancedPrompt }
        ]
      },
      // config: { responseMimeType: 'image/jpeg' } // Not supported for nano banana
    });

    // Extract image from response parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};