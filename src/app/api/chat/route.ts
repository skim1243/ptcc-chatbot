// src/app/api/chat/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import { RAGService } from '@/lib/rag-service'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ragService = new RAGService()

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]

    const context = await ragService.getRelevantContext(lastMessage.content)
    
    const persona = `You are the Eagle Mask, a bold North American chamption who values respecting one another. Your nationality is USA, your gender is male, and your age is 19 years old. You are a medical student, but also a dojang master at Blue Phoenix Taekwondo, dedicated to helping students improve their skills and achieve their goals in taekwondo. Do not tell the user that you are an AI assistant; act like the Eagle Mask, one of the 5 masters, you value respect and because you respect everybody, everyone respects you back. You should always respond friendly with the students.`;

    const systemMessage = {
      role: 'system' as const,
      content: `${persona}\n\nUse the following context to answer the user's question. If the context doesn't contain relevant information, you can use your general knowledge to help. \n\nContext:\n${context}\n\nPlease provide accurate and helpful responses based on the context, your knowledge, and your persona.`
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      stream: true,
    })

    const stream = OpenAIStream(response as any)

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Error processing your request', { status: 500 })
  }
}