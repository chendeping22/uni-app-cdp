<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pullDownRefresh="getData"
  >
    <view class="content pb-s">
      <view
        v-for="item in list"
        :key="item.id"
        class="mt-b"
        @click.stop="handleJumpToDetail(item.id, null)"
      >
        <view class="flex mb-xxs">
          <text class="font-title mr-s">{{ item.title }}</text>
        </view>
        <scroll-view scroll-x>
          <view class="flex-inline">
            <view
              v-for="clz in item.clazzs"
              :key="clz.clazzId"
              class="w-208 bg-fill-light radius-default plr-b ptb-s mr-b"
              @click.stop="handleJumpToDetail(item.id, clz.clazzId)"
            >
              <view class="text-ellipse color-secondary">
                {{ clz.clazzName }}
              </view>
              <view>
                <text class="font-xxt base">{{ clz.clockins.length }}</text>
                <text class="color-secondary">/{{ clz.studentNum }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view v-if="list.length === 0" class="flex-column">
        <u-empty-custom card text="今日无打卡任务" :icon-size="120" />
        <c-button width="148" height-size="button-xxs" @click="handleAddTask"> 去创建 </c-button>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { getBenchTasks, ITasksList } from '@/services/widgets';
import { IWidget } from '@/store/modules/workbench';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(false);
const list = ref<ITasksList[]>([]);

/** 调用API，获取真实数据 */
const fetchData = async () => {
  const res = await getBenchTasks();
  return res || [];
};

const handleClickNavigator = () => {
  uni.navigateTo({
    url: '/app-preprimary-education/clock-in/teacher/tasks/index',
  });
};
const getData = async () => {
  const res = await fetchData();
  list.value = res?.slice(0, 2) || [];
  isLoad.value = true;
};

const handleAddTask = () => {
  uni.navigateTo({
    url: '/app-preprimary-education/clock-in/teacher/tasks/choose-template/index',
  });
};

const handleJumpToDetail = (id: number, clazzId: string | null) => {
  uni.navigateTo({
    url: `/app-preprimary-education/clock-in/teacher/detail/index?id=${id}&clazzId=${clazzId}`,
  });
};

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.content {
  overflow: auto;
  height: 100%;
}
</style>
