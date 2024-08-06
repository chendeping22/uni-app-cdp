export interface Area {
  areaName: string;
  postalCode: string;
  namePath: string[];
  subAreas: Area[];
}
