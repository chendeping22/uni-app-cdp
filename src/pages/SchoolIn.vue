<template>
  <div class="act-detail">
      <div class='head'>
        <flexbox :gutter='0'>
            <flexbox-item :span="1/5" >  
            <div  class="return" @click='turnUp'>
                <img src="/static/btn_return.png" alt="">
            </div> 
            </flexbox-item>
            <flexbox-item :span="3/5">  
                 <p class="head-title">成光幼儿园1校</p>
            </flexbox-item> 
            <flexbox-item :span="1/5">  
                <flexbox :gutter='10'>
                <flexbox-item :span='1/3'><div class="detial-star" @click='collection'>
                    <img v-if='!isCollection' src="/static/btn_hollow_Focus.png" alt="">
                    <img v-if='isCollection' src="/static/btn_solid_Focus.png" alt="">
                    </div></flexbox-item>
                <flexbox-item :span='1/3'><div class="detial-share" @click='share'><img src="/static/btn_white_share.png" alt=""></div></flexbox-item>
                </flexbox>
            </flexbox-item> 
        </flexbox> 
      </div> 
        <div class="act-banner">
            <img src="/static/img_institutions01.png" alt=""> 
        </div>  
        <group :gutter="0">   
            <cell class="act-foot"> 
                <h4  slot='title' class="act-title">芝麻街英语（南城中心）</h4> 
                <div slot='title'  class='sch-star'>
                    <rater  v-model="star" :min="3" :font-size="16" :margin='0' ></rater> <span class="score"> 4分</span>
                </div> 
            </cell>   
            <cell is-link>
                <p slot='title' class="link-title">东莞123号</p>
                <p slot='title' class="link-distance">距离地铁站500米</p>
                <img slot="icon" width="16" style="display:block;margin-right:5px;" src="/static/icon_grey_positioning.png">
            </cell>
            <cell >
                <p slot='title' class="link-title">0769-1234567</p>
                <img slot="icon" width="16" style="display:block;margin-right:5px;" src="/static/icon_grey_phone.png">
            </cell> 
        </group>
        <router-link to="/school/intro" class="popular"> 
            <flexbox>
                <flexbox-item>
                <p>校园简介</p>
                </flexbox-item>
                <flexbox-item>
                    <div class="more">
                        <!-- <router-link to='/home/popular'> -->
                        <x-icon type="ios-arrow-forward" size="20"></x-icon> 
                        <!-- </router-link> -->
                    </div>
                </flexbox-item> 
            </flexbox>
        </router-link> 
        <div class="act-support"> 
            <flexbox>
                <flexbox-item>
                    <p class="sc-into">校园风采</p>
                </flexbox-item>
                <flexbox-item>
                    <div class="more">
                        <router-link to='/school/scenery'>
                            <span>查看更多</span><x-icon type="ios-arrow-forward" size="20"></x-icon> 
                        </router-link>
                    </div>
                </flexbox-item>  
            </flexbox>  
            <flexbox :gutter='15'>
                <flexbox-item> 
                    <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
                </flexbox-item>
                <flexbox-item> 
                    <div class="into-img"><img src="/static/img_institutions02.png" alt=""></div>
                </flexbox-item>  
            </flexbox>  
        </div> 
        <div class='teach-into'>
            <p>师资介绍</p>
             <flexbox>
                <flexbox-item v-for='item in list'> 
                    <div class="teach-box"> 
                        <div class="into-img"><img :src="item.src" alt=""></div>
                        <p style='font-size:12px;'>{{item.name}}</p>
                        <p style='font-size:9px;'>{{item.year}}</p>
                    </div>
                </flexbox-item> 
            </flexbox>  
        </div>
        <div class="user-evaluate"> 
            <div class='user-title'>
                <flexbox>
                    <flexbox-item>
                    <p>用户评价（20）</p>
                    </flexbox-item>
                    <flexbox-item>
                        <div class="more">
                            <!-- <router-link to='/home/popular'> -->
                            <x-icon type="ios-arrow-forward" size="20"></x-icon> 
                            <!-- </router-link> -->
                        </div>
                    </flexbox-item> 
                </flexbox> 
                <div class='user-score'>
                    <flexbox :gutter='0'>
                        <flexbox-item>
                            <div class='user-score-left'>
                                <p class='user-score-num'>5.0</p>
                                <div class="user-zh">
                                    <p>综合评分</p> 
                                    <rater  v-model="star1" :min="3" :font-size="16" :margin='0' ></rater>
                                </div>
                            </div>
                        </flexbox-item>
                        <flexbox-item> 
                            <div class='user-score-right vux-1px-l'> 
                                <p>高于99%同行</p>
                                <p>好评率96%</p>
                            </div>
                        </flexbox-item> 
                    </flexbox> 
                </div>
            </div>  
        </div> 
        <div>
        <router-view></router-view> 
        </div> 
        <router-link  to='/home/activity/userComment' class="comment">  
            <div class="com-img">
                <img src="/static/img_Head01.png" alt="">
            </div>
            <div class="com-box">
                <div class='title-box'>
                    <div class="com-user">
                        <p class="com-name">小丝瓜1365550099</p> 
                        <p class="com-date">8月1日</p>
                    </div> 
                    <div class="sorce-box">
                        <p class='sorce'>打分</p>
                        <rater v-model="star" :min="3" :font-size="16" :margin='0' ></rater>
                    </div>
                    </div> 
                <div class='com-con'> 
                    <p>如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。
                    </p>
                    <p style="text-align:right; padding-right:10px;">--爱因斯坦</p>
                </div>
                <div>
                    <router-link to='' class="com-all">全文</router-link>
                    <div class="pic-box"> 
                        <flexbox :gutter="5">
                            <flexbox-item v-for="item in picList" :span='91/283'><div class="com-pic"><img :src="item" alt=""></div></flexbox-item> 
                        </flexbox>
                    </div>
                </div>
            </div> 
        </router-link>
        <div class="comment">  
            <div class="com-img">
                <img src="/static/img_Head01.png" alt="">
            </div>
            <div class="com-box">
                <div class='title-box'>
                    <div class="com-user">
                        <p class="com-name">小丝瓜1365550099</p> 
                        <p class="com-date">8月1日</p>
                    </div> 
                    <div class="sorce-box">
                        <p class='sorce'>打分</p>
                        <rater v-model="star" :min="3"  :font-size="16" :margin='0' ></rater>
                    </div>
                    </div> 
                <div class='com-con'> 
                    <p>如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。如果你无法简洁的表达你的想法，说明你还不够来了解他。
                    </p>
                    <p style="text-align:right; padding-right:10px;">--爱因斯坦</p>
                </div>
                <div>
                    <router-link to='' class="com-all">全文</router-link>
                    <div class="pic-box"> 
                        <flexbox :gutter="5">
                            <flexbox-item v-for="item in picList" :span='91/283'><div class="com-pic"><img :src="item" alt=""></div></flexbox-item> 
                        </flexbox>
                    </div>
                </div>
            </div> 
        </div> 
        <div> 
            <group :gutter="0">   
                <cell is-link>
                    <p slot='title' class="look-more">查看更多</p> 
                    <p class='count'>共20条</p>
                </cell>
            </group>
        </div>
         <div class="sup-foot">  
            <flexbox :gutter="0">
                <flexbox-item> 
                    <router-link to='' :class="{active: isActive=='1'}"> 
                        <div>
                            <div class="sup-phone">
                                <div class='phone-icon'  v-if="isActive=='1'"><span></span><img src="/static/icon_whitephoto.png" alt=""></div>
                                <div class='phone-icon'  v-if="isActive!='1'"><span></span><img src="/static/icon_phone.png" alt=""></div>
                                <p>电话咨询</p>
                            </div>  
                        </div> 
                    </router-link>
                </flexbox-item>
                <flexbox-item> 
                    <router-link   to='' :class="{ active: isActive=='2'}">  
                        <div class="vux-1px-l"> 
                            <p>在线报名</p> 
                        </div>
                    </router-link>
                </flexbox-item> <flexbox-item> 
                    <router-link to='/school/commentDetails' :class="{ active: isActive=='3'}">  
                        <div class="vux-1px-l"> 
                            <p>马上评论</p> 
                        </div>
                    </router-link>
                </flexbox-item> 
            </flexbox> 
        </div>
        <div v-if='isShow' class='popContainer'>
            <div class='mask-box'> 
                <div class='mask'>
                    <p>分享到</p>
                    <div class='share-box'> 
                        <div v-for='share in shareList'>
                            <div class='share-img'><img :src="share.src" alt=""></div>
                            <p>{{share.name}}</p>
                        </div>
                    </div>   
                    <div class='share-box' style='padding-top:0px;'> 
                        <div>
                            <div class='share-img'><img src="/static/btn_sina.png" alt=""></div>
                            <p>新浪</p>
                        </div>
                    </div>  
                    <div class='cancel' @click='cancel'>取消</div>
                </div> 
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
        shareList:[
            {src:'/static/btn_WeChat.png',name:'微信'},
            {src:'/static/btn_Circle.png',name:'朋友圈'},
            {src:'/static/btn_qq.png',name:'QQ'},
            {src:'/static/btn_qqzone.png',name:'QQ空间'},
        ],
        list:[
            {
                src:'/static/img_image01.png',
                name:'李老师',
                year:'12年教龄'
            },{
                src:'/static/img_image01.png',
                name:'李老师',
                year:'12年教龄'
            },{
                src:'/static/img_image01.png',
                name:'李老师',
                year:'12年教龄'
            }
            ],
        isActive:1,
        star:4,
        star1:5,
        picList:['/static/img_institutions05.png','/static/img_institutions05.png','/static/img_institutions05.png'],
        isCollection:false,
        isShow:false
    }
  },
  watch:{},
  computed:{},
  methods:{
      share:function(){
          this.isShow=true;
      },
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
      this.$router.go(-1);
    },
    collection:function(){
        this.isCollection=!this.isCollection;
    },
    cancel:function(){
        this.isShow=false;
    }},
  created(){},
  mounted(){}
  
}
</script>
<style lang="less" scoped>
.share-box{
    display:flex;
    justify-content: space-between;
    padding:15px 15px 0px 15px;
}
div.share-box p{
    font-size:12px;
    color:#666; 
    border:none;
}
.share-img{
    width:40px;
    height:40px;
}
.share-img img{
    width:100%;
    height:100%;
}
.popular{
    display:block;
}
.mask{
    background: #fff;
    border-radius: 5px;
    position: absolute;
    bottom:0px;
    left:0px;
    width:100%;
}
.mask-box{
    position: relative;
    width:100%;
    height:100%;
}
.mask p,.cancel {
    line-height: 44px;
    color:#666;
    font-size:18px;
    text-align: center;
}
.mask p{
    border-bottom:1px solid #eee;
}
.cancel{
    border-top:1px solid #eee;
}
div.popContainer{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    padding:15px;
    z-index: 1000;
}

