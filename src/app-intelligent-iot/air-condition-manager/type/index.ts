export type TLockRecord = {
  id: string;
  status: number; // 执行结果：-1 执行中 0 失败 1 成功
  createName: string; // 操作人
  deviceName: string; // 设备名称
  controlWay: number; // 控制方式
  controlWayDesc: string; // 控制方式
  originDesc: string; // 控制来源
  startTime: number; // 操作时间
  reportTime: number; // 上报时间
  propCodeRemark: string; // 控制内容
}

export type TGroupRecord = {
  id: string;
  status: number; // 执行结果：-1 执行中 0 失败 1 成功
  createName: string; // 操作人
  controlWay: number; // 控制方式
  controlWayDesc: string; // 控制方式
  originDesc: string; // 控制来源
  startTime: number; // 操作时间
  taskList: {
    deviceName: string;
    status: number;
    failCode: string;
  }[];
}

export enum CTRL_WAY {
  Group = 3,
  Lock = 6,
}