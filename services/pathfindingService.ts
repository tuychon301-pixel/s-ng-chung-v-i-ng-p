
import { WaterLevelRecord } from '../types';
import { roadLengths } from '../data/roadLengths';
import { Junction } from '../data/junctions';

// Kiểu dữ liệu cho hàng đợi ưu tiên
interface PriorityNode {
  id: string;
  f: number; // f = g + h (Total estimated cost)
}

// Cấu trúc đồ thị danh sách kề
interface AdjacencyList {
  [junctionId: string]: Array<{
    to: string;
    roadId: string;
    length: number;
  }>;
}

/**
 * Xây dựng đồ thị danh sách kề từ dữ liệu Junctions và RoadLengths
 * Đồ thị này map: Giao lộ -> [Giao lộ hàng xóm, qua đường nào, độ dài bao nhiêu]
 */
const buildAdjacencyList = (junctions: Record<string, Junction>): AdjacencyList => {
  const adjList: AdjacencyList = {};
  
  // Map tạm: RoadID -> [JunctionID1, JunctionID2, ...]
  const roadToJunctions: Record<string, string[]> = {};

  Object.entries(junctions).forEach(([jId, data]) => {
    adjList[jId] = []; // Init
    data.roads.forEach(roadId => {
      if (!roadToJunctions[roadId]) roadToJunctions[roadId] = [];
      roadToJunctions[roadId].push(jId);
    });
  });

  // Xây dựng kết nối
  Object.entries(roadToJunctions).forEach(([roadId, jIds]) => {
    // Một con đường thường nối 2 giao lộ. Nếu dữ liệu có > 2 giao lộ cùng tên đường,
    // ta nối tất cả chúng với nhau (clique) vì chúng thông nhau.
    const length = roadLengths.get(roadId) || 10;
    
    for (let i = 0; i < jIds.length; i++) {
      for (let j = i + 1; j < jIds.length; j++) {
        const u = jIds[i];
        const v = jIds[j];
        
        adjList[u].push({ to: v, roadId, length });
        adjList[v].push({ to: u, roadId, length });
      }
    }
  });

  return adjList;
};

/**
 * Tính khoảng cách Euclid giữa 2 giao lộ (Heuristic cho A*)
 */
const heuristic = (idA: string, idB: string, junctions: Record<string, Junction>): number => {
  const a = junctions[idA];
  const b = junctions[idB];
  if (!a || !b) return 0;
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

/**
 * Thuật toán A* tìm đường đi ngắn nhất giữa 2 giao lộ
 */
export const findShortestPath = (
  _graphIgnored: any, // Bỏ qua tham số graph cũ, ta tự build graph chính xác hơn
  startJunctionId: string,
  endJunctionId: string,
  waterLevelData: Map<string, WaterLevelRecord>,
  junctions: Record<string, Junction>,
  routingMode: 'optimal' | 'safe'
): string[] | null => {
  
  // 1. Build Graph Dynamic (đảm bảo tính mới nhất của logic)
  const graph = buildAdjacencyList(junctions);

  // 2. Setup A*
  const openSet: PriorityNode[] = [{ id: startJunctionId, f: 0 }];
  const cameFrom: Record<string, { from: string, via: string }> = {}; // Để truy vết đường đi
  
  const gScore: Record<string, number> = {}; // Chi phí thực từ Start đến Node hiện tại
  
  // Init gScore
  Object.keys(junctions).forEach(k => gScore[k] = Infinity);
  gScore[startJunctionId] = 0;

  // Set để check đã thăm
  const visited = new Set<string>();

  while (openSet.length > 0) {
    // Lấy node có f thấp nhất
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    if (current.id === endJunctionId) {
      // Đã đến đích -> Truy vết lại đường đi (Reconstruct Path)
      const pathRoads: string[] = [];
      let currId = endJunctionId;
      
      while (cameFrom[currId]) {
        const step = cameFrom[currId];
        pathRoads.unshift(step.via); // Thêm đường vào đầu danh sách
        currId = step.from;
      }
      return pathRoads;
    }

    visited.add(current.id);

    const neighbors = graph[current.id] || [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;

      // --- TÍNH TOÁN TRỌNG SỐ (COST) ---
      const level = waterLevelData.get(neighbor.roadId)?.level ?? 0;
      let weight = neighbor.length;

      // Rule 1: CẤM TUYỆT ĐỐI đường ngập mức 3 (Đỏ)
      if (level === 3) continue; 

      if (routingMode === 'safe') {
        // Rule 2: Chế độ An Toàn
        if (level === 2) {
            // Mức 2 (Vàng): Phạt nặng (x10 độ dài). 
            // Chỉ đi nếu đường vòng xa gấp 10 lần đường này.
            weight *= 10; 
        } else if (level === 1) {
            // Mức 1 (Xanh): Phạt nhẹ (x1.5). 
            // Ưu tiên đường khô ráo hoàn toàn hơn.
            weight *= 1.5; 
        }
        // Mức 0: Giữ nguyên weight (ưu tiên nhất)
      } 
      // Rule 3: Chế độ Tối ưu -> Chỉ quan tâm độ dài vật lý (weight giữ nguyên), trừ khi mức 3.

      const tentativeG = gScore[current.id] + weight;

      if (tentativeG < gScore[neighbor.to]) {
        // Tìm thấy đường tốt hơn đến neighbor
        cameFrom[neighbor.to] = { from: current.id, via: neighbor.roadId };
        gScore[neighbor.to] = tentativeG;
        
        const h = heuristic(neighbor.to, endJunctionId, junctions);
        const f = tentativeG + h;

        // Thêm hoặc update trong openSet
        const existingIdx = openSet.findIndex(n => n.id === neighbor.to);
        if (existingIdx !== -1) {
            openSet[existingIdx].f = f;
        } else {
            openSet.push({ id: neighbor.to, f });
        }
      }
    }
  }

  // Không tìm thấy đường
  return null;
};
