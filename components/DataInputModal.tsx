import React, { useState } from 'react';
import { WaterLevelRecord } from '../types';
import { parseManualInput } from '../services/googleSheetService';

interface DataInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateData: (data: WaterLevelRecord[]) => void;
}

export const DataInputModal: React.FC<DataInputModalProps> = ({ isOpen, onClose, onUpdateData }) => {
    const [inputText, setInputText] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleUpdate = () => {
        try {
            const data = parseManualInput(inputText);
            if (data.length === 0) {
                setError("Không tìm thấy dữ liệu hợp lệ. Vui lòng đảm bảo bạn đã copy đúng bảng (bao gồm các cột ID, Thời gian, Mức nước).");
                return;
            }
            onUpdateData(data);
            onClose();
            setInputText('');
            setError(null);
        } catch (e) {
            setError("Lỗi phân tích dữ liệu. Vui lòng kiểm tra lại định dạng copy.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-cyan-600 text-white">
                    <h2 className="text-2xl font-bold">Nhập dữ liệu nhanh</h2>
                    <p className="opacity-90 mt-1 text-sm">
                        Giải pháp cập nhật tức thì khi mạng bị chậm hoặc lỗi.
                    </p>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                    <div className="mb-4 text-gray-700 space-y-2">
                        <p className="font-semibold">Hướng dẫn:</p>
                        <ol className="list-decimal list-inside text-sm space-y-1 ml-1 text-gray-600">
                            <li>Mở file Google Sheet hoặc Excel của bạn.</li>
                            <li>Bôi đen vùng dữ liệu (bao gồm cả cột ID, Thời gian và Mức nước).</li>
                            <li>Nhấn <strong>Ctrl + C</strong> (Copy).</li>
                            <li>Quay lại đây và nhấn <strong>Ctrl + V</strong> (Dán) vào ô bên dưới.</li>
                            <li>Nhấn nút <strong>"Cập nhật ngay"</strong>.</li>
                        </ol>
                    </div>

                    <textarea
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm bg-gray-50 resize-y"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Ví dụ định dạng khi dán:
T1    23h00 07/12/2025    3
PN1   23h00 07/12/2025    1
DC1   23h00 07/12/2025    2`}
                    />
                    
                    {error && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t border-gray-200">
                    <button 
                        onClick={onClose} 
                        className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleUpdate} 
                        className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
                    >
                        Cập nhật ngay
                    </button>
                </div>
            </div>
        </div>
    );
};