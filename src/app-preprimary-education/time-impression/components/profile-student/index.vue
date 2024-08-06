<template>
  <view class="bg-white plr-l ptb-b">
    <view class="flex-between h-80 relative">
      <view class="flex-inline">
        <view class="font-xt mr-s bold">{{ student.studentName }}</view>
        <c-icon
          v-if="student.gender === 2"
          name="icon_gender_female"
          color-type="warnning"
          :size="32"
        />
        <c-icon v-else name="icon_male" color-type="primary" :size="32" />
      </view>
      <!-- @click="showOpre = !showOpre" -->
      <!-- <c-icon
        v-if="isBatchCheck === false && !isParent"
        name="icon_more"
        :size="48"
        color-type="base"
        @click="handleActionSheet"
      /> -->
      <view class="flex">
        <view class="flex" v-if="isParent">
          <u-image
            class="mr-l"
            :src="iconPunchCamera"
            :show-loading="false"
            :fade="false"
            width="46"
            height="46"
            @click="cameraEvent"
          />
          <u-image
            class="mr-l"
            :src="iconPunchPhoto"
            :show-loading="false"
            :fade="false"
            width="46"
            height="46"
            @click="pictureEvent"
          />
        </view>
        <c-button
          v-if="isBatchCheck === false && !isParent"
          height-size="button-xxs"
          type="primary"
          :is-brand-type="false"
          @click="handleBatchOpre"
        >
          <text> 批量操作 </text>
        </c-button>
        <c-button
          v-if="isBatchCheck === false && isParent"
          height-size="button-xxs"
          type="primary"
          :is-brand-type="false"
          @click="handleBatchOpre"
        >
          <text> 批量操作 </text>
        </c-button>

        <c-button
          v-if="isBatchCheck === true"
          height-size="button-xxs"
          type="primary"
          :is-brand-type="false"
          @click="handleBatchOpreCancel"
        >
          <text> 取消 </text>
        </c-button>
      </view>
    </view>
    <view class="color-secondary font-secondary">
      <text>学号:</text>
      <text class="ml-s mr-b">{{ student.studentCode ?? '/' }}</text>
      <text>照片数:</text>
      <text class="ml-s">{{ student.photoNum ?? '0' }}</text>
    </view>
  </view>

  <c-action-sheet
    v-model:show="showOpre"
    :list="[
      { text: '添加', colorType: 'base', disabled: false },
      { text: '批量操作', colorType: 'base', disabled: false },
    ]"
    @onSelect="handleActionSheet"
  />
</template>

<script lang="ts" setup>
import { onBeforeMount, ref, watch } from 'vue';
import iconPunchCamera from '../../../static/svg/icon_punch_camera.svg';
import iconPunchPhoto from '../../../static/svg/icon_punch_photo.svg';
import { isGuardian } from '../../utils/is';
import { ICurStudent } from '../../utils/use-time-impression';

interface IProps {
  className?: string | string[];
  student: ICurStudent;
  isBatchCheckParent: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  className: '',
  student: () => ({} as ICurStudent),
  isBatchCheckParent: false,
});
const emits = defineEmits(['onBatchCheck', 'onAddSource', 'openCameraEvent', 'openPictureEvent']);
const showOpre = ref(false);
const isBatchCheck = ref(false);
const isParent = ref(false);

const handleBatchOpre = () => {
  showOpre.value = false;
  isBatchCheck.value = true;
  emits('onBatchCheck', true);
};
const handleBatchOpreCancel = () => {
  showOpre.value = false;
  isBatchCheck.value = false;
  emits('onBatchCheck', false);
};
const cameraEvent = () => {
  emits('openCameraEvent');
};
const pictureEvent = () => {
  emits('openPictureEvent');
};

watch(
  () => props.isBatchCheckParent,
  val => {
    if (val === false && isBatchCheck.value) {
      isBatchCheck.value = false;
    }
  },
);

const handleActionSheet = () => {
  // showOpre.value = false;
  // if (inx === 0) {
  //   emits('onAddSource');
  // } else if (inx === 1) {
  //   handleBatchOpre();
  // }
  handleBatchOpre();
};
onBeforeMount(() => {
  if (isGuardian()) {
    isParent.value = true;
  } else {
    isParent.value = false;
  }
});
</script>
