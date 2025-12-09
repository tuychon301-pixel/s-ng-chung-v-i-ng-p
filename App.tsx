
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Region, WaterLevelRecord } from './types';
import MapGrid from './components/MapGrid';
import InfoPanel from './components/InfoPanel';
import { findShortestPath } from './services/pathfindingService';
import { junctions } from './data/junctions';
import { fetchLiveWaterData } from './services/googleSheetService';

const App: React.FC = () => {
  // State quản lý dữ liệu thực
  const [liveData, setLiveData] = useState<WaterLevelRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Ref để tránh race condition khi request cũ chưa xong mà request mới đã chạy
  const isFetchingRef = useRef(false);

  // Load data from Google Sheet
  const loadData = useCallback(async () => {
    if (isFetchingRef.current) return; // Đang tải thì bỏ qua lượt này
    isFetchingRef.current = true;

    const result = await fetchLiveWaterData();
    
    // Logic mới: Nghiêm ngặt chỉ hiển thị dữ liệu mới nhất.
    if (result.error) {
        setFetchError(result.error);
        setLiveData([]); // XÓA NGAY dữ liệu cũ nếu gặp lỗi để tránh hiển thị sai lệch
    } else {
        setLiveData(result.data); // Thay thế hoàn toàn bằng dữ liệu mới
        setFetchError(null);
    }
    
    setIsLoading(false);
    isFetchingRef.current = false;
  }, []);

  // Initial load and Polling
  useEffect(() => {
      loadData(); // Load immediately
      const intervalId = setInterval(loadData, 5000); // Refresh every 5s
      return () => clearInterval(intervalId);
  }, [loadData]);

  const waterLevelDataMap = useMemo(() => new Map(liveData.map(d => [d.id, d])), [liveData]);

  // --- Pathfinding & UI State ---
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  const [startJunction, setStartJunction] = useState<string | null>(null);
  const [endJunction, setEndJunction] = useState<string | null>(null);
  const [path, setPath] = useState<string[] | null>(null);
  const [isFindingPath, setIsFindingPath] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<'start' | 'end' | null>(null);
  const [routingMode, setRoutingMode] = useState<'optimal' | 'safe'>('optimal');

  // Pathfinding Effect
  useEffect(() => {
    if (startJunction && endJunction) {
      setIsFindingPath(true);
      const timer = setTimeout(() => {
        // Truyền null vào tham số graph cũ vì logic mới tự build graph nội bộ
        const calculatedPath = findShortestPath(null, startJunction, endJunction, waterLevelDataMap, junctions, routingMode);
        setPath(calculatedPath);
        setIsFindingPath(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [startJunction, endJunction, routingMode, waterLevelDataMap]);
  
  // Handlers
  const handleSelectJunction = useCallback((junctionId: string) => {
    if (selectionMode === 'start') {
      setStartJunction(junctionId);
      setEndJunction(null);
      setPath(null);
      setSelectionMode('end');
    } else if (selectionMode === 'end') {
      if (junctionId === startJunction) return;
      setEndJunction(junctionId);
      setSelectionMode(null);
    }
  }, [selectionMode, startJunction]);

  const handleSelectRoad = useCallback((roadId: string, _region: Region) => {
      if(selectionMode) return;
      setSelectedRoadId(prevId => (prevId === roadId ? null : roadId));
  }, [selectionMode]);
  
  const handleSetSelectionMode = (mode: 'start' | 'end' | null) => {
    setSelectionMode(mode);
    setSelectedRoadId(null);
  }

  const handleClearPath = useCallback(() => {
    setStartJunction(null);
    setEndJunction(null);
    setPath(null);
    setSelectionMode(null);
    setSelectedRoadId(null);
    setRoutingMode('optimal');
  }, []);

  const selectedRoadData = useMemo(() => {
    if (!selectedRoadId) return null;
    return waterLevelDataMap.get(selectedRoadId) || null;
  }, [selectedRoadId, waterLevelDataMap]);

  // Lấy thời gian từ bản ghi đầu tiên (nếu có) để hiển thị
  const lastUpdateTime = liveData.length > 0 ? liveData[0].time : '---';

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans selection:bg-cyan-100">
      {/* Modern Header - Glassmorphism */}
      <header className="w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-cyan-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                        Hệ Thống Giám Sát Ngập Lụt
                    </h1>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">Dữ liệu thời gian thực</p>
                </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-3">
                <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
                
                {fetchError ? (
                     <div className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-full flex items-center gap-2 text-red-600 shadow-sm">
                        <span className="relative flex h-2 w-2">
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide">Mất kết nối</span>
                     </div>
                ) : isLoading || liveData.length === 0 ? (
                    <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full flex items-center gap-2 text-blue-600 shadow-sm">
                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wide">Đang đồng bộ...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                             <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Online</span>
                        </div>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <span className="text-xs text-slate-500 font-medium">
                            Cập nhật: <span className="text-slate-800 font-mono font-bold text-sm">{lastUpdateTime}</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 p-4 sm:p-6 lg:p-8">
        
        {/* Map Section - Main Viewport */}
        <div className="w-full lg:w-8/12 xl:w-9/12 flex flex-col gap-4 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100 relative group transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                {/* Map Header inside the card */}
                <div className="absolute top-0 left-0 p-4 z-10 pointer-events-none">
                     <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur px-2 py-1 rounded-md inline-block">Bản đồ khu vực</h2>
                </div>

                <MapGrid 
                    selectedRoadId={selectedRoadId} 
                    onSelectRoad={handleSelectRoad}
                    onSelectJunction={handleSelectJunction}
                    waterLevelData={waterLevelDataMap}
                    startJunction={startJunction}
                    endJunction={endJunction}
                    path={path}
                    selectionMode={selectionMode}
                />
                
                {/* Overlay loading nếu dữ liệu trống */}
                {liveData.length === 0 && !fetchError && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm transition-opacity duration-500">
                        <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mb-4"></div>
                            <p className="text-slate-600 font-semibold animate-pulse text-sm uppercase tracking-wide">Đang tải dữ liệu bản đồ...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Info Panel Section - Sidebar Control */}
        <div className="w-full lg:w-4/12 xl:w-3/12 order-1 lg:order-2 sticky lg:top-24 transition-all duration-300">
             <InfoPanel 
                roadData={selectedRoadData} 
                selectedRoadId={selectedRoadId} 
                isLoading={isLoading}
                error={fetchError}
                startJunction={startJunction}
                endJunction={endJunction}
                path={path}
                isFindingPath={isFindingPath}
                selectionMode={selectionMode}
                onSetSelectionMode={handleSetSelectionMode}
                onClearPath={handleClearPath}
                routingMode={routingMode}
                onSetRoutingMode={setRoutingMode}
             />
        </div>
      </main>
    </div>
  );
};

export default App;
