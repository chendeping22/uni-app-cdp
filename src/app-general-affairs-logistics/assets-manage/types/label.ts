export interface LabelParam {
  type: string;
  /**
   * 属性字段
   */
  fields?: {
    fieldName: string;
    label?: string;
  }[];
  /**
   * 值
   */
  value?: string;
  /**
   * 字体大小 默认2.5
   */
  fontSize?: number;
  /**
   * 长：线的粗细、二维码的大小、字体的行高
   */
  width: number;
  /**
   * 宽，
   */
  height: number;
  /**
   * x坐标
   */
  x: number;
  /**
   * y坐标
   */
  y: number;
  /**
   * 顺时针旋转角度
   */
  rotate?: number;
}

export interface Label {
  id: string;
  /** 标签大小 20*60 */
  size: string;
  /**
   * 标签类型
   */
  type: string;
  /**
   * 字段数量
   */
  fieldNumber: number;
  mode: string;
  width: number;
  height: number;
  items: LabelParam[];
}
