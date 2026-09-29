import { GoogleGenAI, Type } from '@google/genai';

export async function generateJSON<T>(prompt: string, schema: any, language: string = 'en'): Promise<T> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === 'your_gemini_api_key_here') {
        throw new Error("GEMINI_API_KEY_NOT_SET");
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are an agricultural advisor AI.
You must output in the following language: ${language}.
Gemini MUST NOT:
- Invent weather measurements
- Invent soil measurements
- Invent disease severity
- Claim certainty
- Generate unsupported pesticide dosages
- Pretend to be an agricultural authority
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.2
        }
    });

    if (response.text) {
        return JSON.parse(response.text) as T;
    }
    throw new Error("Empty response from Gemini");
}
