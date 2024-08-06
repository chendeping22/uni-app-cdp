<template>
  <c-refresh-scroll
    ref="refreshScrollRef"
    :show-success-tip="false"
    :page-size="20"
    :fetch-data-func="fetchDataFunc"
    :auto-mount="false"
  >
    <template #top_area>
      <view class="flex-between">
        <view class="font-title color-black bold">录音文件</view>
        <view class="col-16">
          <u-subsection
            :current="dateType"
            :font-size="24"
            :list="
              AudioTimeEnum.map(item => ({
                name: item.label,
              }))
            "
            @change="setDateType"
          />
        </view>
      </view>
    </template>
    <template v-if="records?.length">
      <alarm-audio
        v-for="item in records"
        :key="item.id"
        :detail="item"
        :deny-play-audio="denyPlayAudio"
        @update-show-player="(isShow: boolean) => {updateShowPlayer(item.id,isShow)}"
      />
      <c-empty-line need-safe-bottom height="320rpx" />
    </template>
    <view v-else style="padding-top: 160rpx">
      <u-empty-custom content="暂无数据" mode="list" />
    </view>
  </c-refresh-scroll>
</template>
<script lang="ts" setup>
import { IAudioDataItem, fetchAudioList } from '@/app-school-safe/services/ai-prevent-bullying';
import { ref, toRefs, watch } from 'vue';
import { AudioTimeEnum } from '../../constants/AudioTimeEnum';
import AlarmAudio from '../alarm-audio/index.vue';

const refreshScrollRef = ref<any>();
const records = ref<IAudioDataItem[]>([]);
const total = ref(0);
const dateType = ref(0);

interface IProps {
  deviceId?: string;
  denyPlayAudio?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  deviceId: '',
  denyPlayAudio: false,
});
const { deviceId } = toRefs(props);

const fetchDataFunc = async (pager: any, loadType: any) => {
  if (!deviceId.value) return;
  const { pageSize, pageNum } = pager;
  const alarmTimeScope = AudioTimeEnum[dateType.value].getTimeScope();
  const res = await fetchAudioList({
    pageSize,
    pageNum,
    deviceId: deviceId.value,
    startTime: alarmTimeScope?.alarmTimeStart,
    endTime: alarmTimeScope?.alarmTimeEnd,
  });
  loadType === 'new' && (records.value = []);
  records.value.push(...res.result);
  total.value = res.total;
  return res;
};

const setDateType = (type: number) => {
  dateType.value = type;
};

const updateShowPlayer = (id: string, isShow: boolean) => {
  records.value = records.value.map(item => ({
    ...item,
    showPlayer: item.id === id ? isShow : false,
  }));
};

watch([dateType, deviceId], () => {
  refreshScrollRef.value?.initPager();
  refreshScrollRef.value?.fetchData('new');
});
</script>

<style scoped lang="scss"></style>
