<template>
  <view class="plr-l pt-b radius-default bg-white mb-b card-style">
    <view class="flex-between">
      <view class="flex-column-plain">
        <view class="font-xt bold">{{ info.applyParentVoList[0].name }}</view>
        <view class="font-secondary color-placeholder mt-xxs">
          {{ commonDateStr(info.approveDate) }}</view
        >
      </view>
      <u-tag v-if="info.approveResult === 1" text="已同意" type="success" />
      <u-tag v-else text="已拒绝" type="error" />
    </view>

    <view class="ptb-b">
      <view class="flex">
        <view class="color-placeholder col-8">学生{{ cardInf.text }}</view>
        <text>{{ cardInf.cardNo }}</text>
      </view>
      <view class="flex mtb-xs">
        <view class="color-placeholder col-8">申请加入</view>
        <text>{{ info.clazzName }}</text>
      </view>
      <view class="flex">
        <view class="color-placeholder col-8">邀请者</view>
        <text>{{ info.inviterName }}</text>
      </view>
      <view class="flex">
        <view class="color-placeholder col-8">审批人</view>
        <text>{{ info.approverName }}</text>
      </view>
    </view>
  </view>
</template>
<script lang="ts">
import type { IListApproveToClazzRtn } from '@/app-platform/services/contacts';
import { isNil } from '@/utils/lodash-es';
import { commonDateStr } from '@/utils/tools';
import { PropType, defineComponent, onMounted, ref } from 'vue';
import { certificateTypeCodes, enum_cardTypes } from '../../add-student/enum';

export default defineComponent({
  props: {
    info: { type: Object as PropType<IListApproveToClazzRtn>, default: () => {} },
  },
  emits: [],
  setup(props) {
    const cardInf = ref({ text: '', cardNo: '' });

    onMounted(() => {
      let applyStudentVo =
        props.info.applyStudentVoList && props.info.applyStudentVoList.length > 0
          ? props.info.applyStudentVoList[0]
          : { certificateNo: '', certificateType: -1, studentCode: '' };
      if (applyStudentVo) {
        console.log('applyStudentVo', applyStudentVo);
        const { certificateNo, certificateType, studentCode } = applyStudentVo;
        console.log('certificateType', certificateType);
        const isStudentCode =
          isNil(certificateType) || !certificateTypeCodes.includes(Number(certificateType));
        console.log('isStudentCode', isStudentCode);
        cardInf.value = {
          text: isStudentCode
            ? enum_cardTypes[1].label
            : enum_cardTypes.find(tmp => tmp.value === certificateType)?.label || '',
          cardNo: (isStudentCode ? studentCode : certificateNo) || '',
        };
      }
    });

    return { commonDateStr, cardInf };
  },
});
</script>
<style scoped lang="scss">
.card-style {
  margin: 0 32rpx;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
}
.flex {
  display: flex;
  align-items: center;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-grow {
  /** 填满剩余空间 */
  flex-grow: 1;
}
.flex-column-plain {
  display: flex;
  flex-direction: column;
}
.height-cell-default {
  height: 88rpx;
}
.border-top {
  border-top-width: 1px;
  border-top-style: solid;
}
.border-right {
  border-right-width: 1px;
  border-right-style: solid;
}
.border-line-default {
  border-color: #e5e6eb;
}
.bg-white {
  background: #ffffff;
}
.color-placeholder {
  color: #86909c;
}
.color-error {
  color: #f53f3f;
}
.color-primary {
  color: $ui-color-primary;
}
.ptb-b {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
}
.mb-b {
  margin-bottom: 24rpx;
}
.mtb-b {
  margin-top: 24rpx;
  margin-bottom: 24rpx;
}
.mtb-xs {
  margin-top: 12rpx;
  margin-bottom: 12rpx;
}
.mt-xxs {
  margin-top: 8rpx;
}
.bold {
  font-weight: 600;
}
.plr-l {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.pt-b {
  padding-top: 24rpx;
}
.font-xt {
  font-size: 34rpx;
}
.font-secondary {
  font-size: 24rpx;
}
.radius-default {
  border-radius: 12rpx;
}
.col-8 {
  width: 33.3333333333%;
}
</style>
