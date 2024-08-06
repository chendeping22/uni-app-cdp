import type { Group } from '../../types/schema';

export const qualifications: Group = {
  type: 'Array',
  title: '教师资格',
  name: 'qualifications',
  fields: [
    {
      title: '教师资格证种类',
      required: true,
      default: '0',
      name: 'qualificationType',
      type: 'Select',
      dictionary: 'teacherArchive.QualificationType',
      reactions: [
        {
          type: 'clear',
          when: value => value === '0',
          target: [
            'qualificationNo',
            'discipline',
            'issueDate',
            'issueOrg',
            'firstRegisterDate',
            'firstRegisterResult',
            'scheduledRegisterDate',
            'scheduledRegisterResult',
          ],
        },
      ],
    },
    //教师资格证种类为“0-无”时，置空，不能填写
    {
      title: '教师资格证号码',
      name: 'qualificationNo',
      type: 'Input',
      disabled: data => data.qualificationType === '0',
    },
    //教师资格证种类为“0-无”时，置空，不能填写
    {
      title: '任教学科',
      name: 'discipline',
      type: 'Select',
      dictionary: 'teacherArchive.TeachSubject',
      disabled: data => data.qualificationType === '0',
    },
    //教师资格证种类为“0-无”时，置空，不能填写
    {
      title: '证书颁发日期',
      name: 'issueDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: data => data.qualificationType === '0',
    },
    //教师资格证种类为“0-无”时，置空，不能填写
    {
      title: '颁发机构',
      name: 'issueOrg',
      type: 'Input',
      disabled: data => data.qualificationType === '0',
    },
    //显示项，不能填写，由资格注册业务回填。
    {
      title: '首次注册日期',
      name: 'firstRegisterDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: data => data.qualificationType === '0',
    },
    //显示项，不能填写，由资格注册业务回填。
    {
      title: '首次注册结论',
      name: 'firstRegisterResult',
      type: 'Select',
      dictionary: 'teacherArchive.RegisConclusion',
      disabled: data => data.qualificationType === '0',
    },
    //显示项，不能填写，由资格注册业务回填。
    {
      title: '定期注册日期',
      name: 'scheduledRegisterDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: data => data.qualificationType === '0',
    },
    //显示项，不能填写，由资格注册业务回填。
    {
      title: '定期注册结论',
      name: 'scheduledRegisterResult',
      type: 'Select',
      dictionary: 'teacherArchive.RegisConclusion',
      disabled: data => data.qualificationType === '0',
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
