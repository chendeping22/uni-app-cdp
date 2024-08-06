<template>
  <view :key="Math.random() * 1000" class="w-picker" :data-key="createKey">
    <view
      class="mask"
      :class="{ visible: visible }"
      :catchtouchmove="true"
      @tap="onCancel"
      @touchmove.stop.prevent
    ></view>
    <view class="w-picker-cnt" :class="{ visible: visible }">
      <view class="w-picker-header" :catchtouchmove="true" @touchmove.stop.prevent>
        <text :style="{ color: themeColor, fontSize: '34rpx' }" @tap.stop.prevent="onCancel"
          >取消</text
        >
        <slot>{{ title }}</slot>
        <text
          :style="{ color: submitDisabled ? '#c0c0c0' : themeColor, fontSize: '34rpx' }"
          @tap.stop.prevent="pickerConfirm"
          >确定</text
        >
      </view>
      <view class="" hover-class="none" hover-stop-propagation="false">
        <imp-picker-view
          v-if="visible"
          :start-time="startDate"
          :value="value.key > 0 ? value.key - 1 : 0"
          :visible="true"
          @onChange="pickerChange"
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { ref, PropType, reactive, watch, computed, defineComponent } from 'vue';
import pickerView from '../../components/imp-picker-view/index.vue';

export default defineComponent({
  components: {
    'imp-picker-view': pickerView,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    startTime: {
      type: Number,
      default: +new Date(),
    },
    value: {
      //默认值
      type: Object as PropType<{ key: number; value: number }>,
      default: () => ({
        key: 0,
        value: +new Date(),
      }),
    },
    themeColor: {
      //确认按钮主题颜色
      type: String,
      default: '#4966F5',
    },
    timeout: {
      //是否开启点击延迟,当快速滚动 还没有滚动完毕点击关闭时得到的值是不准确的
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onCancel', 'onOk'],
  setup(props, { emit }) {
    const createKey = ref(Math.random() * 1000);
    const value = reactive<{ obj?: { key: number; value: number } }>({ obj: props.value });
    const startDate = computed(() => {
      return props.startTime;
    });

    // 不可选择过去的时间
    const submitDisabled = computed(() => {
      const date = value.obj?.value;
      return dayjs(date).isBefore(dayjs().startOf('day'));
    });

    const onCancel = () => {
      emit('onCancel');
    };
    const pickerConfirm = () => {
      if (submitDisabled.value) return showInfo('不可选择过去的时间');
      emit('onOk', value.obj);
    };
    const pickerChange = (values: { key: number; value: number }) => {
      value.obj = { ...values, key: values.key + 1 };
    };

    watch(
      () => props.visible,
      () => {
        value.obj = props.value;
        createKey.value = Math.random() * 1000;
      },
    );

    return {
      createKey,
      onCancel,
      pickerConfirm,
      pickerChange,
      startDate,
      submitDisabled,
    };
  },
});
</script>

<style lang="scss">
.w-picker-item {
  text-align: center;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: $ui-font-size-title;
}
.w-picker {
  z-index: 888;
  .mask {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba($ui-color-black, 0.6);
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s ease;
  }
  .mask.visible {
    visibility: visible;
    opacity: 1;
  }
  .w-picker-cnt {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    transition: all 0.3s ease;
    transform: translateY(100%);
    z-index: 3000;
    background-color: $ui-color-white;
    border-top-left-radius: $ui-radius-xl;
    border-top-right-radius: $ui-radius-xl;
    overflow: hidden;
  }
  .w-picker-cnt.visible {
    transform: translateY(0);
  }
  .w-picker-header {
    display: flex;
    align-items: center;
    padding: 0 $ui-gap-large;
    height: 104rpx;
    background-color: $ui-color-white;
    position: relative;
    text-align: center;
    font-family: PingFangSC-Medium;
    font-size: $ui-font-size-xt;
    justify-content: space-between;
    border-bottom: solid 1px #eee;
    .w-picker-btn {
      font-size: $ui-font-size-title;
    }
  }

  .w-picker-hd:after {
    content: ' ';
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 1px;
    border-bottom: 1px solid $ui-color-line-default;
    color: $ui-color-line-default;
    transform-origin: 0 100%;
    transform: scaleY(0.5);
  }
}
</style>
