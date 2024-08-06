import { loginStore } from '@/store/modules/login';
import { get, join, map } from '@/utils/lodash-es';
import { log } from '@/utils/tools';
import { Ref, computed, ref } from 'vue';

export type IUseCaptchaAuth = [
  /** vue组件 */
  // Eye: Vue.Component, 微信不支持component
  /** 打码标志，取storage下containsQuery */
  initPrivacyFlag: Ref<boolean>,
  refCaptchaFlag: Ref<boolean>,
  /** 初始化eye状态 */
];
export const CAPTCHA_KEY = 'captcha';

export function getCaptcha(
  txt: string,
  flag: boolean,
  option?: {
    start: number;
    end?: number;
    maskChar?: string;
  },
) {
  log('getCaptcha ----> txt : ', txt);
  log('getCaptcha ----> flag : ', flag);
  const { start = 0, end = 0, maskChar = '*' } = option || {};
  const text = txt;
  if (!flag) {
    return text;
  }
  return join(
    map(text, (char, i) => {
      if (i >= start && i < end) {
        return maskChar;
      }
      return char;
    }),
    '',
  );
}

export default function useCaptchaAuth(detail: boolean): IUseCaptchaAuth {
  // store
  const store = loginStore();
  const refCaptchaFlag = ref(detail);
  const initPrivacyFlag = computed(() => get(store.userInfo, 'containsQuery', false));

  return [initPrivacyFlag, refCaptchaFlag];
}
