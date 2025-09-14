# EduGraph - Interactive Educational Video Analysis

Jacob and Helena's Submission to HackMIT 2025

## Presentation
https://www.canva.com/design/DAGy9nAR52g/gy8DVNLFr3ti0t7iq7kOsA/view?utm_content=DAGy9nAR52g&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=he3e6076047

## Overview

EduGraph is an interactive educational video analysis platform that automatically extracts concepts from educational videos and visualizes them as an interactive knowledge graph. Students can explore concepts, navigate through video content, and understand the relationships between different educational topics.

## Features

- **Video Upload & Processing**: Upload educational videos and automatically extract concepts
- **Interactive Knowledge Graph**: Visualize concepts and their relationships in a dynamic graph
- **Timeline Navigation**: Navigate through video content using concept markers
- **Synchronized Playback**: Video player synchronized with concept timeline and graph interactions
- **Concept Analysis**: Detailed information about each concept with timestamps
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **UI Components**: Radix UI, Lucide React
- **Graph Visualization**: D3.js
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd edugraph
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add missing build script**
   
   Add this script to your `package.json` file in the scripts section:
   ```json
   "build:dev": "vite build --mode development"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm run build:dev` - Build for development (required for Lovable)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Running Production Build Locally

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components (buttons, inputs, etc.)
│   ├── EduGraph.tsx        # Main application component
│   ├── VideoPlayer.tsx     # Video player with controls
│   ├── VideoUpload.tsx     # File upload interface
│   ├── KnowledgeGraph.tsx  # Interactive concept graph
│   ├── ConceptTimeline.tsx # Timeline navigation
│   ├── ConceptPanel.tsx    # Concept details panel
│   └── Header.tsx          # Application header
├── lib/
│   └── utils.ts           # Utility functions
├── App.tsx                # Root application component
├── main.tsx              # Application entry point
└── index.css            # Global styles and design system
```

## Design System

The application uses a comprehensive design system built with Tailwind CSS:

- **Colors**: Semantic color tokens for consistent theming
- **Typography**: Responsive text sizing and hierarchy
- **Components**: Reusable UI components with variants
- **Dark/Light Mode**: Automatic theme switching support
- **Animations**: Smooth transitions and interactive feedback

## Key Features Explained

### Video Processing
- Automatically detects video duration from uploaded files
- Generates mock transcript and concept extraction (simulated AI processing)
- Creates concept timestamps aligned with actual video length

### Knowledge Graph
- Interactive D3.js-powered visualization
- Nodes represent concepts with different categories (definition, example, application, prerequisite)
- Edges show relationships between concepts
- Click to navigate video to concept timestamps

### Integrated Timeline
- Concept markers embedded in video progress bar
- Navigate to specific video segments by clicking timeline
- Visual indicators for active concepts during playback

### Sidebar Layout
- Collapsible sidebar containing the knowledge graph
- Responsive design adapting to different screen sizes
- Synchronized with video player for seamless interaction

## Development Tips

1. **Hot Reloading**: The development server supports hot reloading for instant feedback
2. **TypeScript**: Full TypeScript support with strict type checking
3. **Component Structure**: Follow the existing patterns for new components
4. **Styling**: Use the design system tokens instead of hardcoded values
5. **Testing**: Upload various video formats to test duration detection

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure you have the `build:dev` script in package.json
2. **Video Not Playing**: Check file format compatibility (MP4 recommended)
3. **Graph Not Rendering**: Verify D3.js is properly installed
4. **Styling Issues**: Clear browser cache and restart dev server

### Performance Tips

- Use smaller video files for faster processing
- Ensure good internet connection for smooth playback
- Close unused browser tabs to free up memory

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is created for HackMIT 2025 submission.

## Contact

Jacob and Helena - HackMIT 2025 Team

---

Built with ❤️ using React, TypeScript, and modern web technologies.
