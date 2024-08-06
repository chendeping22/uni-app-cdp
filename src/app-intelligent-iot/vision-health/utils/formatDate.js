/**
 * 时间格式化（年月日）
 *
 */
export const formatDate = time => {
  let date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};
