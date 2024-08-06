<template>
  <view v-for="(item, index) in list" :key="item?.assetId" class="assets-item" @click="open(index)">
    <u-image
      width="80rpx"
      height="80rpx"
      border-radius="8rpx"
      :src="item?.imagesList[0] ? item?.imagesList[0].url : defaultFile"
    ></u-image>
    <view class="assets-item-content">
      <view class="assets-item-name body-regular">{{ item?.assetName || item?.purchaseName }}</view>
      <view v-if="item?.referencePrice || item?.price" class="assets-item-price footnote-regular"
        >￥{{ sp_round(fixNumber(`${item?.referencePrice || item?.price}`), 2) }}</view
      >
    </view>
    <view v-if="item.requestNum" class="assets-item-num body-regular">x{{ item.requestNum }}</view>
    <view class="assets-item-arrow">
      <u-icon name="arrow-right" color="#808080" size="28"></u-icon
    ></view>
  </view>

  <u-popup
    v-model="state.open"
    mode="bottom"
    height="90%"
    closeable
    safe-area-inset-bottom
    border-radius="8"
  >
    <view v-if="node.id" class="asset-detail">
      <scroll-view scroll-y class="asset-detail-scroll-view">
        <view class="asset-detail-header u-flex u-col-top">
          <view class="u-flex-1 title-3-medium">
            {{ node?.assetName || node?.purchaseName || '/' }}
          </view>
          <u-image
            width="112rpx"
            height="112rpx"
            border-radius="8rpx"
            :src="node?.imagesList?.[0]?.url || defaultFile"
          ></u-image>
        </view>
        <template v-if="applicationStatus === 1">
          <view v-if="purchaseStatus !== 0" class="u-flex asset-detail-edit-item">
            <view v-if="node?.purchaseName" style="margin-right: 24rpx; flex: 1">
              <view class="asset-detail-edit-label">入库数量</view>
              <view v-if="readonly" class="callout-regular">{{ node.putNum || '/' }}</view>
              <u-number-box
                v-else
                v-model="state.editData[state.index].putNum"
                :min="1"
                :max="node.requestNum"
              ></u-number-box>
            </view>
            <view style="margin-right: 24rpx; flex: 1">
              <view class="asset-detail-edit-label">采购单价(元)</view>
              <view v-if="readonly" class="callout-regular">{{
                node.price ? `￥${node.price}` : '/'
              }}</view>
              <u-input
                v-else
                v-model="state.editData[state.index].price"
                type="digit"
                :height="60"
                placeholder="请输入"
                :custom-style="{
                  background: '#f2f3f5',
                  borderRadius: '8rpx',
                  paddingLeft: '16rpx',
                  paddingRight: '16rpx',
                }"
                @blur="handlePriceBlur"
              />
            </view>
            <view style="flex: 1">
              <view class="asset-detail-edit-label">采购数量</view>
              <view v-if="readonly" class="callout-regular">{{
                node?.purchaseCanPutNum || node?.putNum || '/'
              }}</view>
              <u-number-box
                v-else
                v-model="state.editData[state.index].putNum"
                :min="1"
                :max="node.requestNum"
              ></u-number-box>
            </view>
          </view>
          <view v-if="type === '2'" class="asset-put-in"
            ><view class="arrow-up"></view>
            <view class="asset-put-in-item">
              <view class="asset-put-in-title">已入库数量</view>
              <view class="asset-put-in-num">{{
                purchaseStatus === 2 ? node?.receivedNum : '/'
              }}</view>
            </view>
            <view class="asset-put-in-item">
              <view class="asset-put-in-title">待入库数量</view>
              <view class="asset-put-in-num">{{
                purchaseStatus === 2 ? node?.waitPutNum : '/'
              }}</view>
            </view>
            <view class="asset-put-in-item">
              <view class="asset-put-in-title">入库中数量</view>
              <view class="asset-put-in-num">{{
                purchaseStatus === 2 ? node?.inStorageNum : '/'
              }}</view>
            </view>
          </view>
          <template v-if="purchaseStatus !== 0">
            <template v-if="!readonly">
              <view class="asset-detail-edit-label">采购供应商</view>
              <view
                class="asset-detail-edit-item asset-detail-supplier u-flex"
                :style="{
                  color: state.editData[state.index].supplierName
                    ? '#303133'
                    : 'rgb(192, 196, 204)',
                }"
              >
                <view
                  class="u-flex-1 asset-detail-supplier-name"
                  @click="state.showSupplier = true"
                  >{{ state.editData[state.index].supplierName || '请选择供应商' }}</view
                >
                <view
                  v-if="state.editData[state.index].supplierId"
                  class="asset-detail-supplier-clear-wrap"
                  @click="clearSupplier"
                >
                  <u-icon
                    name="close-circle-fill"
                    class="asset-detail-supplier-clear"
                    color="#00000073"
                    size="28"
                  ></u-icon>
                </view>
                <u-icon
                  v-else
                  name="arrow-right"
                  color="#00000073"
                  size="24"
                  @click="state.showSupplier = true"
                ></u-icon>
              </view>
            </template>
            <template v-else-if="node?.supplierInfo">
              <view class="asset-detail-edit-label">采购供应商</view>
              <view
                class="asset-detail-edit-item asset-detail-supplier-text callout-regular"
                @click="state.showSupplierDetail = true"
              >
                <view class="asset-detail-supplier-name" style="padding-right: 16rpx">{{
                  node?.supplierInfo?.name || '/'
                }}</view>
                <u-icon name="info-circle" color="#00000073" size="38"></u-icon>
              </view>
            </template>
          </template>
          <view v-if="purchaseStatus !== 0" class="asset-detail-total u-flex">
            <view class="subheadline-regular">采购金额(元)</view>
            <view class="asset-detail-total-value"
              >￥{{
                node.price
                  ? sp_round(
                      fixNumber(`${node.price * (node?.purchaseCanPutNum || node?.putNum)}`),
                      2,
                    )
                  : total
              }}</view
            >
          </view>
        </template>
        <view class="asset-detail-label footnote-medium">采购申请信息</view>
        <view class="asset-detail-list">
          <view class="asset-detail-item">
            <view class="asset-detail-item-label">所属类型：</view>
            <view class="asset-detail-item-value">
              {{ node.equipmentType || '/' }}
            </view>
          </view>
          <view class="asset-detail-item">
            <view class="asset-detail-item-label">品牌：</view>
            <view class="asset-detail-item-value">
              {{ node.brand || '/' }}
            </view>
          </view>
          <view class="asset-detail-item">
            <view class="asset-detail-item-label">型号：</view>
            <view class="asset-detail-item-value">
              {{ node.assetModel || '/' }}
            </view>
          </view>
          <view class="asset-detail-item">
            <view class="asset-detail-item-label">规格：</view>
            <view class="asset-detail-item-value">
              {{ node.assetSize || '/' }}
            </view>
          </view>
          <view class="asset-detail-item">
            <view class="asset-detail-item-label">计量单位：</view>
            <view class="asset-detail-item-value">
              {{ node.assetUnit || '/' }}
            </view>
          </view>
          <template v-if="!node?.purchaseName">
            <view class="asset-detail-item">
              <view class="asset-detail-item-label" style="width: 240rpx">参考单价（元）：</view>
              <view class="asset-detail-item-value">
                {{ node?.referencePrice || '/' }}
              </view>
            </view>
            <view class="asset-detail-item">
              <view class="asset-detail-item-label">申请数量：</view>
              <view class="asset-detail-item-value">
                {{ node?.requestNum || '/' }}
              </view>
            </view>
          </template>
          <view class="asset-detail-item">
            <view class="asset-detail-item-label">备注：</view>
            <view class="asset-detail-item-value">
              {{ node?.requestRemark || node?.remark || '/' }}
            </view>
          </view>
        </view>
      </scroll-view>
      <view class="asset-detail-operate">
        <view
          class="asset-detail-operate-btn"
          :style="{ opacity: state.index ? 1 : 0.5 }"
          @click="onPrev"
        >
          <u-icon name="arrow-left" color="#1677FF" size="32"></u-icon>
          <text class="btn-text">上一个</text>
        </view>
        <view
          class="asset-detail-operate-btn"
          :style="{ opacity: nextDisabled ? 0.5 : 1 }"
          @click="onNext"
        >
          <text class="btn-text">下一个</text>
          <u-icon name="arrow-right" color="#1677FF" size="32"></u-icon>
        </view>
      </view>
    </view>
  </u-popup>
  <SupplierPopup
    v-if="readonly"
    :show="state.showSupplierDetail"
    :name="node?.supplierInfo?.name"
    :code="node?.supplierInfo?.code"
    :tel="node?.supplierInfo?.tel"
    :address="node?.supplierInfo?.address"
    :remark="node?.supplierInfo?.notes"
    @close="state.showSupplierDetail = false"
  ></SupplierPopup>
  <u-select
    v-if="!readonly"
    v-model="state.showSupplier"
    mode="single-column"
    :list="state.suppliers"
    @confirm="onConfirmSupplier"
  ></u-select>
