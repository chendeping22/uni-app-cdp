// import { InfoCircleFilled } from '@ant-design/icons-vue';
// import type { ModalFuncProps } from 'ant-design-vue';
// import { Modal, theme } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  castArray,
  cloneDeep,
  find,
  forEach,
  isFunction,
  isNil,
  map,
  mapValues,
  toLower,
} from 'lodash-es';
// import { h } from 'vue';
import type { Field, WithCallback } from '../types/schema';

export const delay = (t = 0) => new Promise<void>(resolve => setTimeout(resolve, t));

// export const confirm = (options: ModalFuncProps) =>
//   new Promise<boolean>(resolve => {
//     Modal.confirm({
//       centered: true,
//       icon: h(InfoCircleFilled, {
//         style: { color: '#1890ff' },
//       }),
//       ...options,
//       onOk: () => {
//         options.onOk?.();
//         resolve(true);
//       },
//       onCancel: () => {
//         options.onCancel?.();
//         resolve(false);
//       },
//     });
//   });

// export const useConfirm = () => {
//   const { token } = theme.useToken();
//   const confirm = (options: ModalFuncProps) =>
//     new Promise<boolean>(resolve => {
//       Modal.confirm({
//         centered: true,
//         icon: h(InfoCircleFilled, {
//           style: { color: token.value.colorPrimary },
//         }),
//         ...options,
//         onOk: () => {
//           options.onOk?.();
//           resolve(true);
//         },
//         onCancel: () => {
//           options.onCancel?.();
//           resolve(false);
//         },
//       });
//     });
//   return confirm;
// };

export const getDateType = (format = 'YYYY-MM-DD') => {
  const lowerFormat = toLower(format);
  if (lowerFormat.includes('d')) {
    return 'day';
  } else if (lowerFormat.includes('m')) {
    return 'month';
  } else {
    return 'year';
  }
};

export const formatDateValue = (value: any, format: string) => {
  const dateType = getDateType(format);
  return JSON.stringify(
    map(value as dayjs.Dayjs[], (v, i) => {
      switch (i) {
        case 0:
          return v.startOf(dateType).valueOf();
        case 1:
          return v.endOf(dateType).valueOf();
        default:
          return;
      }
    }),
  );
};

export const getPickerType = (format = 'YYYY-MM-DD') => {
  const lowerFormat = toLower(format);
  if (lowerFormat.includes('d')) {
    return 'date';
  } else if (lowerFormat.includes('m')) {
    return 'month';
  } else {
    return 'year';
  }
};

export const convert = <T = any>(input: WithCallback<T>, data: any, extData: any = {}): T => {
  if (isFunction(input)) {
    return input(data, extData);
  }
  return input;
};

export const inputFormDataFormat = (data: any, schema: Field[]) => {
  return mapValues(data, (v, k) => {
    const field = schema.find(f => f.name === k);
    if (isNil(v)) {
      return v;
    }
    switch (field?.type) {
      case 'InputNumber':
        return isNil(v) ? '0' : String(v);
      case 'DatePicker':
        return v ? dayjs(v) : null;
      case 'Select':
        if (!v) {
          return [];
        }
        return field.multiple ? v.split(',') : v;
      case 'ImageUpload':
      case 'Upload':
        if (!v) {
          return [];
        }
        return v.split(',');
      default:
        break;
    }
    return v;
  });
};

export const outputFormDataFormat = (data: any, schema: Field[]) => {
  return mapValues(data, (v, k) => {
    const field = schema.find(f => f.name === k);
    if (field?.ignore) {
      return undefined;
    }
    if (!v) {
      return v;
    }
    switch (field?.type) {
      case 'DatePicker':
        return (v as dayjs.Dayjs).startOf(getDateType(field.format)).valueOf();
      case 'Select':
        return castArray(v).join(',');
      case 'ImageUpload':
      case 'Upload':
        return v.join(',');
      default:
        break;
    }
    return v;
  });
};

export const isTree = (list: any[]) => {
  return !!find(list, i => !!i.children?.length);
};

export const createTreeData = (list: any[], allowSelectParent = false) => {
  const cloneList = cloneDeep(list);
  const traverse = (arr: any[]) => {
    forEach(arr, i => {
      if (i.children?.length) {
        i.disabled = !allowSelectParent;
        i.checkable = allowSelectParent;
        traverse(i.children);
      }
    });
  };
  traverse(cloneList);
  return cloneList;
};

const allowSelectParentFields = ['base.teacherSource', 'workExp.orgType'];

export const isAllowSelectParent = (field: string) => {
  const match = allowSelectParentFields.find(f => f === field);
  return !!match;
};
