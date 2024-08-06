<template>
  <alarm-detail :loading="loading" :data="detail" :is-need-process="false">
    <template #header>
      <view class="w100 plr-l">
        <alarm-video
          title="关联摄像头"
          :device-name="detail?.ipcDev"
          :device-id="detail?.relIpc"
          :playback-url="
            detail?.recordExtVOList?.[0]?.videoId ? detail?.recordExtVOList?.[0]?.videoUrl : ''
          "
          :snap-img-url="detail?.recordExtVOList?.[0]?.snapImgUrl"
          :finish-capture="detail?.recordExtVOList?.[0]?.finishCapture"
          placeholder="告警触发时未检测到关联摄像头，如已配置，将在下一次告警触发时显示关联信息"
          :extra-info="
            detail?.recordExtVOList?.length
              ? ''
              : '暂无配置告警视频截取，如需查看请前往告警配置中设置'
          "
        />
      </view>
    </template>
    <view class="mt-l">
      <u-card :show-head="false" full margin="0" :border="false" class="radius-card">
        <template #body>
          <audio-player
            ref="audioPlayerRef"
            :url="detail?.audioUrl"
            :duration="detail?.audioDuration"
            :disabled="denyPlayAudio"
            disabled-toast-content="对讲中，无法播放音频"
            @error="errorHandle"
          >
            <view class="alarm-call ml-l pl-l">
              <alarm-call
                v-if="showAlarmCall"
                :device-id="detail?.deviceId"
                :is-online="true"
                @call="startCall"
                @stop="stopCall"
              />
            </view>
          </audio-player>
        </template>
      </u-card>
    </view>

    <alarm-condition :condition="detail?.conditionJson" />
    <device-info
      :detail="detail"
      :alarm-type="AlarmTypeEnum.ANTIBULLYING"
      :extra-info="[
        {
          value: monitorName,
          label: '告警类型',
        },
      ]"
    />
  </alarm-detail>
</template>
<script lang="ts" setup>
import AlarmDetail from '@/app-school-safe/components/alarm-detail/index.vue';
import DeviceInfo from '@/app-school-safe/components/alarm-device-info/index.vue';
import AlarmVideo from '@/app-school-safe/components/alarm-video/index.vue';
import AudioPlayer from '@/app-school-safe/components/audio-player/index.vue';
import { AlarmTypeEnum } from '@/app-school-safe/constants/AlarmTypeEnum';
import { IAlarmDataItem, fetchRecordDetail } from '@/app-school-safe/services/ai-prevent-bullying';
import { getPageParams } from '@/utils/tools';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import AlarmCall from './components/alarm-call/index.vue';
import AlarmCondition from './components/alarm-condition/index.vue';
import { AlarmMonitorEnum } from './constants/AlarmMonitorEnum';

const detail = ref<IAlarmDataItem>();
const monitorName = ref<string>();
const loading = ref(true);
const denyPlayAudio = ref(false);
const audioPlayerRef = ref();

const id = ref<string>('');

const showAlarmCall = computed(() => {
  // 仅支持android端
  return plus.os.name === 'Android';
});

const fetchDetail = async () => {
  loading.value = true;
  try {
    const res = await fetchRecordDetail(id.value);
    monitorName.value = AlarmMonitorEnum.find(item => item.value === res?.monitorType)?.label;
    detail.value = {
      ...res,
      libraryName: res.monitorName,
      content: `在${res?.spaceName ?? '未知空间'}出现${res.monitorName}，请注意`,
      level: res?.levelCode,
      time: res.snapTime,
    };
  } finally {
    loading.value = false;
  }
};

const errorHandle = () => {
  uni.showToast({
    title: '获取录音失败，请稍后再试',
    icon: 'none',
  });
};

const startCall = () => {
  denyPlayAudio.value = true;
  audioPlayerRef.value?.destroy();
};

const stopCall = () => {
  denyPlayAudio.value = false;
};

onMounted(() => {
  fetchDetail();
});

onBeforeMount(() => {
  const pageParams = getPageParams();
  id.value = pageParams.id;
});
</script>
<style lang="scss" scoped>
.radius-card {
  border-radius: $radius-base;
}
.alarm-call {
  border-left: 1px solid $color-border;
}
</style>
