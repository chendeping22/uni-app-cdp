<template>
  <mt-page
    title="草稿箱"
    theme="default"
    :show-top-gap="false"
    :show-bottom-gap="false"
    :auto-show-left-icon="false"
  >
    <template #navbarLeft>
      <c-icon name="icon_arrow_left" :size="48" @click="handleBack" />
    </template>
    <c-refresh-scroll
      ref="refreshScrollRef"
      :fetch-data-func="fetchDataFunc"
      :page-size="20"
      :auto-mount="true"
    >
      <view v-if="dataList.length != 0" class="p-all-s pt-b">
        <mt-card v-for="(item, inx) in dataList" :key="inx" padding="plr-l ptb-b mb-b">
          <view>
            <view :class="['flex-between']" @click="handleJump(item)">
              <view class="scroll-hidden">
                <view class="flex mt-xxs color-secondary font-title">
                  <text class="mr-xs no-shrink">
                    {{ formatDate(item.updateTime, 'YYYY-MM-DD hh:mm:ss') }}</text
                  >
                </view>
              </view>
              <view class="flex-inline no-shrink ml-b">
                <text v-if="!isGuardian" class="color-placeholder font-title"
                  >共{{ item.students.length ?? 0 }}人</text
                >
                <c-icon name="icon_arrow_right" :size="48" color-type="placeholder" />
              </view>
            </view>
          </view>
        </mt-card>
      </view>
      <view v-else>
        <c-empty bg-type="fill-default" content="暂无数据" />
      </view>
    </c-refresh-scroll>
  </mt-page>
</template>

<script lang="ts" setup>
import mtCard from '@/app-preprimary-education/components/mt-card/mt-card.vue';
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate, getPageParams } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { useTimeImpression } from './utils/use-time-impression';

const loginSt = loginStore();
const isGuardian = EUserType.teacher !== loginSt.currentUserType;
const personId = loginSt.userInfo?.personId ?? '';
const store = useTimeImpression();
const dataList = ref<any>([]);
const froms = ref<any>();
const toTypes = ref<any>();
const refreshScrollRef = ref();

const handleJump = (data: any) => {
  store.studentData.setStudentsData(data);
  store.PointsOfObservationData.clearIndicatorCacheData();
  uni.navigateTo({
    url: `/app-preprimary-education/observation-record/add?type=dartf&toType=${toTypes.value}
      &id=${data.id}`,
  });
};

const fetchDataFunc = async (pager: any, loadType: any) => {
  console.log('🚀 ~ file: draft.vue:45 ~ fetchDataFunc ~ pager:', pager, loadType);
  const { pageSize, pageNum } = pager;
  const res = await store.viewPicturePage.observeRecordsApi(pageSize, pageNum, personId);
  if (loadType === 'new') dataList.value = [];
  dataList.value.push(...res.result);
  return res;
};
const handleBack = () => {
  // uni.navigateTo({
  //   url: '/preschool/observation-record/index',
  // });
  if (froms.value === 'recordPage') {
    uni.navigateBack();
  } else {
    uni.navigateBack({
      delta: 2,
    });
  }
};
onLoad(() => {
  console.log('##########################***************************');

  const { from, toType } = getPageParams();
  froms.value = from;
  toTypes.value = toType;
  uni.$on('reLoad', reLoadEvnet);
});
const reLoadEvnet = () => {
  refreshScrollRef?.value?.initData();
};
</script>
