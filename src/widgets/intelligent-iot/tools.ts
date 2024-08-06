/**
 * 设备图标
 * @description 默认是deviceType加前缀'icon_', 特殊的除外
 * @param deviceType
 * @returns
 */
export const DeviceIconMap = (deviceType: string) => {
    // 已有的设备图标, 需要跟踪iconfont更新
    const existDeviceIcon = [
      'AccessControl',
      'AirCondition',
      'AirSensor',
      'AirSwitch',
      'AlarmButton',
      'AlarmHost',
      'Ammeter',
      'Barrier',
      'Bridge',
      'DoorSensor',
      'Elevator',
      'Exchanger',
      'FaceAccess',
      'FingerprintLock',
      'FireAlarmHost',
      'FrontEndProcessor',
      'Gateway',
      'IECGateway',
      'IPC',
      'IrArray',
      'IrControl',
      'LEDScreen',
      'Light',
      'Modbus',
      'NVR',
      'PirAlarm',
      'PirSensor',
      'Projector',
      'Remote',
      'RemoteControl',
      'SmartPanel',
      'SmokeAlarm',
      'Socket',
      'Sound',
      'SprayThrower',
      'Switch',
      'Trumpet',
      'VGateway',
      'VehicleLocate',
      'WaterMeter',
      'WindowCovering',
      'banpai',
      'baojingzhuji',
      'baojzhujizishebei',
      'camera',
      'common',
      'dianbiao',
      'mandunzhinengdianqitanceqi',
      'menjin',
      'peidianxiang',
      'renlianbiduifuwuqi',
      'shengGuang',
      'shoudong',
      'shuiWei',
      'shuibiao',
      'yaLi',
      'yanGan',
      'Smart_plug',
    ];
    if (['ClassroomLight', 'BlackboardLight'].includes(deviceType)) return 'icon_Light';
    if (!existDeviceIcon.includes(deviceType)) return 'icon_common';
    return `icon_${deviceType}`;
  };
  