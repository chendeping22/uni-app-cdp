<template>
  <mt-card :class-name="[className]" padding="plr-l">
    <view v-for="(item, inx) in students" :key="item.studentId">
      <view
        :class="[
          'flex-inline ptb-b w100',
          inx < students.length - 1 ? 'border-bottom border-line-default' : '',
        ]"
        @click="handleJump(item)"
      >
        <c-image
          :src="childHeaderImg(item?.imageUrl || '', item.gender)"
          :width="88"
          :height="88"
          mode="aspectFit"
          icon-loading=""
          shape="circle"
        />
        <view class="flex-between w100 ml-b">
          <view class="scroll-hidden">
            <view class="flex">
              <text class="font-title mr-xs text-ellipse">{{ item.studentName }}</text>
            </view>

            <view class="flex mt-xxs color-placeholder font-secondary star-icon-area">
              <view v-for="i in item?.crown" :key="`crown_${i}`">
                <c-image
                  :src="iconCrown"
                  :width="40"
                  :height="40"
                  mode="aspectFit"
                  icon-loading=""
                  bgColor="#fff"
                />
              </view>
              <view v-for="i in item?.diamond" :key="`diamond_${i}`">
                <c-image
                  v-if="item?.crown + i < 7"
                  :src="iconDiamond"
                  :width="40"
                  :height="40"
                  mode="aspectFit"
                  icon-loading=""
                  bgColor="#fff"
                />
              </view>
              <view v-for="i in item?.badge" :key="`badge_${i}`">
                <c-image
                  v-if="item?.crown + item?.diamond + i < 7"
                  :src="iconBadge"
                  :width="40"
                  :height="40"
                  mode="aspectFit"
                  icon-loading=""
                  bgColor="#fff"
                />
              </view>
              <view v-for="i in item?.star" :key="`star_${i}`">
                <c-image
                  v-if="item?.crown + item?.diamond + item?.badge + i < 7"
                  :src="iconStar"
                  :width="40"
                  :height="40"
                  mode="aspectFit"
                  icon-loading=""
                  bgColor="#fff"
                />
              </view>
              <view
                v-if="item?.crown + item?.diamond + item?.badge + item?.star >= 7"
                class="ml-xxs"
              >
                ...
              </view>
            </view>
          </view>
          <view class="flex-inline no-shrink ml-b">
            <view class="flex-inline medal-icon-area">
              <view
                v-for="(medal, index) in item.medalInfos"
                :key="`${index}_${medal.id}`"
                :style="{
                  position: 'absolute',
                  right: `${90 + 35 * (Math.min(3, item.medalInfos.length - 1) - index)}rpx`,
                  zIndex: 99 - index,
                  opacity: 1 - index * 0.2,
                }"
              >
                <c-image
                  v-if="index < 4"
                  :src="MEDAL_ACTIVE[medal?.icon]"
                  :width="70"
                  :height="70"
                  mode="aspectFit"
                  icon-loading=""
                  bgColor="#fff"
                />
              </view>
            </view>
            <c-icon name="icon_arrow_right" :size="48" color-type="placeholder" />
          </view>
        </view>
      </view>
    </view>
  </mt-card>
  <c-empty-line need-safe-bottom class-name="mtb-b" height="180rpx" />
</template>

<script lang="ts" setup>
import mtCard from '@/app-preprimary-education/components/mt-card/mt-card.vue';
import { childHeaderImg } from '@/app-preprimary-education/utils/tools';
import iconBadge from '../../../static/image/icon_badge.png';
import iconCrown from '../../../static/image/icon_crown.png';
import iconDiamond from '../../../static/image/icon_diamond.png';
import iconStar from '../../../static/image/icon_star.png';
import { MEDAL_ACTIVE } from '../../utils/constants';
import { IStudentInfoItem } from '../../utils/service';

interface IProps {
  className?: string | string[];
  students: IStudentInfoItem[];
}
const props = withDefaults(defineProps<IProps>(), {
  className: '',
  students: () => [],
});

/** 点击学生跳转详情页 */
const handleJump = async (data: any) => {
  uni.navigateTo({
    url: `/app-preprimary-education/electronic-medal/student-medal-info?studentId=${data.studentId}`,
  });
};
</script>
<style lang="scss" scoped>
.medal-icon-area {
  max-width: 200rpx;
}
</style>
