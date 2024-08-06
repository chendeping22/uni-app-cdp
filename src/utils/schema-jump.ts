import { jumpStore } from '@/store/modules/jump';
import { loginStore } from '@/store/modules/login';
import { EOpenSourceType, handleLink, isFromShareLink } from './handle-share-link';
import { log } from './tools';

export const schemaArgsHandle = () => {
  const args = plus.runtime.arguments;
  log('plus.runtime.arguments=', args);
  if (!args) {
    jumpStore().setSchemaParams('');
    return;
  }

  // 已登录，处理schema启动传递的参数
  if (loginStore().authInfo?.accessToken) {
    schemaJump(args);
    return;
  } else {
    jumpStore().setSchemaParams(args);
  }
};

export const handleSchemaJump = () => {
  schemaJump(jumpStore().schemaParams);
  jumpStore().setSchemaParams('');
};

export const schemaJump = (args: any) => {
  try {
    if (!args || args.indexOf('?') === -1) {
      log('schema is null', args);
      return;
    }

    const urlParams = args?.split('?')?.[1];
    const params: { [key: string]: any } = {};
    urlParams.split('&').forEach(item => {
      const [k, v] = item.split('=');
      params[k] = v;
    });
    if (isFromShareLink(params)) {
      handleLink(params, { source: EOpenSourceType.schemaUrl });
    }
  } catch (e) {
    console.log('🚀 ~ file: schema-jump.ts ~ schemaJump ~ e:', e);
  }
};
