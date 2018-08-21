<template>
  <div>
    <!-- 头部 -->
    <c-head>   
      <div slot='left'> 
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
      </div>
      <div @click="goSearch" slot='center'><c-search  placeholder="搜索幼儿园/培训机构/俱乐部等"></c-search>  </div>
      <router-link slot='right' to='/school/screen' class='filter' >
        <img src="/static/school_btn_screening.png" alt="">
      </router-link> 
   </c-head>   
    <div> 
      <tab :line-width="1" custom-bar-width="80px"  @on-before-index-change="switchTabItem">
        <tab-item selected > 
          <router-link class="tab-act" to='/school/child'>学校
          </router-link>
        </tab-item>
        <tab-item  class="vux-1px-l"> 
          <router-link class="tab-act" to='/school/schoolInstitute'>培训机构
          </router-link>
        </tab-item>
        <tab-item class="vux-1px-l">
          <router-link class="tab-act" to='/school/schoolClub'>俱乐部
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
      type:1,
      list3: ['收到的消息', '发出的消息']
    }
  },
  watch:{},
  computed:{},
  methods:{
    switchTabItem (index) {
      console.log('on-before-index-change', index)
      this.$vux.loading.show({
        text: 'loading'
      })
      setTimeout(() => {
        this.$vux.loading.hide()
        this.index01 = index
      }, 1000)
    },
    onImgError (item, $event) {
      console.log(item, $event)
    },turnUp:function(){
      console.log('进入');
      this.$router.go(-1);
    },
    goSearch:function(){
        console.log('进'); 
         this.$router.push('/school/search')
    }
  },
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
.filter{
  display:block;
}
  .vux-1px-l:before{
    top:50%;
    transform: translateY(-13px);
    height:26px;
    border-color:#eee;
  }
  .weui-panel {
    margin-top:0;
  }
  .weui-panel:before{
    display:none;
  }  
.tab-act{
    color:inherit;
    display:block;
    width:100%;
    height:100%;
}
</style>