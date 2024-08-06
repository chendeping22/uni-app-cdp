<template>
  <view>
    <u-card title="选择资产" @click="handleSelect">
      <template #body>
        <view> data: {{ state.data }} </view>
      </template>
    </u-card>
    <view style="margin: 12px 0" @click="handleSelect2">选择资产不回显</view>
    <asset-list :list="state.data2"></asset-list>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import AssetList from '../../components/AssetList.vue';
import showSelector from './show-selector';

const state = reactive<any>({
  data: [],
  data2: [],
});

const handleSelect = () => {
  showSelector({
    value: state.data,
    callback: data => {
      state.data = data;
      console.log(data);
    },
  });
};

const handleSelect2 = () => {
  showSelector({
    // value: state.data,
    excludeIds: state.data2.map((i: any) => i.id),
    callback: data => {
      state.data2 = data;
      console.log(data);
    },
  });
};
</script>
