import icon_apply_default from '../../static/attendance/icon_apply_default.svg';
import icon_apply_normal from '../../static/attendance/icon_apply_normal.svg';
import icon_attendance_default from '../../static/attendance/icon_my_attendance_default.svg';
import icon_attendance_selected from '../../static/attendance/icon_my_attendance_selected.svg';

export const defaultTabbarList = [
  {
    customIcon: false,
    iconPath: 'home',
    selectedIconPath: 'home-fill',
    text: '首页',
    key: 'home',
  },
  {
    iconPath: icon_apply_default,
    selectedIconPath: icon_apply_normal,
    text: '课题申报',
    key: 'declare',
  },
  {
    iconPath: icon_attendance_default,
    selectedIconPath: icon_attendance_selected,
    text: '我的课题',
    key: 'mine',
  },
];
