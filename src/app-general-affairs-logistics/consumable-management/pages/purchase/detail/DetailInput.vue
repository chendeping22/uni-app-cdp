<template>
  <view class="material-enter">
    <view v-if="state.list?.length" class="material-collapse">
      <view
        v-for="(item, index) in state.list"
        :key="item.id"
        :index="index"
        class="material-collapse-item"
      >
        <view class="enter-header">
          <view class="enter-header-right" @click="handleOpen">
            <view class="enter-right-wrap">
              <view class="enter-header-name">
                <view class="enter-header-text">{{ item?.name }}</view>
                <view class="enter-header-no">{{ item?.no }}</view>
              </view>
              <view class="enter-header-num">
                <view class="enter-header-price">{{ item?.price * item?.requestNum }}元</view>
                <view class="enter-header-right-no">{{ `${item?.requestNum} ${item?.unit}` }}</view>
              </view></view
            >
            <u-icon :name="open ? 'arrow-up' : 'arrow-down'" color="rgba(0, 0, 0, 0.45)"></u-icon>
          </view>
        </view>
        <MaterialItemContent v-if="open" :data="item" :schema="purchaseList" />
        <view class="enter-content">
          <u-field
            class="custom-field"
            v-model="item.purchasePrice"
            :customStyle="{ paddingLeft: 0, paddingRight: 0 }"
            placeholder="请输入采购单价"
            label="采购单价（元）"
            input-align="right"
            type="digit"
            label-width="200"
            @change="changeState"
            @blur="(e:any) => handleNumberBlur(e.detail.value, index)"
            :border-top="true"
            :trim="false"
          >
          </u-field>
          <u-field
            v-model="item.purchaseRemark"
            :customStyle="{ paddingLeft: 0, paddingRight: 0 }"
            label="采购备注"
            input-align="right"
            placeholder="请输入采购备注"
            :maxlength="30"
            :trim="false"
            @change="changeState"
            @blur="testInputEmptyAndSpecial(item.purchaseRemark)"
          >
          </u-field>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { fixNumber, sp_round } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import MaterialItemContent from '@/app-general-affairs-logistics/consumable-management/components/MaterialItemContent.vue';
import { purchaseList } from '@/app-general-affairs-logistics/consumable-management/pages/material-selector/schema';
import { testInputEmptyAndSpecial } from '@/app-general-affairs-logistics/consumable-management/utils/tools';
import { showInfo } from '@/utils/tools';
import { cloneDeep } from 'lodash-es';
import { reactive, ref, watch } from 'vue';
const props = defineProps({
  value: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits<{
  (e: 'update:value', data: any[]): void;
}>();

const state = reactive<{
  list: any[];
}>({
  list: [],
});

const handleNumberBlur = (v: any, index: number) => {
  let _price = v;
  // // 小程序可以输入多个.
  const _priceSplit = _price.split('.');
  if (_price > 10000000) {
    showInfo('最大金额为10000000');
    _price = '10000000';
  }
  if (_priceSplit.length > 2) {
    _price = `${_priceSplit[0]}.${_priceSplit[1]}`;
  }
  if (_price.length && +_price < 0.01 && _price !== '0') {
    _price = '0.01';
  }
  if (_price && _price !== '0') {
    state.list[index].purchasePrice = sp_round(fixNumber(_price), 2);
  }
};
watch(
  () => props?.value,
  val => {
    if (val) {
      state.list = val;
    }
  },
  {
    immediate: true,
  },
);
const open = ref<boolean>(false);
const changeState = () => {
  emit('update:value', cloneDeep(state.list));
};

const handleOpen = () => {
  open.value = !open.value;
};
</script>

<style lang="scss" scoped>
.material-enter {
  padding: 24rpx 32rpx;
  &-btn {
    margin-top: 48rpx;
  }
}
.material-collapse {
  &-item {
    padding: 24rpx 0;
  }
}
.enter-header {
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #0000000f;
  display: flex;
  width: 100%;
  &-right {
    display: flex;
    justify-content: space-between;
    flex: 1;
    color: #000000a6;
    font-size: 32rpx;
    &-no {
      color: #00000073;
      text-align: right;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }
  }
  &-no {
    color: $color-text-description;
    font-size: 26rpx;
  }
  &-text {
    color: $color-text;
    margin-bottom: 8rpx;
    font-size: 32rpx;
  }
  &-price {
    color: #faad14;
    text-align: right;
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 44rpx;
  }
}
.enter-right-wrap {
  flex: 1;
  display: flex;
  justify-content: space-between;
  margin-right: 24rpx;
}
.enter-content {
  &-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    align-items: center;
    width: 100%;
  }
  &-label {
    color: #000000a6;
    font-size: 30rpx;
    margin-right: 32rpx;
  }
}
</style>
