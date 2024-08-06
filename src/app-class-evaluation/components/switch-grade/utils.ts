export enum GradeTypeEnum {
  Grade = 0,
  Class = 1,
}

export interface IGradeItem {
  /**
   * 下级
   */
  children?: IGradeItem[];
  /**
   * 年级id、班级id
   */
  id: string;
  /**
   * 年级名称、班级名称
   */
  name: string;
  /**
   * 年级班级类型 0-年级,1-班级
   */
  type: GradeTypeEnum;
}

export const getTreeItemMap = (items: any[], result: {}, parent?: any) => {
  items.forEach((item: any) => {
    const { children, ...rest } = item;
    result[item.id] = {
      ...rest,
      parent,
    };
    if (children?.length) {
      result[item.id].children = children.map(i => {
        const { children: _children, ...rest2 } = i;
        return rest2;
      });
      getTreeItemMap(item.children, result, rest);
    }
  });

  return result;
};
