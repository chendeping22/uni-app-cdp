export const detailConfig = (type: string) => {
  return {
    realNumFileName: 'requestNum',
    columns: [
      {
        name: '所属分类',
        key: 'category',
      },
      {
        name: '所属类型',
        key: 'categoryType',
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
        name: '参考单价（元）',
        key: 'price',
      },
      ...(type === '1'
        ? [
            {
              name: '数量',
              key: 'requestNum',
            },
            {
              name: '备注',
              key: 'requestRemark',
            },
          ]
        : [
            {
              name: '申请数量',
              key: 'requestNum',
            },
            {
              name: '申请备注',
              key: 'requestRemark',
            },
            {
              name: '采购单价（元）',
              key: 'purchasePrice',
            },
            {
              name: '采购备注',
              key: 'purchaseRemark',
            },
          ]),
    ],
  };
};
