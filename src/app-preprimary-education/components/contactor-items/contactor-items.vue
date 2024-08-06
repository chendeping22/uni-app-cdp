<template>
  <view :class="['components-contactor-items', { hasPaddingTop: userInfos.length }]">
    <view v-if="hasIndex" class="index-key">
      <text>{{ item.key }}</text>
    </view>
    <view class="cards-outer">
      <view
        v-for="(userInfo, inx) in userInfos"
        :key="`contact_${inx}`"
        class="user-card-wrapper"
        @click="onItemClick(idx, inx, userInfo)"
      >
        <view v-if="showSelect" class="card-checkbox">
          <c-checkbox :value="userInfo.checked" @change="onItemClick(idx, inx, userInfo)" />
        </view>
        <view class="card-img">
          <image v-if="userInfo.url" :src="userInfo.url" />
          <view v-else class="empty"></view>
        </view>
        <view class="card-info" @click="openStudentFile(userInfo)">
          <view class="card-title">
            <text class="mr-xs">{{ userInfo.name }}</text>
            <c-icon
              v-if="userInfo.gender === 2"
              name="icon_gender_female"
              size="32"
              color-type="error"
            />
            <c-icon v-else name="icon_male" size="32" color-type="primary" />
            <view v-if="userInfo.type === 0" class="card-title-extra">班主任</view>
          </view>
          <view class="card-detail">
            <text>{{ userInfo.desc }}</text>
          </view>
        </view>
        <view
          v-if="userInfo.mobilePhone"
          :class="`card-tel ${hasIndex ? 'margin-right' : ''}`"
          @click.stop="openPhonePopup(userInfo)"
        >
          <c-icon
            name="icon_phone_call_fill"
            color-type="primary"
            size="52"
            class-name="mr-xs icon-60 bg-fill-default radius-round"
          />
        </view>
      </view>
    </view>
    <imp-empty-data v-if="!userInfos.length" title="暂无数据" />
    <popup-telephone
      :show-popup="showPopup"
      :detail="popupData.label"
      :phone="popupData.value"
      @onClose="showPopup = false"
    />
  </view>
</template>
<script lang="ts">
import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import popupTelephone from '@/app-preprimary-education/components/popup-telephone/popup-telephone.vue';
import { IUserCard } from '@/app-preprimary-education/components/user-card/user-card.vue';
import { transformImageUrl } from '@/app-preprimary-education/utils/tools';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';

export interface IContactDetail {
  url?: string;
  name: string;
  id: number;
  gender: number;
  mobilePhone: string;
  desc?: string;
  type?: number;
  pagePath: string;
  [k: string]: any;
}

export interface IContact {
  key: string;
  items: {
    info: IContactDetail;
  }[];
}

interface IUserCard2 extends IUserCard {
  mobilePhone: string;
  desc: string;
  gender: number;
  type?: number;
  pagePath: string;
  phoneContactName: string;
  checked?: boolean;
  disabled?: boolean;
}

export default defineComponent({
  components: { ImpEmptyData, popupTelephone },
  props: {
    hasIndex: {
      type: Boolean,
      default: true,
    },
    item: {
      type: Object as PropType<IContact>,
      default: {} as IContact,
    },
    idx: {
      type: Number,
      default: 0,
    },
    showSelect: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['itemClick'],
  setup(props, { emit }) {
    const { showSelect } = reactive(props);

    const showPopup = ref(false);
    const popupData = reactive({ label: '', value: '' });
    const userInfos = computed(() => {
      const items = props.item.items || [];
      return items.map(({ info }) => {
        return {
          ...info,
          url: transformImageUrl(info.url || ''),
        };
      }) as IUserCard2[];
    });

    const onItemClick = (idx: number, index: number, userInfo: IUserCard2) => {
      const { disabled } = userInfo;
      if (showSelect && !disabled) {
        emit('itemClick', { idx, index });
      }
    };

    const openPhonePopup = (userInfo: IUserCard2) => {
      showPopup.value = true;
      // "家长"需要改为关系
      popupData.label = userInfo.phoneContactName ?? '' + ' ' + userInfo.mobilePhone;
      popupData.value = userInfo.mobilePhone;
    };

    const openStudentFile = (userInfo: IUserCard2) => {
      if (userInfo.pagePath)
        uni.navigateTo({
          url: userInfo.pagePath,
        });
    };

    return {
      showPopup,
      popupData,
      userInfos,
      openPhonePopup,
      openStudentFile,
      onItemClick,
    };
  },
});
</script>
<style lang="scss" scoped>
.components-contactor-items {
  &.hasPaddingTop {
    padding-top: $ui-gap-default;
  }

  .index-key {
    height: 40rpx;
    line-height: 40rpx;
    font-size: $ui-font-size-content;
    color: $ui-color-placeholder;
    margin-left: $ui-gap-large;
  }
}
.cards-outer {
  background-color: $ui-color-white;
  border-radius: $ui-radius-xl;
  box-shadow: 0px 0px 20rpx 0px $ui-card-shadow;
}
.user-card-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  height: 120rpx;
  // background-color: $ui-color-white;
  padding: 0 $ui-gap-large;
  box-sizing: border-box;

  &:nth-child(n + 2):before {
    content: ' ';
    position: absolute;
    left: 32rpx;
    right: 32rpx;
    top: 0;
    height: 0;
    border-top: 1px solid $ui-color-line-default;
  }

  .card-checkbox {
    height: 40rpx;
  }

  .card-img {
    box-sizing: border-box;
    border-radius: 50%;
    height: 88rpx;
    margin-right: $ui-gap-base;
    margin-left: $ui-gap-large;

    .empty {
      width: 88rpx;
      height: 88rpx;
      border: 1px solid $ui-color-line-default;
      border-radius: 50%;
    }

    image {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
    }
  }
  .card-info {
    flex-grow: 1;

    box-sizing: border-box;
    height: 120rpx;
    // padding: $ui-gap-default 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .card-title {
      font-size: $ui-font-size-title;
      color: $ui-color-base;
      display: flex;
      align-items: center;

      .card-title-extra {
        width: 84rpx;
        height: 36rpx;
        line-height: 32rpx;
        border-radius: $ui-radius-default;
        font-size: $ui-font-size-desc;
        background-color: $ui-color-primary-light-3;
        color: $ui-color-primary;
        padding: 0 $ui-gap-xs;
        margin-left: $ui-gap-xs;
        font-weight: $ui-font-weight-normal;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .card-detail {
      font-size: $ui-font-size-secondary;
      color: $ui-color-placeholder;
    }
  }

  .card-tel {
    &.margin-right {
      margin-right: $ui-gap-xl;
    }
    .image-icon {
      width: 68rpx;
      height: 68rpx;
    }
  }
}
</style>
