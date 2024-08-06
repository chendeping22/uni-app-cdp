<template>
  <page custom-overflow="scroll">
    <u-navbar
      :custom-back="customBack"
      title="编辑应用"
      back-icon-color="black"
      title-color="black"
      :title-bold="true"
    >
    </u-navbar>
    <applicationCard
      v-for="(item, index) in applicationCategorys"
      :key="index"
      :list="item.applications"
      :is-hide-no-application="item.categoryId !== '-10000'"
      :is-drag="item.categoryId === '-10000'"
      :title="item.categoryName"
      :sub-title="item.categoryId === '-10000' ? '长按拖动' : ''"
      :sub-title-color="'#00000073'"
      :is-edit="true"
      :added-list="addedApplicationList"
      @change="changeAction"
      @add="addItemAction"
      @remove="removeItemAction"
    ></applicationCard>
    <view>
      <view :style="{ height: isHaveSafeBottom ? 104 + 'rpx' : 128 + 'rpx' }"></view>
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
    <view class="bottom">
      <view :class="['custom-button', isHaveSafeBottom ? '' : 'u-m-b-24']" @click="saveAction"
        >保存</view
      >
      <view class="u-fixed-placeholder safe-area-inset-bottom"> </view>
    </view>
  </page>
</template>

<script lang="ts">
import { updateFavoriteApplications } from '@/services/workbench';
import { IApplication, IApplicationCategory, workbenchStore } from '@/store/modules/workbench';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { cloneDeep } from '@/utils/lodash-es';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { computed, defineComponent, ref } from 'vue';
import applicationCard from './components/application-card.vue';
export default defineComponent({
  components: { applicationCard },
  props: {},
  setup() {
    // 获取主题色
    const primaryColor = getPrimaryColor();
    // store
    const store = workbenchStore();
    const isHaveSafeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom > 0;
    // 常见应用数据
    const applications = ref<IApplication[]>([...store.favoriteApplicationList]);
    // 常见应用类别列表
    const applicationCategorys = computed(() => {
      const favoriteApplicationCategoryList: IApplicationCategory[] = cloneDeep(
        store.applicationCategoryList || [],
      );
      const commonApplication = ref<IApplicationCategory>({
        categoryId: '-10000',
        categoryName: '收藏应用',
        applications: applications.value,
      });
      favoriteApplicationCategoryList.unshift(commonApplication.value);
      return favoriteApplicationCategoryList;
    });
    // 更新应用后的列表数据
    const addedApplicationList = ref<IApplication[]>(applications.value);
    const changeAction = (items: any[]) => {
      console.log('示例2数据发生变化：：', items);
      addedApplicationList.value = items.map(item => item.content);
    };
    // 新增
    const addItemAction = (item: IApplication) => {
      console.log('addItem', item.name);
      if (!applications.value.find(tempItem => tempItem.code === item.code)) {
        applications.value.push(item);
        console.log(applications.value);
      }
    };
    // 移除
    const removeItemAction = (item: IApplication) => {
      const oindex = applications.value.indexOf(item);
      console.log('remove===', oindex);

      if (oindex > -1) {
        applications.value.splice(oindex, 1);
        console.log(applications.value);
      }
    };
    // 保存
    const saveAction = async () => {
      try {
        showLoading();
        const codes = addedApplicationList.value.map(application => {
          console.log(application.code);
          return application.code;
        });

        const res = await updateFavoriteApplications(codes);
        console.log('res', res);
        hideLoading();
        uni.navigateBack({
          success: () => {
            if (isHaveChange()) {
              showInfo('已保存');
            }
            store.fetchFavoriteApplicationData(false);
          },
        });
      } catch (error) {
        hideLoading();
      }
    };

    const isHaveChange = () => {
      // 是否有改变
      let isChange = store.favoriteApplicationList.length != addedApplicationList.value.length;
      if (!isChange) {
        for (let i = 0; i < store.favoriteApplicationList.length; i++) {
          const application = store.favoriteApplicationList[i];
          if (addedApplicationList.value[i].code !== application.code) {
            isChange = true;
            break;
          }
        }
      }
      return isChange;
    };
    const customBack = () => {
      if (isHaveChange()) {
        uni.showModal({
          title: '内容还未保存，是否直接退出',
          content: '退出不会保存当前操作',
          confirmText: '退出',
          cancelText: '暂不',
          success: function (res) {
            if (res.confirm) {
              uni.navigateBack({
                fail(result) {
                  console.log('fail', result);
                },
              });
            }
          },
        });
      } else {
        uni.navigateBack({
          fail(result) {
            console.log('fail', result);
          },
        });
      }
    };
    return {
      primaryColor,
      isHaveSafeBottom,
      applicationCategorys,
      changeAction,
      addItemAction,
      saveAction,
      applications,
      removeItemAction,
      addedApplicationList,
      customBack,
    };
  },
});
</script>

<style scoped lang="scss">
:deep(.u-title) {
  font-weight: 500 !important;
}
:deep(.u-card) {
  border-radius: 16rpx;
}
:deep(.u-card__head--left) {
  padding: 26rpx 32rpx;
}
:deep(.u-card__head--right) {
  padding-right: 32rpx;
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;

  .custom-button {
    margin: 24rpx 32rpx 0;
    height: 80rpx;
    color: white;
    font-size: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: stretch;
    border-radius: 16rpx;
    background: $ui-color-primary;
  }
  .u-fixed-placeholder {
    /* #ifndef APP-NVUE */
    box-sizing: content-box;
    /* #endif */
  }
}
</style>
