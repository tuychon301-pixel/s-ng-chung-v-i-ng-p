
import React, { useState, useRef, MouseEvent } from 'react';
import { Region, WaterLevelRecord } from '../types';
import { junctions } from '../data/junctions';

interface MapGridProps {
  selectedRoadId: string | null;
  onSelectRoad: (roadId: string, region: Region) => void;
  waterLevelData: Map<string, WaterLevelRecord>;
  startJunction: string | null;
  endJunction: string | null;
  path: string[] | null;
  onSelectJunction: (junctionId: string) => void;
  selectionMode: 'start' | 'end' | null;
}

const getWaterLevelColor = (level: number | undefined): string => {
    switch (level) {
        case 0: return '#cbd5e1'; // slate-300 (Normal - Softer Gray)
        case 1: return '#60a5fa'; // blue-400 (Low)
        case 2: return '#facc15'; // yellow-400 (Medium)
        case 3: return '#ef4444'; // red-500 (High)
        default: return '#e2e8f0'; // slate-200 fallback
    }
};

const RoadSegment: React.FC<{
    id: string;
    region: Region;
    selectedRoadId: string | null;
    hoveredRoadId: string | null;
    waterLevel: 0 | 1 | 2 | 3 | undefined;
    onSelectRoad: (roadId: string, region: Region) => void;
    setHoveredRoadId: (id: string | null) => void;
    isPath: boolean;
    selectionMode: 'start' | 'end' | null;
    children: React.ReactElement<React.SVGAttributes<SVGElement>>;
}> = ({ id, region, selectedRoadId, hoveredRoadId, waterLevel, onSelectRoad, setHoveredRoadId, isPath, selectionMode, children }) => {
    
    const isSelected = selectedRoadId === id;
    const isHovered = hoveredRoadId === id;
    const isHighLevel = waterLevel === 3;

    // Enhanced visual states with better shadows and brightness
    let filter = 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))';
    if (isSelected) {
        filter = 'brightness(1.1) drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'; // Cyan glow
    } else if (isHovered && !selectionMode) {
        filter = 'brightness(1.05) drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))';
    }

    const stroke = isPath ? '#10b981' : (isSelected ? '#22d3ee' : 'none'); // Emerald for path, Cyan for selection
    const strokeWidth = isPath ? 6 : (isSelected ? 3 : 0);
    const fill = getWaterLevelColor(waterLevel);
    
    const style: React.CSSProperties = {
        cursor: selectionMode ? 'crosshair' : (isPath ? 'default' : 'pointer'),
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        filter: filter,
        outline: 'none',
    };
    
    let className = isPath ? 'path-segment' : '';
    if (isHighLevel) {
        className += ' high-level-pulse';
    }
    if (isHighLevel && (isHovered || isSelected) && !selectionMode) {
        className += ' danger-pulse-active';
    }

    // Add rounded corners (rx, ry) to rects for a smoother look
    const roundedChildren = React.cloneElement(children, {
        rx: 6, // Increased roundness for modern look
        ry: 6,
        onClick: () => !selectionMode && onSelectRoad(id, region),
        onMouseEnter: () => setHoveredRoadId(id),
        onMouseLeave: () => setHoveredRoadId(null),
        style: style,
        fill: fill,
        stroke: stroke,
        strokeWidth: `${strokeWidth}px`,
        className: className,
        role: "button",
        "aria-label": `Đoạn đường ${id} - Mực nước cấp ${waterLevel}`,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => { if (!selectionMode && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelectRoad(id, region); } }
    });

    return roundedChildren;
};