</template>

<script setup lang="ts">
import defaultFile from '@/app-general-affairs-logistics/static/assets-manage/upload-file-item.svg';
import { showInfo } from '@/utils/tools';
import { computed, reactive, watch } from 'vue';
import SupplierPopup from '../../components/SupplierPopup';
import { getAssetSuppliers } from '../../services/common.ts';
import { fixNumber, sp_round } from '../../utils/tools';

const props = defineProps<{
  list: any[];
  readonly?: boolean;
  popupOpen?: boolean;
  type?: string; // 2 为清单
  purchaseStatus?: number;
  applicationStatus?: number;
}>();

const emits = defineEmits(['closePopup']);
const state = reactive<{
  open: boolean;
  index: number;
  editData: Record<number, any>;
  showSupplier: boolean;
  showSupplierDetail: boolean;
  suppliers: { value: string; label: string }[];
}>({
  open: false,
  index: -1,
  editData: {},
  showSupplier: false,
  showSupplierDetail: false,
  suppliers: [],
});

const nextDisabled = computed(() => state.index + 1 === props.list.length);
const node = computed(() => props.list[state.index] || {});
const total = computed(() => {
  if (!state.editData[state.index]?.price) {
    return '0.00';
  }
  return sp_round(
    fixNumber(`${state.editData[state.index].price * state.editData[state.index].putNum}`),
    2,
  );
});

