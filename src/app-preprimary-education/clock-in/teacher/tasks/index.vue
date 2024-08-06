<template>
  <CustomPage title="打卡任务" bg-type="clock-in">
    <c-refresh-scroll ref="refreshScrollRef" :fetch-data-func="fetchDataFunc">
      <simple-tabs
        sticky
        :active-index="activeTabIndex"
        :tabs="['进行中', '已结束']"
        @onchangeTab="handleChangeTab"
      />
      <simple-tabs-item>
        <TaskCard v-for="(t, inx) in tasks.array" :key="t.taskId" :item="t" :inx="inx" />
        <imp-empty-line v-if="tasks.array.length > 0" size="xl" is-bottom />
        <card
          v-if="tasks.array.length === 0 && loadingStatus === 1"
          bg-type="empty"
          class-name="mt-xl"
        >
          <imp-empty-data title="暂无打卡任务" />
        </card>
      </simple-tabs-item>
    </c-refresh-scroll>
    <imp-bottom>
      <ImpButton @click="handleAddTask">新增打卡</ImpButton>
    </imp-bottom>
  </CustomPage>
</template>
<script lang="ts">
import Card from '@/app-preprimary-education/components/card/card.vue';
import ImpBottom from '@/app-preprimary-education/components/imp-bottom/imp-bottom.vue';
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import ImpEmptyLine from '@/app-preprimary-education/components/imp-empty-line/imp-empty-line.vue';
import {
  IDataLoadType,
  IPager,
} from '@/app-preprimary-education/components/imp-refresh-scroll/imp-refresh-scroll.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import SimpleTabsItem from '@/app-preprimary-education/components/simple-tabs-item/simple-tabs-item.vue';
import SimpleTabs from '@/app-preprimary-education/components/simple-tabs/simple-tabs.vue';
import {
  IClockInTask,
  IGetClockInDetailRtn,
  getClockInTaskByTeacher,
} from '@/app-preprimary-education/services/clock-in';
import { shareClockInTask } from '@/app-preprimary-education/utils/clock-in-share';
import { IOnShareAppMessage } from '@/app-preprimary-education/utils/common-types';
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';
import TaskCard from '../../guardian/tasks/components/task-card/index.vue';

type IShare = Pick<IGetClockInDetailRtn, 'id' | 'personName' | 'title'>;

export default defineComponent({
  onShareAppMessage(item: IOnShareAppMessage<'button'>) {
    const task: IShare = item.target.dataset.msg;
    return shareClockInTask(task);
  },
  components: {
    TaskCard,
    CustomPage,
    SimpleTabs,
    SimpleTabsItem,
    ImpEmptyLine,
    ImpEmptyData,
    Card,
    ImpBottom,
    ImpButton,
  },
  onShow() {
    uni.$emit('tasks-list-show');
  },
  onHide() {
    uni.$emit('tasks-list-hide');
  },
  setup() {
    const refreshScrollRef = ref(null as any);
    const activeTabIndex = ref(0);
    const tasks = reactive({ array: [] as IClockInTask[] });
    const curStatus = computed(() => (activeTabIndex.value === 0 ? 1 : 2));
    const loadingStatus = ref(0); // 加载状态 0-未开始 1-已结束

    const fetchDataFunc = async (pager: IPager, type: IDataLoadType) => {
      const { pageSize, pageNum } = pager;
      loadingStatus.value = 0;
      const res = await getClockInTaskByTeacher({ pageNum, pageSize, status: curStatus.value });
      loadingStatus.value = 1;
      type === 'new' && (tasks.array = []);
      tasks.array.push(...res.result);
      return res;
    };

    const handleChangeTab = (inx: number) => {
      activeTabIndex.value = inx;
      tasks.array = [];
      refreshScrollRef.value.initData();
    };

    const handleAddTask = () => {
      uni.navigateTo({
        url: '/app-preprimary-education/clock-in/teacher/tasks/choose-template/index',
      });
    };

    const handleOnShow = () => {
      const pager = { pageSize: 10, pageNum: 1, total: 0 };
      fetchDataFunc(pager, 'new');
    };

    onBeforeMount(() => {
      // #ifdef MP-WEIXIN
      uni.hideShareMenu({ hideShareItems: [] });
      // #endif
      uni.$on('tasks-list-show', handleOnShow);
    });

    onBeforeUnmount(() => {
      uni.$off('tasks-list-hide', handleOnShow);
    });

    return {
      activeTabIndex,
      refreshScrollRef,
      tasks,
      loadingStatus,
      fetchDataFunc,
      handleChangeTab,
      handleAddTask,
    };
  },
});
</script>
<style lang="scss" scoped></style>
