import type { Group } from '../../types/schema';
import { compareDateRule, notAllowOptions } from '../rules';

export const overseasStudys: Group = {
  type: 'Array',
  title: '海外研修(访学)',
  name: 'overseasStudys',
  fields: [
    {
      title: '是否有海外研修（访学）经历',
      required: true,
      default: '1',
      name: 'studyFlag',
      type: 'Select',
      dictionary: 'teacherArchive.YesOrNo',
      reactions: [
        {
          type: 'clear',
          target: [
            'startDate',
            'endDate',
            'studyCountry',
            'orgName',
            'projectName',
            'projectOrgName',
          ],
        },
      ],
    },
    //【是否有海外研修经历】为【1-是】时，可以填写，否则不能填写，同时将值置空
    {
      title: '开始日期',
      name: 'startDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: (data) => data.studyFlag !== '1',
    },
    //【是否有海外研修经历】为【1-是】时，可以填写，否则不能填写，同时将值置空，结束日期必须大于开始日期
    {
      title: '结束日期',
      name: 'endDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: (data) => data.studyFlag !== '1',
      rules: [compareDateRule('startDate', 'after')],
    },
    //【是否有海外研修经历】为【1-是】时，可以填写，否则不能填写，同时将值置空，值不能为【156-中国】
    {
      title: '国家(地区)',
      name: 'studyCountry',
      type: 'Select',
      dictionary: 'teacherArchive.Country',
      disabled: (data) => data.studyFlag !== '1',
      rules: [notAllowOptions('156')],
    },
    //【是否有海外研修经历】为【1-是】时，可以填写，否则不能填写，同时将值置空
    {
      title: '研修（访学）机构名称',
      name: 'orgName',
      type: 'Input',
      disabled: (data) => data.studyFlag !== '1',
    },
    //【是否有海外研修经历】为【1-是】时，可以填写，否则不能填写，同时将值置空
    {
      title: '项目名称',
      name: 'projectName',
      type: 'Input',
      disabled: (data) => data.studyFlag !== '1',
    },
    //【是否有海外研修经历】为【1-是】时，可以填写，否则不能填写，同时将值置空
    {
      title: '项目组织单位名称',
      name: 'projectOrgName',
      type: 'Input',
      disabled: (data) => data.studyFlag !== '1',
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
