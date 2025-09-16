interface DedalusResponse {
  final_output: string;
  status: string;
}

interface DedalusRequest {
  user_input: string;
  stream?: boolean;
  context?: any;
}

class DedalusService {
  private apiKey = import.meta.env.VITE_DEDALUS_API || import.meta.env.DEDALUS_API || 'dsk_test_5816f53857a0_01f62942fff7bf578bcc03a7032baf72';
  private baseUrl = 'https://api.dedaluslabs.ai';
  private agentId = 'your-agent-id'; // We'll need to create an agent first

  async runQuery(input: string): Promise<DedalusResponse> {
    try {
      console.log('Dedalus API Key:', this.apiKey ? 'Present' : 'Missing');
      console.log('Base URL:', this.baseUrl);
      console.log('Input:', input);
      
      // For now, let's use a simple chat completion endpoint
      // We'll need to create an agent first, but let's try the direct approach
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: input
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dedalus API error:', response.status, response.statusText, errorText);
        throw new Error(`Dedalus API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the response to match our expected format
      return {
        final_output: data.choices[0]?.message?.content || 'No response received',
        status: 'success'
      };
    } catch (error) {
      console.error('Error calling Dedalus API:', error);
      throw error;
    }
  }

  async streamQuery(input: string): Promise<ReadableStream> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: input
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: true
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dedalus API streaming error:', response.status, response.statusText, errorText);
        throw new Error(`Dedalus API error: ${response.status} ${response.statusText}`);
      }

      return response.body!;
    } catch (error) {
      console.error('Error streaming from Dedalus API:', error);
      throw error;
    }
  }
}

export const dedalusService = new DedalusService();
export type { DedalusResponse };