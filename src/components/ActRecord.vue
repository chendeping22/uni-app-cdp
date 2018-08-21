<template>
  <div class="record">
    <flexbox wrap="wrap" :gutter="0"> 
        <flexbox-item  :span="1/2" v-for="item in recordList" >
            <div class="record-box" style="margin-bottom:10px;">  
                <img :src="item" alt="">
            </div>
        </flexbox-item>
    </flexbox>  
  </div>
</template>

<script>
export default {
  components:{},
  props:{},
  data(){
    return {
        recordList:[
            '/static/act-banner.png',
            '/static/act-banner.png',
            '/static/act-banner.png',
            '/static/act-banner.png',
            '/static/act-banner.png',
            '/static/act-banner.png'
        ]
    }
  },
  watch:{},
  computed:{},
  methods:{},
  created(){},
  mounted(){}
}
</script>
<style lang="less" scoped>
.record{
    padding:15px 0 15px 15px;
    background: #fff;
}
.record-box{
    height:115px;
    width:165px;
}

.record-box img{
    height:100%;
    width:100%;
}
</style>