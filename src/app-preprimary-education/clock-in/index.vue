<template>
  <CustomPage v-if="isTeacher" title="打卡任务" bg-type="clock-in">
    <u-tabs
      v-model="activeTabIndex"
      :list="[{ name: '进行中' }, { name: '已结束' }]"
      :is-scroll="false"
      :active-color="primaryColor"
      @change="handleChangeTab"
    />
    <c-refresh-scroll ref="refreshScrollRef" :fetch-data-func="fetchDataFunc" extraHeight="80">
      <simple-tabs-item>
        <TaskCard v-for="(t, inx) in tasks.array" :key="t.taskId" :item="t" :inx="inx" />
        <imp-empty-line v-if="tasks.array.length > 0" size="xl" is-bottom />

        <c-empty
          v-if="tasks.array.length === 0 && loadingStatus === 1"
          bg-type="fill-default"
          content="暂无打卡任务"
        />
      </simple-tabs-item>
    </c-refresh-scroll>
    <imp-bottom>
      <view class="add-btn">
        <u-button type="primary" @click="handleAddTask">新增打卡</u-button>
      </view>
    </imp-bottom>
  </CustomPage>
  <CustomPage v-else title="打卡任务" bg-type="clock-in">
    <u-tabs
      v-model="activeTabIndex"
      :list="[{ name: '进行中' }, { name: '已结束' }]"
      :is-scroll="false"
      :active-color="primaryColor"
      @change="handleChangeTab"
    />
    <c-refresh-scroll ref="refreshScrollRef" :fetch-data-func="fetchDataFuncGuardian">
      <simple-tabs-item>
        <TaskCard v-for="(t, inx) in tasks.array" :key="t.id" :item="t" :inx="inx" />
        <imp-empty-line v-if="tasks.array.length > 0" size="safe-bottom" />
        <c-empty
          v-if="tasks.array.length === 0 && loadingStatus === 1"
          bg-type="fill-default"
          content="暂无打卡任务"
        />
      </simple-tabs-item>
    </c-refresh-scroll>
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
  getClockInTask,
  getClockInTaskByTeacher,
} from '@/app-preprimary-education/services/clock-in';
import { IOnShareAppMessage } from '@/app-preprimary-education/utils/common-types';
import { loginStore } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { EUserType } from '@/utils/kind';
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';
import { shareClockInTask } from '../utils/clock-in-share';
import TaskCard from './guardian/tasks/components/task-card/index.vue';

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
    if (loginStore().currentUserType == EUserType.teacher) {
      uni.$emit('tasks-list-show');
    }
  },
  onHide() {
    if (loginStore().currentUserType == EUserType.teacher) {
      uni.$emit('tasks-list-hide');
    }
  },
  setup() {
    const refreshScrollRef = ref(null as any);
    const activeTabIndex = ref(0);
    const tasks = reactive({ array: [] as IClockInTask[] });
    const curStatus = computed(() => (activeTabIndex.value === 0 ? 1 : 2));
    const loadingStatus = ref(0); // 加载状态 0-未开始 1-已结束
    const isTeacher = loginStore().currentUserType == EUserType.teacher;
    // 获取主题色
    const primaryColor = getPrimaryColor();
    const fetchDataFunc = async (pager: IPager, type: IDataLoadType) => {
      const { pageSize, pageNum } = pager;
      loadingStatus.value = 0;
      const res = await getClockInTaskByTeacher({ pageNum, pageSize, status: curStatus.value });
      loadingStatus.value = 1;
      type === 'new' && (tasks.array = []);
      tasks.array.push(...res.result);
      return res;
    };
    const fetchDataFuncGuardian = async (pager: IPager, type: IDataLoadType) => {
      const { pageSize, pageNum } = pager;
      loadingStatus.value = 0;
      const res = await getClockInTask({
        pageSize,
        pageNum,
        status: curStatus.value,
      });
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
      if (isTeacher) {
        uni.$on('tasks-list-show', handleOnShow);
      }
    });

    onBeforeUnmount(() => {
      if (isTeacher) {
        uni.$off('tasks-list-hide', handleOnShow);
      }
    });

    return {
      isTeacher,
      fetchDataFuncGuardian,
      activeTabIndex,
      refreshScrollRef,
      tasks,
      loadingStatus,
      primaryColor,
      fetchDataFunc,
      handleChangeTab,
      handleAddTask,
    };
  },
});
</script>
<style lang="scss" scoped>
.add-btn {
  padding: 0rpx 32rpx;
}
</style>
