import { emailRule, isNumberRule } from '@/app-teacher-personnel/utils/rules';
import { filter } from 'lodash-es';

type DatePickerField = any;
type FieldsGroup = any;
type InputTextField = any;
type SelectField = any;

const name: InputTextField = {
  title: '姓名',
  name: 'name',
  type: 'Input',
  disabled: true,
};

const gender: SelectField = {
  title: '性别',
  name: 'gender',
  type: 'Select',
  required: false,
  dictionary: 'teacherArchive.Gender',
  dictionaryFilter(dictionary) {
    return filter(dictionary, d => ['1', '2'].includes(d.value));
  },
};
const nation: SelectField = {
  title: '民族',
  name: 'nation',
  type: 'Select',
  dictionary: 'teacherArchive.Nation',
  required: false,
  disabled: false,
};
const birthday: DatePickerField = {
  name: 'birthday',
  type: 'DatePicker',
  title: '出生日期',
  format: 'YYYY-MM-DD',
  required: false,
};
const techPosition: SelectField = {
  type: 'Select',
  dictionary: 'teacherArchive.TechPosition',
  title: '专业技术职务',
  name: 'techPost',
};

const adminPost: InputTextField = {
  type: 'Input',
  title: '行政职务',
  name: 'adminPost',
  maxlength: 20,
};

const researchExpertise: InputTextField = {
  type: 'Input',
  title: '研究专长',
  name: 'researchExpertise',
};

const lastDegree: SelectField = {
  name: 'lastDegree',
  type: 'Select',
  dictionary: 'teacherArchive.DegreeLevel',
  required: false,
  title: '最后学位',
};

const lastEducation: SelectField = {
  name: 'lastEducation',
  type: 'Select',
  dictionary: 'teacherArchive.Education',
  required: false,
  title: '最后学历',
};

const phone: InputTextField = {
  name: 'phone',
  type: 'Input',
  rules: [isNumberRule(11)],
  title: '电话',
  required: true,
};

const email: InputTextField = {
  title: 'email',
  name: 'email',
  type: 'Input',
  rules: [emailRule()],
  required: false,
  maxlength: 50,
};

const postalCode: InputTextField = {
  type: 'Input',
  title: '邮政编码',
  name: 'postalCode',
  rules: [
    {
      pattern: /^\d{6}$/,
      message: '邮政编码必须为6位数字',
      trigger: ['change', 'blur'],
    } as any,
  ],
};

const contactAddress: InputTextField = {
  type: 'Input',
  title: '通讯地址',
  name: 'contactAddress',
  maxlength: 50,
};

const workOrg: InputTextField = {
  title: '工作单位',
  name: 'workOrg',
  type: 'Input',
  disabled: true,
};

const schema: FieldsGroup = {
  type: 'Object',
  title: '课题主持人',
  name: 'host',
  fields: [
    name,
    gender,
    nation,
    birthday,
    adminPost,
    techPosition,
    researchExpertise,
    lastEducation,
    lastDegree,
    phone,
    email,
    postalCode,
    workOrg,
    contactAddress,
  ],
};

const memberSchema: FieldsGroup = {
  type: 'Object',
  title: '课题组成员',
  name: 'member',
  fields: [name, birthday, workOrg, techPosition, researchExpertise],
};

export {
  /** 行政职务 */
  adminPost,
  /** 出生年月 */
  birthday,
  /** 工作单位 */
  contactAddress,
  /** email */
  email,
  /** 性别 */
  gender,
  /** 最后学位 */
  lastDegree,
  /** 最后学历 */
  lastEducation,
  memberSchema,
  name,
  /** 民族 */
  nation,
  /** 电话 */
  phone,
  /** 邮政编码 */
  postalCode,
  /** 研究专长 */
  researchExpertise,
  schema,
  /** 专业技术职务 */
  techPosition,
  /** 通讯地址 */
  workOrg,
};
