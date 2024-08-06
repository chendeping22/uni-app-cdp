<script lang="ts" setup>
import { loadGroups } from '@/app-intelligent-iot/services/air-condition';
import IconGroup from '@/app-intelligent-iot/static/air-condition/group_icon.svg';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash-es';
import { onMounted, ref } from 'vue';
import { GroupAirCondition } from '../utils/AirConditionType';

const PageSize = 15;
let curPageIndex = 1;
const groups = ref([] as GroupAirCondition[]);
const refreshState = ref<boolean>(false);
const loadMoreState = ref('loadmore'); // loadmore/loading / nomore

const pushPageData = (list: GroupAirCondition[], pageIndex: number) => {
  if (isEmpty(list)) {
    if (pageIndex == 1) {
      groups.value = [];
    }
    refreshState.value = false;
    loadMoreState.value = 'nomore';
    return;
  }
  curPageIndex = pageIndex + 1;
  loadMoreState.value = list.length < PageSize ? 'nomore' : 'loadmore';
  if (pageIndex == 1) {
    refreshState.value = false;
    groups.value = list;
  } else {
    groups.value.push(...list);
  }
};

const loadPageData = async (pageIndex: number) => {
  try {
    const res: any = await loadGroups(pageIndex, PageSize);
    pushPageData(res?.result || [], pageIndex);
  } catch (error) {
    console.log('loadDevices catch e');
  }
};

const loadFirstPageData = () => loadPageData(1);

const onRefresh = () => {
  refreshState.value = true;
  loadFirstPageData();
};

const onScrollBottom = () => {
  if (loadMoreState.value == 'nomore') return;

  loadMoreState.value = 'loading';
  loadPageData(curPageIndex);
};
const formatTime = (timestamp: number | null) => {
  return timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss') : '/';
};

const onClickLock = (group: GroupAirCondition) => {
  // uni.$u.route('/app-intelligent-iot/air-condition-manager/group/lock/index');
  uni.navigateTo({
    url: `/app-intelligent-iot/air-condition-manager/group/lock/index?id=${group.id}&name=${group.groupName}`,
  });
};

const onClickControl = (group: GroupAirCondition) => {
  // uni.$u.route('/app-intelligent-iot/air-condition-manager/group/control/index');
  uni.navigateTo({
    url: `/app-intelligent-iot/air-condition-manager/group/control/index?id=${group.id}&name=${group.groupName}`,
  });
};

const onClickRecord = (group: GroupAirCondition) => {
  uni.navigateTo({
    url: `/app-intelligent-iot/air-condition-manager/record/group?id=${group.id}`,
  });
};

onMounted(() => {
  refreshState.value = true;
});
</script>

<template>
  <view class="k-f-1 k-h-0 k-f-c">
    <scroll-view
      class="k-h-100p"
      refresher-background="transparent"
      :scroll-y="true"
      :refresher-enabled="true"
      :refresher-triggered="refreshState"
      @refresherrefresh="onRefresh"
      @scrolltolower="onScrollBottom"
    >
      <view class="k-m-l-32 k-m-r-32">
        <u-gap height="24"></u-gap>
        <view v-for="(group, index) in groups" :key="index" class="cardRound k-f-c k-m-b-20">
          <view class="topPart k-f-center">
            <view class="rootIcon">
              <u-image :src="IconGroup" :width="64" :height="64"></u-image>
            </view>
            <view class="k-m-l-28">
              <view class="groupName">{{ group.groupName }}</view>
              <view class="desc k-m-t-8">操作时间：{{ formatTime(group.updateTime) }}</view>
            </view>
          </view>
          <!-- 底部按钮 -->
          <view class="bottomPart k-f-center">
            <view class="k-f-1 btn" @click="onClickLock(group)">锁定</view>
            <view class="divider"></view>
            <view class="k-f-1 btn" @click="onClickControl(group)">控制</view>
            <view class="divider"></view>
            <view class="k-f-1 btn" @click="onClickRecord(group)">执行记录</view>
          </view>
        </view>
        <u-gap height="30"></u-gap>
        <u-loadmore :status="loadMoreState" />
        <u-gap height="80"></u-gap>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/app-intelligent-iot/air-condition-manager/style/KStyle.scss';
@import '@/app-intelligent-iot/air-condition-manager/style/AirConditionStyle.scss';

.topPart {
  margin: 32rpx 34rpx;

  .rootIcon {
    width: 80rpx;
    height: 80rpx;

    padding: 8rpx;

    border-radius: 16rpx;
    background: #e6f4ff;
  }

  .groupName {
    color: #000000e0;
    font-size: 32rpx;
    font-weight: bold;
    line-height: 44rpx;
    @include ellipsis-some-line(1);
  }

  .desc {
    font-size: 24rpx;
    color: #00000073;
    line-height: 32rpx;
    @include ellipsis-some-line(1);
  }
}

.bottomPart {
  height: 80rpx;
  border-top: 1rpx solid #0000000f;

  .btn {
    color: #1677ff;
    text-align: center;
    font-size: 30rpx;
    font-weight: bold;
  }

  .divider {
    width: 2rpx;
    height: 48rpx;
    background: #0000000f;
  }
}
</style>
