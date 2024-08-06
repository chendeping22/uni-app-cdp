export interface ISelect {
  value: any;
  label: string;
  checked: boolean;
}

export const enum_gender = [
  { value: 1, label: '男', checked: false },
  { value: 2, label: '女', checked: false },
];

/** 卡片类型, 仅在学生表单中使用 */
export const enum_cardTypes = [
  { value: 0, label: '身份证', checked: false },
  { value: 1, label: '学籍号', checked: false },
  { value: 2, label: '护照', checked: false },
  { value: 3, label: '通行证', checked: false },
  { value: 4, label: '香港特区护照/身份证明', checked: false },
  { value: 5, label: '澳门特区护照/身份证明', checked: false },
  { value: 6, label: '台湾居民往来大陆通行证', checked: false },
  { value: 7, label: '境外永久居住证明', checked: false },
  { value: 8, label: '其他', checked: false },
];
/** 获取证件类型的codes去除 学籍号 */
export const certificateTypeCodes = enum_cardTypes
  .filter(item => item.value != 1)
  .map(item => item.value);

/** 住宿类型 */
export const enum_accommodationType = [
  { value: 0, label: '走读', checked: false },
  { value: 1, label: '住校', checked: false },
  { value: 2, label: '半走读', checked: false },
  { value: 3, label: '全晚自习', checked: false },
];

/** 长辈的亲属关系 */
export const enum_parent_relation_ship = [
  { label: '父亲', value: 0, checked: false },
  { label: '母亲', value: 1, checked: false },
  { label: '爷爷', value: 2, checked: false },
  { label: '奶奶', value: 3, checked: false },
  { label: '外公', value: 4, checked: false },
  { label: '外婆', value: 5, checked: false },
  { label: '其他', value: 99, checked: false },
];

export const SchoolRules = {
  EnterSchoolRule: '入校规则',
  LeaveSchoolRule: '出校规则',
};
