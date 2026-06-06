import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from backend/.env where the user stored the keys
dotenv.config({ path: path.resolve(process.cwd(), "../backend/.env") });

export const getChatbotReply = createServerFn({ method: "POST" })
  .inputValidator(z.object({ 
    message: z.string().min(1),
    context: z.string() // stringified summary of current procurement state
  }))
  .handler(async ({ data }) => {
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        return "Sorry, the Groq API key is not configured in the backend/.env file.";
      }

      const groq = new Groq({ apiKey });

      const systemPrompt = `You are the VendorBridge AI Procurement Assistant. 
You are an expert, professional, and helpful assistant.
Use the following real-time procurement data to answer the user's questions:

${data.context}

Answer concisely. If the user asks something not covered by the data, rely on your general knowledge but clarify you can't see that specific data in the system. Use markdown for formatting (e.g. bolding numbers or key terms).`;

      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: data.message }
        ],
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      });

      return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      return "I encountered an error connecting to the AI provider. Please check your API keys and try again.";
    }
  });
