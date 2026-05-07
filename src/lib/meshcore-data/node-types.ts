export type MeshCoreNodeTypeCode = 'RC' | 'RD' | 'RE' | 'RM' | 'TS' | 'TM' | 'TR';

export interface MeshCoreNodeType {
  code: MeshCoreNodeTypeCode;
  label: string;
  description: string;
  settings: {
    role: 'repeater' | 'room-server';
    repeat: boolean;
    mobility: 'fixed' | 'mobile';
    priority: 'core' | 'distribution' | 'edge' | 'standard';
  };
}

export const MESHCORE_NODE_TYPES: MeshCoreNodeType[] = [
  {
    code: 'RC',
    label: 'Core Repeater',
    description: 'Backbone. Mountain/tower. Battery backup.',
    settings: {
      role: 'repeater',
      repeat: true,
      mobility: 'fixed',
      priority: 'core',
    },
  },
  {
    code: 'RD',
    label: 'Distribution Repeater',
    description: 'Bridges core to edge. Suburban elevated.',
    settings: {
      role: 'repeater',
      repeat: true,
      mobility: 'fixed',
      priority: 'distribution',
    },
  },
  {
    code: 'RE',
    label: 'Edge Repeater',
    description: 'Rooftop/residential. Mains power OK.',
    settings: {
      role: 'repeater',
      repeat: true,
      mobility: 'fixed',
      priority: 'edge',
    },
  },
  {
    code: 'RM',
    label: 'Mobile Repeater',
    description: 'Vehicle or temporary.',
    settings: {
      role: 'repeater',
      repeat: true,
      mobility: 'mobile',
      priority: 'standard',
    },
  },
  {
    code: 'TS',
    label: 'Room Server',
    description: 'Fixed location.',
    settings: {
      role: 'room-server',
      repeat: false,
      mobility: 'fixed',
      priority: 'standard',
    },
  },
  {
    code: 'TM',
    label: 'Mobile Room',
    description: 'Location changes.',
    settings: {
      role: 'room-server',
      repeat: false,
      mobility: 'mobile',
      priority: 'standard',
    },
  },
  {
    code: 'TR',
    label: 'Room + Repeat',
    description: 'Room server w/ repeat on.',
    settings: {
      role: 'room-server',
      repeat: true,
      mobility: 'fixed',
      priority: 'standard',
    },
  },
];

export function findMeshCoreNodeType(code: string): MeshCoreNodeType | undefined {
  return MESHCORE_NODE_TYPES.find((type) => type.code === code.toUpperCase());
}
