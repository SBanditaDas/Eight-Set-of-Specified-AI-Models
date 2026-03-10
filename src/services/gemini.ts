import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const models = {
  llm: "gemini-3.1-pro-preview",
  vlm: "gemini-3.1-pro-preview",
  slm: "gemini-3-flash-preview",
  image: "gemini-2.5-flash-image",
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

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: models.image,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
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
