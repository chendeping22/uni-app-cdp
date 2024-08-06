export type NewsItemData = any;
export type AlbumItemData = any;
export type VideoItemData = any;

/* 发布状态 */
export enum InformationStatus {
  /* 未发布 */
  Draft = 0,
  /* 已发布 */
  Published = 1,
  /** 定时未发布 */
  TimingDraft = 2,
  /** 定时已发布 */
  TimingPublished = 3,
  /** 下线 */
  Offline = 4,
  /** 审核中 */
  Review = 5,
  /** 已驳回 */
  Rejected = 6,
}

/* 公告类型 ,4-班级相册, 5-班级视频 */
export enum InformationType {
  /* 相册 */
  Album = 4,
  /* 视频 */
  Video = 5,
}
