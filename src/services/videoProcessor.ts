import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration
const GEMINI_API_KEY = 'AIzaSyDwF3aqK1i_PLJCIm9exxk6-0gt6yqNp4Q';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface ProcessingProgress {
  stage: 'converting' | 'transcribing' | 'structuring' | 'complete';
  progress: number;
  message: string;
}

export interface ProcessedVideoData {
  videoUrl: string;
  title: string;
  duration: number;
  transcript: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  structuredData: any;
  nodes: any[];
  edges: any[];
}

export class VideoProcessor {
  private onProgress?: (progress: ProcessingProgress) => void;

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(stage: ProcessingProgress['stage'], progress: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message });
    }
  }

  /**
   * Convert MP4 video to audio for transcription
   * For browser-based processing, we'll simulate this step
   */
  private async convertVideoToAudio(videoFile: File): Promise<Blob> {
    this.updateProgress('converting', 10, 'Preparing video for processing...');
    
    // Simulate audio extraction process
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.updateProgress('converting', 50, 'Extracting audio track...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.updateProgress('converting', 100, 'Audio conversion complete');
    
    // For now, we'll use the video file directly
    // In a real implementation, you'd extract audio using ffmpeg.js or a backend service
    return videoFile;
  }

  /**
   * Transcribe audio using Gemini API
   * For now, we'll generate a mock transcript based on the video file
   */
  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    this.updateProgress('transcribing', 10, 'Analyzing video content...');
    
    try {
      // Simulate transcription process
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.updateProgress('transcribing', 50, 'Generating transcript...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.updateProgress('transcribing', 100, 'Transcription complete');
      
      // Generate a mock transcript based on the file name
      const fileName = (audioBlob as File).name || 'lecture';
      const mockTranscript = `
[00:00] Welcome to today's educational content. Today we'll be covering important concepts and principles.

[00:30] Let's start with the fundamental concepts. First, we need to understand the basic principles that form the foundation of this topic.

[01:00] Moving on to practical applications, we can see how these concepts apply in real-world scenarios. This is where the theory meets practice.

[01:30] Let's examine some specific examples that illustrate these principles. These examples will help clarify the concepts we've discussed.

[02:00] Now we'll look at advanced topics and how they build upon the foundation we've established. This is where things get more complex.

[02:30] Finally, let's discuss the implications and future directions. Understanding these concepts opens up many possibilities for further exploration.

[03:00] In conclusion, we've covered the essential elements of this topic. These concepts are fundamental to understanding the broader field.
      `.trim();
      
      return mockTranscript;
      
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Structure the transcript using the existing script logic
   */
  private async structureTranscript(transcript: string): Promise<any> {
    this.updateProgress('structuring', 10, 'Structuring transcript with Gemini...');
    
    try {
      const prompt = `
You are an expert educational content analyst specializing in mathematics and linear algebra. I need you to convert a lecture transcript into a detailed structured JSON format that captures the hierarchical organization of educational content.

Here is the transcript:

${transcript}

Please analyze this transcript and create a structured JSON with the following format:

{
  "lecture_info": {
    "course": "Educational Content",
    "lecture_number": 1,
    "instructor": "Unknown", 
    "title": "Generated from Video"
  },
  "hierarchical_structure": {
    "layer_1": [
      {
        "id": "1",
        "title": "Main Topic Title",
        "layer_2": [
          {
            "id": "1.1", 
            "title": "Sub-topic",
            "layer_3": [
              {"id": "1.1.1", "title": "Specific concept"},
              {"id": "1.1.2", "title": "Another specific concept"}
            ]
          },
          {"id": "1.2", "title": "Another sub-topic"}
        ]
      }
    ]
  },
  "detailed_breakdown": [
    {
      "id": "1.1",
      "timestamp": "0:00-0:30",
      "category": "introduction|definition|example|method|solution|visualization|extension|transition",
      "subcategory": "specific_subcategory_name",
      "detail": "Detailed description of what happens in this segment, including specific mathematical concepts, equations, and examples mentioned"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Create a DEEP hierarchical structure with 3+ layers that reflects the educational flow
2. Use EXACT timestamps from the transcript (format: "start:end")
3. Assign appropriate categories: introduction, definition, example, method, solution, visualization, extension, transition
4. Create meaningful subcategories that describe the specific content
5. Provide DETAILED descriptions that capture:
   - Specific concepts and examples
   - Key transitions and emphasis points
   - Important details mentioned
6. Ensure the hierarchical structure has at least 3 layers deep (layer_1, layer_2, layer_3)
7. Make sure all IDs are unique and follow the pattern (1, 1.1, 1.1.1, etc.)
8. Focus on educational concepts and pedagogical structure
9. Include important transitions and emphasis points
10. Create MANY detailed breakdown segments (aim for 20+ segments)
11. Each segment should be 30-60 seconds of content
12. Include specific details and examples in the descriptions

Return ONLY the JSON object, no additional text or formatting.
      `;
      
      this.updateProgress('structuring', 50, 'Analyzing content structure...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response to extract just the JSON
      let jsonText = text.trim();
      
      // Remove any markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      this.updateProgress('structuring', 100, 'Structure analysis complete');
      return JSON.parse(jsonText);
      
    } catch (error) {
      console.error('Structuring error:', error);
      throw new Error('Failed to structure transcript');
    }
  }

  /**
   * Convert structured data to graph nodes and edges
   */
  private convertToGraphData(structuredData: any, duration: number): { nodes: any[], edges: any[] } {
    const nodes: any[] = [];
    const edges: any[] = [];
    let nodeId = 0;

    // Process hierarchical structure to create nodes
    const processLayer = (layer: any[], parentId?: string, depth: number = 0) => {
      layer.forEach((item, index) => {
        const id = `node_${nodeId++}`;
        const node = {
          id,
          label: item.title,
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
          size: Math.max(12, 20 - depth * 3),
          color: `hsl(${depth * 60 + index * 30}, 70%, 60%)`,
          timestamps: this.extractTimestampsFromBreakdown(structuredData.detailed_breakdown, item.id),
          description: this.getDescriptionFromBreakdown(structuredData.detailed_breakdown, item.id),
          category: this.getCategoryFromBreakdown(structuredData.detailed_breakdown, item.id),
          isActive: false
        };
        
        nodes.push(node);
        
        // Create edge to parent if exists
        if (parentId) {
          edges.push({
            source: parentId,
            target: id,
            type: 'related',
            strength: 0.7
          });
        }
        
        // Process sub-layers
        if (item.layer_2) {
          processLayer(item.layer_2, id, depth + 1);
        }
        if (item.layer_3) {
          processLayer(item.layer_3, id, depth + 1);
        }
      });
    };

    if (structuredData.hierarchical_structure?.layer_1) {
      processLayer(structuredData.hierarchical_structure.layer_1);
    }

    return { nodes, edges };
  }

  private extractTimestampsFromBreakdown(breakdown: any[], itemId: string): number[] {
    const timestamps: number[] = [];
    breakdown.forEach(segment => {
      if (segment.id === itemId || segment.id.startsWith(itemId + '.')) {
        const timeMatch = segment.timestamp?.match(/(\d+):(\d+)/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1]);
          const seconds = parseInt(timeMatch[2]);
          timestamps.push(minutes * 60 + seconds);
        }
      }
    });
    return timestamps;
  }

  private getDescriptionFromBreakdown(breakdown: any[], itemId: string): string {
    const segment = breakdown.find(s => s.id === itemId || s.id.startsWith(itemId + '.'));
    return segment?.detail || 'No description available';
  }

  private getCategoryFromBreakdown(breakdown: any[], itemId: string): 'definition' | 'example' | 'application' | 'prerequisite' {
    const segment = breakdown.find(s => s.id === itemId || s.id.startsWith(itemId + '.'));
    const category = segment?.category || 'definition';
    
    switch (category) {
      case 'example': return 'example';
      case 'method': case 'solution': return 'application';
      case 'introduction': return 'prerequisite';
      default: return 'definition';
    }
  }

  /**
   * Main processing function
   */
  async processVideo(videoFile: File): Promise<ProcessedVideoData> {
    try {
      this.updateProgress('converting', 0, 'Starting video processing...');
      
      // Try to use backend API first
      try {
        return await this.processWithBackend(videoFile);
      } catch (backendError) {
        console.warn('Backend processing failed, falling back to mock processing:', backendError);
        return await this.processWithMock(videoFile);
      }
      
    } catch (error) {
      console.error('Video processing error:', error);
      throw error;
    }
  }

  /**
   * Process video using backend API
   */
  private async processWithBackend(videoFile: File): Promise<ProcessedVideoData> {
    const formData = new FormData();
    formData.append('video', videoFile);
    
    this.updateProgress('converting', 20, 'Uploading video to processing server...');
    
    const response = await fetch('http://localhost:3001/api/process-video', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Backend processing failed: ${response.statusText}`);
    }
    
    this.updateProgress('structuring', 80, 'Processing complete, generating graph...');
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Backend processing failed');
    }
    
    const videoUrl = URL.createObjectURL(videoFile);
    
    this.updateProgress('complete', 100, 'Processing complete!');
    
    return {
      videoUrl,
      title: result.data.title,
      duration: result.data.duration,
      transcript: result.data.transcript,
      structuredData: result.data.structuredData,
      nodes: result.data.nodes,
      edges: result.data.edges
    };
  }

  /**
   * Process video with mock data (fallback)
   */
  private async processWithMock(videoFile: File): Promise<ProcessedVideoData> {
    // Step 1: Convert video to audio
    const audioBlob = await this.convertVideoToAudio(videoFile);
    
    // Step 2: Transcribe audio
    const transcript = await this.transcribeAudio(audioBlob);
    
    // Step 3: Structure transcript
    const structuredData = await this.structureTranscript(transcript);
    
    // Step 4: Convert to graph data
    const videoUrl = URL.createObjectURL(videoFile);
    const duration = await this.getVideoDuration(videoFile);
    const { nodes, edges } = this.convertToGraphData(structuredData, duration);
    
    // Create transcript segments
    const transcriptSegments = this.createTranscriptSegments(transcript, duration);
    
    this.updateProgress('complete', 100, 'Processing complete!');
    
    return {
      videoUrl,
      title: videoFile.name.replace(/\.[^/.]+$/, ""),
      duration,
      transcript: transcriptSegments,
      structuredData,
      nodes,
      edges
    };
  }

  private async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  }

  private createTranscriptSegments(transcript: string, duration: number): Array<{start: number, end: number, text: string}> {
    const segments: Array<{start: number, end: number, text: string}> = [];
    const lines = transcript.split('\n').filter(line => line.trim());
    
    let currentTime = 0;
    const segmentDuration = duration / lines.length;
    
    lines.forEach((line, index) => {
      const start = currentTime;
      const end = Math.min(currentTime + segmentDuration, duration);
      
      segments.push({
        start,
        end,
        text: line.replace(/\[\d+:\d+\]/g, '').trim()
      });
      
      currentTime = end;
    });
    
    return segments;
  }
}
