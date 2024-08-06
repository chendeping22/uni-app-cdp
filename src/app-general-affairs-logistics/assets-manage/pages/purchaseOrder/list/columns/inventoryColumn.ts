import dayjs from 'dayjs';

export const inventoryColumn = [
  {
    label: '采购单',
    key: 'code',
  },
  {
    label: '审批时间 ',
    key: 'approveTime',
    dataRender: (txt: string) => (txt ? dayjs(txt).format('YYYY-MM-DD HH:mm:ss') : '/'),
  },
  {
    label: '采购人',
    key: 'purchaseUserName',
  },
  {
    label: '申请器材',
    key: 'assetNameList',
    dataRender: (arr: any) => (arr.length ? arr.join(',') : '/'),
  },
];
