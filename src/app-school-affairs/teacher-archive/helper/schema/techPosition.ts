import type { Group } from '../../types/schema';
import { compareDateRule } from '../rules';

export const techPositions: Group = {
  type: 'Array',
  title: '专业技术职务聘任',
  name: 'techPositions',
  fields: [
    {
      title: '聘任专业技术职务',
      required: true,
      name: 'techPosition',
      type: 'Select',
      dictionary: 'teacherArchive.TechPosition',
      reactions: [
        {
          type: 'clear',
          when: (value) => value === '0',
          target: ['startDate', 'endDate', 'orgName'],
        },
      ],
    },
    // 聘任专业技术职务为“无”时，不能填写，值置空，否则必填
    {
      title: '聘任开始年月',
      name: 'startDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      disabled: (data) => data.techPosition === '0',
      required: (data) => data.techPosition !== '0',
    },
    // 聘任结束年月不能小于聘任开始年月
    // 聘任专业技术职务为“无”时，不能填写，值置空
    {
      title: '聘任结束年月',
      name: 'endDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      disabled: (data) => data.techPosition === '0',
      rules: [compareDateRule('startDate', 'sameOrAfter')],
    },
    //聘任专业技术职务为“无”时，不能填写，值置空
    {
      title: '聘任单位名称',
      name: 'orgName',
      type: 'Input',
      disabled: (data) => data.techPosition === '0',
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
