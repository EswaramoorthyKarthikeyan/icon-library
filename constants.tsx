
import { IconData } from './types';

/**
 * Professional Icon Generator Core
 * Ensures consistency across geometric primitives for high-fidelity UI systems.
 */
const generateSystemSet = (category: string, count: number, startId: number = 0): IconData[] => {
  const variations = [
    // Geometric Shells
    'M3 3h18v18H3z', // Square
    'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', // Circle
    'M12 2L2 22h20L12 2z', // Triangle
    'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', // Hex
    // Abstract Metaphors
    'M4 6h16M4 12h16M4 18h16', // Lines
    'M12 2v20M2 12h20', // Cross
    'M5 5l14 14M19 5L5 19', // X
    'M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4m-18 5l9 4 9-4', // Stack
    'M2 12h5l2-9 4 18 3-10 2 3h4', // Pulse
    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', // Search
    'M13 2L3 14h9v8l10-12h-9V2z', // Bolt
    'M4 4h16v16H4V4zm4 4h8v8H8V8z', // Nested Square
    'M12 2v4m0 12v4M4.22 4.22l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.22 19.78l2.83-2.83m8.48-8.48l2.83-2.83', // Neural
    'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', // Currency
    'M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z', // Grid
  ];

  return Array.from({ length: count }).map((_, i) => {
    const globalIndex = startId + i;
    const pathIdx = globalIndex % variations.length;
    return {
      id: `sys-${category.toLowerCase().replace(/\s+/g, '_')}-${globalIndex}`,
      name: `asset_${category.toLowerCase().substring(0, 3)}_${(globalIndex + 1).toString().padStart(4, '0')}`,
      category: category,
      svgPath: variations[pathIdx],
    };
  });
};

export const ICON_LIBRARY: Record<string, IconData[]> = {
  "SaaS_Platform": [
    { 
      id: "saas-workflow", 
      name: "node_flow", 
      category: "SaaS_Platform", 
      svgPath: "M4 12h4m8 0h4M12 8l4 4-4 4m0-8l-4 4 4 4" 
    },
    { 
      id: "saas-branch", 
      name: "conditional_branch", 
      category: "SaaS_Platform", 
      svgPath: "M3 12h6m0 0l4-6h8m-12 6l4 6h8" 
    },
    { 
      id: "saas-loop", 
      name: "iteration_cycle", 
      category: "SaaS_Platform", 
      svgPath: "M12 2a10 10 0 1 1-7 17l1.5-1.5a8 8 0 1 0 1-11.5l-1.5-1.5" 
    },
    { 
      id: "saas-trigger", 
      name: "event_trigger", 
      category: "SaaS_Platform", 
      svgPath: "M13 2L3 14h9v8l10-12h-9V2z" 
    },
    { 
      id: "saas-broadcast", 
      name: "message_broadcast", 
      category: "SaaS_Platform", 
      svgPath: "M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM12 8V4m0 16v-4M8 12H4m16 0h-4m-2-6l3-3m-9 9l-3 3m0-9l3 3m9 9l-3-3" 
    },
    { 
      id: "saas-funnel", 
      name: "conversion_funnel", 
      category: "SaaS_Platform", 
      svgPath: "M3 3h18l-7 9v6l-4 3v-9L3 3z" 
    },
    { 
      id: "saas-neural", 
      name: "inference_node", 
      category: "SaaS_Platform", 
      svgPath: "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM12 2v4m0 12v4M2 12h4m12 0h4M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" 
    },
    { 
      id: "saas-vector", 
      name: "vector_similarity", 
      category: "SaaS_Platform", 
      svgPath: "M2 2l20 20M22 2L2 22M12 3v18M3 12h18" 
    },
    { 
      id: "saas-shield", 
      name: "policy_enforcer", 
      category: "SaaS_Platform", 
      svgPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" 
    },
    { 
      id: "saas-pod", 
      name: "compute_cluster", 
      category: "SaaS_Platform", 
      svgPath: "M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M3 7l9 5 9-5M12 12l9 5M12 12L3 17" 
    }
  ],
  "Enterprise_Core": [
    { id: "ent-neural", name: "neural_node", category: "Enterprise_Core", svgPath: "M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM12 2v4m0 12v4M2 12h4m12 0h4" },
    { id: "ent-batch", name: "batch_process", category: "Enterprise_Core", svgPath: "M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z" },
    { id: "ent-sync", name: "async_sync", category: "Enterprise_Core", svgPath: "M12 8V4m0 0L9 7m3-3l3 3m-3 9v4m0 0l-3-3m3 3l3-3" },
    { id: "ent-vault", name: "secure_vault", category: "Enterprise_Core", svgPath: "M12 2L3 7v9c0 5 9 6 9 6s9-1 9-6V7l-9-5zm0 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
    { id: "ent-stream", name: "data_stream", category: "Enterprise_Core", svgPath: "M2 12h20M2 12l3-3m-3 3l3 3m14-3l3-3m-3 3l3 3" },
    { id: "ent-cloud", name: "cloud_infra", category: "Enterprise_Core", svgPath: "M17.5 19c-3 0-5.5-2.5-5.5-5.5 0-2.5 1.5-4.5 4-5.5 0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5c2.5 1 4 3 4 5.5 0 3-2.5 5.5-5.5 5.5H17.5z" },
    { id: "ent-logic", name: "logic_flow", category: "Enterprise_Core", svgPath: "M3 12h6m6 0h6M9 8h6v8H9V8zm3-6v6m0 8v6" },
    { id: "ent-cluster", name: "node_cluster", category: "Enterprise_Core", svgPath: "M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" },
    { id: "ent-api", name: "api_endpoint", category: "Enterprise_Core", svgPath: "M7 8l-4 4 4 4m10-8l4 4-4 4M13 4l-2 16" },
    { id: "ent-db", name: "structured_db", category: "Enterprise_Core", svgPath: "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M21 5c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" },
    ...generateSystemSet('Enterprise_Core', 100, 10)
  ],
  "AI_Automation": generateSystemSet('AI_Automation', 150),
  "SaaS_Analytics": generateSystemSet('SaaS_Analytics', 150),
  "Collaboration": generateSystemSet('Collaboration', 120),
  "Infrastructure": generateSystemSet('Infrastructure', 100),
  "Security_Auth": generateSystemSet('Security_Auth', 80),
  "Design_Tokens": generateSystemSet('Design_Tokens', 100),
  "Marketing_Ops": generateSystemSet('Marketing_Ops', 90),
  "Finance_Billing": generateSystemSet('Finance_Billing', 110),
  "Project_Mgmt": generateSystemSet('Project_Mgmt', 130),
  "Developer_Exp": generateSystemSet('Developer_Exp', 140),
  "Health_Bio": generateSystemSet('Health_Bio', 70),
  "Global_Logistics": generateSystemSet('Global_Logistics', 60),
  "Media_Creative": generateSystemSet('Media_Creative', 85),
  "Interface_Utils": generateSystemSet('Interface_Utils', 150),
};
