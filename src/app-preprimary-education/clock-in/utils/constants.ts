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

/** 上传图片文件最大限制 */
export const UPLOAD_IMAGE_MAX_SIZE = 50;
/** 小程序图片选择的文件类型 */
export const UPLOAD_IMAGE_DEFAULT_SIZE_TYPE = ['original', 'compressed'];
