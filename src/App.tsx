import { useState } from 'react'
import { EduGraph } from './components/EduGraph'
import { Home } from './components/Home'
import { Button } from './components/ui/button'
import { Home as HomeIcon, Upload, Network, GraduationCap } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'upload'>('home')

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
              <Button
                variant={currentView === 'home' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2"
              >
                <HomeIcon className="h-4 w-4" />
                Home
              </Button>
              <Button
                variant={currentView === 'upload' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('upload')}
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
      {currentView === 'home' ? <Home /> : <EduGraph />}
    </div>
  )
}

export default App