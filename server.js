// 模拟后端服务器
const http = require('http');
const { setTimeout } = require('timers/promises');

// 模拟网络数据
let networkData = {
    nodes: new Map(),
    metrics: {
        totalTraffic: 0,
        totalPacketLoss: 0,
        alerts: [],
        lastUpdate: new Date().toISOString()
    }
};

// 生成初始网络拓扑
function generateNetwork() {
    const nodes = new Map();
    const centerX = 800; // 默认画布中心
    const centerY = 600;
    const SECTOR_COUNT = 4;
    const AGG_PER_SECTOR = 4;
    const TOR_PER_AGG = 24;
    const AGG_RADIUS = 130;
    const TOR_RADIUS_START = 260;
    const TOR_RADIUS_WIDTH = 60;

    // Core 节点
    const coreNode = {
        id: 'CORE-01',
        type: 'CORE',
        status: 'NORMAL',
        parentId: null,
        x: centerX,
        y: centerY,
        angle: 0,
        radius: 0,
        ip: '10.0.0.1',
        traffic: 45,
        packetLoss: 0,
        childrenIds: [],
        rackPosition: 'MDF-01-R01',
        capacity: '10 Tbps',
        lastHealthCheck: new Date().toISOString(),
        uptime: '99.9%'
    };
    nodes.set(coreNode.id, coreNode);

    // 生成 AGG 和 TOR 节点
    let aggCounter = 0;
    let torCounter = 0;

    for (let s = 0; s < SECTOR_COUNT; s++) {
        const sectorAngleStart = s * (Math.PI * 2 / SECTOR_COUNT);
        const sectorSpan = (Math.PI * 2 / SECTOR_COUNT);
        const padding = 0.15;
        const usableSpan = sectorSpan - (padding * 2);

        for (let a = 0; a < AGG_PER_SECTOR; a++) {
            const aggId = `AGG-${(aggCounter + 1).toString().padStart(2, '0')}`;
            const angleStep = usableSpan / AGG_PER_SECTOR;
            const angle = sectorAngleStart + padding + (angleStep * a) + (angleStep / 2);
            const pos = { x: AGG_RADIUS * Math.cos(angle), y: AGG_RADIUS * Math.sin(angle) };

            const aggNode = {
                id: aggId,
                type: 'AGG',
                status: 'NORMAL',
                parentId: coreNode.id,
                x: centerX + pos.x,
                y: centerY + pos.y,
                angle: angle,
                radius: AGG_RADIUS,
                ip: `10.1.${s + 1}.${a + 1}`,
                traffic: 30 + Math.random() * 20,
                packetLoss: 0,
                childrenIds: [],
                rackPosition: `IDF-0${s+1}-R${Math.floor(a/2)+1}`,
                capacity: '1 Tbps',
                lastHealthCheck: new Date().toISOString(),
                uptime: (99 + Math.random()).toFixed(1) + '%'
            };
            nodes.set(aggId, aggNode);
            coreNode.childrenIds.push(aggId);
            aggCounter++;

            // TOR 节点
            const torAngleSpan = angleStep * 1.2;
            const torStartAngle = angle - (torAngleSpan / 2);
            const rows = 3;
            const torsPerRow = TOR_PER_AGG / rows;

            for (let t = 0; t < TOR_PER_AGG; t++) {
                const torId = `TOR-${(torCounter + 1).toString().padStart(3, '0')}`;
                const row = t % rows;
                const col = Math.floor(t / rows);
                const radius = TOR_RADIUS_START + (row * (TOR_RADIUS_WIDTH / rows));
                const torAngleStep = torAngleSpan / torsPerRow;
                const torAngle = torStartAngle + (col * torAngleStep) + (torAngleStep/2);
                const tPos = { x: radius * Math.cos(torAngle), y: radius * Math.sin(torAngle) };

                const torNode = {
                    id: torId,
                    type: 'TOR',
                    status: 'NORMAL',
                    parentId: aggNode.id,
                    x: centerX + tPos.x,
                    y: centerY + tPos.y,
                    angle: torAngle,
                    radius: radius,
                    ip: `10.2.${aggCounter}.${t + 1}`,
                    traffic: 10 + Math.random() * 15,
                    packetLoss: 0,
                    childrenIds: [],
                    rackPosition: `CAB-${s+1}-${Math.floor(torCounter/10)+1}-U${(t%42)+1}`,
                    capacity: '100 Gbps',
                    lastHealthCheck: new Date().toISOString(),
                    uptime: (98 + Math.random()).toFixed(1) + '%',
                    temperature: Math.round(35 + Math.random() * 20) + '°C',
                    cpuUsage: Math.round(20 + Math.random() * 60) + '%'
                };
                nodes.set(torId, torNode);
                aggNode.childrenIds.push(torId);
                torCounter++;
            }
        }
    }

    return nodes;
}

// 初始化网络数据
networkData.nodes = generateNetwork();
updateMetrics();

// 计算网络指标
function updateMetrics() {
    let totalTraffic = 0;
    let totalPacketLoss = 0;
    let alerts = [];

    networkData.nodes.forEach(node => {
        totalTraffic += node.traffic || 0;
        totalPacketLoss += node.packetLoss || 0;
        
        // 生成告警
        if (node.packetLoss > 10) {
            alerts.push({
                nodeId: node.id,
                type: 'HIGH_PACKET_LOSS',
                severity: node.packetLoss > 50 ? 'CRITICAL' : 'WARNING',
                message: `${node.id} experiencing high packet loss: ${node.packetLoss}%`,
                timestamp: new Date().toISOString()
            });
        }
        
        if (node.traffic > 90) {
            alerts.push({
                nodeId: node.id,
                type: 'HIGH_TRAFFIC',
                severity: 'WARNING',
                message: `${node.id} traffic overload: ${node.traffic}%`,
                timestamp: new Date().toISOString()
            });
        }
    });

    networkData.metrics = {
        totalTraffic: Math.round(totalTraffic / networkData.nodes.size),
        totalPacketLoss: Math.round(totalPacketLoss / networkData.nodes.size),
        alerts: alerts.slice(-10), // 最新10条告警
        lastUpdate: new Date().toISOString(),
        totalNodes: networkData.nodes.size
    };
}

