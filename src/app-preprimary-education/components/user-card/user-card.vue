<template>
  <view class="user-card-wrapper">
    <view v-if="hasImg">
      <slot name="cardImg"></slot>
    </view>
    <view class="card-info" @click.stop="handleClick">
      <view :class="['card-title text-ellipse ' + size]">
        <text class="text-ellipse">{{ userInfo?.name }}</text>
      </view>
      <view :class="['card-detail ' + size]">
        <text v-if="!isEmptyStr(userInfo.desc1)" class="detail-txt">{{ userInfo?.desc1 }}</text>
        <text v-if="!isEmptyStr(userInfo.desc2)" class="detail-txt">{{ userInfo?.desc2 }}</text>
        <view class="detail-txt">
          <slot name="extra-detail"></slot>
        </view>
      </view>
    </view>
    <view v-if="showArrow" @click.stop="handleClick">
      <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
    </view>
    <view>
      <slot name="extra-right"></slot>
    </view>
  </view>
</template>
<script lang="ts">
import { isEmptyStr } from '@/utils/tools';
import { defineComponent, PropType } from 'vue';

export interface IUserCard {
  id?: string | number;
  name: string;
  url?: string;
  desc1?: string;
  desc2?: string;
  [k: string]: any;
}
export default defineComponent({
  props: {
    hasImg: {
      type: Boolean,
      default: true,
    },
    showArrow: {
      type: Boolean,
      default: false,
    },
    // title的字体配置
    size: {
      type: String as PropType<'large' | 'small'>,
      default: 'large',
    },

    userInfo: {
      type: Object as PropType<IUserCard>,
      default: () => ({}),
    },
  },
  emits: ['onClickCard'],
  setup(props, ctx) {
    const handleClick = () => {
      ctx.emit('onClickCard', props.userInfo);
    };
    return { handleClick, isEmptyStr };
  },
});
</script>
<style lang="scss" scoped>
.user-card-wrapper {
  display: flex;
  align-items: center;

  .card-info {
    flex-grow: 1;
    margin-left: $ui-gap-large;
    width: 50%;
    .card-title {
      color: $ui-color-base;
      font-weight: $ui-font-weight-bold;

      &.large {
        font-size: $ui-font-size-xxt;
        margin-bottom: $ui-gap-xs;
      }
      &.small {
        font-size: $ui-font-size-xt;
        margin-bottom: $ui-gap-xs;
      }
    }
    .card-detail {
      color: $ui-color-placeholder;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &.large {
        font-size: $ui-font-size-secondary;
      }
      &.small {
        font-size: $ui-font-size-content;
      }
      .detail-txt {
        margin-right: $ui-gap-default;
        white-space: nowrap;
      }
    }
  }
}
</style>
