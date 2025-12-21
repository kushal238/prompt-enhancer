import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Reload env vars
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: '*', // Allow all origins (for extension content scripts)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Manually add headers just in case
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// Initialize Gemini
// We initialize this inside the request or check it dynamically if we want hot-reloading of env vars,
// but typically it's done at startup.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Prompt Engineer Backend is running' });
});

app.post('/api/enhance', async (req: Request, res: Response) => {
  try {
    const { prompt, tone = 'Professional', length = 'Medium', context = '' } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key present:', !!apiKey); // Debug log

    if (!apiKey || apiKey.includes('PASTE_YOUR_KEY')) {
       console.log('Using Mock Response - Key missing or default');
       res.json({ 
         original: prompt, 
         enhanced: `[MOCK] Please add your Gemini API Key to server/.env to get real results.\n\nOriginal: ${prompt}` 
       });
       return;
    }

    // Re-initialize to be safe
    const localGenAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash as it is the current stable model
    const model = localGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `
      You are an expert Prompt Engineer. Your goal is to take a user's raw, simple prompt and rewrite it to be highly effective for Large Language Models.
      
      Follow these rules:
      1.  **Clarity**: Make the intent unambiguous.
      2.  **Context**: Add necessary background or role (e.g., "Act as a senior developer").
      3.  **Structure**: Use bullet points or steps if the task is complex.
      4.  **Tone**: Rewrite the prompt using a **${tone}** tone.
      5.  **Length**: Keep the response length **${length}**.
      6.  **User Context**: Incorporate this specific context about the user/task: "${context}".
      
      Return ONLY the enhanced prompt text.
    `;

    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: systemInstruction }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I will act as an expert Prompt Engineer and rewrite prompts to be highly effective, returning only the enhanced prompt." }],
            },
        ],
    });

    const result = await chat.sendMessage(`Enhance this prompt: "${prompt}"`);
    const enhancedPrompt = result.response.text();

    res.json({ original: prompt, enhanced: enhancedPrompt });
  } catch (error: any) {
    console.error('Error enhancing prompt:', error);
    res.status(500).json({ 
      error: error.message || 'Unknown error',
      details: error
    });
  }
});

// Vercel requires exporting the app
export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
