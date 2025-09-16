interface DedalusResponse {
  final_output: string;
  status: string;
}

interface DedalusRequest {
  input: string;
  model?: string;
}

class DedalusService {
  private apiKey = 'dsk_test_5816f53857a0_01f62942fff7bf578bcc03a7032baf72';
  private baseUrl = 'https://api.dedaluslabs.ai';

  async runQuery(input: string, model: string = 'openai/gpt-4o-mini'): Promise<DedalusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input,
          model,
        } as DedalusRequest),
      });

      if (!response.ok) {
        throw new Error(`Dedalus API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Dedalus API:', error);
      throw error;
    }
  }

  async streamQuery(input: string, model: string = 'openai/gpt-4o-mini'): Promise<ReadableStream> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          input,
          model,
          stream: true,
        }),
      });

      if (!response.ok) {
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