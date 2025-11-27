import React from 'react';
import { NetworkNode, Status } from '../types';
import { AlertTriangle, CheckCircle, Activity, Server, Box, Layers, Database, Wifi } from 'lucide-react';

interface SidebarProps {
  selectedNode: NetworkNode | undefined;
  nodeCount: number;
  scenario: string;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedNode, nodeCount, scenario }) => {
  const getStatusColor = (s: Status) => {
    switch (s) {
      case Status.NORMAL: return 'text-emerald-400';
      case Status.WARNING: return 'text-amber-400';
      case Status.CRITICAL: return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (s: Status) => {
    switch (s) {
      case Status.NORMAL: return <CheckCircle size={18} className="text-emerald-400" />;
      case Status.WARNING: return <AlertTriangle size={18} className="text-amber-400" />;
      case Status.CRITICAL: return <AlertTriangle size={18} className="text-red-500" />;
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-md border-l border-white/10 p-6 flex flex-col shadow-2xl z-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Network Iris
        </h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Topology Visualizer</p>
      </div>

      {/* Global Status Card */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">System Status</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Nodes Active</span>
          <span className="text-sm font-mono font-bold text-white">{nodeCount}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Current State</span>
          <span className={`text-sm font-bold ${scenario.includes('FAILURE') ? 'text-red-400' : 'text-emerald-400'}`}>
             {scenario.replace('_', ' ')}
          </span>
        </div>
        {scenario.includes('FAILURE') && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-200 animate-pulse">
                Active Anomaly Detected. Select red nodes for RCA.
            </div>
        )}
      </div>

      {/* Detail View */}
      <div className="flex-1 overflow-y-auto">
        {selectedNode ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-full bg-white/5 border border-white/10`}>
                 {selectedNode.type === 'CORE' ? <Activity size={24} className="text-blue-400"/> : 
                  selectedNode.type === 'AGG' ? <Layers size={24} className="text-cyan-400"/> : 
                  <Box size={24} className="text-emerald-400"/>}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedNode.id}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedNode.status)}
                  <span className={`text-sm font-medium ${getStatusColor(selectedNode.status)}`}>
                    {selectedNode.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
               {/* Properties Grid */}
               <div className="grid grid-cols-2 gap-3">
                   <div className="bg-black/40 rounded p-3 border border-white/5">
                     <div className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                         <Database size={10}/> IP Address
                     </div>
                     <div className="font-mono text-sm">{selectedNode.ip}</div>
                   </div>
                   <div className="bg-black/40 rounded p-3 border border-white/5">
                     <div className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                         <Server size={10}/> Rack Pos
                     </div>
                     <div className="font-mono text-sm">{selectedNode.rackPosition}</div>
                   </div>
                   <div className="bg-black/40 rounded p-3 border border-white/5 col-span-2">
                     <div className="text-xs text-gray-500 uppercase mb-1 flex items-center gap-1">
                         <Wifi size={10}/> Port Capacity
                     </div>
                     <div className="font-mono text-sm">{selectedNode.capacity}</div>
                   </div>
               </div>

               {/* Metrics */}
               <div className="bg-black/40 rounded p-3 border border-white/5 mt-4">
                 <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500 uppercase">Throughput Load</span>
                    <span className="text-xs text-white">{selectedNode.traffic.toFixed(1)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${selectedNode.traffic > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                        style={{width: `${selectedNode.traffic}%`}}
                    />
                 </div>
               </div>

               <div className="bg-black/40 rounded p-3 border border-white/5">
                 <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500 uppercase">Packet Loss</span>
                    <span className="text-xs text-white">{selectedNode.packetLoss.toFixed(2)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 bg-red-500`} 
                        style={{width: `${Math.min(selectedNode.packetLoss, 100)}%`}}
                    />
                 </div>
               </div>

               {/* AI Insight */}
               {selectedNode.status === Status.CRITICAL && (
                   <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-red-900/40 to-black border border-red-500/30">
                       <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2 text-sm">
                           <Activity size={14}/> Root Cause Analysis
                       </h4>
                       <p className="text-sm text-gray-300 leading-relaxed">
                           {selectedNode.type === 'AGG' 
                             ? "Aggregation switch hardware failure detected. Downstream BGP sessions dropped for 24 access nodes. Rerouting failed due to capacity constraints."
                             : selectedNode.type === 'TOR'
                             ? "Uplink signal loss. Optical transceiver metrics indicate power levels below threshold (-25dBm). Suggest replacing SFP module at " + selectedNode.rackPosition + "."
                             : "Core processing unit overload. Control plane policing active."
                           }
                       </p>
                   </div>
               )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-50">
            <Server size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm">Select a network node to view telemetry and diagnosis.</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/10 text-xs text-gray-600">
        Network Iris v1.1.0
      </div>
    </div>
  );
};

export default Sidebar;