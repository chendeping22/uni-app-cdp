import dayjs from 'dayjs';

export const borrowRecord = [
  {
    label: '借用单',
    key: 'code',
  },
  {
    label: '借用日期',
    key: 'borrowDate',
    dataRender: (txt: string) => (txt ? dayjs(txt).format('YYYY-MM-DD') : '/'),
  },
  {
    label: '借用人',
    key: 'borrowUserName',
  },
  {
    label: '借用资产',
    key: 'itemDesc',
  },
];
