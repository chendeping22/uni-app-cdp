import { getCurrentInstance } from 'vue';

/**
 * 组件类名拼接器
 * @description 拼接格式: 组件名-XXX
 * @example const setClassName = useClassName(); return {setClassName};
 * @returns setClassName
 */
export const useClassName = () => {
  const instance = getCurrentInstance();
  const componentName = instance?.type.name || '';
  if (!componentName) {
    uni.showToast({ title: '未设置组件名' });
  }
  /** 以"-"拼接类名, 格式: 组件名-XXX-YYY-ZZZ */
  const setClassName = (...names: string[]) => {
    return [componentName, ...names].join('-');
  };
  return setClassName;
};
