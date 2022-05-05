<!--
 * @Description:
 * @Author: shiby
 * @Date: 2022-02-14 09:55:59
 * @LastEditTime: 2022-02-16 14:51:04
 * @LastEditors: shiby
 * @Reference:
-->
<template>
  <div id="box">
    <div id="MainCy"></div>
  </div>
</template>

<script>
import cytoscape from 'cytoscape'
import cxtmenu from 'cytoscape-cxtmenu'
import cola from 'cytoscape-cola'
import avsdf from 'cytoscape-avsdf'
import coseBilkent from 'cytoscape-cose-bilkent'
export default {
  data () {
    return {
      style: [{
        // 设置节点样式
        selector: 'node',
        locked: true,
        style: {
          content: 'data(label)',
          // shape: 'data(type)', // 节点体
          'text-opacity': 0.5,
          height: 30,
          width: 30,
          'pie-size': '100%',
          'text-valign': 'center',
          // 'text-halign': 'left',
          color: 'yellow'// 节点文字的颜色
        }
      },
      // 设置连线样式
      {
        selector: 'edge',
        style: {
          width: 3,
          'target-arrow-shape': 'triangle',
          // "target-arrow-fill": "hollow", //箭头填充 空心
          'line-color': '#000',
          'target-arrow-color': '#000',
          'curve-style': 'bezier'
        }
      }],

      // 节点数据
      nodes: [{
        data: {
          id: 'n0',
          label: 'node1'
        }
      },
      {
        data: {
          id: 'n1',
          label: 'node2'
        }
      },
      {
        data: {
          id: 'n2',
          label: 'node3'
        }
      },
      {
        data: {
          id: 'n3',
          label: 'node4'
        }
      }],
      // 关系
      edges: [{
        data: {
          source: 'n0',
          target: 'n1'
        }
      },

      {
        data: {
          source: 'n1',
          target: 'n1',
          label: '111111'
        }
      },
      {
        data: {
          source: 'n1',
          target: 'n0'
        }
      }
      ]
    }
  },
  mounted () {
    if (!cytoscape().cxtmenu) {
      cytoscape.use(cxtmenu)
      cytoscape.use(cola)
      cytoscape.use(avsdf)
      cytoscape.use(coseBilkent)
    }
    this.createCytoscape()
  },
  methods: {
    createCytoscape () {
      cytoscape.warnings(false)
      const cy = cytoscape({
        container: document.getElementById('MainCy'),
        zoom: 1, // 图表的初始缩放级别.可以设置options.minZoom和options.maxZoom设置缩放级别的限制.
        pan: { x: 0, y: 0 }, // 图表的初始平移位置.
        // interaction options:
        selected: true,
        grabbable: true,
        minZoom: 0.3, // 图表缩放级别的最小界限.视口的缩放比例不能小于此缩放级别.
        maxZoom: 1, // 图表缩放级别的最大界限.视口的缩放比例不能大于此缩放级别.
        zoomingEnabled: true, // 是否通过用户事件和编程方式启用缩放图形.
        userZoomingEnabled: true, // 滚轮缩放
        panningEnabled: true, // 是否通过用户事件和编程方式启用平移图形.
        userPanningEnabled: true, // 拖拽画布
        boxSelectionEnabled: true, // 是否启用了框选择(即拖动框叠加,并将其释放为选择).如果启用,则用户必须点击以平移图表.
        selectionType: 'single', // 一个字符串，指示用户输入的选择行为.对于'additive',用户进行的新选择将添加到当前所选元素的集合中.对于'single',用户做出的新选择成为当前所选元素的整个集合.
        touchTapThreshold: 8, // 非负整数,分别表示用户在轻击手势期间可以在触摸设备和桌面设备上移动的最大允许距离.这使得用户更容易点击.
        // 这些值具有合理的默认值,因此建议不要更改这些选项,除非您有充分的理由这样做.大值几乎肯定会产生不良后果.
        desktopTapThreshold: 4, // 非负整数,分别表示用户在轻击手势期间可以在触摸设备和桌面设备上移动的最大允许距离.这使得用户更容易点击.
        // 这些值具有合理的默认值,因此建议不要更改这些选项,除非您有充分的理由这样做.大值几乎肯定会产生不良后果.
        autolock: false, // 默认情况下是否应锁定节点(根本不可拖动,如果true覆盖单个节点状态).
        autoungrabify: true, // 默认情况下节点是否不允许被拾取(用户不可抓取,如果true覆盖单个节点状态).
        autounselectify: true, // 默认情况下节点是否允许被选择(不可变选择状态,如果true覆盖单个元素状态).
        // rendering options:
        headless: false, // true:空运行,不显示不需要容器容纳.false:显示需要容器容纳.
        styleEnabled: true, // 一个布尔值,指示是否应用样式.
        hideEdgesOnViewport: true, // 渲染提示,设置为true在渲染窗口时,不渲染边.例如,移动某个顶点时或缩放时,边信息会被临时隐藏,移动结束后,边信息会被执行一次渲染.由于性能增强,此选项现在基本上没有实际意义.
        hideLabelsOnViewport: true, // 渲染提示,当设置为true使渲染器在平移和缩放期间使用纹理而不是绘制元素时,使大图更具响应性.由于性能增强,此选项现在基本上没有实际意义.
        textureOnViewport: true, // 渲染提示,当设置为true使渲染器在平移和缩放期间使用纹理而不是绘制元素时,使大图更具响应性.由于性能增强,此选项现在基本上没有实际意义.
        motionBlur: true, // 渲染提示,设置为true使渲染器使用运动模糊效果使帧之间的过渡看起来更平滑.这可以增加大图的感知性能.由于性能增强,此选项现在基本上没有实际意义.
        motionBlurOpacity: 0.2, // 当motionBlur:true,此值控制运动模糊帧的不透明度.值越高,运动模糊效果越明显.由于性能增强,此选项现在基本上没有实际意义.
        wheelSensitivity: 0.3, // 缩放时更改滚轮灵敏度.这是一个乘法修饰符.因此,0到1之间的值会降低灵敏度(变焦较慢),而大于1的值会增加灵敏度(变焦更快).
        pixelRatio: 'auto', // 使用手动设置值覆盖屏幕像素比率(1.0建议,如果已设置).这可以通过减少需要渲染的有效区域来提高高密度显示器的性能,
        // 尽管在最近的浏览器版本中这是不太必要的.如果要使用硬件的实际像素比,可以设置pixelRatio: 'auto'(默认).
        layout: {
          name: 'random', // 该random布局使节点在视口内随机位置。
          fit: false, // 如果要适应视区
          padding: 30, // 安装padding
          animate: true, // 如果要转换节点位置
          AnimationEleasing: 500, // 动画持续时间 如果启用，则释放动画 如果启用动画持续时间（毫秒）
          // animatefilter：函数（ node， i） 返回true；， //一个确定是否应为节点设置动画的函数。默认情况下，所有节点都启用了动画。非动画节点在布局开始时立即定位。
          ready: undefined, // layoutready上的回调
          stop: undefined // 在layoutstop上回调
          // transform： 函数（ node， position） 返回位置； //转换给定的节点位置。用于在离散布局中更改方向
        },
        style: this.style,
        elements: {
          // 节点数据
          nodes: this.nodes,
          //
          edges: this.edges
        }
      })
      // 不同节点的样式
      cy.style()
        .locked(true)
    }
  }
}
</script>

<style>
#box {
  height: 700px;
  width: 100%;
  margin: 20px;
  position: relative;
  background: #e5e5e5;
  z-index: 0;
}
#MainCy {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 17em;
  z-index: 1;
}
</style>
