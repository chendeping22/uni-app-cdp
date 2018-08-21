<template>
  <div class="login">
    <c-head>  
        <div slot='left'>
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
        </div> 
        <div slot='center' class="head-title">登录</div> 
    </c-head> 
    <div class="form-box">
        <group :gutter="0">  
            <x-input name="mobile" class="mobile" placeholder="请输入您的手机号码" @on-change='getCode' v-model="mobileValue" keyboard="number" is-type="china-mobile"></x-input>  
            <x-input   placeholder="短信验证码" keyboard="number"  class="weui-vcode">
                <x-button slot="right" style="background: linear-gradient(#A1FED6, #13C3B5); color:#fff;" mini>发送验证码</x-button>
            </x-input>
        </group> 
        <div style="padding:15px;margin-top:54px;"> 
            <x-button :style="{'background':buttonColor,'color':'#fff'}">登录</x-button>
        </div>
    </div>
    </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
        mobileValue:'',
        buttonColor:'#ccc'
    }
  },
  watch:{},
  computed:{},
  methods:{
    turnUp: function() {
      console.log("进入");
      this.$router.go(-1);
    },
    getCode:function(){ 
        console.log(this.mobileValue);
        if(this.mobileValue){
            this.buttonColor='linear-gradient(#A1FED6, #13C3B5)'
        }else{ 
            this.buttonColor='#ccc'
        }
    }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.form-box{
    padding-top:54px;
}

.weui-cell::before{
    display:none;
}
.weui-cell:after{
    content: " ";
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    left: 15px;
}
input::placeholder{
     color:#ccc;
     font-size:14px;
}
</style>