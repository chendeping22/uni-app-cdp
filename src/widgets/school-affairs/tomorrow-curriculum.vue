<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickHeader"
    @pullDownRefresh="getCourses"
  >
    <view class="day-switch">
      <view
        :class="['day-option', { 'day-select': currentSelect === 'today' }]"
        @click="handleSwitch('today')"
      >
        今日
      </view>
      <view
        :class="['day-option', { 'day-select': currentSelect !== 'today' }]"
        @click="handleSwitch('tomorrow')"
      >
        明日
      </view>
    </view>
    <view
      v-for="(item, index) in messages"
      :key="item.name"
      :class="['curriculum-outer', 'bg' + (index % 6), { 'no-course': !item.list.length }]"
    >
      <view class="student-name">
        <text>{{ item.name }} </text>
      </view>
      <view class="clear-parent-bg">
        <view v-if="item.list.length" class="curriculums-wrap">
          <view v-for="ls in item.list" :key="item.name + ls.type" class="curriculums">
            <text class="lesson-title">{{ ls.type }}</text>
            <text v-for="l in ls.lessons" :key="item.name + ls.type + l" class="lesson-details">
              {{ l }}
            </text>
          </view>
        </view>
        <empty v-else content="未安排课程" />
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import {
  ICourse,
  IGuardianCourses,
  getGuardianCourses,
} from '@/services/homeSchoolWidgetsServices';
import { loginStore } from '@/store/modules/login';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import dayjs from 'dayjs';
import { computed, onMounted, reactive, ref, toRefs, watchEffect } from 'vue';
import empty from '../components/empty.vue';
/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

const timeMap: Record<string, string> = {
  1: '上午',
  2: '下午',
  3: '晚上',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});
const store = loginStore();
const { currentOrganization } = toRefs(store);
const curStudentId = ref(currentOrganization.value?.childId);
const isLoad = ref(false);
const currentSelect = ref<'today' | 'tomorrow'>('today');
const courses = reactive({
  today: [] as IGuardianCourses[],
  tomorrow: [] as IGuardianCourses[],
});
const courseData = reactive({ today: [] as ICourse, tomorrow: [] as ICourse });

watchEffect(() => {
  const msg = courses[currentSelect.value].map(item => ({
    name: item.name,
    list: Object.keys(item.courseMap)
      .map((v: string) => ({
        type: timeMap[v],
        lessons: item.courseMap[v],
      }))
      .filter(i => !!i.lessons.length),
  }));
  courseData[currentSelect.value] = msg;
});
const messages = computed(() => courseData[currentSelect.value]);

