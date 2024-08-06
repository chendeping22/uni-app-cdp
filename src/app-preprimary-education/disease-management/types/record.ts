export interface SymptomItem {
  categoryId: string; //疾病分类ID
  symptomId: string; //症状ID
  symptomName: string; //症状名称
}

export interface RecordItem {
  id: number;
  studentName: string;
  createName: string;
  createTime: string;
  sickenDate: string; //患病日期
  sicknessDuration: number; //患病时长
  symptomList: SymptomItem[]; //疾病症状列表
  status: number; //0未康复 1已康复 2已作废
}

export interface TagItem {
  title: string;
  color: string;
  bgColor: string;
}

export interface DetailOfStudent extends RecordItem {
  clazzName: string;
  remark: string;
  discoveryMode: number;
}

export interface FileItem {
  type: number; //附件类型 1复园诊断书 2、病例报告
  fileId: string;
  fileUrl: string;
}
export interface DetailOfTrack {
  id: string;
  type: number; //跟踪记录类型 1、疾病信息、2、就诊信息、3、康复记录
  createName: string;
  createTime: string;
  symptomList: SymptomItem[]; //疾病症状列表
  fileList: FileItem[];
  healthDate: string; //复园日期
  customFlag: number; //0系统 1自定义（疾病标签使用)
  healthFlag: number; //是否健康 0否 1是
  hospital: string;
  sicknessLabelName: string;
  outpatientFlag: number; //是否就诊 0否 1是
}

export interface SymptomItemInCategoryItem {
  id: string;
  name: string;
  categoryId: string; //疾病分类ID
}
export interface CategoryItem {
  id: string;
  name: string;
  symptomList: SymptomItemInCategoryItem[]; //疾病症状列表
}

export interface SicknessLabelItem {
  id: string;
  name: string; //疾病名称
}
