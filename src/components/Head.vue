<template>
  <div class='head'>
    <flexbox :gutter='9.5'>
        <flexbox-item :span="16/125" > 
             <slot name="left"></slot>  
        </flexbox-item>
        <flexbox-item :span="52/75">  
             <slot name="center"></slot>  
        </flexbox-item>
        <flexbox-item :span="16/125">    
             <slot name="right"></slot>  
        </flexbox-item>
    </flexbox> 
  </div>
</template>

<script>
export default {
  name:'c-head',
  components:{},
  props:{},
  data(){
    return {
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
.head {
  height: 66px;
  padding: 30px 0 8px;
  background: linear-gradient(#A1FED6, #13C3B5);
}
</style>