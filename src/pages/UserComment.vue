<template>
  <div>
    <c-head>  
        <div slot='left'>
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
        </div> 
        <div slot='center' class="head-title">用户评论</div> 
    </c-head> 
      <div class="sup-nav"> 
        <tab :line-width="1" custom-bar-width="80px"  @on-before-index-change="switchTabItem">
            <tab-item selected >
                <router-link class="tab-act" to='/home/activity/userComment/commentAll'>
                    全部(99)
                </router-link>
            </tab-item>
            <tab-item  class="vux-1px-l"> 
                <router-link class="tab-act" to='/home/activity/userComment/commentMap'>
                    晒图(50)
                </router-link>
                </tab-item>
            <tab-item  class="vux-1px-l">
                    <router-link class="tab-act" to=''>
                    低分
                </router-link>
            </tab-item> <tab-item  class="vux-1px-l">
                <router-link class="tab-act" to=''>
                 最新
            </router-link>
            </tab-item>
        </tab> 
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
    }
  },
  watch:{},
  computed:{},
  methods:{ turnUp: function() {
      console.log("进入");
      this.$router.go(-1);
    }, switchTabItem (index) {
      console.log('on-before-index-change', index)
      this.$vux.loading.show({
        text: 'loading'
      })
      setTimeout(() => {
        this.$vux.loading.hide()
        this.index01 = index
      }, 1000)
    }},
   
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
  .vux-1px-l:before{
    top:50%;
    transform: translateY(-13px);
    height:26px;
    border-color:#eee;
  }
.tab-act{
    color:#5EE2C6;
    display:block;
    width:100%;
    height:100%;
    font-size:12px;
}
</style>