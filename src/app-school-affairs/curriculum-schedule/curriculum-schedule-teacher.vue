<template>
  <view class="h100">
    <view class="shadow">
      <view class="bg-white plr-l pb-s">
        <u-search
          v-model="keyword"
          class="search"
          shape="square"
          :height="72"
          :maxlength="200"
          placeholder="请输入教师姓名搜索"
          :show-action="false"
          :input-style="{ fontSize: 32, color: '#1d2129' }"
          @change="handleSearch"
          @focus="handleFocus"
        />
      </view>
    </view>
    <u-gap v-if="weekList.length > 0" height="24" />
    <view class="bg-white scroll-wrapper">
      <scroll-view scroll-y style="height: 100%; width: 100%" @scrolltolower="handleScrollToLower">
        <view
          v-if="showTeacherSchedule && (keyword || '').trim().length > 0"
          class="flex-column-plain"
          style="min-height: 100%"
        >
          <view
            class="bg-white flex-center h-72 color-secondary font-title bold relative"
            style="z-index: 1"
          >
            {{ getScheduleName() }}
          </view>
          <Schedule
            v-if="currentWeek > -1 && weekList && weekList.length > 0 && weekList[currentWeek]"
            class="flex-stretch flex-column-plain"
            :list="dataMap[currentWeek]"
            :week-info="weekList[currentWeek]"
            :show-color="selectedColor"
            @show-detail="handleShowDetail"
          >
            <template #cell="{ cellData }">
              <view class="scroll-hidden">
                <view
                  v-if="selectedCourse"
                  class="w-148 plr-xxs text-center font-secondary text-ellipse"
                >
                  {{ cellData?.subjectName || '' }}
                </view>
                <view class="w-148 plr-xxs text-center bold font-secondary text-ellipse">
                  {{ cellData?.clazzName || '' }}
                </view>
                <view
                  v-if="selectedSpace"
                  class="w-148 plr-xxs text-center font-secondary text-ellipse"
                >
                  {{ cellData?.spaceDesc || '' }}
                </view>
              </view>
            </template>
            <template #footer>
              <view v-if="dataMap[currentWeek] && dataMap[currentWeek].length > 0">
                <view class="flex-center h-128 plr-l ptb-s">
                  <view class="bold h-80 flex-center" style="font-size: 32rpx">展示设置</view>
                  <view
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedCourse ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('course')"
                  >
                    课程
                  </view>
                  <view
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedSpace ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('space')"
                  >
                    场地
                  </view>
                  <view
                    class="ml-b font-title h-80 flex-stretch flex-center radius-small bg-fill-default color-secondary"
                    :style="selectedColor ? { background: '#E6F4FF', color: '#1677FF' } : {}"
                    @click="handleSelect('color')"
                  >
                    颜色
                  </view>
                </view>
              </view>
            </template>
          </Schedule>
        </view>
        <view
          v-if="!showTeacherSchedule && !searching && teachers.length === 0"
          class="h100 flex-column-plain flex-center scroll-hidden"
        >
          <u-empty-custom
            mode="search"
            class="color-base no-shrink"
            :text="(keyword || '').trim().length > 0 ? '暂无数据' : '请输入教师姓名查询教师课表'"
          />
        </view>
        <view v-if="!showTeacherSchedule && teachers.length > 0" style="padding-bottom: 160rpx">
          <view
            v-for="t in teachers"
            :key="t.id"
            class="ml-l ptb-b pr-l border-bottom border-line-default flex-center"
            @click="handleSelectTeacher(t)"
          >
            <view class="icon-80 relative">
              <u-image
                width="80"
                height="80"
                shape="circle"
                :src="t.avatar"
                error-icon="/static/avatar.png"
              />
              <view class="absolute" style="bottom: -8rpx; right: -8rpx">
                <u-icon v-if="t.gender === 1" class="icon-34 font-xt" name="man" color="#1677FF" />
                <u-icon
                  v-if="t.gender === 2"
                  class="icon-34 font-xt"
                  name="woman"
                  color="#FF4D4F"
                />
              </view>
            </view>
            <view class="flex-stretch mlr-l flex-column-plain flex-left text-ellipse">
              <view class="color-primary text-ellipse">
                {{ t.name }}
              </view>
              <view class="color-placeholder text-ellipse">{{ t.jobNo }}</view>
            </view>
            <u-icon class="icon-40 font-title" name="arrow-right" color="#86909c" />
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { debounce } from '@/utils/lodash-es';
import { ref, unref, watch } from 'vue';
import { fetchTeachers, getTeacherScheduleById } from '../services/curriculum-schedule';
import Schedule from './components/schedule.vue';

