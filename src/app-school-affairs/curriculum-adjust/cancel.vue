<template>
  <page class="h100" custom-overflow="hidden">
    <view class="h100 flex-column-plain">
      <view class="flex-stretch scroll-hidden">
        <scroll-view scroll-y style="height: 100%; width: 100%">
          <view class="flex-center h-96 pl-l" style="background-color: rgba(250, 251, 252, 1)">
            <image class="icon-40 no-shrink" :src="iconWarning" />
            <view class="tip-text">撒销后此申请作废，请谨慎处理~</view>
          </view>
          <view class="plr-l ptb-b">
            <view class="bg-white radius-default plr-l ptb-b">
              <view class="card-title">撤销原因</view>
              <view class="textarea-wrap">
                <textarea
                  v-model="remark"
                  class="textarea-dom"
                  placeholder="请输入撤销原因"
                  :maxlength="200"
                />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="bg-white no-shrink ptb-b plr-l bottom-shadow">
        <view class="button-cancel" @click="handleCancel">提交</view>
        <view class="bg-white no-shrink safe-area-inset-bottom"></view>
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { getPageParams } from '@/utils/tools';
import { onBeforeMount, ref } from 'vue';
import { updateAdjust } from '../services/curriculum-adjust';
import iconWarning from '../static/course-info/warning.svg';

interface IPageParam {
  id: string;
}
const pageParam = ref({} as IPageParam);
const remark = ref('');
async function handleCancel() {
  if (pageParam.value && pageParam.value.id) {
    try {
      await updateAdjust(pageParam.value.id, {
        remark: (remark.value || '').trim().substring(0, 200),
        status: 3,
      });
      uni.$emit('UPDATE_ADJUST_DETAIL');
      uni.$emit('UPDATE_MINE_ADJUST_LIST');
      uni.navigateBack();
    } catch (error: any) {
      console.log(error);
    }
  }
}

onBeforeMount(() => {
  pageParam.value = getPageParams();
});
</script>

<style lang="scss" scoped>
.card-title {
  font-weight: 500;
  font-size: 32rpx;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
}

.button-cancel {
  border-radius: 16rpx;
  height: 80rpx;
  color: #ffffff;
  text-align: center;
  line-height: 80rpx;
  font-weight: 500;
  font-size: 30rpx;
  background-color: rgba(22, 119, 255, 1);
}

.bottom-shadow {
  z-index: 2;
  box-shadow: 0 -2px 4px 0 rgba(0, 0, 0, 0.08);
}

.textarea-wrap {
  margin-top: 24rpx;
  .textarea-dom {
    color: $ui-color-base;
    font-size: $ui-font-size-content;
    height: 424rpx;
    line-height: 40rpx;
    padding-top: 24rpx;
    width: 100%;
  }
}

.tip-text {
  flex: 1;
  margin-left: 24rpx;
  font-size: 30rpx;
  color: rgba(0, 0, 0, 0.88);
}
</style>
