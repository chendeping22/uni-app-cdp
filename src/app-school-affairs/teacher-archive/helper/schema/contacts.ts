import type { Group } from '../../types/schema';
import { emailRule, isNumberRule } from '../rules';

export const contacts: Group = {
  type: 'Object',
  title: '联系方式',
  name: 'contacts',
  fields: [
    {
      title: '通讯地址',
      name: 'contactAddress',
      type: 'Input',
    },
    {
      title: '联系电话',
      name: 'contactNumber',
      type: 'Input',
      rules: [isNumberRule()],
    },
    //有数据时，必须为数字，位数为11位
    {
      title: '手机',
      name: 'mobilePhone',
      type: 'Input',
      rules: [isNumberRule(11)],
    },
    //有数据时，必须有@字符，前后有字符
    {
      title: 'Email',
      name: 'email',
      type: 'Input',
      rules: [emailRule()],
    },
    {
      title: '其他联系方式',
      name: 'other',
      type: 'Input',
    },
  ],
};
