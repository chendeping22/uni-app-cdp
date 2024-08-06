export type TopicUrls =
  | 'center/device'
  | 'msg/exception'
  | 'widget/statusBySpaceAndSystem'
  | 'widget/abnormal'
  | 'widget/alarm'
  | 'widget/defense'
  | 'center/device'
  | 'sas/screen'
  | 'fault/record'
  | 'alarm/record'
  | 'parkingPlace/gateStatus'
  | 'log/main'
  | 'log/detail'
  | 'person/monitor/records'
  | 'actionCallback/device'
  | 'space_device/status'
  | 'patrol/detail'
  | 'patrol/space'
  | 'notify/systemMessage'
  | 'notify/requestUnreadNum'
  | 'traffic/teacher'
  | 'traffic/parent'
  | 'campus/recordControlResult'
  | 'campus/live'
  | 'campus/livePersonnelBehavior'
  | 'campus/tour/clazz'
  | 'campus/recordControlResult' //云上课堂-录播控制结果;
  | 'campus/recordingDevice/info' // 录播设备信息变更;
  | 'campus/comment/notify' // 直播课-评论
  | 'notify/msgUnreadByAccount'
  | 'todoCenter/todoNums'
  | 'notify/mobileBannerPublish';

type Topics = {
  CENTER_DEVICE: TopicUrls;
  SAS_SCREEN: TopicUrls;
  FAULT_RECORD: TopicUrls;
  ALARM_RECORD: TopicUrls;
  PARKING_PLACE_GATE_STATUS: TopicUrls;
  LOG_MAIN: TopicUrls;
  LOG_DETAIL: TopicUrls;
  PERSON_MONITOR_RECORDS: TopicUrls;
  ACTION_CALLBACK_DEVICE: TopicUrls;
  SPACE_DEVICE_STATUS: TopicUrls;
  PATROL_DETAIL: TopicUrls;
  PATROL_SPACE: TopicUrls;
  SYSTEM_MESSAGE_NOTIFY: TopicUrls;
  UNREAD_MESSAGE_NUM_NOTIFY: TopicUrls;
  TOPIC_TRAFFIC_TEACHER: TopicUrls;
  TOPIC_TRAFFIC_PARENT: TopicUrls;
  RECORD_CONTROL_RESULT: TopicUrls;
  TOPIC_LIVE: TopicUrls;
  CLOUD_LIVE: TopicUrls;
  CLOUD_LIVE_BEHAVIOR: TopicUrls;
  CAMPUS_TOUR_CLAZZ: TopicUrls;
  RECORD_CONTROL: TopicUrls;
  RECORD_DEVICE_INFO: TopicUrls;
  TODO_NUMS: TopicUrls;
  [topic: string]: TopicUrls;
};

const MQTT_TOPICS: Topics = {
  deviceStatus: 'center/device', // 设备状态通知
  msgException: 'msg/exception', // 系统异常
  widgetDeviceStatusTopic: 'widget/statusBySpaceAndSystem', // 启用推送widget设备信息(widgetShow使用)
  widgetAbnormalTopic: 'widget/abnormal', // 启用推送widget异常信息(widgetShow使用)
  widgetAlarmTopic: 'widget/alarm', // 启用推送widget异常信息(widgetShow使用)
  widgetDefenseTopic: 'widget/defense', // 启用推送布撤防信息(widgetShow使用)

  // 以下启用的主题
  CENTER_DEVICE: 'center/device', // 设备状态通知
  SAS_SCREEN: 'sas/screen', // SAS大屏人脸推送
  FAULT_RECORD: 'fault/record', // 设备故障告警弹窗
  ALARM_RECORD: 'alarm/record', // 系统自定义告警
  PARKING_PLACE_GATE_STATUS: 'parkingPlace/gateStatus', // 闸口实时监控推送
  LOG_MAIN: 'log/main', // 主记录日志结果推送
  LOG_DETAIL: 'log/detail', // 明细记录日志结果推送
  PERSON_MONITOR_RECORDS: 'person/monitor/records', // 安防布控未处理记录
  ACTION_CALLBACK_DEVICE: 'actionCallback/device', // 方法回调
  SPACE_DEVICE_STATUS: 'space_device/status', // 空间设备状态主题
  PATROL_DETAIL: 'patrol/detail', // 设备巡检结果推送
  PATROL_SPACE: 'patrol/space', // 空间巡检结果推送
  SYSTEM_MESSAGE_NOTIFY: 'notify/systemMessage', // 全局消息通知
  UNREAD_MESSAGE_NUM_NOTIFY: 'notify/requestUnreadNum', // 接收mqtt，请求更新未读消息数
  TRAFFIC_TEACHER: 'traffic/teacher', // 教师端校车行车推送
  TRAFFIC_PARENT: 'traffic/parent', // 家长端校车行车推送
  RECORD_CONTROL_RESULT: 'campus/recordControlResult', // 录播控制结果
  TOPIC_LIVE: 'campus/livePersonnelBehavior', // 云上课堂，参与者页面推送
  CLOUD_LIVE: 'campus/live', //直播操作
  CLOUD_LIVE_BEHAVIOR: 'campus/livePersonnelBehavior', //直播行为
  CAMPUS_TOUR_CLAZZ: 'campus/tour/clazz', // 实时巡课-课堂状态变化
  RECORD_CONTROL: 'campus/recordControlResult', //云上课堂-录播控制结果
  RECORD_DEVICE_INFO: 'campus/recordingDevice/info', // 录播设备信息变更
  CAMPUS_COMMENT_NOTIFY: 'campus/comment/notify', // 直播课-评论
  MSG_UNREAD_BY_ACCOUNT: 'notify/msgUnreadByAccount', //组织列表未读消息
  MOBILE_BANNER_PUBLISH: 'notify/mobileBannerPublish', //banner订阅
  TODO_NUMS: 'todoCenter/todoNums', // 待办数量
};

export default MQTT_TOPICS;
