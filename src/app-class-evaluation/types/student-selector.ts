export interface Student {
  /**
   * 班级学号
   */
  classStudentCode: number;
  /**
   * 班级id
   */
  clazzId: string;
  /**
   * 班级名称
   */
  clazzName: string;
  /**
   * 性别
   */
  gender: number;
  /**
   * 年级ID
   */
  gradeId: string;
  /**
   * 年级名称
   */
  gradeName: string;
  /**
   * 头像文件id
   */
  headImg?: string;
  /**
   * 头像url
   */
  headImgUrl?: string;
  /**
   * 学生id
   */
  studentId: string;
  /**
   * 学生姓名
   */
  studentName: string;
}
