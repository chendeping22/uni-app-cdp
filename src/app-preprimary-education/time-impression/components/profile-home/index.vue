<template>
  <view :class="[className, 'top-area']" v-if="curClazz.title">
    <view class="flex-inline" @click="showPicker = true">
      <text class="font-xt ml-l mr-s bold">{{ curClazz.title || '/' }}</text>
      <c-image :src="iconJiantouBlue" width="32" height="32" />
    </view>
  </view>
  <view class="plr-l ptb-s flex-between button-area">
    <view class="button-camera" :style="{ width: '48%' }" @click="cameraEvent">
      <u-image :src="iconTakePhoto" width="58" height="58" />
      <text class="plr-b button-camera-text">立即拍摄</text>
    </view>
    <view class="button-picture" :style="{ width: '48%' }" @click="pictureEvent">
      <u-image :src="iconChoosePicture" width="58" height="58" />
      <text class="plr-b button-picture-text">本地选择</text>
    </view>
  </view>
  <ClazzPicker
    v-model:show="showPicker"
    v-model:value="curSelectClazz"
    @onLoadPicker="handleLoadPicker"
  />
</template>

<script lang="ts" setup>
import { ref, toRefs, watchEffect } from 'vue';
import iconChoosePicture from '../../../static/image/icon_choose_picture.png';
import iconTakePhoto from '../../../static/image/icon_take_photo.png';
import iconJiantouBlue from '../../../static/image/jiantou_blue_icon.png';
import { showInfo } from '../../../utils/tools';
import { useTimeImpression } from '../../utils/use-time-impression';
import ClazzPicker, { IPicker } from '../clazz-picker/index.vue';
interface IProps {
  className?: string | string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  className: '',
});

const emits = defineEmits(['onLoadClazz', 'openCameraEvent', 'openPictureEvent']);

const store = useTimeImpression();

const showPicker = ref(false);
const { students } = toRefs(store.homePage);
const { curClazz } = toRefs(store);
const curSelectClazz = ref([] as { value: any; label?: string }[]);

/** 初始化默认班级 */
const handleLoadPicker = async (data: IPicker[]) => {
  if (!data.length) {
    showInfo('暂无可查看班级');
    // await delay(2000);
    // uni.navigateBack();
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
.top-area {
  display: flex;
  text-align: center;
  width: 100%;
  height: 252rpx;
  justify-content: center;
  align-items: flex-end;
  background: url(../../../static/image/background.png) no-repeat;
  background-size: 100% 100%;
}
.button-camera {
  display: flex;
  height: 76rpx;
  background: url(../../../static/image/background_camera.png) no-repeat;
  background-size: 100% 100%;
  align-items: center;
  justify-content: center;
  &-text {
    color: $ui-color-warnning-light-1;
    font-weight: bold;
    font-size: $ui-font-size-xt;
  }
}
.button-picture {
  display: flex;
  height: 76rpx;
  background: url(../../../static/image/background_picture.png) no-repeat;
  background-size: 100% 100%;
  align-items: center;
  justify-content: center;
  &-text {
    color: $ui-color-success;
    font-weight: bold;
    font-size: $ui-font-size-xt;
  }
}
</style>
