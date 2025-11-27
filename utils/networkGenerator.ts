import { NetworkNode, Status, DeviceType } from '../types';
import { 
  AGG_RADIUS, 
  TOR_RADIUS_START, 
  TOR_RADIUS_WIDTH, 
  SECTOR_COUNT, 
  AGG_PER_SECTOR, 
  TOR_PER_AGG 
} from '../constants';

// Helper to polar to cartesian
const toCartesian = (r: number, theta: number) => ({
  x: r * Math.cos(theta),
  y: r * Math.sin(theta),
});

const generateRackPosition = (type: DeviceType, group: number, index: number) => {
  if (type === 'CORE') return 'MDF-01-R01';
  if (type === 'AGG') return `IDF-0${group+1}-R${Math.floor(index/2)+1}`;
  return `CAB-${group+1}-${Math.floor(index/10)+1}-U${(index%42)+1}`;
};

export const generateNetwork = (width: number, height: number): Map<string, NetworkNode> => {
  const nodes = new Map<string, NetworkNode>();
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Create Core
  const coreNode: NetworkNode = {
    id: 'CORE-01',
    type: 'CORE',
    status: Status.NORMAL,
    parentId: null,
    x: centerX,
    y: centerY,
    angle: 0,
    radius: 0,
    ip: '10.0.0.1',
    traffic: 45,
    packetLoss: 0,
    childrenIds: [],
    groupIndex: -1,
    rackPosition: generateRackPosition('CORE', 0, 0),
    capacity: '10 Tbps'
  };
  nodes.set(coreNode.id, coreNode);

  // 2. Create Aggregation Layer (4 Sectors)
  let aggCounter = 0;
  let torCounter = 0;

  for (let s = 0; s < SECTOR_COUNT; s++) {
    const sectorAngleStart = s * (Math.PI * 2 / SECTOR_COUNT);
    const sectorSpan = (Math.PI * 2 / SECTOR_COUNT);
    const padding = 0.15; // Increased padding slightly
    const usableSpan = sectorSpan - (padding * 2);

    for (let a = 0; a < AGG_PER_SECTOR; a++) {
      const aggId = `AGG-${(aggCounter + 1).toString().padStart(2, '0')}`;
      
      const angleStep = usableSpan / AGG_PER_SECTOR;
      const angle = sectorAngleStart + padding + (angleStep * a) + (angleStep / 2);

      const pos = toCartesian(AGG_RADIUS, angle);

      const aggNode: NetworkNode = {
        id: aggId,
        type: 'AGG',
        status: Status.NORMAL,
        parentId: coreNode.id,
        x: centerX + pos.x,
        y: centerY + pos.y,
        angle: angle,
        radius: AGG_RADIUS,
        ip: `10.1.${s + 1}.${a + 1}`,
        traffic: 30 + Math.random() * 20,
        packetLoss: 0,
        childrenIds: [],
        groupIndex: s,
        rackPosition: generateRackPosition('AGG', s, a),
        capacity: '1 Tbps'
      };
      nodes.set(aggId, aggNode);
      coreNode.childrenIds.push(aggId);
      aggCounter++;

      // 3. Create ToR Layer
      const torAngleSpan = angleStep * 1.2; // Slightly wider spread for better visuals
      const torStartAngle = angle - (torAngleSpan / 2);
      
      const rows = 3;
      const torsPerRow = TOR_PER_AGG / rows;
      
      for (let t = 0; t < TOR_PER_AGG; t++) {
        const torId = `TOR-${(torCounter + 1).toString().padStart(3, '0')}`;
        const row = t % rows;
        const col = Math.floor(t / rows);
        
        // Distribute radially
        const radius = TOR_RADIUS_START + (row * (TOR_RADIUS_WIDTH / rows));
        
        // Distribute angularly
        const torAngleStep = torAngleSpan / torsPerRow;
        const torAngle = torStartAngle + (col * torAngleStep) + (torAngleStep/2);

        const tPos = toCartesian(radius, torAngle);

        const torNode: NetworkNode = {
          id: torId,
          type: 'TOR',
          status: Status.NORMAL,
          parentId: aggNode.id,
          x: centerX + tPos.x,
          y: centerY + tPos.y,
          angle: torAngle,
          radius: radius,
          ip: `10.2.${aggCounter}.${t + 1}`,
          traffic: 10 + Math.random() * 15,
          packetLoss: 0,
          childrenIds: [],
          groupIndex: s,
          rackPosition: generateRackPosition('TOR', s, torCounter),
          capacity: '100 Gbps'
        };
        nodes.set(torId, torNode);
        aggNode.childrenIds.push(torId);
        torCounter++;
      }
    }
  }

  return nodes;
};