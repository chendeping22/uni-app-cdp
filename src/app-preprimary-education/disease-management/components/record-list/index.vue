<template>
  <view v-if="props.data?.length > 0" class="mt-l">
    <view
      v-for="item in props.data"
      :key="item.id + item.status"
      class="flex-column-plain mlr-l mb-b plr-l ptb-b bg-white radius-default"
      @click="onClick(item)"
    >
      <!-- 记录详情 -->
      <view class="flex-between">
        <view class="flex">
          <view class="mr-b">
            <image v-if="item.studentPhoto" class="student-photo" :src="item.studentPhoto" />
            <image
              v-else
              class="student-photo"
              :src="item?.gender === 2 ? profile_photo_girl : profile_photo_boy"
            />
          </view>
          <view>
            <view class="color-base font-xt">{{ item.studentName }}</view>
            <view>
              <view class="color-placeholder"
                >{{ item.createName }} 提交 {{ date2str(item.createTime, 'Date&Minutes') }}</view
              >
            </view>
          </view>
        </view>
        <view
          v-if="props.tags[item.status]"
          class="font-content plr-s text-nowrap radius-default"
          :style="{
            color: props.tags[item.status].color,
            backgroundColor: props.tags[item.status].bgColor,
          }"
        >
          {{ props.tags[item.status].title }}
        </view>
      </view>
      <!-- 患病详情 -->
      <view class="font-content color-placeholder mt-b">
        <view class="flex">
          <text class="mr-s">患病日期</text>
          <text class="color-base label-name">{{ date2str(item.sickenDate, 'Date') }} </text>
        </view>
        <view class="flex">
          <text class="mr-s">患病时长</text>
          <text class="color-base label-name" :class="{ 'color-red': item.isOverTime }"
            >{{ item.sicknessDuration ?? 0 }}天</text
          >
        </view>
        <view class="disease-list">
          <text class="label-name">疾病症状</text>
          <text class="color-base text-line-2">{{ symptom2str(item.symptomList) }} </text>
        </view>
      </view>
    </view>
  </view>
  <c-empty v-else content="无疾病信息" bg-type="gray" />
</template>

<script lang="ts" setup>
import profile_photo_boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import profile_photo_girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import { uniq } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { RecordItem, SymptomItem, TagItem } from '../../types/record';
interface Props {
  data: RecordItem[];
  tags: TagItem[];
}

interface Emits {
  (e: 'selectItem', item: RecordItem): void;
}

const props = defineProps<Props>();

const emits = defineEmits<Emits>();

const onClick = (item: RecordItem) => {
  emits('selectItem', item);
};

const date2str = (date: number, mode: string) => {
  switch (mode) {
    case 'Date&Minutes': {
      return dayjs(date).format('YYYY-MM-DD HH:mm');
    }
    case 'Date': {
      return dayjs(date).format('YYYY-MM-DD ');
    }
  }
};

const symptom2str = (symptomList: SymptomItem[]) => {
  if (symptomList.length) {
    return uniq(symptomList.map(item => item.symptomName)).join(',');
  } else return '/';
};
</script>

<style lang="scss" scoped>
.sports-clockin__list {
  max-width: 680rpx;
}
.sports-clockin__list--with-tag {
  max-width: 464rpx;
}
.sports-clockin__list__tag {
  padding-top: 2rpx;
  padding-bottom: 2rpx;
}
.student-photo {
  width: 88rpx;
  height: 88rpx;
}
.text-line-2 {
  /* 设置文本只显示三行 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  /* 设置文本超出部分省略 */
  text-overflow: ellipsis;
}
.label-name {
  min-width: 130rpx;
}
.color-red {
  color: red;
}
.disease-list {
  display: flex;
  align-items: flex-start;
}
</style>
