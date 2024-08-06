<template>
  <view v-if="currentClass.value !== undefined" class="class-card">
    <view class="text-area">
      <view class="box flex-inline" @click="() => handleModalState(true)">
        <text class="text">{{ currentClass?.label }}</text>
        <c-icon name="icon_arrow_down" size="48" color-type="placeholder" />
      </view>
      <view class="box flex-inline" @click="handleTaskList">
        <text class="text text_num">{{
          `${currentClass?.clockinNum || 0}/${currentClass?.studentNum || 0}`
        }}</text>
        <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
      </view>
    </view>
  </view>
</template>

<script lang="ts">
type IListItem = { label?: string; value: string; clockinNum?: number; studentNum?: number };

import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    modalState: {
      type: Boolean,
      default: true,
    },
    taskDate: { type: Number, default: () => NaN },
    currentClass: { type: Object as PropType<IListItem>, default: () => {} },
    classList: { type: Array as PropType<IListItem[]>, default: () => [] },
    tasksId: { type: String, default: () => '' },
  },
  emits: ['onChooseClass', 'onChangeModalState'],
  setup(props, emits) {
    const handleModalState = (state: boolean) => {
      emits.emit('onChangeModalState', state);
    };
    const handleTaskList = () => {
      const { tasksId, currentClass, taskDate } = props;
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/teacher/detail/task-list/index?id=${tasksId}&clazzId=${currentClass?.value}&date=${taskDate}`,
      });
    };

    return {
      handleModalState,
      handleTaskList,
    };
  },
});
</script>

<style lang="scss" scoped>
$height-bar-h5: calc(var(--status-bar-height) + 44px + env(safe-area-inset-bottom) + 216rpx);

.class-card {
  position: relative;
  width: 686rpx;
  margin: $ui-gap-large 0;
  background: $ui-color-white;
  border: 1px solid rgba(230, 232, 235, 1);
  border-radius: 20px;
  box-sizing: border-box;
  padding: $ui-gap-default $ui-gap-large;
  .text-area {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 44rpx;
    .box {
      font-size: $ui-font-size-title;
      color: $ui-color-base;
      font-weight: $ui-font-weight-normal;
      .text {
        margin-right: $ui-gap-default;
      }
      .text_num {
        color: $ui-color-secondary;
      }
      .card_arrow {
        display: inline-block;
        width: 36rpx;
        height: 36rpx;
        vertical-align: text-bottom;
      }
      .transform_cion {
        transform: rotateZ(90deg);
      }
    }
  }
}
</style>
