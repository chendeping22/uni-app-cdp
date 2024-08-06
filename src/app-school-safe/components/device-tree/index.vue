<template>
  <view class="flex-row bg-white">
    <view class="search-wrapper radius-xl plr-xs ptb-b mb-b">
      <u-search v-model="keyword" placeholder="搜索设备" :show-action="false" height="80" />
    </view>
    <view v-if="filteredKeyWordTreeList?.length" class="flex-grow tree-container">
      <tree-node
        v-for="item in filteredKeyWordTreeList"
        :id="item.id"
        :key="item.id"
        :name="item.name"
        :status="item.status"
        :type="item.type"
        :children="item.children"
        :offline-icon="item.icon || offlineIcon"
        :online-icon="item.icon || onlineIcon"
      />
    </view>
    <view v-else style="padding-top: 320rpx">
      <u-empty-custom content="暂无数据" mode="list" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { filterTree } from '@/app-school-safe/utils';
import { cloneDeep, isEmpty } from '@/utils/lodash-es';
import { computed, ref, toRefs } from 'vue';
import TreeNode from './tree-node.vue';

export interface IDeviceNodeType {
  id: string;
  name: string;
  status: 0 | 1; // 节点状态 0-离线 1-在线
  type: string; // 节点类型
  icon?: any; // 节点图标
  children?: IDeviceNodeType[]; // 叶子节点
}

interface IProps {
  nodes: IDeviceNodeType[];
  onlineIcon: string;
  offlineIcon: string;
}

const props = withDefaults(defineProps<IProps>(), {});
const { nodes } = toRefs(props);

const keyword = ref('');

const filteredKeyWordTreeList = computed(() => {
  if (isEmpty(keyword.value)) return nodes.value;
  const searchValue = keyword.value.trim().toLowerCase();
  return filterTree(cloneDeep(nodes.value), node => node.name.toLowerCase().includes(searchValue));
});
</script>
<style lang="scss" scoped>
.search-wrapper {
  box-shadow: 0px 0px 20rpx 0px rgba(24, 25, 68, 0.05);
}

.tree-container {
  height: calc(100vh - 180rpx);
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
