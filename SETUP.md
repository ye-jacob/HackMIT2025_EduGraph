# Video Processing Pipeline Setup

This document explains how to set up and run the complete video processing pipeline that converts MP4 videos to interactive knowledge graphs.

## 🚀 Quick Start

If you just want to run everything immediately:

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start both servers with one command
npm start
```

Then open `http://localhost:8081` in your browser and upload a video!

## Architecture

The system consists of two main components:

1. **Frontend (React + TypeScript)**: User interface for uploading videos and displaying results
2. **Backend (Node.js + Express)**: Video processing server that handles:
   - MP4 to MP3 conversion using FFmpeg
   - Audio transcription using Google Gemini AI
   - Transcript structuring and knowledge graph generation

## Prerequisites

- Node.js (v16 or higher)
- FFmpeg installed on your system
- Google Gemini API key

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
cd /Users/jacobye/HackMIT2025/lecture-map-flow
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure API Key

The Gemini API key is already configured in both the frontend and backend. If you need to update it:

- Frontend: Update `GEMINI_API_KEY` in `src/services/videoProcessor.ts`
- Backend: Update `GEMINI_API_KEY` in `backend/server.js`

### 4. Start Both Servers (One Command)

You have several options to start both servers with a single command:

#### Option A: Using npm script (Recommended)
```bash
npm start
```

#### Option B: Using the shell script
```bash
./start.sh
```

#### Option C: Manual (if you prefer separate terminals)
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
npm run dev
```

The backend server will start on `http://localhost:3001` and the frontend on `http://localhost:8081`

## How It Works

### Video Processing Pipeline

1. **Video Upload**: User uploads an MP4 video file through the web interface
2. **Audio Extraction**: Backend converts MP4 to MP3 using FFmpeg
3. **Transcription**: Gemini AI transcribes the audio to text with timestamps
4. **Structuring**: Gemini AI analyzes the transcript and creates a hierarchical structure
5. **Graph Generation**: The structured data is converted into interactive knowledge graph nodes and edges
6. **Display**: Frontend displays the video player with synchronized knowledge graph

### Processing Stages

The system shows real-time progress through these stages:

- **Converting**: Video to audio conversion (20%)
- **Transcribing**: Audio transcription with Gemini (50%)
- **Structuring**: Content analysis and graph generation (80%)
- **Complete**: Final processing and display (100%)

### Fallback System

If the backend server is not available, the frontend automatically falls back to mock processing, ensuring the application remains functional for demonstration purposes.

## API Endpoints

### Backend API

- `POST /api/process-video`: Upload and process video file
- `GET /api/health`: Health check endpoint

### Request Format

```javascript
// POST /api/process-video
const formData = new FormData();
formData.append('video', videoFile);

fetch('http://localhost:3001/api/process-video', {
  method: 'POST',
  body: formData,
});
```

### Response Format

```javascript
{
  "success": true,
  "data": {
    "title": "Video Title",
    "duration": 180.5,
    "transcript": [
      {
        "start": 0,
        "end": 30,
        "text": "Welcome to today's lecture..."
      }
    ],
    "structuredData": {
      "lecture_info": { ... },
      "hierarchical_structure": { ... },
      "detailed_breakdown": [ ... ]
    },
    "nodes": [ ... ],
    "edges": [ ... ]
  }
}
```

## File Structure

```
lecture-map-flow/
├── src/
│   ├── components/
│   │   ├── EduGraph.tsx          # Main application component
│   │   ├── VideoUpload.tsx       # Video upload interface
│   │   ├── VideoPlayer.tsx       # Video player component
│   │   ├── KnowledgeGraph.tsx    # Interactive graph visualization
│   │   └── ...
│   └── services/
│       └── videoProcessor.ts     # Video processing service
├── backend/
│   ├── server.js                 # Backend server
│   └── package.json              # Backend dependencies
├── transcript-to-structured.js   # Original transcript processing script
└── package.json                  # Frontend dependencies
```

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**: 
   - Ensure the backend server is running on port 3001
   - Check that no firewall is blocking the connection
   - The frontend will automatically fall back to mock processing

2. **FFmpeg Not Found**:
   - Install FFmpeg on your system
   - Ensure it's available in your PATH
   - The backend uses `ffmpeg-static` package for easier deployment

3. **Gemini API Errors**:
   - Verify your API key is correct
   - Check your API quota and billing
   - Ensure the API key has the necessary permissions

4. **File Upload Issues**:
   - Check file size limits (500MB max)
   - Ensure the file is a valid video format
   - Verify CORS settings if running on different ports

### Development Mode

For development, you can run both servers with auto-reload:

```bash
# Terminal 1: Backend with nodemon
cd backend
npm run dev

# Terminal 2: Frontend with Vite
cd /Users/jacobye/HackMIT2025/lecture-map-flow
npm run dev
```

## Production Deployment

For production deployment:

1. Build the frontend: `npm run build`
2. Serve the built files with a web server
3. Deploy the backend to a cloud service (Heroku, AWS, etc.)
4. Update the API endpoint in the frontend to point to your production backend
5. Set up proper environment variables for API keys

## Features

- ✅ MP4 to MP3 conversion
- ✅ AI-powered audio transcription
- ✅ Intelligent content structuring
- ✅ Interactive knowledge graph generation
- ✅ Real-time processing progress
- ✅ Fallback to mock data
- ✅ Responsive web interface
- ✅ Video timeline synchronization
