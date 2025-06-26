import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">PTCC RAG Chatbot</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ask me anything! I'm powered by RAG (Retrieval-Augmented Generation) technology.
          </p>
        </div>
        <ChatInterface />
      </div>
    </main>
  )
} 