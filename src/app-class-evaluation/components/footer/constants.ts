import bookDefault from '@/app-class-evaluation/static/book_default.svg';
import bookSelected from '@/app-class-evaluation/static/book_selected.svg';
import chartDefault from '@/app-class-evaluation/static/chart_default.svg';
import chartSelected from '@/app-class-evaluation/static/chart_selected.svg';
import editDefault from '@/app-class-evaluation/static/edit_default.svg';
import editSelected from '@/app-class-evaluation/static/edit_selected.svg';

export const footList = [
  {
    iconPath: bookDefault,
    selectedIconPath: bookSelected,
    text: '统计',
    title: '班级评比',
  },
  {
    iconPath: chartDefault,
    selectedIconPath: chartSelected,
    text: '报表',
  },
  {
    iconPath: editDefault,
    selectedIconPath: editSelected,
    text: '点评',
    title: '班级点评',
    value: 'evaluator',
  },
  // {
  //   iconPath: settingDefault,
  //   selectedIconPath: settingSelected,
  //   text: '设置',
  // },
];
