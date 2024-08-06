<template>
  <view
    class="process-item"
    :style="{ backgroundColor: processItem?.bgColor, color: processItem?.color }"
    >{{ title }}</view
  >
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';

import { processTypeEnum } from '../utils/config';

export default defineComponent({
  props: {
    code: {
      default: -1,
      type: Number,
    },
    title: {
      default: '',
      type: String,
    },
  },
  setup(props) {
    const processItem = computed(() => processTypeEnum.find(item => item.value === props.code));

    return {
      processItem,
    };
  },
});
</script>
<style lang="scss" scoped>
.process-item {
  width: 100rpx;
  height: 40rpx;
  font-size: $ui-font-size-secondary;
  font-weight: $ui-font-weight-normal;
  color: $ui-color-white;
  border-radius: $ui-radius-default;
  text-align: center;
  line-height: 40rpx;
}
</style>
