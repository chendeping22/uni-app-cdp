export interface LockState {
  title: string;
  deviceOrGroup: boolean;
  powerSwitch: ILockSelect | undefined; // 开关
  mode: ILockSelect | undefined; // 模式
  temperature: ILockTemperature | undefined; // 温度
}

export interface DeviceAirCondition {
  deviceName: string;
  uuid: string;
  onlineStatus: string;
  onOffStatus: number;
  isLocked: number; // 是否锁定 1上锁 0不锁
  spaceFullName: string;
  props: any[];
}

export interface GroupAirCondition {
  id: string;
  groupName: string;
  updateTime: number;
}

export interface ILabelValue {
  label: string;
  value: number;
}

export interface IPickerState {
  flag: number;
  show: boolean;
  title: string;
  options: any[];
}

interface IPropBase {
  name: string;
  code: string;
}

export interface IPropTemperature extends IPropBase {
  current: number;
  min: number;
  max: number;
}

export interface IPropSwitch extends IPropBase {
  onOff: boolean;
}

export interface IPropSelect extends IPropBase {
  current: ILabelValue | null;
  options: ILabelValue[];
}

export interface ILockTemperature extends IPropBase {
  current: string | null;
  switch: boolean;
  min: number;
  max: number;
  originalValue: string | null;
}

export interface ILockSelect extends IPropBase {
  current: ILabelValue | null;
  options: ILabelValue[];
  originalValue: number | null;
}

export interface ILockSwitch extends IPropBase {
  onOff: boolean | null;
  originalValue: boolean | null;
}
