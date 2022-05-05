<!--
 * @Description:
 * @Author: shiby
 * @Date: 2021-05-26 12:30:57
 * @LastEditTime: 2022-02-18 17:44:50
 * @LastEditors: shiby
 * @Reference:
-->
/**
 * @description:
 * @param  {*}
 * @return {*}
 */

<template>
  <div>
    <!-- 绘制模式选择 -->
    <div id="mode">
      <div class="gState"
           style="margin-bottom: 20px;">
        <span @click="changeTextState(0)"
              :class="{ active: isShowText }"
              style="border-top-right-radius:0;border-bottom-right-radius:0;">显示</span>
        <span @click="changeTextState(2)"
              :class="{ active: textState === 2 }"
              style="border-top-left-radius:0;border-bottom-left-radius:0;position:relative;left:-5px;">隐藏</span>
      </div>
      <el-input @input="searchKeyWords"
                v-model="keywords"
                clearable
                placeholder="请输入搜索内容" />
      <p class="font-sky"
         style="text-align: left;">
        <strong>节点个数：{{ nodes.length }}</strong>
        <br>
        <strong>关系个数：{{ links.length }}</strong>
      </p>
      <div>
        <el-button @click="addnewNode()">新增关系</el-button>
        <el-button @click="delnewNode()">删除关系</el-button>
        <el-button @click="addHiddenNode()">增加隐性关系</el-button>
      </div>
    </div>
    <svg id="svg"
         width="1200"
         height="550"></svg>
    <!-- 绘制图例 -->
    <div id="indicator">
      <!-- 利用item 遍历一个数组 利用index 遍历另外一个数组 -->
      <!-- <div v-for="(name, index) in names"
           :key="index">
        <span @click="hideNodeOfType"
              :data-state="states[index]"
              :data-index="index"
              style="cursor: pointer;"
              :style="{ backgroundColor: states[index] === 'on' ? colors[index] : '#aaa' }"></span>
        {{ name }}
      </div> -->
    </div>
    <!-- 绘制右边显示结果 -->
    <div id="info"
         v-show="selectNodeData.name !== undefined">
      <el-card :style="{ backgroundColor: selectNodeData.color }"
               class="node-card">
        <div slot="header"
             class="clearfix">
          <span>{{ selectNodeData.name }}</span>
          <el-button @click="btnEdit"
                     style="float: right; padding: 3px 0;color: #409EFB;font-size: 15px;"
                     type="text">编辑</el-button>
        </div>
        <div v-for="(item, key) in selectNodeData.data"
             :key="item">
          <span style="margin-right: 8px;">{{ (nodeObjMap[key] ? nodeObjMap[key] : key) + ':' }}</span>
          <span style="text-align: right;"><b>{{ item }}</b></span>
        </div>
      </el-card>
    </div>
    <!-- 编辑框 -->
    <el-dialog :visible.sync="dialogFormVisible">
      <el-form :model="temp"
               label-position="right"
               label-width="86px"
               style="width: 500px; margin-left:50px;">
        <el-form-item v-for="(value, key) in temp"
                      :key="key"
                      :label="nodeObjMap[key] ? nodeObjMap[key] : key">
          <el-input v-model="temp[key]"
                    :readonly="!isEdit" />
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="cancelEdit">
          取消
        </el-button>
        <el-button type="primary"
                   @click="doEdit">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as d3 from 'd3'
