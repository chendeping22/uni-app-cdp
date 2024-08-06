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
        @click="itemCheck(userInfo)"
      >
        <view class="checkbox" hover-class="none" hover-stop-propagation="false">
          <imp-checkbox :value="value.includes(userInfo.id)" />
        </view>
        <view class="card-img">
          <image v-if="userInfo.url" :src="userInfo.url" />
          <view v-else class="empty"></view>
        </view>
        <view class="card-info">
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
import ImpCheckbox from '@/app-preprimary-education/components/imp-checkbox/imp-checkbox.vue';
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
}

export default defineComponent({
  components: { ImpEmptyData, ImpCheckbox, popupTelephone },
  props: {
    hasIndex: {
      type: Boolean,
      default: true,
    },
    item: {
      type: Object as PropType<IContact>,
      default: {} as IContact,
    },
    value: {
      type: Array as PropType<any[]>,
      default: () => [],
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['itemClick', 'itemCheck'],
  setup(props, { emit }) {
    const showPopup = ref(false);
    const popupData = reactive({ label: '', value: '' });
    const userInfos = computed(() => {
      const items = props.item.items;
      return items.map(({ info }) => {
        return {
          ...info,
          url: transformImageUrl(info.url || ''),
        };
      }) as IUserCard2[];
    });
    const openPhonePopup = (userInfo: IUserCard2) => {
      showPopup.value = true;
      // "家长"需要改为关系
      popupData.label = userInfo.phoneContactName + ' ' + userInfo.mobilePhone;
      popupData.value = userInfo.mobilePhone;
    };
    const itemCheck = (info: any) => {
      if (props.isEdit) return;
      emit('itemCheck', info);
    };

    return {
      showPopup,
      popupData,

      userInfos,
      openPhonePopup,
      itemCheck,
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
  .checkbox {
    padding-right: $ui-gap-large;
  }
}
.user-card-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  height: 120rpx;
  // background-color: $ui-color-white;
  padding: 0 $ui-gap-large;
  box-sizing: border-box;

  &:nth-child(n + 2) {
    border-top: 1px solid $ui-color-line-default;
  }

  .card-img {
    box-sizing: border-box;
    border-radius: 50%;

    margin-right: $ui-gap-large;

    .empty {
      width: 88rpx;
      height: 88rpx;
      border: 1px solid $ui-color-line-default;
      border-radius: 50%;
    }

    image {
      width: 88rpx;
      height: 88rpx;
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
      image {
        margin-left: $ui-gap-xs;
        width: 32rpx;
        height: 52rpx;
      }
      .card-title-extra {
        height: 36rpx;
        line-height: 36rpx;
        border: 1px solid $ui-color-primary;
        border-radius: $ui-radius-small;
        font-size: $ui-font-size-desc;
        color: $ui-color-primary;
        text-align: center;
        padding: 0 $ui-gap-xs;
        margin-left: $ui-gap-xs;
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
