<template> 
  <div> 
    <!-- 头部 -->
    <div class="head"> 
      <flexbox :gutter='9.5'>
        <flexbox-item :span="16/125" >
          <div class="head-left">
            <!-- <x-icon type="ios-arrow-up" size="10"></x-icon>  -->
            <span>东莞</span>
            <x-icon type="ios-arrow-down" size="10"></x-icon>
          </div>
        </flexbox-item>
        <flexbox-item :span="52/75">
          <div class="search">
            <i class="weui-icon-search"></i>
            <input type="text" placeholder="搜索幼儿园/培训机构/俱乐部等"></div> 
        </flexbox-item>
        <flexbox-item :span="16/125"> 
            <!-- @on-item-click="consoleIndex()" -->
            <button-tab-item >
              登陆
            </button-tab-item>  
      </flexbox-item>
      </flexbox>  
    </div>  
    <!-- banner --> 
    <div class="banner-nav">
      <div class="ban"> 
        <div class="ban_img1 rotate">
          <flexbox :gutter="0">
            <flexbox-item :span="1/3">
              <a class="a1">
                <img src="/static/img_activity1.png"> 
              </a>
            </flexbox-item>
            <flexbox-item :span="1/3">
              <a class="a2 rotating mark">
                <img src="/static/img_activity2.png"> 
              </a>
            </flexbox-item>
            <flexbox-item :span="1/3">
              <a class="a3">
                <img src="/static/img_activity3.png"> 
              </a>
            </flexbox-item> 
          </flexbox> 
       </div>   
      </div> 
      <div class="nav">
        <flexbox :gutter="0">
          <flexbox-item>
            <a>
               <div class="nav-icon">
                  <img src="/static/home_btn_choose.png">
              </div>
              <p> 
                <span style="color:#6BB2FF;">择校</span>
              </p>
            </a>
          </flexbox-item>
          <flexbox-item>
             <a>
               <div class="nav-icon"> 
                  <img src="/static/home_btn_institutions.png">
               </div>
              <p>
                <span style="color:#FABA7A;">优秀机构</span></p>
            </a>
          </flexbox-item>
          <flexbox-item>
               <a> 
               <div class="nav-icon"> 
                 <img src="/static/home_btn_activity.png">
                </div> 
                <p ><span style="color:#EE8A8B;">亲子活动</span></p>
            </a>
          </flexbox-item>
          <flexbox-item>
            <a>
               <div class="nav-icon"> 
                <img src="/static/home_btn_daily.png">
              </div> 
              <p><span style="color:#FDAA7D;">宝宝日常</span></p>
            </a>
          </flexbox-item>
          <flexbox-item>
             <a>
               <div class="nav-icon"> 
                <img  src="/static/home_btn_integral.png">
              </div> 
              <p><span style="color:#FDAA7D;">积分入学</span></p>
            </a>
          </flexbox-item>
        </flexbox>
      </div>  
    </div>
    <div class="popular"> 
      <flexbox>
        <flexbox-item>
          <p>热门推荐</p>
        </flexbox-item>
        <flexbox-item>
          <div class="more">
            <a>
              <span>更多</span> 
              <x-icon type="ios-arrow-forward" size="10"></x-icon>
            </a>
          </div>
        </flexbox-item> 
      </flexbox>
    </div>
    <div class="popular-content">
      <div class="popular-box">
        <p>宝宝幼儿园招生</p> 
        <flexbox :gutter="15">
          <flexbox-item :span="10/23">
            <div class="popular-img"> 
              <img src="/static/img_institutions04.png" alt="">
            </div>
          </flexbox-item>
          <flexbox-item :span="12/23"> 
            <div class="text-box">
              <flexbox orient="vertical" :gutter="20">
                <flexbox-item :span="3/5">
                  <p class="text">生宝宝幼儿园招生宝宝幼儿园招生宝宝幼儿园招生宝儿园招生宝宝幼儿园招生</p>
                </flexbox-item>
                <flexbox-item :span="3/5"> 
                  <flexbox>
                    <flexbox-item>
                      <p class="date">17-06-28</p>
                    </flexbox-item>
                    <flexbox-item>  
                         <flexbox :gutter='2'>
                            <flexbox-item :span="5/7"> <p class="count">526742</p> </flexbox-item>
                            <flexbox-item><div class="eye"> <img src="/static/icon_eyes.png" alt=""></div></flexbox-item>
                          </flexbox>
                    </flexbox-item>
                  </flexbox>
                </flexbox-item>
              </flexbox>
            </div> 
          </flexbox-item> 
        </flexbox>
      </div>  
       <div class="popular-box">
        <p>宝宝幼儿园招生</p> 
        <flexbox :gutter="15">
          <flexbox-item :span="10/23">
            <div class="popular-img"> 
              <img src="/static/img_institutions04.png" alt="">
            </div>
          </flexbox-item>
          <flexbox-item :span="12/23"> 
            <div class="text-box">
              <flexbox orient="vertical" :gutter="20">
                <flexbox-item :span="3/5">
                  <p class="text">生宝宝幼儿园招生宝宝幼儿园招生宝宝幼儿园招生宝儿园招生宝宝幼儿园招生</p>
                </flexbox-item>
                <flexbox-item :span="3/5"> 
                  <flexbox>
                    <flexbox-item>
                      <p class="date">17-06-28</p>
                    </flexbox-item>
                    <flexbox-item>  
                         <flexbox :gutter='2'>
                            <flexbox-item :span="5/7"> <p class="count">526742</p> </flexbox-item>
                            <flexbox-item><div class="eye"> <img src="/static/icon_eyes.png" alt=""></div></flexbox-item>
                          </flexbox>
                    </flexbox-item>
                  </flexbox>
                </flexbox-item>
              </flexbox>
            </div> 
          </flexbox-item> 
        </flexbox>
      </div>
    </div>
  </div> 
