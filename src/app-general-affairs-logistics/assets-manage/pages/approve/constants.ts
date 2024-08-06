import { RecordTypeEnum } from '@/app-general-affairs-logistics/assets-manage/utils/constants';

/** 底部按钮配置 */
export const bottomBtn: Record<number, any> = {
  [RecordTypeEnum.ReceiveRecord]: {
    name: '新建领用单',
    url: '/app-general-affairs-logistics/assets-manage/pages/receive/index',
  },
  [RecordTypeEnum.SendBackRecord]: {
    name: '新建退还单',
    url: '/app-general-affairs-logistics/assets-manage/pages/sendBack/index',
  },
  [RecordTypeEnum.BorrowRecord]: {
    name: '新建借用单',
    url: '/app-general-affairs-logistics/assets-manage/pages/borrow/index',
  },
  [RecordTypeEnum.ReturnRecord]: {
    name: '新建归还单',
    url: '/app-general-affairs-logistics/assets-manage/pages/back/index',
  },
  [RecordTypeEnum.RepairRecord]: {
    name: '新建报修单',
    url: '/app-general-affairs-logistics/assets-manage/pages/repair/index',
  },
  [RecordTypeEnum.ServiceRecord]: {
    name: '新建维修单',
    url: '',
  },
  [RecordTypeEnum.VariationRecord]: {
    name: '新建变更单',
    url: '/app-general-affairs-logistics/assets-manage/pages/variation/index',
  },
  [RecordTypeEnum.DisposeRecord]: {
    name: '新建处置单',
    url: '/app-general-affairs-logistics/assets-manage/pages/dispose/index',
  },
  [RecordTypeEnum.PutRecord]: {
    name: '新建处置单',
    url: '',
  },
};

export const commonTabs = [
  {
    name: '领用单',
    key: RecordTypeEnum.ReceiveRecord,
  },
  {
    name: '退还单',
    key: RecordTypeEnum.SendBackRecord,
  },
  {
    name: '借用单',
    key: RecordTypeEnum.BorrowRecord,
  },
  {
    name: '归还单',
    key: RecordTypeEnum.ReturnRecord,
  },
  {
    name: '报修单',
    key: RecordTypeEnum.RepairRecord,
  },
];

/** 超管菜单 */
export const adminTabs = [
  {
    name: '维修单',
    key: RecordTypeEnum.ServiceRecord,
  },
  {
    name: '变更单',
    key: RecordTypeEnum.VariationRecord,
  },
  {
    name: '处置单',
    key: RecordTypeEnum.DisposeRecord,
  },
  {
    name: '入库单',
    key: RecordTypeEnum.PutRecord,
  },
];
