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
    
    // Create system message with context
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful AI assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, you can use your general knowledge to help.

Context:
${context}

Please provide accurate and helpful responses based on the context and your knowledge.`
    }

    // Create the chat completion
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      stream: true,
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in chat API:', error)
    return new Response('Error processing your request', { status: 500 })
  }
} 