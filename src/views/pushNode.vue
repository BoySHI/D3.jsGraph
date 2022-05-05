<!--
 * @Author: your name
 * @Date: 2021-12-06 17:18:57
 * @LastEditTime: 2022-02-14 11:24:42
 * @LastEditors: shiby
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vue-d3-graph-main的副本/src/views/pushNode.vue
-->
<template>
  <!--功能 1、d3力导向图-->
  <!--坑   1、d3之v6版d3.event事件已取消，改为在回调中作为参数 2、attr只能分开写，不能合并写，合并写不能渲染出属性 3、图形/text颜色用fill、line颜色用stroke-->
  <!--4、由于层级，先绘制线再节点  5、画布中的offsetX貌似是相对于svg 6、连线用path的一个原因是textpath元素href指向指定的path-->
  <!--5、父元素穿透：pointer-events:none 6、设置svg中的样式：加/deep/或者去掉scope 7、动态新增节点/箭头 8、自定义右击事件-->
  <div class="force-page">
    <div class="force-tip"
         v-show="isShowTip"
         :style="{'top':`${point&&point.top}px`,'left':`${point&&point.left}px`}">
      <ul>
        <li @click="delNode()">删除节点</li>
      </ul>
    </div>
    <el-button @click="addNode()">增加节点</el-button>
    <!-- <graphinReact /> -->
  </div>
</template>

