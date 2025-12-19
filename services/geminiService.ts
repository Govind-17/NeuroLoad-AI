
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { OptimizationInput, AiResponse } from "../types";
import { MASTER_PROMPT_SYSTEM_INSTRUCTION } from "../constants";

// Define the response schema for strict JSON output without using non-exported Schema interface
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    loadingPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          packageId: { type: Type.STRING },
          position: { type: Type.STRING, description: "e.g., 'Front-Bottom-Left', 'Rear-Top-Right', 'Mid-Axle'" },
          reason: { type: Type.STRING, description: "Why this position was chosen (e.g., 'Heavy item for axle balance')" },
        },
        required: ["packageId", "position", "reason"],
      },
    },
    routePlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING },
          eta: { type: Type.STRING, description: "Estimated time of arrival" },
          activity: { type: Type.STRING, description: "What to do here (e.g., 'Unload P101')" },
          weatherAlert: { type: Type.STRING, description: "Any weather related warnings for this leg" },
        },
        required: ["city", "eta", "activity"],
      },
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        fuelSaved: { type: Type.STRING },
        co2Reduction: { type: Type.STRING },
        timeSaved: { type: Type.STRING },
        onTimeDeliveryRate: { type: Type.STRING },
      },
      required: ["fuelSaved", "co2Reduction", "timeSaved", "onTimeDeliveryRate"],
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed paragraph explaining the strategy like a human logistics manager.",
    },
    riskAssessment: {
      type: Type.STRING,
      description: "Potential risks and mitigations.",
    },
    learningInsights: {
      type: Type.STRING,
      description: "The 'Self-Learning' component. What did the system learn from this specific scenario that improves future logic? (e.g., 'Rainy conditions in Chennai significantly increased transit time, future models will buffer +15% time for this sector.')",
    }
  },
  required: ["loadingPlan", "routePlan", "metrics", "explanation", "riskAssessment", "learningInsights"],
};

export const generateOptimizationPlan = async (input: OptimizationInput): Promise<AiResponse> => {
  // Always create a new instance before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const userPrompt = `
    Analyze the following logistics scenario and generate an optimization plan.
    
    INPUT SPECIFICATION:
    
    1. Packages:
    ${JSON.stringify(input.packages, null, 2)}
    
    2. Cities/Destinations (Includes Traffic & Weather):
    ${JSON.stringify(input.cities, null, 2)}
    
    3. Truck Constraints:
    ${JSON.stringify(input.constraints, null, 2)}

    4. Simulation Scenario (What-If Factors):
    ${JSON.stringify(input.scenario, null, 2)}
    
    Generate the loading plan and route plan strictly following the system instructions.
    Ensure 'learningInsights' demonstrates the system's ability to learn from the specific weather/traffic conditions provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High-quality optimization task
      contents: userPrompt,
      config: {
        systemInstruction: MASTER_PROMPT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as AiResponse;
  } catch (error) {
    console.error("Gemini API Error (Optimization):", error);
    throw error;
  }
};

// Driver Co-Pilot Feature
export const getDriverAdvisory = async (
  lat: number, 
  lng: number, 
  speed: number, 
  heading: number, 
  context?: string
): Promise<string> => {
  // Always create a new instance before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userPrompt = `
    I am a truck driver currently at Lat: ${lat}, Lng: ${lng}.
    My current speed is ${speed} km/h.
    My heading is ${heading} degrees.
    Operational Context: ${context || 'None provided'}
    
    Act as my AI Co-Pilot 'NeuroLoad'. 
    Give me a very short (max 2 sentences), professional safety advisory or route update based on my current state. 
    Focus on situational awareness and futuristic logistics efficiency.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
    });
    // Access text property directly
    return response.text || "Systems nominal. Drive safe.";
  } catch (e) {
    console.error("Gemini API Error (Advisory):", e);
    return "Connection interrupted. Proceed with caution.";
  }
};

// Gemini High-Quality Speech Generation
export const generateSpeech = async (text: string): Promise<string | undefined> => {
  // Always create a new instance before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this in a helpful, calm, professional logistics AI voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return undefined;
  }
};
