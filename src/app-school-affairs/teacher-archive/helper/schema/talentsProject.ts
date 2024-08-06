import dayjs from 'dayjs';
import type { Group } from '../../types/schema';

export const talentsProjects: Group = {
  type: 'Array',
  title: '入选人才项目',
  name: 'talentsProjects',
  fields: [
    {
      title: '入选人才项目名称',
      name: 'project',
      type: 'Select',
      dictionary: 'teacherArchive.TalentsProjectType',
      reactions: [
        {
          type: 'clear',
          when: value => value === '00',
          target: 'selectedDate',
        },
      ],
      required: true,
    },
    //默认当前年月，【入选人才项目名称】选“00-无”时，不能填写，值置空。
    {
      title: '入选年份',
      name: 'selectedDate',
      type: 'DatePicker',
      format: 'YYYY',
      default: () => dayjs().startOf('year'),
      disabled: data => data.project === '00',
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
