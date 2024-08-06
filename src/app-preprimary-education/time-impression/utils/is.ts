import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';

const getCurrentUserType = () => {
  const { currentUserType } = loginStore();
  return currentUserType;
};

const isGuardian = () => getCurrentUserType() === EUserType.guardian;
const isTeacher = () => getCurrentUserType() === EUserType.teacher;

export { getCurrentUserType, isGuardian, isTeacher };
