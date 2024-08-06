<template>
  <view>
    <view
      :class="[className]"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <view class="flex-inline no-shrink mr-b">
        <u-icon
          v-if="showDel"
          name="minus-circle-fill"
          size="48"
          color="#FF4D4F"
          style="margin-right: 24rpx"
          @click="handleDel"
        />
        <slot name="left">
          <text class="title-text">{{ title }}</text>
          <text v-if="required" class="font-xt color-error">*</text>
        </slot>
      </view>
      <view v-if="!$slots.right" class="flex-inline text-ellipse">
        <view v-if="valueType === 'text'" class="text-ellipse">
          <text class="font-title color-secondary text-ellipse">{{ value || nullText }}</text>
        </view>
        <view
          v-else-if="valueType === 'select'"
          class="flex-inline font-title text-ellipse"
          @click="$emit('onClick')"
        >
          <text v-if="value.length === 0" class="color-placeholder">请选择</text>
          <text v-else class="font-title color-secondary text-ellipse">{{ value }}</text>
          <view v-if="showClear" class="flex-inline" @click.stop="$emit('onClear')">
            <u-icon name="close-circle-fill" size="24" color="#ffffff" />
          </view>
          <u-icon
            name="arrow-right"
            color="#00000073"
            size="28"
            style="margin-top: 6rpx; margin-left: 8rpx"
          />
        </view>
        <view v-else-if="valueType === 'input'">
          <u-input
            v-model="inputValue"
            :placeholder="placeholder"
            input-align="right"
            :type="inputType"
            :maxlength="inputMaxLength"
            :custom-style="{
              fontSize: '34rpx',
              fontWeight: '400',
            }"
            :placeholder-style="{ color: '#00000073' }"
          />
        </view>
      </view>
      <slot name="right"> </slot>
    </view>
    <view v-if="needLine" class="line" />
  </view>
</template>
<script lang="ts" setup>
import { PropType, ref, watch, watchEffect } from 'vue';
const props = defineProps({
  className: { type: String, default: '' },
  title: { type: String, default: '' },
  titleBold: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: String,
    default: '请输入',
  },
  value: { type: String, default: '' },
  valueType: {
    type: String as PropType<'text' | 'select' | 'input' | 'none'>,
    default: 'select',
  },
  inputMaxLength: {
    type: Number,
    default: 999,
  },
  inputType: {
    type: String,
    default: 'text',
  },
  /** 给非input类型使用的 */
  showClear: {
    type: Boolean,
    default: false,
  },
  nullText: {
    type: String,
    default: '/',
  },
  needLine: {
    type: Boolean,
    default: false,
  },
  /** 给非input类型使用的 */
  showDel: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['onClick', 'update', 'onClear', 'del']);
const inputValue = ref('');
watchEffect(() => {
  inputValue.value = props.value;
});
watch(
  () => inputValue.value,
  newValue => {
    emits('update', newValue);
  },
);
const handleDel = () => {
  emits('del');
};
</script>
<style scoped lang="scss">
.flex-inline {
  display: inline-flex;
  align-items: center;
}
.no-shrink {
  /** 不能压缩 */
  flex-shrink: 0;
}
.mr-b {
  margin-right: 24rpx;
}
.font-xt {
  font-size: 34rpx;
}
.color-error {
  color: #ff4d4f;
}
.title-text {
  color: var(--global-text-icons-color-text-heading, rgba(0, 0, 0, 0.88));
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48px; /* 141.176% */
  margin-right: 8rpx;
}
.text-ellipse {
  text-overflow: ellipsis;
  word-break: break-all;
  overflow: hidden;
  white-space: nowrap;
}
.font-title {
  font-size: 34rpx;
}
.color-secondary {
  color: #000000e0;
}
.color-placeholder {
  color: #00000073;
  font-size: 34rpx;
}
.line {
  width: 100%;
  height: 1rpx;
  flex-shrink: 0;
  border-radius: var(--radius-radius-none, 0);
  background: var(--global-basic-color-split, #0000000f);
}
</style>
