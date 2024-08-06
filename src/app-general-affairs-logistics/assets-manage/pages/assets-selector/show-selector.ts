import { useAssetsSelector } from '../../store/useAssetsSelector';
import { Asset } from '../../types/asset';

interface ShowSelectorParams {
  value?: string[] | Asset[];
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
  callback: (value: Asset[]) => void;
}

export default function ({
  value,
  disabledIds,
  excludeIds,
  apiQuery,
  limitCount,
  callback,
}: ShowSelectorParams) {
  const store = useAssetsSelector();
  const selectedValue: Record<string, Asset> = {};
  if (value && Array.isArray(value)) {
    value?.forEach(item => {
      if (typeof item === 'string') {
        selectedValue[item] = { id: item } as Asset;
      } else {
        selectedValue[item.id] = item;
      }
    });
  }

  store.$set({ value: selectedValue, disabledIds, excludeIds, apiQuery, limitCount });

  uni.navigateTo({
    url: '/app-general-affairs-logistics/assets-manage/pages/assets-selector/index',
    events: {
      acceptDataFromAssetsSelectorPage: function (data: Record<string, Asset>) {
        if (typeof callback === 'function') {
          // const valueArray: string[] = [];
          const dataArray: Asset[] = [];
          Object.entries(data).forEach(item => {
            // valueArray.push(item[0]);
            dataArray.push({ ...item[1], assetId: item[1].assetId || item[1].id });
          });
          callback(dataArray);
        }
      },
    },
  });
}
