import { TagItem } from '../types/record';
export const RecordGuardianTags: TagItem[] = [
  {
    title: '未康复',
    color: '#FFFFFF',
    bgColor: '#FE7C00',
  },
  {
    title: '已康复',
    color: '#FFFFFF',
    bgColor: '#00B42A',
  },
  {
    title: '已作废',
    color: '#4E5969',
    bgColor: '#F2F3F4',
  },
];

export const DiscoveryMode: { [key in number]: string } = {
  1: '保健医发现',
  2: '家长发现',
  3: '老师发现',
  4: '学生提出',
};
