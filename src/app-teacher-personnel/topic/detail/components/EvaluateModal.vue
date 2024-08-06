<template>
  <u-modal
    v-model="showModal"
    :show-title="false"
    show-confirm-button
    show-cancel-button
    @confirm="confirmHandle"
    @cancel="cancelHandle"
  >
    <view class="wrap">
      <view class="title"
        ><text>{{ params.title }}</text></view
      >
      <view class="tips"
        ><text>{{ params.tip }}</text></view
      >
      <view class="radio-group-wrap">
        <u-radio-group v-model="score" wrap>
          <u-radio v-for="(item, index) in options" :key="index" :name="item.value">
            {{ item.label }}
          </u-radio>
        </u-radio-group>
      </view>
    </view>
  </u-modal>
</template>
<script setup lang="ts">
import { noop } from 'lodash-es';
import { computed, ref } from 'vue';
import { authenticateStatusEnum, termCheckStatusEnum } from '../../helper/enum';

export type ConfirmParams = {
  title: string;
  tip: string;
  stage: number;
  score: number;
};

export type ConfirmResult = { confirm: boolean; data: { score: number } };

const params = ref<ConfirmParams>({
  title: '',
  tip: '',
  stage: 0,
  score: 0,
});

const score = ref(0);

const showModal = ref(false);

const options = computed(() => {
  const list =
    params.value.stage === 3
      ? termCheckStatusEnum
      : params.value.stage === 4
      ? authenticateStatusEnum
      : [];
  return list.filter(i => i.value !== 0).reverse();
});

const promiseHandle = ref({
  resolve: noop as (value: ConfirmResult) => void,
  reject: noop as (value: ConfirmResult) => void,
});
// const modalProps = computed(() => {
//   return {
//     title: params.value.title,
//   };
// });

const confirmHandle = () => {
  promiseHandle.value?.resolve({ confirm: true, data: { score: score.value } });
};

const cancelHandle = () => {
  promiseHandle.value?.resolve({ confirm: false, data: { score: score.value } });
};

defineExpose({
  confirm: (_params: ConfirmParams) => {
    showModal.value = true;
    return new Promise<ConfirmResult>((resolve, reject) => {
      params.value = _params;
      score.value = _params.score;
      promiseHandle.value = { resolve, reject };
    });
  },
});
</script>
<style lang="scss" scoped>
.wrap {
  padding: 24rpx 32rpx;
  .title {
    font-size: 32rpx;
    font-weight: bold;
    line-height: 44rpx;
    margin-bottom: 24rpx;
  }
  .tips {
    font-size: 30rpx;
    line-height: 40rpx;
    color: #000000a6;
    margin-bottom: 8rpx;
  }
}
</style>
