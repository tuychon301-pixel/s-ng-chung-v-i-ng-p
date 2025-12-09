
export enum Region {
  Pink = 'pink',
  Blue = 'blue',
  Green = 'green',
}

export type RegionData = {
  name: string;
  roadIds: string[];
};

export type RegionInfoCache = {
  [key in Region]?: RegionData;
};

export type WaterLevelRecord = {
  id: string;
  time: string;
  level: 0 | 1 | 2 | 3;
};
