
import React from 'react';
import { WaterLevelRecord } from '../types';

interface InfoPanelProps {
  roadData: WaterLevelRecord | null;
  selectedRoadId: string | null;
  isLoading: boolean;
  error: string | null;
  startJunction: string | null;
  endJunction: string | null;
  path: string[] | null;
  isFindingPath: boolean;
  selectionMode: 'start' | 'end' | null;
  onSetSelectionMode: (mode: 'start' | 'end' | null) => void;
  onClearPath: () => void;
  routingMode: 'optimal' | 'safe';
  onSetRoutingMode: (mode: 'optimal' | 'safe') => void;
}

const getLevelInfo = (level: 0 | 1 | 2 | 3): { text: string; color: string; dot: string; bg: string } => {
    switch (level) {
        case 0: return { text: 'Bình thường', color: 'text-gray-700', dot: 'bg-gray-400', bg: 'bg-gray-100 border-gray-200' };
        case 1: return { text: 'Ngập nhẹ (Thấp)', color: 'text-blue-700', dot: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200' };
        case 2: return { text: 'Ngập vừa (Trung bình)', color: 'text-yellow-700', dot: 'bg-yellow-500', bg: 'bg-yellow-50 border-yellow-200' };
        case 3: return { text: 'Ngập sâu (Cao)', color: 'text-red-700', dot: 'bg-red-500', bg: 'bg-red-50 border-red-200' };
        default: return { text: 'Không xác định', color: 'text-gray-500', dot: 'bg-gray-300', bg: 'bg-gray-50 border-gray-200' };
    }
};

const RoadDetails: React.FC<{ roadData: WaterLevelRecord; selectedRoadId: string }> = ({ roadData, selectedRoadId }) => {
  const isHighWater = roadData.level === 3;
  const levelInfo = getLevelInfo(roadData.level);

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 p-5 mt-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
          <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đoạn đường đã chọn</p>
              <h3 className="text-xl font-black text-slate-800 font-mono tracking-tight">{selectedRoadId}</h3>
          </div>
      </div>
      
      {isHighWater && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-white border border-red-200 p-4 mb-5 rounded-xl shadow-sm group">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex items-start relative z-10">
                <div className="flex-shrink-0 bg-red-100 p-1.5 rounded-full mr-3 animate-pulse">
                    <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                    <p className="text-red-800 font-bold text-sm uppercase tracking-wide">CẢNH BÁO NGUY HIỂM</p>
                    <p className="text-xs text-red-600 mt-1 font-medium leading-relaxed">
                        Khu vực này đang ngập sâu (Cấp 3). Tuyệt đối hạn chế di chuyển!
                    </p>
                </div>
            </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm font-medium text-slate-500">Cập nhật lúc</span>
          <span className="text-slate-900 font-mono font-bold text-sm">{roadData.time}</span>
        </div>
        
        <div className={`flex items-center justify-between p-3 rounded-lg border ${levelInfo.bg}`}>
          <span className="text-sm font-medium text-slate-600">Tình trạng</span>
          <div className="flex items-center gap-2">
             <span className={`w-2.5 h-2.5 rounded-full ${levelInfo.dot} shadow-sm`}></span>
             <span className={`text-sm font-bold ${levelInfo.color}`}>{levelInfo.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PathfindingPanel: React.FC<Omit<InfoPanelProps, 'roadData' | 'selectedRoadId' | 'isLoading' | 'error'>> = ({
    startJunction, endJunction, path, isFindingPath, selectionMode, onSetSelectionMode, onClearPath, routingMode, onSetRoutingMode
}) => {
    
    const getStatusMessage = () => {
        if (selectionMode === 'start') return "Nhấp vào bản đồ để chọn điểm đi";
        if (selectionMode === 'end' && startJunction) return "Nhấp vào bản đồ để chọn điểm đến";
        if (startJunction && endJunction) return "Đã hoàn tất lộ trình";
        return "Sẵn sàng tìm đường";
    }

    const renderResult = () => {
        if (isFindingPath) return (
            <div className="flex items-center justify-center gap-2 text-cyan-600 py-3 bg-cyan-50/50 rounded-lg mt-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="font-semibold text-sm">Đang tính toán...</span>
            </div>
        );
        if (startJunction && endJunction) {
            if (path) {
                return (
                    <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg flex items-center gap-3 border border-emerald-100 shadow-sm">
                        <div className="bg-emerald-200 p-1.5 rounded-full text-emerald-700">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                            <p className="font-bold text-sm">Lộ trình tối ưu</p>
                            <p className="text-xs opacity-90">Độ dài: {path.length} đoạn đường</p>
                        </div>
                    </div>
                );
            }
            return (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-3 border border-red-100 shadow-sm">
                    <div className="bg-red-200 p-1.5 rounded-full text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <p className="font-bold text-sm">Không tìm thấy đường</p>
                        <p className="text-xs opacity-90">Bị chặn bởi vùng ngập Cấp 3</p>
                    </div>
                </div>
            );
        }
        return null;
    }
    
    const routingDescription = {
        optimal: "Tìm đường NGẮN NHẤT. Chỉ tránh đường Cấp 3 (Đỏ).",
        safe: "Tìm đường AN TOÀN. Ưu tiên đường khô ráo, tránh tối đa Cấp 2 (Vàng)."
    };

    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            {/* Header Panel */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                     <div className="bg-indigo-500 p-1.5 rounded-lg shadow-sm">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tìm Lộ Trình</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-9">{getStatusMessage()}</p>
            </div>
            
            <div className="p-5">
                {/* Timeline Selection UI */}
                <div className="relative pl-2 mb-6">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>

                    {/* Start Input */}
                    <div className="relative z-10 mb-4 group">
                        <button 
                            onClick={() => onSetSelectionMode('start')}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-sm ${selectionMode === 'start' ? 'border-green-500 bg-green-50/50' : 'border-gray-100 bg-white hover:border-green-200'}`}
                        >
                            <div className={`w-4 h-4 rounded-full border-[3px] flex-shrink-0 ${startJunction ? 'border-green-500 bg-white' : 'border-gray-300 bg-gray-100'}`}></div>
                            <div className="flex-1">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Điểm Đi (Start)</span>
                                <span className={`block font-mono font-bold text-base ${startJunction ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                                    {startJunction || "Chọn trên bản đồ..."}
                                </span>
                            </div>
                            {startJunction && <div className="text-green-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>}
                        </button>
                    </div>

                    {/* End Input */}
                    <div className="relative z-10 group">
                         <button 
                            onClick={() => onSetSelectionMode('end')}
                            disabled={!startJunction}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-sm ${selectionMode === 'end' ? 'border-red-500 bg-red-50/50' : 'border-gray-100 bg-white hover:border-red-200'} ${!startJunction ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className={`w-4 h-4 flex-shrink-0 ${endJunction ? 'text-red-500' : 'text-gray-300'}`}>
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            </div>
                            <div className="flex-1">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Điểm Đến (End)</span>
                                <span className={`block font-mono font-bold text-base ${endJunction ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                                    {endJunction || "Chọn trên bản đồ..."}
                                </span>
                            </div>
                            {endJunction && <div className="text-red-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>}
                        </button>
                    </div>
                </div>

                {/* Reset Button */}
                {(startJunction || endJunction || selectionMode) && (
                    <button onClick={onClearPath} className="w-full py-2.5 mb-5 text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-dashed border-gray-300 hover:border-red-200 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Xóa lộ trình
                    </button>
                )}

                {/* Routing Mode Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1 mb-2">
                    <button 
                        onClick={() => onSetRoutingMode('optimal')} 
                        className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${routingMode === 'optimal' ? 'bg-white text-cyan-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200/50'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Tối Ưu (Nhanh)
                    </button>
                    <button 
                        onClick={() => onSetRoutingMode('safe')} 
                        className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${routingMode === 'safe' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-gray-200/50'}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        An Toàn (Né Ngập)
                    </button>
                </div>
                <p className="text-[11px] text-slate-400 text-center leading-tight px-2">
                    {routingDescription[routingMode]}
                </p>

                {renderResult()}
            </div>
        </div>
    );
};


const InfoPanel: React.FC<InfoPanelProps> = (props) => {
  const { roadData, selectedRoadId, isLoading, error, selectionMode } = props;

  const renderRoadInfo = () => {
    // Don't show road info when actively selecting points on map
    if (selectionMode) return null;
    
    if (isLoading) return null;
    if (error) return (
      <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 text-center">
         <p className="text-red-500 text-sm font-medium">Không thể tải thông tin.</p>
      </div>
    );
    
    if (selectedRoadId && roadData) {
      return <RoadDetails roadData={roadData} selectedRoadId={selectedRoadId} />;
    }
    
    return (
      <div className="mt-6 p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center group hover:border-cyan-200 transition-colors">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-cyan-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
        </div>
        <p className="text-slate-400 font-medium text-sm">Nhấp vào một đoạn đường trên bản đồ để xem chi tiết mức ngập.</p>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col transition-all duration-300" aria-live="polite">
      <PathfindingPanel {...props} />
      {renderRoadInfo()}
    </div>
  );
};

export default InfoPanel;
