import type { Group } from '../../types/schema';
import dayjs from 'dayjs';
import { compareDateRule } from '../rules';

export const teachAchievements: Group = {
  type: 'Array',
  title: '教学科研成果及获奖',
  name: 'teachAchievements',
  groups: [
    {
      //项目（课题）
      type: 'Array',
      title: '项目（课题）',
      name: 'researchProjects',
      fields: [
        {
          title: '项目类型',
          required: true,
          name: 'projectType',
          type: 'Select',
          dictionary: 'teacherArchive.ResearchProjectType',
          reactions: [
            {
              type: 'clear',
              when: (value) => value === '0',
              target: [
                'representFlag',
                'projectName',
                'approveNo',
                'academicArea',
                'funding',
                'startDate',
                'endDate',
                'role',
                'rank',
                'delegateOrg',
                'projectSource',
              ],
            },
          ],
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。默认为【0-否】
        {
          title: '是否是代表性成果和项目',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
          disabled: (data) => data.projectType === '0',
          default: '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '项目名称',
          name: 'projectName',
          type: 'Input',
          disabled: (data) => data.projectType === '0',
        },
        // 【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '项目批准号',
          name: 'approveNo',
          type: 'Input',
          disabled: (data) => data.projectType === '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '学科领域',
          name: 'academicArea',
          type: 'Input',
          disabled: (data) => data.projectType === '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '项目经费额度',
          name: 'funding',
          type: 'InputNumber',
          min: 0,
          max: 99999999,
          precision: 2,
          disabled: (data) => data.projectType === '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '开始年月',
          name: 'startDate',
          type: 'DatePicker',
          format: 'YYYY-MM',
          disabled: (data) => data.projectType === '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '结束年月',
          name: 'endDate',
          type: 'DatePicker',
          format: 'YYYY-MM',
          disabled: (data) => data.projectType === '0',
          rules: [compareDateRule('startDate', 'sameOrAfter')],
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '项目中本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.ProjectRole',
          disabled: (data) => data.projectType === '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '本人排名',
          name: 'rank',
          type: 'Select',
          dictionary: 'teacherArchive.Rank',
          disabled: (data) => data.projectType === '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '项目委托单位',
          name: 'delegateOrg',
          type: 'Input',
          disabled: (data) => data.projectType === '0',
        },
        //【项目(课题)】指标，【项目类型】选“0-无”时不能填写，值置空。
        {
          title: '项目来源',
          name: 'projectSource',
          type: 'Select',
          dictionary: 'teacherArchive.ProjectSource',
          disabled: (data) => data.projectType === '0',
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
    },
    {
      //著作
      type: 'Array',
      title: '著作',
      name: 'writings',
      fields: [
        {
          title: '著作类别',
          required: true,
          name: 'writingsType',
          type: 'Select',
          dictionary: 'teacherArchive.WritingsType',
          reactions: [
            {
              type: 'clear',
              when: (value) => value === '00',
              target: [
                'representFlag',
                'writingsName',
                'academicArea',
                'publishDate',
                'publishingHouse',
                'publishingNo',
                'role',
                'wordsCount',
                'selfWordsCount',
              ],
            },
          ],
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。默认为【0-否】
        {
          title: '是否是代表性成果和项目',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
          disabled: (data) => data.writingsType === '00',
          default: '0',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '著作名称',
          name: 'writingsName',
          type: 'Input',
          disabled: (data) => data.writingsType === '00',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '学科领域',
          name: 'academicArea',
          type: 'Input',
          disabled: (data) => data.writingsType === '00',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '出版日期',
          name: 'publishDate',
          type: 'DatePicker',
          format: 'YYYY-MM-DD',
          disabled: (data) => data.writingsType === '00',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '出版社名称',
          name: 'publishingHouse',
          type: 'Input',
          disabled: (data) => data.writingsType === '00',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '出版号',
          name: 'publishingNo',
          type: 'Input',
          disabled: (data) => data.writingsType === '00',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '著作中本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.WritingsRole',
          disabled: (data) => data.writingsType === '00',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '总字数(字)',
          name: 'wordsCount',
          type: 'InputNumber',
          min: 0,
          max: 999999999,
          precision: 0,
          disabled: (data) => data.writingsType === '00',
        },
        //【著作】指标，【著作类别】选“00-无”时不能填写，值置空。
        {
          title: '本人撰写字数(字)',
          name: 'selfWordsCount',
          type: 'InputNumber',
          min: 0,
          max: 999999999,
          precision: 0,
          disabled: (data) => data.writingsType === '00',
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
    },
    {
      //论文
      type: 'Array',
      title: '论文',
      name: 'papers',
      fields: [
        {
          title: '论文名称',
          required: true,
          name: 'name',
          type: 'Input',
        },
        {
          title: '是否是代表性成果和项目',
          default: '0',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
        },
        {
          title: '发表刊物名称',
          name: 'journalName',
          type: 'Input',
        },
        {
          title: '发表年月',
          name: 'publishDate',
          type: 'DatePicker',
          format: 'YYYY-MM',
        },
        {
          title: '卷号',
          name: 'volumeNum',
          type: 'Input',
        },
        {
          title: '期号',
          name: 'issueNum',
          type: 'Input',
        },
        {
          title: '起始页码',
          name: 'startPage',
          type: 'InputNumber',
          min: 0,
          max: 99999,
          precision: 0,
        },
        {
          title: '结束页码',
          name: 'endPage',
          type: 'InputNumber',
          min: 0,
          max: 99999,
          precision: 0,
        },
        {
          title: '本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.PapersRole',
        },
        {
          title: '学科领域',
          name: 'academicArea',
          type: 'Input',
        },
        {
          title: '论文收录情况',
          name: 'included',
          type: 'Select',
          dictionary: 'teacherArchive.PaperInclusionStatus',
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
    },
    {
      //奖励
      type: 'Array',
      title: '奖励',
      name: 'awards',
      fields: [
        {
          title: '奖励类别',
          required: true,
          name: 'awardType',
          type: 'Select',
          dictionary: 'teacherArchive.RewardType',
          reactions: [
            {
              type: 'clear',
              when: (value) => value === '0',
              target: [
                'representFlag',
                'awardDate',
                'awardName',
                'awardLevel',
                'otherLevel',
                'rank',
                'awardCountry',
                'awardOrg',
              ],
            },
          ],
        },
        //【奖励】指标，【奖励类别】选“0-无”时不能填写，值置空。默认为【0-否】
        {
          title: '是否是代表性成果和项目',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
          default: '0',
          disabled: (data) => data.awardType === '0',
        },
        //【奖励】指标。【奖励类别】选“0-无”时不能填写，值置空。
        {
          title: '获奖年月',
          name: 'awardDate',
          type: 'DatePicker',
          format: 'YYYY-MM',
          disabled: (data) => data.awardType === '0',
        },
        //【奖励】指标。【奖励类别】选“0-无”时不能填写，值置空。
        {
          title: '奖励名称',
          name: 'awardName',
          type: 'Input',
          disabled: (data) => data.awardType === '0',
        },
        // 【奖励】指标。【奖励类别】选“0-无”时不能填写，值置空。
        {
          title: '奖励等级',
          name: 'awardLevel',
          type: 'Select',
          dictionary: 'teacherArchive.RewardLevel',
          disabled: (data) => data.awardType === '0',
          reactions: [
            {
              type: 'clear',
              target: 'otherLevel',
            },
          ],
        },
        //【奖励等级】为【9-其他】是，可以录入，否则，不能录入，值置空,【奖励类别】选“0-无”时不能填写，值置空。
        {
          title: '奖励其他等级',
          name: 'otherLevel',
          type: 'Input',
          disabled: (data) => data.awardLevel !== '9',
        },
        //【奖励】指标。【奖励类别】选“0-无”时不能填写，值置空。
        {
          title: '本人排名',
          name: 'rank',
          type: 'Select',
          dictionary: 'teacherArchive.Rank',
          disabled: (data) => data.awardType === '0',
        },
        //默认为“156-中国”，【奖励类别】选“0-无”时不能填写，值置空。
        {
          title: '授奖国家(地区)',
          default: '156',
          name: 'awardCountry',
          type: 'Select',
          dictionary: 'teacherArchive.Country',
          disabled: (data) => data.awardType === '0',
        },
        //【奖励类别】选“0-无”时不能填写，值置空。
        {
          title: '授奖单位',
          name: 'awardOrg',
          type: 'Input',
          disabled: (data) => data.awardType === '0',
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
    },
    {
      //文艺作品
      type: 'Array',
      title: '文艺作品',
      name: 'literarys',
      fields: [
        {
          title: '文艺作品类别',
          required: true,
          name: 'literaryType',
          type: 'Select',
          dictionary: 'teacherArchive.LiteraryWorksType',
          reactions: [
            {
              type: 'clear',
              when: (value) => value === '0',
              target: [
                'representFlag',
                'literaryName',
                'role',
                'finishDate',
                'finishPlace',
                'workDesc',
              ],
            },
          ],
        },
        //【文艺作品类别】选“0-无”时不能填写，值置空。默认为【0-否】
        {
          title: '是否是代表性成果和项目',
          default: '0',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
          disabled: (data) => data.literaryType === '0',
        },
        //【文艺作品类别】选“0-无”时不能填写，值置空。
        {
          title: '文艺作品名称',
          name: 'literaryName',
          type: 'Input',
          disabled: (data) => data.literaryType === '0',
        },
        //【文艺作品类别】选“0-无”时不能填写，值置空。
        {
          title: '本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.LiteraryRole',
          disabled: (data) => data.literaryType === '0',
        },
        //【文艺作品类别】选“0-无”时不能填写，值置空。
        {
          title: '完成时间',
          name: 'finishDate',
          type: 'DatePicker',
          format: 'YYYY-MM-DD',
          disabled: (data) => data.literaryType === '0',
        },
        //【文艺作品类别】选“0-无”时不能填写，值置空。
        {
          title: '完成地点',
          name: 'finishPlace',
          type: 'Input',
          disabled: (data) => data.literaryType === '0',
        },
        //【文艺作品类别】选“0-无”时不能填写，值置空。500字以内。
        {
          title: '本人工作描述',
          name: 'workDesc',
          type: 'Textarea',
          disabled: (data) => data.literaryType === '0',
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
    },
    {
      //专利或软件著作权
      type: 'Array',
      title: '专利或软件著作权',
      name: 'copyrights',
      fields: [
        {
          title: '专利或软件著作权类型',
          required: true,
          name: 'copyrightType',
          type: 'Select',
          dictionary: 'teacherArchive.PatentOrSoftwareType',
          reactions: [
            {
              type: 'clear',
              when: (value) => value === '0',
              target: [
                'representFlag',
                'copyrightName',
                'academicArea',
                'approveDate',
                'role',
                'copyrightNo',
              ],
            },
          ],
        },
        //【专利或软件著作权类型】选“0-无”时不能填写，值置空。默认为【0-否】
        {
          title: '是否是代表性成果和项目',
          default: '0',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
          disabled: (data) => data.copyrightType === '0',
        },
        //【专利或软件著作权类型】选“0-无”时不能填写，值置空。
        {
          title: '专利或软件著作权名称',
          name: 'copyrightName',
          type: 'Input',
          disabled: (data) => data.copyrightType === '0',
        },
        //【专利或软件著作权类型】选“0-无”时不能填写，值置空。
        {
          title: '学科领域',
          name: 'academicArea',
          type: 'Input',
          disabled: (data) => data.copyrightType === '0',
        },
        //默认当前日期，专利或软件著作权类型】选“0-无”时不能填写，值置空。
        {
          title: '批准日期',
          name: 'approveDate',
          type: 'DatePicker',
          format: 'YYYY-MM-DD',
          default: () => dayjs().startOf('day'),
          disabled: (data) => data.copyrightType === '0',
        },
        //专利或软件著作权类型】选“0-无”时不能填写，值置空。
        {
          title: '本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.PatentRole',
          disabled: (data) => data.copyrightType === '0',
        },
        //专利或软件著作权类型】选“0-无”时不能填写，值置空。
        {
          title: '专利号(登记号)',
          name: 'copyrightNo',
          type: 'Input',
          disabled: (data) => data.copyrightType === '0',
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
    },
    {
      //报告
      type: 'Array',
      title: '报告',
      name: 'reports',
      fields: [
        {
          title: '报告题目',
          required: true,
          name: 'reportTopic',
          type: 'Input',
        },
        {
          title: '是否是代表性成果和项目',
          default: '0',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
        },
        {
          title: '本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.ReportRole',
        },
        {
          title: '报告时间',
          name: 'reportDate',
          type: 'DatePicker',
          format: 'YYYY-MM-DD',
        },
        {
          title: '委托方',
          name: 'delegator',
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
    },
    {
      //国家医药证书
      type: 'Array',
      title: '国家医药证书',
      name: 'medicalCerts',
      fields: [
        {
          title: '国家医药证书名称',
          required: true,
          name: 'certName',
          type: 'Input',
        },
        {
          title: '是否是代表性成果和项目',
          default: '0',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
        },
        {
          title: '证书(批件)号',
          name: 'certNo',
          type: 'Input',
        },
        {
          title: '本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.LiteraryRole',
        },
        {
          title: '颁布或批准时间',
          name: 'approveDate',
          type: 'DatePicker',
          format: 'YYYY-MM-DD',
        },
        {
          title: '有效期',
          name: 'validDate',
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
    },
    {
      //国家/行业标准
      type: 'Array',
      title: '国家/行业标准',
      name: 'standards',
      fields: [
        {
          title: '标准号',
          required: true,
          name: 'standardNo',
          type: 'Input',
        },
        {
          title: '是否是代表性成果和项目',
          default: '0',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
        },
        {
          title: '本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.ReportRole',
        },
        {
          title: '发布日期',
          name: 'publishDate',
          type: 'DatePicker',
          format: 'YYYY-MM-DD',
        },
        {
          title: '发布单位',
          name: 'publishOrg',
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
    },
    {
      //指导学生获奖
      type: 'Array',
      title: '指导学生获奖',
      name: 'competitionAdvisors',
      fields: [
        {
          title: '奖励名称',
          required: true,
          name: 'awardName',
          type: 'Input',
        },
        {
          title: '是否是代表性成果和项目',
          default: '0',
          name: 'representFlag',
          type: 'Select',
          dictionary: 'teacherArchive.YesOrNo',
        },
        {
          title: '本人角色',
          name: 'role',
          type: 'Select',
          dictionary: 'teacherArchive.GuidanceRole',
        },
        {
          title: '奖项等级',
          name: 'awardLevel',
          type: 'Input',
        },
        {
          title: '获奖年月',
          name: 'awardDate',
          type: 'DatePicker',
          format: 'YYYY-MM',
        },
        //500字以内。
        {
          title: '本人承担工作描述',
          name: 'workDesc',
          type: 'Textarea',
          maxlength: 500,
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
    },
  ],
};
