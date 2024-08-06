<template>
  <page class="h100" custom-overflow="hidden">
    <view class="h100 flex-column-plain">
      <view class="bg-white">
        <view class="teacher-title">选择老师</view>
        <view class="form-item">
          <view class="teacher-text flex-center no-shrink">
            空闲老师 <view style="margin-left: 16rpx; color: rgba(255, 77, 79, 1)">*</view>
          </view>
          <view class="flex-center ml-xl scroll-hidden">
            <view class="teacher-text text-ellipse">{{ teacherName }}</view>
          </view>
        </view>
      </view>
      <view
        v-if="weekList && weekList.length > 0"
        class="bg-white shadow"
        style="height: 116rpx; position: relative; z-index: 2"
      >
        <WeekSwiper
          :semester="semester"
          :week-list="weekList"
          :current="currentWeek"
          @change="handleWeekChange"
        />
      </view>
      <view class="flex-stretch scroll-hidden">
        <scroll-view scroll-y style="height: 100%; width: 100%">
          <view class="plr-l">
            <view class="tip-text ptb-b">
              <view>已过滤存在调代课申请或多个任课老师的节次</view>
              <view>已过滤存在与自己其他课存在冲突的节次</view>
            </view>
            <view v-for="item in list" :key="item.clazzDate" class="scroll-hidden">
              <view class="week-day">
                {{ weekText[item.dayOfWeek] }} {{ dayjs(item.clazzDate).format('MM-DD') }}
              </view>
              <view
                v-for="cell in item.courseCells"
                :key="cell.id"
                class="course-cell flex-center"
                @click="handleSelect(cell)"
              >
                <view class="course-icon icon-48 flex-center no-shrink">
                  <image class="icon-32" :src="iconCourse" />
                </view>
                <view class="flex-stretch scroll-hidden">
                  <view class="course-name text-ellipse">
                    {{ cell.subjectName }}
                  </view>
                  <view class="course-extra">
                    {{ cell.clazzName }} {{ `第${cell.sortNo}节` }}
                  </view>
                </view>
              </view>
            </view>
            <view v-if="list.length > 0" class="safe-area-inset-bottom"></view>
          </view>
          <view
            v-if="!loading && list.length === 0"
            class="empty-wrapper flex-center scroll-hidden"
          >
            <u-empty-custom mode="search" class="color-base no-shrink" text="本周暂无任课安排~" />
          </view>
        </scroll-view>
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { debounce } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { getCurrentInstance, onMounted, ref, unref } from 'vue';
import WeekSwiper from '../curriculum-schedule/components/week-swiper.vue';
import { getTeacherDateListByTeacherId } from '../services/curriculum-adjust';
import iconCourse from '../static/course-info/course-icon.svg';

const prevData = ref<any>();
const teacherName = ref('');
const semester = ref('');
const weekList = ref<any[]>();
const currentWeek = ref<number>(-1);
const list = ref<any[]>([]);
const loading = ref(true);
const weekText = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function handleSelect(cell: any) {
  uni.navigateTo({
    url: '/app-school-affairs/curriculum-adjust/apply-4',
    success: function (res: any) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit(
        'acceptDataFromOpenerPage',
        unref({
          ...prevData.value,
          newCourse: cell,
        }),
      );
    },
  });
}

async function fetchList() {
  const data: any = {
    onlyQueryOneGradeCourse: true,
    needQueryProcessingApply: true,
    gradeId: prevData.value?.grade?.id || '',
  };

  const week = (weekList.value || [])[currentWeek.value];
  if (week) {
    data.startDate = week.startDate;
    data.endDate = week.endDate;
  }
  const teacherId: string = prevData.value?.newTeacher?.userId || '';

  try {
    loading.value = true;
    const res: any = await getTeacherDateListByTeacherId(teacherId, data);
    loading.value = false;
    list.value = res || [];
  } catch (error) {
    loading.value = false;
  }
}

const fetchListDebounce = debounce(() => {
  fetchList();
}, 200);

function handleWeekChange(v: number) {
  currentWeek.value = v;
  fetchListDebounce();
}

onMounted(() => {
  const instance: any = getCurrentInstance()?.proxy;
  if (instance) {
    const eventChannel = instance.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (data: any) {
      prevData.value = data;
      teacherName.value = data?.newTeacher?.username || '';
      currentWeek.value = data?.currentWeek;
      semester.value = data?.semester;
      weekList.value = data?.weekList;
      console.log('acceptDataFromOpenerPage', data);
      fetchList();
    });
  }
});
</script>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}
.teacher-title {
  padding: 24rpx 32rpx 0;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 44rpx;
  color: rgba(0, 0, 0, 0.88);
}
.form-item {
  margin-left: 32rpx;
  padding-right: 32rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  .teacher-text {
    color: rgba(0, 0, 0, 0.88);
    font-size: 32rpx;
    line-height: 44rpx;
  }
}
.tip-text {
  font-size: 26rpx;
  line-height: 36rpx;
  color: rgba(0, 0, 0, 0.65);
}
.week-day {
  height: 64rpx;
  line-height: 64rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}
.course-cell {
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  background-color: #ffffff;
  height: 128rpx;
  padding: 24rpx 32rpx;
  .course-icon {
    border-radius: 8rpx;
    background-color: rgba(22, 119, 255, 1);
    margin-right: 32rpx;
  }
  .course-name {
    font-size: 32rpx;
    color: rgba(0, 0, 0, 0.88);
    line-height: 44rpx;
  }
  .course-extra {
    font-size: 26rpx;
    line-height: 36rpx;
    color: rgba(0, 0, 0, 0.45);
  }
}
.empty-wrapper {
  height: calc(100% - 120rpx);
}
</style>
