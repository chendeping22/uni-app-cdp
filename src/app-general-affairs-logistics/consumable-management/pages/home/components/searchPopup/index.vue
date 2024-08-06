<template>
  <view class="search-popup">
    <view class="search-popup-content">
      <view class="popup-body">
        <slot name="search-body">
          <view class="popup-body-input">
            <u-input
              v-model="searchState.searchValues"
              :placeholder="state.codePlaceholder"
              :border="true"
              :clearable="true"
            ></u-input>
            <view
              class="popup-body-time"
              v-if="currentTab !== RecordTypeEnum.InventoryManagementRecord"
            >
              <SearchInput
                v-model="searchState.startTime"
                :placeholder="state.startTimePlaceholder"
                style="flex: 1"
                @onClick="handleOpen(0)"
              ></SearchInput>
              <view class="popup-body-time-center">-</view>
              <SearchInput
                v-model="searchState.endTime"
                :placeholder="state.endTimePlaceholder"
                style="flex: 1"
                @onClick="handleOpen(1)"
              ></SearchInput>
            </view>
            <SearchInput
              v-if="state.showSearchStore"
              v-model="searchState.storeName"
              class="popup-body-store"
              placeholder="请选择入库仓库"
              @onClick="handleStoreOpen"
              @onClear="handleClearStore"
            ></SearchInput>
          </view>
          <view v-if="showStatusList" class="status-list">
            <view class="status-list-title">状态</view>
            <view class="popup-list">
              <view
                v-for="item in stateData"
                :key="item.value"
                class="popup-item"
                :class="
                  searchState.statusList?.includes(item.value)
                    ? 'select-popup-item'
                    : 'normal-popup-item'
                "
                @click="handleChangeStatus(item.value)"
                >{{ item.label }}</view
              >
            </view>
          </view>
        </slot>
      </view>
      <view class="popup-bottom">
        <u-button
          class="popup-bottom-left"
          :custom-style="{ color: '#1677ff' }"
          @click="handleReset"
          >重置</u-button
        >
        <u-button class="popup-bottom-right" type="primary" @click="handleFilterSearch"
          >确定</u-button
        >
      </view>
    </view>
    <u-picker
      v-model="state.show"
      mode="time"
      :default-time="timeDefault"
      :params="{
        year: true,
        month: true,
        day: true,
        hour: false,
        minute: false,
        second: false,
        timestamp: true,
      }"
      @cancel="state.show = false"
      @confirm="handleTimeConfirm"
    ></u-picker>
    <u-select
      v-model="state.showStore"
      :list="storeList"
      label-name="name"
      value-name="id"
      @cancel="state.showStore = false"
      @confirm="handleConfirmStore"
    ></u-select>
    <view class="search-popup-blank" @click="handleClose"></view>
  </view>
</template>

<script setup lang="ts">
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { filter, includes, omit } from 'lodash-es';
import { computed, reactive, ref, watch } from 'vue';
import {
  RecordTypeEnum,
  inventoryStatusList,
  purchaseStatusList,
  statusList,
} from '../../constants';
import SearchInput from './SearchInput.vue';

const emit = defineEmits<{
  (e?: 'onClose'): void;
  (e?: 'onReset'): void;
  (e?: 'onSearch', data?: Record<string, any>): void;
}>();

const props = defineProps<{ currentTab: number; isOpenSearch: boolean; storeList: any[] }>();

const state = reactive<{
  codePlaceholder?: string;
  startTimePlaceholder?: string;
  endTimePlaceholder?: string;
  timeType?: number;
  show?: boolean;
  showStore?: boolean;
  showSearchStore?: boolean;
}>({
  showSearchStore: false,
});

const searchState = reactive<{
  searchValues?: string;
  startTime?: string;
  endTime?: string;
  storeId?: string;
  storeName?: string;
  statusList?: (string | number)[];
  name?: string;
}>({
  statusList: [''],
});

const timeDefault = ref<string | undefined>(dayjs().format('YYYY-MM-DD'));

const showStatusList = computed(() =>
  [
    RecordTypeEnum.PurchaseRequestRecord,
    RecordTypeEnum.ProcurementListRecord,
    RecordTypeEnum.InventoryManagementRecord,
  ].includes(props.currentTab),
);

const stateData = computed(() => {
  switch (props.currentTab) {
    case RecordTypeEnum.PurchaseRequestRecord:
      return statusList;
    case RecordTypeEnum.ProcurementListRecord:
      return purchaseStatusList;
    case RecordTypeEnum.InventoryManagementRecord:
      return inventoryStatusList;
    default:
      return [];
  }
});

const isStatusSingle = computed(
  () => props.currentTab === RecordTypeEnum.InventoryManagementRecord,
);

const handleStoreOpen = () => {
  state.showStore = true;
};

const handleClearStore = () => {
  searchState.storeId = undefined;
  searchState.storeName = undefined;
};

const handleOpen = (type: number) => {
  state.show = true;
  state.timeType = type;
  if (type === 0 && searchState.startTime) {
    timeDefault.value = searchState.startTime;
  }
  if (type === 1 && searchState.endTime) {
    timeDefault.value = searchState.endTime;
  }
};

const handleChangeStatus = (status: string) => {
  // 选中全部-清空其他选中
  if (!status) {
    searchState.statusList = [''];
    return;
  }
  let selectStatus: any = searchState.statusList || [];
  // 选中及取消操作
  if (!includes(selectStatus, status)) {
    selectStatus = isStatusSingle.value ? [status] : selectStatus.concat(status);
  } else {
    selectStatus = filter(selectStatus, v => v !== status);
  }
  // 取消其他状态选中后，默认选中全部
  searchState.statusList = selectStatus?.length ? filter(selectStatus || [], v => v !== '') : [''];
};
const handleConfirmStore = (val: { value?: string; label?: string }[]) => {
  searchState.storeId = val?.[0]?.value;
  searchState.storeName = val?.[0]?.label;
};

