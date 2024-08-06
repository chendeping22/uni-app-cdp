<template>
  <widget-card
    :widget="widget"
    is-loaded-data
    :body-height="bodyHeight"
    :custom-head="true"
    @pullDownRefresh="getData"
  >
    <template #custom-head>
      <view class="h-88 flex-between pr-l">
        <view>
          <u-tabs
            v-model="current"
            class="bold"
            :is-scroll="false"
            :item-width="184"
            :height="88"
            inactive-color="#4e5969"
            :list="[{ name: '今日课表' }, { name: '明日课表' }]"
            @change="handleTabChange"
          />
        </view>
        <view class="flex h-88 font-title" @click="handleJump">
          <text class="right-text">我的课表</text>
          <u-icon name="arrow-right" class="right-icon" />
        </view>
      </view>
    </template>
    <view v-if="isInit && list.length > 0" class="ptb-b">
      <view
        v-for="(i, index) in list"
        :key="i.index"
        class="radius-default scroll-hidden"
        style="background-color: #fafbfc"
        :class="index > 0 ? 'mt-b' : ''"
      >
        <view v-if="isTeacher" class="h-112 flex flex-between" style="padding: 0 32rpx">
          <view class="flex-stretch flex-column-plain">
            <view class="font-title color-base bold text-ellipse">
              {{ i.startTime }}-{{ i.endTime }}
            </view>
            <u-gap v-if="i.spaceDesc" :height="8" />
            <view v-if="i.spaceDesc" class="font-secondary text-ellipse">{{ i.spaceDesc }}</view>
          </view>
          <view class="flex-stretch flex-column-plain">
            <view v-if="i.subjectName" class="font-content text-right text-ellipse">
              {{ i.subjectName }}
            </view>
            <u-gap v-if="i.subjectName && i.clazzName" :height="8" />
            <view v-if="i.clazzName" class="text-right font-secondary text-ellipse">
              {{ i.clazzName }}
            </view>
          </view>
        </view>
        <view v-else class="flex">
          <view
            class="w-64 h-112 font-title bold flex flex-center color-primary"
            style="background-color: #e6f4ff"
          >
            {{ i.index }}
          </view>
          <view class="flex-stretch h-112 flex flex-between" style="padding: 0 16rpx">
            <view class="flex-stretch flex-column-plain">
              <view class="font-title color-base bold text-ellipse">{{ i.subjectName }}</view>
              <u-gap :height="8" />
              <view class="font-secondary text-ellipse"> {{ i.startTime }}-{{ i.endTime }} </view>
            </view>
            <view class="flex-stretch flex-column-plain">
              <view v-if="i.teacherDesc" class="text-right font-content text-ellipse">
                {{ i.teacherDesc }}
              </view>
              <u-gap v-if="i.teacherDesc && i.spaceDesc" :height="8" />
              <view v-if="i.spaceDesc" class="text-right font-secondary text-ellipse">
                {{ i.spaceDesc }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <u-empty-custom
      v-if="isInit && list.length === 0"
      card
      bg-type="fill-light"
      type="mini"
      class-name="mt-b"
      :text="current === 0 ? '今天没有课哦~' : '明天没有课哦~'"
    />
  </widget-card>
</template>

<script lang="ts" setup>
import { getStudentSchedule, getTeacherSchedule } from '@/services/widgets';
import { loginStore } from '@/store/modules/login';
import { type IWidget } from '@/store/modules/workbench';
import { EUserType } from '@/utils/kind';
import widgetCard from '@/widgets/components/widget-card.vue';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';

interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

withDefaults(defineProps<IProps>(), {});

const currentUserType = loginStore().currentUserType;
const isTeacher = currentUserType === EUserType.teacher;
const isStudent = currentUserType == EUserType.student;
const isGuardian = currentUserType == EUserType.guardian;

const isInit = ref(false);
const current = ref(0);

const list = ref<any[]>([]);

function handleTabChange(index: number) {
  current.value = index;
  getData();
}
/**
 * 获取家校通知信息
 */
const getData = async () => {
  let dateStr = dayjs().format('YYYY-MM-DD');
  if (current.value === 1) {
    dateStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
  }

  const params: any = {
    startDate: dateStr,
    endDate: dateStr,
  };
  try {
    if (isTeacher) {
      const data: any = await getTeacherSchedule(params);
      list.value = getCourseList(data);
    } else if (isStudent) {
      const userInfo = loginStore().userInfo;
      if (!userInfo || !userInfo.personId) {
        return;
      }
      const data: any = await getStudentSchedule(userInfo.personId, params);
      list.value = getCourseList(data);
    } else if (isGuardian) {
      const userInfo = loginStore().userInfo;
      if (!userInfo || !userInfo.currentChildId) {
        return;
      }
      const data: any = await getStudentSchedule(userInfo.currentChildId, params);
      list.value = getCourseList(data);
    }
    isInit.value = true;
    uni.$emit('widgetCalculateHeight');
  } catch (error) {
    isInit.value = true;
    console.log(error);
  }
};

function getCourseList(list: any) {
  const res: any[] = [];
  let index = 0;
  (list || []).forEach((i: any) => {
    (i.sectionCourses || []).forEach((j: any) => {
      index += 1;
      (j.courseCells || []).forEach((k: any) => {
        res.push({
          index: index,
          subjectName: k.subjectName,
          clazzName: k.clazzName,
          startTime: k.startTime,
          endTime: k.endTime,
          teacherDesc: k.teacherDesc,
          spaceDesc: k.spaceDesc,
        });
      });
    });
  });
  return res;
}

const handleJump = () => {
  uni.navigateTo({
    url: `/app-school-affairs/curriculum-schedule/index`,
  });
};

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.right-text {
  color: rgba(0, 0, 0, 0.45);
}
.right-icon {
  margin-left: 16rpx;
  color: #969799;
  font-size: 28rpx;
}
</style>
