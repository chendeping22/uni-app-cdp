import dayjs from 'dayjs';

export const repairRecord = [
  {
    label: '报修单',
    key: 'applyCode',
  },
  {
    label: '报修日期',
    key: 'applyTime',
    dataRender: (txt: string) => dayjs(txt).format('YYYY-MM-DD'),
  },
  {
    label: '申请人',
    key: 'applyUserName',
  },
  {
    label: '报修资产',
    key: 'assetName',
  },
];
