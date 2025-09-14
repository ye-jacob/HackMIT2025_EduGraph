# 📋 Complete Upload Checklist for Lecture-Map-Flow

This document contains all the uploads and deployments you need to make for your HackMIT 2025 project.

## 🎯 Project Overview
**EduGraph** - Interactive Educational Video Analysis Platform
- Converts educational videos into interactive knowledge graphs
- AI-powered transcript analysis and concept extraction
- Synchronized video player with concept timeline

---

## 📁 **1. GITHUB REPOSITORY UPLOAD**

### Repository Setup
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: EduGraph HackMIT 2025 submission"

# Create repository on GitHub and push
git remote add origin https://github.com/[your-username]/lecture-map-flow.git
git branch -M main
git push -u origin main
```

### Files to Include in Repository
- ✅ All source code (`src/` directory)
- ✅ Backend code (`backend/` directory)
- ✅ Configuration files (`package.json`, `vite.config.ts`, etc.)
- ✅ Documentation (`README.md`, `SETUP.md`, `PROJECT_STRUCTURE.md`)
- ✅ Transcript files (`transcript.txt`, `mit_18_06_lecture_01_structured_transcript.json`)
- ✅ Scripts (`transcript-to-structured.js`, `start.sh`)

### Files to Exclude (in .gitignore)
- ❌ `node_modules/` directories
- ❌ `.env` files (API keys)
- ❌ `dist/` build directory
- ❌ Temporary files

---

## 🌐 **2. LIVE DEMO DEPLOYMENT**

### Option A: Vercel (Recommended for Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod

# Configure environment variables in Vercel dashboard
# - GEMINI_API_KEY: Your Google Gemini API key
```

### Option B: Netlify
```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
# - Drag and drop dist/ folder to Netlify dashboard
# - Or connect GitHub repository for auto-deploy
```

### Option C: GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npm run deploy
```

---

## 🔧 **3. BACKEND DEPLOYMENT**

### Option A: Heroku
```bash
# Install Heroku CLI
# Create Procfile in backend/ directory:
echo "web: node server.js" > backend/Procfile

# Deploy to Heroku
cd backend
heroku create your-app-name
git subtree push --prefix backend heroku main
```

### Option B: Railway
```bash
# Connect GitHub repository to Railway
# Set environment variables:
# - GEMINI_API_KEY
# - PORT (Railway will set this automatically)
```

### Option C: Render
```bash
# Connect GitHub repository to Render
# Configure build command: npm install
# Configure start command: node server.js
# Set environment variables in dashboard
```

---

## 📱 **4. HACKMIT SUBMISSION PLATFORM**

### Devpost Submission
1. **Project Title**: EduGraph - Interactive Educational Video Analysis
2. **Description**: 
   ```
   EduGraph transforms educational videos into interactive knowledge graphs, 
   enabling students to explore concepts, navigate content, and understand 
   relationships between topics through AI-powered analysis.
   ```
3. **Technologies Used**: React, TypeScript, Node.js, Google Gemini AI, D3.js, FFmpeg
4. **Demo Video**: Record a 2-3 minute demo showing:
   - Video upload process
   - Knowledge graph generation
   - Interactive concept exploration
   - Timeline navigation

### Required Links
- **GitHub Repository**: `https://github.com/[your-username]/lecture-map-flow`
- **Live Demo**: `https://your-app.vercel.app` (or your deployed URL)
- **Video Demo**: Upload to YouTube/Vimeo and link

---

## 🎥 **5. DEMO VIDEO CREATION**

### Video Content (2-3 minutes)
1. **Introduction** (30 seconds)
   - Show the application interface
   - Explain the problem it solves

2. **Upload Process** (45 seconds)
   - Upload a sample educational video
   - Show the processing stages
   - Highlight AI transcription and structuring

3. **Interactive Features** (60 seconds)
   - Navigate the knowledge graph
   - Click on concepts to jump to video timestamps
   - Show timeline synchronization
   - Demonstrate concept relationships

4. **Conclusion** (15 seconds)
   - Highlight key benefits
   - Call to action

### Video Requirements
- **Resolution**: 1080p minimum
- **Format**: MP4
- **Length**: 2-3 minutes
- **Audio**: Clear narration
- **Platform**: Upload to YouTube (unlisted) or Vimeo

---

## 🔑 **6. ENVIRONMENT VARIABLES SETUP**

### For Production Deployment
Create `.env` file with:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=3001
NODE_ENV=production
```

### API Key Setup
1. **Google Gemini API**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create new API key
   - Add to environment variables

---

## 📊 **7. TESTING CHECKLIST**

### Before Upload
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts without errors (`cd backend && npm start`)
- [ ] Video upload works end-to-end
- [ ] Knowledge graph renders correctly
- [ ] Timeline navigation functions
- [ ] Mobile responsiveness works
- [ ] All documentation is complete

### Test Videos
- [ ] Short video (1-2 minutes)
- [ ] Medium video (5-10 minutes)
- [ ] Different subjects (math, science, history)
- [ ] Various video qualities

---

## 🚀 **8. FINAL DEPLOYMENT STEPS**

### 1. Code Preparation
```bash
# Ensure all changes are committed
git add .
git commit -m "Final submission preparation"
git push origin main
```

### 2. Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to your chosen platform
# (Vercel, Netlify, or GitHub Pages)
```

### 3. Backend Deployment
```bash
# Deploy backend to your chosen platform
# (Heroku, Railway, or Render)
```

### 4. Update Configuration
- Update frontend API endpoint to point to deployed backend
- Test the complete pipeline
- Verify all features work in production

---

## 📝 **9. SUBMISSION MATERIALS**

### Required Files
1. **README.md** - Project overview and setup instructions
2. **SETUP.md** - Detailed technical setup guide
3. **PROJECT_STRUCTURE.md** - Code organization documentation
4. **Demo Video** - 2-3 minute demonstration
5. **Screenshots** - Key features and interface

### Optional Enhancements
1. **API Documentation** - If you want to showcase backend capabilities
2. **Architecture Diagram** - Visual representation of system components
3. **User Guide** - Step-by-step usage instructions

---

## ⚡ **10. QUICK DEPLOYMENT COMMANDS**

### One-Command Setup (for judges/demo)
```bash
# Clone and run
git clone https://github.com/[your-username]/lecture-map-flow.git
cd lecture-map-flow
npm install
cd backend && npm install && cd ..
npm start
# Open http://localhost:8080
```

### Production URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.herokuapp.com`
- **GitHub**: `https://github.com/[your-username]/lecture-map-flow`

---

## 🎯 **SUBMISSION CHECKLIST**

### Before Final Submission
- [ ] All code is pushed to GitHub
- [ ] Live demo is deployed and working
- [ ] Demo video is recorded and uploaded
- [ ] Devpost submission is complete
- [ ] All links are tested and working
- [ ] Documentation is comprehensive
- [ ] Project is ready for judging

### Backup Plan
- [ ] Local development environment is working
- [ ] All dependencies are documented
- [ ] Fallback demo with mock data is available
- [ ] Contact information is provided

---

**Good luck with your HackMIT 2025 submission! 🚀**

*Remember: The key to a successful submission is a working demo, clear documentation, and a compelling video that showcases your innovation.*
