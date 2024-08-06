<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pull-down-refresh="handleOnMount"
    @show="handleOnMount"
  >
    <u-empty-custom v-if="!data.num || data.dataList?.length === 0" card text="暂无预定信息" />
    <template v-else>
      <view class="reserve-title flex-inline font-title lh-6 color-base">
        您今天剩下<view class="color-primary">{{ data.num || 0 }}</view
        >场预约
      </view>
      <view
        v-for="(item, idx) in data.dataList"
        :key="`${item.id || idx}_${item.reserveName}`"
        class="reserve-item mb-b pt-s pb-s pl-b pr-l flex-column-plain"
        @click="handleClickToDetail(item.id)"
      >
        <view class="flex-between">
          <view class="flex-inline col-18">
            <view class="font-base color-base mr-xxs text-ellipse">{{ item.reserveName }}</view>
            <view class="no-shrink">
              <c-tag-item
                v-if="item.reserveStatusItem"
                :text="item.reserveStatusItem.label"
                :bg-type="item.reserveStatusItem.bgType"
                :color-type="item.reserveStatusItem.colorType"
                font-type="content"
              />
            </view>
          </view>
          <view class="font-secondary color-secondary">{{ item.reserveScope }}</view>
        </view>
        <view class="font-content color-placeholder">{{ item.spaceName }}</view>
      </view>
    </template>
  </widget-card>
</template>

<script lang="ts" setup>
import type { TTodayReserveInfo } from '@/services/widgets';
import { fetchTodayReserve } from '@/services/widgets';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';

const statusEnum = [
  {
    value: 0,
    label: '未开始',
    bgType: 'cyan-light-3',
    colorType: 'cyan',
  },
  {
    value: 1,
    label: '进行中',

    bgType: 'primary-light-3',
    colorType: 'blue',
  },
];

const data = ref<Partial<TTodayReserveInfo>>({});

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(false);

/** 调用API，获取真实数据 */
async function fetchData() {
  const res = await fetchTodayReserve();
  return res || {};
}

async function handleOnMount() {
  let res = await fetchData();
  data.value = {
    num: res.num || 0,
    dataList: (res.dataList || []).map(item => {
      const statusItem = statusEnum.find(status => status.value === item.reserveStatus);
      return {
        ...item,
        reserveStatusItem: statusItem,
      };
    }),
  };
  isLoad.value = true;
}

onMounted(() => {
  handleOnMount();
});

const handleClickNavigator = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    '/subPackages/site-reservation/index',
    EApplicationType.Old,
  );
};

const handleClickToDetail = (id: string) => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/subPackages/site-reservation/detail?id=${id}`,
    EApplicationType.Old,
  );
};
</script>

<style lang="scss" scoped>
.reserve-title {
  margin-top: 28rpx;
  margin-bottom: 16rpx;
}
.reserve-item {
  background: #f8f8fa;
}

.flex-inline {
  display: inline-flex;
  align-items: center;
}

.flex-column-plain {
  display: flex;
  flex-direction: column;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.color-base {
  color: #1d2129;
}

.color-secondary {
  color: #4e5969;
}

.color-placeholder {
  color: #86909c;
}

.font-title {
  font-size: 30rpx;
}

.font-secondary {
  font-size: 0.75rem;
}

.font-content {
  font-size: 24rpx;
}

.lh-6 {
  line-height: 1.6;
}

.mb-b {
  margin-bottom: 24rpx;
}

.pt-s {
  padding-top: 16rpx;
}

.pb-s {
  padding-bottom: 16rpx;
}

.pl-b {
  padding-left: 24rpx;
}

.pr-l {
  padding-right: 32rpx;
}

.mr-xxs {
  margin-right: 8rpx;
}

.col-18 {
  width: 75%;
}

.text-ellipse {
  text-overflow: ellipsis;
  word-break: break-all;
  overflow: hidden;
  white-space: nowrap;
}
</style>