<script>
import * as d3 from 'd3'
// import graphinReact from './../components/graphinReact.js'
export default {
  components: {
    // graphinReact
  },
  name: 'force-3',
  data () {
    return {
      isShowTip: false,
      point: null,
      nodesData: null,
      linksData: null,
      nodes: null,
      texts: null,
      links: null,
      simulation: null
    }
  },
  mounted () {
    this.drawForce()
  },
  methods: {
    drawForce () {
      // 数据
      const nodesData = [{ name: '桂林', id: 0 }, { name: '广州', id: 1 }, { name: '厦门', id: 2 }, { name: '杭州', id: 3 }, { name: '上海', id: 4 }, { name: '青岛', id: 5 }, { name: '天津', id: 6 }]
      this.nodesData = nodesData
      const linksData = [{ source: 0, target: 1 }, { source: 0, target: 2 }, { source: 0, target: 3 }, { source: 1, target: 4 }, { source: 1, target: 5 }, { source: 1, target: 6 }]
      this.linksData = linksData

      // 开始布局画图
      const width = 800
      const height = 600

      // 初始化力学仿真器
      const simulation = d3.forceSimulation(nodesData) // 使用指定的nodes创建一个新的没有任何力模型的仿真
        .force('link', d3.forceLink(linksData).id(d => d.id)) // 弹簧力，为仿真添加指定name的力模型并返回仿真
        .force('charge', d3.forceManyBody().strength(-2000)) // 电荷力/万有引力/多体力
        .force('center', d3.forceCenter(width / 2, height / 2)) // 向心力
        .on('tick', this.ticked.bind(this))
      this.simulation = simulation

      // 定义一个序数颜色比例尺
      var color = d3.scaleOrdinal(d3.schemeCategory10)

      // 添加svg标签
      // 1、attr只能分开写，不能合并写，合并写不能渲染出属性
      const svg = d3.select('.force-page')
        .append('svg')
        .attr('id', 'chart')
        .attr('width', width)
        .attr('height', height)
        .call(this.zoom())

      // 添加group
      const gWapper = svg.append('g')
        .attr('class', 'gWapper')
        .attr('cursor', 'pointer')
      // 绘制连线
      const links = gWapper.append('g') // root
        .selectAll('line') // dom
        .data(linksData) // model
        .enter()
        .append('line')
        .attr('stroke', 'blue')
        .attr('stroke-width', 1)
        .attr('marker-end', 'url(#arrow)')
      this.links = links
      // 绘制箭头
      // const arrow = gWapper.append('defs')
      //   .append('marker')
      //   .attr('id', 'arrow')
      //   .attr('markerWidth', 20)
      //   .attr('markerHeight', 20)
      //   .attr('refX', 8)
      //   .attr('refY', 8)
      //   .attr('orient', 'auto')
      //   .append('path')
      //   .attr('fill', 'red')
      //   .attr('d', 'M0 0 L8 8 L0 16Z')

      // 绘制节点
      const nodes = gWapper.append('g')
        .selectAll('circle')
        .data(nodesData)
        .enter()
        .append('circle')
        .attr('r', 20)
        .attr('opacity', 0.5)
        .attr('fill', (d, i) => {
          return color(i)
        })
        .call(this.drag)
        // 取消默认右击菜单，自定义菜单
        .on('contextmenu ', (event, d) => {
          event.preventDefault()
          this.isShowTip = true
          this.point = {
            left: event.offsetX,
            top: event.offsetY,
            data: d
          }
        })
      this.nodes = nodes

      // 绘制文字
      const texts = gWapper.append('g')
        .selectAll('text')
        .data(nodesData)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .text(d => d.name)
        .call(this.drag)
      this.texts = texts
    },
    addNode () {
      // 动态增加节点
      const newNodes = [{ name: '河北', id: 7 }, { name: '青岛', id: 8 }]
      const newLinks = [{ source: 7, target: 0 }, { source: 8, target: 1 }]
      for (const item of newNodes) {
        // const index = this.nodesData.findIndex(d => d.id === item.id)
        // if (index === -1) {
        //   this.nodesData.push(item)
        this.nodesData.push(item)
        // }
      }
      for (const item of newLinks) {
        // const index = this.linksData.findIndex(d => d.source.id === item.source && d.target.id === item.target)
        // if (index === -1) {
        //   // 新增连线
        //   this.linksData.push(item)
        // }
        this.linksData.push(item)
      }
      this.update('add')
    },
    update (addOrDel) {
      // 定义一个序数颜色比例尺
      var color = d3.scaleOrdinal(d3.schemeCategory10)
      console.log(this.nodes)
      console.log(this.nodesData)
      if (addOrDel === 'add') {
        this.nodes = this.nodes
          .data(this.nodesData, (d) => { console.log(d) })
          .enter()
          .append('circle')
          .merge(this.nodes)
        this.texts = this.texts
          .data(this.nodesData, (d) => d.name)
          .enter()
          .append('text')
          .merge(this.texts)
        this.links = this.links
          .data(this.linksData, (d) => {
            console.log(d)
            return d.source.name + '-' + d.target.name
          })
          .enter()
          .append('line')
          .merge(this.links)
      }
      this.nodes
        .attr('r', 20)
        .attr('opacity', 0.5)
        .attr('fill', (d, i) => {
          return color(i)
        })
        .call(d3.drag()
          .on('start', this.dragstart)
          .on('drag', this.dragged)
          .on('end', this.dragend)
        )

      this.texts = this.texts
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .text(function (d) {
          return d.name
        })
        .call(d3.drag()
          .on('start', this.dragstart)
          .on('drag', this.dragged)
          .on('end', this.dragend)
        )

      this.links = this.links
        .attr('stroke', d => {
          return d.isReverse ? 'none' : 'blue'
        })
        .attr('stroke-width', 1)
        .attr('marker-end', 'url(#arrow)')

      this.simulation.nodes(this.nodesData)
      this.simulation.force('link').links(this.linksData)
      this.simulation.alpha(1).restart()
      console.log(this.nodesData)
      console.log(this.linksData)
    },
    ticked () {
      // 虽然仿真系统会更新节点的位置(只是设置了nodes对象的x y属性)，但是它不会转为svg内部元素的坐标表示，这需要我们自己来操作
      this.links.attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      this.nodes.attr('cx', d => {
        return d.x
      })
        .attr('cy', d => d.y)

      this.texts.attr('x', d => d.x)
        .attr('y', d => d.y)
      if (this.simulation.alpha() < 0.2) {
        this.nodes.attr('cx', d => {
          d.fx = d.x
          return d.x
        }).attr('cy', d => {
          d.fy = d.y
          return d.y
        })
        this.simulation.stop()
      }
    },
    drag (simulation) {
      function dragstart (event, d) {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart()
        }
        d.fx = d.x
        d.fy = d.y
      }

      function dragged (event, d) {
        d.fx = event.x
        d.fy = event.y
      }

      function dragend (event, d) {
        if (!event.active) {
          simulation.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
      }

      return d3.drag()
        .on('start', dragstart)
        .on('drag', dragged)
        .on('end', dragend)
    },
    zoom () {
      // 定义缩放函数
      var zoom = d3.zoom()
        .scaleExtent([1, 10])// 用于设置最小和最大的缩放比例
        .on('zoom', zoomed)

      function zoomed (event) {
        d3.select('.gWapper').attr('transform', event.transform)
      }

      return zoom
    }

  }
}
</script>

<style lang="scss" scoped>
.force-page {
  width: 100%;
  height: 100%;
  position: relative;

  .force-tip {
    line-height: 20px;
    width: 100px;
    position: absolute;
    color: #fff;

    li {
      background: cadetblue;
      cursor: pointer;
    }
  }
}
</style>
