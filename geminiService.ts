
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkPortugueseText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Corrija a gramática, ortografia e pontuação do seguinte texto em Português do Brasil, mantendo o tom jornalístico e formal. Se o texto já estiver correto, retorne exatamente o mesmo texto. Texto: "${text}"`,
      config: {
        temperature: 0.1,
      },
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
};

export const generateLeadSuggestion = async (title: string, content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base no título "${title}" e no conteúdo "${content.substring(0, 500)}", gere uma lide jornalística (quem, o quê, onde, quando e por que) impactante em 2 frases para um jornal escolar voltado à consciência negra.`,
    });
    return response.text;
  } catch (error) {
    return "";
  }
};
