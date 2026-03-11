import { HfInference } from "@huggingface/inference";

const hfToken = process.env.VITE_HF_TOKEN || "";
const hf = new HfInference(hfToken);

export const models = {
    llm: "meta-llama/Meta-Llama-3-8B-Instruct",
    vlm: "vikhyatk/moondream2",
    slm: "microsoft/Phi-3-mini-4k-instruct",
    image: "black-forest-labs/FLUX.1-schnell",
};

// Helper to convert base64 to Blob
async function base64ToBlob(base64: string, mimeType: string = "image/jpeg") {
    const response = await fetch(`data:${mimeType};base64,${base64}`);
    return await response.blob();
}

export async function chat(message: string, model: string = models.llm) {
    const result = await hf.chatCompletion({
        model,
        messages: [{ role: "user", content: message }],
        max_tokens: 500,
    });
    return result.choices[0].message.content;
}

export async function analyzeImage(imageBuffer: string, prompt: string) {
    const blob = await base64ToBlob(imageBuffer);
    const result = await hf.visualQuestionAnswering({
        model: models.vlm,
        inputs: {
            image: blob,
            question: prompt,
        },
    });
    return result.answer;
}

export async function generateImage(prompt: string) {
    const blob = await hf.textToImage({
        model: models.image,
        inputs: prompt,
    });

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob as any);
    });
}

// Hugging Face doesn't have a direct equivalent to Gemini's simulated function calling 
// in a single simple inference call without a specific model that supports it well.
// We'll use the LLM to simulate the JSON output.
export async function simulateAction(task: string) {
    const prompt = `Convert the following user request into a JSON action call.
Available actions: turn_on_lights, set_temperature.
Task: "${task}"
Return ONLY JSON in this format: [{"args": {"action": "string", "params": "string"}}]`;

    const response = await chat(prompt);
    try {
        const cleanedJson = response?.replace(/```json|```/g, "").trim() || "[]";
        return JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Failed to parse LAM response from HF", e);
        return [];
    }
}

export async function segmentImage(imageBuffer: string) {
    const blob = await base64ToBlob(imageBuffer);
    const arrayBuffer = await blob.arrayBuffer();

    // Use a generic object detection model for HF
    const result = await hf.objectDetection({
        model: "facebook/detr-resnet-50",
        data: arrayBuffer,
    });

    return JSON.stringify(result.map(det => ({
        label: det.label,
        box_2d: [det.box.ymin * 10, det.box.xmin * 10, det.box.ymax * 10, det.box.xmax * 10], // Scale to match app's expectation
        score: det.score
    })));
}
