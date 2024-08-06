<template>
  <CustomPage title="打卡名单" bg-type="clock-in">
    <u-tabs
      v-model="activeTabIndex"
      :tabs="[
        { name: `已打卡(${clockInList?.value?.clockins?.length || 0})` },
        { name: `未打卡(${clockInList?.value?.unclockins?.length || 0})` },
      ]"
      :is-scroll="false"
      :active-color="primaryColor"
      @change="handleChangeTab"
    />
    <simple-tabs-item v-if="activeTabIndex === 0">
      <TaskList :clock-data="clockInList?.value?.clockins" :active-tab-index="activeTabIndex" />
    </simple-tabs-item>
    <simple-tabs-item v-if="activeTabIndex === 1">
      <TaskList :clock-data="clockInList?.value?.unclockins" :active-tab-index="activeTabIndex" />
    </simple-tabs-item>
    <c-empty-line need-safe-bottom class-name="mtb-b" height="180rpx" />
    <c-bottom v-if="activeTabIndex === 1">
      <c-button height-size="button-s" @click="sendMessage">
        <u-image
          :src="iconRemind"
          :width="46"
          :height="46"
          class="lh-0 pr-s"
          :show-loading="false"
        />
        <text class="font-title">提醒打卡</text>
      </c-button>
    </c-bottom>
  </CustomPage>
</template>
<script lang="ts">
interface IParams {
  id: string;
  clazzId: string;
  date: number;
}
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import SimpleTabsItem from '@/app-preprimary-education/components/simple-tabs-item/simple-tabs-item.vue';
import SimpleTabs from '@/app-preprimary-education/components/simple-tabs/simple-tabs.vue';
import {
  IClassItems,
  getClassTaskDetail,
  sendClickInMessage,
} from '@/app-preprimary-education/services/clock-in';
import iconRemind from '@/app-preprimary-education/static/image/remind_icon.png';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, reactive, ref } from 'vue';
import TaskList from '../components/task-list/index.vue';

export default defineComponent({
  components: { TaskList, CustomPage, SimpleTabs, SimpleTabsItem },
  setup() {
    const activeTabIndex = ref(0);
    const clockInList = reactive({ value: {} as IClassItems });
    // 获取主题色
    const primaryColor = getPrimaryColor();
    const handleChangeTab = (inx: number) => {
      activeTabIndex.value = inx;
    };

    const getTaskList = async () => {
      const params = getPageParams<IParams>();
      const { id, clazzId, date } = params;
      const res = await getClassTaskDetail({ id, clazzId, date });
      clockInList.value = res;
    };

    const sendMessage = async () => {
      const params = getPageParams<IParams>();
      const { id } = params;
      const list = clockInList?.value?.unclockins.map(item => item.studentId);
      try {
        await sendClickInMessage(id, list);
        uni.showToast({ title: '提醒成功', icon: 'none', duration: 2000 });
      } catch (e) {
        uni.showToast({ title: '提醒失败', icon: 'none', duration: 2000 });
      }
    };

    onBeforeMount(() => {
      getTaskList();
    });

    return {
      activeTabIndex,
      clockInList,
      primaryColor,
      handleChangeTab,
      sendMessage,
      iconRemind,
    };
  },
});
</script>
