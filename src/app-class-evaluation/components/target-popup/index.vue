<template>
  <slot name="trigger" :open="open">
    <view class="list-filter-item" @click="open">
      {{ state.label
      }}<u-image
        class="list-filter-item-down"
        width="32rpx"
        height="32rpx"
        :src="arrow_down_filed"
      ></u-image>
    </view>
  </slot>
  <u-popup
    v-model="show"
    mode="bottom"
    height="50%"
    safe-area-inset-bottom
    @close="handleClose"
    :border-radius="32"
  >
    <view class="type-popup">
      <view class="type-popup-header">
        <view class="type-popup-cancel" @click="reset">取消</view>
        <view class="type-popup-title">全部类型</view>
        <view class="type-popup-sure" @click="confirm">确定</view>
      </view>
      <scroll-view scroll-y class="type-popup-scroll">
        <TypeContent v-model="typeData" multiple :list="state.list" />
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import arrow_down_filed from '@/app-class-evaluation/static/arrow_down_filed.svg';
import { filter } from 'lodash-es';
import { computed, reactive, ref, watch } from 'vue';
import TypeContent from '../TypeContent.vue';

const props = defineProps<{
  value?: any[];
  list: Student[];
}>();
const emits = defineEmits(['onClose', 'change', 'update:value']);

const show = ref<boolean>(false);
const typeData = ref<string[]>([]);
const reset = () => {
  show.value = false;
};
const state = reactive<{
  list: any[];
  label: string;
}>({
  list: [],
  label: '全部类型',
});
state.list = computed(() => {
  return props.list.length
    ? [
        {
          label: '全部类型',
          value: '',
        },
        ...props.list.map((i, idx) => ({ value: i.id, label: i.indicatorName })),
      ]
    : [];
});

const handleClose = () => {
  show.value = false;
  emits('onClose');
};

const confirm = () => {
  emits('update:value', typeData.value);
  emits('change', typeData.value);
  show.value = false;
};
watch(
  () => props.value,
  newVal => {
    typeData.value = newVal || [];
    if (filter(typeData.value, i => i === '').length || typeData.value.length === 0) {
      state.label = '全部类型';
    } else {
      state.label = `已选：${typeData.value.length}项`;
    }
  },
  {
    immediate: true,
  },
);
const open = () => {
  show.value = true;
};
</script>

<style lang="scss" scoped>
.type-popup {
  padding-bottom: 24rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
  &-header {
    padding: 24rpx 32rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
    border-bottom: 1rpx solid $color-bg-layout;
    background: #fff;
  }
  &-title {
    text-align: center;
    color: $color-text;
    flex: 1;
  }
  &-sure {
    color: $color-primary;
  }
  &-cancel {
    color: $color-text-label;
  }
  &-scroll {
    padding: 24rpx 32rpx 0;
    height: 100%;
    flex: 1;
    overflow: hidden;
  }
}
.list-filter-item {
  display: flex;
  justify-content: center;
  flex: 2;
  margin-left: 16rpx;
  color: $color-text;
  font-family: 'PingFang SC';
  font-size: 26rpx;
  font-style: normal;
  font-weight: 400;
  overflow: hidden;
  &-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }
  &-down {
    margin-left: 8rpx;
  }
}
</style>
