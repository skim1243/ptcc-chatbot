# PTCC RAG Chatbot

A RAG (Retrieval-Augmented Generation) powered chatbot built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🤖 **RAG-powered responses**: Combines information retrieval with AI generation
- 💬 **Real-time chat interface**: Stream responses with a modern UI
- 🎨 **Beautiful design**: Built with Tailwind CSS and Lucide icons
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔒 **Type-safe**: Built with TypeScript for better development experience
- ⚡ **Fast**: Built with Next.js 14 and App Router

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI GPT-3.5-turbo
- **Streaming**: Vercel AI SDK
- **RAG**: Custom implementation (can be extended with vector databases)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ptcc_chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Get your OpenAI API key:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env.local` file

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── ChatInterface.tsx         # Main chat component
│   ├── ChatInput.tsx             # Message input
│   ├── MessageItem.tsx           # Individual message
│   └── MessageList.tsx           # Message list
└── lib/
    └── rag-service.ts            # RAG functionality
```

## How RAG Works

This chatbot implements a simple RAG system:

1. **Knowledge Base**: Contains relevant information (currently in-memory)
2. **Retrieval**: Searches for relevant context based on user queries
3. **Generation**: Uses retrieved context to generate more accurate responses

### Current Implementation

The current RAG system uses:
- Simple keyword-based retrieval
- In-memory knowledge base
- Basic context injection

### Future Enhancements

To make this production-ready, consider:
- Vector database integration (Pinecone, Weaviate, Chroma)
- Embedding models for semantic search
- Document ingestion pipeline
- Advanced retrieval strategies

## API Endpoints

### POST /api/chat

Handles chat messages with RAG-enhanced responses.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is Next.js?"
    }
  ]
}
```

**Response:** Streaming text response

## Customization

### Adding to Knowledge Base

You can extend the knowledge base by modifying `src/lib/rag-service.ts`:

```typescript
private knowledgeBase: string[] = [
  // Add your custom knowledge here
  "Your custom information here..."
]
```

### Styling

The app uses Tailwind CSS. You can customize the design by modifying:
- `src/app/globals.css` for global styles
- Component files for specific styling
- `tailwind.config.js` for theme customization

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `OPENAI_API_KEY` to Vercel environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

If you have any questions or issues, please open an issue on GitHub. 