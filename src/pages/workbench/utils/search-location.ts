import { IOrganization, IOrganizationInfo } from '@/store/modules/login';

export const searchLocations = (locations: IOrganization[], searchValue: string) => {
  return locations
    .map(item => {
      const locations = filterLocations(searchValue, item.locations);
      return {
        ...item,
        locations,
      };
    })
    .filter(i => i.locations.length);
};

const filterLocations = (value: string, list: IOrganizationInfo[]) => {
  const newList: IOrganizationInfo[] = [];
  list.forEach(item => {
    if (item.name && item.name.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) > -1) {
      let children: IOrganizationInfo[] = [];
      if (item.children && item.children.length > 0) {
        children = filterLocations(value, item.children);
      }
      newList.push({ ...item, children });
    } else if (item.children?.length) {
      const _children = filterLocations(value, item.children);
      if (_children && _children.length > 0) {
        const obj = { ...item, children: _children };
        newList.push(obj);
      }
    }
  });
  return newList;
};
