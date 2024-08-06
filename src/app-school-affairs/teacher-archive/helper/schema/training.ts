import type { Group } from '../../types/schema';
import { isIntRule } from '../rules';

export const trainings: Group = {
  type: 'Array',
  title: '国内培训',
  name: 'trainings',
  fields: [
    {
      title: '培训年度',
      required: true,
      name: 'trainingYear',
      type: 'DatePicker',
      format: 'YYYY',
    },
    {
      title: '培训类别',
      required: true,
      name: 'trainingType',
      type: 'Select',
      dictionary: 'teacherArchive.TrainingType',
    },
    {
      title: '培训项目名称',
      required: true,
      name: 'projectName',
      type: 'Input',
    },
    {
      title: '培训机构名称',
      name: 'orgName',
      type: 'Input',
    },
    {
      title: '培训方式',
      required: true,
      name: 'trainingWay',
      type: 'Select',
      dictionary: 'teacherArchive.TrainingWay',
    },
    //整数
    {
      title: '培训获得学时',
      required: true,
      name: 'hours',
      type: 'InputNumber',
      min: 0,
      max: 99999,
      precision: 0,
      rules: [isIntRule()],
    },
    //整数
    {
      title: '培训获得学分',
      name: 'credit',
      type: 'InputNumber',
      min: 0,
      max: 99999,
      precision: 0,
      rules: [isIntRule()],
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