import install from '@/plugins/d3-context-menu'
// const _ = require('lodash')
install(d3) // 为d3注册右键菜单插件
export default {
  name: 'd3graph',
  props: {
    data: {
      type: Object,
      default: function () {
        return {
          nodes: [],
          links: []
        }
      }
    },
    /* eslint-disable */
    // 自定义图例（数组保证一一对应）
    // names		图例名称变量制作图标
    // labels		节点的标签名称（与records.json中保证相同）
    names: {
      type: Array
    },
    labels: Array,
    linkTypes: Array
  },
  data () {
    return {
      svgDom: null, // svg的DOM元素 => d3.select('#svg1')
      keywords: '',
      nodeState: 0,
      // 文本状态，表示是否显示文本信息（0：显示/1：不显示）
      textState: 0,
      // d3render()最终展示到页面上的数据（节点隐藏功能）
      nodes: [],
      links: [],
      tpnodes: null,
      tplinks: null,
      tptexts: null,
      simulation: null,
      states: [],
      selectNodeData: {}, // 选中节点的详细信息展示
      isNodeClicked: false, // 是否点击（选中）节点
      temp: {}, // 临时存储编辑时的节点信息
      dialogFormVisible: false,
      isEdit: true,
      // 节点属性对应的标签名称  右下方的表格编辑
      nodeObjMap: {
        'address': '注册地址',
        'captial': '注册资本',
        'credit_code': '信用代码',
        'name': '节点名称',
        'setup_time': '注册日期'
      }
    }
  },
  computed: {
    isShowNode: function () {
      // `this` 指向 vm 实例
      return this.nodeState === 0
    },
    isShowText: function () {
      // `this` 指向 vm 实例
      return this.textState === 0
    },
    gDensity () {
      return this.nodes.length <= 1 ? 0 : (this.links.length / (this.nodes.length * (this.nodes.length - 1))).toFixed(2)
    },
    gDegree () {
      return (this.links.length / this.nodes.length).toFixed(2)
    },
  },
  watch: {
    // 当请求到新的数据时，重新渲染
    data (newData, oldData) {
      // 移除svg和元素注册事件，防止内存泄漏
      console.log(newData);
      this.svgDom.on('.', null)
      this.svgDom.selectAll('*').on('.', null)
      this.d3init()
    }
  },
  mounted () {
    this.d3init()
  },
  beforeDestroy () {
    // 移除svg和元素注册事件，防止内存泄漏
    this.svgDom.on('.', null)
    this.svgDom.selectAll('*').on('.', null)
  },
  methods: {
    // 编辑当前选中节点
    btnEdit () {
      this.temp = Object.assign({}, this.selectNodeData.data) // copy obj
      this.dialogFormVisible = true
      console.log(this.selectNodeData)
    },
    doEdit () {
      // console.log(this.data)
      let i = 0
      // 更新props的data 和 selectNodeData
      this.selectNodeData.name = this.temp.name
      this.selectNodeData.data = this.temp
      for (let node of this.data.nodes) {
        if (node.id == this.selectNodeData.id) {
          this.data.nodes[i].data = this.temp
          this.nodes[i].data = this.temp
          break
        }
        i++
      }
      this.dialogFormVisible = false
      this.d3init()
      this.$message({
        message: '更新成功',
        type: 'success'
      })
    },
    cancelEdit () {
      this.dialogFormVisible = false
    },
    // 隐藏文字
    changeTextState (state) {
      // state发生变化时才进行更新、处理
      if (this.textState !== state) {
        this.textState = state
        // const text = d3.selectAll('.texts text')
        const text = d3.selectAll('.linkTexts text')
        console.log(text)
        // 根据新的节点状态，在节点上展示不同的文本信息
        if (this.textState === 2) {
          text.style('display', 'none')
        } else {
          text.style('display', 'block')
        }
      }
    },
    // 隐藏该类型的所有节点（图例）
    hideNodeOfType (event) {
      if (this.nodes.length === this.data.nodes.length || this.states.some((state) => state === 'off')) {
        const index = event.target.dataset.index
        const state = event.target.dataset.state
        // 图例的状态切换（对应类型的节点隐藏）
        if (state === 'on') {
          // 隐藏该类型的所有节点及关联关系
          this.$set(this.states, index, 'off')
        } else {
          // this.states[index] = 'on'
          this.$set(this.states, index, 'on')
        }
        /**************************************
         * 状态更新后，同时对数据更新
         */
        const indexs = this.states.map(s => {
          if (s === 'on') {
            return '1'
          } else {
            return '0'
          }
        })
        // 遍历删除节点
        this.nodes = this.data.nodes.filter(node => {
          for (let i = 0; i < indexs.length; i++) {
            if (node.label === this.labels[i] && indexs[i] === '0') return false
          }
          return true
        })
        // 遍历删除关系
        this.links = this.data.links.filter(link => {
          for (let i = 0; i < indexs.length; i++) {
            if (i === 0 && indexs[i] === '0') return false
            else if (link.type === this.linkTypes[i] && indexs[i] === '0') return false
          }
          return true
        })
        // 调试时使用
        // console.log(indexs)
        // console.log(this.data.nodes.length, this.data.links.length)
        // console.log(this.nodes.length)
        // console.log(this.links.length)
        // 重新渲染
        this.d3render()
      } else {
        this.$message.error('展示全部节点时才能隐藏图例')
      }
    },
    /*eslint-disable*/
    // 搜索包含关键字的节点
    searchKeyWords (value) {
      // 如果Input值是空的显示所有的圆和线(没有进行筛选)
      if (this.keywords === '') {
        this.clearGraphStyle()
      }
      // 否则判断判断三个元素是否等于name值，等于则显示该值
      else {
        var name = this.keywords
        // 搜索所有的节点
        this.svgDom.select('.nodes').selectAll('circle').attr('class', d => {
          // 输入节点id的小写等于name则显示，否则隐藏
          // console.log(d);
          if (d.data.name.indexOf(name) >= 0) {
            return 'fixed'
          } else {
            // 优化：与该搜索节点相关联的节点均显示
            // links链接的起始节点进行判断,如果其id等于name则显示这类节点
            // 注意: graph=data
            for (var i = 0; i < this.links.length; i++) {
              // 如果links的起点等于name，并且终点等于正在处理的则显示
              if ((this.links[i]['source'].data.name.indexOf(name) >= 0) &&
                (this.links[i]['target'].id == d.id)) {
                return 'active'
              }
              // 如果links的终点等于name，并且起点等于正在处理的则显示
              if ((this.links[i]['target'].data.name.indexOf(name) >= 0) &&
                (this.links[i]['source'].id == d.id)) {
                return 'active'
              }
            }
            return 'inactive' // 隐藏
          }
        })
        // 搜索texts
        this.svgDom.select('.texts').selectAll('text').attr('class', d => {
          if (d.data.name.indexOf(name) >= 0) {
            return ''
          } else {
            // 优化：与该搜索节点相关联的节点均显示
            // links链接的起始节点进行判断,如果其id等于name则显示这类节点
            for (var i = 0; i < this.links.length; i++) {
              // 如果links的起点等于name，并且终点等于正在处理的则显示
              if ((this.links[i]['source'].data.name.indexOf(name) >= 0) &&
                (this.links[i]['target'].id == d.id)) {
                return ''
              }
              //如果links的终点等于name，并且起点等于正在处理的则显示
              if ((this.links[i]['target'].data.name.indexOf(name) >= 0) &&
                (this.links[i]['source'].id == d.id)) {
                return ''
              }
            }
            return 'inactive'
          }
        })
        // 搜索links
        // 显示相的邻边 注意 ||
        this.svgDom.select(".links").selectAll('path').attr('class', d => {
          if ((d.source.data.name.indexOf(name) >= 0) ||
            (d.target.data.name.indexOf(name) >= 0)
          ) {
            return ''
          } else {
            return 'inactive' //隐藏
          }
        })
        // 搜索linkTexts
        this.svgDom.select(".linkTexts").selectAll('text').attr('class', d => {
          if ((d.source.data.name.indexOf(name) >= 0) ||
            (d.target.data.name.indexOf(name) >= 0)
          ) {
            return ''
          } else {
            return 'inactive' //隐藏
          }
        })
      }
    },
    // d3初始化，包括数据解析、数据渲染
    d3init () {
      // console.log(this.data)
      this.links = this.data.links
      this.nodes = this.data.nodes
      console.log(this.links);
      this.svgDom = d3.select('#svg')  // 获取svg的DOM元素
      this.d3render()
    },
    // 数据状态初始化(初始化图例)
    // stateInit () {
    //   this.nodeState = 0
    //   this.textState = 0
    //   console.log(this.names)
    //   this.states = Array(this.names.length).fill('on')
    // },
    d3render () {
      var _this = this // 临时获取Vue实例，避免与d3的this指针冲突
      // 渲染前清空svg内的元素
      _this.svgDom.selectAll('*').remove()
      // svg.selectAll('g').remove()
      var svg = this.svgDom
        .on('click', () => {
          // console.log(this.isNodeClicked)
          this.isNodeClicked = false
          // 移除所有样式
          this.clearGraphStyle()
          // 如果此时有搜索关键字，则鼠标离开时保留原搜索选中的节点
          if (this.keywords !== '') {
            this.searchKeyWords()
          }
        })
        // 给画布绑定zoom事件（缩放、平移）
        .call(d3.zoom().on('zoom', event => {
          svg.selectAll('g')
          var scale = event.transform.k,
            translate = [event.transform.x, event.transform.y]
          // svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' + scale + ')');
          // 优化：代替原来画布的缩放和缩小，变成g，这样不会发生位置偏移
          g.attr('transform', event.transform)
        })
          .scaleExtent([0.05, 8]))//控制可缩放的最大值和最小值
        .on('dblclick.zoom', () => { // 解决双击画布，画布变大的问题
          return null
        })
        .append('g')
        .attr('width', '100%')
        .attr('height', '100%')
      // .selectAll('g')
      const g = svg.append('g')
      this.addMarkers()
      var force = d3
      // console.log(force);
      // 防碰撞
      var forceCollide = d3.forceCollide()
        // 碰撞力 防止重叠
        .radius(60)
        // .iterations(0.15)
        .iterations(2)
      // .strength(0.75)
      // 初始化力学仿真器 利用d3.forceSimulation()定义关系图 包括设置边link、排斥电荷charge、关系图中心点
      var simulation = d3.forceSimulation(this.nodes)
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-20))//引力
        .force("center", d3.forceCenter(svg.node().parentElement.clientWidth / 2, svg.node().parentElement.clientHeight / 2))//向心力
        .force("collision", forceCollide)
        .on('tick', this.ticked)
        .alpha(0.05) // 解决下钻
        .alphaMin(0.001)
      this.simulation = simulation
      // g用于绘制所有边,selectALL选中所有的line,并绑定数据data(graph.links),enter().append("line")添加元素
      var path = g.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(this.links).enter()
        .append("path")
        .attr("stroke-width", function (d) {
          return 2 //所有线宽度均为2
        })
        .join("path")
        .attr("marker-end", "url(#posMarker)")
        .attr('fill', 'transparent')
        .attr('stroke', 'rgba(66,28,28,1)')
      path.transition()
        // .delay(1000)// 动画的延时，毫秒单位
        .duration(2000)
        .attr('opacity', 1)
      this.tplinks = path
      var linksName = g.append("g")
        .attr("class", "linkTexts")
        .attr("fill-opacity", 1)
        .selectAll("text")
        .data(this.links)
        .join("text")
        .style('text-anchor', 'middle')
        // .attr('x', 20)// 连线上 文字到线的x距离
        .attr('y', '.31em') //连线上 文字到线的y距离
        .style('fill', '#fff')
        .style('font-size', '12px')
        // .style('font-weight', 'bold')
        .text(d => d.data.name)
      linksName.transition()
        // .delay(1000)// 动画的延时，毫秒单位
        .duration(2000)
        .attr('opacity', 1)
      // 添加所有的点
      // selectAll("circle")选中所有的圆并绑定数据,圆的直径为d.size
      // 再定义圆的填充色,同样数据驱动样式,圆没有描边,圆的名字为d.id
      // call()函数：拖动函数,当拖动开始绑定dragstarted函数，拖动进行和拖动结束也绑定函数
      var node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.nodes).enter()
        .append("circle").attr("r", function (d) {
          let size = 16
          switch (d.label) {
            case _this.labels[0]: break;
            case _this.labels[1]: size = 14; break;
            case _this.labels[2]: size = 13; break;
            default: size = 13; break;
          }
          return size * 2
        })
        .attr("fill", d => {
          for (let i = 0; i < this.labels.length; i++) {
            return d.data.color
          }
        })
        .attr("stroke", "none")
        .attr("name", d => d.data.name)
        .attr("id", d => d.id)
        .call(this.drag(simulation))
        .on("click", function () {
          _this.addnewNode()
        })
        .on('mouseenter', function (event) {
          // console.dir(this)
          const node = d3.select(this)
          //获取被选中元素的名字
          let name = node.attr("name")
          let id = node.attr("id")
          let color = node.attr('fill')
          // console.log(name, id, color)
          //设置#info h4样式的颜色为该节点的颜色，文本为该节点name
          _this.$set(_this.selectNodeData, 'id', id)
          _this.$set(_this.selectNodeData, 'name', name)
          _this.$set(_this.selectNodeData, 'color', color)

          //遍历查找id对应的属性
          for (let item of _this.nodes) {
            if (item.id == id) {
              _this.$set(_this.selectNodeData, 'data', item.data)
            }
          }
          // 遍历节点，并调整图的样式
          _this.changeGraphStyle(name)
        })
        .on('mouseleave', event => {
          // console.log(this.isNodeClicked)
          if (!this.isNodeClicked) {
            this.clearGraphStyle()
            // 如果此时有搜索关键字，则鼠标离开时保留原搜索选中的节点
            if (this.keywords !== '') {
              this.searchKeyWords()
            }
          }
        })
        .on('contextmenu', d3.contextMenu(this.menu))
      node.transition()
        // .delay(1000)// 动画的延时，毫秒单位
        .duration(2000)
        .attr('opacity', 1)
      this.tpnodes = node

      // 显示所有的文本
      // 设置大小、填充颜色、名字、text()设置文本
      // 使用 attr("text-anchor", "middle")设置文本居中
      var text = g.append("g")
        .attr("class", "texts")
        .selectAll("text")
        .data(this.nodes)
        .enter()
        .append("text").attr("font-size", () => 13)
        .attr("fill", () => '#fff')
        .attr('name', d => d.data.name)
        .attr("text-anchor", "middle")
        .attr('x', function (d) {
          return textBreaking(d3.select(this), d.data.name)
        })
        .call(this.drag(simulation))
        .on("click", nodeClick)
        .on('mouseenter', function (event) {
          // console.dir(this)
          const text = d3.select(this)
          // console.log(text)
          // 获取被选中元素的名字
          let name = text.attr("name")
          _this.$set(_this.selectNodeData, 'name', name)

          // 根据文本名称获取节点的id
          for (let item of _this.nodes) {
            if (item.data.name == name) {
              // 设置节点id和标签属性
              _this.$set(_this.selectNodeData, 'id', item.id)
              _this.$set(_this.selectNodeData, 'data', item.data)
              // 根据节点类型label获取节点颜色
              let index = 0
              switch (item.label) {
                case _this.labels[0]: break;
                case _this.labels[1]: index = 1; break;
                case _this.labels[2]: index = 2; break;
                default: index = 3; break;
              }
              // console.log(_this.selectNodeData);
              //_this.$set(_this.selectNodeData, 'color', _this.colors[index])
              _this.$set(_this.selectNodeData, 'color', _this.selectNodeData.color)
            }
          }
          _this.changeGraphStyle(name)
        })
        .on('mouseleave', (event) => {
          if (!this.isNodeClicked) {
            this.clearGraphStyle()
            // 如果此时有搜索关键字，则鼠标离开时保留原搜索选中的节点
            if (this.keywords !== '') {
              this.searchKeyWords()
            }
          }
        })

      text.transition()
        // .delay(1000)// 动画的延时，毫秒单位
        .duration(2000)
        .attr('opacity', 1)
      // text.insert('rect', 'text')
      //   .attr('width', function (d) {
      //     return d.data.name.length * 12;
      //   })
      //   .attr('height', function (d) {
      //     return 12;
      //   })
      //   .attr("y", "-.6em")
      //   .attr('x', function (d) {
      //     return -d.data.name.length * 12 / 2;
      //   })
      //   .style('fill', '#fff');
      this.tptexts = text

      // simulation中ticked数据初始化并生成图形
      simulation.on("tick", ticked)

      simulation.force("link")
        .links(this.links)
        .distance(d => { // 每一边的长度
          let distance = 20
          switch (d.source.label) {
            case _this.labels[0]: distance += 30; break;
            case _this.labels[1]: distance += 25; break;
            case _this.labels[2]: distance += 22; break;
            default: distance += 20; break;
          }
          switch (d.target.label) {
            case _this.labels[0]: distance += 30; break;
            case _this.labels[1]: distance += 25; break;
            case _this.labels[2]: distance += 22; break;
            default: distance += 20; break;
          }
          return distance * 2
        })
      this.dealRealtions(this.links)
      // ticked()函数确定link线的起始点x、y坐标 node确定中心点 文本通过translate平移变化(功能函数)
      function ticked () {
        /**
         * @description: svg的路径path：M表示move，A表示elliptical Arc 圆弧
         */
        path
          .attr('d', function (d) { //连接线
            var tan = Math.abs((d.target.y - d.source.y) / (d.target.x - d.source.x)); //圆心连线tan值
            var x1 = d.target.x - d.source.x > 0 ? Math.sqrt((tan * tan + 1)) + d.source.x :
              d.source.x - Math.sqrt(tan * tan + 1); //起点x坐标
            var y1 = d.target.y - d.source.y > 0 ? Math.sqrt(tan * tan / (tan * tan + 1)) + d.source.y :
              d.source.y - Math.sqrt(tan * tan / (tan * tan + 1)); //起点y坐标
            var x2 = d.target.x - d.source.x > 0 ? d.target.x - Math.sqrt((1 + tan * tan)) :
              d.target.x + Math.sqrt((1 + tan * tan));//终点x坐标
            var y2 = d.target.y - d.source.y > 0 ? d.target.y - Math.sqrt(tan * tan / (1 + tan * tan)) :
              d.target.y + Math.sqrt(tan * tan / (1 + tan * tan));//终点y坐标
            if (d.target.x - d.source.x == 0 || tan == 0) { //斜率无穷大的情况或为0时
              y1 = d.target.y - d.source.y > 0 ? d.source.y + 30 : d.source.y - 30;
              y2 = d.target.y - d.source.y > 0 ? d.target.y - 40 : d.target.y + 40;
            }
            if (d.linknum == 0) {//设置编号为0的连接线为直线，其他连接线会均分在两边
              d.x_start = x1;
              d.y_start = y1;
              d.x_end = x2;
              d.y_end = y2;
              return 'M' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2;
            }
            console.log(d.linknum === 0);
            // var a = 30 > 40 ? 40 * d.linknum / 3 : 30 * d.linknum / 3;
            var a;
            if (d.linknum > 0) {
              a = 30 * d.linknum / 3
            } else {
              a = 40 * d.linknum / 5
            }
            var xm = d.target.x - d.source.x > 0 ? d.source.x + Math.sqrt((a * a) / (1 + tan * tan)) :
              d.source.x - Math.sqrt((a * a) / (1 + tan * tan));
            var ym = d.target.y - d.source.y > 0 ? d.source.y + Math.sqrt((a * a) * tan * tan / (1 + tan * tan)) :
              d.source.y - Math.sqrt((a * a) * tan * tan / (1 + tan * tan));
            var xn = d.target.x - d.source.x > 0 ? d.target.x - Math.sqrt((a * a) / (1 + tan * tan)) :
              d.target.x + Math.sqrt((a * a) / (1 + tan * tan));
            var yn = d.target.y - d.source.y > 0 ? d.target.y - Math.sqrt((a * a) * tan * tan / (1 + tan * tan)) :
              d.target.y + Math.sqrt((a * a) * tan * tan / (1 + tan * tan));
            if (d.target.x - d.source.x == 0 || tan == 0) {//斜率无穷大或为0时
              ym = d.target.y - d.source.y > 0 ? d.source.y + Math.sqrt(a * a) : d.source.y - Math.sqrt(a * a);
              yn = d.target.y - d.source.y > 0 ? d.target.y - Math.sqrt(a * a) : d.target.y + Math.sqrt(a * a);
            }

            var k = (x1 - x2) / (y2 - y1);//连线垂线的斜率
            var dx = Math.sqrt(a * a / (1 + k * k)); //相对垂点x轴距离
            var dy = Math.sqrt(a * a * k * k / (1 + k * k)); //相对垂点y轴距离
            if ((y2 - y1) == 0) {
              dx = 0;
              dy = Math.sqrt(a * a);
            }
            if (a > 0) {
              var xs = k > 0 ? xm - dx : xm + dx;
              var ys = ym - dy;
              var xt = k > 0 ? xn - dx : xn + dx;
              var yt = yn - dy;
            } else {
              var xs = k > 0 ? xm + dx : xm - dx;
              var ys = ym + dy;
              var xt = k > 0 ? xn + dx : xn - dx;
              var yt = yn + dy;
            }
            //记录连线起始和终止坐标，用于定位线上文字
            d.x_start = xs;
            d.y_start = ys;
            d.x_end = xt;
            d.y_end = yt;
            return 'M' + xs + ' ' + ys + ' L ' + xt + ' ' + yt;
          })
          .on('click', (e, d) => {
            console.log("关系线的点击事件++++++++++++++++++++++");
          })
        // 更新关系线的名称
        linksName.attr("transform", function (d) {
          return "translate(" + (d.x_start + d.x_end) / 2 + "," + (d.y_start + d.y_end) / 2 + ")" + " rotate(" + Math.atan((d.y_end - d.y_start) / (d.x_end - d.x_start)) * 180 / Math.PI + ")";
        });
        // linksName.attr("y", function (d) {
        //   return (d.source.y + d.target.y) / 2 + d.linknum * 10;
        // });
        //更新连接线上文字的位置
        // linksName.attr("x", function (d) {
        //   return (d.source.x + d.target.x) / 2 + d.linknum * 10;
        // });
        // linksName.attr("y", function (d) {
        //   return (d.source.y + d.target.y) / 2 + d.linknum * 15;
        // });
        // .attr('transform', d => {
        // 方案一：此方案节点连线上的文字多关系会重叠 单独的关系显示正常
        // let x = Math.min(d.source.x, d.target.x) + Math.abs(d.source.x - d.target.x) / 2
        // let y = Math.min(d.source.y, d.target.y) + Math.abs(d.source.y - d.target.y) / 2 - 1
        // var linePadding = 0;  //给连线到节点间的距离
        // var deltaX = d.target.x - d.source.x,
        //   deltaY = d.target.y - d.source.y,
        //   dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        //   normX = deltaX / dist,
        //   normY = deltaY / dist;
        // var sourceX = d.source.x + (linePadding * normX),
        //   sourceY = d.source.y + (linePadding * normY),
        //   targetX = d.target.x - (linePadding * normX),
        //   targetY = d.target.y - (linePadding * normY);
        // let tanA = Math.abs(sourceY - targetY) / Math.abs(sourceX - targetX)
        // let angle = Math.atan(tanA) / Math.PI * 180
        // if (d.size === 2) {
        //   console.log(56565656565);
        //   return 'translate(' + x + ',' + y + ')' + 'rotate(' + 0 + ')'
        // } else {
        //   return 'translate(' + x + ',' + y + ')' + 'rotate(' + angle + ')'
        // }
        // 方案二：
        // let x = Math.min(d.source.x, d.target.x) + Math.abs(d.source.x - d.target.x) / 2
        // let y = Math.min(d.source.y, d.target.y) + Math.abs(d.source.y - d.target.y) / 2 - 1
        // let tanA = Math.abs(d.source.y - d.target.y) / Math.abs(d.source.x - d.target.x)
        // let angle = Math.atan(tanA) / Math.PI * 180
        // // 第一、二象限额外处理
        // if (d.source.x > d.target.x) {
        //   // 第二象限
        //   if (d.source.y <= d.target.y) {
        //     angle = -angle
        //   }
        // } else if (d.source.y > d.target.y) {
        //   // 第一象限
        //   angle = -angle
        // }
        // // console.log(d.size);
        // if (d.size >= 1) {
        //   return 'translate(' + ((d.source.x + d.target.x) / 2 + d.linknum * 10) + ',' + ((d.source.y + d.target.y) / 2 + d.linknum * 15) + ')' + 'rotate(' + 0 + ')'
        // } else {
        //   return 'translate(' + x + ',' + y + ')' + 'rotate(' + angle + ')'
        // }
        // })
        // 实现节点不跑出画布外边 此处是写死的宽（1000）和高（1200）
        _this.nodes.forEach(function (d, i) {
          d.x = d.x - 45 < 0 ? 45 : d.x;
          d.x = d.x + 45 > 1000 ? 1000 - 45 : d.x;
          d.y = d.y - 45 < 0 ? 45 : d.y;
          d.y = d.y + 45 > 1200 ? 1200 - 45 : d.y;
        });
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
        //更新节点上文字的位置
        text.attr('transform', function (d) {
          let size = 15
          switch (d.label) {
            case _this.labels[0]: break;
            case _this.labels[1]: size = 14; break;
            case _this.labels[2]: size = 13; break;
            default: size = 12; break;
          }
          size -= 5
          return 'translate(' + (d.x - size / 2 + 3) + ',' + (d.y + size / 2) + ')'
        })
        // this.stop()
      }

      /**
       * 文本分隔（根据字数在当前选择器中分隔三行，超过10字省略）
       * @method textBreaking
       * @param {d3text} 文本对应的DOM对象
       * @param {text} 节点名称的文本值
       * @return {void}
       */
      function textBreaking (d3text, text) {
        const len = text.length
        if (len <= 3) {
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', 2)
            .text(text)
        } else {
          const topText = text.substring(0, 3)
          const midText = text.substring(3, 7)
          let botText = text.substring(7, len)
          let topY = -16
          let midY = 0
          let botY = 16
          if (len <= 7) {
            topY += 10
            midY += 10
          } else if (len > 10) {
            botText = text.substring(7, 9) + '...'
          }

          d3text.text('')
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', topY)
            .text(function () {
              return topText
            })
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', midY)
            .text(function () {
              return midText
            })
          d3text.append('tspan')
            .attr('x', 0)
            .attr('y', botY)
            .text(function () {
              return botText
            })
        }
      }
      // 分别定义节点和文本的点击事件
      // 优化：由于点击前必定触发mouseenter事件，所以不用再去查找节点id
      //      直接根据this.selectNodeData拿到节点信息
      // 优化后：只需定义一个点击事件即可
      function nodeClick (event, d) {
        console.log(454545454);
        // 直接通过this.selectNodeData拿到节点信息
        event.cancelBubble = true
        event.stopPropagation() // 阻止事件冒泡

        const name = _this.selectNodeData.name
        _this.isNodeClicked = true
        _this.changeGraphStyle(name)

        return false
      }


    },
    // 根据当前节点名称来更改图样式
    changeGraphStyle (name) {
      // console.log(this.isNodeClicked)
      // 选择#svg1 .nodes中所有的circle，再增加个class
      this.svgDom.select('.nodes').selectAll('circle').attr('class', d => {
        // 节点属性name是否等于name，返回fixed（激活选中样式）
        if (d.data.name == name) {
          return 'fixed'
        }
        // 当前节点返回空，否则其他节点循环判断是否被隐藏起来(CSS设置隐藏)
        else {
          // links链接的起始节点进行判断,如果其id等于name则显示这类节点
          // 注意: graph = data
          for (var i = 0; i < this.links.length; i++) {
            // 如果links的起点等于name，并且终点等于正在处理的则显示
            if (this.links[i]['source'].data.name == name && this.links[i]['target'].id == d.id) {
              return 'active'
            }
            if (this.links[i]['target'].data.name == name && this.links[i]['source'].id == d.id) {
              return 'active'
            }
          }
          return this.isNodeClicked ? 'inactive' : ''
        }
      })
      // 处理相邻的文字是否隐藏
      this.svgDom.select('.texts').selectAll('text')
        .attr('class', d => {
          // 节点属性name是否等于name，返回fixed（激活选中样式）
          if (d.data.name == name) {
            return ''
          }
          // 当前节点返回空，否则其他节点循环判断是否被隐藏起来(CSS设置隐藏)
          else {
            // links链接的起始节点进行判断,如果其id等于name则显示这类节点
            // 注意: graph = data
            for (var i = 0; i < this.links.length; i++) {
              // 如果links的起点等于name，并且终点等于正在处理的则显示
              if (this.links[i]['source'].data.name == name && this.links[i]['target'].id == d.id) {
                return ''
              }
              if (this.links[i]['target'].data.name == name && this.links[i]['source'].id == d.id) {
                return ''
              }
            }
            return this.isNodeClicked ? 'inactive' : ''
          }
        })
      // 处理相邻的边line是否隐藏 注意 ||
      this.svgDom.select(".links").selectAll('path')
        .attr('class', d => {
          if (d.source.data.name == name || d.target.data.name == name) {
            return 'active'
          } else {
            return this.isNodeClicked ? 'inactive' : ''
          }
        })
        .attr('marker-end', d => {
          if (d.source.data.name == name || d.target.data.name == name) {
            return 'url(#posActMarker)'
          } else {
            return 'url(#posMarker)'
          }
        })
      // 处理相邻的边上文字是否隐藏 注意 ||
      this.svgDom.select(".linkTexts").selectAll('text')
        .attr('class', d => {
          if (d.source.data.name == name || d.target.data.name == name) {
            return 'active'
          } else {
            return this.isNodeClicked ? 'inactive' : ''
          }
        })
    },
    clearGraphStyle () {
      // 移除所有样式
      this.svgDom.select('.nodes').selectAll('circle').attr('class', '')
      this.svgDom.select(".texts").selectAll('text').attr('class', '')
      this.svgDom.select('.links').selectAll('path').attr('class', '').attr('marker-end', 'url(#posMarker)')
      this.svgDom.select(".linkTexts").selectAll('text').attr('class', '')
      // d3.select(this).attr('class', '')
    },
    drag (simulation) {
      function dragsubject (event) {
        return simulation.find(event.x, event.y);
      }

      function dragstarted (event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged (event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended (event) {
        if (!event.active) simulation.alphaTarget(0);
        // 注释以下代码，使拖动结束后固定节点
        // event.subject.fx = null;
        // event.subject.fy = null;
      }
      return d3.drag()
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    },
    // 绘制关系箭头
    addMarkers () {
      // 定义箭头的标识
      var defs = this.svgDom.append("defs")
      const posMarker = defs.append("marker")
        .attr("id", "posMarker")
        .attr("orient", "auto") // 绘制的方向
        .attr("stroke-width", 2) // 箭头的宽度
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 31) //箭头坐标 调节箭头距离节点的距离的大小  越大距离越远
        .attr("refY", 0)
        .attr("markerWidth", 12)  //标识的大小
        .attr("markerHeight", 12)
        .append("path")
        .attr("d", "M 0 -5 L 10 0 L 0 5")
        .attr('fill', '#e0cac1')
        .attr("stroke-opacity", 0.6);
      const posActMarker = defs.append("marker")
        .attr("id", "posActMarker")
        .attr("orient", "auto")
        .attr("stroke-width", 2)
        .attr("markerUnits", "strokeWidth")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 31)
        .attr("refY", 0)
        .attr("markerWidth", 12)
        .attr("markerHeight", 12)
        .append("path")
        .attr("d", "M 0 -5 L 10 0 L 0 5")
        .attr('fill', '#1E90FF')
        .attr("stroke-opacity", 0.6);
    },
    // 新增节点
    addnewNode () {
      let tempNode = [{
        id: 6,
        labels: [
          "我行账户"
        ],
        data: {
          name: "新增节点1",
          color: "#333"
        }
      },
      {
        id: 12,
        labels: [
          "我行账户"
        ],
        data: {
          name: "新增节点12",
          color: "#333"
        }
      }]
      let tempLink = [{
        id: 3,
        source: 1,
        target: 9,
        type: "export",
        data: {
          name: "新增节点连线1"
        }
      },
      {
        id: 3,
        source: 3,
        target: 6,
        type: "export",
        data: {
          name: "新增节点连线2"
        }
      }]
      for (const item of tempNode) {
        this.nodes.push(item)
      }
      for (const item of tempLink) {
        // 新增连线
        this.links.push(item)
      }
      this.updata('add')
    },
    // 删除节点
    delnewNode () {

      this.nodes.splice(this.nodes.length - 1, 1)
      this.links.splice(this.links.length - 1, 1)
      this.updata('del')
    },
    addHiddenNode () {
      console.log("增加两节点间的隐性关系");
    },
    updata (param) {
      if (param === 'add') {
        this.tpnodes = this.tpnodes
          .data(this.nodes, (d) => { console.log(d); })
          .enter()
          .append('circle')
          .merge(this.tpnodes)


        this.tptexts = this.tptexts
          .data(this.nodes, (d) => d.name)
          .enter()
          .append('text')
          .merge(this.tptexts)
        this.tplinks = this.tplinks
          .data(this.links, (d) => {
            return d.source.name + '-' + d.target.name
          })
          .enter()
          .append('path')
          .attr("stroke-width", function (d) {
            return 2 //所有线宽度均为2
          })
          .join("path")
          .merge(this.tplinks)
      } else {
        this.tpnodes = this.tpnodes
          .data(this.nodes)
          .exit()
          .remove('circle')
          .merge(this.tpnodes)

        this.tptexts = this.tptexts
          .data(this.nodes, (d) => d.name)
          .exit()
          .remove('text')
          .merge(this.tptexts)

        this.tplinks = this.tplinks
          .data(this.links, (d) => {
            return d.source.name + '-' + d.target.name
          })
          .exit()
          .remove('path')
          .attr("stroke-width", function (d) {
            return 2 //所有线宽度均为2
          })
          .merge(this.tplinks)
      }
      this.tpnodes
        .attr('r', 50)
        .attr('opacity', 0.5)
        .attr('fill', '#333')
      // .call(d3.drag()
      //   .subject(this.dragsubject)
      //   .on("start", this.dragstarted)
      //   .on("drag", this.dragged)
      //   .on("end", this.dragended))
      this.tptexts = this.tptexts.attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .text(function (d) {
          return d.data.name
        })
      // .call(d3.drag()
      //   .subject(this.dragsubject)
      //   .on("start", this.dragstarted)
      //   .on("drag", this.dragged)
      //   .on("end", this.dragended)
      // )
      this.tplinks = this.tplinks
        .attr('stroke', d => {
          return 'none'
        })
        .attr('stroke-width', 1)
        .attr("marker-end", "url(#posMarker)")
      this.simulation.nodes(this.nodes);
      // this.simulation.force("link").links(this.links);
      this.simulation.alpha(0).restart(); // 解决下钻时点动的时候不能下钻问题
      this.simulation.on("tick", this.ticked)
      this.d3init()
    },
    //处理多关系
    dealRealtions (links) {
      var linkGroup = {};  //用来分组，将两点之间的连线进行归类
      var linkMap = {};  //对连接线的计数
      for (var i = 0; i < links.length; i++) {
        var key = links[i].source.label < links[i].target.label ? links[i].source.label + ':' + links[i].target.label : links[i].target.label + ':' + links[i].source.label;
        if (!linkMap.hasOwnProperty(key)) {
          linkMap[key] = 0;
        }
        linkMap[key] += 1;
        if (!linkGroup.hasOwnProperty(key)) {
          linkGroup[key] = [];
        }
        linkGroup[key].push(links[i]);
      }
      //为每一条连接线分配size属性，同时对每一组连接线进行编号
      for (var i = 0; i < links.length; i++) {
        var key = links[i].source.label < links[i].target.label ? links[i].source.label + ':' + links[i].target.label : links[i].target.label + ':' + links[i].source.label;
        links[i].size = linkMap[key];
        //同一组的关系进行编号
        var group = linkGroup[key];
        this.setLinkNumber(group); //给关系编号
      }
    },
    // setLinkNumber (group, type) {
    //   if (group.length == 0) return;
    //   //对该分组内的关系按照方向进行分类，此处根据连接的实体ASCII值大小分成两部分
    //   var linksA = [], linksB = [];
    //   for (var i = 0; i < group.length; i++) {
    //     var link = group[i];
    //     if (link.source < link.target) {
    //       linksA.push(link);
    //     } else {
    //       linksB.push(link);
    //     }
    //   }
    //   //确定关系最大编号。为了使得连接两个实体的关系曲线呈现对称，根据关系数量奇偶性进行平分。
    //   //特殊情况：当关系都是连接到同一个实体时，不平分
    //   var maxLinkNumber = 1;
    //   if (type == 'self') {
    //     maxLinkNumber = group.length;
    //   } else {
    //     maxLinkNumber = group.length % 2 == 0 ? group.length / 2 : (group.length + 1) / 2;
    //   }
    //   //如果两个方向的关系数量一样多，直接分别设置编号即可
    //   if (linksA.length == linksB.length) {
    //     var startLinkNumber = 1;
    //     for (var i = 0; i < linksA.length; i++) {
    //       linksA[i].linknum = startLinkNumber++;
    //     }
    //     startLinkNumber = 1;
    //     for (var i = 0; i < linksB.length; i++) {
    //       linksB[i].linknum = startLinkNumber++;
    //     }
    //   } else {//当两个方向的关系数量不对等时，先对数量少的那组关系从最大编号值进行逆序编号，然后在对另一组数量多的关系从编号1一直编号到最大编号，再对剩余关系进行负编号
    //     //如果抛开负号，可以发现，最终所有关系的编号序列一定是对称的（对称是为了保证后续绘图时曲线的弯曲程度也是对称的）
    //     var biggerLinks, smallerLinks;
    //     if (linksA.length > linksB.length) {
    //       biggerLinks = linksA;
    //       smallerLinks = linksB;
    //     } else {
    //       biggerLinks = linksB;
    //       smallerLinks = linksA;
    //     }

    //     var startLinkNumber = maxLinkNumber;
    //     for (var i = 0; i < smallerLinks.length; i++) {
    //       smallerLinks[i].linknum = startLinkNumber--;
    //     }
    //     var tmpNumber = startLinkNumber;

    //     startLinkNumber = 1;
    //     var p = 0;
    //     while (startLinkNumber <= maxLinkNumber) {
    //       biggerLinks[p++].linknum = startLinkNumber++;
    //     }
    //     //开始负编号
    //     startLinkNumber = 0 - tmpNumber;
    //     for (var i = p; i < biggerLinks.length; i++) {
    //       biggerLinks[i].linknum = startLinkNumber++;
    //     }
    //   }
    // },
    setLinkNumber (group) {
      console.log(group);
      if (group.length == 0) return;
      if (group.length == 1) {
        console.log("这两个节点之间有一条关系");
        group[0].linknum = 0;
        return;
      }
      var maxLinkNumber = group.length % 2 == 0 ? group.length / 2 : (group.length - 1) / 2;
      if (group.length % 2 == 0) {
        var startLinkNum = -maxLinkNumber + 0.5;
        for (var i = 0; i < group.length; i++) {
          group[i].linknum = startLinkNum++;
        }
      } else {
        var startLinkNum = -maxLinkNumber;
        for (var i = 0; i < group.length; i++) {
          group[i].linknum = startLinkNum++;
        }
      }

    }
  }
}
</script>

