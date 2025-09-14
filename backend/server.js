require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Convert video to audio
function convertVideoToAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .on('end', () => {
        console.log('Audio conversion completed');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Audio conversion error:', err);
        reject(err);
      })
      .save(outputPath);
  });
}

// Transcribe audio using Gemini
async function transcribeAudio(audioPath) {
  try {
    const audioBuffer = fs.readFileSync(audioPath);
    const base64Audio = audioBuffer.toString('base64');
    
    const prompt = `
      Please transcribe this audio file. The audio contains a lecture or educational content.
      Provide a clean, accurate transcript with proper punctuation and formatting.
      Include timestamps in the format [MM:SS] at the beginning of each major segment or topic change.
      Focus on accuracy and clarity for educational content.
    `;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Audio,
          mimeType: 'audio/mp3'
        }
      }
    ]);
    
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Structure transcript using Gemini
async function structureTranscript(transcript) {
  try {
    const prompt = `
You are an expert educational content analyst. I need you to convert a lecture transcript into a detailed structured JSON format that captures the hierarchical organization of educational content.

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
      "detail": "Detailed description of what happens in this segment, including specific concepts, equations, and examples mentioned"
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
    
    return JSON.parse(jsonText);
    
  } catch (error) {
    console.error('Structuring error:', error);
    throw error;
  }
}

// Convert structured data to graph nodes and edges
function convertToGraphData(structuredData, duration) {
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  // Process hierarchical structure to create nodes
  const processLayer = (layer, parentId, depth = 0) => {
    layer.forEach((item, index) => {
      const id = `node_${nodeId++}`;
      const node = {
        id,
        label: item.title,
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        size: Math.max(12, 20 - depth * 3),
        color: `hsl(${depth * 60 + index * 30}, 70%, 60%)`,
        timestamps: extractTimestampsFromBreakdown(structuredData.detailed_breakdown, item.id),
        description: getDescriptionFromBreakdown(structuredData.detailed_breakdown, item.id),
        category: getCategoryFromBreakdown(structuredData.detailed_breakdown, item.id),
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

function extractTimestampsFromBreakdown(breakdown, itemId) {
  const timestamps = [];
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

function getDescriptionFromBreakdown(breakdown, itemId) {
  const segment = breakdown.find(s => s.id === itemId || s.id.startsWith(itemId + '.'));
  return segment?.detail || 'No description available';
}

function getCategoryFromBreakdown(breakdown, itemId) {
  const segment = breakdown.find(s => s.id === itemId || s.id.startsWith(itemId + '.'));
  const category = segment?.category || 'definition';
  
  switch (category) {
    case 'example': return 'example';
    case 'method': case 'solution': return 'application';
    case 'introduction': return 'prerequisite';
    default: return 'definition';
  }
}

function createTranscriptSegments(transcript, duration) {
  const segments = [];
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

// Get video duration
function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    // Use ffprobe-static for better compatibility
    const ffprobe = require('ffprobe-static');
    ffmpeg.setFfprobePath(ffprobe.path);
    
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err);
        // Fallback to a default duration if ffprobe fails
        resolve(180); // 3 minutes default
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
}

// Main processing endpoint
app.post('/api/process-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoPath = req.file.path;
    const audioPath = videoPath.replace(path.extname(videoPath), '.mp3');
    
    console.log('Processing video:', req.file.originalname);
    
    // Step 1: Convert video to audio
    console.log('Converting video to audio...');
    await convertVideoToAudio(videoPath, audioPath);
    
    // Step 2: Get video duration
    const duration = await getVideoDuration(videoPath);
    
    // Step 3: Transcribe audio
    console.log('Transcribing audio...');
    const transcript = await transcribeAudio(audioPath);
    
    // Step 4: Structure transcript
    console.log('Structuring transcript...');
    const structuredData = await structureTranscript(transcript);
    
    // Step 5: Convert to graph data
    const { nodes, edges } = convertToGraphData(structuredData, duration);
    
    // Step 6: Create transcript segments
    const transcriptSegments = createTranscriptSegments(transcript, duration);
    
    // Clean up temporary files
    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
    
    // Return processed data
    res.json({
      success: true,
      data: {
        title: req.file.originalname.replace(/\.[^/.]+$/, ""),
        duration,
        transcript: transcriptSegments,
        structuredData,
        nodes,
        edges
      }
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      error: 'Video processing failed', 
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Video processing server running on port ${PORT}`);
});
