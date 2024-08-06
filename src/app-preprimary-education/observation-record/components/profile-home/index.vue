<template>
  <view :class="[className, 'plr-l ptb-s bg-white flex-between ']">
    <view>
      <view class="flex-inline" @click="showPicker = true">
        <text class="font-xt mr-s bold">{{ curClazz.title || '/' }}</text>
        <c-icon name="icon_arrow_down" :size="48" color-type="placeholder" />
      </view>
    </view>
    <view class="flex">
      <view class="mt-xxs flex color-secondary font-secondary">
        <text>学生数:</text>
        <text class="ml-xs">{{ students.length }}</text>
      </view>
    </view>
  </view>
  <view class="plr-l ptb-s flex-between">
    <view class="button-camera" :style="{ width: '48%' }" @click="cameraEvent">
      <text class="mr-l button-camera-text">拍照记录</text>
    </view>
    <view class="button-picture" :style="{ width: '48%' }" @click="pictureEvent">
      <text class="mr-l button-picture-text">本地选择</text>
    </view>
  </view>
  <view class="draft-button" @click="draftEvent">
    <c-image :src="iconDraft" width="80" height="80" />
    <text>草稿箱</text>
  </view>
  <ClazzPicker
    v-model:show="showPicker"
    v-model:value="curSelectClazz"
    @onLoadPicker="handleLoadPicker"
  />
</template>

<script lang="ts" setup>
import ClazzPicker, {
  IPicker,
} from '@/app-preprimary-education/observation-record/components/clazz-picker/index.vue';
import { useTimeImpression } from '@/app-preprimary-education/observation-record/utils/use-time-impression';
import { delay, showInfo } from '@/utils/tools';
import { ref, toRefs, watchEffect } from 'vue';
import iconDraft from '../../../static/image/draft_btn.png';

interface IProps {
  className?: string | string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  className: '',
});

const emits = defineEmits(['onLoadClazz', 'openCameraEvent', 'openPictureEvent', 'openDraftEvent']);

const store = useTimeImpression();

const showPicker = ref(false);
const { students } = toRefs(store.homePage);
const { curClazz } = toRefs(store);
const curSelectClazz = ref([] as { value: any; label?: string }[]);

/** 初始化默认班级 */
const handleLoadPicker = async (data: IPicker[]) => {
  if (!data.length) {
    showInfo('暂无可查看班级');
    await delay(2000);
    uni.navigateBack();
    return;
  }
  const col_1 = data[0];
  const col_2 = col_1.children[0];
  const col_3 = col_2.children[0];
  curSelectClazz.value = [
    { value: col_1.value, label: col_1.label },
    { value: col_2.value, label: col_2.label },
    { value: col_3.value, label: col_3.label },
  ];
};

const cameraEvent = () => {
  emits('openCameraEvent');
};
const draftEvent = () => {
  emits('openDraftEvent');
};
const pictureEvent = () => {
  emits('openPictureEvent');
};

/** 设置当前选中班级对象 */
watchEffect(() => {
  if (curSelectClazz.value.length > 0) {
    curClazz.value = {
      title: curSelectClazz.value[2].label || '',
      clazzId: curSelectClazz.value[2].value || '',
    };
    emits('onLoadClazz');
  }
});
</script>
<style lang="scss" scoped>
.button-camera {
  display: flex;
  height: 80rpx;
  background: url(../../../static/image/take_photo_btn.png) no-repeat;
  background-size: 100% 100%;
  align-items: center;
  justify-content: right;
  &-text {
    color: $ui-color-error-light-1;
    font-weight: bold;
    font-size: $ui-font-size-xt;
    width: 100%;
    text-align: end;
  }
}
.button-picture {
  display: flex;
  height: 80rpx;
  background: url(../../../static/image/select_btn.png) no-repeat;
  background-size: 100% 100%;
  align-items: center;
  justify-content: right;
  &-text {
    color: $ui-color-warnning-light-1;
    font-weight: bold;
    font-size: $ui-font-size-xt;
    width: 100%;
    text-align: end;
  }
}
.draft-button {
  position: fixed;
  z-index: 999;
  bottom: 380rpx;
  right: 12rpx;
  background: $ui-color-success-light-3;
  color: $ui-color-success-light-1;
  padding: 6rpx 22rpx 6rpx 22rpx;
  border-radius: $uni-border-radius-lg;
  box-shadow: 0rpx 0rpx 20rpx 6rpx rgba(24, 25, 68, 0.15);
}
</style>
