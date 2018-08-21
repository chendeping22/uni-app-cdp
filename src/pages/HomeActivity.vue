<template>
  <div class='home-act'>
      <div class='head'>
        <flexbox :gutter='9.5'>
            <flexbox-item :span="16/125" >  
            <div  class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div> 
            </flexbox-item>
            <flexbox-item :span="4/5">  
                <div @click="goSearch"><c-search placeholder="搜索活动名称/类型" ></c-search></div> 
            </flexbox-item> 
        </flexbox> 
      </div>   
        <div> 
            <tab :line-width="1" custom-bar-width="100px"  @on-before-index-change="switchTabItem">
                <tab-item selected >全部</tab-item>
                <tab-item  class="vux-1px-l">报名中</tab-item>
                <tab-item class="vux-1px-l">历史举行</tab-item>
            </tab> 
        </div>
        <div class="act-main">
             <router-link to='/home/activity/detail' class="act-box">
                <div class="act-banner">
                    <img src="/static/act-banner.png" alt=""> 
                </div> 
                <flexbox :gutter="3">
                    <flexbox-item :span='11/13'> <h4 class="act-title">第一届幼学网幼儿接力比赛</h4></flexbox-item>
                    <flexbox-item :span='2/13'><div class="act-status"><p>报名中</p></div></flexbox-item>
                </flexbox>
                <div class="act-foot"> 
                    <flexbox>
                        <flexbox-item :span='1/3'><div><p>8月3日 12:00</p></div></flexbox-item> 
                        <flexbox-item :span='2/5'>  
                        <flexbox>
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item> 
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item>  
                        </flexbox> 
                        </flexbox-item>  
                    </flexbox>
                    </div>
            </router-link>
             <div to='/home/activity/detail' class="act-box">
                <div class="act-banner">
                    <img src="/static/act-banner.png" alt=""> 
                </div> 
                <flexbox :gutter="3">
                    <flexbox-item :span='11/13'> <h4 class="act-title">第一届幼学网幼儿接力比赛</h4></flexbox-item>
                    <flexbox-item :span='2/13'><div class="act-end"><p>已完结</p></div></flexbox-item>
                </flexbox>
                <div class="act-foot"> 
                    <flexbox>
                        <flexbox-item :span='1/3'><div><p>8月3日 12:00</p></div></flexbox-item> 
                        <flexbox-item :span='2/5'>  
                        <flexbox>
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item> 
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item>  
                        </flexbox> 
                        </flexbox-item>  
                    </flexbox>
                    </div>
            </div>
            <div class="act-box">
                <div class="act-banner">
                    <img src="/static/act-banner.png" alt=""> 
                </div> 
                <flexbox :gutter="3">
                    <flexbox-item :span='11/13'> <h4 class="act-title">第一届幼学网幼儿接力比赛</h4></flexbox-item>
                    <flexbox-item :span='2/13'><div class="act-status"><p>报名中</p></div></flexbox-item>
                </flexbox>
                <div class="act-foot"> 
                    <flexbox>
                        <flexbox-item :span='1/3'><div><p>8月3日 12:00</p></div></flexbox-item> 
                        <flexbox-item :span='2/5'>  
                        <flexbox>
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item> 
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item>  
                        </flexbox> 
                        </flexbox-item>  
                    </flexbox>
                    </div>
            </div>
             <div class="act-box">
                <div class="act-banner">
                    <img src="/static/act-banner.png" alt=""> 
                </div> 
                <flexbox :gutter="3">
                    <flexbox-item :span='11/13'> <h4 class="act-title">第一届幼学网幼儿接力比赛</h4></flexbox-item>
                    <flexbox-item :span='2/13'><div class="act-end"><p>已完结</p></div></flexbox-item>
                </flexbox>
                <div class="act-foot"> 
                    <flexbox>
                        <flexbox-item :span='1/3'><div><p>8月3日 12:00</p></div></flexbox-item> 
                        <flexbox-item :span='2/5'>  
                        <flexbox>
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item> 
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item>  
                        </flexbox> 
                        </flexbox-item>  
                    </flexbox>
                    </div>
            </div>
            <div class="act-box">
                <div class="act-banner">
                    <img src="/static/act-banner.png" alt=""> 
                </div> 
                <flexbox :gutter="3">
                    <flexbox-item :span='11/13'> <h4 class="act-title">第一届幼学网幼儿接力比赛</h4></flexbox-item>
                    <flexbox-item :span='2/13'><div class="act-status"><p>报名中</p></div></flexbox-item>
                </flexbox>
                <div class="act-foot"> 
                    <flexbox>
                        <flexbox-item :span='1/3'><div><p>8月3日 12:00</p></div></flexbox-item> 
                        <flexbox-item :span='2/5'>  
                        <flexbox>
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item> 
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item>  
                        </flexbox> 
                        </flexbox-item>  
                    </flexbox>
                    </div>
            </div>
             <router-link to='/home/activity/detail' class="act-box">
                <div class="act-banner">
                    <img src="/static/act-banner.png" alt=""> 
                </div> 
                <flexbox :gutter="3">
                    <flexbox-item :span='11/13'> <h4 class="act-title">第一届幼学网幼儿接力比赛</h4></flexbox-item>
                    <flexbox-item :span='2/13'><div class="act-end"><p>已完结</p></div></flexbox-item>
                </flexbox>
                <div class="act-foot"> 
                    <flexbox>
                        <flexbox-item :span='1/3'><div><p>8月3日 12:00</p></div></flexbox-item> 
                        <flexbox-item :span='2/5'>  
                        <flexbox>
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_eyes.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item> 
                            <flexbox-item >  
                                <flexbox :gutter="0">
                                    <flexbox-item :span='2/7'> <div class="act-icon"><img src="/static/icon_grey_comments.png" alt=""></div></flexbox-item> 
                                    <flexbox-item :span='5/7'><p>123456</p> </flexbox-item>  
                                </flexbox> 
                            </flexbox-item>  
                        </flexbox> 
                        </flexbox-item>  
                    </flexbox>
                    </div>
            </router-link>
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
      turnUp:function(){ 
      this.$router.push('/home');
    }, 
    // chooseArea:function(){
    //     console.log('来'); 
    //     this.show=!this.show;
    // },
    goSearch:function(){
        console.log('进'); 
         this.$router.push('/home/activity/search')
    }},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
.home-act{
    background: #fff;
}
  .vux-1px-l:before{
    top:50%;
    transform: translateY(-13px);
    height:26px;
    border-color:#eee;
  }
  .vux-tab .vux-tab-item{
      font-size:16px;
  }
  .act-main{
      padding:0 15px;
  }
  .act-box{
      padding-top:15px;
      display:block;
  }
  .act-banner{
      width:100%;
      height:175px;
      border-radius: 3px;
  }
  .act-banner img{
      width:100%;
      height:100%;
      border-radius: 5px;
  }
    .act-title{
        font-size:16px;
        color:#666;
        line-height: 29px;
        font-weight: normal;
    }
.act-status{
    width:44px;
    height:16px;
    background:#FC4D4D;
    border-radius: 8px;
}
.act-status p,
.act-end p{ 
    color:#fffefe;
    font-size: 8px;
    text-align: center;
    line-height: 16px;
}
.act-end{ 
    width:44px;
    height:16px;
    background:#ccc;
    border-radius: 8px;
}
  .act-foot p{
  font-size:10px;
  color:#ccc;
}
.act-icon{   
  width:16px;
  height:14px; 
}
.act-icon img{
  width:100%;
  height:100%;
  display:block;
}
</style>