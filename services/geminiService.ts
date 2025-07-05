import { GoogleGenAI } from "@google/genai";
import { ApiNodeConfig } from '../types';

let ai: GoogleGenAI | null = null;

// Sửa ở đây: process.env.API_KEY -> process.env.VITE_API_KEY
if (process.env.VITE_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.VITE_API_KEY });
} else {
  console.error("VITE_API_KEY environment variable not set. Gemini features will be disabled.");
}


export const generateApiConfig = async (prompt: string): Promise<Partial<ApiNodeConfig>> => {
    if (!ai) {
        throw new Error("Tính năng AI không khả dụng. Vui lòng đảm bảo VITE_API_KEY đã được định cấu hình.");
    }

    const systemInstruction = `You are an expert API configuration assistant. Based on the user's request, provide a JSON object with the following structure: { "name": "...", "url": "...", "method": "GET" | "POST", "headers": "{\\"Content-Type\\":\\"application/json\\"}", "body": "{}" }.
- The 'name' should be a concise, descriptive name for the API call in Vietnamese.
- For the 'url', use real-world public APIs like JSONPlaceholder if applicable. Use placeholders like <id> if needed.
- For 'headers' and 'body', provide them as stringified JSON.
- Only provide the raw JSON object in your response, without any markdown fences or explanations.

Example Request: "Lấy dữ liệu người dùng có id là 1 từ JSONPlaceholder"
Example Response: { "name": "Lấy người dùng 1", "url": "https://jsonplaceholder.typicode.com/users/1", "method": "GET", "headers": "{}", "body": "{}" }

Example Request: "Tạo một bài post mới"
Example Response: { "name": "Tạo bài viết mới", "url": "https://jsonplaceholder.typicode.com/posts", "method": "POST", "headers": "{\\"Content-Type\\": \\"application/json; charset=UTF-8\\"}", "body": "{\\"title\\": \\"foo\\", \\"body\\": \\"bar\\", \\"userId\\": 1}" }
`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedConfig = JSON.parse(jsonStr);
        return parsedConfig as Partial<ApiNodeConfig>;
    } catch (error) {
        console.error("Error generating API config with Gemini:", error);
        throw new Error("Không thể tạo cấu hình API từ Gemini. Vui lòng thử lại.");
    }
};