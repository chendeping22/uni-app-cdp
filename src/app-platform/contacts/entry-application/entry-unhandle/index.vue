<template>
  <view class="radius-default bg-white mb-b card-style">
    <view class="plr-l pt-b">
      <view class="font-xt bold">{{ info.applyParentVoList[0].name }}</view>
      <view class="font-secondary color-placeholder mt-xxs">
        {{ commonDateStr(info.createTime) }}</view
      >
      <view class="mtb-b">
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
      </view>
    </view>

    <view class="height-cell-default flex border-top border-line-default">
      <view class="flex-center flex-grow" @click="handleApprove(2)">
        <text class="color-error font-xt"> 拒绝 </text>
      </view>
      <view class="height-cell-default border-right border-line-default"></view>
      <view class="flex-center flex-grow" @click="handleApprove(1)">
        <text class="color-primary font-xt"> 同意 </text>
      </view>
    </view>
  </view>
</template>
<script lang="ts">
import { IListApproveToClazzRtn, approveRecord } from '@/app-platform/services/contacts';
import { loginStore } from '@/store/modules/login';
import { isNil } from '@/utils/lodash-es';
import { commonDateStr, log, showConfirm, showInfo } from '@/utils/tools';
import { PropType, defineComponent, onMounted, ref } from 'vue';
import { certificateTypeCodes, enum_cardTypes } from '../../add-student/enum';

export default defineComponent({
  props: {
    info: { type: Object as PropType<IListApproveToClazzRtn>, default: () => {} },
  },
  emits: ['onApprove'],
  setup(props, ctx) {
    const store = loginStore();

    const cardInf = ref({ text: '', cardNo: '' });
    const handleApprove = async (status: number) => {
      const cf = await showConfirm({ content: status === 1 ? '确定同意' : '确定要拒绝此申请吗?' });
      if (!cf) return;
      try {
        await approveRecord({
          status,
          approver: store?.userInfo?.id || '',
          applyIdList: [props.info.id],
        });
        ctx.emit('onApprove', status === 1);
      } catch (e: any) {
        showInfo(e.desc || '请求服务器失败');
      }
    };

    onMounted(() => {
      let applyStudentVo =
        props.info.applyStudentVoList && props.info.applyStudentVoList.length > 0
          ? props.info.applyStudentVoList[0]
          : { certificateNo: '', certificateType: -1, studentCode: '' };
      if (applyStudentVo) {
        log('applyStudentVo', applyStudentVo);
        const { certificateNo, certificateType, studentCode } = applyStudentVo;
        log('certificateType', certificateType);
        const isStudentCode =
          isNil(certificateType) || !certificateTypeCodes.includes(Number(certificateType));
        log('isStudentCode', isStudentCode);
        cardInf.value = {
          text: isStudentCode
            ? enum_cardTypes[1].label
            : enum_cardTypes.find(tmp => tmp.value === certificateType)?.label || '',
          cardNo: (isStudentCode ? studentCode : certificateNo) || '',
        };
      }
    });

    return { commonDateStr, handleApprove, cardInf };
  },
});
</script>
<style scoped lang="scss">
.flex {
  display: flex;
  align-items: center;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-grow {
  /** 填满剩余空间 */
  flex-grow: 1;
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
.card-style {
  margin: 0 32rpx;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
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
  border-radius: 16rpx;
}
.col-8 {
  width: 33.3333333333%;
}
</style>
