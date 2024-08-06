import dayjs from 'dayjs';

export const disposeColumn = [
  {
    label: '处置单',
    key: 'code',
  },
  {
    label: '处置日期',
    key: 'disposalTime',
    dataRender: (txt: string) => (txt ? dayjs(txt).format('YYYY-MM-DD') : '/'),
  },
  {
    label: '处置类型',
    key: 'disposalTypeName',
  },
  {
    label: '处置资产',
    key: 'disposalAssetName',
  },
];
