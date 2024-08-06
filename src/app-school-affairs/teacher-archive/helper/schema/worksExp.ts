import type { Group } from '../../types/schema';
import { compareDateRule } from '../rules';

export const worksExps: Group = {
  type: 'Array',
  title: '工作经历',
  name: 'worksExps',
  fields: [
    {
      title: '任职单位名称',
      name: 'orgName',
      type: 'Input',
    },
    {
      title: '任职开始年月',
      name: 'startDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
    },
    //任职结束年月不能小于任职开始年月
    {
      title: '任职结束年月',
      name: 'endDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      rules: [compareDateRule('startDate', 'sameOrAfter')],
    },
    {
      title: '单位性质类别',
      name: 'orgType',
      type: 'Select',
      allowSelectParent: true,
      dictionary: 'teacherArchive.UnitNatureType',
    },
    {
      title: '任职岗位',
      name: 'position',
      type: 'Input',
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
