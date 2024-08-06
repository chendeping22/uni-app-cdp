<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
  >
    <u-empty-custom
      v-if="list.length === 0"
      card
      text="暂无数据"
      :icon-size="100"
      :icon-gap="24"
      :font-size="24"
    />
    <view v-else class="pb-b">
      <view v-for="(item, inx) in list" :key="item.id">
        <view :class="[inx === 0 ? 'mt-b' : 'mt-s']">
          <view class="flex font-secondary">
            <view class="col-1 flex-grow text-ellipse color-placeholder">
              {{ item.name }}
            </view>
            <view class="no-shrink ml-l">
              <text class="bold">{{ item.value }}</text>
              <text class="color-placeholder ml-xxs">kW·h</text>
            </view>
          </view>
          <ProgressBar
            :percent="(item.value * 100) / total"
            :type="(inx === 0 && 'error') || (inx === 1 && 'warnning') || 'blue'"
          />
        </view>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { getClassroomEnergyRank, type IGetClassroomEnergyRankRtn } from '@/services/widgets';
import { loginStore } from '@/store/modules/login';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import { computed, onMounted, ref } from 'vue';
import ProgressBar from './components/progress-bar.vue';

interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const store = loginStore();
const { userInfo } = store;

const isLoad = ref(true);
const list = ref<IGetClassroomEnergyRankRtn[]>([]);

const total = computed(() => {
  return list.value.map(i => i.value).reduce((a, b) => a + b) || 1;
});

const handleClickNavigator = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    'campus/green-campus/green-campus',
    EApplicationType.Old,
  );
};

const fetchData = async () => {
  const res = await getClassroomEnergyRank({ type: 1, locationId: userInfo?.locationId || '' });
  return res || [];
};

const getData = async () => {
  list.value = await fetchData();
};

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.data-box {
  height: 100%;
  width: 100%;
}
</style>
