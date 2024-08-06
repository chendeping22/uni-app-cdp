<template>
  <view class="container bg-white">
    <view class="search-wrapper">
      <c-search
        v-model:value="keyword"
        bg-type="fill-deep"
        placeholder="搜索设备"
        height="80rpx"
        radius-type="xl"
      />
    </view>
    <view v-if="filteredKeyWordTreeList.length" class="ipc-tree">
      <ipc-tree
        v-for="(item, index) of filteredKeyWordTreeList"
        :id="item.uuid"
        :key="index"
        :nodes="item.children"
        :label="item.name"
        :depth="0"
        :type="item.type"
        :count="item.deviceCount"
        :status="item.status"
      ></ipc-tree>
    </view>
    <c-empty v-else content="暂无数据" />
  </view>
</template>
<script lang="ts" setup>
import { IIpcNodeType, fetchIpcList } from '@/app-school-safe/services/monitoring';
import { loginStore } from '@/store/modules/login';
import { cloneDeep } from '@/utils/lodash-es';
import { makeStorageKey } from '@/utils/storage-keys';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import IpcTree from './components/ipc-tree/index.vue';

const keyword = ref('');
const ipcList = ref<IIpcNodeType[]>([]);

const ipcTreeSearch = (data: IIpcNodeType[], v: string) => {
  const searchValue = v.trim().toLowerCase();
  return data.filter((item: IIpcNodeType) => {
    const { children, name } = item;

    if (name.toLowerCase().lastIndexOf(searchValue) > -1) {
      return item;
    }

    if (children && children.length) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = ipcTreeSearch(children, searchValue);
      if (res && res.length > 0) {
        item.children = res;
        return item;
      }
    }
  });
};

// 将树结构摊平为普通数组
const treeToArray = (data: TreeNodeType[]) => {
  return data.reduce((res, item) => {
    const { children, ...i } = item;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return res.concat(i, children && children.length ? treeToArray(children) : []);
  }, []);
};

const calcDeviceCount = (data: IIpcNodeType[]) => {
  return data.map((item: IIpcNodeType) => {
    if (item.type === 'SPACE' && item.children && item.children.length > 0) {
      const count = treeToArray(item.children || []).filter(
        (v: IIpcNodeType) => v.type !== 'SPACE',
      ).length;
      return {
        ...item,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        children: calcDeviceCount(item.children),
        deviceCount: count,
      };
    } else {
      return item;
    }
  });
};

const filteredKeyWordTreeList = computed(() => {
  if (!keyword.value?.trim().length) return ipcList.value;
  const filterKeyWordData = ipcTreeSearch(cloneDeep(ipcList.value), keyword.value);
  return calcDeviceCount(filterKeyWordData);
});

// 过滤接口中返回的space下没有ipc的数据
const filterIpcTree = function (data: TreeNodeType[]) {
  return data.filter((item: TreeNodeType) => {
    const { type, deviceCount } = item;
    const { children } = item;
    if (type === 'SPACE' && deviceCount === 0) return;
    if (children && children.length) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const res = filterIpcTree(children);
      if (res && res.length > 0) {
        item.children = res;
        return item;
      }
    } else {
      return item;
    }
  });
};

onBeforeMount(async () => {
  uni.$on('onClickIPC', (uuid: string) => {
    const userInfo = loginStore().userInfo;
    if (userInfo) uni.setStorageSync(makeStorageKey(`${userInfo.locationId}_ipcUuid`), uuid);
    uni.navigateBack();
  });
  const res = await fetchIpcList();
  ipcList.value = filterIpcTree(res);
});

onBeforeUnmount(() => {
  uni.$off('onClickIPC');
});
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
  overflow: auto;
}
.search-wrapper {
  position: relative;
  padding: $ui-gap-default $ui-gap-xs;
  margin-bottom: $ui-gap-default;
  box-shadow: 0px 0px 20rpx 0px rgba(24, 25, 68, 0.05);
  border-radius: $ui-radius-xl;
}
.ipc-tree {
  padding: 0 $ui-gap-large;
}
</style>
