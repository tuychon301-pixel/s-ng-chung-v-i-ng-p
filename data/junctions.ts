export interface Junction {
  x: number;
  y: number;
  roads: string[];
}

// Key is Junction ID, e.g., 'J01'
// Coordinates are based on the SVG viewBox="0 0 959.85 944.25" and transform="translate(0, 13.23)"
export const junctions: Record<string, Junction> = {
  // Far left column
  'J01': { x: 7, y: 6, roads: ['T17', 'TD16'] },
  'J02': { x: 7, y: 167, roads: ['T16', 'TD16', 'TD15'] },
  'J03': { x: 7, y: 244, roads: ['T15', 'TD15', 'TD14'] },
  'J04': { x: 7, y: 378, roads: ['T12', 'TD14', 'TD11'] },
  'J05': { x: 7, y: 581, roads: ['T9', 'TD11', 'TD8'] },
  'J06': { x: 7, y: 660, roads: ['T6', 'TD8', 'TD6'] },
  'J07': { x: 7, y: 725, roads: ['T4', 'TD6', 'TD4'] },
  'J08': { x: 7, y: 871, roads: ['T2', 'TD4', 'TD2'] },
  
  // Second to left column
  'J09': { x: 78, y: 244, roads: ['T14', 'TD13'] },
  'J10': { x: 78, y: 378, roads: ['T11', 'TD13', 'TD10'] },
  'J11': { x: 78, y: 581, roads: ['T8', 'TD10', 'TD7'] },
  'J12': { x: 78, y: 660, roads: ['T5', 'TD7', 'TD5'] },
  'J13': { x: 78, y: 725, roads: ['T3', 'TD5', 'TD3'] },
  'J14': { x: 78, y: 871, roads: ['T1', 'TD3', 'TD1'] },

  // Third to left column
  'J15': { x: 161, y: 244, roads: ['T13', 'TD12'] },
  'J16': { x: 161, y: 378, roads: ['T10', 'TD12', 'TD9'] },
  'J17': { x: 161, y: 581, roads: ['T7', 'TD9'] },

  // DC column
  'J18': { x: 260, y: 6, roads: ['T17', 'DC8', 'PN48'] },
  'J19': { x: 260, y: 167, roads: ['T16', 'DC8', 'DC7', 'PN41'] },
  'J20': { x: 260, y: 244, roads: ['T13', 'DC7', 'DC6', 'PN37'] },
  'J21': { x: 260, y: 378, roads: ['T10', 'DC6', 'DC5', 'PN28'] },
  'J22': { x: 260, y: 581, roads: ['T7', 'DC5', 'DC4', 'PN20'] },
  'J23': { x: 260, y: 660, roads: ['DC4', 'DC3', 'PN12'] },
  'J24': { x: 260, y: 725, roads: ['T3', 'DC3', 'DC2', 'PN7'] },
  'J25': { x: 260, y: 871, roads: ['T1', 'DC2', 'DC1', 'PN3'] },
  
  // PN/P columns
  'J26': { x: 365, y: 244, roads: ['PN37', 'PN36', 'P29'] },
  'J27': { x: 365, y: 378, roads: ['PN28', 'PN27', 'P15'] },
  'J28': { x: 365, y: 581, roads: ['PN20', 'PN19', 'P15'] },
  'J29': { x: 409, y: 660, roads: ['PN14', 'P8', 'P7'] },
  'J30': { x: 435, y: 725, roads: ['PN9', 'PN8', 'P4'] },

  'J31': { x: 448, y: 6, roads: ['PN48', 'PN47', 'P44'] },
  'J32': { x: 448, y: 167, roads: ['PN41', 'PN40', 'P33'] },
  'J33': { x: 448, y: 244, roads: ['PN36', 'PN35', 'P28'] },
  'J34': { x: 448, y: 378, roads: ['PN27', 'PN26', 'P16'] },
  'J35': { x: 448, y: 581, roads: ['PN19', 'PN18', 'P12'] },
  'J36': { x: 448, y: 660, roads: ['PN13', 'PN12', 'P9'] },
  'J37': { x: 448, y: 808, roads: ['PN5', 'PN2', 'P1'] },

  'J38': { x: 521, y: 6, roads: ['PN47', 'PN46', 'P43'] },
  'J39': { x: 521, y: 90, roads: ['PN42', 'P42'] },
  'J40': { x: 521, y: 167, roads: ['PN40', 'PN39', 'P34'] },
  'J41': { x: 521, y: 244, roads: ['PN35', 'PN34', 'P30'] },
  'J42': { x: 521, y: 309, roads: ['PN30', 'P27'] },
  'J43': { x: 521, y: 378, roads: ['PN26', 'PN25', 'P17'] },
  'J44': { x: 521, y: 510, roads: ['PN22', 'P17', 'P18'] },
  'J45': { x: 521, y: 581, roads: ['PN18', 'PN17', 'P18'] },

  'J46': { x: 727, y: 6, roads: ['PN46', 'PN45', 'P41'] },
  'J47': { x: 727, y: 167, roads: ['PN39', 'PN38', 'P35'] },
  'J48': { x: 727, y: 244, roads: ['PN34', 'PN33', 'P31'] },
  'J49': { x: 727, y: 309, roads: ['PN30', 'PN29', 'P26'] },
  'J50': { x: 727, y: 378, roads: ['PN25', 'PN24', 'P19'] },
  'J51': { x: 727, y: 447, roads: ['PN23', 'P19', 'P20'] },
  'J52': { x: 727, y: 510, roads: ['PN22', 'PN21', 'P20', 'P24'] },
  'J53': { x: 727, y: 581, roads: ['PN17', 'PN16', 'P13'] },
  'J54': { x: 727, y: 660, roads: ['PN12', 'PN11', 'P10'] },
  'J55': { x: 727, y: 725, roads: ['PN7', 'PN6', 'P5'] },
  'J56': { x: 727, y: 793, roads: ['PN5', 'PN4', 'P2'] },
  'J57': { x: 727, y: 871, roads: ['PN2', 'PN1', 'P2'] },

  'J58': { x: 800, y: 6, roads: ['PN45', 'PN44', 'P39'] },
  'J59': { x: 800, y: 167, roads: ['PN38', 'P39', 'P36'] },
  'J60': { x: 800, y: 244, roads: ['PN33', 'PN32', 'P36'] },

  'J61': { x: 879, y: 6, roads: ['PN44', 'PN43', 'P37'] },
  'J62': { x: 879, y: 244, roads: ['PN32', 'PN31', 'P37'] },
  
  'J63': { x: 953, y: 6, roads: ['PN43', 'P38'] },
  'J64': { x: 953, y: 244, roads: ['PN31', 'P38', 'P32'] },
  'J65': { x: 953, y: 309, roads: ['PN29', 'P32', 'P25'] },
  'J66': { x: 953, y: 378, roads: ['PN24', 'P25', 'P21'] },
  'J67': { x: 953, y: 447, roads: ['PN23', 'P21', 'P22'] },
  'J68': { x: 953, y: 510, roads: ['PN21', 'P22', 'P23'] },
  'J69': { x: 953, y: 581, roads: ['PN16', 'P14'] },
  'J70': { x: 953, y: 660, roads: ['PN11', 'P11'] },
  'J71': { x: 953, y: 725, roads: ['PN6', 'P6'] },
  'J72': { x: 953, y: 793, roads: ['PN4', 'P3'] },
  'J73': { x: 953, y: 871, roads: ['PN1', 'P3'] },
};
