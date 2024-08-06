import dayjs from 'dayjs';

export const returnRecord = [
  {
    label: '归还单',
    key: 'code',
  },
  {
    label: '归还日期',
    key: 'returnDate',
    dataRender: (txt: string) => dayjs(txt).format('YYYY-MM-DD'),
  },
  {
    label: '借用人',
    key: 'returnUserName',
  },
  {
    label: '归还资产',
    key: 'assetNameList',
  },
];
