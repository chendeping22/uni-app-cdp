<template>
  <template v-if="pageState === 1">
    <ValidateForm @confirm="pageState = 2" />
  </template>
  <template v-else-if="pageState === 2">
    <page v-if="loading">
      <view
        style="
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <u-loading></u-loading>
      </view>
    </page>

    <page v-else-if="[1, 2].includes(state)">
      <view class="payslip-detail-empty-wrap">
        <view class="payslip-detail-empty">
          <image class="empty-image1" :src="warnSvg"></image>
          <view class="empty-text"
            >工资条已被{{ state == 1 ? '撤回' : '删除' }}，查看其他工资条</view
          >
        </view>
        <u-button class="btn" type="primary" block @click="handleBack">查看</u-button>
      </view>
    </page>
    <page v-else>
      <view
        class="payslip-detail"
        :style="{
          height:
            config?.confirmStatus === 2
              ? 'calc(100vh - 158rpx - var(--window-top) - env(safe-area-inset-bottom))'
              : 'calc(100vh - 270rpx - var(--window-top) - env(safe-area-inset-bottom))',
        }"
      >
        <scroll-view :scroll-y="true" style="height: 100%" scroll-with-animation>
          <view class="scroll-inner">
            <view class="date-block">
              {{ title }}
              <!-- <u-icon name="arrow-right" size="32" color="#00000073"></u-icon> -->
            </view>
            <view class="content-block">
              <view class="title">工资明细</view>
              <view class="content-area">
                <view v-for="item in formList" :key="item.label" class="content-item">
                  <view class="left">
                    {{ item.label }}
                  </view>
                  <view class="right">
                    {{ item.value ?? '/' }}
                  </view>
                </view>
              </view>
            </view></view
          >
        </scroll-view>
      </view>
      <view
        class="payslip-detail-bottom safe-area-inset-bottom"
        :style="{ height: config?.confirmStatus === 2 ? '158rpx' : '270rpx' }"
      >
        <template v-if="bottomLoading">
          <view
            style="
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            "
          >
            <u-loading></u-loading>
          </view>
        </template>
        <template v-else>
          <view class="tip-wrap flex-column">
            <view class="tip1">
              <template v-if="config?.confirmStatus === 0 || config?.confirmStatus === 2"
                >如对本工资条有异议请及时进行反馈</template
              >
              <template v-else
                >工资条已于
                <text style="font-weight: 500">{{
                  config?.confirmTime
                    ? dayjs(config?.confirmTime)?.format('YYYY-MM-DD HH:mm:ss')
                    : '-'
                }}</text>
                已确认</template
              >
            </view>
            <view class="tip2">请保护好个人薪资信息，严禁泄露</view>
          </view>

          <view class="btns-wrap" v-if="config?.confirmStatus !== 2">
            <u-button
              v-if="config?.confirmStatus === 0"
              class="btn"
              type="primary"
              block
              :loading="confirmLoading"
              @click="handleConfirm"
              >确认信息</u-button
            >
            <u-button v-else class="btn" type="primary" disabled>已确认</u-button>
          </view>
          <view style="height: 24rpx; flex: none"></view>
        </template>
      </view>
      <Confirm ref="confirmRef"></Confirm>
    </page>
  </template>
</template>

<script setup lang="ts">
import {
  detail,
  doConfirm,
  getConfig,
  getDetailInfo,
} from '@/app-teacher-personnel/payslip/api/payslipDetail';
import ValidateForm from '@/app-teacher-personnel/payslip/components/validate-form.vue';
import warnSvg from '@/app-teacher-personnel/static/payslip/warn.svg';
import Confirm from '@/app-teacher-personnel/topic/components/confirm/index.vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { ref } from 'vue';

const loading = ref(false);
const bottomLoading = ref(false);
const confirmLoading = ref(false);
// 1 密码验证页面 2正常的detail页面
const pageState = ref();
// 正常的detail页面时：1已撤回 2已删除 3正常
const state = ref();
// 获取url参数，id
const id = ref('');
const formList = ref();
const config = ref({});
const title = ref('');

