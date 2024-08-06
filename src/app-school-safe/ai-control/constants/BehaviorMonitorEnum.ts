export enum BehaviorMonitorEnum {
  AREA_INVASION = 'Area:Invasion', // 区域入侵
  LINGER_ABOUT = 'Linger:About', // 定点徘徊
  PERSONNEL_CONGESTION = 'Personnel:Congestion', // 人员拥堵
  NONSTANDARD_KITCHEN = 'Nonstandard:Kitchen', // 厨房不规范
  SMOKING_ALARM = 'Smoking:Alarm', // 吸烟告警
  CHANNEL_BLOCKAGE = 'Channel:Blockage', // 通道堵塞
  ILLEGAL_STOP = 'Illegal:Stop', // 车辆违停
  LEAVE_WORKPLACE = 'Leave:WorkPlace', // 离岗告警
  LIEDOWN_ALARM = 'LieDown:alarm', // 人员跌倒
  ANIMAL_ALARM = 'Animal:alarm', // 宠物识别
  NOT_WEAR_MASK = 'Not:Wear:Mask', // 不佩戴口罩
  WITHOUT_PERMISSION = 'Without:Permission', // 未授权进入
  ANTI_BULLYING_MONITORING = 'Anti:Bullying:Monitoring', // 防欺凌监测
  FIGHT_MONITOR = 'Fight:Monitor', // 智能布控-疑似打架
  VIOLENCE_DETECT = 'Violence:Detect', // AI布控-疑似打架
  CLIMBING_DETECTION = 'Climbing:Detection', // 攀爬检测
  OVER_WALL_DETECTION = 'Over:Wall:Detection', // 翻墙检测
  CHAIR_DETECTION = 'Chair:Detection', // AI布控-椅子检测
  RUNNING_DETECTION = 'Running:Detection', // 奔跑检测
  CHASE_DETECTION = 'Chase:Detection', // AI布控-追逐检测
}
