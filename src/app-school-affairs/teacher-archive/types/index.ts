export type ConditionFieldType = 'text' | 'date' | 'select';

export enum YesOrNo {
  No,
  Yes,
}

export type ConditionField = {
  /** 查询条件字段 code */
  code: string;
  /** 字段标签名称 */
  name: string;
  /** 字段类型: 文本、日期、下拉 */
  type: ConditionFieldType;
  /** 下拉数据来源、日期格式 */
  format: string;
  /** 条件值 */
  value: string;
};

export type ConditionFieldsGroup = {
  /** 分组code */
  schema: string;
  /** 分组名称 */
  name: string;
  /** 字段列表 */
  conditions: ConditionField[];
};

export type FilterInfo = {
  id?: string;
  name: string;
  withSearchVal: YesOrNo;
  conditions: string;
  conditionsParsed: ConditionFieldsGroup[];
};

export type SaveModalParams = {
  type: 'saveAs' | 'save' | 'rename' | 'copy';
  filterInfo?: FilterInfo;
  newFieldsSchema?: ConditionFieldsGroup[];
  formData?: any;
};

export type ChangeLogDetail = {
  fieldName: string;
  newVal: string;
  oldVal: string;
};

export type ChangeLog = {
  archiveType: string;
  archiveTypeDesc: string;
  operateTime: number;
  operateType: string;
  operateTypeDesc: string;
  operator: string;
  operatorId: string;
  details: ChangeLogDetail[];
};
