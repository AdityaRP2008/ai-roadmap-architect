import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          phase: { type: Type.STRING },
          duration: { type: Type.STRING },
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          overview: { type: Type.STRING },
          topics: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          project: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          completed: { type: Type.BOOLEAN }
        },
        required: [
          "id", 
          "phase", 
          "duration", 
          "title", 
          "summary", 
          "overview", 
          "topics", 
          "project", 
          "resources", 
          "completed"
        ]
      }
    }
  },
  required: ["title", "subtitle", "nodes"]
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { topic, depth } = req.body || {};

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'A valid topic string is required.' });
  }

  const prompt = `
    You are an expert curriculum architect and academic specialist.
    Synthesize an extensive, structured learning roadmap for the discipline or topic: "${topic}".
    The target depth configuration is: "${depth || 'Standard'}".

    Rules:
    1. Generate between 3 to 5 sequentially ordered milestone nodes from initial fundamental principles to advanced modern frontiers.
    2. Provide concrete, non-generic topics and competencies for every milestone.
    3. Include a realistic, tangible project for every milestone.
    4. Provide recognized, real canonical literature, books, or papers in "resources".
    5. Set "completed" to false for all milestones.
  `;

 try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: roadmapSchema,
        temperature: 0.6
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate curriculum from model.', 
      details: error.message 
    });
  }
}