// 模拟实时数据更新
function simulateRealTimeUpdates() {
    setInterval(() => {
        // 随机更新一些节点的指标
        const nodeIds = Array.from(networkData.nodes.keys());
        const numUpdates = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < numUpdates; i++) {
            const randomNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
            const node = networkData.nodes.get(randomNodeId);
            
            if (node) {
                // 随机更新流量
                node.traffic = Math.max(5, Math.min(100, node.traffic + (Math.random() - 0.5) * 10));
                
                // 随机更新丢包率
                if (Math.random() < 0.1) { // 10%概率出现丢包
                    node.packetLoss = Math.min(100, node.packetLoss + Math.random() * 5);
                } else {
                    node.packetLoss = Math.max(0, node.packetLoss - Math.random() * 2);
                }
                
                // 更新最后检查时间
                node.lastHealthCheck = new Date().toISOString();
                
                // 更新TOR节点的额外指标
                if (node.type === 'TOR') {
                    node.temperature = Math.round(35 + Math.random() * 20) + '°C';
                    node.cpuUsage = Math.round(20 + Math.random() * 60) + '%';
                }
            }
        }
        
        updateMetrics();
        console.log('🔄 Network data updated -', new Date().toLocaleTimeString());
    }, 2000); // 每2秒更新一次
}

// 启动实时更新
simulateRealTimeUpdates();

// HTTP 服务器
const server = http.createServer((req, res) => {
    // 启用 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const url = req.url;
    const method = req.method;

    if (method === 'GET') {
        if (url === '/api/network') {
            // 返回完整网络拓扑
            const nodesArray = Array.from(networkData.nodes.entries()).map(([id, node]) => ({
                ...node,
                childrenIds: [...node.childrenIds] // 转换 Set 为 Array
            }));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: {
                    nodes: nodesArray,
                    metrics: networkData.metrics
                }
            }));
            
        } else if (url === '/api/metrics') {
            // 返回网络指标
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: networkData.metrics
            }));
            
        } else if (url === '/api/alerts') {
            // 返回告警信息
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                data: networkData.metrics.alerts
            }));
            
        } else if (url.startsWith('/api/node/')) {
            // 返回单个节点信息
            const nodeId = url.split('/').pop();
            const node = networkData.nodes.get(nodeId);
            
            if (node) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    data: { ...node, childrenIds: [...node.childrenIds] }
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Node not found'
                }));
            }
            
        } else {
            // 健康检查
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Network Iris Backend API',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }));
        }
    } else if (method === 'POST') {
        // 处理故障注入
        if (url === '/api/inject-fault') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const { type, targetNodeId } = JSON.parse(body);
                    
                    if (type === 'TOR_FAILURE') {
                        const torNodes = Array.from(networkData.nodes.values()).filter(n => n.type === 'TOR');
                        const target = targetNodeId ? networkData.nodes.get(targetNodeId) : 
                                       torNodes[Math.floor(Math.random() * torNodes.length)];
                        
                        if (target) {
                            target.status = 'CRITICAL';
                            target.packetLoss = 100;
                            target.traffic = 0;
                        }
                        
                    } else if (type === 'AGG_FAILURE') {
                        const aggNodes = Array.from(networkData.nodes.values()).filter(n => n.type === 'AGG');
                        const target = targetNodeId ? networkData.nodes.get(targetNodeId) : 
                                       aggNodes[1] || aggNodes[0];
                        
                        if (target) {
                            target.status = 'CRITICAL';
                            target.packetLoss = 85;
                            // 影响下游节点
                            networkData.nodes.forEach(node => {
                                if (node.parentId === target.id) {
                                    node.status = 'WARNING';
                                    node.packetLoss = 40 + Math.random() * 20;
                                }
                            });
                        }
                        
                    } else if (type === 'CORE_FAILURE') {
                        const core = networkData.nodes.get('CORE-01');
                        if (core) {
                            core.status = 'CRITICAL';
                            core.packetLoss = 50;
                            networkData.nodes.forEach(node => {
                                if (node.type !== 'CORE') {
                                    node.status = 'WARNING';
                                }
                            });
                        }
                        
                    } else if (type === 'HIGH_LOAD') {
                        networkData.nodes.forEach(node => {
                            node.traffic = 85 + Math.random() * 15;
                            if (node.traffic > 95) {
                                node.status = 'WARNING';
                            }
                        });
                        
                    } else if (type === 'RESET') {
                        // 重置所有状态
                        networkData.nodes = generateNetwork();
                    }
                    
                    updateMetrics();
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: `Fault injection ${type} completed`,
                        timestamp: new Date().toISOString()
                    }));
                    
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Invalid request format'
                    }));
                }
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Endpoint not found'
            }));
        }
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Network Iris Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET  /api/network     - 完整网络拓扑`);
    console.log(`   GET  /api/metrics     - 网络指标`);
    console.log(`   GET  /api/alerts      - 告警信息`);
    console.log(`   GET  /api/node/:id    - 单个节点信息`);
    console.log(`   POST /api/inject-fault - 故障注入`);
    console.log(`\n🔄 Real-time updates enabled (every 2 seconds)`);
    console.log(`🔗 Frontend should connect to http://localhost:${PORT}`);
});