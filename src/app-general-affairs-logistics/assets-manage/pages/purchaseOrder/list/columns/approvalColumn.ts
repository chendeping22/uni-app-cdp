import dayjs from 'dayjs';

export const approvalColumn = [
  {
    label: '采购单',
    key: 'code',
  },
  {
    label: '申请日期',
    key: 'applicationTime',
    dataRender: (txt: string) => (txt ? dayjs(txt).format('YYYY-MM-DD') : '/'),
  },
  {
    label: '申请人',
    key: 'applicationUserName',
  },
  {
    label: '采购状态',
    key: 'purchaseStatus',
    dataRender: (num: number, record: any) =>
      !record.applicationStatus ||
      record.applicationStatus == 0 ||
      record.status == 3 ||
      record.status == 4
        ? '无'
        : num == 1
        ? '未采购'
        : '已采购',
  },
  {
    label: '申请器材',
    key: 'assetNameList',
    dataRender: (arr: any) => (arr.length ? arr.join(',') : '/'),
  },
];
