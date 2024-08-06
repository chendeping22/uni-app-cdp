<template>
  <view v-if="!isHideNoApplication || list?.length > 0">
    <u-card margin="24rpx 33rpx" :border="false" :head-border-bottom="false" :show-head="true" :padding="0">
      <template #head>
        <view class="u-flex u-row-between">
          <view v-if="title" class="u-card__head--left u-flex u-line-1">
            <text class="u-card__head--left__title u-line-1" :style="{
              fontWeight: '500',
              fontSize: 34 + 'rpx',
              color: '#000000e0',
            }">
              {{ title }}
            </text>
          </view>
          <view v-if="subTitle" class="u-card__head--right u-line-1" @click="$emit('clickTitleRight', $event)">
            <text class="u-card__head__title__text" :style="{
              fontSize: '30rpx',
              color: subTitleColor,
            }">
              {{ subTitle }}
            </text>
          </view>
        </view>
      </template>
      <template #body>
        <u-grid :border="false" :col="isDrag ? 1 : column">
          <!--收藏应用长按带拖动-->
          <l-drag v-if="isDrag" ref="dragRef2" :list="list" :aspect-ratio="1.2214" :column="column" longpress
            @change="$emit('change', $event)">
            <template #grid="{ content }">
              <u-grid-item @click="$emit('remove', content)" :customStyle="{ padding: '0' }">
                <view class="grid-item-inner-box">
                  <u-image :src="content.icon" width="64" height="64" :show-loading="false" :error-icon="applicationIcon"
                    :fade="false"></u-image>
                  <view class="grid-text">{{ content.name }}</view>
                  <u-icon v-if="isEdit" name="close-circle-fill" color="#FF4D4F" :size="46" class="badge-icon"></u-icon>
                </view>
              </u-grid-item>
            </template>
          </l-drag>
          <!--应用列表-->
          <u-grid-item v-for="(item, index) in list" v-else :key="index" @click="$emit(isEdit ? 'add' : 'click', item)"
            :customStyle="{ padding: '0' }">
            <view class="grid-item-inner-box">
              <u-image :src="item.icon" width="64" height="64" :show-loading="false" :error-icon="applicationIcon"
                :fade="false"></u-image>
              <view class="grid-text">{{ item.name }}</view>
              <u-icon v-if="isEdit && !addedCodes.includes(item.code)" name="plus-circle-fill" color="#52C41A" :size="46"
                class="badge-icon"></u-icon>
            </view>
          </u-grid-item>
        </u-grid>
      </template>
    </u-card>
  </view>
</template>

<script lang="ts">
import applicationIcon from '@/static/application.png';
import type { IApplication } from '@/store/modules/workbench';
import { differenceWith, isEqual } from '@/utils/lodash-es';
import { computed, defineComponent, ref, watch } from 'vue';
import lDrag from '../../components/l-drag/l-drag.vue';
export default defineComponent({
  components: { lDrag },
  props: {
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
    subTitleColor: {
      type: String,
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    isDrag: {
      type: Boolean,
      default: false,
    },
    column: {
      type: Number,
      default: 4,
    },
    list: {
      type: Array<IApplication>,
      default: () => {
        return [];
      },
    },
    addedList: {
      type: Array<IApplication>,
      default: () => {
        return [];
      },
    },
    isHideNoApplication: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['change', 'click', 'clickTitleRight', 'add', 'remove'],
  setup(props) {
    const dragRef2 = ref(null);
    let oldValue = [...props.list];
    const addedCodes = computed(() => {
      return props.addedList.map(item => item.code);
    });
    watch(
      () => props.list,
      (newValue: IApplication[]) => {
        if (!props.isDrag) {
          return;
        }
        const addedItems = differenceWith(newValue, oldValue, isEqual);
        const removedItems = differenceWith(oldValue, newValue, isEqual);

        console.log('Added items:', addedItems);
        addedItems.forEach((value: IApplication) => {
          dragRef2.value?.push(value);
        });
        console.log('Removed items:', removedItems);
        removedItems.forEach((value: IApplication) => {
          const oindex = oldValue.indexOf(value);
          if (oindex > -1) {
            dragRef2.value?.remove(oindex);
          }
        });

        // 更新旧值以便下次比较
        oldValue = [...newValue];
      },
      { deep: true },
    );
    return { dragRef2, addedCodes, applicationIcon };
  },
});
</script>

<style scoped lang="scss">
.u-card {
  position: relative;
  overflow: hidden;
  font-size: 28rpx;
  background-color: #ffffff;
  box-sizing: border-box;

  &__head {
    &--left {
      color: $u-main-color;

      &__thumb {
        margin-right: 16rpx;
      }

      &__title {
        max-width: 400rpx;
      }
    }

    &--right {
      color: $u-tips-color;
      margin-left: 6rpx;
    }
  }
}

.grid-text {
  @include ellipsis;
  width: 100%;
  text-align: center;
  color: #000000a6;
  font-size: 26rpx;
  margin-top: 8rpx;
  padding-left: 16rpx;
  padding-right: 16rpx;
}

.badge-icon {
  position: absolute;
  top: 14rpx;
  right: 40rpx;
  width: 32rpx;
  height: 32rpx;
}

.grid-item-inner-box {
  height: 140rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
}
</style>
