<template>
  <div> 
    <div> 
        <router-link  to='/home/activity/userCommentDetail' class="comment">  
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
                <div class='count-com'>
                    <div class='write-box'>
                        <div class='com-icon'><span></span><img src="/static/icon_praise.png" alt=""></div> 
                        <p>评论</p>
                    </div>
                    <div class='love-box'>
                        <div  class='com-icon'><span></span><img src="/static/icon_comments.png" alt=""></div> 
                        <p>1234</p>
                    </div>
                </div>
            </div> 
        </router-link>
        <div class='bus-reply'>
            <div class='icon_reply'>
                <img src="/static/icon_reply.png" alt="">
            </div>
            <div>
                <p> <b>商家回应</b> &nbsp;感谢您对我校的关注和认可，感谢您对我校的关注和认可。</p>
            </div>
        </div>
        <router-link  to='/home/activity/userCommentDetail' class="comment">  
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
                <div class='count-com'>
                    <div class='write-box'>
                        <div class='com-icon'><span></span><img src="/static/icon_praise.png" alt=""></div> 
                        <p>评论</p>
                    </div>
                    <div class='love-box'>
                        <div  class='com-icon'><span></span><img src="/static/icon_comments.png" alt=""></div> 
                        <p>1234</p>
                    </div>
                </div>
            </div> 
        </router-link>
        <div class='bus-reply'>
            <div class='icon_reply'>
                <img src="/static/icon_reply.png" alt="">
            </div>
            <div>
                <p> <b>商家回应</b> &nbsp;感谢您对我校的关注和认可，感谢您对我校的关注和认可。</p>
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
        evalList:[
            { name:'环境好',value:'22'},
            { name:'超赞',value:'22'},
            { name:'教学质量高',value:'22'},
            { name:'超赞',value:'22'},
            { name:'教学质量高',value:'22'},
            { name:'交通方便',value:'22'},
            { name:'超赞',value:'22'},
            { name:'教学质量高',value:'22'},
            { name:'交通方便',value:'22'}
        ],
        star:5,
        picList:['/static/img_institutions05.png','/static/img_institutions05.png','/static/img_institutions05.png']
    }
  },
  watch:{},
  computed:{},
  methods:{
      
  },
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped> 
.bus-reply{
    background: #fff;
    padding:15px;
    display:flex;
    justify-content: space-end;
    border-bottom:1px solid #eee;
}
.bus-reply p{
    font-size:12px;
    color:#989898;
}
.icon_reply{
    width:25px;
    height:20px;
    margin-left:60px;
    margin-right:10px;
}
.icon_reply img{
    width:100%;
    height:100%;
    display:block;
}
.com-icon{  
    text-align: center;
    vertical-align:middle;   
    width:18px;
    height:15px;
    margin-right:3px;
}
.com-icon img{
    width:100%; 
    vertical-align: middle
} 
.com-icon span{height: 100%;vertical-align: middle;display: inline-block} 
.count-com{
    display:flex;
    justify-content:flex-end;
    margin-top:15px;
}
.count-com p{ 
    font-size:12px;
    line-height: 29px;
}
.write-box,.love-box{
    display:flex;
    width:75px;
    height:29px;
    border:2px solid #eee;
    padding:0 10px;
    border-radius: 15px;
}
.write-box{
    border-color:#FF6464;
    color:#FF6464;
    margin-right:10px;
} 
.love-box{
    border-color:#FBB03B;
    color:#FBB03B;
}
.eval-box{
    padding:10px 15px;
    border-bottom:1px solid #eee;
    background: #fff;
    overflow: hidden;
}
.eval-item{
    padding:3px 15px;
    border:2px solid #ccc;
    color:#ccc;
    border-radius: 15px;
    float:left;
    font-size:12px;
    margin:5px 0;
}
.eval-item:first-child{ 
    border-color:#5EE2C6;
    color:#5EE2C6;
}
.eval-item:not(:last-child){
    margin-right:15px;
}
.eval-box:after{ 
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