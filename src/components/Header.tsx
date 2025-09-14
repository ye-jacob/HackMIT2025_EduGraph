import React from 'react';
import { GraduationCap, Network } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-card border-b border-border shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="w-8 h-8" />
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">EduGraph</h1>
              <p className="text-sm text-muted-foreground">Interactive Video Learning</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <span>Transform videos into knowledge graphs</span>
          </div>
        </div>
      </div>
    </header>
  );
};