<template>
  <view
    v-if="childrenCount || isDeviceNode"
    :class="`flex-between mlr-l mtb-l ${isDeviceNode ? 'pl-l' : ''}`"
    @click="itemClick"
  >
    <image v-if="isDeviceNode" :src="isOnline ? onlineIcon : offlineIcon" class="icon-48" />
    <view class="font-title color-base flex-grow ellipsis">{{ name }}</view>
    <view v-if="!isDeviceNode" class="no-shrink flex">
      <view class="font-title color-placeholder mr-xs">{{ childrenCount }}</view>
      <u-icon
        :name="showChildren ? 'arrow-down' : 'arrow-right'"
        class="color-placeholder"
        size="32"
      />
    </view>
  </view>
  <template v-if="children?.length && showChildren">
    <tree-node
      v-for="item in children"
      :id="item.id"
      :key="item.id"
      :name="item.name"
      :status="item.status"
      :type="item.type"
      :children="item.children"
      :offline-icon="item.icon || offlineIcon"
      :online-icon="item.icon || onlineIcon"
    />
  </template>
</template>

<script lang="ts">
import { flatTree } from '@/app-school-safe/utils';
import { cloneDeep } from '@/utils/lodash-es';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TreeNode',
  props: {
    id: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    status: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: 'SPACE',
    },
    children: {
      type: Array<any>,
      default: () => [],
    },
    onlineIcon: {
      type: String,
      default: '',
    },
    offlineIcon: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const showChildren = ref(true);
    const isDeviceNode = computed(() => {
      return props.type !== 'SPACE';
    });

    const isOnline = computed(() => {
      return Boolean(props.status);
    });

    const itemClick = () => {
      if (!isDeviceNode.value) showChildren.value = !showChildren.value;
      else {
        uni.$emit('deviceTreeSelected', {
          id: props.id,
          type: props.type,
        });
        uni.navigateBack();
      }
    };

    const childrenCount = computed(() => {
      return flatTree(cloneDeep(props.children)).filter(node => node.type !== 'SPACE').length;
    });

    return {
      isDeviceNode,
      isOnline,
      showChildren,
      childrenCount,
      itemClick,
    };
  },
});
</script>
<style lang="scss" scoped />
