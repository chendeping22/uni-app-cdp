import dayjs from 'dayjs';

export const putColumn = [
  {
    label: '入库单',
    key: 'code',
  },
  //   {
  //     label: '入库类型',
  //     key: 'applyUserName',
  //     dataRender: (txt: string) => '采购入库',
  //   },
  {
    label: '申请日期',
    key: 'applyDate',
    dataRender: (txt: string) => (txt ? dayjs(txt).format('YYYY-MM-DD') : '/'),
  },
  {
    label: '申请人',
    key: 'applyUserName',
  },
  {
    label: '申购资产',
    key: 'assetPutItemsDesc',
  },
];
