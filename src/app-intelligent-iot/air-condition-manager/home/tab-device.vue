<script lang="ts" setup>
import { loadDevices } from '@/app-intelligent-iot/services/air-condition';
import { getUserPermissionSpaceTree, ISpaceTree } from '@/app-intelligent-iot/services/space';
import IconArrow from '@/app-intelligent-iot/static/air-condition/arrow_right.svg';
import IconSpace from '@/app-intelligent-iot/static/air-condition/device_space_icon.svg';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { showInfo } from '@/utils/tools';
import { isEmpty } from 'lodash-es';
import { onMounted, onUnmounted, ref } from 'vue';
import { DeviceAirCondition } from '../utils/AirConditionType';
import { findFirstPermissionSpace } from '../utils/Utils';
import AirConditionView from './components/device-air-condition.vue';

let spaceId;
const spaceName = ref('');

const showContent = ref(false);

const PageSize = 15;
let curPageIndex = 1;
const devices = ref([] as DeviceAirCondition[]);
const refreshState = ref<boolean>(false);
const loadMoreState = ref('loadmore'); // loadmore/loading / nomore

const pushPageData = (list: DeviceAirCondition[], pageIndex: number) => {
  if (pageIndex != 1 && pageIndex != curPageIndex) return;

  if (isEmpty(list)) {
    if (pageIndex == 1) {
      devices.value = [];
      showInfo('暂无空调设备');
    }
    refreshState.value = false;
    loadMoreState.value = 'nomore';
    return;
  }

  const curSpaceName = spaceName.value;
  if (!isEmpty(curSpaceName)) {
    list.forEach(item => {
      const spaceFullName = item.spaceFullName;
      if (spaceFullName.startsWith(curSpaceName)) return;

      const index = spaceFullName.indexOf(`/${curSpaceName}`);
      if (index > 0) {
        item.spaceFullName = item.spaceFullName.substring(index + 1);
      }
    });
  }

  curPageIndex = pageIndex + 1;
  loadMoreState.value = list.length < PageSize ? 'nomore' : 'loadmore';
  if (pageIndex == 1) {
    refreshState.value = false;
    devices.value = list;
    showContent.value = true;
  } else {
    devices.value.push(...list);
  }
};

const loadPageData = async (pageIndex: number) => {
  // // #ifdef H5
  // setTimeout(() => {
  //   const list = [] as DeviceAirCondition[];
  //   for (var i = 0; i < PageSize; i++) {
  //     const flag = i % 2 == 0;
  //     list.push({
  //       uuid: `airuuid${i}`,
  //       deviceName: flag
  //         ? `空调${i}`
  //         : `空调${i}空调空调空调空调空调空调空调空调空调空调空调空调空调空调`,
  //       spaceFullName: '立达信小学/A栋/1F/一年一班立达信小学/A栋/1F/一年一班',
  //       onOffStatus: flag ? 1 : 0,
  //       props: [],
  //     });
  //   }
  //   pushPageData(list, pageIndex);
  // }, 800);
  // // #endif

  try {
    const res: any = await loadDevices(pageIndex, PageSize, spaceId);
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

const loadFistSpaceInfo = async () => {
  const treeRes = await getUserPermissionSpaceTree();
  const firstNode: ISpaceTree | null = findFirstPermissionSpace(treeRes);
  spaceId = firstNode?.id;
  if (isEmpty(spaceId)) {
    uni.showToast({
      title: '暂无空间数据权限，请联系管理员处理',
      icon: 'none',
      mask: true,
      duration: 3000,
    });
    return;
  }
  console.log('loadFistSpaceInfo', firstNode);
  spaceName.value = firstNode?.name || '';
  loadFirstPageData();
};

const showSpaceSelector = () => {
  showSelector({
    type: SelectorTypeEnum.space,
    multiple: false,
    value: spaceId,
    callback: (value, data) => {
      const id = value || '';
      if (isEmpty(id)) return;

      spaceId = id;
      spaceName.value = data?.name || '';
      devices.value = [];
      loadFirstPageData();
    },
  });
};

const eventCallback = () => loadFirstPageData();

onMounted(() => {
  loadFistSpaceInfo();
  uni.$on('airConditionModifyFlag', eventCallback);
});

onUnmounted(() => {
  uni.$off('airConditionModifyFlag');
});
</script>

<template>
  <view class="k-f-1 k-h-0 k-f-c">
    <scroll-view
      class="k-h-100p"
      refresher-background="transparent"
      :scroll-y="true"
      :refresher-enabled="showContent"
      :refresher-triggered="refreshState"
      @refresherrefresh="onRefresh"
      @scrolltolower="onScrollBottom"
    >
      <view class="k-m-l-32 k-m-r-32">
        <u-gap height="32"></u-gap>
        <view class="cardRound k-h-96 k-f-center k-p-l-32 k-p-r-32" @click="showSpaceSelector">
          <u-image :src="IconSpace" :width="48" :height="48"></u-image>
          <view class="k-f-1 spaceName">{{ spaceName }}</view>
          <u-image :src="IconArrow" :width="40" :height="40"></u-image>
        </view>
        <u-gap height="20"></u-gap>
        <AirConditionView v-for="(device, index) in devices" :key="index" :device="device" />
        <u-gap height="30"></u-gap>
        <u-loadmore v-if="showContent" :status="loadMoreState" />
        <u-gap height="80"></u-gap>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
// @import '@/app-intelligent-iot/air-condition-manager/style/KStyle.scss';
@import '../style/KStyle.scss';
@import '@/app-intelligent-iot/air-condition-manager/style/AirConditionStyle.scss';

.spaceName {
  padding: 0 32rpx;
  color: #000000e0;
  font-size: 32rpx;
  @include ellipsis-some-line(1);
}
</style>