const getSuppliers = async () => {
  getAssetSuppliers({
    type: [1],
    currentPage: 1,
    pageSize: 999999,
  })
    .then((res: any) => {
      state.suppliers = (res?.list || []).map((i: any) => ({
        value: i.id,
        label: i.name,
      }));
    })
    .catch((error: any) => {
      if (error?.msg) {
        showInfo(error?.msg);
      }
    });
};
watch(
  () => props.list,
  newVal => {
    if (!props.readonly && state.index === -1 && newVal?.length) {
      state.index = 0;
      state.editData[state.index] = {
        putNum: newVal[0]?.requestNum || 1,
      };
    }
  },
  { immediate: true },
);

watch(
  () => state.index,
  newVal => {
    if (state.index !== -1 && !state.editData[newVal]) {
      state.editData[newVal] = {
        putNum: props.list[newVal]?.requestNum || 1,
      };
    }
  },
);

watch(
  () => props.popupOpen,
  newVal => {
    state.open = newVal;
  },
  { immediate: true },
);

watch(
  () => props.readonly,
  newVal => {
    if (!newVal) {
      getSuppliers();
    }
  },
  { immediate: true },
);

const handlePriceBlur = () => {
  let _price = `${state.editData[state.index].price}`;

  // 小程序可以输入多个.
  const _priceSplit = _price.split('.');
  if (_priceSplit.length > 2) {
    _price = `${_priceSplit[0]}.${_priceSplit[1]}`;
  }

  if (_price.length && +_price < 0.01) {
    _price = '0.01';
  }

  if (_price) {
    state.editData[state.index].price = sp_round(fixNumber(_price), 2);
  }
};

const open = (index?: number) => {
  state.index = index || 0;
  state.open = true;
};

const onConfirmSupplier = (e: any) => {
  if (e?.[0]) {
    state.editData[state.index].supplierName = e[0].label;
    state.editData[state.index].supplierId = e[0].value;
  }
};

const clearSupplier = () => {
  state.editData[state.index].supplierName = '';
  state.editData[state.index].supplierId = '';
};

const onNext = () => {
  if (nextDisabled.value) {
    return;
  }
  state.index = state.index + 1;
};

const onPrev = () => {
  if (!state.index) {
    return;
  }
  state.index = state.index - 1;
};