const props = defineProps<{
  semester: string;
  currentWeek: number;
  weekList: any[];
}>();
const emits = defineEmits(['showDetail']);
const showTeacherSchedule = ref<any>(null);
const teachers = ref<any[]>([]);
const total = ref<number>(0);
const currentPage = ref<number>(1);
const keyword = ref('');
const searching = ref<any>(0);
const loading = ref(false);
const selectedCourse = ref(true);
const selectedSpace = ref(false);
const selectedColor = ref(true);
const dataMap = ref<any>({});

watch(
  () => props.currentWeek,
  v => {
    getSchedule(v);
  },
);

function handleFocus() {
  showTeacherSchedule.value = null;
}
async function handleSearch(value: string, loadMore: boolean) {
  if (showTeacherSchedule.value) {
    return;
  }
  keyword.value = (value || '').trim();
  if (loadMore && total.value > 0 && total.value <= teachers.value.length) {
    return;
  }
  if (!keyword.value) {
    teachers.value = [];
    if (searching.value) {
      clearTimeout(searching.value);
      searching.value = null;
    }
    return;
  }

  if (searching.value) {
    if (loadMore) {
      return;
    }
    clearTimeout(searching.value);
    searching.value = null;
  }

  searching.value = setTimeout(async () => {
    searching.value = null;
    let pageNum = 1;
    if (loadMore) {
      pageNum = currentPage.value + 1;
    }
    loading.value = true;
    try {
      const res: any = await fetchTeachers({
        pageNum,
        pageSize: 20,
        condition: keyword.value,
      });
      loading.value = false;
      total.value = res?.total || 0;
      const newList = (res?.result || []).map((i: any) => {
        return {
          id: i.id,
          name: i.name,
          gender: i.gender,
          jobNo: (i.jobNo || '').substr(-6),
          avatar: i.headImageUrl,
        };
      });
      if (loadMore) {
        currentPage.value += 1;
        teachers.value = [...teachers.value, ...newList];
      } else {
        teachers.value = newList;
      }
    } catch (error) {
      loading.value = false;
      console.log(error);
    }
  }, 200);
}
async function handleScrollToLower() {
  handleSearch(keyword.value, true);
}
function handleSelectTeacher(teacher: any) {
  showTeacherSchedule.value = teacher;
  keyword.value = showTeacherSchedule.value.name;
  getSchedule(props.currentWeek);
}

function handleSelect(type: string) {
  if (type === 'course') {
    selectedCourse.value = !selectedCourse.value;
  } else if (type === 'space') {
    selectedSpace.value = !selectedSpace.value;
  } else if (type === 'color') {
    selectedColor.value = !selectedColor.value;
  }
}
const getSchedule = debounce(async (v: number) => {
  if (v === -1 || !props?.weekList[v] || !showTeacherSchedule.value?.id) {
    return;
  }

  const week = unref(props.weekList[v]);
  const res: any = await getTeacherScheduleById(showTeacherSchedule.value.id, {
    startDate: week.startDate,
    endDate: week.endDate,
  });
  dataMap.value[v] = res || [];
}, 200);
function getScheduleName() {
  return showTeacherSchedule.value.name + ' 课表';
}
function handleShowDetail(data: any) {
  emits('showDetail', data);
}
</script>

<style lang="scss" scoped>
.search {
  border-radius: 16rpx;
  overflow: hidden;
  font-size: 32rpx;
}
.scroll-wrapper {
  height: calc(100% - 112rpx);
}
</style>
