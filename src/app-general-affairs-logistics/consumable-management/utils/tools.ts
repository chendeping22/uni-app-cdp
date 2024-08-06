import { blankAndSpecialCharacter } from '@/utils/reg';
import { showInfo } from '@/utils/tools';
import { isNil } from 'lodash-es';
// 不能输入全空格或全符号
export const testInputEmptyAndSpecial = (text: string | undefined) => {
  if (!isNil(text) && !blankAndSpecialCharacter.test(text)) {
    showInfo('不能输入全空格或全符号');
  }
};
