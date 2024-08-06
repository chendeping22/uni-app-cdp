<template>
  <device-tree
    class="container"
    :nodes="treeData || []"
    :online-icon="icon_bullying_on"
    :offline-icon="icon_bullying_off"
  />
</template>

<script lang="ts" setup>
import DeviceTree, { IDeviceNodeType } from '@/app-school-safe/components/device-tree/index.vue';
import { fetchBullyingList } from '@/app-school-safe/services/ai-prevent-bullying';
import icon_bullying_off from '@/app-school-safe/static/svg/icon_bullying_off.svg';
import icon_bullying_on from '@/app-school-safe/static/svg/icon_bullying_on.svg';
import { traverseTree } from '@/app-school-safe/utils';
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';

const treeData = ref<IDeviceNodeType[]>();

/**
 * 扩展/合并指定节点数据
 * @param extendData
 */
const assignNodeData = (extendNodeData: any) => {
  if (!treeData.value?.length) return;
  treeData.value = traverseTree(treeData.value, node => {
    return node.id === extendNodeData.id
      ? {
          ...node,
          ...extendNodeData,
        }
      : node;
  });
};

onBeforeMount(async () => {
  const res = await fetchBullyingList();
  treeData.value = traverseTree(res, node => {
    return {
      id: node.id,
      name: node.name,
      status: node.status,
      type: node.deviceType || 'SPACE',
      children: node.children,
    };
  });

  // 通知上游页面设备列表数据已加载完成，可触发指定节点数据更新
  uni.$emit('deviceTreeLoaded');
});

onMounted(() => {
  uni.$on('deviceCallStatusChange', assignNodeData);
});

onBeforeUnmount(() => {
  uni.$off('deviceCallStatusChange', assignNodeData);
});
</script>

<style lang="scss" scoped>
.container {
  height: calc(100vh - var(--window-top));
  overflow: hidden;
}
</style>
