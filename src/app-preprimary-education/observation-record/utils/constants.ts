interface IOpreItem {
  label: string;
  value: string;
  icon: string;
  url?: string;
}
export enum SupportedMedia {
  Video = 'video',
  Image = 'image',
}
export interface Media {
  kind: SupportedMedia;
  name: string;
  url: string;
}
/** 资源类型 */
export const SourceType = [
  {
    label: '图片',
    value: 1,
  },
  {
    label: '视频',
    value: 2,
  },
];

export const DetailSourceType: Record<any, any> = {
  1: '手动上传',
  2: '设备采集',
  3: '观察记录',
};

export const OperateOptions: IOpreItem[] = [
  {
    label: '推送',
    icon: 'icon_export',
    value: 'push',
  },
  {
    label: '还原',
    icon: 'icon_refresh',
    value: 'revert',
  },
  {
    label: '编辑',
    icon: 'icon_edit',
    value: 'detail',
  },
  {
    label: '保存',
    icon: 'icon_download',
    value: 'save',
  },
  {
    label: '删除',
    icon: 'icon_delete',
    value: 'delete',
  },
];

export type IPageType = 'timeset' | 'observe' | 'sourceLib' | 'revert' | 'editInfo';

/** 时光印象的页面类型 */
export interface IPageTimeSetType {
  /** 学生id */
  id: string;
  /** 页面类型 */
  type: IPageType;
  observeTaskId?: string;
  taskId: string;
  studentId: string;
  studentName?: string;
}

export const DeleteOptions = [
  {
    label: '当前页面删除',
    value: 0,
    desc: '所选文件只在当前页移除，不影响其他关联页面展示；可在资源库中重新添加',
  },
  {
    label: '资源库删除',
    value: 1,
    desc: '删除后其他使用所选文件的地方也将同步删除，删除的文件可在10天内通过回收站还原',
  },
];

/** 上传图片文件最大限制 */
export const UPLOAD_IMAGE_MAX_SIZE = 50;
/** 小程序图片选择的文件类型 */
export const UPLOAD_IMAGE_DEFAULT_SIZE_TYPE = ['original', 'compressed'];
