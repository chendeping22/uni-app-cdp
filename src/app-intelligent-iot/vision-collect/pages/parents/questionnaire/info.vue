<template>
  <view class="">
    <view class="questionnaire-bg">
      <image
        class="zy-width-full"
        src="../../../assets/image/img_questionnaire.png"
        mode="widthFix"
      ></image>
      <view class="questionnaire-bg--title zy-text-ellipsis-2">
        {{ pageData.quesName }}
      </view>
    </view>
    <view class="questionnaire-main">
      <zy-question :list="pageData.quesList" :disabled="pageData.isDisabled"></zy-question>
      <view v-if="!pageData.isDisabled" class="save-btn" hover-class="zy-hover" @click="submitData">
        提交
      </view>
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';
import { loginStore } from '@/store/modules/login';
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const userInfo = loginStore().userInfo;
const { proxy } = getPublicFuncProxy();
const pageData = reactive({
  isAnswer: '',
  quesName: '', // 问卷标题
  quesList: [], // 问卷列表
  queryForm: {
    questionnaireId: '',
    userId: '',
    role: 'parent',
  },
  isDisabled: false,
});

// 提交问卷
const submitData = data => {
  let status = false;
  pageData.quesList.forEach(item => {
    console.log('item', item);
    if (item.isRequired == '1' && !item.optionId && !item.answerContent) {
      console.log('item', item.type);
      if (item.type == '2') {
        proxy.$publicFunc.showToast('none', '请输入问题' + item.question + '答案');
      } else {
        proxy.$publicFunc.showToast('none', '请选择问题' + item.question + '选项');
      }
      status = true;
      return;
    }
    if (item.type == '2') {
      item.questionId = item.id;
    }
  });
  console.log('status', status);
  if (status) {
    return;
  }

  console.log('data', pageData.quesList);
  proxy.$publicFunc.showLoading('提交中...');
  pageData.queryForm.detailList = pageData.quesList;
  $http.questionaire
    .addRecordInGuardian(pageData.queryForm)
    .then(res => {
      console.log('res', res);
      proxy.$publicFunc.showToast('none', '提交成功');
      proxy.$publicFunc.hideLoading();
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
    });
};
// 获取问卷详情
const getPageList = () => {
  proxy.$publicFunc.showLoading('加载中...');
  $http.questionaire
    .getQuestionInGuardian(pageData.queryForm)
    .then(res => {
      pageData.quesList = res;
      if (pageData.isAnswer == '1') {
        getQuestionDetails();
      }
      proxy.$publicFunc.hideLoading();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
    });
};

// 获取问卷详情
const getQuestionDetails = () => {
  $http.questionaire
    .getQuestionDetailsInGuardian({
      questionnaireId: pageData.queryForm.questionnaireId, //问卷id
      userId: pageData.queryForm.userId, //用户id
    })
    .then(res => {
      pageData.quesList.forEach(item => {
        let index = res.questions.findIndex(i => i.id == item.id);
        if (index > -1) {
          if (item.type == '1') {
            const answer = res.questions[index].answer;
            let optionIndex = item.questionOptionList.findIndex(i => i.optionContent == answer);
            if (optionIndex > -1) {
              item.questionOptionList[optionIndex].checked = true;
            }
          } else if (item.type == '2') {
            item.answerContent = res.questions[index].answer || '未填写';
          } else if (item.type == '3') {
            const answer = res.questions[index].answer;
            const answerArr = answer.split(',');
            item.questionOptionList.forEach(topic => {
              let optionIndex = answerArr.findIndex(i => i == topic.optionContent);
              if (optionIndex > -1) {
                topic.checked = true;
              }
            });
          }
        }
      });
    })
    .catch(err => {});
};

onLoad(option => {
  pageData.quesName = option.name;
  pageData.queryForm.userId = userInfo.personId;
  pageData.queryForm.userName = userInfo.name;
  pageData.queryForm.phone = userInfo.phone;
  pageData.queryForm.questionnaireId = option.id;
  pageData.isAnswer = option.isAnswer;
  pageData.isDisabled = option.isAnswer == '1' || option.finish == '1';
  getPageList();
});
</script>

<style lang="scss" scoped>
.questionnaire-bg {
  position: relative;

  &--title {
    position: absolute;
    left: 60rpx;
    top: 60rpx;
    width: 380rpx;
    line-height: 60rpx;
    font-size: $zy-font-size40;
  }
}

.questionnaire-main {
  position: relative;
  margin: -185rpx 30rpx 30rpx;
}

.save-btn {
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  color: $zy-middle-color2;
  background: $zy-main-color;
  border-radius: 12rpx;
  margin-top: 60rpx;
}
</style>
