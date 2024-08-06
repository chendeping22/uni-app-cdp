import dayjs from 'dayjs';
import type { Group } from '../../types/schema';
import { exclusiveRule } from '../rules';

export const treatments: Group = {
  type: 'Array',
  title: '基本待遇',
  name: 'treatments',
  fields: [
    //不能填写本年度，默认当上一年度。保存判断是否为空，为空时默认当上一年度。增加提示：未满一年请下年度填报
    {
      title: '年度',
      name: 'year',
      type: 'DatePicker',
      format: 'YYYY',
      default: () => dayjs().subtract(1, 'year').startOf('year'),
      rules: [
        {
          validator: (rule, _value) => {
            const value = dayjs(_value);
            if (!value || !value?.isValid()) {
              return true;
            }
            const now = dayjs();
            if (
              (value as dayjs.Dayjs).isSame(now, 'year') ||
              (value as dayjs.Dayjs).isAfter(now, 'year')
            ) {
              return false;
            }
            return true;
          },
          message: '未满一年请下年度填报',
          trigger: ['change', 'blur'],
        },
      ],
    },
    {
      title: '年工资收入(元)',
      required: true,
      default: '0',
      name: 'yearlyIncome',
      type: 'InputNumber',
      max: 99999999,
      min: 0,
      precision: 2,
    },
    {
      title: '基本工资(元/月)',
      required: true,
      default: '0',
      name: 'monthlyBaseIncome',
      type: 'InputNumber',
      max: 999999,
      min: 0,
      precision: 2,
    },
    {
      title: '绩效工资(元/月)',
      required: true,
      default: '0',
      name: 'performanceIncome',
      type: 'InputNumber',
      max: 999999,
      min: 0,
      precision: 2,
    },
    {
      title: '乡村教师生活补助(元/月)',
      required: true,
      default: '0',
      name: 'countryTeacherSubsidy',
      type: 'InputNumber',
      max: 999999,
      min: 0,
      precision: 2,
    },
    {
      title: '其他津贴补贴(元/月)',
      required: true,
      default: '0',
      name: 'otherSubsidy',
      type: 'InputNumber',
      max: 999999,
      min: 0,
      precision: 2,
    },
    {
      title: '其他(元/月)',
      required: true,
      default: '0',
      name: 'otherIncome',
      type: 'InputNumber',
      max: 999999,
      min: 0,
      precision: 2,
    },
    //可多选，选【0-无】时不能多选
    {
      title: '五险一金',
      required: true,
      name: 'insuranceHousingFund',
      type: 'Select',
      multiple: true,
      dictionary: 'teacherArchive.FiveInsAndOneFund',
      rules: [exclusiveRule('0')],
    },
    {
      title: '附件Url',
      type: 'Input',
      name: 'attachmentUrl',
      hidden: true,
      ignore: true,
    },
  ],
};
