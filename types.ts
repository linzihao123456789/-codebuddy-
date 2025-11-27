export type DeviceType = 'CORE' | 'AGG' | 'TOR';

export enum Status {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface NetworkNode {
  id: string;
  type: DeviceType;
  status: Status;
  parentId: string | null;
  // Geometric properties (pre-calculated for performance)
  x: number;
  y: number;
  angle: number; // in radians
  radius: number; // distance from center
  
  // Metadata for the UI
  ip: string;
  traffic: number; // 0-100%
  packetLoss: number; // 0-100%
  groupIndex?: number; // Which sector (0-3)
  childrenIds: string[]; // For quick lookups
  
  // New fields
  rackPosition: string;
  capacity: string;
}

export interface NetworkLink {
  sourceId: string;
  targetId: string;
  status: Status;
}

export interface SimulationState {
  nodes: Map<string, NetworkNode>;
  links: NetworkLink[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  scenario: 'NORMAL' | 'TOR_FAILURE' | 'AGG_FAILURE' | 'CORE_FAILURE' | 'HIGH_LOAD';
  viewMode: 'GLOBAL' | 'FOCUSED';
  focusedNodeId: string | null;
}

export interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  progress: number; // 0 to 1
  color: string;
  size: number;
  delay: number;
}