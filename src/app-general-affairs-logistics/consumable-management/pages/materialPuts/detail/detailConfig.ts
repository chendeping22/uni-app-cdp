import { IDetailConfig } from '@/app-general-affairs-logistics/consumable-management/components/DetailCollapse/type';

export const detailConfig: IDetailConfig = {
  realNumFileName: 'realPutNum',
  columns: [
    {
      name: '所属分类',
      key: 'categoryName',
    },
    {
      name: '所属类型',
      key: 'categoryTypeName',
    },
    {
      name: '品牌',
      key: 'brand',
    },
    {
      name: '型号',
      key: 'model',
    },
    {
      name: '规格',
      key: 'size',
    },
    {
      name: '计量单位',
      key: 'unit',
    },
    {
      name: '采购单价（元）',
      key: 'purchasePrice',
    },
    {
      name: '可入库数量',
      key: 'putNum',
    },
    {
      name: '实际入库',
      key: 'realPutNum',
    },
    {
      name: '备注',
      key: 'remark',
    },
  ],
};
