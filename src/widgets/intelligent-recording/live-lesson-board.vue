<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoaded"
    :body-height="bodyHeight"
    @head-click="handleJumpToClassroomOnCloud"
    @pullDownRefresh="fetchLiveLessonsData"
  >
    <view v-if="hasData" class="w100 h100 list">
      <view v-for="i in liveLessons" :key="i.id" class="flex-between radius-default list-item">
        <view class="flex-column-plain title">
          <text class="font-title bold text-ellipse color-base">{{ i.name }}</text>
          <view class="color-placeholder font-content mt-xxs">
            <view v-if="+i.status === 2">
              <TimeCount :start-time="i.startTime" :title="liveStatusText[+i.status]" />
            </view>
            <view v-else>{{ liveStatusText[+i.status] }}</view>
          </view>
        </view>
        <c-button
          height-size="button-xxs"
          @click="handleJumpToDetail(i.id, i.lessonType, i.personId, i.personName)"
          >详情</c-button
        >
      </view>
    </view>
    <u-empty-custom v-else card text="暂无直播活动" />
  </widget-card>
</template>
<script lang="ts" setup>
import { getLiveLessons } from '@/services/widgets';
import type { IWidget } from '@/store/modules/workbench';
import { EApplicationType, ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import { computed, onMounted, ref } from 'vue';
import TimeCount from './components/time-count/index.vue';
import type { LiveListItem } from './types';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoaded = ref(false);
const liveLessons = ref<LiveListItem[]>([]);

const liveStatusText = ['', '未开始', '即将开始：还有', '直播中', '已结束'];
const hasData = computed(() => !!liveLessons.value.length);

/**
 * 跳转到云上课堂
 */
const handleJumpToClassroomOnCloud = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    '/intelligent-recording/classroom-on-cloud/doraemon-h5/index',
    EApplicationType.Old,
  );
};

/**
 * 跳转到直播详情
 */
const handleJumpToDetail = (
  id: string | number,
  lessonType: string,
  studentId: string | number,
  studentName: string,
) => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/intelligent-recording/classroom-on-cloud/doraemon-h5/index?lessonId=${id}&lessonType=${lessonType}&personId=${studentId}&personName=${studentName}`,
    EApplicationType.Old,
  );
};

/** 获取直播活动列表 */
const fetchLiveLessonsData = async () => {
  try {
    isLoaded.value = false;
    const { result } = await getLiveLessons({
      pageNum: 1,
      pageSize: 2,
    });
    liveLessons.value = result;
  } catch (err) {
    liveLessons.value = [];
  } finally {
    isLoaded.value = true;
  }
};

onMounted(() => {
  fetchLiveLessonsData();
});
</script>
<style scoped lang="scss">
.list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 24rpx;
  .list-item {
    padding: 16rpx 32rpx;
    background: #f8f8fa;
  }
}
</style>
