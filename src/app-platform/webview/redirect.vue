<template></template>
<script setup lang="ts">
import { goToApplicationWithOpenFrom } from '@/utils/go-to-application';
import { onLoad } from '@dcloudio/uni-app';

const decode = (ctx: string) => {
  const result = decodeURIComponent(ctx);
  if (/^\%/.test(result)) {
    return decode(result);
  }
  return result;
};

onLoad((params: any) => {
  console.debug('webview/redirect', params);
  if (params.path) {
    goToApplicationWithOpenFrom(
      {
        ...params,
        target: Number(params.target),
        type: Number(params.type),
        path: decode(params.path),
      },
      {
        redirect: true,
      },
    );
  }
});
</script>
