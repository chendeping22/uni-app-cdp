<template>
  <div class="location">  
      <div class='head'>
        <flexbox :gutter='9.5'>
            <flexbox-item :span="16/125" >  
            <div  class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div> 
            </flexbox-item>
            <flexbox-item :span="4/5">  
                <div @click="goSearch"><c-search placeholder="城市/拼音" ></c-search></div> 
            </flexbox-item> 
        </flexbox> 
      </div> 
      <div>
          
      <group :gutter='0'> 
        <cell>
          <p slot='title' class='now-city'>当前：东莞</p> 
          <div slot>
              <div  @click="chooseArea" class='choose-area'>选择区镇 <i class='choose-icon'></i></div>
          </div>
        </cell>
      </group>
      <group :gutter='0' v-if="show">  
        <cell v-for="item in area "    @click.native="onClick"> 
            <p slot='title' class='area'>{{item}}</p> 
            </cell> 
      </group>
      </div>
      <div class="main-box">
        <div class="location-main">
          <div class="location-show"> 
             <p>定位/最近访问</p>
             <div class="location-box"> 
                <flexbox :gutter="0">
                <flexbox-item :span='2/5'><div style='height:44px; padding-top:11px;padding-left:15px;' ><div class="location-icon" ><img src="/static/icon_positioning.png" alt=""></div></div></flexbox-item>
                <flexbox-item :span='3/5'><p>东莞</p></flexbox-item>
                </flexbox>  
             </div>
             <p>
                 热门城市
             </p> 
            <flexbox wrap="wrap" :gutter="0"> 
                <flexbox-item  :span="1/3" v-for="item in cityList" >
                    <div class="location-box" style="margin-bottom:10px;">  
                        <p>{{item}}</p>
                    </div>
                </flexbox-item>
            </flexbox>  
          </div>
      </div>
      <div class="location-list">
           <group v-for="item in areaList"  :title="item.letter" title-color="#5EE2C6">
                <cell v-for="itemC in item.childList " :title="itemC"  @click.native="onClick"></cell> 
            </group>
      </div>
        <div class='Letter-box'>  
            <p class='hot' v-for="item in LetterList" >{{item}}</p>
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
        LetterList:['定位','热门','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
        cityList:['深圳','广州','惠州','佛山','珠海','中山','清远','长沙','上海'],
        areaList:[
            {letter:'A',childList:[]},
            {letter:'B',childList:[]},
            {letter:'C',childList:['茶山','长安','常平']},
            {letter:'D',childList:['大岭山','大朗']}, 
            ],
        area:['茶山','长安','常平','大岭山','大朗','大岭山','大朗','大岭山','大朗','大岭山','大朗','大岭山','大朗','大岭山','大朗','大岭山','大朗','大岭山','大朗'],
        show:false
    }
  },
  watch:{},
  computed:{},
  methods:{
    turnUp:function(){ 
      this.$router.go(-1);
    }, 
    chooseArea:function(){
        console.log('来'); 
        this.show=!this.show;
    },
    goSearch:function(){
        console.log('进'); 
         this.$router.push('/home/location/search')
    }
    },
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
.weui-cell:before{
    right:15px;
} 
.weui-cells__title:after{ 
    content: " ";
    position: absolute;
    left: 0;
    bottom: 0; 
    height: 1px;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    left: 15px;
    right:15px;
}
.location{
    background: #F5F5F5;
}
.choose-area{
    color:#989898;
    font-size:12px;
}
.choose-icon{
    display:inline-block;
    width:0px;
    height:0px;
    border:4px solid transparent;
    border-top:4px solid #5EE2C6; 
    vertical-align: middle;
}
.now-city{
    color:#666;
    font-size:17px;
}
.main-box{
    position:relative;
}
.hot{
    text-align: center;
    font-size:10px;
    color:#5EE2C6;
    width:26px;
    line-height:19px;
}
.Letter-box{
    position: absolute;;
    top:15px;
    right:15px;
} 
.location-show{
    padding:0px 15px 15px;
}
.location-show>p{
    font-size:14px;
    color:#989898;
    line-height: 44px;
}
.location-box{
    width:100px;
    height:44px;
    background: #fff;
    border-radius: 3px;
}
.location-icon{
    width:15px;
    height:15px;   
}
.location-icon img{
    width:100%;
    height:100%;
}
.location-box p{
    line-height: 44px;
    font-size:14px;
    color:#666;
}
.location-box>p{
    text-align: center;
}
.area{
    font-size:12px;
    color:#666;
}
</style>