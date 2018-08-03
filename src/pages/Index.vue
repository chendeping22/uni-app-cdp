<template>
  <view-box ref="viewBox">
      <router-view></router-view>
    <!-- 底部选项卡 -->
    <tabbar slot="bottom" @on-index-change="onIndexChange" v-if="tabbarShow">
      <tabbar-item selected link="/home">
        <img slot="icon" src="/static/index.png">
        <img slot="icon-active"  src="/static/indexOn.png">
        <span slot="label">首页</span>
      </tabbar-item>
      <tabbar-item  link="/school">
        <img slot="icon" src="/static/school.png">
        <img slot="icon-active"  src="/static/schoolOn.png">
        <span slot="label">学校</span>
      </tabbar-item>
      <tabbar-item  link="/find">
        <img slot="icon" src="/static/find.png">
        <img slot="icon-active"  src="/static/findOn.png">
        <span slot="label">发现</span>
      </tabbar-item>
      <tabbar-item  link="/mine">
        <img slot="icon" src="/static/my.png">
        <img slot="icon-active"  src="/static/myOn.png">
        <span slot="label">我的</span>
      </tabbar-item>
    </tabbar>
  </view-box>
</template>

<style lang="less" scoped> 
.weui-tabbar:before{
  border-top-color: #FBB03B;
}
</style>
<script>
import {Tabbar,TabbarItem} from 'vux'
import {mapGetters, mapActions} from 'vuex'

export default {
 components:{
      Tabbar,
      TabbarItem
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