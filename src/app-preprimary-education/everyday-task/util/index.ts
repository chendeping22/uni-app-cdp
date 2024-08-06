/**
 * 获取学生详情的日常头像
 * @param imageResps
 */
export function getStudentDetailAvatarUrl(imageResps: { imgUrl: string; type: number }[]) {
  let avatar = '';
  if (Array.isArray(imageResps) && !!imageResps.length) {
    avatar = imageResps.find(item => item.type == 0)?.imgUrl || '';
  }
  return avatar;
}
