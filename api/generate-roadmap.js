export default async function handler(req, res) {
  // Enable CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Send a POST request.' });
  }

  const { topic, depth } = req.body || {};

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Please enter a valid topic.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel Environment Variables.' });
  }

  const prompt = `You are an expert curriculum architect.
Create a structured learning roadmap for: "${topic}".
Depth level: "${depth || 'Standard'}".

Return ONLY raw JSON with this exact schema (no markdown, no backticks):
{
  "title": "Roadmap Title",
  "subtitle": "Short subtitle overview",
  "nodes": [
    {
      "id": 1,
      "phase": "Phase 1: Foundation",
      "duration": "2-3 Weeks",
      "title": "Milestone Title",
      "summary": "Brief summary",
      "overview": "Detailed overview description",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "project": "Hands-on project description",
      "resources": ["Book or doc 1", "Resource 2"],
      "completed": false
    }
  ]
}
Generate between 3 to 5 nodes.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5
        }
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API Error:', data);
      return res.status(geminiRes.status).json({
        error: data.error?.message || 'Gemini API call failed'
      });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res.status(500).json({ error: 'No output received from AI model.' });
    }

    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
