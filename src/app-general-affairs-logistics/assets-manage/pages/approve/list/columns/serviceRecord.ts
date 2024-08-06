import dayjs from 'dayjs';

export const serviceRecord = [
  {
    label: '维修单',
    key: 'taskCode',
  },
  {
    label: '维修日期',
    key: 'repairTime',
    dataRender: (txt: string) => {
      return txt ? dayjs(txt).format('YYYY-MM-DD') : '/';
    },
  },
  {
    label: '维修金额（元）',
    key: 'repairAmount',
  },
  {
    label: '维修资产',
    key: 'assetName',
  },
];
