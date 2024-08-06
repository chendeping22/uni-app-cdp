import { useMaterialSelector } from '../../store/useMaterialSelector';
import { Material, SelectorTypeEnum } from '../../types/material';

interface ShowSelectorParams {
  value?: string[] | Material[];
  /**
   * 选择器数据源
   * @SelectorTypeEnum
   */
  type?: SelectorTypeEnum;
  /**
   * 不可操作的 id 列表
   */
  disabledIds?: string[];
  /**
   * 需要过滤的 id 列表
   */
  excludeIds?: string[];
  /**
   * 接口参数
   */
  apiQuery?: Record<string, any>;
  /**
   * 限制选中数量
   */
  limitCount?: number;
  callback: (value: Material[]) => void;
}

export default function ({
  value,
  disabledIds,
  excludeIds,
  apiQuery,
  limitCount,
  type,
  callback,
}: ShowSelectorParams) {
  const store = useMaterialSelector();
  const selectedValue: Record<string, Material> = {};
  const idKey = type === SelectorTypeEnum.base ? 'baseId' : 'id';

  if (value && Array.isArray(value)) {
    value?.forEach(item => {
      if (typeof item === 'string') {
        selectedValue[item] = { id: item } as any;
      } else {
        selectedValue[item[idKey] || item.id] = item;
      }
    });
  }

  store.$set({ value: selectedValue, disabledIds, excludeIds, apiQuery, limitCount, type });

  uni.navigateTo({
    url: '/app-general-affairs-logistics/consumable-management/pages/material-selector/index?type=',
    events: {
      acceptDataFromMaterialSelectorPage: (data: Record<string, Material>) => {
        if (typeof callback === 'function') {
          // const valueArray: string[] = [];
          const dataArray: Material[] = [];
          Object.entries(data).forEach(item => {
            // valueArray.push(item[0]);
            dataArray.push({
              ...item[1],
            });
          });
          callback(dataArray);
        }
      },
    },
  });
}
