interface ValidatorRule {
  trigger?: string[];
  message?: string;
  /** custom validate function (Note: callback must be called) */
  validator: () => boolean;
}
export type FieldType = 'Input' | 'InputNumber' | 'Select' | 'DatePicker' | 'Upload';
export type DateType = 'YYYY' | 'YYYY-MM' | 'YYYY-MM-DD';
// type ExpressionPrefix = '{{';
// type ExpressionSuffix = '}}';
// export type Expression = `${ExpressionPrefix}${string}${ExpressionSuffix}`;
// export type WithExpression<T> = T | Expression;
export type Callback<T> = (formData: any, extData?: any) => T;
export type WithCallback<T> = T | Callback<T>;

export type ReactionCallback<T> = (value: any, formData: any) => T;

/** 联动规则 */
export type Reaction =
  | {
      type: 'clear';
      when?: ReactionCallback<boolean>;
      target: string | string[];
    }
  | {
      type: 'set';
      when?: ReactionCallback<boolean>;
      target: string | string[];
      targetValue: any;
    }
  | {
      type: 'callback';
      when?: ReactionCallback<boolean>;
      callback: ReactionCallback<void>;
    };

export type ValidatorRuleCreator = (params: {
  formData: any;
  options?: any[];
  field: Field;
  fields: Field[];
}) => ValidatorRule;

/** 校验规则 */
export type Rule = ValidatorRule | ValidatorRuleCreator;

// $form: 表单值
// 选【13-群众】、【12-无党派民主人士】时不能多选 - 校验
// 可以选择父节点
// 【是否在编】为【0-否】时，必须填写，否则不能填写，同时将值置空
// 【是否在编】为【1-是】时，默认为【1-聘用合同】,否则，默认为【2-劳动合同】
// 照片
// 任职结束年月不能小于任职开始年月

export type BaseField = {
  /** 字段名称 */
  name: string;
  /** 字段标题 */
  title: string;
  /** 是否必填 */
  required?: WithCallback<boolean>;
  /** 是否禁用 */
  disabled?: WithCallback<boolean>;
  /** 是否禁用 */
  hidden?: WithCallback<boolean>;
  /** 默认值 */
  default?: WithCallback<any>;
  /** 不提交后端 */
  ignore?: boolean;
  /** 校验规则 */
  rules?: Rule[];
  /** 联动规则 */
  reactions?: Reaction[];
  /** 提示语 */
  tip?: string;
};

export type InputField = BaseField & {
  type: 'Upload' | 'ImageUpload';
};

export type InputTextField = BaseField & {
  type: 'Input' | 'Textarea' | 'Area';
  maxlength?: number;
};

export type InputNumberField = BaseField & {
  type: 'InputNumber';
  max?: number;
  min?: number;
  precision?: number;
};

export type SelectField = BaseField & {
  type: 'Select';
  /** 字典表 code */
  dictionary: string;
  /** 是否多选(select) */
  multiple?: boolean;
  /** 是否允许选择父节点 */
  allowSelectParent?: boolean;
  dictionaryFilter?: (dictionary: any[], formData: any) => any[];
};

export type DatePickerField = BaseField & {
  type: 'DatePicker';
  /** 日期格式 */
  format?: DateType;
};

export type Field = InputField | InputTextField | InputNumberField | SelectField | DatePickerField;

export type GroupType = 'Object' | 'Array';

export type FieldsGroup = {
  type: GroupType;
  title: string;
  name: string;
  fields: Field[];
};

export type TabsGroup = {
  type: GroupType;
  title: string;
  name: string;
  groups: FieldsGroup[];
};

export type Group = FieldsGroup | TabsGroup;
