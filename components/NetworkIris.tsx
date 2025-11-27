import React, { useRef, useEffect, useState } from 'react';
import { NetworkNode, Status, Particle, SimulationState } from '../types';
import { 
  COLOR_BG, 
  COLOR_CORE_NORMAL, 
  COLOR_CORE_CRITICAL,
  COLOR_AGG_NORMAL, 
  COLOR_AGG_CRITICAL,
  COLOR_TOR_NORMAL,
  COLOR_TOR_WARNING,
  COLOR_TOR_CRITICAL,
  SHADOW_CONE_COLOR,
  SHADOW_CONE_STROKE,
  PARTICLE_COUNT,
  PARTICLE_SPEED_BASE
} from '../constants';

interface NetworkIrisProps {
  simulationState: SimulationState;
  width: number;
  height: number;
  onNodeHover: (nodeId: string | null) => void;
  onNodeSelect: (nodeId: string | null) => void;
}

const NetworkIris: React.FC<NetworkIrisProps> = ({ 
  simulationState, 
  width, 
  height,
  onNodeHover,
  onNodeSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  // Initialize Particles
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: width / 2,
        y: height / 2,
        targetX: 0,
        targetY: 0,
        speed: PARTICLE_SPEED_BASE + Math.random() * 0.005,
        progress: Math.random(),
        color: '#ffffff',
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 100
      });
    }
    particlesRef.current = particles;
  }, [width, height]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const render = () => {
      // 1. Clear Background
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, width, height);

      const { nodes, hoveredNodeId, selectedNodeId, scenario, viewMode, focusedNodeId } = simulationState;
      
      // Determine visible nodes
      // In GLOBAL mode: All nodes.
      // In FOCUSED mode: Only Focused Agg + Children.
      const visibleNodes = new Map<string, NetworkNode>();
      
      if (viewMode === 'FOCUSED' && focusedNodeId) {
          const centerNode = nodes.get(focusedNodeId);
          if (centerNode) {
              visibleNodes.set(centerNode.id, centerNode);
              centerNode.childrenIds.forEach(id => {
                  const child = nodes.get(id);
                  if (child) visibleNodes.set(id, child);
              });
          }
      } else {
          nodes.forEach((n, id) => visibleNodes.set(id, n));
      }

      const visibleNodeArray = Array.from(visibleNodes.values());
      const coreNode = nodes.get('CORE-01');

      // ------------------------------------------------
      // LAYER 1: Shadow Cones (Global Mode Only)
      // ------------------------------------------------
      if (viewMode === 'GLOBAL' && coreNode) {
          visibleNodes.forEach(node => {
            if (node.type === 'AGG' && node.status === Status.CRITICAL) {
               const children = node.childrenIds.map(id => nodes.get(id)).filter(Boolean) as NetworkNode[];
               if (children.length > 0) {
                 const angles = children.map(c => c.angle);
                 const minAngle = Math.min(...angles);
                 const maxAngle = Math.max(...angles);
                 const outerRadius = Math.max(...children.map(c => c.radius)) + 20;
                 
                 ctx.beginPath();
                 ctx.moveTo(node.x, node.y); 
                 ctx.arc(coreNode.x, coreNode.y, outerRadius, minAngle - 0.05, maxAngle + 0.05);
                 ctx.fillStyle = SHADOW_CONE_COLOR;
                 ctx.fill();
                 ctx.strokeStyle = SHADOW_CONE_STROKE;
                 ctx.lineWidth = 1;
                 ctx.stroke();
               }
            }
          });
      }

      // ------------------------------------------------
      // LAYER 2: Links
      // ------------------------------------------------
      ctx.lineWidth = 1;
      visibleNodes.forEach(node => {
        if (!node.parentId) return;
        const parent = visibleNodes.get(node.parentId);
        
        // In Focused view, parent might not be in visibleNodes (e.g. Core is parent of Agg)
        // If parent is not visible, don't draw link
        if (!parent) return;

        let shouldDraw = false;
        let strokeColor = 'rgba(255,255,255,0.03)';

        const isRelated = hoveredNodeId === node.id || hoveredNodeId === parent.id || selectedNodeId === node.id;
        const isCriticalPath = node.status === Status.CRITICAL || parent.status === Status.CRITICAL;

        // Simplify link logic for performance and aesthetics
        if (viewMode === 'FOCUSED') {
            shouldDraw = true; // Always draw links in focused mode
            strokeColor = 'rgba(255,255,255,0.1)';
        } else if (isCriticalPath) {
          shouldDraw = true;
          strokeColor = 'rgba(239, 68, 68, 0.4)'; 
          ctx.lineWidth = 2;
        } else if (isRelated) {
          shouldDraw = true;
          strokeColor = 'rgba(6, 182, 212, 0.3)';
          ctx.lineWidth = 1;
        }

        if (shouldDraw) {
          ctx.strokeStyle = strokeColor;
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }
      });

      // ------------------------------------------------
      // LAYER 3: Particles
      // ------------------------------------------------
      if (scenario !== 'CORE_FAILURE') {
        particlesRef.current.forEach(p => {
            if (p.progress >= 1) {
                p.progress = 0;
                // Simplified flow logic based on visible nodes
                if (viewMode === 'GLOBAL') {
                   // Global: Center -> Random ToR
                   const tors = visibleNodeArray.filter((n: NetworkNode) => n.type === 'TOR');
                   const randomToR = tors[Math.floor(Math.random() * tors.length)];
                   if (randomToR) {
                        p.targetX = randomToR.x;
                        p.targetY = randomToR.y;
                        p.x = width/2;
                        p.y = height/2;
                   }
                } else {
                    // Focused: Center (Agg) -> Children (ToR)
                    const children = visibleNodeArray.filter((n: NetworkNode) => n.parentId === focusedNodeId);
                    const randomChild = children[Math.floor(Math.random() * children.length)];
                    if (randomChild) {
                        p.targetX = randomChild.x;
                        p.targetY = randomChild.y;
                        p.x = width/2;
                        p.y = height/2;
                    }
                }
            }

            p.progress += p.speed;
            const currentX = p.x + (p.targetX - p.x) * p.progress;
            const currentY = p.y + (p.targetY - p.y) * p.progress;

            ctx.fillStyle = p.color;
            if (scenario === 'HIGH_LOAD') ctx.fillStyle = '#f59e0b';
            
            // Reduced opacity for less clutter
            ctx.globalAlpha = (1 - p.progress) * 0.4; 
            ctx.beginPath();
            ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
      }

      // ------------------------------------------------
      // LAYER 4: Nodes
      // ------------------------------------------------
      visibleNodes.forEach(node => {
        let color = '#fff';
        let radius = 2;
        let glow = false;
        let showLabel = false;

        if (node.type === 'CORE') {
          radius = viewMode === 'GLOBAL' ? 12 : 0; // Hide core in focused mode if filtered, but if present logic handles it
          color = node.status === Status.CRITICAL ? COLOR_CORE_CRITICAL : COLOR_CORE_NORMAL;
          glow = true;
        } else if (node.type === 'AGG') {
          radius = viewMode === 'FOCUSED' ? 15 : 5; // Bigger in focus mode
          color = node.status === Status.CRITICAL ? COLOR_AGG_CRITICAL : COLOR_AGG_NORMAL;
          glow = node.status === Status.CRITICAL || viewMode === 'FOCUSED';
          showLabel = viewMode === 'GLOBAL'; // Show label in global
        } else if (node.type === 'TOR') {
          radius = 2; 
          if (node.status === Status.CRITICAL) color = COLOR_TOR_CRITICAL;
          else if (node.status === Status.WARNING) color = COLOR_TOR_WARNING;
          else color = COLOR_TOR_NORMAL;
          
          if (node.status === Status.CRITICAL) {
             radius = 4;
             glow = true;
          }
          if (viewMode === 'FOCUSED') showLabel = true; // Show ToR labels in focused view
        }

        // Selected State
        if (selectedNodeId === node.id || hoveredNodeId === node.id) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
            ctx.stroke();
            showLabel = true;
        }

        // Draw Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        if (glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Labels
        if (showLabel) {
            ctx.fillStyle = '#e5e5e5';
            ctx.font = '10px Inter';
            // Adjust label position based on location
            const labelX = node.x + radius + 4;
            const labelY = node.y + 3;
            ctx.fillText(node.id, labelX, labelY);
        }
      });

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simulationState, width, height]);

  // Interaction Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let closestDist = Infinity;
    let closestId: string | null = null;
    const threshold = 20; // Slightly larger threshold

    const { nodes, viewMode, focusedNodeId } = simulationState;
    const visibleNodes = new Map<string, NetworkNode>();
    if (viewMode === 'FOCUSED' && focusedNodeId) {
        const center = nodes.get(focusedNodeId);
        if(center) visibleNodes.set(center.id, center);
        nodes.forEach(n => {
            if (n.parentId === focusedNodeId) visibleNodes.set(n.id, n);
        });
    } else {
        nodes.forEach((n, id) => visibleNodes.set(id, n));
    }

    visibleNodes.forEach(node => {
      const dx = node.x - mx;
      const dy = node.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < threshold && dist < closestDist) {
        closestDist = dist;
        closestId = node.id;
      }
    });
    
    onNodeHover(closestId);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (simulationState.hoveredNodeId) {
      onNodeSelect(simulationState.hoveredNodeId);
    } else {
      onNodeSelect(null);
    }
  };

  return (
    <canvas 
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => onNodeHover(null)}
      className="cursor-crosshair"
    />
  );
};

export default NetworkIris;