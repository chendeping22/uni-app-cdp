<template>
  <page v-if="loading">
    <view
      style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center"
    >
      <u-loading></u-loading>
    </view>
  </page>
  <page v-else-if="isDeleted || isNoAccess">
    <view v-if="isNoAccess">
      <EmptyPage description="没有查看权限"> </EmptyPage>
    </view>
    <view v-else>
      <EmptyPage description="批次已被删除，查看其他批次">
        <u-button v-if="!hideDeletedButton" type="primary" @click="toList">{{
          deletedText
        }}</u-button>
      </EmptyPage>
    </view>
  </page>
  <page v-else>
    <view
      class="declare-detail-content"
      style="height: calc(100vh - 180rpx - var(--window-top) - env(safe-area-inset-bottom))"
    >
      <scroll-view :scroll-y="true" style="height: 100%" scroll-with-animation>
        <BatchHeader :data="formState" show-stage />
      </scroll-view>
    </view>
    <view class="declare-bottom" :class="{ canDeclare }">
      <view v-if="canDeclare" class="tip"
        >{{ dayjs(formState?.materials[0].deadline)?.format('YYYY-MM-DD HH:mm') }} 截止</view
      >
      <view class="btns-wrap">
        <u-button v-if="canDeclare" class="btn" type="primary" block @click="toDeclarePage"
          >申报课题</u-button
        >
        <u-button
          v-else
          class="btn"
          type="primary"
          :custom-style="{ background: '#91CAFF' }"
          disabled
          >已截止</u-button
        >
      </view>
    </view>
  </page>
</template>

<script setup lang="ts">
import { detail } from '@/app-teacher-personnel/topic/api/topicBatch';
import BatchHeader from '@/app-teacher-personnel/topic/components/BatchHeader.vue';
import EmptyPage from '@/app-teacher-personnel/topic/components/EmptyPage/index.vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

const isDeleted = ref(false);
const isNoAccess = ref(false);
// 获取url参数，id
const id = ref('');
const formState = ref();
const loading = ref(false);

// 被删除的情况下，不展示删除按钮
const hideDeletedButton = ref(false);

// 目前局级没有课题申报的功能，所以默认到课题申报，消息推送的url也没有type属性，
// 课题详情的url是有type属性的，manage代表课题管理，mine代表我的课题
const deletedText = computed(() => {
  return '返回课题申报';
});

const toList = () => {
  uni.redirectTo({
    url: `/app-teacher-personnel/topic/index?tab=declare`,
  });
};

const toDeclarePage = () => {
  uni.navigateTo({
    url: `/app-teacher-personnel/topic/declare/Declare?batchId=${id.value}&delta=2`,
  });
};

const canDeclare = computed(() => {
  return formState.value?.materials[0]?.deadline > dayjs() && formState.value?.stage == 1;
});

//获取详情
const getDetail = async (_id: any) => {
  if (_id != '') {
    //查询
    loading.value = true;
    const res = await detail(_id, 'declare')
      .catch(e => {
        if (e?.code === 2010005) {
          isDeleted.value = true;
        }
        if (e?.code === 2010006) {
          isNoAccess.value = true;
        }
        return Promise.reject(e);
      })
      .finally(() => {
        loading.value = false;
      });

    //回显数据
    formState.value = res;
  }
};

onLoad(options => {
  if (options.id) {
    id.value = options.id;
    getDetail(options.id);
  }
  hideDeletedButton.value = !!options.hideDeletedButton;
});
</script>

<style scoped lang="scss">
.declare-detail-content {
  padding: px2rpx(12px) px2rpx(16px);
}
.declare-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;

  .tip {
    @include footnote-regular;
    color: rgba($color-text-base, 0.45);
    margin-bottom: px2rpx(8);
    text-align: center;
  }

  .btns-wrap {
    display: flex;
    align-items: center;
    .btn {
      flex: auto;
    }
  }
}
</style>