const confirmRef = ref<InstanceType<typeof Confirm>>();

const handleConfirm = async () => {
  if (
    !(await confirmRef?.value?.confirm({
      title: '确认工资条',
      content: '我已查看并确认以上薪资信息无误。',
      confirmText: '确认',
    }))
  ) {
    return;
  }

  try {
    confirmLoading.value = true;
    await doConfirm(id.value);
    uni.showToast({
      title: '确认成功',
      icon: 'success',
    });
    init();
  } catch (error) {
  } finally {
    confirmLoading.value = false;
  }
};

function handleBack() {
  uni.navigateBack();
}

const getDetail = async (_id: any) => {
  if (_id != '') {
    try {
      loading.value = true;
      const res = await getDetailInfo(_id);
      state.value = 3;

      //回显数据
      formList.value = res;
    } catch (error) {
      // 已撤回
      if (error?.code === 671128) {
        state.value = 1;
      } else {
        // 已删除
        state.value = 2;
      }
    } finally {
      loading.value = false;
    }
  }
};

const _getConfig = async (_id: any) => {
  if (_id != '') {
    try {
      bottomLoading.value = true;
      const res = await getConfig(_id);
      // console.log('🚀ccc ~ const_getConfig= ~ res:', res);
      config.value = res || {};
    } catch (error) {
    } finally {
      bottomLoading.value = false;
    }
  }
};

const _getOtherDetail = async (_id: any) => {
  if (_id != '') {
    try {
      const res = await detail(_id);
      title.value = res?.title || '';
    } catch (error) {}
  }
};

function init() {
  getDetail(id.value);
  _getConfig(id.value);
  _getOtherDetail(id.value);
}

onLoad(options => {
  pageState.value = options.pass ? 2 : 1;
  if (options.id) {
    id.value = options.id;
    init();
  }
});
</script>

<style scoped lang="scss">
.payslip-detail-empty-wrap {
  padding: px2rpx(12) px2rpx(16) 0;
  .payslip-detail-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
    border-radius: px2rpx(8);
    margin-bottom: px2rpx(24);
    padding: px2rpx(24) px2rpx(16);
    .empty-image1 {
      width: px2rpx(72);
      height: px2rpx(72);
    }
    .empty-text {
      @include body-regular;
      color: rgba($color-text-base, 0.45);
      margin-top: px2rpx(12);
      text-align: center;
    }
  }
}

.payslip-detail {
  padding: px2rpx(12px) 0;
  .scroll-inner {
    padding: 0 px2rpx(16px);
  }
  .date-block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: px2rpx(12) px2rpx(16);
    background-color: #fff;
    border-radius: px2rpx(8);
    margin-bottom: px2rpx(12);
    @include body-medium;
    color: rgba($color-text-base, 0.88);
  }
  .content-block {
    padding: px2rpx(12);
    background-color: #fff;
    border-radius: px2rpx(8);
    .title {
      @include footnote-medium;
      color: rgba($color-text-base, 0.88);
      margin-bottom: px2rpx(8);
    }
    .content-area {
      padding: px2rpx(12);
      border-radius: px2rpx(8);
      background-color: rgba($color-text-base, 0.02);
      .content-item {
        & + .content-item {
          margin-top: px2rpx(12);
        }
        display: flex;
        .left {
          width: 50%;
        }
        .right {
          width: 50%;
          text-align: right;
          word-break: break-word;
        }
      }
    }
  }
}
.payslip-detail-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: px2rpx(120);
  padding: px2rpx(12) px2rpx(12) 0 px2rpx(12);
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;

  .tip-wrap {
    height: px2rpx(40);

    .tip1 {
      @include subheadline-regular;
      color: rgba($color-text-base, 0.65);
      margin-bottom: px2rpx(4);
      text-align: center;
    }
    .tip2 {
      @include caption-1-regular;
      color: rgba($color-text-base, 0.45);

      text-align: center;
    }
  }

  .btns-wrap {
    display: flex;
    align-items: center;
    margin-top: px2rpx(16);
    .btn {
      flex: auto;
    }
  }
}
</style>
