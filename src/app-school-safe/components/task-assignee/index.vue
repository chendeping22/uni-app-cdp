<template>
  <view class="common-card">
    <text class="common-title">处理详情</text>
    <u-time-line>
      <u-time-line-item
        v-for="(item, idx) in taskAssigneeList"
        :key="item.nodeCode"
        :node-top="
          idx === taskAssigneeList?.length - 1 && woStatus === WoStatusCode.PENDING ? 0 : 6
        "
      >
        <template #node>
          <view
            v-if="idx === taskAssigneeList?.length - 1 && woStatus === WoStatusCode.PENDING"
            class="icon-16 radius-round bg-success"
          ></view>
          <view v-else class="icon-32 radius-round bg-success flex-center">
            <c-icon name="icon_succeed" is-custom :size="20" color-type="white" />
          </view>
        </template>
        <template #content>
          <view
            :class="{
              'last-item': idx === taskAssigneeList.length - 1,
            }"
          >
            <view class="font-title color-base mb-xs">{{ item.nodeName }}</view>
            <assignee-info
              v-for="assignee in item.assigneeList"
              :id="assignee.assignee"
              :key="assignee.assignee"
              :name="assignee.assigneeName"
              :handle-status="assignee.handleStatus"
              :comment="assignee.comment"
              :time="assignee.updateTime || assignee.createTime"
            />
          </view>
        </template>
      </u-time-line-item>
    </u-time-line>
  </view>
</template>
<script lang="ts" setup>
import { WoStatusCode } from '@/app-school-safe/constants/WoStatusEnum';
import AssigneeInfo from './assignee-info.vue';

interface IProps {
  woStatus: WoStatusCode; // 审批工单状态
  taskAssigneeList?: {
    nodeCode: string;
    nodeName: string;
    assigneeList: {
      assignee: string; // 审批者id
      assigneeName: string; // 审批者名称
      createTime: number; // 创建时间
      updateTime?: number; // 更新时间
      handleStatus: number; // 操作类型 0拒绝 1同意 2提交 3撤回 4终止 5指派 6加签 7转办 8变更 9复活 10前加签 11挂起 12恢复 100结束 -1节点撤回 -2当前正在处理
      comment?: string; // 备注说明
    }[];
  }[]; // 审批任务节点
}

withDefaults(defineProps<IProps>(), {
  taskAssigneeList: () => [],
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
.last-item:before {
  content: ' ';
  position: absolute;
  left: -40rpx;
  top: 20rpx;
  width: 1px;
  height: calc(100% + 32rpx);
  background-color: $color-bg-container;
}
</style>
