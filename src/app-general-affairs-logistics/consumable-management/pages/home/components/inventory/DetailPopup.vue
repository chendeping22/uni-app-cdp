<template>
  <u-popup
    v-model="state.showPopup"
    mode="bottom"
    length="80%"
    closeable
    border-radius="32"
    safe-area-inset-bottom
    @close="handleClose"
  >
    <view class="detail">
      <view class="detail-title">{{ state.popupTitle }}</view>
      <scroll-view scroll-y="true" class="detail-content" @scrolltolower="handleToLower">
        <view class="detail-content-inner">
          <u-time-line>
            <u-time-line-item v-for="item in state.list" :key="item.id" node-top="2">
              <template #node>
                <view class="u-node"></view>
              </template>
              <template #content>
                <view>
                  <view class="u-order-title"
                    ><view>{{
                      item?.createTime ? dayjs(item?.createTime).format('YYYY-MM-DD HH:mm') : ''
                    }}</view>
                    <view>{{ item?.userName }}</view>
                  </view>
                  <view class="u-order-desc"
                    ><view>
                      <text v-if="item?.detail" class="u-order-name">{{
                        getNo(item?.detail)
                      }}</text>
                      <text class="u-order-no" @click="handleToMaterial(item)">{{
                        item?.detail
                      }}</text>
                      <u-icon
                        name="arrow-right"
                        color="#00000073"
                        @click="handleToMaterial(item)"
                      ></u-icon>
                    </view>
                    <view :class="getStyle(item?.detail)">{{
                      +item?.num > 0 ? `+${item?.num}` : item?.num
                    }}</view>
                  </view>
                </view>
              </template>
            </u-time-line-item>
          </u-time-line>
        </view>
      </scroll-view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { getMaterialChanges } from '@/app-general-affairs-logistics/consumable-management/services/inventory';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { PropType, reactive, watch } from 'vue';

const noMap = {
  RK: '耗材入库',
  CK: '耗材出库',
  TK: '耗材退库',
  HS: '耗损出库',
};

const detailUrl = {
  RK: 'materialPuts',
  CK: 'materialOut',
  TK: 'materialBack',
  HS: 'materialLoseOut',
};

const styleMap = {
  RK: 'color-error',
  CK: 'color-success',
  TK: 'color-error',
  HS: 'color-success',
};

const props = defineProps({
  openDetail: {
    type: Boolean,
    default: false,
  },
  detailParams: {
    type: Object as PropType<{ id?: string; name?: string }>,
    default: {},
  },
});

const emits = defineEmits<{ (e: 'onClose'): void }>();

const getStyle = (val?: string) => (val ? styleMap[val.slice(0, 2)] : '');

const state = reactive<{
  showPopup?: boolean;
  popupTitle?: string;
  pageSize: number;
  pageNum: number;
  list: any[];
  id?: string;
}>({ showPopup: false, pageSize: 15, pageNum: 1, list: [] });

watch(
  () => props?.openDetail,
  val => {
    state.showPopup = val;
    if (val) {
      state.popupTitle = `${props?.detailParams?.name}变更记录`;
      state.pageNum = 1;
      state.id = props?.detailParams?.id;
      handleList();
    }
  },
);

const handleClose = () => {
  state.showPopup = false;
  state.popupTitle = '';
  state.list = [];
  emits('onClose');
};

const handleToMaterial = (item?: Record<string, any>) => {
  const val = item?.detail ? item?.detail.slice(0, 2) : '';
  const type = val ? detailUrl[val] : '';
  uni.navigateTo({
    url: `/app-general-affairs-logistics/consumable-management/pages/${type}/detail/index?id=${item?.detailId}`,
  });
};

const getNo = (val: string) => noMap[val.slice(0, 2)];

const handleList = async () => {
  try {
    const params = {
      id: state.id,
      pageSize: state.pageSize,
      pageNum: state.pageNum,
    };
    const res: any = await getMaterialChanges(params);
    if (state.pageNum === 1) {
      state.list = res?.result || [];
    } else {
      state.list = state.list.concat(res?.result || []);
    }
  } catch (e: any) {
    showInfo(e?.desc || '查询数据失败');
  }
};

const handleToLower = () => {
  state.pageNum = state.pageNum + 1;
  handleList();
};
</script>

<style lang="scss" scoped>
.detail {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.detail-title {
  display: flex;
  justify-content: center;
  margin: 24rpx 72rpx;
  color: #000000e0;
  font-size: 34rpx;
  font-weight: 500;
}
.detail-content {
  height: 100%;
  width: 100%;
  flex: 1;
  overflow: hidden;
  &-inner {
    padding: 24rpx 32rpx;
  }
}
.u-order-title,
.u-order-desc {
  display: flex;
  justify-content: space-between;
}
.u-order-title {
  font-size: 26rpx;
  color: #000000a6;
  margin-bottom: 16rpx;
}
.u-order-desc {
  .u-order-name {
    color: #000000e0;
    font-size: 30rpx;
  }
  .u-order-no {
    color: #1677ff;
    font-size: 30rpx;
    margin: 0 16rpx;
  }
}
.u-node {
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  &::before {
    position: absolute;
    content: '';
    border-radius: 50%;
    width: 36rpx;
    height: 36rpx;
    background-color: #e6f4ff;
  }
  &::after {
    position: absolute;
    content: '';
    border-radius: 50%;
    width: 16rpx;
    height: 16rpx;
    background-color: #1677ff;
  }
}
.color-error {
  color: $color-error;
}
.color-success {
  color: $color-success;
}
</style>
