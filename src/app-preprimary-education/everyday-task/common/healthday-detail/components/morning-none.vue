<template>
  <view class="flex padR padB">
    <c-image class="lh-0 mr-b" :src="iconInspection" :width="48" :height="48" />
    <view class="bold font-xt"> 晨午检 </view>
  </view>
  <view class="flex-around pt-b">
    <view v-for="(item, index) in list" :key="index" class="box p-all-b" @click="toDetail(item.id)">
      <view class="color-secondary font-content"> {{ item.name }} </view>
      <view
        v-if="item.value"
        :class="['font-xxt', item.value == 1 ? 'color-success' : 'color-error']"
      >
        {{ item.value == 1 ? '正常' : '异常' }}
      </view>
      <view v-else class="font-xxt"> / </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import iconInspection from '../../../../static/image/inspection_icon.png';

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  setup(props) {
    const inspectionCheckList = props.data.inspectionCheckList;
    const list = ref([
      {
        name: '晨检',
        value: '',
        code: 1,
        id: '',
      },
      {
        name: '午检',
        value: '',
        code: 2,
        id: '',
      },
      {
        name: '晚间',
        value: '',
        code: 3,
        id: '',
      },
    ]);

    const madeData = (type: number) => {
      const list = props.data.inspectionCheckList.filter(item => {
        if (item.code === type) {
          return item.id;
        }
      });
      return list[0]?.id;
    };

    watchEffect(() => {
      list.value = [
        {
          name: '晨检',
          value: props.data.morningStatus,
          code: 1,
          id:
            props.data?.inspectionCheckList && props.data?.inspectionCheckList.length > 0
              ? madeData(1)
              : '',
        },
        {
          name: '午检',
          value: props.data.noonStatus,
          code: 2,
          id:
            props.data?.inspectionCheckList && props.data?.inspectionCheckList.length > 0
              ? madeData(2)
              : '',
        },
        {
          name: '晚检',
          value: props.data.eveningStatus,
          code: 3,
          id:
            props.data?.inspectionCheckList && props.data?.inspectionCheckList.length > 0
              ? madeData(3)
              : '',
        },
      ];
    });
    const toDetail = (id: string) => {
      if (!id) {
        return;
      }
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/inspection-record/detail?id=${id}`,
      });
    };
    return {
      list,
      toDetail,
      iconInspection,
    };
  },
});
</script>

<style scoped lang="scss">
.box {
  height: 150rpx;
  width: 22%;
  background: #f8f8fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
