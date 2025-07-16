// src/lib/rag-service.ts

const RAG_API_BASE_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://127.0.0.1:5000';

export class RAGService {
  async getRelevantContext(query: string): Promise<string> {
    try {
      const response = await fetch(`${RAG_API_BASE_URL}/get_context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RAG API error: ${response.status} - ${errorText}`);
        return `Error fetching context: ${response.statusText}.`;
      }

      const data = await response.json();

      return data.context || "No specific context found from documents.";

    } catch (error) {
      console.error('Error calling RAG service:', error);
      return "An error occurred while retrieving context from documents.";
    }
  }
}
