import bar_icon_statistics_default from '../../static/attendance/bar_icon_statistics_default.svg';
import bar_icon_statistics_pitch from '../../static/attendance/bar_icon_statistics_pitch.svg';
import icon_apply_default from '../../static/attendance/icon_apply_default.svg';
import icon_apply_normal from '../../static/attendance/icon_apply_normal.svg';
import icon_attendance_default from '../../static/attendance/icon_my_attendance_default.svg';
import icon_attendance_selected from '../../static/attendance/icon_my_attendance_selected.svg';

export interface ITabBarItem {
  pagePath?: string;
  iconPath: string;
  selectedIconPath: string;
  text: string;
  count?: number;
  isDot?: boolean;
  id: string;
}
export const defaultTabbarList: ITabBarItem[] = [
  {
    iconPath: icon_attendance_default,
    selectedIconPath: icon_attendance_selected,
    text: '我的考勤',
    id: 'attendance',
  },
  {
    iconPath: icon_apply_default,
    selectedIconPath: icon_apply_normal,
    text: '我的申请',
    id: 'apply',
  },
];

export const statisticTabbarList: ITabBarItem[] = [
  {
    iconPath: bar_icon_statistics_default,
    selectedIconPath: bar_icon_statistics_pitch,
    text: '统计',
    id: 'statistics',
  },
];
