import { filter } from 'lodash';
import type { Group } from '../../types/schema';
import { compareDateRule } from '../rules';

export const learningExps: Group = {
  type: 'Array',
  title: '学习经历',
  name: 'learningExps',
  fields: [
    {
      title: '获得学历',
      type: 'Select',
      name: 'education',
      dictionary: 'teacherArchive.Education',
      required: true,
      reactions: [
        {
          type: 'clear',
          when: (value) => value === '0',
          target: [
            'educationCountry',
            'educationOrg',
            'major',
            'normalMajorFlag',
            'startDate',
            'endDate',
          ],
        },
        {
          type: 'set',
          when: (value) => value !== '0',
          target: ['educationCountry'],
          targetValue: '156',
        },
        {
          type: 'set',
          when: (value) => value !== '0',
          target: ['normalMajorFlag'],
          targetValue: '0',
        },
      ],
    },
    // 1、学历为【0-无】时不能填写，值置为空，否则为非必填项。
    // 2、默认为【156-中国】
    {
      title: '获得学历的国家(地区)',
      type: 'Select',
      name: 'educationCountry',
      dictionary: 'teacherArchive.Country',
      // required: (formData) => formData.education !== '0',
      disabled: (formData) => formData.education === '0',
      default: '156',
    },
    // 学历为【0-无】时不能填写，值置为空，否则必须填写
    {
      title: '获得学历的院校或机构',
      type: 'Input',
      name: 'educationOrg',
      required: (formData) => formData.education !== '0',
      disabled: (formData) => formData.education === '0',
    },
    // 学历为【0-无】时不能填写，值置为空，否则必须填写
    {
      title: '所学专业',
      type: 'Input',
      name: 'major',
      required: (formData) => formData.education !== '0',
      disabled: (formData) => formData.education === '0',
    },
    // 默认为【0-否】，学历为【0-无】时不能填写，值置为空，否则必须填写
    {
      title: '是否师范类专业',
      type: 'Select',
      name: 'normalMajorFlag',
      dictionary: 'teacherArchive.YesOrNo',
      required: (formData) => formData.education !== '0',
      disabled: (formData) => formData.education === '0',
      default: '0',
    },
    // 学历为【0-无】时不能填写，值置为空，否则为非必填项。
    {
      title: '入学年月',
      type: 'DatePicker',
      name: 'startDate',
      format: 'YYYY-MM',
      // required: (formData) => formData.education !== '0',
      disabled: (formData) => formData.education === '0',
    },
    // 1、学历为【0-无】时不能填写，值置为空，否则为非必填项。
    // 2、毕业年月不为空时，必须大于入学年月
    {
      title: '毕业年月',
      type: 'DatePicker',
      name: 'endDate',
      format: 'YYYY-MM',
      // required: (formData) => formData.education !== '0',
      disabled: (formData) => formData.education === '0',
      rules: [compareDateRule('startDate', 'after')],
    },
    {
      title: '学位层次',
      type: 'Select',
      name: 'degreeLevel',
      dictionary: 'teacherArchive.DegreeLevel',
      required: true,
      reactions: [
        {
          type: 'clear',
          target: ['degreeName', 'degreeCountry', 'degreeOrg', 'degreeAwardingDate'],
        },
        {
          type: 'set',
          when: (value) => value !== '0',
          target: 'degreeCountry',
          targetValue: '156',
        },
      ],
    },
    // 1、学位层次为【0-无】时不能填写，值置为空，否则必须填写
    // 2、与【学位层次】联动
    {
      title: '学位名称',
      type: 'Select',
      name: 'degreeName',
      dictionary: 'teacherArchive.Degree',
      required: (data) => data.degreeLevel !== '0',
      disabled: (data) => data.degreeLevel === '0',
      dictionaryFilter(dictionary, formData) {
        return filter(dictionary, (d) => d.value === formData.degreeLevel);
      },
    },
    // 1、学位层次为【0-无】时不能填写，值置为空，否则必须填写
    // 2、与【学位层次】联动
    {
      title: '获得学位的国家(地区)',
      type: 'Select',
      name: 'degreeCountry',
      dictionary: 'teacherArchive.Country',
      default: '156',
      required: (data) => data.degreeLevel !== '0',
      disabled: (data) => data.degreeLevel === '0',
    },
    // 学位层次为【0-无】时不能填写，值置为空，否则必须填写
    {
      title: '获得学位的院校或机构',
      type: 'Input',
      name: 'degreeOrg',
      required: (data) => data.degreeLevel !== '0',
      disabled: (data) => data.degreeLevel === '0',
    },
    // 学位层次为【0-无】时不能填写，值置为空，否则为非必填项。
    {
      title: '学位授予年月',
      type: 'DatePicker',
      name: 'degreeAwardingDate',
      format: 'YYYY-MM',
      // required: (data) => data.degreeLevel !== '0',
      disabled: (data) => data.degreeLevel === '0',
    },
    {
      title: '学习方式',
      type: 'Select',
      name: 'studyWay',
      dictionary: 'teacherArchive.StudyWay',
      required: true,
    },
    {
      title: '在学单位类别',
      type: 'Select',
      name: 'orgType',
      dictionary: 'teacherArchive.StudyOrg',
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
