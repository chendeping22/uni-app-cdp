<template>
  <u-modal
    v-model="showLog2"
    :show-cancel-button="true"
    :show-confirm-button="false"
    :show-title="false"
    :cancel-text="'关闭'"
    @cancel="closeModal"
  >
    <scroll-view :scroll-y="true" :scroll-with-animation="true" style="padding-bottom: 20rpx">
      <view v-if="logDatas && logDatas.length > 0" class="slot-content">
        <u-time-line>
          <u-time-line-item v-for="(item, index) in logDatas" :key="index + Math.random()">
            <template #node>
              <view>
                <image :src="srcSvg" class="dot"></image>
              </view>
            </template>
            <template #content>
              <view>
                <view class="order-time">{{
                  dayjs(item?.operateTime).format('YYYY-MM-DD HH:mm')
                }}</view>
                <view class="order-box">
                  <view class="order-name">{{ item?.operator }}</view>
                  <view class="order-operation">{{
                    item?.operateType === 1 ? '创建' : '编辑'
                  }}</view>
                  <view v-if="item?.operateType === 2" class="order-content"
                    >【{{ joinData(item?.details) }}】</view
                  >
                </view>
              </view>
            </template>
          </u-time-line-item>
        </u-time-line>
      </view>
      <view v-else style="margin-top: 57rpx">
        <u-empty text="暂无数据" mode="list"></u-empty>
      </view>
    </scroll-view>
  </u-modal>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, watch } from 'vue';
import srcSvg from '../../../static/dot.svg';

const emit = defineEmits(['update:showLog']);

const props = defineProps({
  showLog: {
    type: Boolean,
    default: false,
  },
  logData: {
    type: Array,
    default: () => [],
  },
});

const showLog2 = ref(false);
watch(
  () => props.showLog,
  val => {
    showLog2.value = val;
  },
  { immediate: true },
);
const logDatas = ref(props.logData);
watch(
  () => props.logData,
  val => {
    logDatas.value = val;
  },
  { immediate: true },
);
const closeModal = () => {
  emit('update:showLog', false);
};
const joinData = (list: any) => {
  let arr = [];
  if (list && list.length > 0) {
    arr = list.map((item: any) => {
      return item.fieldName;
    });
    return arr.join('、');
  }
};
</script>

<style lang="scss" scoped>
.slot-content {
  padding: 32rpx 32rpx 40rpx 32rpx;
  max-height: 600rpx;
}
.dot {
  width: 24rpx;
  height: 24rpx;
}
.order-time {
  color: #8c8c8c;
  font-size: 30rpx;
  margin-top: 6rpx;
}
.order-box {
  margin-top: 16rpx;
}
.order-name {
  font-size: 30rpx;
  color: #595959;
  margin-right: 16rpx;
  white-space: nowrap;
  float: left;
}
.order-operation {
  font-size: 30rpx;
  margin-right: 16rpx;
  white-space: nowrap;
  float: left;
}
.order-content {
  font-size: 30rpx;
}
</style>
