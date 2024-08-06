<script setup lang="ts">
import { ref } from 'vue';
import GradeItem from './grade-item.vue';
import GradeList from './grade-list.vue';
import { IGradeItem } from './utils';

defineProps<{
  list: IGradeItem[];
  selected: IGradeItem[];
  multiple: boolean;
  isClass?: boolean;
}>();

const closeId = ref({});

const emit = defineEmits<{
  (e: 'selected', checked: boolean, data: IGradeItem): void;
}>();

const onSelected = (checked: boolean, data: IGradeItem) => {
  emit('selected', checked, data);
};

const onMore = (data: any) => {
  closeId.value[data.id] = !closeId.value[data.id];
};
</script>

<template>
  <template v-for="item in list" :key="item.id">
    <grade-item
      :data="item"
      :is-more="item.children && item.children.length > 0"
      :is-more-close="closeId[item.id]"
      :selected="selected.findIndex(i => i.id === item.id) >= 0"
      :multiple="multiple"
      :is-class="isClass"
      @selected="onSelected"
      @more="onMore"
    ></grade-item>
    <view
      v-if="item.children && item.children.length > 0"
      class="grade-list"
      :style="{ display: closeId[item.id] ? 'none' : 'block' }"
    >
      <grade-list
        :list="item.children"
        :selected="selected"
        :multiple="multiple"
        :is-class="isClass"
        @selected="onSelected"
      ></grade-list>
    </view>
  </template>
</template>

<style lang="scss" scoped>
.grade-list {
  padding-left: 80rpx;
}
</style>
