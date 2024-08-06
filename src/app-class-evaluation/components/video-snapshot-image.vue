<template>
  <view
    class="u-relative u-flex u-row-center"
    :style="`width: ${width}rpx; height: ${height}rpx; background: ${
      loading ? '#f3f4f6	' : 'transparent'
    }`"
    @click="emit('click')"
  >
    <u-loading v-if="loading"></u-loading>
    <view v-else>
      <u-image
        v-if="fileUrl || posterUrl"
        :src="fileUrl || posterUrl"
        :width="width"
        :height="height"
        :border-radius="borderRadius"
        mode="aspectFill"
      >
        <template v-slot:loading>
          <u-loading></u-loading>
        </template>
      </u-image>
      <view
        class="u-absolute"
        :style="`top: ${(height - 64) / 2}rpx; left: ${(width - 64) / 2}rpx`"
      >
        <u-image :src="PlayIcon" width="64" height="64" :show-loading="false"> </u-image>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, withDefaults } from 'vue';
import { fetchVideoSnapshot } from '../services/evaluation';
import PlayIcon from '../static/play.svg';

interface Props {
  fileUrl?: string;
  fileId: string;
  width?: number;
  height?: number;
  borderRadius?: number;
}

const props = withDefaults(defineProps<Props>(), { width: 160, height: 160, borderRadius: 16 });

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const posterUrl = ref<string>();
const loading = ref(true);

const fetchSnapshot = async _fileId => {
  if (props.fileUrl) {
    loading.value = false;
    return;
  }
  loading.value = true;
  fetchVideoSnapshot({ fileId: _fileId })
    .then((snapshotFileId: any) => {
      posterUrl.value = snapshotFileId;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

watch(
  () => props.fileId,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      fetchSnapshot(newVal);
    }
  },
  { immediate: true },
);
</script>
