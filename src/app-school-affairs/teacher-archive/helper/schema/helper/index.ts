import type { FieldsGroup, Group, TabsGroup } from '../../../types/schema.ts';

export const isFieldsGroup = (group: Group): group is FieldsGroup => {
  return !!(group as FieldsGroup).fields;
};

export const isTabsGroup = (group: Group): group is TabsGroup => {
  return !!(group as TabsGroup).groups;
};
