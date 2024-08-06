export enum AssetsTabEnum {
  /**资产信息 */
  AssetInfo = 1,
  /**资产履历 */
  AssetRecord = 2,
  /**附件信息 */
  FileInfo = 3,
}

export interface IAssetInfo {
  /**资产名称 */
  assetName?: string;
  /** 资产编号 */
  assetNo?: string;
  /** 状态名称 */
  assetStatusShow?: string;
  /** 状态 */
  assetStatus?: string;
  /** 领用人 */
  recipientName?: string;
  /** 领用人头像 */
  recipientHeadImgUrl?: string;
  /** 使用部门 */
  defaultBelongName?: string;
  /** 用户领用、借用审批通过时间 */
  finalDate?: string;
}

export interface IInfoImg {
  fileId?: string;
  fileUrl?: string;
}
export interface IAssetMeans {
  fileId?: string;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
}

export interface IDetailData {
  /** 详情id */
  assetId?: string;
  /** 资产图片列表 */
  assetInfoImgVOList?: IInfoImg[];
  /** 附件信息 */
  assetMeansList?: IAssetMeans[];
  /** 资产信息-基础信息 */
  baseInfoMap?: Record<string, any>;
  /** 资产信息- 资产参数*/
  assetParamMap?: Record<string, any>;
  /** 资产信息-其他 */
  otherParamMap?: Record<string, any>;
  /** 是否为资产管理员 1-是，0-否 */
  isAdmin?: number;
}

export interface IBizInfo {
  label?: string;
  from?:
    | {
        imgUrl?: string;
        name?: string;
      }
    | string;
  to?:
    | {
        imgUrl?: string;
        name?: string;
      }
    | string;
}
/** 资产履历项 */
export interface IRecordItem {
  id: number;
  /** id */
  assetId?: string;
  /** 头像 */
  headImgUrl?: string;
  /** 人员 */
  createByName?: string;
  /** 日期 */
  createTime?: string;
  /** 状态 */
  bizType?: string;
  /** 状态名称 */
  bizTypeName?: string;
  /** 履历记录 */
  bizInfo: IBizInfo[];
}
