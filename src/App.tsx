import { useState } from 'react'
import { EduGraph } from './components/EduGraph'
import { Home } from './components/Home'
import { VideoView } from './components/VideoView'
import { Button } from './components/ui/button'
import { Home as HomeIcon, Upload, Network, GraduationCap, ArrowLeft } from 'lucide-react'

interface ProcessedVideo {
  id: string;
  filename: string;
  title: string;
  nodes: any[];
  edges: any[];
  metadata: {
    source_video?: string;
    generated_on?: string;
    type?: string;
    node_count?: number;
    edge_count?: number;
  };
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'video'>('home')
  const [selectedVideo, setSelectedVideo] = useState<ProcessedVideo | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-primary">
                <GraduationCap className="w-8 h-8" />
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">EduGraph</h1>
                <p className="text-sm text-muted-foreground">Interactive Video Learning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentView === 'video' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCurrentView('home')
                    setSelectedVideo(null)
                  }}
                  className="flex items-center gap-2 mr-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              )}
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                onClick={() => {
                  setCurrentView('home')
                  setSelectedVideo(null)
                }}
                className="flex items-center gap-2"
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Button>
              <Button
                variant={currentView === 'upload' ? 'default' : 'ghost'}
                onClick={() => {
                  setCurrentView('upload')
                  setSelectedVideo(null)
                }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload & Process
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'home' && <Home onVideoClick={setSelectedVideo} onNavigateToVideo={() => setCurrentView('video')} />}
      {currentView === 'upload' && <EduGraph />}
      {currentView === 'video' && selectedVideo && <VideoView video={selectedVideo} />}
    </div>
  )
}

export default App