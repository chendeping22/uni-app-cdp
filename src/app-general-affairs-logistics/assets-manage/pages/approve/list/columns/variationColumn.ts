import dayjs from 'dayjs';

export const variationColumn = [
  {
    label: '变更单',
    key: 'code',
  },
  {
    label: '申请日期',
    key: 'applyTime',
    dataRender: (txt: string) => (txt ? dayjs(txt).format('YYYY-MM-DD') : '/'),
  },
  {
    label: '申请人',
    key: 'applyUserName',
  },
  {
    label: '变更资产',
    key: 'changeItemListDesc',
  },
];
