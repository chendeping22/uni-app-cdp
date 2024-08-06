import data from './data.min.json';
import { Area } from './types';

export const getAreasTree = (): Area[] => {
  const t = (list: any[], parentPath = []) => {
    return list.map(item => {
      const obj: any = {
        areaName: item.n,
        postalCode: item.c,
        namePath: [...parentPath, item.n],
      };
      if (item.s?.length) {
        obj.subAreas = t(item.s, obj.namePath);
      }
      return obj;
    });
  };
  return t(data);
};
