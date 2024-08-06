import { assessments } from './assessment';
import { certificates } from './certificate';
import { contacts } from './contacts';
import { courses } from './course';
import { info } from './info';
import { learningExps } from './learningExps';
import { overseasStudys } from './overseasStudy';
import { postAppoints } from './postAppoint';
import { qualifications } from './qualification';
import { rotations } from './rotation';
import { talentsProjects } from './talentsProject';
import { teachAchievements } from './teachAchievements';
import { techPositions } from './techPosition';
import { trainings } from './training';
import { treatments } from './treatment';
import { virtues } from './virtue';
import { worksExps } from './worksExp';

const schema = [
  // 基本信息
  info,
  // 学习经历
  learningExps,
  // 工作经历
  worksExps,
  // 岗位聘任
  postAppoints,
  // 专业技术职务聘任
  techPositions,
  // 基本待遇
  treatments,
  // 年度考核
  assessments,
  // 教师资格
  qualifications,
  // 师德信息
  virtues,
  // 教育教学
  courses,
  // 教学科研成果及获奖
  teachAchievements,
  // 入选人才项目
  talentsProjects,
  // 国内培训
  trainings,
  // 海外研修(访学)
  overseasStudys,
  // 技能及证书
  certificates,
  // 交流轮岗
  rotations,
  // 联系方式
  contacts,
];

export default schema;
