<template>
  <div>
      <c-head> 
        <div slot='left' >
            <div class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div>
        </div>
        <p slot='center' class='user-title'>设置</p>   
      </c-head>
        <div class='user-main'>
            <group :gutter='15'> 
            <cell is-link>
                <p slot='title'>账号</p>
                <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/set_icon_account.png"> 
            </cell>  
            </group>
            <group :gutter='15'> 
                <cell is-link>
                    <p slot='title'>修改密码</p>
                    <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/set_icon_password.png"> 
                </cell>   
                 <cell is-link>
                    <p slot='title'>帮助中心</p>
                     <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/set_icon_help.png">  
                </cell>   
                 <cell is-link>
                    <p slot='title'>意见反馈</p>
                    <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/set_icon_opinion.png">  
                </cell>   
                 <cell is-link>
                    <p slot='title'>关于蜡笔优学</p>
                    <img slot="icon" width="21" style="display:block;margin-right:10px;" src="/static/set_icon_about.png">  
                </cell>    
            </group>
            <group :gutter='10'>   
                <div>
                    <router-link to='' class='outLogin'>退出登陆</router-link>  
                </div>  
            </group>
        </div> 
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
  methods:{
      turnUp:function(){
      console.log('进入');
      this.$router.go(-1);
    }
  },
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.user-title{
    font-size:18px;
    color:#fff;
    text-align: center;
} 
.user-main p{
    font-size:14px;
    color:#666;
}
.outLogin{
    display:block;
    background: #fff;
    color:#F93B3B;
    line-height: 44px;
    font-size:14px;
    text-align: center;
}
</style>