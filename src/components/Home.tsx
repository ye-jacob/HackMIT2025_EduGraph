import React, { useState, useEffect, useCallback } from 'react';
import { HierarchicalGraph } from './HierarchicalGraph';
import { GraphNode, GraphEdge } from './EduGraph';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Video, Network, Loader2, AlertCircle, Play } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

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

interface VideoData {
  id: string;
  filename: string;
  path: string;
  type: string;
}

interface VideosResponse {
  success: boolean;
  videos: VideoData[];
  processedVideos: ProcessedVideo[];
}

interface HomeProps {
  onVideoClick: (video: ProcessedVideo) => void;
  onNavigateToVideo: () => void;
}

export const Home: React.FC<HomeProps> = ({ onVideoClick, onNavigateToVideo }) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [processedVideos, setProcessedVideos] = useState<ProcessedVideo[]>([]);
  const [combinedNodes, setCombinedNodes] = useState<GraphNode[]>([]);
  const [combinedEdges, setCombinedEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data: VideosResponse = await response.json();
      setVideos(data.videos);
      setProcessedVideos(data.processedVideos);
      
      // Combine all nodes and edges from processed videos
      const allNodes: GraphNode[] = [];
      const allEdges: GraphEdge[] = [];
      const nodeIdMap = new Map<string, string>(); // Map old IDs to new unique IDs
      
      data.processedVideos.forEach((video, videoIndex) => {
        // Add video prefix to node IDs to make them unique
        const videoPrefix = `video_${videoIndex}_`;
        
        video.nodes.forEach(node => {
          const newId = `${videoPrefix}${node.id}`;
          nodeIdMap.set(node.id, newId);
          
          allNodes.push({
            ...node,
            id: newId,
            // Add video source information
            description: `${node.description}\n\nSource: ${video.title}`,
            // Color nodes by video source
            color: getVideoColor(videoIndex),
            // Add video metadata
            timestamps: node.timestamps,
            category: node.category,
            isActive: false
          });
        });
        
        video.edges.forEach(edge => {
          const newSourceId = nodeIdMap.get(edge.source);
          const newTargetId = nodeIdMap.get(edge.target);
          
          if (newSourceId && newTargetId) {
            allEdges.push({
              ...edge,
              source: newSourceId,
              target: newTargetId
            });
          }
        });
      });
      
      setCombinedNodes(allNodes);
      setCombinedEdges(allEdges);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, []);

  const getVideoColor = (videoIndex: number) => {
    const colors = [
      'hsl(0, 70%, 60%)',      // Red
      'hsl(120, 70%, 60%)',    // Green
      'hsl(240, 70%, 60%)',    // Blue
      'hsl(60, 70%, 60%)',     // Yellow
      'hsl(300, 70%, 60%)',    // Magenta
      'hsl(180, 70%, 60%)',    // Cyan
      'hsl(30, 70%, 60%)',     // Orange
      'hsl(270, 70%, 60%)',    // Purple
    ];
    return colors[videoIndex % colors.length];
  };

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Lecture Knowledge Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore interconnected concepts across all your lecture videos
          </p>
        </div>

        {/* Video Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.length}</div>
              <p className="text-xs text-muted-foreground">
                {videos.length === 1 ? 'video' : 'videos'} uploaded
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed Videos</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processedVideos.length}</div>
              <p className="text-xs text-muted-foreground">
                {processedVideos.length === 1 ? 'video' : 'videos'} with knowledge graphs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Concepts</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{combinedNodes.length}</div>
              <p className="text-xs text-muted-foreground">
                {combinedEdges.length} connections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Video List */}
        {processedVideos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedVideos.map((video, index) => (
                <Card 
                  key={video.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary/50"
                  onClick={() => {
                    onVideoClick(video);
                    onNavigateToVideo();
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate">{video.title}</CardTitle>
                      <Badge variant="secondary">
                        {video.metadata.node_count || 0} concepts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Network className="h-4 w-4 mr-2" />
                        {video.metadata.edge_count || 0} connections
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Play className="h-4 w-4 mr-2" />
                        Processed on {new Date(video.metadata.generated_on || '').toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getVideoColor(index) }}
                        />
                        <span className="text-xs text-muted-foreground">
                          Color-coded in combined graph
                        </span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center">
                          Click to view video and knowledge graph
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Hierarchical Knowledge Graph */}
        {combinedNodes.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Course Knowledge Overview
            </h2>
            <div className="h-[600px] border border-border rounded-lg overflow-hidden">
              <HierarchicalGraph
                nodes={combinedNodes}
                edges={combinedEdges}
                onNodeClick={handleNodeClick}
                selectedNode={selectedNode}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Knowledge Graphs Available
            </h3>
            <p className="text-muted-foreground mb-4">
              Upload and process some videos to see the combined knowledge graph.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Upload Videos
            </Button>
          </div>
        )}

        {/* Selected Node Details */}
        {selectedNode && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedNode.color }}
                />
                {selectedNode.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedNode.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Category</h4>
                    <Badge variant="outline">{selectedNode.category}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Timestamps</h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedNode.timestamps.map(t => 
                        Math.floor(t/60) + ':' + (t%60).toString().padStart(2, '0')
                      ).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
