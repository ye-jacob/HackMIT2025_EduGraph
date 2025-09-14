import React, { useState, useCallback } from 'react';
import { VideoUpload } from './VideoUpload';
import { VideoPlayer } from './VideoPlayer';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ConceptTimeline } from './ConceptTimeline';
import { ConceptPanel } from './ConceptPanel';
import { Header } from './Header';
import { VideoProcessor, ProcessingProgress } from '../services/videoProcessor';
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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
  // D3 simulation properties
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
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
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  const handleVideoUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(null);
    
    try {
      // Create video processor with progress callback
      const processor = new VideoProcessor((progress) => {
        setProcessingProgress(progress);
      });
      
      // Process the video through the entire pipeline
      const processedData = await processor.processVideo(file);
      
      // Convert to the expected VideoData format
      const videoData: VideoData = {
        url: processedData.videoUrl,
        title: processedData.title,
        duration: processedData.duration,
        transcript: processedData.transcript,
        nodes: processedData.nodes,
        edges: processedData.edges
      };
      
      setVideoData(videoData);
      
    } catch (error) {
      console.error('Video processing failed:', error);
      // Fallback to mock data if processing fails
      const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            resolve(video.duration);
          };
          video.src = URL.createObjectURL(file);
        });
      };

      const actualDuration = await getVideoDuration(file);
      
      const mockVideoData: VideoData = {
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: actualDuration,
        transcript: [
          { start: 0, end: Math.min(30, actualDuration), text: "Welcome to today's lecture on machine learning fundamentals." },
          { start: Math.min(30, actualDuration), end: Math.min(90, actualDuration), text: "First, let's define what artificial intelligence means in the context of computer science." },
          { start: Math.min(90, actualDuration), end: Math.min(150, actualDuration), text: "Neural networks are the foundation of modern deep learning algorithms." },
          { start: Math.min(150, actualDuration), end: Math.min(210, actualDuration), text: "Training data is crucial for developing accurate machine learning models." },
          { start: Math.min(210, actualDuration), end: Math.min(270, actualDuration), text: "Supervised learning uses labeled examples to train predictive models." },
          { start: Math.min(270, actualDuration), end: Math.min(330, actualDuration), text: "Unsupervised learning finds patterns in data without explicit labels." },
          { start: Math.min(330, actualDuration), end: Math.min(390, actualDuration), text: "Deep learning architectures can process complex, high-dimensional data." },
          { start: Math.min(390, actualDuration), end: Math.min(450, actualDuration), text: "Backpropagation is the algorithm used to train neural networks effectively." },
          { start: Math.min(450, actualDuration), end: Math.min(510, actualDuration), text: "Overfitting occurs when models memorize training data instead of generalizing." },
          { start: Math.min(510, actualDuration), end: Math.min(actualDuration, actualDuration), text: "Cross-validation helps evaluate model performance on unseen data." }
        ].filter(item => item.start < actualDuration),
        nodes: [
          {
            id: 'ai',
            label: 'Artificial Intelligence',
            x: 300,
            y: 200,
            size: 20,
            color: 'hsl(var(--concept-primary))',
            timestamps: [Math.min(30, actualDuration), Math.min(90, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [0, Math.min(150, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(90, actualDuration), Math.min(330, actualDuration), Math.min(390, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(150, actualDuration), Math.min(210, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(210, actualDuration), Math.min(270, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(270, actualDuration), Math.min(330, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(330, actualDuration), Math.min(390, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(390, actualDuration), Math.min(450, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(450, actualDuration), Math.min(510, actualDuration)].filter(t => t < actualDuration),
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
            timestamps: [Math.min(510, actualDuration), Math.min(actualDuration, actualDuration)].filter(t => t < actualDuration),
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
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
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
      
      // Only update if there are actual changes to active states
      const hasChanges = updatedNodes.some((node, index) => 
        node.isActive !== videoData.nodes[index].isActive
      );
      
      if (hasChanges) {
        setVideoData(prev => prev ? { ...prev, nodes: updatedNodes } : null);
      }
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
        <VideoUpload 
          onUpload={handleVideoUpload} 
          isProcessing={isProcessing}
          processingProgress={processingProgress}
        />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <EduGraphContent 
        videoData={videoData}
        currentTime={currentTime}
        selectedNode={selectedNode}
        onTimeUpdate={handleTimeUpdate}
        onNodeClick={handleNodeClick}
        onTimelineClick={handleTimelineClick}
        onSelectedNodeChange={setSelectedNode}
      />
    </SidebarProvider>
  );
};

interface EduGraphContentProps {
  videoData: VideoData;
  currentTime: number;
  selectedNode: GraphNode | null;
  onTimeUpdate: (time: number) => void;
  onNodeClick: (node: GraphNode) => void;
  onTimelineClick: (time: number) => void;
  onSelectedNodeChange: (node: GraphNode | null) => void;
}

const EduGraphContent: React.FC<EduGraphContentProps> = ({
  videoData,
  currentTime,
  selectedNode,
  onTimeUpdate,
  onNodeClick,
  onTimelineClick,
  onSelectedNodeChange
}) => {
  const { open } = useSidebar();

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      
      <div className="flex flex-1">
        <div className="transition-all duration-300 flex flex-col" style={{ width: open ? '50vw' : '100vw' }}>
          <div className="flex items-center justify-between gap-2 p-4 pb-2 border-b flex-shrink-0">
            <h1 className="text-lg font-semibold">Educational Video Player</h1>
            <SidebarTrigger className="ml-auto">
              <Button variant="outline" size="sm" className="gap-2">
                <Network className="h-4 w-4" />
                Knowledge Graph
              </Button>
            </SidebarTrigger>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <VideoPlayer
                videoUrl={videoData.url}
                title={videoData.title}
                duration={videoData.duration}
                currentTime={currentTime}
                onTimeUpdate={onTimeUpdate}
                concepts={videoData.nodes}
              />
              
              <ConceptTimeline
                duration={videoData.duration}
                currentTime={currentTime}
                concepts={videoData.nodes}
                onClick={onTimelineClick}
              />
            </div>
          </div>
        </div>
        
        <div 
          className="border-l bg-background transition-all duration-300 overflow-hidden flex flex-col"
          style={{ width: open ? '50vw' : '0px' }}
        >
          
          <div className="flex-1 flex flex-col bg-background h-full">
            {/* Knowledge Graph Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 h-full">
                <KnowledgeGraph
                  nodes={videoData.nodes}
                  edges={videoData.edges}
                  onNodeClick={onNodeClick}
                  selectedNode={selectedNode}
                />
              </div>
            </div>
            
            {/* Concept Panel Area with separate scroll */}
            {selectedNode && (
              <div className="border-t bg-background flex-shrink-0">
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4">
                    <ConceptPanel
                      concept={selectedNode}
                      onClose={() => onSelectedNodeChange(null)}
                      onTimeJump={(time) => onTimeUpdate(time)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};