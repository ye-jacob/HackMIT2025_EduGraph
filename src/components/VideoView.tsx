import React, { useState, useCallback, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ConceptTimeline } from './ConceptTimeline';
import { ConceptPanel } from './ConceptPanel';
import { GraphNode, GraphEdge } from './EduGraph';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Calendar, Network, FileText } from 'lucide-react';

interface ProcessedVideo {
  id: string;
  filename: string;
  title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    source_video?: string;
    generated_on?: string;
    type?: string;
    node_count?: number;
    edge_count?: number;
  };
}

interface VideoViewProps {
  video: ProcessedVideo;
}

export const VideoView: React.FC<VideoViewProps> = ({ video }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Find the corresponding video file
  useEffect(() => {
    const findVideoUrl = async () => {
      try {
        // Extract video ID from the filename
        const videoId = video.filename.split('_')[0] + '_' + video.filename.split('_')[1] + '_' + video.filename.split('_')[2];
        
        // Try to find the video file in uploads
        const response = await fetch('http://localhost:3001/api/videos');
        if (response.ok) {
          const data = await response.json();
          const videoFile = data.videos.find((v: any) => v.id === videoId);
          if (videoFile) {
            setVideoUrl(`http://localhost:3001${videoFile.path}`);
          }
        }
      } catch (error) {
        console.error('Error finding video URL:', error);
      }
    };

    findVideoUrl();
  }, [video]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    // Update active states based on current time
    const updatedNodes = video.nodes.map(node => ({
      ...node,
      isActive: node.timestamps.some(timestamp => 
        Math.abs(timestamp - time) < 5 // 5 second tolerance
      )
    }));
    
    // Update the nodes in the video object (this is a bit of a hack but works for now)
    video.nodes.forEach((node, index) => {
      node.isActive = updatedNodes[index].isActive;
    });
  }, [video]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    
    // If the node has timestamps, seek to the first one
    if (node.timestamps && node.timestamps.length > 0) {
      const firstTimestamp = node.timestamps[0];
      // This would need to be passed to the video player
      // For now, we'll just log it
      console.log('Seeking to timestamp:', firstTimestamp);
    }
  }, []);

  const handleTimelineClick = useCallback((time: number) => {
    setCurrentTime(time);
    // This would need to be passed to the video player
    console.log('Timeline clicked, seeking to:', time);
  }, []);

  // Convert video data to the format expected by VideoPlayer
  const videoData = {
    url: videoUrl,
    title: video.title,
    duration: 0, // We'll need to get this from the video metadata or calculate it
    transcript: [], // We'll need to get this from the structured transcript
    nodes: video.nodes,
    edges: video.edges
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Video Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Processed on {new Date(video.metadata.generated_on || '').toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  {video.metadata.node_count || 0} concepts
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {video.metadata.edge_count || 0} connections
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {video.metadata.node_count || 0} concepts
            </Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Video Player
                </CardTitle>
              </CardHeader>
              <CardContent>
                {videoUrl ? (
                  <VideoPlayer
                    videoData={videoData}
                    onTimeUpdate={handleTimeUpdate}
                    onSeek={handleTimelineClick}
                  />
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading video...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Concept Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Concept Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ConceptTimeline
                  nodes={video.nodes}
                  currentTime={currentTime}
                  onTimeClick={handleTimelineClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Graph and Concept Panel */}
          <div className="space-y-6">
            {/* Knowledge Graph */}
            <Card className="h-[500px]">
              <CardContent className="p-0 h-full">
                <KnowledgeGraph
                  nodes={video.nodes}
                  edges={video.edges}
                  onNodeClick={handleNodeClick}
                  selectedNode={selectedNode}
                />
              </CardContent>
            </Card>

            {/* Concept Panel */}
            {selectedNode && (
              <Card>
                <CardContent className="p-0">
                  <ConceptPanel
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Video Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {video.nodes.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Concepts</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {video.edges.length}
                </div>
                <div className="text-sm text-muted-foreground">Connections</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {video.nodes.filter(n => n.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Concepts</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
