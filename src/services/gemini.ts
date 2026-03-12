import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const models = {
  llm: "gemini-flash-latest",
  vlm: "gemini-flash-latest",
  slm: "gemini-flash-latest",
  image: "gemini-2.0-flash",
};

export async function chat(message: string, model: string = models.llm) {
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: message }] }],
  });
  return response.text;
}

export async function analyzeImage(imageBuffer: string, prompt: string) {
  const response = await ai.models.generateContent({
    model: models.vlm,
    contents: [
      {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: prompt },
        ],
      },
    ],
  });
  return response.text;
}

import * as hf from "./huggingface";

export async function generateImage(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: models.image,
      contents: [{ parts: [{ text: prompt }] }],
      config: {},
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.warn("Gemini image generation failed, falling back to Hugging Face:", e);
    try {
      return await hf.generateImage(prompt);
    } catch (hfError) {
      console.error("Hugging Face fallback also failed:", hfError);
      throw e; // Re-throw the original Gemini error if fallback fails
    }
  }
  throw new Error("No image generated");
}

export async function simulateAction(task: string) {
  const controlLightFunction = {
    name: "execute_action",
    parameters: {
      type: Type.OBJECT,
      description: "Executes a specific action in the simulated environment.",
      properties: {
        action: { type: Type.STRING, description: "The action to perform (e.g., 'turn_on_lights', 'set_temperature')" },
        params: { type: Type.STRING, description: "Parameters for the action" },
      },
      required: ["action", "params"],
    },
  };

  const response = await ai.models.generateContent({
    model: models.llm,
    contents: [{ parts: [{ text: `The user wants to: ${task}. Use the execute_action tool to fulfill the request.` }] }],
    config: {
      tools: [{ functionDeclarations: [controlLightFunction] }],
    },
  });

  return response.functionCalls;
}

export async function segmentImage(imageBuffer: string) {
  const response = await ai.models.generateContent({
    model: models.vlm,
    contents: [
      {
        parts: [
          { inlineData: { data: imageBuffer, mimeType: "image/jpeg" } },
          { text: "Identify the main objects in this image and provide their bounding boxes in [ymin, xmin, ymax, xmax] format (0-1000 scale). Return as JSON." },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });
  return response.text;
}
