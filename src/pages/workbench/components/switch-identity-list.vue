<template>
  <view class="container">
    <template v-for="(item, index) in locations" :key="item.userType">
      <u-cell-group
        :title="item.userType == 0 ? '教育工作者' : item.userType == 1 ? '学生' : '家长'"
        :title-style="{ 'font-size': 26 + 'rpx' }"
        :border="false"
      >
        <location-selector-list
          :locations="item.locations"
          :user-type="item.userType"
          :is-root="true"
          :is-show-last-line="isShowLastLine"
          :is-last-group="index === (locations.length || 0) - 1"
          :is-show-pre-login="isShowPreLogin"
          :keyword="keyword"
          @selectIdentityAction="selectIdentityAction"
        ></location-selector-list>
      </u-cell-group>
    </template>
  </view>
</template>
<script lang="ts">
import { IOrganization, loginStore, type IOrganizationInfo } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { isNil } from '@/utils/lodash-es';
import { defaultFailText } from '@/utils/request';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { defineComponent, toRefs } from 'vue';
import locationSelectorList from './location-selector-list.vue';

export default defineComponent({
  components: { locationSelectorList },
  props: {
    isShowLastLine: {
      type: Boolean,
      default: true,
    },
    isShowPreLogin: {
      type: Boolean,
      default: false,
    },
    locations: {
      type: Array<IOrganization>,
      default: () => [],
    },
    keyword: {
      type: String,
      default: '',
    },
  },
  emits: ['switchIdentityAction'],
  setup(props, { emit }) {
    // store
    const store = loginStore();
    const { currentUserType, currentOrganization } = toRefs(store);
    const primaryColor = getPrimaryColor();
    const selectIdentityAction = async (userType: number, organization: IOrganizationInfo) => {
      if (
        currentUserType.value === userType &&
        !isNil(currentOrganization.value) &&
        currentOrganization.value.id === organization.id &&
        currentOrganization.value.childId === organization.childId
      ) {
        emit('switchIdentityAction', true, userType, false);
      } else {
        try {
          showLoading();
          await store.changeIdentity(userType, organization);
          emit('switchIdentityAction', true, userType, true);
          hideLoading();
        } catch (error) {
          hideLoading();
          showInfo(defaultFailText(error));
          emit('switchIdentityAction', false, userType, false);
        }
      }
    };
    return {
      primaryColor,
      selectIdentityAction,
    };
  },
});
</script>

<style scoped lang="scss"></style>
