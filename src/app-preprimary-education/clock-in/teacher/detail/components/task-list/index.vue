<template>
  <view class="box mlr-b plr-b">
    <view v-for="item in clockData" :key="item?.studentId" class="list">
      <imp-space>
        <image
          class="avatar mr-b"
          :src="item?.url ? transformImageUrl(item.url) : defaultAvatar[item?.gender]"
        />
        <text class="mr-b">{{ item?.studentName }}</text>
        <c-icon v-if="item?.gender === 2" name="icon_gender_female" size="32" color-type="error" />
        <c-icon v-else name="icon_male" size="32" color-type="primary" />
      </imp-space>
    </view>
    <c-empty
      v-if="clockData.length === 0"
      bg-type="white"
      :content="activeTabIndex === 0 ? '当日暂无打卡动态' : '当日已全部完成打卡'"
      type="mini"
      className="radius-default"
    />
  </view>
</template>
<script lang="ts">
export interface IClockInsItems {
  firstLetter: number;
  personId: string;
  studentId: string;
  clockinNum: string;
  studentName: string;
  url: string;
}
import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import profile_photo_boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import profile_photo_girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import { transformImageUrl } from '@/app-preprimary-education/utils/tools';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    clockData: { type: Array as PropType<IClockInsItems[]>, default: () => [] },
    activeTabIndex: { type: Number, default: 0 },
  },
  components: { ImpEmptyData, ImpSpace },
  setup() {
    // 默认头像展示，区分性别
    const defaultAvatar = {
      1: profile_photo_boy,
      2: profile_photo_girl,
    };
    return {
      profile_photo_boy,
      profile_photo_girl,
      defaultAvatar,
      transformImageUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.box {
  margin-top: $ui-gap-large;
  background-color: #ffffff;
  box-shadow: 0px 0px 20px 0px rgba(24, 25, 68, 0.05);
  border-radius: 20rpx;
  z-index: 1;
  .list {
    height: 120rpx;
    border-bottom: 1px solid $ui-color-line-default;
    padding: $ui-gap-default $ui-gap-large 0 $ui-gap-large;
    .avatar {
      display: inline-block;
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
    }
    .gender {
      display: inline-block;
      width: 26rpx;
      height: 48rpx;
    }
  }
}
</style>
