import React, { useCallback, useState } from 'react';
import { Upload, FileVideo, Loader2, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, isProcessing }) => {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      onUpload(videoFile);
    }
  }, [onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      onUpload(file);
    }
  }, [onUpload]);

  if (isProcessing) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Processing Your Video</CardTitle>
            <CardDescription>
              We're analyzing the content and generating your knowledge graph...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-muted-foreground text-center">
                {progress < 30 && "Extracting audio and transcribing..."}
                {progress >= 30 && progress < 70 && "Analyzing concepts and relationships..."}
                {progress >= 70 && "Building your interactive graph..."}
              </div>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This process typically takes 1-3 minutes depending on video length.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-6">
            <Play className="w-12 h-12" />
            <FileVideo className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Transform Your Educational Videos
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Upload a lecture or educational video to automatically generate an interactive knowledge graph 
            that synchronizes with the video timeline.
          </p>
          <Badge variant="secondary" className="text-sm">
            AI-Powered Analysis
          </Badge>
        </div>

        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 ${
                dragOver ? 'scale-105' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Drag and drop your video here
              </h3>
              <p className="text-muted-foreground mb-6">
                Supports MP4, WebM, MOV, and other common video formats
              </p>
              
              <Button
                size="lg"
                className="relative overflow-hidden"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <FileVideo className="w-5 h-5 mr-2" />
                Choose Video File
              </Button>
              
              <input
                id="file-input"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">1. Upload</h4>
              <p className="text-sm text-muted-foreground">
                Choose your educational video file
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">2. Process</h4>
              <p className="text-sm text-muted-foreground">
                AI analyzes and extracts key concepts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">3. Learn</h4>
              <p className="text-sm text-muted-foreground">
                Interact with your knowledge graph
              </p>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Supported formats:</strong> MP4, WebM, MOV, AVI, MKV. Maximum file size: 500MB.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};