<template>
  <div class='sc-intro'>
      <c-head>  
        <div slot='left'>
          <div  class="return" @click='turnUp'>
              <img src="/static/btn_return.png" alt="">
          </div>
        </div> 
        <div slot='center' class="head-title">学校简介</div> 
    </c-head> 
    <div class='intro-main'>
        <div class='intro-img'>
            <img src="/static/imh_logo.png" alt="">
        </div>
    </div>
    <div class='main'> 
        <p>
            温泉幼儿园是一所省优质幼儿园。拥有一支爱岗敬业、团结奋进、善于学习、勇于探索的教师队伍，
            园内设备齐全、功能完善，是一所集绿化、美化、净化、儿童化、教育化于一体的花园式儿童乐园。
            幼儿园以培养“活泼、健康、文明、好学”的幼儿为目标；以给幼儿一个幸福、快乐的童年，为幼儿营造积极、
            向上的氛围，让家长成为共育的能手
            ，教师与幼儿共同成长为办园宗旨。全园形成了“踏实严谨”的教风、“勤学好问、勇于探索”的学风、
            “团结、有序、求实、进取”的园风，赢得了良好的社会声誉。
        </p>
    </div>
    <div class='foot'>
        <p>地址：东莞市</p>
        <p>电话：12345678909</p>
        <p>邮箱：XXX@qq.com</p>
        <p>网址：www.xx.com</p> 
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
          this.$router.go(-1)
      }
  },
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.intro-img{
    width:100px;
    height:100px;
    margin:0 auto;
}
.intro-img img{ 
    width:100%;
    height:100%;
}
.intro-main{
    padding:15px;
}
.sc-intro{
    height:100%;
    background: #fff;
}
p{
    font-size:12px;
    color:#666;
    line-height: 20px;
    letter-spacing:2px;
    text-align:justify;
}
.main,.foot{
    padding:15px; 
}
</style>