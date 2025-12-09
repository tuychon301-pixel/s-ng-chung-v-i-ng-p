
import { junctions } from './junctions';

// Thay vì định nghĩa thủ công dễ sai sót, ta sẽ tự động sinh ra đồ thị kết nối
// dựa trên dữ liệu các giao lộ (Junctions).
// Logic: Nếu 2 con đường cùng kết nối vào một giao lộ (Junction), thì chúng thông nhau.

const graph = new Map<string, string[]>();

// Hàm tiện ích để thêm kết nối 2 chiều
const addConnection = (roadA: string, roadB: string) => {
    if (!graph.has(roadA)) graph.set(roadA, []);
    if (!graph.has(roadB)) graph.set(roadB, []);

    const neighborsA = graph.get(roadA)!;
    const neighborsB = graph.get(roadB)!;

    if (!neighborsA.includes(roadB)) neighborsA.push(roadB);
    if (!neighborsB.includes(roadA)) neighborsB.push(roadA);
};

// Duyệt qua tất cả các giao lộ để xây dựng kết nối
Object.values(junctions).forEach(junction => {
    const roadsInJunction = junction.roads;
    
    // Kết nối tất cả các đường trong cùng một giao lộ với nhau
    // Ví dụ: Ngã tư có đường A, B, C, D. A sẽ nối với B, C, D; B nối với A, C, D...
    for (let i = 0; i < roadsInJunction.length; i++) {
        for (let j = i + 1; j < roadsInJunction.length; j++) {
            addConnection(roadsInJunction[i], roadsInJunction[j]);
        }
    }
});

export const mapGraph = graph;