<style lang="scss">
@import "@/plugins/d3-context-menu";
$opacity: 0.15; /* 显示的不透明度 */
$activeColor: #1e90ff; /* 激活的颜色 */
svg {
  margin: 20px 0px;
  // border: 1px #000 solid;
}
/*设置节点及边的样式*/
.links path {
  stroke: #e0cac1b2; // #bbb
  stroke-opacity: 1;
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
  &.active {
    stroke: $activeColor;
    stroke-width: 3px;
  }
  &.hide {
    display: none !important;
  }
}
.nodes circle {
  // stroke: #000;
  // stroke-width: 1.5px;
  &.fixed {
    // fill: rgb(102, 81, 81);
    stroke: #ffc0cb; // #888;
    stroke-width: 14px;
    stroke-opacity: $opacity + 0.3;
    border: 10px #000 solid;
  }
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
  &.active {
    stroke: $activeColor;
    stroke-width: 4px;
    animation: activeNode 1s ease-in both infinite;
  }
  &:hover {
    cursor: pointer;
  }
  &.hide {
    display: none !important;
  }
}
@keyframes activeNode {
  0% {
    stroke-width: 0px;
    stroke: none;
  }
  50% {
    stroke-width: 5px;
    stroke: rgba(224, 229, 233, 0.8);
  }
  100% {
  }
}
.texts text {
  cursor: pointer;
  text-decoration: none;
  user-select: none;
  &:hover {
    cursor: pointer;
  }
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
}
.linkTexts text {
  stroke: #ecddd8b2; // #bbb
  stroke-opacity: 1;
  &.active {
    stroke: $activeColor;
  }
  &.inactive {
    /* display: none !important; */
    opacity: $opacity;
  }
}
// #positiveMarker path {
//   fill: #fff;
// }
</style>
<style lang="scss" scoped>
@media only screen and (max-width: 1125px) {
  #info,
  #mode {
    display: none !important;
  }
}
.font-sky {
  font-size: 18px;
  color: #034c6a !important;
}
#indicator {
  position: absolute;
  // left: 50px;
  // bottom: 30px;
  left: 3vw;
  bottom: 2vw;
  text-align: left;
  color: #f2f2f2;
  font-size: 14px;
  font-weight: bold;
  & > div {
    margin-bottom: 4px;
  }
  span {
    display: inline-block;
    width: 32px;
    height: 16px;
    position: relative;
    top: 2px;
    margin-right: 8px;
  }
}
/*mode选项样式*/
#mode {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  top: 200px;
  left: 40px;
  .gState span {
    display: inline-block;
    border: 1px solid #fff;
    color: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 14px;
    transition: color, background-color 0.3s;
    -o-transition: color, background-color 0.3s;
    -ms-transition: color, background-color 0.3s;
    -moz-transition: color, background-color 0.3s;
    -webkit-transition: color, background-color 0.3s;
    ~ .active,
    ~ :hover {
      background-color: #fff;
      color: #333;
      cursor: pointer;
    }
  }
  .gState span.active,
  .gState span:hover {
    background-color: #fff;
    color: #333;
    cursor: pointer;
  }
}
/*悬浮节点的info样式*/
#info {
  position: absolute;
  bottom: 40px;
  right: 30px;
  width: 270px;
  .node-card {
    border: 1px solid #9faecf;
    background-color: #00aeff6b;
    color: #fff;
    text-align: left;
    // transition: background-color;
    // transition-delay: .3s;
    // transition-timing-function: ease;
    .el-card__header {
      border-bottom: 1px solid #50596d;
    }
  }
}
</style>
