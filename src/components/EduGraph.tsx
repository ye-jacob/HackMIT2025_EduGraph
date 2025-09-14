import React, { useState, useCallback } from 'react';
import { VideoUpload } from './VideoUpload';
import { VideoPlayer } from './VideoPlayer';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ConceptTimeline } from './ConceptTimeline';
import { ConceptPanel } from './ConceptPanel';
import { Header } from './Header';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarInset, 
  SidebarTrigger,
  useSidebar 
} from './ui/sidebar';
import { Button } from './ui/button';
import { Network } from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  timestamps: number[];
  description: string;
  category: 'definition' | 'example' | 'application' | 'prerequisite';
  isActive: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'prerequisite' | 'related' | 'example' | 'application';
  strength: number;
}

export interface VideoData {
  url: string;
  title: string;
  duration: number;
  transcript: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const EduGraph: React.FC = () => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVideoUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    // Simulate video processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock processed video data
    const mockVideoData: VideoData = {
      url: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ""),
      duration: 600, // 10 minutes mock duration
      transcript: [
        { start: 0, end: 30, text: "Welcome to today's lecture on machine learning fundamentals." },
        { start: 30, end: 90, text: "First, let's define what artificial intelligence means in the context of computer science." },
        { start: 90, end: 150, text: "Neural networks are the foundation of modern deep learning algorithms." },
        { start: 150, end: 210, text: "Training data is crucial for developing accurate machine learning models." },
        { start: 210, end: 270, text: "Supervised learning uses labeled examples to train predictive models." },
        { start: 270, end: 330, text: "Unsupervised learning finds patterns in data without explicit labels." },
        { start: 330, end: 390, text: "Deep learning architectures can process complex, high-dimensional data." },
        { start: 390, end: 450, text: "Backpropagation is the algorithm used to train neural networks effectively." },
        { start: 450, end: 510, text: "Overfitting occurs when models memorize training data instead of generalizing." },
        { start: 510, end: 600, text: "Cross-validation helps evaluate model performance on unseen data." }
      ],
      nodes: [
        {
          id: 'ai',
          label: 'Artificial Intelligence',
          x: 300,
          y: 200,
          size: 20,
          color: 'hsl(var(--concept-primary))',
          timestamps: [30, 90],
          description: 'The simulation of human intelligence in machines',
          category: 'definition',
          isActive: false
        },
        {
          id: 'ml',
          label: 'Machine Learning',
          x: 200,
          y: 300,
          size: 18,
          color: 'hsl(var(--concept-secondary))',
          timestamps: [0, 150],
          description: 'A subset of AI that enables computers to learn without explicit programming',
          category: 'definition',
          isActive: false
        },
        {
          id: 'neural',
          label: 'Neural Networks',
          x: 400,
          y: 250,
          size: 16,
          color: 'hsl(var(--concept-tertiary))',
          timestamps: [90, 330, 390],
          description: 'Computing systems inspired by biological neural networks',
          category: 'application',
          isActive: false
        },
        {
          id: 'training',
          label: 'Training Data',
          x: 150,
          y: 400,
          size: 14,
          color: 'hsl(var(--concept-accent))',
          timestamps: [150, 210],
          description: 'Dataset used to teach machine learning algorithms',
          category: 'prerequisite',
          isActive: false
        },
        {
          id: 'supervised',
          label: 'Supervised Learning',
          x: 100,
          y: 200,
          size: 15,
          color: 'hsl(var(--concept-primary))',
          timestamps: [210, 270],
          description: 'Learning with labeled training examples',
          category: 'example',
          isActive: false
        },
        {
          id: 'unsupervised',
          label: 'Unsupervised Learning',
          x: 350,
          y: 400,
          size: 15,
          color: 'hsl(var(--concept-secondary))',
          timestamps: [270, 330],
          description: 'Finding hidden patterns in unlabeled data',
          category: 'example',
          isActive: false
        },
        {
          id: 'deep',
          label: 'Deep Learning',
          x: 500,
          y: 150,
          size: 17,
          color: 'hsl(var(--concept-tertiary))',
          timestamps: [330, 390],
          description: 'Machine learning using deep neural networks',
          category: 'application',
          isActive: false
        },
        {
          id: 'backprop',
          label: 'Backpropagation',
          x: 450,
          y: 350,
          size: 13,
          color: 'hsl(var(--concept-accent))',
          timestamps: [390, 450],
          description: 'Algorithm for training neural networks',
          category: 'application',
          isActive: false
        },
        {
          id: 'overfitting',
          label: 'Overfitting',
          x: 250,
          y: 450,
          size: 12,
          color: 'hsl(var(--concept-primary))',
          timestamps: [450, 510],
          description: 'When a model performs well on training data but poorly on new data',
          category: 'definition',
          isActive: false
        },
        {
          id: 'validation',
          label: 'Cross-validation',
          x: 400,
          y: 100,
          size: 14,
          color: 'hsl(var(--concept-secondary))',
          timestamps: [510, 600],
          description: 'Technique for assessing model generalization',
          category: 'application',
          isActive: false
        }
      ],
      edges: [
        { source: 'ml', target: 'ai', type: 'prerequisite', strength: 0.8 },
        { source: 'neural', target: 'ai', type: 'application', strength: 0.7 },
        { source: 'supervised', target: 'ml', type: 'example', strength: 0.9 },
        { source: 'unsupervised', target: 'ml', type: 'example', strength: 0.9 },
        { source: 'deep', target: 'neural', type: 'application', strength: 0.8 },
        { source: 'training', target: 'supervised', type: 'prerequisite', strength: 0.7 },
        { source: 'backprop', target: 'neural', type: 'application', strength: 0.6 },
        { source: 'overfitting', target: 'ml', type: 'related', strength: 0.5 },
        { source: 'validation', target: 'overfitting', type: 'related', strength: 0.6 }
      ]
    };
    
    setVideoData(mockVideoData);
    setIsProcessing(false);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    if (videoData) {
      // Update active nodes based on current time
      const updatedNodes = videoData.nodes.map(node => ({
        ...node,
        isActive: node.timestamps.some(timestamp => 
          Math.abs(timestamp - time) < 15 // 15 second window
        )
      }));
      
      setVideoData(prev => prev ? { ...prev, nodes: updatedNodes } : null);
    }
  }, [videoData]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    
    // Jump to first timestamp of the concept
    if (node.timestamps.length > 0) {
      setCurrentTime(node.timestamps[0]);
    }
  }, []);

  const handleTimelineClick = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  if (!videoData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <VideoUpload 
          onUpload={handleVideoUpload} 
          isProcessing={isProcessing}
        />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-background flex flex-col w-full">
        <Header />
        
        <div className="flex flex-1">
          <Sidebar side="right" className="border-l">
            <SidebarHeader className="flex flex-row items-center gap-2 p-4 border-b">
              <Network className="h-5 w-5" />
              <h2 className="font-semibold">Knowledge Graph</h2>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <KnowledgeGraph
                nodes={videoData.nodes}
                edges={videoData.edges}
                onNodeClick={handleNodeClick}
                selectedNode={selectedNode}
              />
              
              {selectedNode && (
                <div className="mt-4">
                  <ConceptPanel
                    concept={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    onTimeJump={(time) => setCurrentTime(time)}
                  />
                </div>
              )}
            </SidebarContent>
          </Sidebar>
          
          <SidebarInset>
            <div className="flex flex-col gap-4 p-4 h-full">
              <div className="flex items-center gap-2 pb-2 border-b">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold">Educational Video Player</h1>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                <VideoPlayer
                  videoUrl={videoData.url}
                  title={videoData.title}
                  duration={videoData.duration}
                  currentTime={currentTime}
                  onTimeUpdate={handleTimeUpdate}
                  concepts={videoData.nodes}
                />
                
                <ConceptTimeline
                  duration={videoData.duration}
                  currentTime={currentTime}
                  concepts={videoData.nodes}
                  onClick={handleTimelineClick}
                />
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};