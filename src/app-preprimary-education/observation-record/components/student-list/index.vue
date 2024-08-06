<template>
  <mt-card :class-name="[className]" padding="plr-l">
    <view v-for="(item, inx) in students" :key="item.id">
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
        />
        <view class="flex-between w100 ml-b">
          <view class="scroll-hidden">
            <view class="flex">
              <text class="font-title mr-xs text-ellipse">{{ item.studentName }}</text>
              <c-icon
                v-if="item.gender === 2"
                name="icon_gender_female"
                color-type="warnning"
                :size="32"
              />
              <c-icon v-else name="icon_male" color-type="primary" :size="32" />
            </view>

            <view class="flex mt-xxs color-placeholder font-secondary">
              <text class="mr-xs no-shrink"> 学号:</text>
              <text class="text-ellipse">
                {{ item.studentCode || '/' }}
              </text>
            </view>
          </view>
          <view class="flex-inline no-shrink ml-b">
            <text class="color-secondary font-title">{{ item.observeNum ?? 0 }}条</text>
            <view
              :class="['unread-area', item.unReadCount && item.unReadCount > 0 ? 'bg-error' : '']"
            />
            <c-icon name="icon_arrow_right" :size="48" color-type="placeholder" />
          </view>
        </view>
      </view>
    </view>
  </mt-card>
  <c-empty-line :need-safe-bottom="true" height="128rpx" />
</template>

<script lang="ts" setup>
import mtCard from '@/app-preprimary-education/components/mt-card/mt-card.vue';
import { useTimeImpression } from '@/app-preprimary-education/observation-record/utils/use-time-impression';
import { childHeaderImg } from '@/app-preprimary-education/utils/tools';
import { setObserveRecordReads } from '../../utils/service';

interface IProps {
  className?: string | string[];
  students: any[];
}
const store = useTimeImpression();
const props = withDefaults(defineProps<IProps>(), {
  className: '',
  students: () => [],
});

const handleJump = async (data: any) => {
  console.log('data : ' + JSON.stringify(data));
  store.studentData.setStudentsData(data);
  if (data.unReadCount && data.unReadCount > 0) {
    await setObserveRecordReads({ studentId: data.studentId, type: 1 });
  }
  uni.navigateTo({
    url: `/app-preprimary-education/observation-record/view-picture`,
  });
};
</script>
<style lang="scss" scoped>
.unread-area {
  width: 15rpx;
  height: 15rpx;
  border-radius: 50%;
  position: relative;
  margin-bottom: 24rpx;
}
</style>
