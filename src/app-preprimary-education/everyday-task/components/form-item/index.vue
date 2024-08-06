<template>
  <view :class="['flex-between h-88', className]">
    <view class="flex-inline no-shrink mr-b">
      <slot name="left">
        <text v-if="required" class="font-xt color-error">*</text>
        <text :class="`font-${titleSize} color-base ${titleBold ? 'bold' : ''}`">{{ title }}</text>
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
        <text v-else class="color-secondary text-ellipse">{{ value }}</text>
        <view v-if="showClear" class="flex-inline" @click.stop="$emit('onClear')">
          <c-icon
            name="icon_close"
            size="24"
            color-type="white"
            class-name="icon-32 bg-fill-dark radius-round ml-s"
          />
        </view>
        <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
      </view>
      <view v-else-if="valueType === 'input'">
        <c-input
          v-model:value="inputValue"
          padding-clz="pl-l"
          :placeholder="placeholder"
          align="right"
          :type="inputType"
          :maxlength="inputMaxLength"
          @input="handleInput"
        />
      </view>
    </view>
    <slot name="right"> </slot>
  </view>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, watchEffect } from 'vue';
export default defineComponent({
  props: {
    className: { type: String, default: '' },
    title: { type: String, default: '' },
    titleSize: { type: String as PropType<IFontSize>, default: 'title' },
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
  },
  emits: ['onClick', 'update:value', 'onClear'],
  setup(props, ctx) {
    const inputValue = ref('');
    watchEffect(() => {
      inputValue.value = props.value;
    });
    const handleInput = (val: any) => {
      ctx.emit('update:value', val);
    };

    return { inputValue, handleInput };
  },
});
</script>
<style scoped lang="scss"></style>
