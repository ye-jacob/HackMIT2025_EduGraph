import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphEdge } from './EduGraph';
import { ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  selectedNode: GraphNode | null;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  selectedNode
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  const filteredNodes = React.useMemo(() => {
    if (!searchTerm) return nodes;
    return nodes.filter(node =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodes, searchTerm]);

  const filteredEdges = React.useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    return edges.filter(edge => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [edges, filteredNodes]);

  const initializeGraph = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(filteredNodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(filteredEdges)
        .id(d => d.id)
        .distance(80)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    // Create edges
    const link = container
      .selectAll('.link')
      .data(filteredEdges)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', 'hsl(var(--edge-default))')
      .attr('stroke-width', d => Math.sqrt(d.strength * 3))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    // Create arrowhead marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', 'hsl(var(--edge-default))')
      .attr('opacity', 0.6);

    // Create node groups
    const nodeGroups = container
      .selectAll('.node-group')
      .data(filteredNodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add circles for nodes
    const circles = nodeGroups
      .append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => {
        if (d.isActive) return 'hsl(var(--node-active))';
        if (selectedNode?.id === d.id) return 'hsl(var(--accent))';
        return getCategoryColor(d.category);
      })
      .attr('stroke', d => selectedNode?.id === d.id ? 'hsl(var(--accent))' : 'hsl(var(--border))')
      .attr('stroke-width', d => selectedNode?.id === d.id ? 3 : 1)
      .attr('opacity', d => d.isActive ? 1 : 0.8);

    // Add labels
    const labels = nodeGroups
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 15)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.label);

    // Add click handlers
    nodeGroups.on('click', (event, d) => {
      event.stopPropagation();
      onNodeClick(d);
    });

    // Add hover effects
    nodeGroups
      .on('mouseenter', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.size * 1.2)
          .attr('stroke-width', 2);
          
        // Show tooltip
        const tooltip = d3.select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'hsl(var(--popover))')
          .style('color', 'hsl(var(--popover-foreground))')
          .style('padding', '8px 12px')
          .style('border-radius', '6px')
          .style('border', '1px solid hsl(var(--border))')
          .style('font-size', '12px')
          .style('box-shadow', '0 4px 12px hsl(var(--shadow) / 0.15)')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .html(`
            <strong>${d.label}</strong><br/>
            ${d.description}<br/>
            <em>Category: ${d.category}</em><br/>
            <em>Timestamps: ${d.timestamps.map(t => Math.floor(t/60) + ':' + (t%60).toString().padStart(2, '0')).join(', ')}</em>
          `);

        tooltip.transition()
          .duration(200)
          .style('opacity', 1)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseleave', function(event, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', d.size)
          .attr('stroke-width', selectedNode?.id === d.id ? 3 : 1);
          
        d3.selectAll('.tooltip').remove();
      });

    // Animation loop
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      nodeGroups
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Update active states
    const updateActiveStates = () => {
      circles
        .attr('fill', d => {
          if (d.isActive) return 'hsl(var(--node-active))';
          if (selectedNode?.id === d.id) return 'hsl(var(--accent))';
          return getCategoryColor(d.category);
        })
        .attr('opacity', d => d.isActive ? 1 : 0.8)
        .classed('node-active', d => d.isActive);

      link
        .attr('stroke', d => {
          const sourceActive = (d.source as GraphNode).isActive;
          const targetActive = (d.target as GraphNode).isActive;
          return sourceActive || targetActive ? 'hsl(var(--edge-active))' : 'hsl(var(--edge-default))';
        })
        .attr('stroke-opacity', d => {
          const sourceActive = (d.source as GraphNode).isActive;
          const targetActive = (d.target as GraphNode).isActive;
          return sourceActive || targetActive ? 0.8 : 0.6;
        });
    };

    updateActiveStates();

  }, [filteredNodes, filteredEdges, onNodeClick, selectedNode]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'definition': return 'hsl(var(--concept-primary))';
      case 'example': return 'hsl(var(--concept-secondary))';
      case 'application': return 'hsl(var(--concept-tertiary))';
      case 'prerequisite': return 'hsl(var(--concept-accent))';
      default: return 'hsl(var(--node-default))';
    }
  };

  const handleZoomIn = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.5
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1 / 1.5
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
    
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  }, []);

  useEffect(() => {
    initializeGraph();
  }, [initializeGraph]);

  return (
    <div className="graph-container bg-card rounded-lg border border-border shadow-lg overflow-hidden">
      {/* Graph Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground">Knowledge Graph</h3>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search concepts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <span className="text-xs text-muted-foreground ml-2">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Graph SVG */}
      <div className="relative">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          className="bg-card"
          style={{ minHeight: '400px' }}
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
          <div className="space-y-2">
            <div className="font-semibold text-foreground mb-2">Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--concept-primary))' }}></div>
              <span className="text-muted-foreground">Definition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--concept-secondary))' }}></div>
              <span className="text-muted-foreground">Example</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--concept-tertiary))' }}></div>
              <span className="text-muted-foreground">Application</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--concept-accent))' }}></div>
              <span className="text-muted-foreground">Prerequisite</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Stats */}
      <div className="p-4 border-t border-border bg-muted/30 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>{filteredNodes.length} concepts • {filteredEdges.length} connections</span>
          <span>{nodes.filter(n => n.isActive).length} currently active</span>
        </div>
      </div>
    </div>
  );
};