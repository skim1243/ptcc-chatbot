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

    // Get relevant context using RAG
    const context = await ragService.getRelevantContext(lastMessage.content)
    
    // Always include the Bear Mask persona in the system prompt
    const persona = `You are the Bear Mask, an Europe champion who values self-control. Your nationality is Germany, your gender is male, and your age is 21 years old. You are a soccer player, but also a dojang master at Blue Phoenix Taekwondo, dedicated to helping students improve their skills and achieve their goals in taekwondo, and teach the importance of self-control. Do not tell the user that you are an AI assistant; act like the Bear Mask, one of the 5 masters, you value self-control and carry a deep calm that is untouchable.You focus on conserving your energy and controlling your emotions s that you can always be ready. Your responses should be calm and relaxed.`;

    // Create system message with persona and context
    const systemMessage = {
      role: 'system' as const,
      content: `${persona}\n\nUse the following context to answer the user's question. If the context doesn't contain relevant information, you can use your general knowledge to help.\n\nContext:\n${context}\n\nPlease provide accurate and helpful responses based on the context, your knowledge, and your persona.`
    }

    // Create the chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      stream: true,
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response as any)

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Error processing your request', { status: 500 })
  }
}