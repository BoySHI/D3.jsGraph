<!--
 * @Author: your name
 * @Date: 2021-05-26 12:30:57
 * @LastEditTime: 2022-01-07 09:54:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /图谱最新预演代码/vue-d3-graph-main/src/views/3dView.vue
-->
<template>
  <div class="gContainer">
    <gSearch @getData="update"
             v-show='false' />
    <!-- <threeGraph /> -->
    <threeGraph :data="data"
                :names="names"
                :labels="labels"
                :linkTypes="linkTypes" />
  </div>
</template>

<script>
// @ is an alias to /src
import gSearch from '@/components/gSearch.vue'
import threeGraph from '@/components/threeGraph.vue'

export default {
  name: 'threeView',
  components: {
    gSearch,
    threeGraph
  },
  data () {
    return {
      // d3jsonParser()处理 json 后返回的结果
      data: {
        nodes: [],
        links: []
      },
      names: ['企业', '贸易类型', '地区', '国家'],
      labels: ['Enterprise', 'Type', 'Region', 'Country'],
      linkTypes: ['', 'type', 'locate', 'export']
    }
  },
  methods: {
    // 视图更新
    update (json) {
      console.log('update')
      console.log(json)
      this.d3jsonParser(json)
    },
    /*eslint-disable*/
    // 解析json数据，主要负责数据的去重、标准化
    d3jsonParser (json) {
      const nodes = []
      const links = [] // 存放节点和关系
      // 自己做的新的数据结构操作部分
      json.nodes.map(item => {
        nodes.push({
          id: item.identity,
          label: item.labels[0],
          data: item.data
        })
      })
      json.links.map(item => {
        console.log(item)
        links.push({
          source: item.start,
          target: item.end,
          type: item.type,
          data: item.data
        })
      })
      console.log(nodes)
      console.log(links)
      this.links = links
      this.nodes = nodes
      this.data = { nodes, links }
      // return { nodes, links }
    }
  }
}
</script>

<style lang="scss" scoped>
.gContainer {
  position: relative;
  border: 2px #000 solid;
  background-color: #9dadc1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
</style>
