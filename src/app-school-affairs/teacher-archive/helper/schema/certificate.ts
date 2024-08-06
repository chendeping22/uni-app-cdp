import type { Group } from '../../types/schema';

export const certificates: Group = {
  type: 'Array',
  title: '技能及证书',
  name: 'certificates',
  fields: [
    {
      title: '语种',
      name: 'language',
      type: 'Select',
      required: true,
      dictionary: 'teacherArchive.Language',
    },
    {
      title: '掌握程度',
      name: 'mastery',
      type: 'Select',
      required: true,
      dictionary: 'teacherArchive.MasteryLevel',
    },
    {
      title: '其他技能名称',
      name: 'otherSkillName',
      type: 'Input',
    },
    {
      title: '其他技能掌握程度',
      name: 'otherMastery',
      type: 'Select',
      dictionary: 'teacherArchive.MasteryLevel',
    },
    {
      title: '证书类型',
      name: 'certType',
      type: 'Select',
      dictionary: 'teacherArchive.CertificateType',
      default: '2',
      reactions: [
        {
          type: 'clear',
          target: ['languageCertType', 'certificateName'],
        },
        {
          type: 'clear',
          when: (value) => value === '0',
          target: ['issueDate', 'orgName', 'certificateNo'],
        },
      ],
    },
    //当【证书类型】选择“2-语言证书”时必填，否则不能填写，值置空，【证书类型】选“0-无”时，不能填写，值置空。
    {
      title: '语言证书名称',
      name: 'languageCertType',
      type: 'Select',
      dictionary: 'teacherArchive.LangCertName',
      required: (data) => data.certType === '2',
      disabled: (data) => data.certType !== '2',
      reactions: [
        {
          type: 'clear',
          target: ['certificateName'],
        },
      ],
    },
    //当【证书类型】选择非“2-语言证书”或【语言证书名称】选择【9-其他语言证书】时，必须填写，否则不能填写，值置空，【证书类型】选“0-无”时，不能填写，值置空。
    {
      title: '证书名称',
      name: 'certificateName',
      type: 'Input',
      required: (data) =>
        (data.certType !== '2' && data.certType !== '0') || data.languageCertType === '9',
      disabled: (data) =>
        !((data.certType !== '2' && data.certType !== '0') || data.languageCertType === '9'),
    },
    //【证书类型】选“0-无”时，不能填写，值置空。
    {
      title: '发证年月',
      name: 'issueDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      disabled: (data) => data.certType === '0',
    },
    //【证书类型】选“0-无”时，不能填写，值置空。
    {
      title: '发证单位',
      name: 'orgName',
      type: 'Input',
      disabled: (data) => data.certType === '0',
    },
    //【证书类型】选“0-无”时，不能填写，值置空。
    {
      title: '证书编号',
      name: 'certificateNo',
      type: 'Input',
      disabled: (data) => data.certType === '0',
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
