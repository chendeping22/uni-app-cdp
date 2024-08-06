<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
  >
    <view class="list-wrap">
      <view v-for="(item, index) in list" :key="index" class="list-item" @click="handleClick(item)">
        <view class="icon-wrap">
          <u-image height="48" width="48" :src="item.icon"></u-image>
          <u-badge v-if="index === 0" type="error" :count="todoCount" is-center></u-badge>
        </view>
        <text>{{ item.name }}</text>
      </view>
    </view>
    <u-button @click="handleClick(flowQuickLaunchItem)"
      ><u-icon class="btn-icon" :name="flowQuickLaunchItem.icon"></u-icon
      ><text>{{ flowQuickLaunchItem.name }}</text></u-button
    >
  </widget-card>
  <imp-mqtt-subscriber :topics="topics" @init="mqttInit" @message="onMessage"></imp-mqtt-subscriber>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import type { IWidget } from '@/store/modules/workbench';
import { ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { EUserType } from '@/utils/kind';
import MQTT_TOPICS from '@/utils/mqtt/mqtt.topics';
import { request } from '@/utils/request';
import widgetCard from '@/widgets/components/widget-card.vue';
import copy from '@/widgets/static/copy.svg';
import done from '@/widgets/static/done.svg';
import sent from '@/widgets/static/sent.svg';
import todo from '@/widgets/static/todo.svg';
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';

interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

withDefaults(defineProps<IProps>(), {});

const topics = [MQTT_TOPICS.TODO_NUMS];

const todoCount = ref(0);

const isLoad = ref(true);

const list = [
  {
    icon: copy,
    name: '待处理',
    url: '/pages/todoCenter/home/index',
  },
  {
    icon: done,
    name: '已处理',
    url: '/pages/todoCenter/home/index?tab=1',
  },
  {
    icon: sent,
    name: '我发起',
    url: '/pages/todoCenter/home/index?tab=2',
  },
  {
    icon: todo,
    name: '抄送我',
    url: '/pages/todoCenter/home/index?tab=3',
  },
];

const flowQuickLaunchItem = {
  icon: 'plus',
  name: '发起事项',
  url: '/pages/todoCenter/flowQuickLaunch/index',
};

/** 低码路由跳转 */
const navigateTo = (url: string) => {
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};

const handleClick = (item: { url: string }) => {
  navigateTo(item.url);
};

const handleClickNavigator = () => {
  navigateTo(`/pages/todoCenter/home/index`);
};

/** 获取待办数量 */
const getTodoCount = async () => {
  const res = await request<any>('/workflow/Engine/FlowTask/todoNums', {}, 'GET', {
    showLoading: false,
    spaceType: request.service.lowcode,
  });
  console.log('..... 更新待办数量:', res);
  todoCount.value = res;
};

const mqttInit = (item: { notifySubOrUnSubToEndApi: any; manualSubOrUnsub: any }) => {
  const { notifySubOrUnSubToEndApi } = item;
  const store = loginStore();
  const userId =
    store.currentUserType === EUserType.teacher ? store.userInfo?.id : store.userInfo?.personId;
  if (userId?.length && userId?.length > 0) {
    notifySubOrUnSubToEndApi(true, {
      topic: MQTT_TOPICS.TODO_NUMS,
      bid: userId,
    });
  }
};

const onMessage = (message: any) => {
  console.log('...... 收到待办数量变更消息:', message);
  getTodoCount();
};

onShow(() => {
  console.log('........ onShow');
  getTodoCount();
});

getTodoCount();
</script>
<style lang="scss" scoped>
.list-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  margin-left: -24rpx;
  margin-right: -24rpx;

  .list-item {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
  }

  .icon-wrap {
    width: 80rpx;
    height: 80rpx;
    position: relative;
    background-color: #0000000a;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx;
  }

  .item-icon {
    width: 48rpx;
    height: 48rpx;
  }
}

.btn-icon {
  margin-right: 20rpx;
}
</style>
