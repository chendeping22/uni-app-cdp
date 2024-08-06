<template>
  <template v-if="isPersonal === 0">
    <view class="h100">
      <view class="bg-white border-bottom border-line-default bold">
        <u-tabs-swiper
          class="curriculum-tabs-wrapper"
          :current="current"
          :font-size="32"
          active-color="#176bfb"
          inactive-color="#4e5969"
          :list="[{ name: '我的课表' }, { name: '班级课表' }, { name: '教师课表' }]"
          :is-scroll="false"
          @change="handleTabChange"
        />
      </view>
      <view
        v-if="weekList && weekList.length > 0"
        class="bg-white"
        :class="(current === 0 || current === 1) && currentWeek > -1 ? 'shadow' : ''"
        style="height: 116rpx; position: relative; z-index: 2"
      >
        <WeekSwiper
          :semester="semester"
          :week-list="weekList"
          :current="currentWeek"
          @change="handleWeekChange"
        />
      </view>
      <view
        v-if="weekList && weekList.length > 0 && currentWeek > -1"
        :style="{ height: tabContentHeight + 'px' }"
      >
        <CurriculumScheduleMy
          v-if="current === 0"
          :semester="semester"
          :current-week="currentWeek"
          :week-list="weekList"
          @showDetail="handleShowDetail"
        />
        <CurriculumScheduleClass
          v-if="current === 1"
          :semester="semester"
          :current-week="currentWeek"
          :week-list="weekList"
          @showDetail="handleShowDetail"
        />
        <CurriculumScheduleTeacher
          v-if="current === 2"
          :semester="semester"
          :current-week="currentWeek"
          :week-list="weekList"
          @showDetail="handleShowDetail"
        />
      </view>
      <view
        v-if="weekList && weekList.length === 0"
        class="tab-content2"
        :style="{ height: tabContent2Height + 'px' }"
      >
        <u-empty-custom class="color-base" text="暂无数据" />
      </view>
    </view>
  </template>
  <template v-if="isPersonal === 1">
    <view
      v-if="weekList && weekList.length > 0"
      class="bg-white"
      :class="currentWeek > -1 ? 'shadow' : ''"
      style="height: 116rpx"
    >
      <WeekSwiper
        :semester="semester"
        :week-list="weekList"
        :current="currentWeek"
        @change="handleWeekChange"
      />
    </view>
    <view v-if="weekList && weekList.length > 0" :style="{ height: tabContent3Height + 'px' }">
      <CurriculumScheduleMy
        :semester="semester"
        :current-week="currentWeek"
        :week-list="weekList"
        @showDetail="handleShowDetail"
      />
    </view>
    <view v-else class="tab-content4">
      <view v-if="weekList && weekList.length === 0">
        <u-empty-custom class="color-base" text="暂无数据" />
      </view>
    </view>
  </template>
  <schedule-cell
    :show="showDetail"
    :show-target-type="showTargetType"
    :detail="detail"
    @close-cell="handleCloseDetail"
  />
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { getPageParams } from '@/utils/tools';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { getWeekList } from '../services/curriculum-schedule';
import scheduleCell from './components/schedule-cell.vue';
import WeekSwiper from './components/week-swiper.vue';
import CurriculumScheduleClass from './curriculum-schedule-class.vue';
import CurriculumScheduleMy from './curriculum-schedule-my.vue';
import CurriculumScheduleTeacher from './curriculum-schedule-teacher.vue';

interface IPageParam {
  locationId?: string;
  userId?: string;
}
const pageParam = ref({} as IPageParam);
const isPersonal = ref(-1);
const isTeacher = ref(false);
const current = ref<number>(0);
const semester = ref('');
const weekList = ref<any[]>();
const showDetail = ref(false);
const showTargetType = ref('');
const detail = ref<any>();
const currentWeek = ref<number>(-1);

onBeforeMount(() => {
  pageParam.value = getPageParams();
  // 支持教师通讯录查看教师课表
  if (pageParam.value.locationId && pageParam.value.userId) {
    isTeacher.value = true;
    isPersonal.value = 1;
  } else {
    const currentUserType = loginStore().currentUserType;
    isPersonal.value = currentUserType === EUserType.teacher ? 0 : 1;
    isTeacher.value = currentUserType === EUserType.teacher;
  }
  // isPersonal.value = 1;
});

onMounted(() => {
  // 获取周列表
  try {
    const params: any = {};
    if (pageParam.value.locationId && pageParam.value.userId) {
      params.locationId = pageParam.value.locationId;
    }
    getWeekList(params).then((res: any) => {
      const schoolYear = (res || []).find((i: any) => i.defaultFlag);
      semester.value = schoolYear?.schoolYear || '';
      if (schoolYear && schoolYear.schoolTerms && schoolYear.schoolTerms.length > 0) {
        const schoolTerm: any = schoolYear.schoolTerms.find((i: any) => i.defaultFlag);
        if (schoolTerm?.termNo === 1) {
          semester.value += '上学期';
        } else if (schoolTerm?.termNo === 2) {
          semester.value += '下学期';
        }
        if (schoolTerm && schoolTerm.schoolWeeks && schoolTerm.schoolWeeks.length > 0) {
          weekList.value = schoolTerm.schoolWeeks || [];
          schoolTerm.schoolWeeks.forEach((i: any, index: number) => {
            if (i.defaultFlag) {
              currentWeek.value = index;
            }
          });
        } else {
          weekList.value = [];
        }
      } else {
        weekList.value = [];
      }
    });
  } catch (error) {
    weekList.value = [];
    console.log(error);
  }
});

const tabContentHeight = computed(() => {
  const systemInfo: any = uni.getSystemInfoSync();
  const windowHeight = systemInfo.windowHeight || 0;
  const saveBottom = systemInfo.safeAreaInsets.bottom || 0;
  return windowHeight - uni.upx2px(80 + 116 + 116) - saveBottom;
});

const tabContent2Height = computed(() => {
  const systemInfo: any = uni.getSystemInfoSync();
  const windowHeight = systemInfo.windowHeight || 0;
  const saveBottom = systemInfo.safeAreaInsets.bottom || 0;
  return windowHeight - uni.upx2px(80 + 116) - saveBottom;
});

const tabContent3Height = computed(() => {
  const systemInfo: any = uni.getSystemInfoSync();
  const windowHeight = systemInfo.windowHeight || 0;
  const saveBottom = systemInfo.safeAreaInsets.bottom || 0;
  return windowHeight - uni.upx2px(116) - saveBottom;
});

function handleTabChange(index: number) {
  current.value = index;
}
function handleShowDetail(data: any) {
  if (!isTeacher.value) {
    showTargetType.value = 'teacher';
  } else if (current.value === 1) {
    showTargetType.value = 'teacher';
  } else {
    showTargetType.value = 'class';
  }
  detail.value = data;
  showDetail.value = true;
}
function handleCloseDetail() {
  showDetail.value = false;
  detail.value = null;
}
function handleWeekChange(v: number) {
  currentWeek.value = v;
}
</script>

<style lang="scss">
.curriculum-tabs-wrapper {
  :deep(.u-scroll-bar) {
    bottom: 0 !important;
  }
  :deep(.u-tabs-item) {
    font-weight: 500 !important;
  }
}
</style>

<style lang="scss" scoped>
.tab-content2 {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab-content4 {
  height: 100%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
