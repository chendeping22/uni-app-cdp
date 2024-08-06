export const uGetDom = (instance: any, selector: string) => {
  return new Promise<Required<UniApp.NodeInfo>>(resolve => {
    uni
      .createSelectorQuery()
      .in(instance)
      .select(selector)
      .boundingClientRect((ret: any) => {
        resolve(ret);
      })
      .exec();
  });
};

export const uGetDoms = (instance: any, selector: string) => {
  return new Promise<Required<UniApp.NodeInfo>[]>(resolve => {
    uni
      .createSelectorQuery()
      .in(instance)
      .selectAll(selector)
      .boundingClientRect(ret => {
        resolve(ret as any[]);
      })
      .exec();
  });
};
