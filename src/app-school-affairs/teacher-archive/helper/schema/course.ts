import type { Group } from '../../types/schema';
import dayjs from 'dayjs';
import { exclusiveRule, isLtZeroIntRule } from '../rules';
import { filter } from 'lodash-es';

export const courses: Group = {
  type: 'Array',
  title: '教育教学',
  name: 'courses',
  fields: [
    // 默认当前年
    {
      title: '学年',
      required: true,
      name: 'academicYear',
      type: 'DatePicker',
      format: 'YYYY',
      default: () => dayjs().startOf('year'),
    },
    {
      title: '学期',
      required: true,
      name: 'semester',
      type: 'Select',
      dictionary: 'teacherArchive.Semester',
    },
    //选“0-无”时不能多选，【任课状况】设置为【10-未任课】
    {
      title: '任教学段',
      required: true,
      name: 'period',
      type: 'Select',
      dictionary: 'teacherArchive.TeachStage',
      rules: [exclusiveRule('0')],
      reactions: [
        {
          type: 'set',
          when: (value) => value === '0',
          target: 'teachStatus',
          targetValue: '10',
        },
        {
          type: 'clear',
          when: (value) => value === '0',
          target: 'teachDesc',
        },
        {
          type: 'clear',
          target: 'course',
        },
      ],
    },
    {
      title: '任课状况',
      required: true,
      name: 'teachStatus',
      type: 'Select',
      dictionary: 'teacherArchive.TeachStatus',
      default: '20',
      reactions: [
        {
          type: 'clear',
          target: ['teachDesc', 'course', 'weeklyCourseHour', 'otherWeeklyCourseHour'],
        },
      ],
    },
    //【任课状况】为【99-其他】时，可以录入，否则，不能录入，值置空。
    {
      title: '任课状况为其他情况的具体说明',
      name: 'teachDesc',
      type: 'Input',
      disabled: (data) => data.teachStatus !== '99',
    },
    //【任课状况】为【20-任课】时必填，且可多选，否则不能填写，值置空
    {
      title: '任教课程',
      name: 'course',
      multiple: true,
      type: 'Select',
      dictionary: 'teacherArchive.TeachCourse',
      disabled: (data) => !(data.teachStatus === '20' && ['2', '3', '4'].includes(data.period)),
      required: (data) => data.teachStatus === '20' && ['2', '3', '4'].includes(data.period),
      dictionaryFilter: (dictionary, formData) => {
        switch (formData.period) {
          // 小学
          case '2':
            return filter(dictionary, (d) => d.value === '1');
          // 普通初中
          case '3':
            return filter(dictionary, (d) => d.value === '2');
          // 普通高中
          case '4':
            return filter(dictionary, (d) => d.value === '3');
          default:
            return [];
        }
      },
    },
    //【任课状况】为【20-任课】时必填，默认为零，值为大于零的整数，否则不能填写，值置空
    {
      title: '平均每周课堂教学课时数',
      name: 'weeklyCourseHour',
      type: 'InputNumber',
      disabled: (data) => data.teachStatus !== '20',
      required: (data) => data.teachStatus === '20',
      min: 0,
      max: 168,
      precision: 0,
      rules: [isLtZeroIntRule()],
    },
    //【任课状况】为【20-任课】时可填，默认为零，值为大于零的整数，否则不能填写，值置空
    {
      title: '平均每周其他工作折合教学课时数',
      name: 'otherWeeklyCourseHour',
      type: 'InputNumber',
      min: 0,
      max: 168,
      precision: 0,
      disabled: (data) => data.teachStatus !== '20',
      required: (data) => data.teachStatus === '20',
      rules: [isLtZeroIntRule()],
    },
    {
      title: '兼任工作',
      required: true,
      name: 'partTimeWork',
      type: 'Select',
      dictionary: 'teacherArchive.ConcurrentWork',
      default: '00',
      reactions: [
        {
          type: 'clear',
          target: 'partTimeWorkName',
        },
      ],
    },
    //【兼任工作】为【99-其他】时可填，否则不能填写，值置空
    {
      title: '兼任其他工作名称',
      name: 'partTimeWorkName',
      type: 'Input',
      disabled: (data) => data.partTimeWork !== '99',
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
