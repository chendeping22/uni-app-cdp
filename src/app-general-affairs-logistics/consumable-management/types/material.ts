export interface FileItem {
  fileUrl: string;
  fileName: string;
  id: string;
  fileId: string;
}

export interface Material {
  /**
   * 基础信息主键
   */
  baseId?: string;
  /**
   * 品牌
   */
  brand?: string;
  /**
   * 分类
   */
  category?: string;
  /**
   * 分类id-大类
   */
  categoryId?: number;
  /**
   * 类型
   */
  categoryType?: string;
  /**
   * 类型id-小类
   */
  categoryTypeId?: number;
  id: string;
  /**
   * 型号
   */
  model?: string;
  /**
   * 耗材名称
   */
  name: string;
  /**
   * 耗材编号
   */
  no: string;
  /**
   * 参考单价
   */
  price?: number;
  /**
   * 采购单号
   */
  purchaseCode?: string;
  /**
   * 采购单ID
   */
  purchaseId?: number;
  /**
   * 采购单价
   */
  purchasePrice?: string;
  /**
   * 采购备注
   */
  purchaseRemark?: string;
  /**
   * 采购人信息
   */
  purchaseUserInfo?: string;
  /**
   * 可入库数量
   */
  putNum?: string;
  /**
   * 申请数量
   */
  requestNum?: string;
  /**
   * 申请备注
   */
  requestRemark?: string;
  /**
   * 规格
   */
  size?: string;
  /**
   * 计量单位
   */
  unit?: string;
  [property: string]: any;
}

export enum SelectorTypeEnum {
  /** 选择器 - 基础信息列表 （采购用） */
  base = 'base',
  /** 选择器 - 采购列表 (入库用) */
  purchase = 'purchase',
  /** 选择器 - 入库列表 (出库用) */
  warehouse = 'warehouse',
}

/** 耗材入库、出库，耗损出库、耗材退库数据类型 */
export interface IMaterialState {
  id?: string;
  code?: string;
  applyUser?: string;
  applyUserId?: string;
  departmentId?: string;
  departmentName?: string;
  deptId?: string;
  deptName?: string;
  time?: string;
  storeId?: string;
  storeName?: string;
  remark?: string;
  applyTime?: string | number;
  createTime?: string | number;
  items?: any[];
  status?: string | number;
}

export interface IMaterialEnterParams {
  emptyTxt?: string;
  countLabel?: string;
  remarkLabel?: string;
  remarkName?: string;
  countFileName?: string;
  type?: string;
  priceLabel?: string;
  showPrice?: boolean;
  limitField?: string;
}
