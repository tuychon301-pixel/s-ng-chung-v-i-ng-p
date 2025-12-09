
import { WaterLevelRecord } from '../types';

// Dữ liệu tĩnh đã được xóa bỏ theo yêu cầu.
// Ứng dụng sẽ tải dữ liệu trực tiếp từ Google Sheet.
export const waterLevelData: WaterLevelRecord[] = [];

export const waterLevelDataMap = new Map<string, WaterLevelRecord>();