// 获取课表信息
const getCourses = async () => {
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const todayRes = await getGuardianCourses(today);
  const tomorrowRes = await getGuardianCourses(tomorrow);
  courses.today = todayRes;
  courses.tomorrow = tomorrowRes;
  isLoad.value = true;
};
const handleSwitch = (type: 'today' | 'tomorrow') => {
  if (type === currentSelect.value) return;
  currentSelect.value = type;
};
const handleClickHeader = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/subPackages/curriculum/student-curriculum?id=${curStudentId.value}`,
    EApplicationType.Old,
  );
};
onMounted(() => {
  getCourses();
});
</script>

<style lang="scss" scoped>
.curriculum {
  margin-top: $ui-gap-default;
}

.day-switch {
  display: flex;
  justify-content: center;
  margin-bottom: $ui-gap-large;
  .day-option {
    width: 112rpx;
    height: 56rpx;
    background: $ui-card-shadow;
    border-radius: 28rpx;
    font-size: $ui-font-size-content;
    color: $ui-color-secondary;
    letter-spacing: 0;
    text-align: center;
    line-height: 56rpx;
    font-weight: $ui-font-weight-bold;
  }
  :last-child {
    margin-left: $ui-gap-large;
  }
  .day-select {
    color: $uni-text-color-inverse;
    background: $ui-color-primary;
  }
}

.curriculum-outer {
  display: flex;
  align-items: center;
  margin-bottom: $ui-gap-large;

  &.bg0 {
    background-image: linear-gradient(
      135deg,
      rgba($ui-color-warnning, 0.8) 0%,
      $ui-color-warnning 100%
    );
    .curriculums-wrap {
      background: rgba($ui-color-warnning, 0.1);
      .curriculums {
        color: $ui-color-warnning;
        &:nth-child(n + 2) {
          border-top: 1px solid rgba($ui-color-warnning, 0.25);
        }
      }
    }
  }

  &.bg1 {
    background-image: linear-gradient(
      135deg,
      rgba($ui-color-primary, 0.8) 0%,
      $ui-color-primary 100%
    );
    .curriculums-wrap {
      background: rgba($ui-color-primary, 0.1);
      .curriculums {
        color: $ui-color-primary;
        &:nth-child(n + 2) {
          border-top: 1px solid rgba($ui-color-primary, 0.25);
        }
      }
    }
  }
  &.bg2 {
    background-image: linear-gradient(
      135deg,
      rgba($ui-color-success, 0.6) 0%,
      $ui-color-success 100%
    );
    .curriculums-wrap {
      background: rgba($ui-color-success, 0.08);
      .curriculums {
        color: $ui-color-success;
        &:nth-child(n + 2) {
          border-top: 1px solid rgba($ui-color-success, 0.2);
        }
      }
    }
  }
  &.bg3 {
    background-image: linear-gradient(135deg, rgba($ui-color-blue, 0.55) 0%, $ui-color-blue 100%);
    .curriculums-wrap {
      background: rgba($ui-color-blue, 0.1);
      .curriculums {
        color: $ui-color-blue;
        &:nth-child(n + 2) {
          border-top: 1px solid rgba($ui-color-blue, 0.2);
        }
      }
    }
  }
  &.bg4 {
    background-image: linear-gradient(
      135deg,
      rgba($ui-color-purple, 0.7) 0%,
      $ui-color-purple 100%
    );
    .curriculums-wrap {
      background: rgba($ui-color-purple, 0.1);
      .curriculums {
        color: $ui-color-purple;
        &:nth-child(n + 2) {
          border-top: 1px solid rgba($ui-color-purple, 0.2);
        }
      }
    }
  }
  &.bg5 {
    background-image: linear-gradient(135deg, rgba($ui-color-error, 0.6) 0%, $ui-color-error 100%);
    .curriculums-wrap {
      background: rgba($ui-color-error, 0.1);
      .curriculums {
        color: $ui-color-error;
        &:nth-child(n + 2) {
          border-top: 1px solid rgba($ui-color-error, 0.2);
        }
      }
    }
  }

  &.no-course {
    background-image: unset;
    background: $ui-color-fill-light;
    .student-name {
      text {
        color: $ui-color-placeholder;
      }
    }
  }

  border-radius: $ui-radius-default;
  .student-name {
    min-width: 140rpx;
    max-width: 140rpx;
    text-align: center;
    word-break: break-all;

    text {
      font-size: $ui-font-size-title;
      color: $ui-color-white;
      font-weight: $ui-font-weight-bold;
    }
  }
  .clear-parent-bg {
    background: $ui-color-white;
    flex-grow: 1;
    border-top-left-radius: $ui-radius-default;
    border-bottom-left-radius: $ui-radius-default;
  }
  .curriculums-wrap {
    border-radius: $ui-radius-default;
    .curriculums {
      display: flex;
      align-items: center;
      min-height: 80rpx;
      font-weight: $ui-font-weight-bold;

      //   margin-right: $ui-gap-xs;
      .lesson-title {
        width: 100rpx;
        flex-shrink: 0;
        font-size: $ui-font-size-secondary;
        text-align: center;
      }
      .lesson-details {
        font-size: $ui-font-size-content;
        flex-grow: 1;
        min-width: 1em;
        margin: 0 $ui-gap-xxs;
        text-align: center;

        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        word-break: break-all;
      }
    }
  }
}
</style>
