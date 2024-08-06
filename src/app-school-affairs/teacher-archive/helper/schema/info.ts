import dayjs from 'dayjs';
import { filter } from 'lodash-es';
import type { Group, Reaction } from '../../types/schema';
import { compareDateRule, exclusiveRule } from '../rules';

const birthdayReaction: Reaction = {
  type: 'callback',
  when: (_, data) => data['certType'] === '1' && data['certNumber']?.length >= 14,
  callback: (_, data) => {
    const date = dayjs(data.certNumber.slice(6, 14), 'YYYYMMDD');
    if (date.isValid()) {
      data['birthday'] = date;
    }
  },
};

export const info: Group = {
  type: 'Object',
  title: '基本信息',
  name: 'info',
  fields: [
    // userId
    {
      title: 'userId',
      name: 'userId',
      type: 'Input',
      disabled: true,
      hidden: true,
    },
    // userId
    {
      title: 'bindTel',
      name: 'bindTel',
      type: 'Input',
      disabled: true,
      hidden: true,
    },
    // 身份证件上的名字
    {
      title: '姓名',
      name: 'name',
      required: true,
      type: 'Input',
    },
    // 默认为“无”
    {
      title: '曾用名',
      name: 'formerName',
      type: 'Input',
    },
    {
      title: '性别',
      name: 'gender',
      type: 'Select',
      required: true,
      dictionary: 'teacherArchive.Gender',
    },
    // 默认“0”，字符型
    {
      title: '教职工号',
      name: 'jobNo',
      type: 'Input',
      default: '0',
    },
    // 默认为【156-中国】
    {
      title: '国籍/地区',
      name: 'nationality',
      type: 'Select',
      required: true,
      dictionary: 'teacherArchive.Country',
      default: '156',
      reactions: [
        {
          type: 'clear',
          when: value => value !== '156',
          target: ['nation', 'politicStatus'],
        },
        {
          type: 'set',
          when: value => value === '156',
          target: 'nation',
          targetValue: '01',
        },
        {
          type: 'set',
          when: value => value === '156',
          target: 'politicStatus',
          targetValue: ['13'],
        },
      ],
    },
    // 默认为【1-居民身份证】
    {
      title: '身份证件类型',
      name: 'certType',
      type: 'Select',
      required: true,
      dictionary: 'teacherArchive.IDCertType',
      default: '1',
      reactions: [birthdayReaction],
    },
    {
      title: '身份证件号',
      name: 'certNumber',
      type: 'Input',
      required: true,
      reactions: [birthdayReaction],
    },
    // 身份证件类型为【1-居民身份证】时，根据身份证件号自动填入出生日期，但可以修改
    {
      title: '出生日期',
      name: 'birthday',
      type: 'DatePicker',
      required: true,
    },
    // 可以手动录入，可以选择输入(从行政区划中选择)
    {
      title: '籍贯',
      name: 'nativePlace',
      type: 'Area',
    },
    // 通过选择行政区划填写
    {
      title: '出生地',
      name: 'birthPlace',
      type: 'Area',
    },
    // 1、国籍/地区为【中国】时必填，否则不能填写，同时将值置空
    // 2、默认为【01-汉族】
    {
      title: '民族',
      name: 'nation',
      type: 'Select',
      required: data => data.nationality === '156',
      disabled: data => data.nationality !== '156',
      dictionary: 'teacherArchive.Nation',
      default: '01',
    },
    // 1、国籍/地区为【中国】时必填，否则不能填写，同时将值置空
    // 2、默认为【13-群众】
    // 3、选【13-群众】、【12-无党派民主人士】时不能多选
    {
      title: '政治面貌',
      name: 'politicStatus',
      type: 'Select',
      required: data => data.nationality === '156',
      disabled: data => data.nationality !== '156',
      multiple: true,
      dictionary: 'teacherArchive.PoliticsStatus',
      default: ['13'],
      rules: [exclusiveRule('12', '13')],
    },
    // 婚姻状况
    {
      title: '婚姻状况',
      name: 'marriageStatus',
      type: 'Select',
      dictionary: 'teacherArchive.MarriageStatus',
    },
    // 默认为【1-健康或良好】
    {
      title: '健康状况',
      name: 'healthStatus',
      type: 'Select',
      dictionary: 'teacherArchive.HealthyStatus',
      default: '1',
    },
    // 引自“学习经历信息表”
    {
      title: '最高学历',
      name: 'highestEducation',
      type: 'Select',
      dictionary: 'teacherArchive.Education',
      required: true,
      reactions: [
        {
          type: 'clear',
          when: value => value === '0',
          target: ['highestEducationOrg'],
        },
      ],
    },
    // 引自“学习经历信息表”
    {
      title: '获得最高学历的院校或机构',
      name: 'highestEducationOrg',
      type: 'Input',
      required: formData => formData.highestEducation !== '0',
      disabled: formData => !(formData.highestEducation !== '0'),
    },
    // 引自“学习经历信息表”
    {
      title: '最高学位层次',
      name: 'highestDegreeLevel',
      type: 'Select',
      dictionary: 'teacherArchive.DegreeLevel',
      required: true,
      reactions: [
        {
          type: 'clear',
          target: ['highestDegreeName', 'highestDegreeOrg'],
        },
      ],
    },
    // 引自“学习经历信息表”
    {
      title: '最高学位名称',
      name: 'highestDegreeName',
      type: 'Select',
      dictionary: 'teacherArchive.Degree',
      required: data => data.highestDegreeLevel !== '0',
      disabled: data => data.highestDegreeLevel === '0',
      dictionaryFilter(dictionary, formData) {
        return filter(dictionary, d => d.value === formData.highestDegreeLevel);
      },
    },
    // 引自“学习经历信息表”
    {
      title: '获得最高学位的院校或机构',
      name: 'highestDegreeOrg',
      type: 'Input',
      required: data => data.highestDegreeLevel !== '0',
      disabled: data => data.highestDegreeLevel === '0',
    },
    // 参加工作年月必须晚于出生年月
    {
      title: '参加工作年月',
      name: 'workDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      required: true,
      rules: [compareDateRule('birthday', 'after')],
    },
    // 进本校年月不能早于参加工作年月
    {
      title: '进本校年月',
      name: 'currentWorkDate',
      type: 'DatePicker',
      format: 'YYYY-MM',
      required: true,
      rules: [compareDateRule('workDate', 'sameOrAfter')],
    },
    // 可以选择父节点
    {
      title: '教职工来源',
      name: 'teacherSource',
      type: 'Select',
      dictionary: 'teacherArchive.TeacherSource',
      allowSelectParent: true,
      required: true,
    },
    // 23 学缘结构
    // 教职工类别
    {
      title: '教职工类别',
      name: 'teacherType',
      type: 'Select',
      dictionary: 'teacherArchive.TeacherType',
      required: true,
    },
    // 默认为【0-否】
    {
      title: '是否在编',
      name: 'internalFlag',
      type: 'Select',
      dictionary: 'teacherArchive.YesOrNo',
      default: '0',
      required: true,
      reactions: [
        {
          type: 'clear',
          when: value => value !== '0',
          target: 'employForm',
        },
        {
          type: 'set',
          when: value => value === '1',
          target: 'contractType',
          targetValue: '1',
        },
        {
          type: 'set',
          when: value => value !== '1',
          target: 'contractType',
          targetValue: '2',
        },
      ],
    },
    // 【是否在编】为【0-否】时，必须填写，否则不能填写，同时将值置空
    {
      title: '用人形式',
      name: 'employForm',
      type: 'Select',
      dictionary: 'teacherArchive.EmployForm',
      required: data => data.internalFlag === '0',
      disabled: data => data.internalFlag !== '0',
    },
    // 【是否在编】为【1-是】时，默认为【1-聘用合同】,否则，默认为【2-劳动合同】
    {
      title: '签订合同情况',
      name: 'contractType',
      type: 'Select',
      dictionary: 'teacherArchive.ContractType',
      required: true,
      default: '2',
    },
    // 引自“岗位聘任信息表”
    {
      title: '现任岗位类别',
      type: 'Select',
      name: 'curPositionType',
      dictionary: 'teacherArchive.PostType',
    },
    // 引自“岗位聘任信息表”
    {
      title: '现任岗位等级',
      type: 'Select',
      name: 'curPositionLevel',
      dictionary: 'teacherArchive.PostLevel',
    },
    // 引自“专业技术职务聘任信息表”
    {
      title: '现任专业技术职务',
      type: 'Select',
      name: 'curTechPosition',
      dictionary: 'teacherArchive.TechPosition',
    },
    // 默认为【0-否】
    {
      title: '是否全日制师范类专业毕业',
      type: 'Select',
      name: 'normalGraduateFlag',
      dictionary: 'teacherArchive.YesOrNo',
      required: true,
      default: '0',
    },
    // 默认为【0-否】
    {
      title: '是否受过特教专业培养培训',
      type: 'Select',
      name: 'specialEducationFlag',
      dictionary: 'teacherArchive.YesOrNo',
      required: true,
      default: '0',
    },
    // 默认为【0-否】
    {
      title: '是否有特殊教育从业证书',
      type: 'Select',
      name: 'specialEducationCertFlag',
      dictionary: 'teacherArchive.YesOrNo',
      required: true,
      default: '0',
    },
    {
      title: '信息技术应用能力',
      type: 'Select',
      name: 'itCapability',
      dictionary: 'teacherArchive.ItCapability',
      required: true,
    },
    // 默认为【0-否】
    {
      title: '是否属于免费（公费）师范生',
      type: 'Select',
      name: 'pubFundedNormalFlag',
      dictionary: 'teacherArchive.PublicFundedNormal',
      required: true,
      default: '0',
    },
    {
      title: '是否参加基层服务项目',
      type: 'Select',
      name: 'baseServiceType',
      dictionary: 'teacherArchive.BaseServiceType',
      required: true,
      default: '0',
      reactions: [
        {
          type: 'clear',
          when: value => value === '0',
          target: ['baseServiceStartDate', 'baseServiceEndDate'],
        },
      ],
    },
    // 【是否参加基层服务项目】不为【0-否】时可以填写，否则不能填写，同时值置空
    {
      title: '参加基层服务项目起始年月',
      type: 'DatePicker',
      name: 'baseServiceStartDate',
      format: 'YYYY-MM',
      disabled: data => data.baseServiceType === '0',
    },
    // 【是否参加基层服务项目】不为【0-否】时可以填写，否则不能填写，同时值置空，有值时，值不能小于【参加基层服务项目起始年月】。
    {
      title: '参加基层服务项目结束年月',
      type: 'DatePicker',
      name: 'baseServiceEndDate',
      format: 'YYYY-MM',
      disabled: data => data.baseServiceType === '0',
      rules: [compareDateRule('baseServiceStartDate', 'sameOrAfter')],
    },
    // 默认为【0-否】
    {
      title: '是否是特级教师',
      type: 'Select',
      name: 'specialGradeTeacherFlag',
      dictionary: 'teacherArchive.YesOrNo',
      required: true,
      default: '0',
    },
    // 默认为【0-否】
    {
      title: '是否县级及以上骨干教师',
      type: 'Select',
      name: 'leadingTeacherFlag',
      dictionary: 'teacherArchive.YesOrNo',
      required: true,
      default: '0',
    },
    // 默认为【0-否】
    {
      title: '是否心理健康教育教师',
      type: 'Select',
      name: 'psychologyTeacherFlag',
      dictionary: 'teacherArchive.PsychologyTeacher',
      required: true,
      default: '0',
    },
    // 默认为【1-在本单位任职】
    {
      title: '人员状态',
      type: 'Select',
      name: 'personalStatus',
      dictionary: 'teacherArchive.PersonalStatus',
      required: true,
      default: '100',
    },
    // 照片规格:26mm(宽)× 32mm(高) ，分辨率150dpi以上。照片要求为jpg格式，文件大小应小于60K。
    {
      title: '个人照片',
      type: 'ImageUpload',
      name: 'personalImg',
      tip: '照片规格:26mm(宽)× 32mm(高) ，分辨率150dpi以上。照片要求为jpg格式，文件大小应小于60K。',
    },
    {
      title: '个人照片Url',
      type: 'Input',
      name: 'personalImgUrl',
      hidden: true,
      ignore: true,
    },
  ],
};
