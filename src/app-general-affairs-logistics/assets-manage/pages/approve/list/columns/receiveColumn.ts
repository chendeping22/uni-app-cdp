import dayjs from 'dayjs';

export const receiveColumn = [
  {
    label: '领用单',
    key: 'code',
  },
  {
    label: '领用日期',
    key: 'acceptanceDate',
    dataRender: (txt: string) => (txt ? dayjs(txt).format('YYYY-MM-DD') : '/'),
  },
  {
    label: '领用人',
    key: 'acceptanceUserName',
  },
  {
    label: '领用资产',
    key: 'acceptanceAssetName',
  },
];