const handleTabParams = () => {
  switch (props?.currentTab) {
    // 采购申请
    case RecordTypeEnum.PurchaseRequestRecord:
      state.codePlaceholder = '请输入采购单号/申请人';
      state.showSearchStore = false;
      state.startTimePlaceholder = '申请时间-开始';
      state.endTimePlaceholder = '申请时间-结束';
      break;
    case RecordTypeEnum.ProcurementListRecord:
      state.codePlaceholder = '请输入采购单号/申请人查询';
      state.startTimePlaceholder = '期望到货日期-开始';
      state.endTimePlaceholder = '期望到货日期-结束';
      state.showSearchStore = false;
      break;
    // 耗材入库
    case RecordTypeEnum.ConsumableInventoryRecord:
      state.codePlaceholder = '请输入入库单号/申请人查询';
      state.showSearchStore = true;
      state.startTimePlaceholder = '申请时间-开始';
      state.endTimePlaceholder = '申请时间-结束';
      break;
    // 耗材出库
    case RecordTypeEnum.ConsumablesOutboundRecord:
      state.codePlaceholder = '请输入出库单号/领用人查询';
      state.showSearchStore = false;
      state.startTimePlaceholder = '申请时间-开始';
      state.endTimePlaceholder = '申请时间-结束';
      break;
    // 耗损出库
    case RecordTypeEnum.ConsumablesLossOutboundRecord:
      state.codePlaceholder = '请输入出库单号/申请人查询';
      state.showSearchStore = false;
      state.startTimePlaceholder = '申请时间-开始';
      state.endTimePlaceholder = '申请时间-结束';
      break;
    // 耗材退库
    case RecordTypeEnum.ConsumablesReturnRecord:
      state.codePlaceholder = '请输入退库单号/申请人查询';
      state.showSearchStore = false;
      state.startTimePlaceholder = '申请时间-开始';
      state.endTimePlaceholder = '申请时间-结束';
      break;
    // 库存管理
    case RecordTypeEnum.InventoryManagementRecord:
      state.codePlaceholder = '请输入耗材名称查询';
      state.showSearchStore = true;
      break;
    default:
      break;
  }
};

const handleClose = () => {
  emit('onClose');
};

const handleClear = () => {
  searchState.searchValues = undefined;
  searchState.storeId = undefined;
  searchState.storeName = undefined;
  searchState.startTime = undefined;
  searchState.endTime = undefined;
  searchState.statusList = [''];
};

const handleReset = () => {
  handleClear();
  emit('onReset');
};

const handleFilterSearch = () => {
  if (searchState.startTime && !searchState.endTime) {
    showInfo(`请输入${state.endTimePlaceholder}`);
    return;
  }
  if (!searchState.startTime && searchState.endTime) {
    showInfo(`请输入${state.startTimePlaceholder}`);
    return;
  }
  emit('onSearch', omit(searchState, 'storeName'));
};

const handleTimeConfirm = (val: any) => {
  const time = dayjs(val.timestamp * 1000).format('YYYY-MM-DD');
  if (state.timeType === 0) {
    searchState.startTime = time;
  }
  if (state.timeType === 1) {
    searchState.endTime = time;
  }
  if (
    searchState?.startTime &&
    searchState?.endTime &&
    searchState?.endTime < searchState?.startTime
  ) {
    const t = searchState.endTime;
    searchState.endTime = searchState.startTime;
    searchState.startTime = t;
  }
};

watch(
  () => props.isOpenSearch,
  val => {
    if (val) {
      handleTabParams();
    }
  },
);

watch(
  () => props.currentTab,
  () => {
    handleClear();
  },
);
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.search-popup {
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 90rpx !important;
  display: flex;
  flex-direction: column;
  &-content {
    height: auto;
    min-height: 200rpx;
    background: #fff;
    border-bottom-right-radius: 16rpx;
    border-bottom-left-radius: 16rpx;
    transition: all 0.5 ease-in-out 0s;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  &-blank {
    flex: 1;
  }
  .status-list {
    &-title {
      padding: 24rpx 32rpx;
      color: #000000e0;
      font-family: 'PingFang SC';
      font-size: 32rpx;
      font-style: normal;
      font-weight: 500;
    }
  }
  .popup-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0 32rpx;
  }
  .popup-item {
    margin-bottom: 24rpx;
    margin-right: 24rpx;
    width: 200rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
  }
  .popup-bottom {
    display: flex;
    padding: 24rpx 32rpx;
  }
  .popup-bottom-left,
  .popup-bottom-right {
    flex: 1;
  }
  .popup-bottom-left {
    margin-right: 24rpx;
  }
  .select-popup-item {
    color: $colorPrimaryBase;
    background-color: $colorPrimaryLightBg;
  }
  .normal-popup-item {
    color: $textLabelColor;
    background-color: $fillDefaultColor;
  }
}
.popup-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  &-input {
    padding: 24rpx 32rpx;
    display: flex;
    flex-direction: column;
  }
  &-time {
    display: flex;
    margin-top: 24rpx;
    align-items: center;
    width: 100%;
    &-center {
      margin: 0 24rpx;
      color: #00000073;
    }
  }
  &-store {
    margin-top: 24rpx;
  }
}
.popup-bottom {
  width: 100%;
  display: flex;
  border-top: 2rpx solid #0000000f;
}
.popup-bottom-left,
.popup-bottom-right {
  flex: 1;
}
.popup-bottom-left {
  margin-right: 24rpx;
  color: $color-primary;
}
</style>
