<template>
  <view v-if="trackingRecords?.length > 0" class="mt-l">
    <c-time-line>
      <c-time-line-item v-for="item in trackingRecords" :key="item.id">
        <template #node>
          <view class="circle-point"></view>
        </template>
        <template #content>
          <!-- 记录详情 -->
          <view class="flex-between color-placeholder plr-xs">
            <view class="">{{ date2str(item.createTime, 'Date&Minutes') }}</view>
            <view> 操作人:{{ item.createName }} </view>
          </view>
          <view v-if="hasOperatePermission(item)" class="flex">
            <c-button
              type="plain"
              height-size="button-xs"
              width="152rpx"
              class="ml-xs flex-center font-content"
              @click="handleEdit(item.id)"
            >
              <c-icon name="icon_edit" size="36" color-type="" />
              <view style="ml-b">编辑</view>
            </c-button>
            <c-button
              type="plain"
              height-size="button-xs"
              width="152rpx"
              class="ml-b mtb-xs flex-center font-content"
              @click="handleDelete(item.id)"
            >
              <c-icon name="icon_delete" size="36" color-type="" />
              <view style="ml-b">删除</view>
            </c-button>
          </view>
          <!-- 康复信息 -->
          <view
            v-show="item.type === 3"
            class="font-content color-placeholder card plr-b ptb-b mt-xs"
          >
            <view class="color-secondary font-title"> 康复信息 </view>
            <view class="flex flex-row-top-start">
              <text class="label-name">是否康复</text>
              <text class="color-base">{{ item.healthFlag ? '是' : '否' }}</text>
            </view>
            <view class="flex flex-row-top-start">
              <text class="label-name">复园日期</text>
              <text class="color-base">{{ dayjs(item.healthDate).format('YYYY-MM-DD') }}</text>
            </view>
            <view class="flex flex-row-top-start">
              <text class="label-name">患病时长</text>
              <text class="color-base">{{ props.sicknessDuration ?? 0 }}天</text>
            </view>
            <view
              v-if="filterFileList(item.fileList, 1)?.length > 0"
              class="flex flex-row-top-start"
            >
              <text class="label-name">复园诊断书</text>
              <view>
                <c-images
                  :list="filterFileList(item.fileList, 1)"
                  type="mini"
                  :editable="false"
                ></c-images>
              </view>
            </view>
          </view>
          <!-- 疾病详情 -->
          <view class="font-content color-placeholder card plr-b ptb-b mt-xs">
            <view class="color-secondary font-title"> 疾病信息 </view>
            <view class="disease-list">
              <text class="label-name">疾病症状</text>
              <text class="color-base">{{ symptom2str(item.symptomList) }} </text>
            </view>
            <view v-if="item.type !== 1" class="flex flex-row-top-start">
              <text class="label-name">是否就诊</text>
              <text class="color-base">
                <text class="color-base">{{ item.outpatientFlag ? '是' : '否' }}</text>
              </text>
            </view>
            <view v-if="item.type !== 1 && item.outpatientFlag">
              <view class="flex flex-row-top-start">
                <text class="label-name">就诊医院</text>
                <text class="color-base">{{ item.hospital }}</text>
              </view>
              <view class="flex flex-row-top-start">
                <text class="label-name">就诊疾病</text>
                <text class="color-base">{{ item.sicknessLabelName }}</text>
              </view>
              <view
                v-if="filterFileList(item.fileList, 2)?.length > 0"
                class="flex flex-row-top-start"
              >
                <text class="label-name">病例报告</text>
                <view>
                  <c-images
                    :list="filterFileList(item.fileList, 2)"
                    type="mini"
                    :editable="false"
                  ></c-images>
                </view>
              </view>
            </view>
          </view>
        </template>
      </c-time-line-item>
    </c-time-line>
  </view>
  <card v-else bg-type="empty">
    <imp-empty-data title="无疾病信息" />
  </card>
</template>

<script lang="ts" setup>
import { uniq } from '@/utils/lodash-es';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { ref, watchEffect } from 'vue';
import {
  deleteStudentDiseaseTracking,
  fetchStudentDiseaseTracking,
} from '../../../services/disease-management';
import { DetailOfTrack, FileItem, SymptomItem } from '../../types/record';

interface Props {
  recordId: string;
  status: number;
  userId: string;
  sicknessDuration: string;
  sickenDate: string;
}

const props = defineProps<Props>();

const date2str = (date: number, mode: string) => {
  switch (mode) {
    case 'Date&Minutes': {
      return dayjs(date).format('YYYY-MM-DD HH:mm');
    }
    case 'Date': {
      return dayjs(date).format('YYYY-MM-DD');
    }
  }
};

const symptom2str = (symptomList: SymptomItem[]) => {
  if (symptomList.length) {
    return uniq(symptomList.map(item => item.symptomName)).join(',');
  } else return '/';
};

const trackingRecords = ref<DetailOfTrack[]>([]);

const handleEdit = (id: string) => {
  uni.navigateTo({
    url: `/app-preprimary-education/disease-management/guardian/track-operation?recordId=${props.recordId}&traceRecordId=${id}&sickenDate=${props.sickenDate}`,
  });
};

const handleDelete = async (id: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条疾病记录吗？',
    success: function (res) {
      if (res.confirm) {
        deleteStudentDiseaseTracking(id).then(() => {
          uni.showToast({
            title: '删除成功',
            icon: 'none',
            duration: 2000,
          });
          const index = trackingRecords.value.findIndex(item => item.id === id);
          if (index >= 0) {
            trackingRecords.value.splice(index, 1);
          }
          uni.$emit('disease-management:modify:operation');
        });
      }
    },
  });
};

const filterFileList = (list: FileItem[], type: number) => {
  if (!list?.length) return [];
  return list
    .filter(item => item.type === type)
    .map(item => {
      return {
        fileId: item.fileId,
        type: 1,
        url: item.fileUrl,
      };
    });
};

const hasOperatePermission = (item: DetailOfTrack) => {
  if (props.status !== 0 || item.autoCreateFlag === 1) return false;
  if (item.userSource == 1 && item.createBy == props.userId) return true;
  return false;
};

watchEffect(() => {
  if (!!props.recordId)
    fetchStudentDiseaseTracking(props.recordId).then(res => {
      trackingRecords.value = res;
    });
});

const refresh = () => {
  fetchStudentDiseaseTracking(props.recordId).then(res => {
    trackingRecords.value = res;
  });
};

onLoad(() => {
  uni.$on('disease-management:modify', refresh);
});

onUnload(() => {
  uni.$off('disease-management:modify', refresh);
});
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
  min-width: 150rpx;
}
.card {
  background: #f8f8fa;
  border-radius: 12rpx;
}
.circle-point {
  width: 16rpx;
  height: 16rpx;
  background-color: #176bfb;
  border-radius: 16rpx;
}
.disease-list {
  display: flex;
  align-items: flex-start;
}
</style>
