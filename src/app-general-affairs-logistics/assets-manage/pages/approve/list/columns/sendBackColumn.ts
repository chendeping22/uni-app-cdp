import dayjs from 'dayjs';

export const sendBackColumn = [
  {
    label: '退还单',
    key: 'code',
  },
  {
    label: '退还日期',
    key: 'returnDate',
    dataRender: (txt: string) => dayjs(txt).format('YYYY-MM-DD'),
  },
  {
    label: '领用人',
    key: 'returnUserName',
  },
  {
    label: '退还资产',
    key: 'acceptanceReturnAssetName',
  },
];
