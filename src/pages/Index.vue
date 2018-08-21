<template>
  <view-box ref="viewBox">
      <router-view></router-view>
    <!-- 底部选项卡 -->
    <tabbar slot="bottom" @on-index-change="onIndexChange" v-if="tabbarShow">
      <tabbar-item selected link="/home">
        <img slot="icon" src="/static/index.png">
        <img slot="icon-active"  src="/static/tad_Home_pre.png">
        <span slot="label">首页</span>
      </tabbar-item>
      <tabbar-item  link="/school">
        <img slot="icon" src="/static/school.png">
        <img slot="icon-active"  src="/static/tad_school_pre.png">
        <span slot="label">学校</span>
      </tabbar-item>
      <tabbar-item  link="/find">
        <img slot="icon" src="/static/find.png">
        <img slot="icon-active"  src="/static/tad_found_pre.png">
        <span slot="label">发现</span>
      </tabbar-item>
      <tabbar-item  link="/mine">
        <img slot="icon" src="/static/my.png">
        <img slot="icon-active"  src="/static/tad_my_pre.png">
        <span slot="label">我的</span>
      </tabbar-item>
    </tabbar>
  </view-box>
</template>

<style lang="less" scoped> 
.weui-tabbar:before{
  border-top-color: #5EE2C6; 
  box-shadow: 0px 0px 3px #5EE2C6;
}
</style>
<script> 
import {mapGetters, mapActions} from 'vuex'

export default {
 components:{ 
    },
    data() {
      return {
        select:"Home",
        tabbarShow:true
      }
    },
    // 计算属性
    computed:mapGetters([
      // 从 getters 中获取值
      // 'tabbarShow'
    ]),
    // 监听,当路由发生变化的时候执行
    watch:{
      // $route(to,from){
      //   if(to.path == '/' || to.path == '/home' || to.path == '/school' ||to.path == '/find'||to.path == '/mine'){
      //     /**
      //      * $store来自Store对象
      //      * dispatch 向 actions 发起请求
      //      */
      //     this.$store.dispatch('showTabBar');
      //   }else{
      //     this.$store.dispatch('hideTabBar');
      //   }
      // }
    },
    methods: {
      onIndexChange (newIndex, oldIndex) {
        console.log(newIndex, oldIndex);
      }
    }
}
</script>