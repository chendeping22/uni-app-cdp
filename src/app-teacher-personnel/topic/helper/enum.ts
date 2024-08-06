import type { TopicLevel } from '../types';
import { type LabelValue } from '../types';

const eduLevelEnum: LabelValue<string, TopicLevel>[] = [
  {
    label: '国家级',
    value: 1,
  },
  {
    label: '省级',
    value: 2,
  },
  {
    label: '地市级',
    value: 3,
  },
  {
    label: '区县级',
    value: 4,
  },
];

const schoolLevelEnum: LabelValue<string, TopicLevel>[] = [
  {
    label: '校级',
    value: 5,
  },
];

const levelEnum: LabelValue<string, TopicLevel>[] = [
  {
    label: '国家级',
    value: 1,
  },
  {
    label: '省级',
    value: 2,
  },
  {
    label: '地市级',
    value: 3,
  },
  {
    label: '区县级',
    value: 4,
  },
  {
    label: '校级',
    value: 5,
  },
];

const stageEnum = [
  {
    label: '课题申报',
    value: 1,
  },
  {
    label: '开题论证',
    value: 2,
  },
  {
    label: '中期检查',
    value: 3,
  },
  {
    label: '结题鉴定',
    value: 4,
  },
  {
    label: '已结题',
    value: 5,
  },
];

/**
 * 立项状态
 */
const topicStatusEnum = [
  {
    label: '草稿',
    value: 0,
  },
  {
    label: '待审核',
    value: 1,
  },
  {
    label: '已立项',
    value: 2,
  },
  {
    label: '不通过',
    value: 3,
  },
];

/**
 * 申报状态-申报阶段
 */
const declareStatusEnum = [
  {
    label: '校级待审核',
    value: 1,
    color: 'blue',
  },
  {
    label: '县级待审核',
    value: 2,
    color: 'blue',
  },
  {
    label: '已立项',
    value: 3,
    color: 'green',
  },
  {
    label: '校级不通过',
    value: 4,
    color: 'red',
  },
  {
    label: '县级不通过',
    value: 5,
    color: 'red',
  },
];

/**
 * 申报状态-申报阶段（校级）
 */
const schoolDeclareStatusEnum = [
  {
    label: '校级待审核',
    value: 1,
    color: 'blue',
  },
  {
    label: '已立项',
    value: 3,
    color: 'green',
  },
  {
    label: '校级不通过',
    value: 4,
    color: 'red',
  },
];

/**
 * 中期检查状态
 */
const termCheckStatusEnum = [
  {
    label: '未评定',
    value: 0,
    color: 'default',
  },
  {
    label: '不合格',
    value: 1,
    color: 'red',
  },
  {
    label: '合格',
    value: 2,
    color: 'green',
  },
];

/**
 * 结题鉴定状态
 */
const authenticateStatusEnum = [
  {
    label: '未评定',
    value: 0,
    color: 'default',
  },
  {
    label: '不合格',
    value: 1,
    color: 'red',
  },
  {
    label: '合格',
    value: 2,
    color: 'green',
  },
  {
    label: '良好',
    value: 4,
    color: 'green',
  },
  {
    label: '优秀',
    value: 3,
    color: 'green',
  },
];
const stageMap = {
  1: '课题申报',
  2: '开题论证',
  3: '中期检查',
  4: '结题鉴定',
};

export {
  authenticateStatusEnum,
  declareStatusEnum,
  eduLevelEnum,
  levelEnum,
  schoolDeclareStatusEnum,
  schoolLevelEnum,
  stageEnum,
  stageMap,
  termCheckStatusEnum,
  topicStatusEnum,
};
