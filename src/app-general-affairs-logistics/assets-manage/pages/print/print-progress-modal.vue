<script lang="ts" setup>
import { computed, ref } from 'vue';

const props = defineProps<{
  isStop: boolean;
  printedCount: number;
  total: number;
  printError: string;
}>();

const emit = defineEmits<{
  (e: 'handlePrint'): void;
  (e: 'cancel'): void;
}>();

const show = ref(false);

const pintPercent = computed(() => {
  return Math.round((props.printedCount / props.total) * 100);
});

const close = () => {
  show.value = false;
};

const open = () => {
  show.value = true;
};

defineExpose({ close, open });
</script>

<template>
  <u-modal
    v-model="show"
    title="打印中..."
    :z-index="999"
    :mask-close-able="false"
    :show-cancel-button="false"
    :show-confirm-button="false"
  >
    <view class="print-progress">
      <view class="print-progress-tip subheadline-regular">请勿开盖或断开蓝牙</view>
      <u-line-progress
        active-color="#1677FF"
        :percent="pintPercent"
        :show-percent="false"
        :height="12"
      ></u-line-progress>
      <view class="print-progress-count subheadline-regular"
        ><text style="color: #1677ff">{{ printedCount }}</text
        ><text> / {{ total }} </text>
      </view>
      <view v-if="printError" class="print-progress-error subheadline-regular">{{
        printError
      }}</view>
    </view>
    <view class="print-progress-footer">
      <u-button style="flex: 1; margin-right: 24rpx" @click="emit('handlePrint')">{{
        isStop ? '继续打印' : '暂停打印'
      }}</u-button>
      <u-button style="flex: 1" type="primary" @click="emit('cancel')">取消打印</u-button>
    </view>
  </u-modal>
</template>

<style lang="scss" scoped>
.print-progress {
  padding: 16rpx 48rpx 0;
  text-align: center;
  &-tip {
    margin-bottom: 16rpx;
  }
  &-count {
    margin-top: 16rpx;
  }
  &-error {
    margin-top: 16rpx;
    color: $color-error;
  }
  &-footer {
    display: flex;
    align-items: center;
    padding: 48rpx;
  }
}
</style>
