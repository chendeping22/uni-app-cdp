import type { Group } from '../../types/schema';
import dayjs from 'dayjs';

export const virtues: Group = {
  type: 'Array',
  title: '师德信息',
  name: 'virtues',
  fields: [
    //默认为当前年月
    {
      title: '师德考核时间',
      required: true,
      name: 'examDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      default: () => dayjs().startOf('month'),
    },
    {
      title: '师德考核结论',
      required: true,
      name: 'examResult',
      type: 'Select',
      dictionary: 'teacherArchive.VirtueAssessResult',
      default: '2',
    },
    {
      title: '师德考核单位名称',
      name: 'examOrg',
      type: 'Input',
    },
    {
      title: '荣誉级别',
      name: 'honorLevel',
      type: 'Select',
      dictionary: 'teacherArchive.HonorLevel',
      reactions: [
        {
          type: 'clear',
          when: (value) => value === '0',
          target: ['honorType', 'honorDate', 'honorDesc', 'honorAwardingOrg'],
        },
      ],
    },
    //【荣誉级别】选“0-无”时，不能填写，值置空。
    {
      title: '获得荣誉称号',
      name: 'honorType',
      type: 'Select',
      dictionary: 'teacherArchive.HonorType',
      disabled: (data) => data.honorLevel === '0',
    },
    //【荣誉级别】选“0-无”时，不能填写，值置空。
    {
      title: '荣誉发生日期',
      name: 'honorDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: (data) => data.honorLevel === '0',
    },
    //【荣誉级别】选“0-无”时，不能填写，值置空。
    {
      title: '荣誉记录描述',
      name: 'honorDesc',
      type: 'Input',
      disabled: (data) => data.honorLevel === '0',
    },
    //【荣誉级别】选“0-无”时，不能填写，值置空。
    {
      title: '荣誉授予单位名称',
      name: 'honorAwardingOrg',
      type: 'Input',
      disabled: (data) => data.honorLevel === '0',
    },
    {
      title: '处分类别',
      required: true,
      default: '0',
      name: 'punishType',
      type: 'Select',
      dictionary: 'teacherArchive.PunishType',
      reactions: [
        {
          type: 'clear',
          when: (value) => value === '0',
          target: [
            'punishReason',
            'punishHappenDate',
            'punishDesc',
            'punishOrg',
            'punishDate',
            'punishRevokeDate',
            'punishRevokeReason',
          ],
        },
        {
          type: 'set',
          when: (value) => value !== '0',
          target: 'punishHappenDate',
          targetValue: dayjs().startOf('day'),
        },
      ],
    },
    //【处分类别】选择“0-无”时，不能填写，值置空。
    {
      title: '处分原因',
      name: 'punishReason',
      type: 'Select',
      dictionary: 'teacherArchive.PunishReason',
      disabled: (data) => data.punishType === '0',
      required: (data) => data.punishType !== '0',
    },
    // 默认为当前时间 【处分类别】选择“0-无”时，不能填写，值置空。
    {
      title: '处分发生日期',
      name: 'punishHappenDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: (data) => data.punishType === '0',
      required: (data) => data.punishType !== '0',
    },
    //【处分类别】选择“0-无”时，不能填写，值置空。
    {
      title: '处分记录描述',
      name: 'punishDesc',
      type: 'Input',
      disabled: (data) => data.punishType === '0',
    },
    //【处分类别】选择“0-无”时，不能填写，值置空。
    {
      title: '处分单位名称',
      name: 'punishOrg',
      type: 'Input',
      disabled: (data) => data.punishType === '0',
    },
    //【处分类别】选择“0-无”时，不能填写，值置空。
    {
      title: '处分日期',
      name: 'punishDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: (data) => data.punishType === '0',
    },
    //【处分类别】选择“0-无”时，不能填写，值置空。
    {
      title: '处分撤销日期',
      name: 'punishRevokeDate',
      type: 'DatePicker',
      format: 'YYYY-MM-DD',
      disabled: (data) => data.punishType === '0',
    },
    //【处分类别】选择“0-无”时，不能填写，值置空。
    {
      title: '处分撤销原因',
      name: 'punishRevokeReason',
      type: 'Input',
      disabled: (data) => data.punishType === '0',
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