const MapGrid: React.FC<MapGridProps> = ({ selectedRoadId, onSelectRoad, waterLevelData, startJunction, endJunction, path, onSelectJunction, selectionMode }) => {
  const [hoveredRoadId, setHoveredRoadId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const roadProps = (id: string, region: Region) => ({
      id,
      region,
      selectedRoadId,
      hoveredRoadId,
      onSelectRoad,
      setHoveredRoadId,
      waterLevel: waterLevelData.get(id)?.level,
      isPath: path?.includes(id) ?? false,
      selectionMode
  });

  const findNearestJunction = (x: number, y: number): string | null => {
    let closestJunction: string | null = null;
    let minDistance = Infinity;

    for (const id in junctions) {
        const junction = junctions[id];
        const distance = Math.sqrt(Math.pow(junction.x - x, 2) + Math.pow(junction.y - y, 2));
        if (distance < minDistance) {
            minDistance = distance;
            closestJunction = id;
        }
    }
    return closestJunction;
  };
  
  const handleMapClick = (event: MouseEvent<SVGSVGElement>) => {
    if (!selectionMode || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const nearestJunctionId = findNearestJunction(svgPoint.x, svgPoint.y - 13.23); 
    if (nearestJunctionId) {
        onSelectJunction(nearestJunctionId);
    }
  };

  const startMarker = startJunction ? junctions[startJunction] : null;
  const endMarker = endJunction ? junctions[endJunction] : null;

  return (
    <div className="flex flex-col w-full h-full bg-[#f8fafc]">
      <style>{`
        @keyframes pulse-path {
            0%, 100% { stroke-opacity: 1; stroke-width: 6px; }
            50% { stroke-opacity: 0.6; stroke-width: 9px; }
        }
        @keyframes high-level-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        @keyframes danger-pulse-active {
            0% { 
                fill: #ef4444; 
                filter: drop-shadow(0 0 4px #ef4444);
                stroke: #fee2e2;
                stroke-width: 3px;
                stroke-opacity: 0.8;
            }
            50% { 
                fill: #b91c1c; 
                filter: drop-shadow(0 0 16px #ef4444);
                stroke: #f87171;
                stroke-width: 8px;
                stroke-opacity: 1;
            }
            100% { 
                fill: #ef4444; 
                filter: drop-shadow(0 0 4px #ef4444);
                stroke: #fee2e2;
                stroke-width: 3px;
                stroke-opacity: 0.8;
            }
        }
        .path-segment {
            animation: pulse-path 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            z-index: 5;
        }
        .high-level-pulse {
             animation: high-level-pulse 3s ease-in-out infinite;
        }
        .danger-pulse-active {
            animation: danger-pulse-active 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite !important;
            z-index: 10;
        }
      `}</style>
      
      {/* Map Area */}
      <div className="relative w-full aspect-square">
          <svg 
            id="Layer_1" 
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 959.85 944.25"
            className="w-full h-full"
            onClick={handleMapClick}
            style={{ cursor: selectionMode ? 'crosshair' : 'default' }}
            >
            {/* Cleaner background rect */}
            <rect x="0" y="0" width="959.85" height="13.23" fill="#94a3b8" rx="6" ry="6" opacity="0.5" />
            
            <g transform="translate(0, 13.23)">
                {/* Road Segments */}
                <g>
                    <RoadSegment {...roadProps('T11', Region.Pink)}><rect id="T11" x="87.34" y="371.97" width="69.08" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T8', Region.Pink)}><rect id="T8" x="87.34" y="574.96" width="69.08" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T9', Region.Pink)}><rect id="T9" x="14.1" y="574.96" width="57.38" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T6', Region.Pink)}><rect id="T6" x="14.1" y="653.42" width="57.38" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T4', Region.Pink)}><rect id="T4" x="14.1" y="717.52" width="57.38" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('T5', Region.Pink)}><rect id="T5" x="87.34" y="653.42" width="153.53" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T3', Region.Pink)}><rect id="T3" x="87.34" y="717.52" width="153.53" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('T1', Region.Pink)}><rect id="T1" x="87.34" y="863.5" width="153.53" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('T2', Region.Pink)}><rect id="T2" x="14.1" y="863.5" width="57.38" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('T10', Region.Pink)}><rect id="T10" x="166.73" y="371.97" width="74.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T7', Region.Pink)}><rect id="T7" x="166.73" y="574.96" width="74.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T13', Region.Pink)}><rect id="T13" x="166.73" y="237.55" width="74.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T14', Region.Pink)}><rect id="T14" x="87.34" y="237.55" width="69.08" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T15', Region.Pink)}><rect id="T15" x="14.1" y="237.55" width="57.38" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T12', Region.Pink)}><rect id="T12" x="14.1" y="371.97" width="57.38" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T16', Region.Pink)}><rect id="T16" x="14.1" y="160.79" width="226.77" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('T17', Region.Pink)}><rect id="T17" x="14.1" y="0" width="226.77" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('TD11', Region.Pink)}><rect id="TD11" y="385.21" width="14.1" height="189.75"/></RoadSegment>
                    <RoadSegment {...roadProps('TD15', Region.Pink)}><rect id="TD15" y="174.03" width="14.1" height="63.52"/></RoadSegment>
                    <RoadSegment {...roadProps('TD16', Region.Pink)}><rect id="TD16" y="13.23" width="14.1" height="147.56"/></RoadSegment>
                    <RoadSegment {...roadProps('TD13', Region.Pink)}><rect id="TD13" x="72.36" y="250.78" width="14.1" height="121.2"/></RoadSegment>
                    <RoadSegment {...roadProps('TD14', Region.Pink)}><rect id="TD14" y="250.78" width="14.1" height="121.2"/></RoadSegment>
                    <RoadSegment {...roadProps('TD8', Region.Pink)}><rect id="TD8" y="588.19" width="14.1" height="65.23"/></RoadSegment>
                    <RoadSegment {...roadProps('TD6', Region.Pink)}><rect id="TD6" y="666.65" width="14.1" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('TD2', Region.Pink)}><rect id="TD2" y="880.15" width="14.1" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('TD4', Region.Pink)}><rect id="TD4" y="734.17" width="14.1" height="129.33"/></RoadSegment>
                    <RoadSegment {...roadProps('TD10', Region.Pink)}><rect id="TD10" x="71.48" y="385.21" width="15.86" height="189.75"/></RoadSegment>
                    <RoadSegment {...roadProps('TD7', Region.Pink)}><rect id="TD7" x="71.48" y="588.19" width="15.86" height="65.23"/></RoadSegment>
                    <RoadSegment {...roadProps('TD5', Region.Pink)}><rect id="TD5" x="71.48" y="666.65" width="15.86" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('TD1', Region.Pink)}><rect id="TD1" x="71.48" y="880.15" width="15.86" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('TD3', Region.Pink)}><rect id="TD3" x="71.48" y="734.17" width="15.86" height="129.33"/></RoadSegment>
                    <RoadSegment {...roadProps('TD9', Region.Pink)}><rect id="TD9" x="156.42" y="385.21" width="10.31" height="189.75"/></RoadSegment>
                    <RoadSegment {...roadProps('TD12', Region.Pink)}><rect id="TD12" x="156.42" y="250.78" width="10.31" height="121.05"/></RoadSegment>
                </g>

                <g>
                    <RoadSegment {...roadProps('DC5', Region.Blue)}><rect id="DC5" x="240.87" y="385.21" width="39.96" height="189.75"/></RoadSegment>
                    <RoadSegment {...roadProps('DC4', Region.Blue)}><rect id="DC4" x="240.87" y="588.19" width="39.96" height="65.23"/></RoadSegment>
                    <RoadSegment {...roadProps('DC3', Region.Blue)}><rect id="DC3" x="240.87" y="666.65" width="39.96" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('DC2', Region.Blue)}><rect id="DC2" x="240.87" y="734.17" width="39.96" height="129.33"/></RoadSegment>
                    <RoadSegment {...roadProps('DC1', Region.Blue)}><rect id="DC1" x="240.87" y="880.15" width="39.96" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('DC6', Region.Blue)}><rect id="DC6" x="240.87" y="250.78" width="39.96" height="121.2"/></RoadSegment>
                    <RoadSegment {...roadProps('DC7', Region.Blue)}><rect id="DC7" x="240.87" y="174.03" width="39.96" height="63.52"/></RoadSegment>
                    <RoadSegment {...roadProps('DC8', Region.Blue)}><rect id="DC8" x="240.87" y="13.23" width="39.96" height="147.56"/></RoadSegment>
                </g>

                <g>
                    <RoadSegment {...roadProps('PN28', Region.Green)}><rect id="PN28" x="280.82" y="371.97" width="80.43" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN37', Region.Green)}><rect id="PN37" x="280.82" y="237.55" width="80.43" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN20', Region.Green)}><rect id="PN20" x="280.82" y="574.96" width="80.43" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN8', Region.Green)}><rect id="PN8" x="416.48" y="717.52" width="25.05" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('PN9', Region.Green)}><rect id="PN9" x="311.92" y="717.52" width="94.01" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('PN10', Region.Green)}><rect id="PN10" x="280.82" y="717.57" width="20.29" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('PN13', Region.Green)}><rect id="PN13" x="416.48" y="653.42" width="25.05" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN12', Region.Green)}><rect id="PN12" x="454.38" y="653.42" width="267.35" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN7', Region.Green)}><rect id="PN7" x="454.38" y="717.37" width="267.35" height="16.8"/></RoadSegment>
                    <RoadSegment {...roadProps('PN5', Region.Green)}><rect id="PN5" x="454.38" y="784.89" width="267.35" height="16.8"/></RoadSegment>
                    <RoadSegment {...roadProps('PN2', Region.Green)}><rect id="PN2" x="454.38" y="863.43" width="267.35" height="16.8"/></RoadSegment>
                    <RoadSegment {...roadProps('PN15', Region.Green)}><rect id="PN15" x="280.82" y="653.42" width="20.29" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN14', Region.Green)}><rect id="PN14" x="311.92" y="653.42" width="94.01" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN3', Region.Green)}><rect id="PN3" x="280.82" y="863.5" width="159.73" height="16.65"/></RoadSegment>
                    <RoadSegment {...roadProps('PN19', Region.Green)}><rect id="PN19" x="369.09" y="574.96" width="72.44" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN18', Region.Green)}><rect id="PN18" x="454.38" y="574.96" width="62.78" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN27', Region.Green)}><rect id="PN27" x="369.09" y="371.97" width="72.44" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN36', Region.Green)}><rect id="PN36" x="369.09" y="237.55" width="72.44" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN41', Region.Green)}><rect id="PN41" x="280.82" y="160.79" width="160.71" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN48', Region.Green)}><rect id="PN48" x="280.82" y="0" width="160.71" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN26', Region.Green)}><rect id="PN26" x="454.38" y="371.97" width="62.78" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN35', Region.Green)}><rect id="PN35" x="454.38" y="237.55" width="62.78" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN40', Region.Green)}><rect id="PN40" x="454.38" y="160.79" width="62.78" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN47', Region.Green)}><rect id="PN47" x="454.38" y="0" width="62.78" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN25', Region.Green)}><rect id="PN25" x="525.59" y="371.97" width="196.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN30', Region.Green)}><rect id="PN30" x="525.59" y="303.13" width="196.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN34', Region.Green)}><rect id="PN34" x="525.59" y="237.55" width="196.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN39', Region.Green)}><rect id="PN39" x="525.59" y="160.79" width="196.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN42', Region.Green)}><rect id="PN42" x="525.59" y="84.04" width="196.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN46', Region.Green)}><rect id="PN46" x="525.59" y="0" width="196.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN17', Region.Green)}><rect id="PN17" x="525.59" y="574.96" width="196.14" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN22', Region.Green)}><rect id="PN22" x="525.59" y="504.55" width="196.14" height="11.47"/></RoadSegment>
                    <RoadSegment {...roadProps('PN24', Region.Green)}><rect id="PN24" x="732.49" y="371.97" width="214.26" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN29', Region.Green)}><rect id="PN29" x="732.49" y="303.13" width="214.26" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN33', Region.Green)}><rect id="PN33" x="732.49" y="237.55" width="62.3" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN32', Region.Green)}><rect id="PN32" x="805.56" y="237.55" width="68.56" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN44', Region.Green)}><rect id="PN44" x="805.56" y="0" width="68.56" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN43', Region.Green)}><rect id="PN43" x="884.88" y="0" width="61.87" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN31', Region.Green)}><rect id="PN31" x="884.88" y="237.55" width="61.87" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN38', Region.Green)}><rect id="PN38" x="732.49" y="160.79" width="62.3" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN45', Region.Green)}><rect id="PN45" x="732.49" y="0" width="62.3" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN23', Region.Green)}><rect id="PN23" x="732.49" y="440.31" width="214.26" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN21', Region.Green)}><rect id="PN21" x="732.49" y="503.67" width="214.26" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN16', Region.Green)}><rect id="PN16" x="732.49" y="574.96" width="214.26" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN11', Region.Green)}><rect id="PN11" x="732.49" y="653.42" width="214.26" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('PN4', Region.Green)}><rect id="PN4" x="732.49" y="785.14" width="214.26" height="16.4"/></RoadSegment>
                    <RoadSegment {...roadProps('PN1', Region.Green)}><rect id="PN1" x="732.49" y="863.63" width="214.26" height="16.4"/></RoadSegment>
                    <RoadSegment {...roadProps('PN6', Region.Green)}><rect id="PN6" x="732.49" y="719.28" width="214.26" height="13.23"/></RoadSegment>
                    <RoadSegment {...roadProps('P15', Region.Green)}><rect id="P15" x="361.25" y="385.21" width="7.84" height="189.75"/></RoadSegment>
                    <RoadSegment {...roadProps('P29', Region.Green)}><rect id="P29" x="361.25" y="250.78" width="7.84" height="121.05"/></RoadSegment>
                    <RoadSegment {...roadProps('P28', Region.Green)}><rect id="P28" x="441.53" y="250.78" width="12.85" height="121.05"/></RoadSegment>
                    <RoadSegment {...roadProps('P33', Region.Green)}><rect id="P33" x="441.53" y="174.03" width="12.85" height="63.52"/></RoadSegment>
                    <RoadSegment {...roadProps('P44', Region.Green)}><rect id="P44" x="441.53" y="13.23" width="12.85" height="147.56"/></RoadSegment>
                    <RoadSegment {...roadProps('P8', Region.Green)}><rect id="P8" x="405.93" y="666.65" width="10.55" height="50.72"/></RoadSegment>
                    <RoadSegment {...roadProps('P7', Region.Green)}><rect id="P7" x="301.12" y="666.65" width="10.8" height="50.72"/></RoadSegment>
                    <RoadSegment {...roadProps('P16', Region.Green)}><rect id="P16" x="441.53" y="385.21" width="12.85" height="189.75"/></RoadSegment>
                    <RoadSegment {...roadProps('P12', Region.Green)}><rect id="P12" x="441.53" y="588.19" width="12.85" height="65.23"/></RoadSegment>
                    <RoadSegment {...roadProps('P9', Region.Green)}><rect id="P9" x="441.53" y="666.65" width="12.85" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('P4', Region.Green)}><rect id="P4" x="441.53" y="734.17" width="12.85" height="50.72"/></RoadSegment>
                    <RoadSegment {...roadProps('P1', Region.Green)}><rect id="P1" x="441.53" y="801.54" width="12.85" height="61.96"/></RoadSegment>
                    <RoadSegment {...roadProps('P19', Region.Green)}><rect id="P19" x="721.73" y="385.21" width="10.76" height="55.11"/></RoadSegment>
                    <RoadSegment {...roadProps('P26', Region.Green)}><rect id="P26" x="721.73" y="316.36" width="10.76" height="55.61"/></RoadSegment>
                    <RoadSegment {...roadProps('P20', Region.Green)}><rect id="P20" x="721.73" y="451.78" width="10.76" height="52.76"/></RoadSegment>
                    <RoadSegment {...roadProps('P24', Region.Green)}><rect id="P24" x="721.73" y="516.02" width="10.76" height="58.94"/></RoadSegment>
                    <RoadSegment {...roadProps('P13', Region.Green)}><rect id="P13" x="721.73" y="588.19" width="10.76" height="65.23"/></RoadSegment>
                    <RoadSegment {...roadProps('P10', Region.Green)}><rect id="P10" x="721.73" y="666.65" width="10.76" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('P5', Region.Green)}><rect id="P5" x="721.73" y="734.1" width="10.76" height="50.87"/></RoadSegment>
                    <RoadSegment {...roadProps('P2', Region.Green)}><rect id="P2" x="721.73" y="801.54" width="10.76" height="61.96"/></RoadSegment>
                    <RoadSegment {...roadProps('P21', Region.Green)}><rect id="P21" x="946.75" y="385.21" width="13.1" height="55.11"/></RoadSegment>
                    <RoadSegment {...roadProps('P25', Region.Green)}><rect id="P25" x="946.75" y="316.36" width="13.1" height="55.61"/></RoadSegment>
                    <RoadSegment {...roadProps('P22', Region.Green)}><rect id="P22" x="946.75" y="453.54" width="13.1" height="50.12"/></RoadSegment>
                    <RoadSegment {...roadProps('P23', Region.Green)}><rect id="P23" x="946.75" y="516.9" width="13.1" height="58.06"/></RoadSegment>
                    <RoadSegment {...roadProps('P14', Region.Green)}><rect id="P14" x="946.75" y="588.19" width="13.1" height="65.23"/></RoadSegment>
                    <RoadSegment {...roadProps('P11', Region.Green)}><rect id="P11" x="946.75" y="666.65" width="13.1" height="52.63"/></RoadSegment>
                    <RoadSegment {...roadProps('P6', Region.Green)}><rect id="P6" x="946.75" y="732.51" width="13.1" height="52.38"/></RoadSegment>
                    <RoadSegment {...roadProps('P3', Region.Green)}><rect id="P3" x="946.75" y="801.69" width="13.1" height="61.94"/></RoadSegment>
                    <RoadSegment {...roadProps('P17', Region.Green)}><rect id="P17" x="517.16" y="385.21" width="8.43" height="119.34"/></RoadSegment>
                    <RoadSegment {...roadProps('P27', Region.Green)}><rect id="P27" x="517.16" y="316.36" width="8.43" height="55.61"/></RoadSegment>
                    <RoadSegment {...roadProps('P30', Region.Green)}><rect id="P30" x="517.16" y="250.78" width="8.43" height="52.35"/></RoadSegment>
                    <RoadSegment {...roadProps('P34', Region.Green)}><rect id="P34" x="517.16" y="174.03" width="8.43" height="63.52"/></RoadSegment>
                    <RoadSegment {...roadProps('P31', Region.Green)}><rect id="P31" x="721.73" y="250.78" width="10.76" height="52.35"/></RoadSegment>
                    <RoadSegment {...roadProps('P35', Region.Green)}><rect id="P35" x="721.73" y="174.03" width="10.76" height="63.52"/></RoadSegment>
                    <RoadSegment {...roadProps('P40', Region.Green)}><rect id="P40" x="721.73" y="97.27" width="10.76" height="63.52"/></RoadSegment>
                    <RoadSegment {...roadProps('P41', Region.Green)}><rect id="P41" x="721.73" y="13.23" width="10.76" height="70.81"/></RoadSegment>
                    <RoadSegment {...roadProps('P39', Region.Green)}><rect id="P39" x="794.8" y="13.23" width="10.76" height="147.56"/></RoadSegment>
                    <RoadSegment {...roadProps('P36', Region.Green)}><rect id="P36" x="794.8" y="173.65" width="10.76" height="63.89"/></RoadSegment>
                    <RoadSegment {...roadProps('P37', Region.Green)}><rect id="P37" x="874.11" y="13.23" width="10.76" height="224.31"/></RoadSegment>
                    <RoadSegment {...roadProps('P38', Region.Green)}><rect id="P38" x="946.75" y="13.23" width="13.1" height="224.31"/></RoadSegment>
                    <RoadSegment {...roadProps('P32', Region.Green)}><rect id="P32" x="946.75" y="250.78" width="13.1" height="52.35"/></RoadSegment>
                    <RoadSegment {...roadProps('P42', Region.Green)}><rect id="P42" x="517.16" y="97.27" width="8.43" height="63.52"/></RoadSegment>
                    <RoadSegment {...roadProps('P43', Region.Green)}><rect id="P43" x="517.16" y="13.23" width="8.43" height="70.81"/></RoadSegment>
                    <RoadSegment {...roadProps('P18', Region.Green)}><rect id="P18" x="517.16" y="516.02" width="8.43" height="58.94"/></RoadSegment>
                </g>

                {/* Pathfinding Markers - Modernized visual */}
                <g filter="drop-shadow(0 4px 4px rgba(0,0,0,0.2))">
                    {startMarker && (
                        <g className="cursor-default pointer-events-none">
                             <circle cx={startMarker.x} cy={startMarker.y} r={16} fill="#22c55e" opacity="0.3" className="animate-ping" />
                             <circle cx={startMarker.x} cy={startMarker.y} r={9} fill="#22c55e" stroke="white" strokeWidth={3} />
                             <text x={startMarker.x} y={startMarker.y - 14} textAnchor="middle" fill="#15803d" fontSize="12" fontWeight="900" style={{textShadow: '0px 2px 2px rgba(255,255,255,0.8)'}}>A</text>
                        </g>
                    )}
                    {endMarker && (
                        <g className="cursor-default pointer-events-none">
                            <circle cx={endMarker.x} cy={endMarker.y} r={16} fill="#ef4444" opacity="0.3" className="animate-ping" />
                            <circle cx={endMarker.x} cy={endMarker.y} r={9} fill="#ef4444" stroke="white" strokeWidth={3} />
                            <text x={endMarker.x} y={endMarker.y - 14} textAnchor="middle" fill="#b91c1c" fontSize="12" fontWeight="900" style={{textShadow: '0px 2px 2px rgba(255,255,255,0.8)'}}>B</text>
                        </g>
                    )}
                </g>
            </g>
          </svg>
      </div>

      {/* Legend Area - Moved to bottom outside the SVG to prevent obstruction */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm shadow-sm relative z-10">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-2">Chú thích:</span>
          
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-300 shadow-sm ring-1 ring-slate-100"></span>
              <span className="text-slate-600 font-medium">Bình thường</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-400 shadow-sm ring-1 ring-blue-100"></span>
              <span className="text-slate-600 font-medium">Thấp</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm ring-1 ring-yellow-100"></span>
              <span className="text-slate-600 font-medium">Trung bình</span>
          </div>
          <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-1 ring-red-200"></span>
              </span>
              <span className="text-red-600 font-bold">Cao (Nguy hiểm)</span>
          </div>
      </div>
    </div>
  );
};

export default MapGrid;
