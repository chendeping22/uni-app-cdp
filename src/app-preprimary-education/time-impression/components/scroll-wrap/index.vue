<template>
  <view :class="['_scroll_wrap_comp', className]">
    <scroll-view :show-scrollbar="false" scroll-y :style="{ height: wrapHeight }">
      <slot></slot>
      <slot name="fill"></slot>
    </scroll-view>
  </view>
</template>
<script lang="ts">
import { PropType, defineComponent, getCurrentInstance, onMounted, ref } from 'vue';
export default defineComponent({
  props: {
    className: { type: [String, Array], default: '' },
    mode: { type: String as PropType<'scroll-view' | 'view'>, default: 'scroll-view' },
  },
  emits: [],
  setup() {
    const systemInfo: any = uni.getSystemInfoSync();
    const instance = getCurrentInstance() as any;
    const wrapHeight = ref('0px');
    onMounted(() => {
      uni
        .createSelectorQuery()
        .in(instance)
        .select('._scroll_wrap_comp')
        .boundingClientRect((res: any) => {
          wrapHeight.value =
            systemInfo.windowHeight -
            (systemInfo.safeAreaInsets?.bottom || 0) -
            20 -
            res.top +
            'px';
        })
        .exec();
    });
    return { wrapHeight };
  },
});
</script>
<style scoped lang="scss"></style>
