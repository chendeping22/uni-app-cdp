export const enum CallStatusEnum {
  NONE = -2, // 未初始化
  CANCALL = -1, // 待命中
  FREE = 0, // 空闲
  DIALING = 1, // 接通中
  LINKED = 2, // 通话中
  BUSY = 3, // 忙音
  HANGUP = 4, // 挂断
}
