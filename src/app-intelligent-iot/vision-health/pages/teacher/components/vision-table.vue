<template>
  <view class="item-card" style="padding: 0 30rpx">
    <uni-table
      ref="table"
      :stripe="false"
      stripe
      empty-text="暂无更多数据"
      @selection-change="selectionChange"
    >
      <!-- 表头行 -->
      <uni-tr>
        <uni-th
          v-for="(item, index) in tableConfig"
          :key="index"
          :width="item.width || ''"
          :align="item.align || 'center'"
        >
          {{ item.title }}
        </uni-th>
        <uni-th v-if="showArrow" width="70rpx" align="center"></uni-th>
      </uni-tr>
      <!-- 表格数据行 -->
      <uni-tr v-for="(item, index) in tableData" :key="index" @tap="rowClick(item)">
        <uni-td
          v-for="(config, configIndex) in tableConfig"
          :key="configIndex"
          :align="config.align || 'center'"
        >
          <view v-if="config.type == 'index'" class="">
            <image
              v-if="index == 0"
              class="table-index-icon"
              src="@/app-intelligent-iot/static/image/rank_first.png"
              mode="widthFix"
            ></image>
            <image
              v-else-if="index == 1"
              class="table-index-icon"
              src="@/app-intelligent-iot/static/image/rank_second.png"
              mode="widthFix"
            >
            </image>
            <image
              v-else-if="index == 2"
              class="table-index-icon"
              src="@/app-intelligent-iot/static/image/rank_third.png"
              mode="widthFix"
            >
            </image>
            <text v-else>{{ index < 9 ? '0' + (index + 1) : index + 1 }}</text>
          </view>
          <view v-else class="table-text" :style="{ 'max-width': config.width }">
            {{ item[config.key] }}
          </view>
        </uni-td>
        <uni-td v-if="showArrow" align="center">
          <zy-icons type="arrow_right" :size="48" color="#86909C"></zy-icons>
        </uni-td>
      </uni-tr>
    </uni-table>
  </view>
</template>

<script setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const props = defineProps({
  tableData: {
    type: Object,
    default: () => [],
  },
  tableConfig: {
    type: Object,
    default: () => [],
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(['rowClick']);
// 行点击
const rowClick = data => {
  emits('rowClick', data);
};
</script>

<style lang="scss">
.table-index-icon {
  width: 46rpx;
  height: 52rpx;
  vertical-align: middle;
}

.table-text {
  max-width: 160rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
