import type { Group } from '../../types/schema';
import { compareDateRule, notEqualWithRule } from '../rules';

export const rotations: Group = {
  type: 'Array',
  title: '交流轮岗',
  name: 'rotations',
  fields: [
    {
      title: '交流轮岗类型',
      name: 'rotationType',
      type: 'Select',
      required: true,
      dictionary: 'teacherArchive.RotationType',
      reactions: [
        {
          type: 'clear',
          when: (value) => value === '0',
          target: ['transferFlag', 'startDate', 'endDate', 'originOrgName', 'rotationOrgName'],
        },
      ],
    },
    //当【交流轮岗类型】选“0-无”时，不能填写，值置空。
    {
      title: '是否调动人事关系',
      name: 'transferFlag',
      type: 'Select',
      dictionary: 'teacherArchive.YesOrNo',
      disabled: (data) => data.rotationType === '0',
      required: (data) => data.rotationType !== '0',
    },
    //当【交流轮岗类型】选“0-无”时，不能填写，值置空。
    {
      title: '开始年月',
      name: 'startDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      disabled: (data) => data.rotationType === '0',
      required: (data) => data.rotationType !== '0',
    },
    //结束年月不能小于开始年月，当交流轮岗类型】选“0-无”时，不能填写，值置空。
    {
      title: '结束年月',
      name: 'endDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      disabled: (data) => data.rotationType === '0',
      rules: [compareDateRule('startDate', 'sameOrAfter')],
    },
    //默认本单位(学校)名称，当交流轮岗类型】选“0-无”时，不能填写，值置空。
    {
      title: '原单位名称',
      name: 'originOrgName',
      type: 'Input',
      disabled: (data) => data.rotationType === '0',
      required: (data) => data.rotationType !== '0',
      default: (_: any, extData: any) => extData?.locationName,
    },
    //不能与原单位名称相同，当交流轮岗类型】选“0-无”时，不能填写，值置空。
    {
      title: '交流轮岗单位名称',
      name: 'rotationOrgName',
      type: 'Input',
      disabled: (data) => data.rotationType === '0',
      required: (data) => data.rotationType !== '0',
      rules: [notEqualWithRule('originOrgName')],
    },
    {
      title: '附件',
      name: 'attachment',
      type: 'Upload',
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