.sch-star{
    display: flex;
}
.user-zh{
    display:flex;
    flex-direction:column;  
    justify-content: center;  
}
.user-score-num{
    font-size:39px;
    color:#FBB03B;
    font-weight: bold;
    margin-right:5px;
}
.user-score-left{
    display:flex;
    justify-content: flex-end;
}
.user-score-right{
    padding-left:10px;
}
.user-evaluate{
    margin-top:10px;
    padding:0 15px;
    background: #fff;
}
.user-title{
    font-size:12px;
    color:#666;
    position: relative;
}
.user-title:after{
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
}
.teach-box>p{
    color:#666;
    text-align: center;
} 
.teach-into{
    padding:0 15px;
    background: #fff;
    margin-top:10px;
    padding-bottom:10px;
}
.teach-into>p{
    line-height: 44px;
    font-size:16px;
    color:#666;
}
.into-img{ 
    height:110px;
}
.into-img img{
    width:100%;
    height:100%;
}
.act-support p.sc-into{
    font-size:16px;
    color:#666;
    text-align: left;
}
.popular {
  height: 44px;
  width: 100%;
  margin-top: 10px;
  background: #fff;
  padding: 0 15px;
  position: relative;
}
.popular:before {
  content: "";
  background: #5EE2C6;
  width: 5px;
  height: 44px;
  position: absolute;
  top: 0;
  left: 0;
}
.popular p {
  line-height: 44px;
  font-size: 14px;
  color: #666666;
}
.more {
  text-align: right;
  font-size: 12px;
  line-height: 44px;
}
.more .vux-x-icon {
  fill: #cccccc;  
  vertical-align: middle;
} 
.more a span{ 
  color: #989898;
  vertical-align: middle;
  text-align: right;
  font-size:10px;
} 
.score{
    color:#FBB03B;
    font-size:12px;
    margin-left:10px;
}
.link-distance{
    color:#989898;
    font-size:12px;
} 
   .vux-1px-l:before{
    top:50%;
    transform: translateY(-13px);
    height:26px;
    border-color:#eee;
  } 
