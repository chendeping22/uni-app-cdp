<template>
  <div class="fine">
      <c-head>  
        <div slot='left'>
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
        </div> 
        <div slot='center' class="head-title">热门推荐</div> 
    </c-head>   
    <div class="fine-banner">
        <img src="/static/img_activity01.png" alt="">
    </div> 
    <div class="popular">  
        <p>热门机构</p>  
    </div> 
    <div> 
        <div class="fine-panel fine-panel_access">
            <div class="fine-panel__bd">
                <router-link v-for="item in list" class='fine-media-box fine-media-box_appmsg'   to='' >
                    <div class="fine-media-box__hd">
                        <img :src="item.src" alt="">
                    </div>
                    <div class="fine-media-box__bd">
                        <h4 class="fine-media-box__title">{{item.title}}</h4>
                        <p class="fine-media-box__desc">{{item.desc}}</p>
                    </div>
                </router-link>
            </div> 
        </div>   
    </div> 
  </div>
  
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      list: [
        {
          src: "/static/img_institutions05.png",
          fallbackSrc: "http://placeholder.qiniudn.com/60x60/3cc51f/ffffff",
          title: "天使机构",
          desc: "天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年。",
          url: "/component/cell"
        },
        {
          src: "/static/img_institutions05.png",
          fallbackSrc: "http://placeholder.qiniudn.com/60x60/3cc51f/ffffff",
          title: "天使机构",
          desc: "天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年。",
          url: "/component/cell"
        },
        {
          src: "/static/img_institutions05.png",
          fallbackSrc: "http://placeholder.qiniudn.com/60x60/3cc51f/ffffff",
          title: "天使机构",
          desc: "天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年。",
          url: "/component/cell"
        },
        {
          src: "/static/img_institutions05.png",
          fallbackSrc: "http://placeholder.qiniudn.com/60x60/3cc51f/ffffff",
          title: "天使机构",
          desc: "天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年。",
          url: "/component/cell"
        },
        {
          src: "/static/img_institutions05.png",
          fallbackSrc: "http://placeholder.qiniudn.com/60x60/3cc51f/ffffff",
          title: "天使机构",
          desc: "天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年。",
          url: "/component/cell"
        },
        {
          src: "/static/img_institutions05.png",
          fallbackSrc: "http://placeholder.qiniudn.com/60x60/3cc51f/ffffff",
          title: "天使机构",
          desc: "天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年。",
          url: "/component/cell"
        },
        {
          src: "/static/img_institutions05.png",
          title: "天使机构",
          desc: "天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年，天使机构成立于2000年。",
          url: {
            path: "/component/radio",
            replace: false
          },
          meta: {
            source: "来源信息",
            date: "时间",
            other: "其他信息"
          }
        }
      ]
    };
  },
  watch: {},
  computed: {},
  methods: {
    turnUp: function() {
      console.log("进入");
      this.$router.go(-1);
    },
    onImgError(item, $event) {
      console.log(item, $event);
    }
  },
  created() {},
  mounted() {}
};
</script>
<style lang="less" scoped>
.fine {
  background: #eee;
}
.fine-banner {
  width: 100%;
  height: 175px;
}
.fine-banner img {
  width: 100%;
  height: 100%;
}
.popular {
  height: 44px;
  width: 100%;
  margin-top: 15px;
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
  font-size: 18px;
  color: #666666;
}
.fine-panel {
  background-color: #ffffff; 
  position: relative;
  overflow: hidden;
}
.fine-panel:before {
  content: " ";
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  height: 1px;
  border-top: 1px solid #e5e5e5;
  color: #e5e5e5;
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
}
.fine-panel:after {
  content: " ";
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 1px;
  border-bottom: 1px solid #e5e5e5;
  color: #e5e5e5;
  -webkit-transform-origin: 0 100%;
  transform-origin: 0 100%;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
}
.fine-media-box:before {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 1px;
    border-top: 1px solid #E5E5E5;
    color: #E5E5E5;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    left: 15px;
}
a.fine-media-box {
  color: #000000;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.fine-media-box_appmsg {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
}
.fine-media-box {
  padding: 10px 15px;
  position: relative;
}
.fine-media-box_appmsg .fine-media-box__hd {
  margin-right: 0.8em;
  width: 75px;
  height: 75px;
  line-height: 44px;
  text-align: center;
}
.fine-media-box__hd img {
  width: 100%;
  height: 100%;
}
.fine-media-box_appmsg .fine-media-box__thumb {
  width: 100%;
  height: 100%;
  vertical-align: top;
}
.fine-media-box_appmsg .fine-media-box__bd {
  -webkit-box-flex: 1;
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
}
.fine-media-box__title {
  color: #666;
  font-weight: 400;
  font-size: 18px;
  margin-bottom:5px;
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  word-wrap: break-word;
  word-break: break-all;
}
.fine-media-box__desc {
  color: #989898;
  font-size: 12px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: #ccc;
}
</style>