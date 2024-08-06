<template>
  <view class="bg" :style="dynamicBackgroundStyle">
    <u-image width="100%" height="356rpx" :src="bgSrc" :show-loading="false"></u-image>
  </view>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: {
    bgColor: {
      type: String,
      default: '',
    },
  },
  emits: ['update'],
  setup(props) {
    const bgSrc = computed(() => {
      return '/static/workbench/workbench_bg.svg';
    });
    const dynamicBackgroundStyle = computed(() => {
      return { background: props.bgColor };
    });

    return { bgSrc, dynamicBackgroundStyle };
  },
});
</script>
<style scoped lang="scss">
.bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: -1;
  height: 356rpx;
}
</style>
