import type { Group } from '../../types/schema';
import dayjs from 'dayjs';

export const assessments: Group = {
  type: 'Array',
  title: '年度考核',
  name: 'assessments',
  fields: [
    // 默认当前年
    {
      title: '考核年度',
      required: true,
      name: 'year',
      type: 'DatePicker',
      format: 'YYYY',
      default: () => dayjs().startOf('year'),
    },
    {
      title: '考核结果',
      required: true,
      name: 'assessResult',
      type: 'Select',
      dictionary: 'teacherArchive.AssessResult',
    },
    // 默认为本校
    {
      title: '考核单位名称',
      name: 'assessOrg',
      type: 'Input',
      default: (_: any, extData: any) => extData?.locationName,
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
