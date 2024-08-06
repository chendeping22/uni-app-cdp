<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @pullDownRefresh="fetchList"
    @head-click="handleJump(1)"
  >
    <template #custom-head></template>
    <!-- 上部 -->
    <view class="flex-around">
      <view class="flex-column view_contain" @click="handleJump(1)">
        <view class="view-value">{{ numDate.todoMum || 0 }}</view>
        <view class="view-label">待办件</view>
      </view>
      <view class="flex-column view_contain" @click="handleJump(3)">
        <view class="view-value">{{ numDate.circulateNum || 0 }}</view>
        <view class="view-label">待阅件</view>
      </view>
    </view>
    <!-- 下部 -->
    <view v-if="listDate && listDate.length > 0" class="flex-column-plain mt-b mb-b">
      <view
        v-for="(item, index) in listDate"
        class="flex-around content"
        @click="handleJumpToDetail(item)"
      >
        <!-- 左边-->
        <view class="flex-between">
          <view class="flex-around">
            <view
              v-if="item.flowUrgent == 1"
              class="urgency-class"
              style="background-color: #0000000a; color: #000000a6"
              >一般</view
            >
            <view
              v-else-if="item.flowUrgent == 2"
              class="urgency-class"
              style="background-color: #e6f4ff; color: #1677ff"
              >平急</view
            >
            <view
              v-else-if="item.flowUrgent == 3"
              class="urgency-class"
              style="background-color: #fff1f0; color: #ff4d4f"
              >加急</view
            >
            <view
              v-else-if="item.flowUrgent == 4"
              class="urgency-class"
              style="background-color: #fff1f0; color: #ff4d4f"
              >特急</view
            >
          </view>
          <view class="flex-column-plain center-value">
            <view class="ul-value">{{ item.fullName }}</view>
            <view class="ul-lable">[{{ locationName }}] {{ item.timeStr }}</view>
          </view>
        </view>
        <!-- 右边-->
        <view class="flex-around">
          <view class="ul-point"> <u-icon name="arrow-right"></u-icon> </view>
        </view>
      </view>
    </view>
    <view v-else class="empty-contain">
      <u-empty-custom
        card
        bg-type="fill-light"
        type="mini"
        class-name="mt-b ptb-b"
        text="暂无数据"
      />
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { getMissiveTodoList, getMissiveTodoNum } from '@/services/widgets';
import { loginStore } from '@/store/modules/login';
import type { IWidget } from '@/store/modules/workbench';
import { ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// 定义接口接收父级参数
const props = withDefaults(defineProps<IProps>(), {});
const isLoad = ref(true);
const numDate = ref<any>({});
const listDate = ref<any[]>([]);
const locationName = ref();
const categoryVal = ref(1);

const getNumData = async () => {
  const params = {
    categoryCodes: ['documentManage', 'documentDistribute', 'documentSend'],
  };
  const result = await getMissiveTodoNum(params);
  numDate.value = result;
};

const getListData = async (category: number) => {
  const params = {
    categoryCodes: 'documentManage,documentDistribute,documentSend',
    pageSize: 5,
    currentPage: 1,
    isSelectFormData: 0,
    category: category,
  };
  const result = await getMissiveTodoList(category, params);
  console.log('getListData', result);
  listDate.value = result?.list || [];
};

const loginStoreTmp = loginStore();
locationName.value = loginStoreTmp?.userInfo?.locationName;
const fetchList = () => {
  getNumData();
  getListData(1);
};

const handleJump = (category: number) => {
  categoryVal.value = category;
  linkToWorkFlowIndex(category);
};

const linkToWorkFlowIndex = (category: number) => {
  const baseUrl = 'pages/officeDocManage/index';
  const url =
    baseUrl +
    '?categoryCodes=documentManage,documentDistribute,documentSend&pageSize=20&currentPage=1&isSelectFormData=0&category=' +
    category +
    '&pendingType=' +
    category;
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};

const handleJumpToDetail = (item: any) => {
  const baseUrl = `/pages/officeDocManage/detail/index?`;
  const url =
    baseUrl +
    `id=` +
    item.taskBizId +
    `&taskId=` +
    item.processId +
    `&operatorId=` +
    item.id +
    `&fromType=wait`;
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};

onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.view-value {
  font-weight: 500;
  font-size: 40rpx;
  line-height: 52rpx;
}
.view-label {
  font-weight: 400;
  font-size: 26rpx;
  line-height: 36rpx;
}
.urgency-class {
  font-weight: 400;
  font-size: 26rpx;
  line-height: 36rpx;
  width: 84rpx;
  height: 48rpx;
  border-radius: 8rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ul-value {
  font-weight: 400;
  font-size: 30rpx;
  line-height: 40rpx;
  color: #000000e0;
  width: 400rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ul-lable {
  font-weight: 400;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #00000073;
  width: 400rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ul-point {
  width: 15rpx;
  height: 26.66rpx;
  padding-left: 40rpx;
}

.center-value {
  padding-left: 40rpx;
}
.content {
  margin-top: 40rpx;
}
.view_contain {
  background-color: #00000005;
  width: 300rpx;
  height: 136rpx;
  padding: 24rpx 16rpx 24rpx 16rpx;
  border-radius: 16rpx;
}
.empty-contain {
  margin-top: 80rpx;
  margin-bottom: 60rpx;
}
</style>
