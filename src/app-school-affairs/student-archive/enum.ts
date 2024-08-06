export interface ISelect {
  value: any;
  text: string;
  checked: boolean;
}

export const enum_gender = [
  { value: 1, text: '男', checked: false },
  { value: 2, text: '女', checked: false },
];

/** 卡片类型, 仅在学生表单中使用 */
export const enum_cardTypes = [
  { value: 0, text: '身份证', checked: false },
  { value: 1, text: '学籍号', checked: false },
  { value: 2, text: '护照', checked: false },
  { value: 3, text: '通行证', checked: false },
  { value: 4, text: '香港特区护照/身份证明', checked: false },
  { value: 5, text: '澳门特区护照/身份证明', checked: false },
  { value: 6, text: '台湾居民往来大陆通行证', checked: false },
  { value: 7, text: '境外永久居住证明', checked: false },
  { value: 8, text: '其他', checked: false },
];
/** 获取所有证件类型 */
export const certificateTypeAllCodes = enum_cardTypes.map(item => item.value);

/** 获取证件类型的codes去除 学籍号 */
export const certificateTypeCodes = enum_cardTypes
  .filter(item => item.value != 1)
  .map(item => item.value);

/** 住宿类型 */
export const enum_accommodationType = [
  { value: 0, text: '走读', checked: false },
  { value: 1, text: '住校', checked: false },
  { value: 2, text: '半走读', checked: false },
  { value: 3, text: '全晚自习', checked: false },
];

/** 长辈的亲属关系 */
export const enum_parent_relation_ship = [
  { text: '父亲', value: 0, checked: false },
  { text: '母亲', value: 1, checked: false },
  { text: '爷爷', value: 2, checked: false },
  { text: '奶奶', value: 3, checked: false },
  { text: '外公', value: 4, checked: false },
  { text: '外婆', value: 5, checked: false },
  { text: '其他', value: 99, checked: false },
];
