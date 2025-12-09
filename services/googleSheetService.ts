
import { WaterLevelRecord } from '../types';

// ID lấy từ link pubhtml người dùng cung cấp
const SHEET_ID = '2PACX-1vQ892VqyedgkSO8ISOeIUlFSe6PscQgqZuR3iMjWjdv0dbOjmwFinpzL3FLaleWAIVf-wl8CmWJpitd';
const CSV_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv`;

export const fetchLiveWaterData = async (): Promise<{ data: WaterLevelRecord[], error: string | null }> => {
    try {
        // Thêm timestamp và số ngẫu nhiên để chống cache tuyệt đối
        const uniqueQuery = `&t=${Date.now()}&r=${Math.random()}`;
        const response = await fetch(`${CSV_URL}${uniqueQuery}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Lỗi kết nối Google: ${response.status}`);
        }

        const text = await response.text();
        
        // Kiểm tra xem có phải Google trả về trang HTML lỗi không (thường bắt đầu bằng <!DOCTYPE html)
        if (text.trim().toLowerCase().startsWith('<!doctype html')) {
             throw new Error("Dữ liệu chưa sẵn sàng (Google đang xử lý update)");
        }

        const rows = text.split(/\r?\n/);
        const data: WaterLevelRecord[] = [];

        // Bỏ qua dòng tiêu đề (index 0), bắt đầu từ dòng 1
        for (let i = 1; i < rows.length; i++) {
            const rowText = rows[i].trim();
            if (!rowText) continue;

            // Xử lý CSV cơ bản
            const cols = rowText.split(',');

            // Dựa trên ảnh Google Sheet: Col 1: ID, Col 2: Time, Col 3: Level
            if (cols.length < 4) continue;

            const id = cols[1]?.trim();
            const time = cols[2]?.trim();
            const levelRaw = cols[3]?.trim();

            if (!id || !time) continue;

            let level: 0 | 1 | 2 | 3 = 0;
            const levelNum = parseInt(levelRaw, 10);

            if ([0, 1, 2, 3].includes(levelNum)) {
                level = levelNum as 0 | 1 | 2 | 3;
            } else {
                // Fallback text
                const lowerRaw = levelRaw.toLowerCase();
                if (lowerRaw.includes('cao') || lowerRaw.includes('đỏ') || lowerRaw.includes('3')) level = 3;
                else if (lowerRaw.includes('trung') || lowerRaw.includes('vàng') || lowerRaw.includes('2')) level = 2;
                else if (lowerRaw.includes('thấp') || lowerRaw.includes('xanh') || lowerRaw.includes('1')) level = 1;
                else level = 0;
            }

            data.push({ id, time, level });
        }

        if (data.length === 0) {
            return { data: [], error: 'File dữ liệu trống hoặc sai định dạng.' };
        }

        return { data, error: null };

    } catch (error) {
        console.error("Fetch Error:", error);
        return { data: [], error: error instanceof Error ? error.message : 'Lỗi tải dữ liệu' };
    }
};

export const parseManualInput = (text: string): WaterLevelRecord[] => {
    return [];
};
