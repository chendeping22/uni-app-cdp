<template>
  <uni-list class="list-content">
    <uni-list-item
      title="发布对象"
      :right-text="`${num > totalNum ? totalNum : num}/${totalNum || 0}`"
      show-arrow
      :border="false"
      clickable
      @click="link"
    ></uni-list-item>
  </uni-list>
</template>
<script lang="ts">
import uniListItem from '@/app-preprimary-education/components/uni-list-item/uni-list-item.vue';
import uniList from '@/app-preprimary-education/components/uni-list/uni-list.vue';
import { PropType, computed, defineComponent, onMounted } from 'vue';
export default defineComponent({
  components: { uniListItem, uniList },
  props: {
    title: { type: String, default: '' },
    value: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
  },
  emits: [],
  setup(props) {
    const num = computed(() => {
      if (!props.value.clazzs?.length) return 0;
      return (
        props.value.clazzs
          .map(v => v.studentIds?.length)
          .reduce((pre = 0, current) => pre + current, 0) || 0
      );
    });
    const totalNum = computed(() => props.value.classTotal);
    const link = () => {
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/components/class-list/index?id=${
          props.value.id || ''
        }`,
      });
    };
    onMounted(() => {});
    return { link, num, totalNum };
  },
});
</script>
<style scoped lang="scss">
@import '../../index.scss';
</style>
