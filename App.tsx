import React, { useState, useEffect, useCallback, useRef } from 'react';
import NetworkIris from './components/NetworkIris';
import Sidebar from './components/Sidebar';
import Controls from './components/Controls';
import { generateNetwork } from './utils/networkGenerator';
import { SimulationState, NetworkNode, Status } from './types';
import { FOCUSED_TOR_RADIUS } from './constants';
import { ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Store the "Base" coordinates (Global View)
  const baseNodesRef = useRef<Map<string, NetworkNode>>(new Map());

  const [simulationState, setSimulationState] = useState<SimulationState>({
    nodes: new Map(),
    links: [],
    selectedNodeId: null,
    hoveredNodeId: null,
    scenario: 'NORMAL',
    viewMode: 'GLOBAL',
    focusedNodeId: null
  });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Data
  useEffect(() => {
    const nodes = generateNetwork(dimensions.width, dimensions.height);
    baseNodesRef.current = new Map(JSON.parse(JSON.stringify(Array.from(nodes.entries())))); // Deep copy backup
    
    // Convert array back to map if JSON parse fails to map directly (it returns array of arrays)
    if (Array.isArray(baseNodesRef.current)) {
         baseNodesRef.current = new Map(baseNodesRef.current as any);
    }
    
    setSimulationState(prev => ({ 
        ...prev, 
        nodes, 
        links: [] 
    }));
  }, [dimensions]);

  // Handle Scenario Logic
  const applyScenario = useCallback((scenario: string) => {
    setSimulationState(prev => {
      // Always operate on a fresh copy of the BASE nodes to ensure we don't drift, 
      // but we must respect current coordinates if in focused mode? 
      // Actually, simplest is to update baseNodes properties and then re-project.
      
      const newBaseNodes = baseNodesRef.current;
      
      // Reset status on base nodes
      newBaseNodes.forEach(node => {
        node.status = Status.NORMAL;
        node.packetLoss = 0;
        node.traffic = 20 + Math.random() * 30;
      });

      // Apply Scenario Logic
      if (scenario === 'TOR_FAILURE') {
         const torIds = Array.from(newBaseNodes.values()).filter((n: NetworkNode) => n.type === 'TOR').map((n: NetworkNode) => n.id);
         const randomTorId = torIds[Math.floor(Math.random() * torIds.length)];
         const node = newBaseNodes.get(randomTorId);
         if (node) {
             node.status = Status.CRITICAL;
             node.packetLoss = 100;
             node.traffic = 0;
         }
      } else if (scenario === 'AGG_FAILURE') {
         const aggNodes = Array.from(newBaseNodes.values()).filter((n: NetworkNode) => n.type === 'AGG');
         const targetAgg = aggNodes[1] || aggNodes[0]; 
         if (targetAgg) {
             targetAgg.status = Status.CRITICAL;
             targetAgg.packetLoss = 85;
             targetAgg.childrenIds.forEach(childId => {
                 const child = newBaseNodes.get(childId);
                 if (child) {
                     child.status = Status.WARNING;
                     child.packetLoss = 40 + Math.random() * 20;
                 }
             });
         }
      } else if (scenario === 'CORE_FAILURE') {
         const core = newBaseNodes.get('CORE-01');
         if (core) {
             core.status = Status.CRITICAL;
             core.packetLoss = 50;
             newBaseNodes.forEach(n => {
                 if (n.type !== 'CORE') n.status = Status.WARNING;
             });
         }
      } else if (scenario === 'HIGH_LOAD') {
          newBaseNodes.forEach(n => {
              n.traffic = 85 + Math.random() * 15;
              if (n.traffic > 95) n.status = Status.WARNING;
          });
      }

      // Now create the display nodes based on current view mode
      const displayNodes = new Map<string, NetworkNode>();
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      newBaseNodes.forEach((baseNode, id) => {
          // Clone to avoid modifying base for display coordinates
          const n = { ...baseNode }; 
          
          if (prev.viewMode === 'FOCUSED' && prev.focusedNodeId) {
             // Focused Layout Logic
             if (n.id === prev.focusedNodeId) {
                 n.x = centerX;
                 n.y = centerY;
                 displayNodes.set(id, n);
             } else if (n.parentId === prev.focusedNodeId) {
                 // It's a child ToR
                 // Need to distribute them in a circle 
                 // We need to find its index among siblings to calculate angle
                 const siblings = newBaseNodes.get(prev.focusedNodeId)?.childrenIds || [];
                 const index = siblings.indexOf(n.id);
                 const angleStep = (Math.PI * 2) / siblings.length;
                 const angle = index * angleStep;
                 n.x = centerX + FOCUSED_TOR_RADIUS * Math.cos(angle);
                 n.y = centerY + FOCUSED_TOR_RADIUS * Math.sin(angle);
                 displayNodes.set(id, n);
             }
             // Else: Don't add to displayNodes (hidden)
          } else {
             // Global Layout: Use base coordinates
             displayNodes.set(id, n);
          }
      });

      return { ...prev, scenario: scenario as any, nodes: displayNodes };
    });
  }, [dimensions]);

  // Switch View Modes
  const enterFocusedMode = (nodeId: string) => {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      
      setSimulationState(prev => {
          const newNodes = new Map<string, NetworkNode>();
          const baseNodes = baseNodesRef.current;
          
          // Target Node -> Center
          const target = baseNodes.get(nodeId);
          if (target) {
              const centerNode = { ...target, x: centerX, y: centerY };
              newNodes.set(nodeId, centerNode);
              
              // Children -> Circle
              if (target.childrenIds) {
                  const count = target.childrenIds.length;
                  target.childrenIds.forEach((childId, idx) => {
                      const childBase = baseNodes.get(childId);
                      if (childBase) {
                          const angle = (idx / count) * Math.PI * 2;
                          const x = centerX + FOCUSED_TOR_RADIUS * Math.cos(angle);
                          const y = centerY + FOCUSED_TOR_RADIUS * Math.sin(angle);
                          newNodes.set(childId, { ...childBase, x, y });
                      }
                  });
              }
          }

          return {
              ...prev,
              viewMode: 'FOCUSED',
              focusedNodeId: nodeId,
              nodes: newNodes,
              selectedNodeId: nodeId // Select the focused node by default
          };
      });
  };

  const exitFocusedMode = () => {
      // Restore all nodes from base
      const nodes = new Map<string, NetworkNode>();
      baseNodesRef.current.forEach((n, id) => {
          nodes.set(id, { ...n }); // Clone
      });

      setSimulationState(prev => ({
          ...prev,
          viewMode: 'GLOBAL',
          focusedNodeId: null,
          nodes,
          selectedNodeId: null
      }));
  };

  const handleNodeClick = (nodeId: string | null) => {
    if (!nodeId) {
        setSimulationState(prev => ({ ...prev, selectedNodeId: null }));
        return;
    }

    const node = simulationState.nodes.get(nodeId);
    
    // If it's an AGG and we are in GLOBAL mode, switch to FOCUSED
    if (simulationState.viewMode === 'GLOBAL' && node?.type === 'AGG') {
        enterFocusedMode(nodeId);
    } else {
        // Otherwise just select it
        setSimulationState(prev => ({ ...prev, selectedNodeId: nodeId }));
    }
  };

  const handleNodeHover = (nodeId: string | null) => {
    setSimulationState(prev => ({ ...prev, hoveredNodeId: nodeId }));
  };
  
  const getSelectedNodeData = () => {
    if (simulationState.selectedNodeId) return simulationState.nodes.get(simulationState.selectedNodeId);
    if (simulationState.hoveredNodeId) return simulationState.nodes.get(simulationState.hoveredNodeId);
    return undefined;
  };

  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden selection:bg-cyan-500/30">
        <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
                backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}
        />
        
        {simulationState.viewMode === 'FOCUSED' && (
            <button 
                onClick={exitFocusedMode}
                className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 text-blue-100 rounded-lg transition-all"
            >
                <ChevronLeft size={18} />
                Back to Global Topology
            </button>
        )}

        <NetworkIris 
          width={dimensions.width}
          height={dimensions.height}
          simulationState={simulationState}
          onNodeHover={handleNodeHover}
          onNodeSelect={handleNodeClick}
        />

        <Sidebar 
            selectedNode={getSelectedNodeData()} 
            nodeCount={simulationState.nodes.size}
            scenario={simulationState.scenario}
        />
        
        <Controls 
            currentScenario={simulationState.scenario} 
            onSetScenario={applyScenario} 
        />
    </div>
  );
};

export default App;