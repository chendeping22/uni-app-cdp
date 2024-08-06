<template>
  <mt-page title="疾病症状" :show-top-gap="false">
    <c-top class-name="bg-white plr-b ptb-b shadow">
      <c-search bg-type="fill-deep" @input="handlInput"></c-search>
    </c-top>
    <view v-if="categorys.length > 0" class="mtb-xl card" radius-type="none">
      <view>
        <view v-for="category in categorys" :key="category.id" class="mb-b">
          <view class="flex-between" @click="handleOpenTab(category.id)">
            <view class="font-title color-base">{{ category.name }}</view>
            <c-icon
              class-name="icon-color-gray"
              :name="categorysOfShow.includes(category.id) ? 'icon_arrow_up' : 'icon_arrow_down'"
              :size="48"
            ></c-icon>
          </view>
          <view v-show="categorysOfShow.includes(category.id)" class="flex-wrap">
            <view
              v-for="symptom in category.symptomList"
              :key="symptom.id"
              :class="[
                selectedSymptomIds.includes(symptom.id) ? 'item-actived' : '',
                'item',
                'mt-xs',
                'mr-xs',
                'tag',
              ]"
              @click="handleSelect(symptom)"
            >
              <view class="plr-b">{{ symptom.name }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <c-empty v-else bg-type="gray" />

    <c-bottom class-name="border-unset shadow">
      <view class="flex-between plr-b">
        <view class="text-vertical">已选 {{ selected.length ?? 0 }}</view>
        <u-button
          type="primary"
          width="160rpx"
          :disabled="selected?.length <= 0"
          @click="handleConfrim"
        >
          确定
        </u-button>
      </view>
    </c-bottom>
  </mt-page>
</template>

<script lang="ts" setup>
import { Disease_Management, useStore } from '@/store/old';
import { onLoad } from '@dcloudio/uni-app';
import { cloneDeep } from 'lodash-es';
import { computed, ref } from 'vue';
import mtPage from '../../components/mt-page/mt-page.vue';
import { fetchSicknessCategorys } from '../../services/disease-management';
import { CategoryItem, SymptomItem, SymptomItemInCategoryItem } from '../types/record';

const store = useStore();

const selected = ref<SymptomItem[]>([]);

const handleSelect = (symptom: SymptomItemInCategoryItem) => {
  const index = selected.value.findIndex(item => item.symptomId == symptom.id);

  if (index != -1) {
    selected.value.splice(index, 1);
  } else {
    selected.value.push({
      categoryId: symptom.categoryId,
      symptomId: symptom.id,
      symptomName: symptom.name,
    });
  }
};

const categorys = ref<CategoryItem[]>([]);

const categorysOfShow = ref<string[]>([]);

const handleOpenTab = (id: string) => {
  const index = categorysOfShow.value.findIndex(item => item === id);

  if (index != -1) {
    categorysOfShow.value.splice(index, 1);
  } else {
    categorysOfShow.value.push(id);
  }
};

const handleSicknessSearch = async (nameLike?: string) => {
  const res = await fetchSicknessCategorys({ name: nameLike ?? '' });
  categorys.value = res ?? [];
  categorysOfShow.value = res?.length ? [res[0].id] : [];
};

const timer = ref<any>();

const handlInput = (val: string) => {
  if (timer.value) clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    handleSicknessSearch(val);
  }, 300);
};

const selectedSymptomIds = computed(() => {
  return selected.value?.length ? selected.value.map(item => item.symptomId) : [];
});

const handleConfrim = () => {
  store.commit(Disease_Management.saveSymptomInfo, selected.value);
  uni.navigateBack();
};
onLoad(() => {
  handleSicknessSearch();
  selected.value = cloneDeep(store.state.diseaseManagement.symptomList) ?? [];
});
</script>

<style lang="scss" scoped>
.item {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 10rpx;
  text-align: center;
  border: 2rpx solid rgba(229, 230, 236, 1);
  &-actived {
    color: #176bfb;
    border-color: rgba(23, 107, 251, 1) !important;
  }
}
.card {
  background-color: white;
  margin-top: 30rpx;
  margin-bottom: 170rpx;
  padding: 20rpx 25rpx;
}
.icon-color-gray {
  color: gray;
}
.tag {
  min-width: 218rpx;
}
</style>
