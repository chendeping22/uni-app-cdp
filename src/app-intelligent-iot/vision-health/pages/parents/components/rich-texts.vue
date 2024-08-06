<template>
  <view :class="[className, 'font-title']">
    <view v-for="(node, inx) in richTextNodes" :key="`node_${inx}`">
      <template v-if="node.type === 'p'">
        <rich-text :nodes="node.content" />
      </template>
      <!--图片逻辑有问题, 暂时不显示-->
      <template v-else-if="node.type === 'image'">
        <image
          :src="node.content"
          class="img"
          mode="widthFix"
          @click="handleClickImg(node.content)"
        />
      </template>
      <template v-else-if="node.type === 'video'">
        <video :src="node.content" style="width: 100%" />
      </template>
      <template v-else-if="node.type === 'audio'">
        <!--不支持音频-->
        <view class="flex-center color-disabled">{{ `--暂不支持音频--` }}</view>
      </template>
      <template v-else>
        <view class="flex-center color-disabled">{{ `--暂不支持其它插件--` }}</view>
      </template>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { isNil } from '@/utils/lodash-es';
import { ref, watchEffect } from 'vue';

/** 1. props定义 */
interface IProps {
  className?: string | string[];
  strings: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  className: '',
});

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits([]);
// emits('XXX', val); // 用法

/** 3. your code here! */
// const count = ref(0);

const richTextNodes = ref<{ type: string; content: string }[]>([]);

const transformImageUrl = (url: string) => {
  if (!url) return '';
  return url
    .replace('https://testimpfile.lexikos.com', 'http://testimp.leedarson.com:12000')
    .replace(/\?.*$/, '');
};

const seperateVedioAudio = (richText: string) => {
  const seperateTagRegs = /.+?(<\/div>|<\/p>)/g;
  const seperateMatchTags = richText.match(seperateTagRegs) || [];
  const tagReg = /<div|<p/;
  const urlReg =
    /((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/g;
  const nodes = seperateMatchTags.map(t => {
    const tmpMatch = t.match(tagReg);
    if (tmpMatch && tmpMatch[0] === '<p') {
      return {
        type: 'p',
        content: t,
      };
    } else {
      const url = t.match(urlReg);
      if (t.includes('<img')) {
        return {
          type: 'image',
          content: transformImageUrl(url?.[0] || ''),
        };
      }
      if (t.includes('<video')) {
        return {
          type: 'video',
          content: transformImageUrl(url?.[0] || ''),
        };
      }
      if (t.includes('<audio')) {
        return {
          type: 'audio',
          content: transformImageUrl(url?.[0] || ''),
        };
      }
      return {
        type: 'other',
        content: t,
      };
    }
  });
  return nodes;
};

const handleClickImg = (url: string) => {
  uni.previewImage({
    urls: [url],
    current: 0,
  });
};

// 只执行一次
const stop = watchEffect(() => {
  if (isNil(props.strings) || props.strings === '') return;
  richTextNodes.value = seperateVedioAudio(props.strings);
  stop();
});
</script>

<style scoped lang="scss">
.img {
  max-width: calc(100vw - 64rpx);
}
</style>
