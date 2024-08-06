import { ISpaceTree } from '@/app-intelligent-iot/services/space';
import { each, isEmpty } from '@/utils/lodash-es';
import {
  ILabelValue,
  ILockSelect,
  ILockTemperature,
  IPropSelect,
  IPropSwitch,
  IPropTemperature,
} from './AirConditionType';

export const parseDisplayProp = (prop: any) => {
  const displayValue = prop?.displayValue;
  // console.log(
  //   `${prop?.name} displayValue:${displayValue} ${isEmpty(displayValue)} ${displayValue == null}`,
  // );
  if (displayValue != null) {
    const unit = prop?.unit;
    return isEmpty(unit) ? displayValue : displayValue + unit;
  }
  return '';
};

export const parseSelectProp = (prop: any, defName: string): IPropSelect => {
  const list = prop.allowedValues as [];

  const options = list.map((item: any): ILabelValue => {
    return {
      label: item.name,
      value: item.value,
    };
  });
  const res: IPropSelect = {
    code: prop.code,
    name: prop.name || defName,
    current: null,
    options,
  };
  if (prop.value != null) {
    res.current = {
      label: prop.displayValue || '',
      value: prop.value,
    };
  }
  return res;
};

export const parseSwitchProp = (prop: any, defName: string): IPropSwitch => {
  return {
    code: prop.code,
    name: prop.name || defName,
    onOff: prop.value == 1,
  };
};

export const parseTemperatureProp = (prop: any): IPropTemperature => {
  let min = 16;
  let max = 30;
  try {
    min = parseInt(prop.minValue);
    max = parseInt(prop.maxValue);
  } catch (error) {}
  return {
    code: prop.code,
    name: prop.name || '温度',
    current: prop.value || 26,
    min: min || 16,
    max: max || 30,
  };
};

export const parseSelectLock = (prop: any, defName: string): ILockSelect => {
  const list = prop.allowedValues as [];

  const options = list.map((item: any): ILabelValue => {
    return {
      label: item.name,
      value: item.value,
    };
  });
  const res: ILockSelect = {
    code: prop.code,
    name: prop.name || defName,
    current: null,
    originalValue: null,
    options,
  };
  if (prop.value != null) {
    res.current = {
      label: prop.displayValue || '',
      value: prop.value == null ? -1 : prop.value || 0,
    };
    res.originalValue = res.current.value;
  }
  return res;
};

export const parseTemperatureLock = (prop: any): ILockTemperature => {
  let min = 16;
  let max = 30;
  try {
    if (prop.minValue) {
      min = parseInt(prop.minValue);
    }
    if (prop.maxValue) {
      max = parseInt(prop.maxValue);
    }
  } catch (error) {}
  const value = prop.value;
  return {
    code: prop.code,
    name: prop.name || '温度锁定',
    current: value,
    originalValue: value,
    switch: value != null && value != '-1',
    min: min || 16,
    max: max || 30,
  };
};

export const parseRangeByStr = (strRange: string) => {
  try {
    if (isEmpty(strRange) || strRange == '-1') return null;
    const split = strRange.split('-');
    if (split.length != 2) return null;

    const min = parseInt(split[0]);
    const max = parseInt(split[1]);
    if (isNaN(min) || isNaN(max)) return null;

    return [min, max];
  } catch (error) {}
  return null;
};

//#region 空间

/**
 * 深度优先遍历，如果func返回false，则不继续往下遍历
 * @param nodes
 * @param func
 */
function walk(nodes: any[], func: (node: any) => boolean | void) {
  each(nodes, n => {
    if (func(n) !== false && n.children.length > 0) {
      walk(n.children, func);
    }
  });
}

/**
 * 深度优先在树中查找首个有权限空间
 */
export const findFirstPermissionSpace = (treeData: ISpaceTree[]) => {
  let found: ISpaceTree | null = null;

  treeData.forEach((root: ISpaceTree) => {
    if (found) {
      return;
    }

    if (root.permission === '1') {
      found = root;
      return;
    }

    deepFirstIterate(root.children, (n: ISpaceTree) => {
      if (found) {
        return false;
      }

      if (n.permission === '1') {
        found = n;
        return false;
      }
    });
  });

  return found;
};

/** 获取节点的嫡系枝条 */
export const getNodeBranch = <T = any>(id: string, treeNodes: any[]) => {
  const branch: T[] = [];
  treeNodes.some(t => {
    if (t.id === id) {
      branch.push(t);
      return true;
    }
    if (t.children?.length) {
      const g = getNodeBranch(id, t.children);
      if (g.length) {
        branch.push(...[t].concat(g));
        return true;
      }
    }
    return false;
  });
  return branch;
};

//#endregion
