import { filter, includes } from 'lodash';
import type { Group } from '../../types/schema';
import { exclusiveRule, notEqualWithRule } from '../rules';

const postLevelDictionaryFilter = (name: string) => (dictionary: any[], data: any) => {
  return filter(dictionary, (d) => {
    switch (data[name]) {
      case '1':
      case '2':
        return /^(1|9)/.test(d.value);
      case '3':
        return /^(2|9)/.test(d.value);
      case '4':
        return /^(3|9)/.test(d.value);
      default:
        return /^9/.test(d.value);
    }
  });
};

export const postAppoints: Group = {
  type: 'Array',
  title: '岗位聘任',
  name: 'postAppoints',
  fields: [
    {
      title: '岗位类别',
      required: true,
      name: 'postType',
      type: 'Select',
      dictionary: 'teacherArchive.PostType',
      reactions: [
        {
          type: 'clear',
          target: 'postLevel',
        },
      ],
    },
    //与岗位类别级联，
    // 【1-教师岗位】【2-其他专业技术岗位】对应【专业技术岗位一到十三级】，
    // 【3-管理岗位】对应【管理岗位一到十级】，
    // 【4-工勤技能岗位】对应【工勤技能岗位一到五级及普通工】，
    // 998-未评(试用期)】【999-未评(其他)】四种岗位类别都可以选
    {
      title: '岗位等级',
      name: 'postLevel',
      type: 'Select',
      dictionary: 'teacherArchive.PostLevel',
      dictionaryFilter: postLevelDictionaryFilter('postType'),
      required: true,
      // disabled: (formData) => formData.postType === '0',
      // required: (formData) => formData.postType !== '0',
    },
    {
      title: '聘任开始年月',
      required: true,
      name: 'startDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
    },
    {
      title: '是否兼任其他岗位',
      default: '0',
      name: 'partTimeFlag',
      type: 'Select',
      dictionary: 'teacherArchive.YesOrNo',
      reactions: [
        {
          type: 'clear',
          target: ['partTimePostType', 'partTimePostLevel'],
        },
      ],
    },
    // 1、【是否兼任其他岗位】为【1-是】时，可以填写，否则，不能填写，将值置空
    // 2、值不能与岗位类别值相同
    {
      title: '兼任岗位类别',
      name: 'partTimePostType',
      type: 'Select',
      dictionary: 'teacherArchive.PartTimePostType',
      disabled: (formData) => formData.partTimeFlag !== '1',
      reactions: [
        {
          type: 'clear',
          target: ['partTimePostLevel'],
        },
      ],
      rules: [notEqualWithRule('postType')],
    },
    // 1、【是否兼任其他岗位】为【1-是】时，可以填写，否则，不能填写，将值置空
    // 2、与兼任岗位类别级联，【兼任岗位类别】为【0-无其他岗位类别】时，不能填写，将值置空
    {
      title: '兼任岗位等级',
      name: 'partTimePostLevel',
      type: 'Select',
      dictionary: 'teacherArchive.PostLevel',
      dictionaryFilter: postLevelDictionaryFilter('partTimePostType'),
      disabled: (formData) => formData.partTimeFlag !== '1' || formData.partTimePostType === '0',
    },
    {
      title: '校级职务',
      required: true,
      default: () => ['00'],
      name: 'schoolPost',
      type: 'Select',
      dictionary: 'teacherArchive.SchoolLevelPos',
      multiple: true,
      rules: [exclusiveRule('00')],
      reactions: [
        {
          type: 'clear',
          when: (value) => includes(value, '00'),
          target: 'schoolPostStartDate',
        },
      ],
    },
    //校级职务为【00-无】时不能填，将值置为空
    {
      title: '任职开始年月',
      name: 'schoolPostStartDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      disabled: (formData) => includes(formData.schoolPost, '00'),
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
