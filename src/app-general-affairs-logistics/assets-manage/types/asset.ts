interface FileItem {
  fileUrl: string;
  fileName: string;
  id: string;
  fileId: string;
}

interface Asset {
  id: string;
  /** 图片 */
  assetInfoImgVOList: FileItem[];
  assetInfoQRCodeVO: any;
  /** 选择资产的时候用的 */
  assetId: string;
  assetNo: string;
  assetName: string;
  assetSize: string;
  assetUnit: string;
  spaceId?: string;
  brand?: string;
  assetModel?: string;
  arrivalDate?: string;
  spaceName?: string;
  subject?: string;
  subjectShow?: string;
  assetStatus: string | number;
  assetStatusShow: string;
  /** 使用人信息 */
  recipientId?: string;
  recipientName?: string;
  recipientHeadImg?: string;
  /** 附件 */
  assetMeansList: FileItem[];
}

export enum AssetStatusEnum {
  /** 闲置 */
  IDLE = 0,
  /** 在用 */
  IN_USE,
  /** 借用 */
  BORROWED,
  /** 审批中 */
  UNDER_REVIEW,
  /** 维修中 */
  UNDER_REPAIR,
  /** 调拨中 */
  BEING_TRANSFERRED,
  /** 已处置 */
  DISPOSED,
  /** 已报废 */
  SCRAPPED,
}

export type { Asset };
