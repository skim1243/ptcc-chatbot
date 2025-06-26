'use client'

import { Message } from 'ai'
import { User, Bot } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MessageItemProps {
  message: Message
}

// Function to parse bold text (**text**) and convert to HTML
const parseBoldText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2)
      return <strong key={index}>{boldText}</strong>
    }
    return part
  })
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-bounce-in`}>
      <div 
        className={`flex items-start gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} ${
          isVisible ? 'animate-bounce-in' : 'opacity-0 scale-95'
        } transition-all duration-500 ease-out`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-500 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div className={`rounded-lg px-4 py-2 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}>
          <p className="whitespace-pre-wrap">{parseBoldText(message.content)}</p>
        </div>
      </div>
    </div>
  )
} 