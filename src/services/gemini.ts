import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// The API key is automatically injected by the AI Studio environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractTextFromImage(file: File): Promise<string> {
  try {
    // Convert File to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = base64String.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "请提取图片中的题目文本、选项(如有)、用户原答案(如有)、标准答案(如有)。如果包含数学公式，请使用LaTeX格式。请清晰地排版输出。",
            },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            },
          ],
        },
      ],
    });

    return response.text || "";
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("图片识别失败，请重试");
  }
}

export async function extractKnowledgePoint(questionText: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `根据以下错题内容，判断其核心知识点（例如"一元二次方程根的判别式"、"现在完成时态"、"欧姆定律"等）。请仅返回知识点名称，尽量简短精炼。\n\n错题内容：\n${questionText}`,
            },
          ],
        },
      ],
    });

    return response.text?.trim() || "未知知识点";
  } catch (error) {
    console.error("Error extracting knowledge point:", error);
    throw new Error("知识点提取失败");
  }
}

export interface SimilarQuestion {
  question: string;
  answer: string;
  explanation: string;
  commonMistake: string;
}

export async function generateSimilarQuestions(
  knowledgePoint: string,
  originalQuestion: string
): Promise<SimilarQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `基于知识点“${knowledgePoint}”和原错题“${originalQuestion}”，生成3道举一反三的相似题目。
要求：
1. 覆盖同一知识点的不同角度或变式。
2. 难度与原题相当或略有梯度。
3. 每道相似题均附带正确答案，以及侧重易错点的解析。
4. 如果包含数学公式，请使用LaTeX格式。

请严格按照以下JSON格式返回，不要包含任何Markdown代码块标记（如\`\`\`json）：
[
  {
    "question": "题目内容...",
    "answer": "正确答案...",
    "explanation": "详细解析...",
    "commonMistake": "易错点分析（例如：本题常见错误是忘记讨论二次项系数为零的情况）"
  }
]`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    let responseText = response.text || "[]";
    // Strip markdown code block markers if present
    responseText = responseText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(responseText) as SimilarQuestion[];
  } catch (error) {
    console.error("Error generating similar questions:", error);
    throw new Error("举一反三生成失败");
  }
}