.act-detail{
    background:#EEEEEE;
}
.act-foot,.act-time,.act-support{
    background: #fff;
}
.detial-star{
    margin-left:8px;
    width:22px;
    height:22px;
    display:block;
}
.detial-share{
    width:22px;
    height:22px;
}
.detial-star img,.detial-share img{
    display:block;
    width:100%;
    height:100%;
}

  .act-banner{
      width:100%;
      height:175px; 
  }
  .act-banner img{
      width:100%;
      height:100%; 
  }
  .act-title{
        font-size:16px;
        color:#666;
        line-height: 36px;
        font-weight: normal;
    }
.act-status{
    width:44px;
    height:16px;
    background:#FC4D4D;
    border-radius: 8px;
    float:right;
}
div.act-status>p{ 
    color:#fff;
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
.act-foot{
    padding:5px 15px;
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
.link-title{
    color:#666;
    font-size:14px;
}
.weui-cell:before{ 
    right: 15px;
}
.yuan{
    color:#5EE2C6;
}
.act-time{
    display:flex;
    padding:10px 15px;
    position:relative;
}
.act-time:after{
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
    right: 15px;
}
.act-time:before{
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    left: 15px;
    right: 15px;
}
.time-icon{
    width:13px;
    height:46px;  
    text-align: center;
    vertical-align:middle;  
    margin-right:5px;
}
.time-icon img{
    width:100%; 
    vertical-align: middle
} 
.time-icon span{height: 100%;vertical-align: middle;display: inline-block}
.time-title{
    flex:1;
}
.time-title p{
    color:#666;
    font-size:14px;
}
.act-support{
    margin-top:10px;
    padding:15px;
    padding-top:0px;
}
.act-support p{
    text-align: center;
} 
.act-support span{
    color:#666;
    font-size:12px;
}
.sup-nav{
    margin-top:10px;
    background: #fff;
}
.sup-phone{
    display:flex;
    text-align: center; 
  align-items: center;
    justify-content:center;
} 
.phone-icon{
    width:16px;
    height:100%;
    text-align: center;
    vertical-align:middle;
    margin-right:3px;
} 
.phone-icon img{
    width:100%;
    height:100%;
    vertical-align: middle
} 
.phone-icon span{height: 100%;vertical-align: middle;display: inline-block}
.sup-foot{ 
  box-shadow: 0px -1px 3px #5EE2C6;
  margin-top:1px;
}
.sup-foot a{ 
    height:49px;
    background:#fff;
    color:#5EE2C6;
    text-align: center;
    display:block;
}
.sup-foot a>div{
    height:100%;
}
.sup-foot a:not(:first-child){
    border-left:1px solid #eee;
}
.sup-foot p{
    line-height: 49px;
}
a.active{
    background:#5EE2C6;
    color:#fff;
}
.tab-act{
    color:inherit;
    display:block;
    width:100%;
    height:100%;
}
p.sup-title{
  text-align: left; 
  font-size:16px;
  color:#666;
  margin-bottom:15px;
}
.look-more{
    color:#666;
    font-size:12px;
}
.count{
    color:#989898;
    font-size:10px;
}
.pic-box{
    margin-top:5px;
}
.com-all{
    color:#3667D7;
    font-size:12px;
}
.com-pic{
    width:91px;
    height:91px;
}
.com-pic img{ 
    width:100%;
    height:100%;
}
.vux-rater{
    display: flex;
}
.vux-rater a{ 
    display:block;
} 
.com-user{
    display:flex; 
}
.title-box{
    padding-bottom:15px;
}
.com-name{
    font-size:12px;
    color:#666;
    flex:1;
}
.sorce-box{
    display:flex;
}
.sorce{
    font-size:12px;
    color:#666;}
.com-date{
    color:#989898;
    font-size:10px;
} 
.comment{
    background: #fff;
    padding:15px;
    display:flex;
    position: relative;
}
.comment:after{
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
    right: 15px;
}
.com-img{
    width:50px;
    height:50px;
}
.com-img img{
    width:100%;
    height:100%;
    display:block;
}
.com-box{
    padding:10px 0px 0px 10px;
    flex:1;
}
.com-con p{ 
    font-size:12px;
     color:#666;
     line-height: 20px;
}
</style>