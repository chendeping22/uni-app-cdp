import dayjs from 'dayjs';
import {
  castArray,
  difference,
  find,
  includes,
  isInteger,
  isNil,
  isNumber,
  isString,
  map,
  toLower,
} from 'lodash-es';

type DatePickerField = any;
type Field = any;
type ValidatorRuleCreator = any;

const getDateType = (format = 'YYYY-MM-DD') => {
  const lowerFormat = toLower(format);
  if (lowerFormat.includes('d')) {
    return 'day';
  } else if (lowerFormat.includes('m')) {
    return 'month';
  } else {
    return 'year';
  }
};

/** 校验规则，指定智能单选的选项 */
export const exclusiveRule =
  (...params: any[]): ValidatorRuleCreator =>
  ({ options, field }) => ({
    validator: (rule, _value) => {
      let value = _value;
      if (field.multiple) {
        value = value?.split(',') || [];
      }

      if (value?.length > 1 && !!find(params, o => includes(value, o))) {
        return false;
      }
      return true;
    },
    message: `选${map(params, p => find(options, o => o.value === p)?.label || p).join(
      '、',
    )}时不能多选`,
    trigger: ['change', 'blur'],
  });

/** 日期比较校验 */
export const compareDateRule =
  (targetName: string, compareType: 'after' | 'sameOrAfter'): ValidatorRuleCreator =>
  ({ formData, field, fields }) => {
    let text = '';
    return {
      validator: (rule, _value) => {
        const value = dayjs(_value);
        // console.log('🚀ccc ~ value:', value.format((field as DatePickerField).format));
        const targetValue = formData[targetName];
        const targetField = find(fields, (f: Field) => f.name === targetName);
        let isAfter = true;
        let isBefore = true;
        const dateType = getDateType((field as DatePickerField).format);
        if (targetValue && value && value?.isValid()) {
          isAfter = (value as dayjs.Dayjs).isAfter(targetValue as dayjs.Dayjs, dateType);
          isBefore = (value as dayjs.Dayjs).isBefore(targetValue as dayjs.Dayjs, dateType);
          if (compareType === 'after' && !isAfter) {
            text = `${field.title}必须晚于${targetField?.title || targetName}`;
            return false;
            // return Promise.reject(`${field.title}必须晚于${targetField?.title || targetName}`);
          } else if (compareType === 'sameOrAfter' && isBefore) {
            text = `${field.title}不能早于${targetField?.title || targetName}`;
            return false;
            // return Promise.reject(`${field.title}不能早于${targetField?.title || targetName}`);
          }
        }
        return true;
      },
      message: () => text,
      trigger: ['change', 'blur'],
    };
  };

/** 不能与其他字段值相同 */
export const notEqualWithRule =
  (targetName: string): ValidatorRuleCreator =>
  ({ formData, field, fields }) => ({
    validator: (rule, value) => {
      if (!value) {
        return true;
      }
      const targetValue = formData[targetName];
      const targetField = find(fields, (f: Field) => f.name === targetName);
      if (value === targetValue) {
        return false;
      }
      return true;
    },
    message: `${field.title}不能与${
      find(fields, (f: Field) => f.name === targetName)?.title || targetName
    }相同`,
    trigger: ['change', 'blur'],
  });

/** 大于零的整数 */
export const isLtZeroIntRule =
  (): ValidatorRuleCreator =>
  ({ field }) => ({
    validator: (rule, _value) => {
      // todocybl
      const value = isString(_value) ? Number(_value) : _value;
      if ((isNumber(value) && value > 0 && isInteger(value)) || isNil(value)) {
        return true;
      }
      return false;
    },
    message: `${field.title}必须为大于零的整数`,
    trigger: ['change', 'blur'],
  });

export const isIntRule =
  (): ValidatorRuleCreator =>
  ({ field }) => ({
    validator: (rule, _value) => {
      const value = isString(_value) ? Number(_value) : _value;

      if (isInteger(value) || isNil(value)) {
        return true;
      }
      return false;
    },
    message: `${field.title}必须整数`,
    trigger: ['change', 'blur'],
  });

export const isNumberRule =
  (length?: number): ValidatorRuleCreator =>
  ({ field }) => ({
    validator: (rule, value) => {
      const countStr = length ? `{${length}}` : '+';
      if (!value || new RegExp(`^\\d${countStr}$`).test(value)) {
        return true;
      }
      return false;
    },
    message: `${field.title}必须为${length ? length + '位' : ''}数字`,
    trigger: ['change', 'blur'],
  });

export const emailRule =
  (): ValidatorRuleCreator =>
  ({ field }) => ({
    validator: (rule, value) => {
      if (!value || /\S+@\S+/.test(value)) {
        return true;
      }
      return false;
    },
    message: `${field.title}必须有@字符，前后有字符`,
    trigger: ['change', 'blur'],
  });

export const notAllowOptions =
  (...val: string[]): ValidatorRuleCreator =>
  ({ field, options }) => ({
    validator: (rule, value) => {
      if (!value || !value.length) {
        return true;
      }
      const valueArr = castArray(value);
      if (difference(val, valueArr).length < val.length) {
        return false;
      }
      return true;
    },
    message: `${field.title}不能选择${map(
      val,
      v => find(options, o => o.value === v)?.label || v,
    ).join(',')}`,
    trigger: ['change', 'blur'],
  });