const onSubmit = () => {
  return new Promise((resolve, reject) => {
    if (!props.list?.length) {
      resolve([]);
      return;
    }
    const _emptyIndex = props.list?.findIndex((item, index) => !state.editData[index]?.price);
    if (_emptyIndex !== -1) {
      showInfo('请设置采购参数再审批');
      emits('closePopup');
      open(_emptyIndex);
      reject();
    } else {
      resolve(props.list.map((item, index) => ({ ...item, ...state.editData[index] })));
    }
  });
};

defineExpose({ onSubmit, open });
</script>

<style lang="scss" scoped>
.assets-item {
  padding: 24rpx 0;
  display: flex;
  align-items: center;
  &-content {
    margin-left: 32rpx;
    flex: 1;
    overflow: hidden;
  }
  &-name {
    @include ellipsis();
    color: $color-text-heading;
  }
  &-price {
    color: $color-text-description;
  }
  &-num {
    margin-top: -4rpx;
    margin-left: 24rpx;
    margin-right: 8rpx;
    color: rgba(0, 0, 0, 0.65);
  }
  &-arrow {
    display: flex;
    width: 40rpx;
    height: 40rpx;
    justify-content: center;
    align-items: center;
  }
  &:not(:last-child) {
    border-bottom: 1rpx solid rgba(245, 245, 245, 1);
  }
}

.asset-detail-supplier {
  background: #f2f3f5;
  border-radius: 8rpx;
  padding-left: 16rpx;
  padding-right: 16rpx;
  height: 60rpx;
  line-height: 60rpx;
  &-text {
    display: flex;
    align-items: center;
  }
  &-name {
    max-width: 100%;
    @include ellipsis();
  }
  &-clear {
    position: relative;
    &-wrap {
      width: 60rpx;
      height: 60rpx;
      margin-right: -16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.asset-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 68rpx;
  overflow: hidden;
  :deep(.assets-card) {
    margin: 0 !important;
  }
}

.asset-detail-edit-item {
  margin-bottom: 24rpx;
}

.asset-detail-edit-label {
  color: $color-text-description;
  padding-bottom: 16rpx;
}

.asset-detail-scroll-view {
  flex: 1;
  overflow: hidden;
  height: 100%;
  padding: 0 32rpx;
}

.asset-detail-header {
  margin-bottom: 24rpx;
  padding-top: 24rpx;
  align-items: center;
  .header-img {
    height: 112rpx;
    width: 112rpx;
    margin-left: 32rpx;
    border-radius: 8rpx;
    overflow: hidden;
    &.icon-default {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f2f2f2;
    }
  }
}

.asset-detail-label {
  padding: 0 0 16rpx;
  color: $color-text-heading;
}

.asset-detail-list {
  padding: 12rpx 24rpx;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: $radius-base;
}
.asset-put-in {
  margin-bottom: 24rpx;
  position: relative;
  padding: 24rpx;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: $radius-base;
  display: flex;
  gap: 24rpx;
}
.asset-put-in-item {
  text-align: center;
  flex: 1;
}
.asset-put-in-title {
  height: 40rpx;
  line-height: 40rpx;
  color: rgba(0, 0, 0, 0.45);
  font-size: 30rpx;
}
.asset-put-in-num {
  margin-top: 4rpx;
  height: 44rpx;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
  font-size: 32rpx;
}
.arrow-up {
  position: absolute;
  top: -14rpx;
  right: 45%;
  width: 0;
  height: 0;
  border-left: 16rpx solid transparent;
  border-right: 16rpx solid transparent;
  border-bottom: 16rpx solid rgba(0, 0, 0, 0.02);
}
.asset-detail-total {
  margin-bottom: 32rpx;
  padding: 0 32rpx;
  height: 116rpx;
  align-items: center;
  border: 1px solid $color-border;
  border-radius: $radius-base;
}

.asset-detail-total-value {
  flex: 1;
  color: $warning-base;
  font-size: 40rpx;
  font-weight: 500;
  text-align: right;
}

.asset-detail-item {
  display: flex;
  padding: 12rpx 0;
  &-label {
    @include subheadline-regular();
    color: $color-text-description;
    width: 180rpx;
  }
  &-value {
    flex: 1;
    @include subheadline-regular();
    text-align: right;
    color: $color-text-heading;
  }
}

.asset-detail-operate {
  display: flex;
  justify-content: space-between;
  padding: 12rpx;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.0784313725);
  &-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    line-height: 44rpx;
    padding: 16rpx;
    .btn-text {
      color: #1677ff;
      margin: 0 8rpx;
    }
  }
}
</style>
