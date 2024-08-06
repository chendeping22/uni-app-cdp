import { forEach } from 'lodash-es';
import { ref } from 'vue';
import { getDictionaries } from '../api/dictionaries';

/**
 * 获取字典数据
 * @param codes 字典编码
 */
export const useDictionaries = (codes: string[]) => {
  const dictionaries = ref<Record<string, any[]>>({});
  (async () => {
    const res: any = await getDictionaries(codes);
    dictionaries.value = res;
  })();
  return dictionaries;
};

export const getLabel = (value: string, list: any[]) => {
  let result = '';
  const traverse = (arr: any[]) => {
    forEach(arr, i => {
      if (i.value === value) {
        result = i.label;
      } else {
        traverse(i.children);
      }
      return !result;
    });
  };
  traverse(list);
  return result;
};
