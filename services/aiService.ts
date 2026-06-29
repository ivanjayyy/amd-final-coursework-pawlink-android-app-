// src/services/aiService.ts
import { GoogleGenAI } from "@google/genai";

// Initialize using your environment variable key
const ai = new GoogleGenAI({
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
});

/**
 * Validates an image URI with Gemini to verify if it contains a real animal.
 * Converts local image path data into standard base64 structures.
 */
export const validateIsRealAnimal = async (
  localUri: string,
): Promise<{ isValid: boolean; reasoning: string }> => {
  try {
    // 1. Fetch the image data locally and convert to base64 string
    const response = await fetch(localUri);
    const blob = await response.blob();

    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip the standard data URL prefix metadata if present
        const base64Str = result.split(",")[1] || result;
        resolve(base64Str);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Determine mime-type suffix configuration
    const filename = localUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const mimeType = match ? `image/${match[1]}` : "image/jpeg";

    // 2. Transmit content verification prompt payloads directly into Gemini Flash
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: 'Analyze this image carefully. Your sole task is to determine if this image depicts a real, living animal (like a dog, cat, bird, rabbit, etc.). Respond strictly in valid JSON format using these exact keys: {"isAnimal": boolean, "reasoning": "A short one-sentence explanation of what you see"}. Do not wrap code in markdown block formatting ticks or write any other text.',
            },
          ],
        },
      ],
    });

    const responseText = aiResponse.text?.trim() || "";
    // Clean up markdown code blocks if the model ignores instructions and includes them
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const parsedResult = JSON.parse(cleanJson);

    return {
      isValid: !!parsedResult.isAnimal,
      reasoning: parsedResult.reasoning || "Analysis complete.",
    };
  } catch (error) {
    console.error("Gemini scanning system fault:", error);
    // Safe failure behavior pattern: pass verification if API errors out so users aren't locked out
    return {
      isValid: true,
      reasoning: "Bypassing intelligence scan due to grid connection timeout.",
    };
  }
};
