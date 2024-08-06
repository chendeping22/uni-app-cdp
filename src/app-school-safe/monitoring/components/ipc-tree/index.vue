<template>
  <view :class="{ treeMenu: true }">
    <view
      :class="{ label: true, ipc: isDevice(type), active: false }"
      @click.stop.prevent="() => toggleChildren(type, id)"
    >
      <view class="left text-ellipse">
        <image
          v-if="isDevice(type)"
          :src="status ? icon_IPC_on : icon_IPC_off"
          alt="icon"
          class="icon"
        />
        <view class="name text-ellipse">{{ label }}</view>
      </view>
      <view v-if="type === 'SPACE'" class="right">
        <text v-if="count" class="count">{{ count }}</text>
        <c-icon
          :name="showChildren ? 'icon_arrow_down' : 'icon_arrow_right'"
          size="48"
          color-type="placeholder"
        />
      </view>
    </view>
    <view v-if="showChildren">
      <ipc-tree
        v-for="(item, index) of nodes"
        :id="item.uuid"
        :key="index"
        :nodes="item.children"
        :label="item.name"
        :depth="depth + 1"
        :type="item.type"
        :count="item.deviceCount"
        :status="item.status"
      >
        ></ipc-tree
      >
    </view>
  </view>
</template>

<script lang="ts">
import { IIpcNodeType } from '@/app-school-safe/services/monitoring';
import icon_IPC_off from '@/app-school-safe/static/svg/icon_IPC_off.svg';
import icon_IPC_on from '@/app-school-safe/static/svg/icon_IPC_on.svg';
import { includes, toLower } from '@/utils/lodash-es';
import { PropType, defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IpcTree',
  props: {
    id: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    nodes: {
      type: Array as PropType<IIpcNodeType[]>,
      default: () => [],
    },
    depth: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
    status: {
      type: Number,
      default: 0,
    },
    type: {
      type: String as PropType<treeType>,
      default: 'SPACE',
    },
  },
  setup() {
    const isDevice = (type: string) => {
      return includes(toLower(type), 'ipc') || type === 'NetworkIntercom';
    };

    const showChildren = ref(true);
    const toggleChildren = (type: treeType, id: string) => {
      if (type === 'SPACE') {
        showChildren.value = !showChildren.value;
      } else {
        uni.$emit('onClickIPC', id);
      }
    };
    return { toggleChildren, showChildren, toLower, includes, isDevice };
  },
  data() {
    return {
      icon_IPC_on,
      icon_IPC_off,
    };
  },
});
</script>
<style lang="scss" scoped>
.label {
  display: flex;
  justify-content: space-between;
  height: 96rpx;
  line-height: 96rpx;
  font-family: PingFangSC-Medium;
  border-bottom: 1rpx solid #ecf2fc;
  align-items: center;
  .left {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    font-size: $ui-font-size-xt;
    color: $ui-color-base;
    .icon {
      width: 48rpx;
      height: 48rpx;
    }
    .name {
      font-size: $ui-font-size-xt;
      color: $ui-color-base;
      height: 96rpx;
      line-height: 96rpx;
    }
  }
  .right {
    position: relative;
    display: inline-flex;
    align-items: center;
    .count {
      font-size: $ui-font-size-xt;
      color: $ui-color-placeholder;
      text-align: right;
      font-weight: 400;
    }
    .arrow {
      width: 36rpx;
      height: 36rpx;
      &.down {
        transform: rotate(90deg);
      }
    }
  }
  .check-icon {
    width: 96rpx;
    height: 96rpx;
  }
  &.ipc {
    padding-left: $ui-gap-large;
  }
  &.active {
    background: rgba($ui-color-primary, 0.2);
    border-radius: $ui-radius-small;
  }
}
</style>
