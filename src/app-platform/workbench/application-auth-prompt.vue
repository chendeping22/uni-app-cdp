<template>
  <page :empty="content" empty-icon="permission"></page>
</template>

<script lang="ts" setup>
import { EOpenSourceType } from '@/utils/handle-share-link';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { getApplication } from '../services/workbench';

const content = ref<string>('暂无权限');

onLoad(async option => {
  const type = option?.type;
  const applicationCode = option?.applicationCode?.split(',')[0];
  const identity = option?.identity;
  const source: EOpenSourceType = option?.source;

  const info = await getApplication(applicationCode);
  if (type + '' === '1') {
    content.value = `${source === EOpenSourceType.wxShare ? '分享给您的' : '打开的'}${
      info?.appName ?? ''
    }需要用${identity}身份登录，请切换身份。`;
  } else if (type + '' === '2') {
    content.value = `${source === EOpenSourceType.wxShare ? '分享给您的' : '打开的'}${
      info?.appName ?? ''
    }无使用权限，请联系管理员。`;
  }
});
</script>

<style scoped lang="scss"></style>
