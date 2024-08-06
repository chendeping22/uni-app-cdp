<template>
  <c-card class-name="mt-l mlr-l" @click="navigateToDetail">
    <view>
      <view class="leave-main">
        <view class="leave-main-image">
          <c-avatar
            class-name="radius-round "
            :src="itemInfo.photoUrl"
            :sex="String(itemInfo.gender) === '1' ? 'man' : 'woman'"
            type="child"
            :size="108"
          />
        </view>
        <view class="leave-main-info">
          <view class="leave-main-info-top">
            <view>{{ itemInfo.studentName }}</view>
            <ProcessTag :code="itemInfo.status" :title="itemInfo.statusName" />
          </view>
          <view class="leave-main-info-bottom"
            >{{ itemInfo.createByName }} 提交于
            {{ dayjs(itemInfo.createTime).format('YYYY-MM-DD HH:mm') }}</view
          >
        </view>
      </view>

      <view class="leave-divider"></view>
      <view class="leave-time">
        <view class="leave-time-label">服药日期</view>
        <view>{{ dayjs(itemInfo.medicationDate).format('YYYY-MM-DD ') }}</view>
      </view>
      <view class="leave-time">
        <view class="leave-time-label">药品名称</view>
        <view v-if="itemInfo.medicationItems" class="leave-time-names">
          <text v-for="(item, index) in itemInfo.medicationItems" :key="index">
            {{ item.name
            }}{{
              itemInfo.medicationItems.length > 1 && index !== itemInfo.medicationItems.length - 1
                ? '、'
                : ''
            }}
          </text>
        </view>
      </view>
    </view>
  </c-card>
</template>
<script lang="ts">
import { rowInfoType } from '@/app-preprimary-education/services/feedMedicine';
import profile_photo_boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import profile_photo_girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import dayjs from 'dayjs';
import { PropType, defineComponent, reactive, ref, watch } from 'vue';
import ProcessTag from './process-tag.vue';
export default defineComponent({
  components: {
    ProcessTag,
  },
  props: {
    data: {
      type: Object as PropType<rowInfoType>,
      default: () => {
        return {};
      },
    },
  },
  setup(props) {
    const { data } = reactive(props);
    const itemInfo = ref<rowInfoType>(data);
    watch(
      () => props.data,
      info => {
        itemInfo.value = info;
      },
    );

    return {
      itemInfo,
      profile_photo_boy,
      profile_photo_girl,
      dayjs,
    };
  },
  methods: {
    navigateToDetail: function () {
      let url = '';
      if (loginStore().currentUserType === EUserType.teacher) {
        url = `/app-preprimary-education/feed-medicine/teacher/medicine-detail/index?infoId=${this.itemInfo.id}`;
      } else {
        url = `/app-preprimary-education/feed-medicine/guardian/medicine-detail/index?infoId=${this.itemInfo.id}`;
      }

      uni.navigateTo({ url });
    },
  },
});
</script>
<style lang="scss" scoped>
.leave-main {
  display: flex;
  flex-direction: row;
  &-image {
    width: 104rpx;
    height: 104rpx;
    border-radius: $uni-border-radius-circle;
  }
  &-info {
    margin-left: $ui-gap-large;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    &-top {
      font-size: $ui-font-size-xt;
      color: $ui-color-base;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    &-bottom {
      margin-top: $ui-gap-default;
      font-size: $ui-font-size-secondary;
      color: $ui-color-secondary;
    }
  }
}
.leave-divider {
  height: 1px;
  width: 100%;
  background: rgba($ui-color-black, 0.06);
  margin: $ui-gap-xs 0;
}
.leave-time {
  display: flex;
  flex-direction: row;
  font-size: $ui-font-size-content;
  line-height: 44rpx;
  color: $ui-color-base;
  &-label {
    margin-right: $ui-gap-default;
    color: $ui-color-placeholder;
    min-width: 120rpx;
  }
  &-names {
    // 超过两行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}
</style>
