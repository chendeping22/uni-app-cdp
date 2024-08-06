export interface IBasicInfoParent {
  name: string;
  key: string;
  columns: Record<string, any>[];
  children?: Record<string, any>[];
}

export interface IBasicInfoChildren {
  name: string;
  key: string;
  value?: string;
}

export const getBaseInfo = (isAdmin: boolean) => {
  /** 基础信息 */
  const basicColumns = [
    {
      name: '所属类型',
      key: 'equipmentType',
    },
    {
      name: '所属空间',
      key: 'spaceName',
    },
    {
      name: '适用学科',
      key: 'subjectShow',
    },
    {
      name: '存放位置',
      key: 'place',
    },
    {
      name: '购置日期',
      key: 'purchaseDate',
    },
    {
      name: '入库日期',
      key: 'arrivalDate',
    },
    {
      name: '质保日期',
      key: 'warrantyDate',
    },
    ...(isAdmin
      ? [
          {
            name: '经费类型',
            key: 'fundsTypeName',
          },
        ]
      : []),
    {
      name: '使用方向',
      key: 'useDestination',
    },
    {
      name: '备注',
      key: 'remark',
    },
  ];

  /** 资产参数 */
  const assetParamsColumn = [
    {
      name: '规格',
      key: 'assetSize',
    },
    {
      name: '型号',
      key: 'assetModel',
    },
    {
      name: '单位',
      key: 'assetUnit',
    },
    ...(isAdmin
      ? [
          {
            name: '编码SN',
            key: 'assetSn',
          },
        ]
      : []),
    {
      name: '通讯协议',
      key: 'protocol',
    },
    ...(isAdmin
      ? [
          {
            name: 'MAC地址',
            key: 'mac',
          },
        ]
      : []),
  ];
  /** 其他 */
  const otherColumn = [
    ...(isAdmin
      ? [
          {
            name: '单价(元)',
            key: 'price',
          },
        ]
      : []),

    {
      name: '品牌',
      key: 'brand',
    },
    ...(isAdmin
      ? [
          {
            name: '供应商',
            key: 'supplierName',
          },
          {
            name: '供应商联系方式',
            key: 'supplierTel',
          },
          {
            name: '厂家名称',
            key: 'manufactureName',
          },
          {
            name: '厂家联系方式',
            key: 'manufactureTel',
          },
          {
            name: '厂家型号',
            key: 'manufactureModel',
          },
        ]
      : []),
    {
      name: '主要功能',
      key: 'features',
    },
    {
      name: '使用说明',
      key: 'instructions',
    },
    {
      name: '关键技术',
      key: 'technology',
    },
    {
      name: '样本检测注意事项',
      key: 'sampleAttention',
    },
  ];
  return { basicColumns, assetParamsColumn, otherColumn };
};
