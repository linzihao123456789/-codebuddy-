// Layout Configuration
// Reduced radii to tighten the display and remove empty black space
export const CORE_RADIUS = 0;
export const AGG_RADIUS = 130; 
export const TOR_RADIUS_START = 260; 
export const TOR_RADIUS_WIDTH = 60; 

export const SECTOR_COUNT = 4;
export const AGG_PER_SECTOR = 4;
export const TOR_PER_AGG = 24; // 16 Aggs * 24 = 384 ToRs total

// Focused View Configuration
export const FOCUSED_TOR_RADIUS = 250;

// Colors
export const COLOR_BG = '#050505';
export const COLOR_CORE_NORMAL = '#3b82f6'; // Blue-500
export const COLOR_CORE_CRITICAL = '#ef4444'; // Red-500

export const COLOR_AGG_NORMAL = '#06b6d4'; // Cyan-500
export const COLOR_AGG_CRITICAL = '#dc2626'; // Red-600

export const COLOR_TOR_NORMAL = '#10b981'; // Emerald-500
export const COLOR_TOR_WARNING = '#f59e0b'; // Amber-500
export const COLOR_TOR_CRITICAL = '#ef4444'; // Red-500

export const SHADOW_CONE_COLOR = 'rgba(239, 68, 68, 0.15)'; // Red faint glow
export const SHADOW_CONE_STROKE = 'rgba(239, 68, 68, 0.4)'; 

// Particle System
// Reduced count for cleaner look
export const PARTICLE_COUNT = 150; 
export const PARTICLE_SPEED_BASE = 0.005;

// Scenarios
export const SCENARIO_DESCRIPTIONS = {
  NORMAL: "Optimal network performance. Traffic flowing smoothly.",
  TOR_FAILURE: "Single Point of Failure. Access switch unreachability detected.",
  AGG_FAILURE: "Aggregation Failure. Downstream impact analysis active.",
  CORE_FAILURE: "CRITICAL: Core switch instability. Network-wide outage risk.",
  HIGH_LOAD: "Traffic Surge. Buffer capacities nearing threshold."
};