import { SelectorTypeEnum, SelectorValue, ShowSelectorParams } from './types';
import { useSelector } from './useSelector';

function formatParams(query: any) {
  return Object.keys(query)
    .filter(key => query[key] !== undefined && query[key] !== null && query[key] !== '')
    .map(key => `${key}=${query[key]}`)
    .join('&');
}

export default function showSelector<multiple extends boolean = true>(
  params: ShowSelectorParams<multiple>,
) {
  const { type, multiple, value, scope, disabledItemIds, locationId, callback } = params;
  const selectedValue: { [key: string]: any } = {};

  if (multiple === false) {
    if (value && !Array.isArray(value)) {
      if (typeof value === 'string') {
        selectedValue[value] = { id: value };
      } else {
        selectedValue[value.id] = value;
      }
    }
  } else if (Array.isArray(value)) {
    value?.forEach(item => {
      if (typeof item === 'string') {
        selectedValue[item] = { id: item };
      } else {
        selectedValue[item.id] = item;
      }
    });
  }

  const store = useSelector();
  store.$set({
    value: selectedValue,
    disabledIds: disabledItemIds,
  });
  uni.setStorageSync('acceptDataFromSelectorComponent', { selectedValue, disabledItemIds });

  const query = formatParams({
    type,
    multiple: multiple === false ? 0 : 1,
    locationId,
    scope,
  });
  let url = `/business-components/selector/index?${query}`;
  switch (type) {
    case SelectorTypeEnum.separatedPerson: {
      url = `/business-components/selector/person-separated?&${query}`;
      break;
    }
  }
  uni.navigateTo({
    url,
    events: {
      acceptDataFromSelectorComponentPage: function (data: Record<string, SelectorValue>) {
        if (typeof callback === 'function') {
          const valueArray: string[] = [];
          const dataArray: SelectorValue[] = [];
          Object.entries(data).forEach(item => {
            valueArray.push(item[0]);
            dataArray.push(item[1]);
          });
          if (multiple === false) {
            valueArray?.length ? callback(valueArray[0], dataArray[0]) : callback();
          } else {
            callback(valueArray, dataArray);
          }
        }
        store.$reset();
      },
    },
  });
}
