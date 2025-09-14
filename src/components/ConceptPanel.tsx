import React from 'react';
import { X, Clock, Tag, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { GraphNode } from './EduGraph';

interface ConceptPanelProps {
  concept: GraphNode;
  onClose: () => void;
  onTimeJump: (time: number) => void;
}

export const ConceptPanel: React.FC<ConceptPanelProps> = ({
  concept,
  onClose,
  onTimeJump
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'definition': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'example': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'application': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'prerequisite': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'definition': return '📖';
      case 'example': return '💡';
      case 'application': return '🔧';
      case 'prerequisite': return '📚';
      default: return '🔍';
    }
  };

  return (
    <div className="concept-card rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{concept.label}</h3>
            <Badge className={getCategoryColor(concept.category)}>
              {getCategoryIcon(concept.category)} {concept.category}
            </Badge>
          </div>
          
          {concept.isActive && (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Currently Active
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Description
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {concept.description}
        </p>
      </div>

      {/* Timestamps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Referenced at ({concept.timestamps.length} times)
        </h4>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {concept.timestamps.map((timestamp, index) => (
            <button
              key={index}
              onClick={() => onTimeJump(timestamp)}
              className="flex items-center justify-between w-full p-2 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors group"
            >
              <span className="font-mono text-primary">
                {formatTime(timestamp)}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                <span className="text-xs">Jump to</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          size="sm"
          onClick={() => onTimeJump(concept.timestamps[0])}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Go to First Reference
        </Button>
        
        {concept.timestamps.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTimeJump(concept.timestamps[concept.timestamps.length - 1])}
            className="flex-1"
          >
            Go to Last
          </Button>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span>Node size:</span>
          <span className="font-mono">{concept.size}px</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total duration:</span>
          <span className="font-mono">
            {concept.timestamps.length > 1 
              ? `${Math.round((concept.timestamps[concept.timestamps.length - 1] - concept.timestamps[0]) / 60)}min`
              : '< 1min'
            }
          </span>
        </div>
      </div>
    </div>
  );
};