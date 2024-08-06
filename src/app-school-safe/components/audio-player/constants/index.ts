export const enum PlayerStatus {
  NONE, // 未初始化
  CANPLAY, // 待命中
  LOADING, // 加载中
  PLAYING, // 播放中
  PAUSE, // 暂停
  STOP, // 停止
  BUFFERING, // 数据缓冲中
  ENDED, // 播放结束
  ERROR, // 播放错误
}
