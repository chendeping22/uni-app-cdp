import dayjs from 'dayjs';
/**
 * type: 'week', 'month'
 * data: 数组
 * return _current  当前选中的值
 */
export function getCurrent(type: string, data: any[], startDate: string, endDate: string) {
  let _current;
  const startDateVal = dayjs(startDate).startOf('date').valueOf();
  const endDateVal = dayjs(endDate).startOf('date').valueOf();
  const dateVal = dayjs().startOf('date').valueOf();
  const monthDate = dayjs().format('YYYY-MM');
  // 当前学期
  if (dateVal >= startDateVal && dateVal <= endDateVal) {
    if (type === 'week') {
      data.forEach((item, index) => {
        const startVal = dayjs(item.startDate).valueOf();
        const endVal = dayjs(item.endDate).endOf('date').valueOf();
        if (dateVal >= startVal && dateVal <= endVal) {
          _current = index;
        }
      });
    } else {
      data.forEach((item, index) => {
        if (item === monthDate) {
          _current = index;
        }
      });
    }
  }

  // 过去学期
  if (dateVal > endDateVal) {
    _current = 0;
  }
  // 未来学期
  if (startDateVal > dateVal) {
    _current = data.length - 1;
  }
  return _current;
}
