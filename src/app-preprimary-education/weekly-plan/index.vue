<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :show-bottom-gap="false">
    <c-refresh-scroll
      :fetch-data-func="throttledFetchDataFunc"
      :is-open-scroll2-bottom="false"
      :auto-mount="false"
      extraHeight="200"
    >
      <template #top_area>
        <ProfileHome
          @onLoadClazz="throttledFetchDataFunc"
          v-model:curClazz="currentClazz"
          v-model:curWeek="currentWeek"
        />
      </template>
      <c-empty v-if="!record" bg-type="fill-default" content="本周暂未上传周计划" />
      <view v-else>
        <view v-if="record.publishFormat === 1" class="plan-content">
          <view v-if="record.yearConfig" class="color-placeholder font-secondary text-center pb-b">
            <text v-if="record.yearConfig.schoolYear">{{ record.yearConfig.schoolYear }}学年</text>
            {{ record.yearConfig.termDesc || '' }}
            {{ record.clazzName || '' }}
            <text v-if="record.week">第{{ record.week }}周教学活动安排表</text>
          </view>
          <view class="plr-b">
            <view v-for="(item, index) in record.planWeeklyDetailDtos" :key="index" class="pb-b">
              <view class="flex color-base text-center pb-s weekly-plan-title">
                <u-image :src="getTitleIcon(index)" width="32" height="32" />
                <view :class="['font-title mlr-s', getTitleStyle(index)]">{{ item.itemName }}</view>
                <u-image class="icon-right" :src="getTitleIcon(index)" width="32" height="32" />
              </view>

              <c-card :hasShadow="false">
                <text class="color-secondary">{{ item.content }}</text>
              </c-card>
            </view>
          </view>
          <view class="color-placeholder font-secondary ml-l">
            {{ record.creator }}老师更新于{{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm') }}
          </view>
          <c-empty-line need-safe-bottom class-name="mtb-b" height="180rpx" />
        </view>
        <view v-else-if="record.publishFormat === 2" class="text-center">
          <image :src="record.fileUrl" mode="widthFix" @click="handlePreview" />
          <view class="color-placeholder font-secondary ml-l text-left">
            {{ record.creator }}老师更新于{{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm') }}
          </view>
        </view>
        <c-empty v-else bg-type="fill-default" content="本周暂未上传周计划" />
      </view>
    </c-refresh-scroll>
    <c-bottom>
      <view class="flex-around">
        <c-button
          :width="record && personId === record.createBy ? '320rpx' : '680rpx'"
          height-size="button-s"
          @click="clickAdd"
        >
          <u-image
            :src="iconAdd"
            :width="36"
            :height="36"
            class="lh-0 pr-xs"
            :show-loading="false"
          />
          <text class="font-title">新增</text>
        </c-button>
        <c-button
          v-if="record && personId === record.createBy"
          width="320rpx"
          height-size="button-s"
          @click="clickEdit"
        >
          <u-image
            :src="iconEdit"
            :width="36"
            :height="36"
            class="lh-0 pr-xs"
            :show-loading="false"
          />
          <text class="font-title">编辑</text>
        </c-button>
      </view>
    </c-bottom>
  </mt-page>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { throttle } from 'lodash-es';
import { computed, ref } from 'vue';
import mtPage from '../components/mt-page/mt-page.vue';
import iconAdd from '../static/image/new_icon.png';
import iconBlueStar from '../static/image/star_icon_blue.png';
import iconGreenStar from '../static/image/star_icon_green.png';
import iconPurpleStar from '../static/image/star_icon_purple.png';
import iconRedStar from '../static/image/star_icon_red.png';
import iconEdit from '../static/image/white_edit_icon.png';
import ProfileHome from './components/profile-home/index.vue';
import { IWeeklyPlanInfoItem, getPlanWeeklyInfo } from './utils/service';
dayjs.extend(weekOfYear);
dayjs.locale('zh-cn');
const personId = loginStore().userInfo?.personId;
const title = computed(() => '教学计划');

const currentClazz = ref();

const currentWeek = ref(dayjs().week());

const record = ref<IWeeklyPlanInfoItem>({} as IWeeklyPlanInfoItem);

/** 标题icon */
const getTitleIcon = (num: number) => {
  switch (num % 4) {
    case 0:
      return iconRedStar;
    case 1:
      return iconGreenStar;
    case 2:
      return iconBlueStar;
    case 3:
      return iconPurpleStar;
  }
};

/** 标题颜色样式 */
const getTitleStyle = (num: number) => {
  switch (num % 4) {
    case 0:
      return 'color-warnning-light-1';
    case 1:
      return 'color-success-light-1';
    case 2:
      return 'color-blue-light-1';
    case 3:
      return 'color-purple-light-2';
  }
};

/** 图片预览 */
const handlePreview = () => {
  uni.previewImage({
    urls: [record.value.fileUrl],
    current: record.value.fileId,
  });
};

/** 加载数据 */
const onLoadData = async () => {
  if (!currentClazz.value || !currentClazz.value[2].value || !currentWeek.value) return;
  const params = {
    clazzId: currentClazz.value[2].value,
    year: dayjs().week(currentWeek.value).year(),
    week: currentWeek.value,
  };

  const res = await getPlanWeeklyInfo(params);
  record.value = res;
};

/** 新增 */
const clickAdd = () => {
  uni.navigateTo({
    url: `/app-preprimary-education/weekly-plan/add?isEdit=0&clazzList=${JSON.stringify(
      currentClazz.value,
    )}`,
  });
};
/** 编辑 */
const clickEdit = () => {
  uni.navigateTo({
    url: `/app-preprimary-education/weekly-plan/add?isEdit=1&clazzList=${JSON.stringify(
      currentClazz.value,
    )}&id=${record.value.id}&week=${record.value.week}&year=${record.value.year}`,
  });
};
onShow(() => {
  reLoadEvent();
});
const reLoadEvent = () => {
  throttledFetchDataFunc();
};
const throttledFetchDataFunc = throttle(onLoadData, 1000);
</script>
<style lang="scss" scoped>
.weekly-plan-title {
  justify-content: center;
  .icon-right {
    transform: rotateY(180deg);
  }
}
</style>
