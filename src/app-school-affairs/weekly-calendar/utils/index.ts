import dayjs from 'dayjs';

// 判断是否处于当前范围
export function isDateRanger(endDate: string, startDate: string, targetDate?: string) {
  const target = targetDate ? dayjs(targetDate) : dayjs();
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return target.isBefore(end) && target.isAfter(start);
}
