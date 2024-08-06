<template>
  <span v-if="status == 0" style="color: #ff4d4f">[拒绝]</span>
  <span v-if="status == 1" style="color: #52c41a">[同意] </span>
  <span v-else-if="status == 2" style="color: #52c41a">[提交]</span>
  <span v-else-if="status == 3" style="color: #ff4d4f">[撤回]</span>
  <span v-else-if="status == 4" style="color: #ff4d4f">[终止]</span>
  <span v-else-if="status == 5" style="color: #ff4d4f">[指派]</span>
  <span v-else-if="status == 6" style="color: #ff4d4f">[加签]</span>
  <span v-else-if="status == 7" style="color: #ff4d4f">[转办]</span>
  <span v-else-if="status == 8" style="color: #ff4d4f">[变更]</span>
  <span v-else-if="status == 9" style="color: #ff4d4f">[复活]</span>
  <span v-else-if="status == 10" style="color: #ff4d4f">[前加签]</span>
  <span v-else-if="status == 11" style="color: #ff4d4f">[挂起]</span>
  <span v-else-if="status == 12" style="color: #ff4d4f">[恢复]</span>
  <span v-else-if="status == 100" style="color: #ff4d4f">[结束]</span>
  <span v-else-if="status == -1" style="color: #ff4d4f">[节点撤回]</span>
  <span v-else-if="status == -2" style="color: #ff4d4f">[当前正在处理]</span>
</template>

<script setup lang="ts">
interface State {
  dataForm: any;
}

const props = defineProps({
  // 操作类型 0拒绝 1同意 2提交 3撤回 4终止 5指派 6加签 7转办 8变更 9复活 10前加签 11挂起 12恢复 100结束 -1节点撤回 -2当前正在处理
  status: {
    type: Number,
  },
  // 是否已读，0=未读，1=已读
  // readState: {
  //   type: Number,
  // },
});

// const state = reactive<State>({
//   dataForm: {},
// });

// watch(
//   () => props.data,
//   () => {
//     if (props.data) {
//       state.dataForm = props.data;
//     }
//   },
//   { immediate: true },
// );
</script>
