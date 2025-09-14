import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GraphNode, GraphEdge } from './EduGraph';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Network, ZoomIn, ZoomOut, ArrowLeft, RotateCcw } from 'lucide-react';
import * as d3 from 'd3';

interface HierarchicalGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  selectedNode: GraphNode | null;
}

interface ViewMode {
  type: 'overview' | 'detailed';
  selectedNodeId?: string;
}

export const HierarchicalGraph: React.FC<HierarchicalGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  selectedNode
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'overview' });
  const [zoomLevel, setZoomLevel] = useState(1);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Identify 1st order nodes (nodes with no incoming edges or nodes that are prerequisites)
  const firstOrderNodes = useMemo(() => {
    const incomingEdges = new Set<string>();
    edges.forEach(edge => {
      incomingEdges.add(edge.target);
    });

    // Find nodes that are either:
    // 1. Have no incoming edges (root nodes)
    // 2. Are prerequisites (have prerequisite category)
    // 3. Have the largest size (most important concepts)
    return nodes.filter(node => {
      const hasNoIncomingEdges = !incomingEdges.has(node.id);
      const isPrerequisite = node.category === 'prerequisite';
      const isLargeNode = node.size >= 18; // Larger nodes are typically main concepts
      
      return hasNoIncomingEdges || isPrerequisite || isLargeNode;
    }).sort((a, b) => b.size - a.size); // Sort by size, largest first
  }, [nodes, edges]);

  // Get detailed nodes for a selected 1st order node
  const getDetailedNodes = useCallback((selectedNodeId: string) => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (!selectedNode) return { nodes: [], edges: [] };

    // Find all nodes connected to the selected node
    const connectedNodeIds = new Set<string>();
    const connectedEdges: GraphEdge[] = [];

    // Add the selected node itself
    connectedNodeIds.add(selectedNodeId);

    // Find all nodes connected through edges
    edges.forEach(edge => {
      if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
        connectedEdges.push(edge);
      }
    });

    // Find additional connected nodes (2nd degree connections)
    const secondDegreeNodes = new Set<string>();
    connectedNodeIds.forEach(nodeId => {
      edges.forEach(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
          secondDegreeNodes.add(edge.source);
          secondDegreeNodes.add(edge.target);
        }
      });
    });

    // Combine all connected nodes
    const allConnectedIds = new Set([...connectedNodeIds, ...secondDegreeNodes]);
    const detailedNodes = nodes.filter(node => allConnectedIds.has(node.id));

    // Add all edges between these nodes
    const detailedEdges = edges.filter(edge => 
      allConnectedIds.has(edge.source) && allConnectedIds.has(edge.target)
    );

    return { nodes: detailedNodes, edges: detailedEdges };
  }, [nodes, edges]);

  const currentNodes = useMemo(() => {
    if (viewMode.type === 'overview') {
      return firstOrderNodes;
    } else if (viewMode.selectedNodeId) {
      const detailed = getDetailedNodes(viewMode.selectedNodeId);
      return detailed.nodes;
    }
    return [];
  }, [viewMode, firstOrderNodes, getDetailedNodes]);

  const currentEdges = useMemo(() => {
    if (viewMode.type === 'overview') {
      // Only show edges between 1st order nodes
      const firstOrderIds = new Set(firstOrderNodes.map(n => n.id));
      return edges.filter(edge => 
        firstOrderIds.has(edge.source) && firstOrderIds.has(edge.target)
      );
    } else if (viewMode.selectedNodeId) {
      const detailed = getDetailedNodes(viewMode.selectedNodeId);
      return detailed.edges;
    }
    return [];
  }, [viewMode, firstOrderNodes, edges, getDetailedNodes]);

  const selectedFirstOrderNode = viewMode.type === 'detailed' && viewMode.selectedNodeId 
    ? firstOrderNodes.find(n => n.id === viewMode.selectedNodeId)
    : null;

  const initializeGraph = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Get the container dimensions
    const container = svgRef.current.parentElement;
    const containerRect = container?.getBoundingClientRect();
    const width = containerRect?.width || 600;
    const height = containerRect?.height || 400;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        graphContainer.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    const graphContainer = svg.append('g');

    // Create simulation with hierarchical layout
    const simulation = d3.forceSimulation<GraphNode>(currentNodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(currentEdges)
        .id(d => d.id)
        .distance(() => {
          // Different distances for overview vs detailed view
          if (viewMode.type === 'overview') {
            return 120; // Larger spacing for overview
          } else {
            return 80; // Closer spacing for detailed view
          }
        })
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(() => {
        // Different charge based on view mode and node size
        if (viewMode.type === 'overview') {
          return -400; // Stronger repulsion for overview
        } else {
          return -200; // Weaker repulsion for detailed view
        }
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 10));

    // Add hierarchical positioning for overview mode
    if (viewMode.type === 'overview') {
      simulation.force('hierarchy', d3.forceY().y((d: any) => {
        // Position nodes in a circular pattern based on their importance
        const index = firstOrderNodes.findIndex(n => n.id === d.id);
        const angle = (index / firstOrderNodes.length) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.3;
        return height / 2 + Math.sin(angle) * radius;
      }).strength(0.3));
    }

    simulationRef.current = simulation;

    // Create edges
    const link = graphContainer
      .selectAll('.link')
      .data(currentEdges)
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
    const nodeGroups = graphContainer
      .selectAll('.node-group')
      .data(currentNodes)
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
    nodeGroups
      .append('circle')
      .attr('r', d => {
        // Scale node size based on view mode
        if (viewMode.type === 'overview') {
          return Math.max(15, d.size * 1.5); // Larger nodes in overview
        } else {
          return d.size; // Normal size in detailed view
        }
      })
      .attr('fill', d => {
        if (d.isActive) return 'hsl(var(--node-active))';
        if (selectedNode?.id === d.id) return 'hsl(var(--accent))';
        return getCategoryColor(d.category);
      })
      .attr('stroke', d => {
        if (selectedNode?.id === d.id) return 'hsl(var(--accent))';
        if (viewMode.type === 'overview') return 'hsl(var(--border))';
        return 'hsl(var(--border))';
      })
      .attr('stroke-width', d => {
        if (selectedNode?.id === d.id) return 3;
        if (viewMode.type === 'overview') return 2;
        return 1;
      })
      .attr('opacity', d => d.isActive ? 1 : 0.8)
      .classed('selected-node', d => selectedNode?.id === d.id);

    // Add labels
    nodeGroups
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => {
        const radius = viewMode.type === 'overview' ? Math.max(15, d.size * 1.5) : d.size;
        return radius + 15;
      })
      .attr('font-size', () => viewMode.type === 'overview' ? '14px' : '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'hsl(var(--foreground))')
      .text(d => d.label);

    // Add click handlers
    nodeGroups.on('click', (event, d) => {
      event.stopPropagation();
      onNodeClick(d);
      
      // If in overview mode, zoom into detailed view
      if (viewMode.type === 'overview') {
        setViewMode({ type: 'detailed', selectedNodeId: d.id });
      }
      
      // Auto-zoom and center on the clicked node
      focusOnNode(d, svg, zoom, width, height);
    });

    // Add hover effects
    nodeGroups
      .on('mouseenter', function(event, d) {
        const nodeData = d as GraphNode;
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', () => {
            const baseRadius = viewMode.type === 'overview' ? Math.max(15, nodeData.size * 1.5) : nodeData.size;
            return baseRadius * 1.2;
          })
          .attr('stroke-width', 3);
          
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
      .on('mouseleave', function(_, d) {
        const nodeData = d as GraphNode;
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', () => {
            const baseRadius = viewMode.type === 'overview' ? Math.max(15, nodeData.size * 1.5) : nodeData.size;
            return baseRadius;
          })
          .attr('stroke-width', () => {
            if (selectedNode?.id === nodeData.id) return 3;
            if (viewMode.type === 'overview') return 2;
            return 1;
          });
          
        d3.selectAll('.tooltip').remove();
      });

    // Animation loop
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x!)
        .attr('y1', d => (d.source as any).y!)
        .attr('x2', d => (d.target as any).x!)
        .attr('y2', d => (d.target as any).y!);

      nodeGroups
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

  }, [currentNodes, currentEdges, onNodeClick, selectedNode, viewMode, firstOrderNodes]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'definition': return 'hsl(var(--concept-primary))';
      case 'example': return 'hsl(var(--concept-secondary))';
      case 'application': return 'hsl(var(--concept-tertiary))';
      case 'prerequisite': return 'hsl(var(--concept-accent))';
      default: return 'hsl(var(--node-default))';
    }
  };

  const focusOnNode = (node: GraphNode, svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, zoom: d3.ZoomBehavior<SVGSVGElement, unknown>, width: number, height: number) => {
    if (!node.x || !node.y) return;
    
    const currentScale = zoomLevel;
    const targetScale = Math.min(2.0, Math.max(1.2, currentScale * 1.3));
    
    const centerX = node.x;
    const centerY = node.y;
    
    const adjustedCenterY = centerY - (height * 0.1);
    
    svg.transition()
      .duration(750)
      .ease(d3.easeCubicInOut)
      .call(
        zoom.transform as any,
        d3.zoomIdentity
          .translate(width / 2 - centerX * targetScale, height / 2 - adjustedCenterY * targetScale)
          .scale(targetScale)
      );
  };

  const handleBackToOverview = useCallback(() => {
    setViewMode({ type: 'overview' });
  }, []);

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

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        initializeGraph();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeGraph]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with view controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-foreground">
            {viewMode.type === 'overview' ? 'Course Overview' : 'Detailed View'}
          </h3>
          {selectedFirstOrderNode && (
            <Badge variant="secondary" className="ml-2">
              {selectedFirstOrderNode.label}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {viewMode.type === 'detailed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToOverview}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
          )}
          
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

      {/* Graph visualization */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="bg-card"
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

      {/* Footer with stats */}
      <div className="p-4 border-t border-border bg-muted/30 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>
            {viewMode.type === 'overview' 
              ? `${firstOrderNodes.length} main concepts • ${currentEdges.length} connections`
              : `${currentNodes.length} related concepts • ${currentEdges.length} connections`
            }
          </span>
          <span>
            {viewMode.type === 'detailed' && selectedFirstOrderNode && (
              `Exploring: ${selectedFirstOrderNode.label}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
