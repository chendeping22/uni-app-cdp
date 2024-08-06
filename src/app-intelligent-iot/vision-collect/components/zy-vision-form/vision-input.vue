<template>
  <input
    v-if="isDigit"
    :value="modelValue"
    maxlength="6"
    :disabled="disabled"
    type="digit"
    :class="['input-style', { 'input-disabled': disabled }]"
    @input="inputHandle"
  />
  <input
    v-else
    :value="modelValue"
    maxlength="6"
    :disabled="disabled"
    :class="['input-style', { 'input-disabled': disabled }]"
    @input="inputHandle"
  />
</template>
<script setup>
import { computed } from 'vue';
const props = defineProps({
  modelValue: {
    type: String,
  },
  disabled: {
    type: Boolean,
  },
  autoDot: {
    type: Boolean,
  },
  type: {
    type: String,
  },
});

// IOS 上 type 使用绑定值无效，只能直接接受直接字符串赋值
// 改用 v-if/v-else 指令兼容
const isDigit = computed(() => props.type === 'digit');

const emit = defineEmits(['update:modelValue']);

const inputHandle = event => {
  let inputValue = event.target.value || event.detail.value;
  if (props.autoDot && /^\d{2}$/.test(inputValue)) {
    inputValue = inputValue.split('').join('.');
  }
  emit('update:modelValue', inputValue);
};
</script>
<style lang="scss" scoped>
.input-disabled {
  background: $zy-middle-color7;
  border: none;
}
</style>
