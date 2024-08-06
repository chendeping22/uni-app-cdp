<template>
  <view class="file-card-wrapper">
    <view class="card-img">
      <image class="image" :src="defaultAvatar[currentGender]" />
    </view>
    <view class="card-info ml-l">
      <view class="flex-inline" @click="handleClick">
        <text class="font-xt bold mr-xs">{{ student?.name }}</text>
        <c-icon
          v-if="studentList.length > 1"
          name="icon_arrow_down"
          size="48"
          color-type="placeholder"
        />
      </view>
      <view v-if="alertdatas" class="card-detail">
        <text class="color-warnning">{{ alertdatas }}</text>
      </view>
    </view>
  </view>
</template>
<script lang="ts">
import boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import dayjs from 'dayjs';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

export type studentItem = {
  id: string;
  name: string;
  gender: number;
  imageUrl: string;
};

export default defineComponent({
  props: {
    studentId: {
      type: String,
      default: '',
    },
    alertdatas: {
      type: String,
      default: '',
    },
    studentList: {
      type: Array as PropType<studentItem[]>,
      default: [] as studentItem[],
    },
    status: {
      type: Number,
      default: 0,
    },
    time: {
      type: Number,
      default: 0,
    },
  },
  emits: ['showSelectPopup'],
  setup(props, ctx) {
    const defaultAvatar: any = {
      1: boy,
      2: girl,
    };
    const currentGender = ref();
    const student = computed(() => {
      return props.studentList?.find(i => `${i.id}` === `${props.studentId}`);
    });
    const studentSelectList = computed(() => {
      return props.studentList?.map(i => ({ label: i.name, value: i.id }));
    });
    watch(
      () => props.studentId,
      val => {
        props.studentList.map(item => {
          if (item.id == val) {
            currentGender.value = item.gender;
          }
        });
      },
    );
    const handleClick = () => {
      if (props.studentList.length < 2) return;
      ctx.emit('showSelectPopup');
    };

    return {
      student,
      studentSelectList,
      handleClick,
      defaultAvatar,
      currentGender,
      boy,
      girl,
      dayjs,
    };
  },
});
</script>
<style lang="scss" scoped>
.file-card-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  box-sizing: border-box;
  background-color: $ui-color-white;
  padding: $ui-gap-default $ui-gap-large;
  .card-img {
    box-sizing: border-box;
    border-radius: 50%;

    .image {
      width: 112rpx;
      height: 112rpx;
    }
  }
  .card-info {
    flex-grow: 1;

    .card-title {
      display: flex-inline;
      align-items: center;
      font-size: $ui-font-size-xxt;
      color: $ui-color-font-base;
      font-weight: $ui-font-weight-bold;
      // margin-bottom: $ui-gap-default;
    }
    .card-detail {
      font-size: $ui-font-size-secondary;
      color: $ui-color-font-secondary;
      text:nth-child(n + 2)::before {
        content: '';
        margin: 0 $ui-gap-default;
        width: 0;
        border-left: 1px solid #e6e8eb;
      }
    }
  }

  .card-btn {
    height: 64rpx;
    display: inline-flex;
    align-items: center;
    padding: 0 $ui-gap-large;
    border: 1rpx solid $ui-color-primary;
    border-radius: $ui-radius-xl;
    box-sizing: border-box;
    font-size: $ui-font-size-content;
    color: $ui-color-primary;
    font-weight: $ui-font-weight-normal;
    &.gray {
      border-color: $uni-border-color;
      background-color: $uni-border-color;
      color: $ui-color-font-base;
    }
    &.green {
      border-color: $ui-color-success;
      background-color: $ui-color-success;
      color: $ui-color-white;
    }
    &.warn {
      border-color: $ui-color-warnning;
      background-color: $ui-color-warnning;
      color: $ui-color-white;
    }
  }
}
.orangeStyle {
  color: $ui-color-warnning;
}
</style>
