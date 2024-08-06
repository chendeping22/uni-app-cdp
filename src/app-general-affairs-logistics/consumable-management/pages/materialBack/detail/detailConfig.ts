import { IDetailConfig } from '@/app-general-affairs-logistics/consumable-management/components/DetailCollapse/type';

export const detailConfig: IDetailConfig = {
  realNumFileName: 'backNum',
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
      name: '所属仓库',
      key: 'storeName',
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
      name: '领用数量',
      key: 'outNum',
    },
    {
      name: '退库数量',
      key: 'backNum',
    },
    {
      name: '备注',
      key: 'remark',
    },
  ],
};