</template> 
<style lang="less" scoped>
.flex-demo {
  text-align: center; /*文本居中显示*/
  color: #eee;
  background-color: #0077ff;
  border-radius: 6px; /*按钮的圆角弧度*/
}
.head-left {
  padding-right: 10px;
  // width: 29px;
  // height: 29px;
  text-align: right;
  border-radius: 5px; /*按钮的圆角弧度*/
  position: relative;
}
.head-left .vux-x-icon {
  position: absolute;
  right: -3px;
  top: 8px;
  fill: #fff;
}
.vux-button-tab-item {
  border: none;
  background: transparent;
  color: #fff;
  line-height: 29px;
  font-size: 12px;
}
.vux-button-tab-item:after {
  border: none;
}
.vux-button-group {
  border: none;
}
.head-left span {
  color: #fff;
  font-size: 12px;
}
.head-left ul {
  position: absolute;
  top: 0;
}
.search {
  position: relative;
}
.search .weui-icon-search {
  position: absolute;
  left: 10px;
  top: 9;
  line-height: 29px;
  font-size: 4px;
}
input[type="text"] {
  padding-left: 25px;
  width: 100%;
  height: 29px;
  border: none;
  border-radius: 5px;
  background: #f6f5f5;
  color: #666666;
}
input::placeholder {
  color: #ccc;
}
.banner-nav {
  background: #fff;
  padding-top: 0.9375rem;
  padding-bottom: 0.6875rem;
}
// 轮播样式
.ban {
  width: 100%;
  height: 10rem;
  overflow: hidden;
  position: relative;
  background: #fff;
  padding-bottom: 0.625rem;
}
.rotate {
  width: 260%;
  position: absolute;
  left: -80%;
}
.rotate a {
  width: 100%;
  height: 9.375rem;
  display: block;
  float: left;
  background: #f4f4f2;
  border-radius: 0.2rem;
  box-shadow: 0px 1px 3px #f4eb8b;
  transform: scale(0.93);
  -webkit-transform: scale(0.93);
  -moz-transform: scale(0.93);
  -o-transform: scale(0.93);
  -ms-transform: scale(0.93);
}
.rotate a img {
  width: 100%;
  height: 9.375rem;
  display: block;
  border-radius: 0.2rem;
}
.rotate .rotating {
  transform: scale(1);
  -webkit-transform: scale(1);
  -moz-transform: scale(1);
  -o-transform: scale(1);
  -ms-transform: scale(1);
}
.nav {
  padding: 0 15px;
}
.nav a {
  width: 100%;
  height: 100%;
  text-align: center;
  display: block;
}
.nav p {
  font-size: 0.75rem;
}
.nav-icon {
  width: 41px;
  height: 41px;
  display: inline-block;
}
.nav-icon img {
  width: 100%;
  height: 100%;
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
  background: #fbb03b;
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
  color: #cccccc;
  font-size: 12px;
  line-height: 44px;
}
.more .vux-x-icon {
  fill: #cccccc;
}
.popular-content {
  background: #fff;
}
.popular-box {
  height: 150px;
  width: 100%;
  padding: 10px 15px;
  background: url("/static/icon_recommended.png") no-repeat;
  background-position: 100% 0;
  background-size: 47px 47px;
  border-top:1px solid #EEEEEE;
}
.popular-box > p {
  font-size: 16px;
  color: #666666;
  margin-bottom:5px;
}
.popular-img {
  width: 100%;
  height: 100px;
}
.popular-img img {
  width: 100%;
  height: 100%;
}
.popular-box .text{
  font-size:12px;
  color:#666666;
}
.text-box{
  width:100%;
  padding-top:5px;
  height:100px;
} 
.eye{
  width:20px;
  height:20px;
}
.eye img{
  width:100%;
  height:100%;
}
.date{
  font-size:12px;
  color:#666666;
}
.count{
  font-size:12px;
  color:#FC8989;
  text-align: right;
}
</style>
<script>
import {
  XInput,
  Group,
  Search,
  ButtonTab,
  ButtonTabItem,
  Grid,
  GridItem
} from "vux";
export default {
  components: {
    XInput,
    Group,
    Search,
    ButtonTab,
    ButtonTabItem,
    Grid,
    GridItem
  },
  props: {},
  data() {
    return {
      autoFixed: false,
      selected: 3,
      select: 4,
      cityList: [
        { city: "广州", value: 1 },
        { city: "深圳", value: 2 },
        { city: "东莞", value: 3 },
        { city: "汕头", value: 4 },
        { city: "珠海", value: 5 },
        { city: "汕头", value: 6 },
        { city: "佛山", value: 7 },
        { city: "韶关", value: 8 },
        { city: "湛江", value: 9 },
        { city: "肇庆", value: 10 },
        { city: "江门", value: 11 },
        { city: "茂名", value: 12 },
        { city: "惠州", value: 13 },
        { city: "梅州", value: 14 },
        { city: "汕尾", value: 15 },
        { city: "河源", value: 16 },
        { city: "阳江", value: 17 },
        { city: "清远", value: 18 },
        { city: "中山", value: 19 },
        { city: "潮州", value: 20 },
        { city: "揭阳", value: 21 },
        { city: "云浮", value: 22 }
      ]
    };
  },
  watch: {},
  computed: {},
  methods: {},
  created() {},
  mounted() {}
};
</script>