"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _locales = require("../locales");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; } // SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project
var _default = exports["default"] = {
  property: {
    weight: '权重',
    label: '标签',
    fillColor: '填充色',
    color: '颜色',
    coverage: '覆盖范围',
    strokeColor: '线条颜色',
    radius: '半径',
    outline: '轮廓线',
    stroke: '线条粗细',
    density: '密度',
    height: '高度',
    sum: '总和',
    pointCount: '点数'
  },
  placeholder: {
    search: '搜索',
    selectField: '选择区域',
    yAxis: 'Y轴',
    selectType: '选择类型',
    selectValue: '选择值',
    enterValue: '输入值',
    empty: '未选择'
  },
  misc: {
    by: '',
    valuesIn: '值包含',
    valueEquals: '值等于',
    dataSource: '数据源',
    brushRadius: '画笔半径 (km)',
    empty: ' '
  },
  mapLayers: {
    title: '图层',
    label: '标签',
    road: '道路',
    border: '边界线',
    building: '建筑物',
    water: '水',
    land: '地面',
    '3dBuilding': '3D建筑'
  },
  panel: {
    text: {
      label: '标签',
      labelWithId: '标签 {labelId}',
      fontSize: '字体大小',
      fontColor: '字体颜色',
      textAnchor: '文本锚',
      alignment: '对齐方式',
      addMoreLabel: '添加更多标签'
    }
  },
  sidebar: {
    panels: {
      layer: '图层',
      filter: '过滤器',
      interaction: '交互',
      basemap: '底图'
    }
  },
  layer: {
    required: '必填*',
    radius: '半径',
    color: '颜色',
    fillColor: '填充色',
    outline: '轮廓线',
    weight: '权重',
    propertyBasedOn: '{property}的基准',
    coverage: '覆盖范围',
    stroke: '线条粗细',
    strokeWidth: '线条宽度',
    strokeColor: '线条颜色',
    basic: '基础设置',
    trailLength: '轨迹长度',
    trailLengthDescription: '轨迹淡出的秒数',
    newLayer: '新建图层',
    elevationByDescription: '关闭时，高度取决于点数',
    colorByDescription: '关闭时，颜色取决于点数',
    aggregateBy: '{field}聚合如下: ',
    '3DModel': '3D模型',
    '3DModelOptions': '3D模型选项',
    type: {
      point: 'point',
      arc: 'arc',
      line: 'line',
      grid: 'grid',
      hexbin: 'hexbin',
      polygon: 'polygon',
      geojson: 'geojson',
      cluster: 'cluster',
      icon: 'icon',
      heatmap: 'heatmap',
      hexagon: 'hexagon',
      hexagonid: 'H3',
      trip: 'trip',
      s2: 'S2',
      '3d': '3D'
    }
  },
  layerVisConfigs: {
    angle: '角度',
    strokeWidth: '线条宽度',
    strokeWidthRange: '线条宽度范围',
    radius: '半径',
    fixedRadius: '以米为单位固定半径',
    fixedRadiusDescription: '将半径映射到以米为单位的绝对半径（例: 5 → 5米）',
    radiusRange: '半径范围',
    clusterRadius: '聚类半径',
    radiusRangePixels: '半径范围[像素]',
    opacity: '透明度',
    coverage: '覆盖范围',
    outline: '轮廓',
    colorRange: '色彩范围',
    stroke: '线',
    strokeColor: '线条颜色',
    strokeColorRange: '线条色彩范围',
    targetColor: '目标颜色',
    colorAggregation: '颜色聚合',
    heightAggregation: '高度聚合',
    resolutionRange: '分辨率范围',
    sizeScale: '大小比例',
    worldUnitSize: '世界单位大小',
    elevationScale: '海拔比例',
    enableElevationZoomFactor: '使用高程缩放系数',
    enableElevationZoomFactorDescription: '根据当前缩放系数调整海拔',
    heightScale: '高度比例',
    coverageRange: '覆盖范围',
    highPrecisionRendering: '高精度渲染',
    highPrecisionRenderingDescription: '高精度渲染会导致性能下降',
    height: '高度',
    heightDescription: '点击屏幕右上角的按钮切换到3D视图',
    fill: '填充',
    enablePolygonHeight: '启用多边形高度',
    showWireframe: '显示线框',
    weightIntensity: '加权强度',
    zoomScale: '缩放比例',
    heightRange: '高度范围'
  },
  layerManager: {
    addData: '添加数据',
    addLayer: '添加图层',
    layerBlending: '混合图层'
  },
  mapManager: {
    mapStyle: '地图样式',
    addMapStyle: '添加地图样式',
    '3dBuildingColor': '3D 建筑颜色'
  },
  layerConfiguration: {
    defaultDescription: '根据所选字段计算 {property}',
    howTo: '使用方法'
  },
  filterManager: {
    addFilter: '添加过滤器'
  },
  datasetTitle: {
    showDataTable: '显示数据表',
    removeDataset: '删除数据集'
  },
  datasetInfo: {
    rowCount: '{rowCount}行'
  },
  tooltip: {
    hideLayer: '隐藏图层',
    showLayer: '显示图层',
    hideFeature: '隐藏特征',
    showFeature: '显示特征',
    hide: '隐藏',
    show: '显示',
    removeLayer: '删除图层',
    zoomToLayer: '缩放☞图层',
    duplicateLayer: '复制图层',
    layerSettings: '图层设置',
    closePanel: '关闭当前面板',
    switchToDualView: '切换到双地图视图',
    showLegend: '显示图例',
    disable3DMap: '禁用 3D 地图',
    DrawOnMap: '在地图上绘制',
    selectLocale: '选择语言',
    showAiAssistantPanel: '显示 AI 助手面板',
    hideAiAssistantPanel: '隐藏 AI 助手面板',
    hideLayerPanel: '隐藏图层面板',
    showLayerPanel: '显示图层面板',
    moveToTop: '移至图层顶部',
    selectBaseMapStyle: '选择底图样式',
    "delete": '删除',
    timePlayback: '时空回放',
    cloudStorage: '云存储',
    '3DMap': '3D 地图',
    animationByWindow: '移动时间窗口',
    animationByIncremental: '增量时间窗口',
    speed: '速度',
    play: '播放',
    pause: '暂停',
    reset: '重置'
  },
  toolbar: _objectSpread({
    exportImage: '导出图片',
    exportData: '导出数据',
    exportMap: '导出地图',
    shareMapURL: '分享地图网址',
    saveMap: '保存地图',
    select: '选择',
    polygon: 'polygon',
    rectangle: 'rectangle',
    hide: '隐藏',
    show: '显示'
  }, _locales.LOCALES),
  editor: {
    filterLayer: '过滤图层',
    copyGeometry: '复制几何图形'
  },
  modal: {
    title: {
      deleteDataset: '删除数据集',
      addDataToMap: '添加数据到地图',
      exportImage: '导出图片',
      exportData: '导出数据',
      exportMap: '导出地图',
      addCustomMapboxStyle: '添加自定义地图',
      saveMap: '保存地图',
      shareURL: '分享网址'
    },
    button: {
      "delete": '删除',
      download: '下载',
      "export": '出口',
      addStyle: '添加样式',
      save: '保存',
      defaultCancel: '取消',
      defaultConfirm: '确认'
    },
    exportImage: {
      ratioTitle: '比率',
      ratioDescription: '选择不同用途的比例。',
      ratioOriginalScreen: '原始屏幕',
      ratioCustom: '自定义',
      ratio4_3: '4:3',
      ratio16_9: '16:9',
      resolutionTitle: '分辨率',
      resolutionDescription: '高分辨率更适合打印。',
      mapLegendTitle: '地图图例',
      mapLegendAdd: '在地图上添加图例'
    },
    exportData: {
      datasetTitle: '数据集',
      datasetSubtitle: '选择要导出的数据集',
      allDatasets: '全部',
      dataTypeTitle: '数据类型',
      dataTypeSubtitle: '选择要导出的数据类型',
      filterDataTitle: '过滤数据',
      filterDataSubtitle: '可以选择导出原始数据或过滤后的数据',
      filteredData: '过滤数据',
      unfilteredData: '元数据',
      fileCount: '{fileCount} 个文件',
      rowCount: '{rowCount} 行'
    },
    deleteData: {
      warning: '确认要删除这个数据集。它会影响 {length} 个层'
    },
    addStyle: {
      publishTitle: '2. 如果在步骤1中输入了 mapbox 样式的 url，需要在 mapbox 上发布样式或提供访问令牌（access token）。（可选）',
      publishSubtitle1: '可以在以下位置创建自己的地图样式',
      publishSubtitle2: '并',
      publishSubtitle3: '发布',
      publishSubtitle4: '。',
      publishSubtitle5: '使用私有样式，需粘贴',
      publishSubtitle6: '访问令牌（access token）',
      publishSubtitle7: '。* Kepler.gl 是一个客户端应用程序，数据保留在您的浏览器中。',
      exampleToken: '例) pk.abcdefg.xxxxxx',
      pasteTitle: '1. 粘贴样式 url',
      pasteSubtitle0: '样式 url 可以是 Mapbox 的',
      pasteSubtitle1: '什么是',
      pasteSubtitle2: '样式 URL，',
      pasteSubtitle3: '还可以使用遵从Mapbox GL样式的style.json的url：',
      pasteSubtitle4: 'Mapbox GL 样式规范',
      namingTitle: '3. 命名你的样式'
    },
    shareMap: {
      shareUriTitle: '分享地图网址',
      shareUriSubtitle: '生成分享地图的链接',
      cloudTitle: '云存储',
      cloudSubtitle: '登录并将地图数据上传到个人云存储',
      shareDisclaimer: 'kepler.gl 将创建的地图存储在个人云存储中，因此只有知道 URL 的人才能访问地图及其数据。' + '可以随时使用个人云存储帐户编辑/删除数据文件。',
      gotoPage: '跳转到Kepler.gl的{currentProvider}页面'
    },
    statusPanel: {
      mapUploading: '地图上传中',
      error: '错误'
    },
    saveMap: {
      title: '云存储',
      subtitle: '登录以将地图保存到个人云存储'
    },
    exportMap: {
      formatTitle: '地图的格式',
      formatSubtitle: '选择导出地图的格式',
      html: {
        selection: '将地图导出至交互式的html文件中。',
        tokenTitle: 'Mapbox的访问令牌（access token）',
        tokenSubtitle: '在 html 中使用自己的 Mapbox 访问令牌（access token）（可选）',
        tokenPlaceholder: '粘贴个人的 Mapbox 访问令牌access token）',
        tokenMisuseWarning: '* 如果您不提供自己的令牌，则在我们更换令牌时，地图可能随时无法显示，以免被滥用。',
        tokenDisclaimer: '可以稍后使用以下说明更改 Mapbox 令牌：',
        tokenUpdate: '如何更新现有的地图令牌。',
        modeTitle: '地图模式',
        modeSubtitle1: '选择地图模式。更多的',
        modeSubtitle2: '信息',
        modeDescription: '允许用户{mode}地图',
        read: '阅读',
        edit: '编辑'
      },
      json: {
        configTitle: '地图配置',
        configDisclaimer: '地图配置将包含在 Json 文件中。如果您在自己的应用程序中使用 kepler.gl。您可以复制此配置并将其传递给',
        selection: '将当前地图数据和配置导出到单个 Json 文件中。稍后您可以通过将此文件上传到 kepler.gl 来打开同一张地图。',
        disclaimer: '* 地图配置与加载的数据集相结合。 “dataId”用于将图层、过滤器和工具提示绑定到特定数据集。' + '将此配置传递给 addDataToMap 时，请确保数据集 ID 与此配置中的 dataId/s 匹配。'
      }
    },
    loadingDialog: {
      loading: '加载中...'
    },
    loadData: {
      upload: '上传文件',
      storage: '从存储中加载'
    },
    tripInfo: {
      title: '如何启用移动动画',
      description1: '要路径设置动画，geoJSON 数据必须包含 `LineString` 作为要素几何。此外，LineString 的坐标有四个元素',
      code: ' [经度，纬度，高程，时间戳] ',
      description2: '最后一个元素是时间戳。有效的时间戳格式包括以秒为单位的 unix，例如`1564184363`或以毫秒为单位的`1564184363000`。',
      example: '例：'
    },
    iconInfo: {
      title: '如何绘制图标',
      description1: '在您的 csv 中，创建一列，将您要绘制的图标的名称放入其中。如果不想在某些点上显示图标，可以将单元格留空。当列被命名为',
      code: '图标',
      description2: '时，kepler.gl 会自动为你创建一个图标层。',
      example: '例:',
      icons: '图标一览'
    },
    storageMapViewer: {
      lastModified: '上次修改 {lastUpdated} 前',
      back: '返回'
    },
    overwriteMap: {
      title: '正在保存地图...',
      alreadyExists: '已经存在于 {mapSaved} 中。你想覆盖吗？'
    },
    loadStorageMap: {
      back: '返回',
      goToPage: '跳转到 Kepler.gl 的 {displayName} 页面',
      storageMaps: '存储 / 地図',
      noSavedMaps: '还没有保存的地图'
    }
  },
  header: {
    visibleLayers: '可见图层',
    layerLegend: '图层图例'
  },
  interactions: {
    tooltip: '工具提示',
    brush: '刷',
    coordinate: '坐标',
    geocoder: '地理编码器'
  },
  layerBlending: {
    title: '图层混合',
    additive: 'additive',
    normal: 'normal',
    subtractive: 'subtractive'
  },
  columns: {
    title: '列',
    lat: '纬度',
    lng: '经度',
    altitude: '海拔',
    icon: '图标',
    geojson: 'geojson',
    token: '令牌',
    arc: {
      lat0: '起点 纬度',
      lng0: '起点 经度',
      lat1: '终点 纬度',
      lng1: '终点 经度'
    },
    grid: {
      worldUnitSize: '网格大小 (km)'
    },
    hexagon: {
      worldUnitSize: '六边形半径 (km)'
    },
    hex_id: 'hex id'
  },
  color: {
    customPalette: '自定义调色板',
    steps: '步骤',
    type: '类型',
    reversed: '反转'
  },
  scale: {
    colorScale: '色阶',
    sizeScale: '大小比例',
    strokeScale: '描边比例',
    scale: '规模'
  },
  fileUploader: {
    message: '将您的文件拖放到此处（可多个）',
    chromeMessage: '*对于 Chrome 用户：文件大小最大为 250mb。如果需要上传更多文件，请尝试使用 Safari。',
    disclaimer: '* kepler.gl 在客户端上工作。数据仅保留在您自己的设备/浏览器中。' + '没有信息或地图数据被发送到任何服务器。',
    configUploadMessage: '上传 {fileFormatNames} 或保存的地图 **Json**。阅读更多关于[**支持的文件格式**]',
    browseFiles: '浏览你的文件',
    uploading: '上传',
    fileNotSupported: '不支持文件 {errorFiles}。',
    or: '或'
  },
  geocoder: {
    title: '输入地址或坐标（例： 37.79,-122.40）'
  },
  fieldSelector: {
    clearAll: '清除所有',
    formatting: '格式化'
  },
  compare: {
    modeLabel: '比较模式',
    typeLabel: '比较类型',
    types: {
      absolute: '绝对',
      relative: '相对'
    }
  },
  mapPopover: {
    primary: '主要'
  },
  density: '密度',
  'Bug Report': '错误报告',
  'User Guide': '用户指南',
  Save: '保存',
  Share: '分享'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsImNvdmVyYWdlIiwic3Ryb2tlQ29sb3IiLCJyYWRpdXMiLCJvdXRsaW5lIiwic3Ryb2tlIiwiZGVuc2l0eSIsImhlaWdodCIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJwYW5lbCIsInRleHQiLCJsYWJlbFdpdGhJZCIsImZvbnRTaXplIiwiZm9udENvbG9yIiwidGV4dEFuY2hvciIsImFsaWdubWVudCIsImFkZE1vcmVMYWJlbCIsInNpZGViYXIiLCJwYW5lbHMiLCJsYXllciIsImludGVyYWN0aW9uIiwiYmFzZW1hcCIsInJlcXVpcmVkIiwicHJvcGVydHlCYXNlZE9uIiwic3Ryb2tlV2lkdGgiLCJiYXNpYyIsInRyYWlsTGVuZ3RoIiwidHJhaWxMZW5ndGhEZXNjcmlwdGlvbiIsIm5ld0xheWVyIiwiZWxldmF0aW9uQnlEZXNjcmlwdGlvbiIsImNvbG9yQnlEZXNjcmlwdGlvbiIsImFnZ3JlZ2F0ZUJ5IiwidHlwZSIsInBvaW50IiwiYXJjIiwibGluZSIsImdyaWQiLCJoZXhiaW4iLCJwb2x5Z29uIiwiZ2VvanNvbiIsImNsdXN0ZXIiLCJpY29uIiwiaGVhdG1hcCIsImhleGFnb24iLCJoZXhhZ29uaWQiLCJ0cmlwIiwiczIiLCJsYXllclZpc0NvbmZpZ3MiLCJhbmdsZSIsInN0cm9rZVdpZHRoUmFuZ2UiLCJmaXhlZFJhZGl1cyIsImZpeGVkUmFkaXVzRGVzY3JpcHRpb24iLCJyYWRpdXNSYW5nZSIsImNsdXN0ZXJSYWRpdXMiLCJyYWRpdXNSYW5nZVBpeGVscyIsIm9wYWNpdHkiLCJjb2xvclJhbmdlIiwic3Ryb2tlQ29sb3JSYW5nZSIsInRhcmdldENvbG9yIiwiY29sb3JBZ2dyZWdhdGlvbiIsImhlaWdodEFnZ3JlZ2F0aW9uIiwicmVzb2x1dGlvblJhbmdlIiwic2l6ZVNjYWxlIiwid29ybGRVbml0U2l6ZSIsImVsZXZhdGlvblNjYWxlIiwiZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvciIsImVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbiIsImhlaWdodFNjYWxlIiwiY292ZXJhZ2VSYW5nZSIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmciLCJoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb24iLCJoZWlnaHREZXNjcmlwdGlvbiIsImZpbGwiLCJlbmFibGVQb2x5Z29uSGVpZ2h0Iiwic2hvd1dpcmVmcmFtZSIsIndlaWdodEludGVuc2l0eSIsInpvb21TY2FsZSIsImhlaWdodFJhbmdlIiwibGF5ZXJNYW5hZ2VyIiwiYWRkRGF0YSIsImFkZExheWVyIiwibGF5ZXJCbGVuZGluZyIsIm1hcE1hbmFnZXIiLCJtYXBTdHlsZSIsImFkZE1hcFN0eWxlIiwibGF5ZXJDb25maWd1cmF0aW9uIiwiZGVmYXVsdERlc2NyaXB0aW9uIiwiaG93VG8iLCJmaWx0ZXJNYW5hZ2VyIiwiYWRkRmlsdGVyIiwiZGF0YXNldFRpdGxlIiwic2hvd0RhdGFUYWJsZSIsInJlbW92ZURhdGFzZXQiLCJkYXRhc2V0SW5mbyIsInJvd0NvdW50IiwidG9vbHRpcCIsImhpZGVMYXllciIsInNob3dMYXllciIsImhpZGVGZWF0dXJlIiwic2hvd0ZlYXR1cmUiLCJoaWRlIiwic2hvdyIsInJlbW92ZUxheWVyIiwiem9vbVRvTGF5ZXIiLCJkdXBsaWNhdGVMYXllciIsImxheWVyU2V0dGluZ3MiLCJjbG9zZVBhbmVsIiwic3dpdGNoVG9EdWFsVmlldyIsInNob3dMZWdlbmQiLCJkaXNhYmxlM0RNYXAiLCJEcmF3T25NYXAiLCJzZWxlY3RMb2NhbGUiLCJzaG93QWlBc3Npc3RhbnRQYW5lbCIsImhpZGVBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUxheWVyUGFuZWwiLCJzaG93TGF5ZXJQYW5lbCIsIm1vdmVUb1RvcCIsInNlbGVjdEJhc2VNYXBTdHlsZSIsInRpbWVQbGF5YmFjayIsImNsb3VkU3RvcmFnZSIsImFuaW1hdGlvbkJ5V2luZG93IiwiYW5pbWF0aW9uQnlJbmNyZW1lbnRhbCIsInNwZWVkIiwicGxheSIsInBhdXNlIiwicmVzZXQiLCJ0b29sYmFyIiwiZXhwb3J0SW1hZ2UiLCJleHBvcnREYXRhIiwiZXhwb3J0TWFwIiwic2hhcmVNYXBVUkwiLCJzYXZlTWFwIiwic2VsZWN0IiwicmVjdGFuZ2xlIiwiTE9DQUxFUyIsImVkaXRvciIsImZpbHRlckxheWVyIiwiY29weUdlb21ldHJ5IiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUwIiwicGFzdGVTdWJ0aXRsZTEiLCJwYXN0ZVN1YnRpdGxlMiIsInBhc3RlU3VidGl0bGUzIiwicGFzdGVTdWJ0aXRsZTQiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImdlb2NvZGVyIiwiYWRkaXRpdmUiLCJub3JtYWwiLCJzdWJ0cmFjdGl2ZSIsImNvbHVtbnMiLCJsYXQiLCJsbmciLCJhbHRpdHVkZSIsInRva2VuIiwibGF0MCIsImxuZzAiLCJsYXQxIiwibG5nMSIsImhleF9pZCIsImN1c3RvbVBhbGV0dGUiLCJzdGVwcyIsInJldmVyc2VkIiwic2NhbGUiLCJjb2xvclNjYWxlIiwic3Ryb2tlU2NhbGUiLCJmaWxlVXBsb2FkZXIiLCJtZXNzYWdlIiwiY2hyb21lTWVzc2FnZSIsImNvbmZpZ1VwbG9hZE1lc3NhZ2UiLCJicm93c2VGaWxlcyIsInVwbG9hZGluZyIsImZpbGVOb3RTdXBwb3J0ZWQiLCJvciIsImZpZWxkU2VsZWN0b3IiLCJjbGVhckFsbCIsImZvcm1hdHRpbmciLCJjb21wYXJlIiwibW9kZUxhYmVsIiwidHlwZUxhYmVsIiwidHlwZXMiLCJhYnNvbHV0ZSIsInJlbGF0aXZlIiwibWFwUG9wb3ZlciIsInByaW1hcnkiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbG9jYWxpemF0aW9uL3NyYy90cmFuc2xhdGlvbnMvY24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuLy8gQ29weXJpZ2h0IGNvbnRyaWJ1dG9ycyB0byB0aGUga2VwbGVyLmdsIHByb2plY3RcblxuaW1wb3J0IHtMT0NBTEVTfSBmcm9tICcuLi9sb2NhbGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wZXJ0eToge1xuICAgIHdlaWdodDogJ+adg+mHjScsXG4gICAgbGFiZWw6ICfmoIfnrb4nLFxuICAgIGZpbGxDb2xvcjogJ+Whq+WFheiJsicsXG4gICAgY29sb3I6ICfpopzoibInLFxuICAgIGNvdmVyYWdlOiAn6KaG55uW6IyD5Zu0JyxcbiAgICBzdHJva2VDb2xvcjogJ+e6v+adoeminOiJsicsXG4gICAgcmFkaXVzOiAn5Y2K5b6EJyxcbiAgICBvdXRsaW5lOiAn6L2u5buT57q/JyxcbiAgICBzdHJva2U6ICfnur/mnaHnspfnu4YnLFxuICAgIGRlbnNpdHk6ICflr4bluqYnLFxuICAgIGhlaWdodDogJ+mrmOW6picsXG4gICAgc3VtOiAn5oC75ZKMJyxcbiAgICBwb2ludENvdW50OiAn54K55pWwJ1xuICB9LFxuICBwbGFjZWhvbGRlcjoge1xuICAgIHNlYXJjaDogJ+aQnOe0oicsXG4gICAgc2VsZWN0RmllbGQ6ICfpgInmi6nljLrln58nLFxuICAgIHlBeGlzOiAnWei9tCcsXG4gICAgc2VsZWN0VHlwZTogJ+mAieaLqeexu+WeiycsXG4gICAgc2VsZWN0VmFsdWU6ICfpgInmi6nlgLwnLFxuICAgIGVudGVyVmFsdWU6ICfovpPlhaXlgLwnLFxuICAgIGVtcHR5OiAn5pyq6YCJ5oupJ1xuICB9LFxuICBtaXNjOiB7XG4gICAgYnk6ICcnLFxuICAgIHZhbHVlc0luOiAn5YC85YyF5ZCrJyxcbiAgICB2YWx1ZUVxdWFsczogJ+WAvOetieS6jicsXG4gICAgZGF0YVNvdXJjZTogJ+aVsOaNrua6kCcsXG4gICAgYnJ1c2hSYWRpdXM6ICfnlLvnrJTljYrlvoQgKGttKScsXG4gICAgZW1wdHk6ICcgJ1xuICB9LFxuICBtYXBMYXllcnM6IHtcbiAgICB0aXRsZTogJ+WbvuWxgicsXG4gICAgbGFiZWw6ICfmoIfnrb4nLFxuICAgIHJvYWQ6ICfpgZPot68nLFxuICAgIGJvcmRlcjogJ+i+ueeVjOe6vycsXG4gICAgYnVpbGRpbmc6ICflu7rnrZHniaknLFxuICAgIHdhdGVyOiAn5rC0JyxcbiAgICBsYW5kOiAn5Zyw6Z2iJyxcbiAgICAnM2RCdWlsZGluZyc6ICczROW7uuetkSdcbiAgfSxcbiAgcGFuZWw6IHtcbiAgICB0ZXh0OiB7XG4gICAgICBsYWJlbDogJ+agh+etvicsXG4gICAgICBsYWJlbFdpdGhJZDogJ+agh+etviB7bGFiZWxJZH0nLFxuICAgICAgZm9udFNpemU6ICflrZfkvZPlpKflsI8nLFxuICAgICAgZm9udENvbG9yOiAn5a2X5L2T6aKc6ImyJyxcbiAgICAgIHRleHRBbmNob3I6ICfmlofmnKzplJonLFxuICAgICAgYWxpZ25tZW50OiAn5a+56b2Q5pa55byPJyxcbiAgICAgIGFkZE1vcmVMYWJlbDogJ+a3u+WKoOabtOWkmuagh+etvidcbiAgICB9XG4gIH0sXG4gIHNpZGViYXI6IHtcbiAgICBwYW5lbHM6IHtcbiAgICAgIGxheWVyOiAn5Zu+5bGCJyxcbiAgICAgIGZpbHRlcjogJ+i/h+a7pOWZqCcsXG4gICAgICBpbnRlcmFjdGlvbjogJ+S6pOS6kicsXG4gICAgICBiYXNlbWFwOiAn5bqV5Zu+J1xuICAgIH1cbiAgfSxcbiAgbGF5ZXI6IHtcbiAgICByZXF1aXJlZDogJ+W/heWhqyonLFxuICAgIHJhZGl1czogJ+WNiuW+hCcsXG4gICAgY29sb3I6ICfpopzoibInLFxuICAgIGZpbGxDb2xvcjogJ+Whq+WFheiJsicsXG4gICAgb3V0bGluZTogJ+i9ruW7k+e6vycsXG4gICAgd2VpZ2h0OiAn5p2D6YeNJyxcbiAgICBwcm9wZXJ0eUJhc2VkT246ICd7cHJvcGVydHl955qE5Z+65YeGJyxcbiAgICBjb3ZlcmFnZTogJ+imhuebluiMg+WbtCcsXG4gICAgc3Ryb2tlOiAn57q/5p2h57KX57uGJyxcbiAgICBzdHJva2VXaWR0aDogJ+e6v+adoeWuveW6picsXG4gICAgc3Ryb2tlQ29sb3I6ICfnur/mnaHpopzoibInLFxuICAgIGJhc2ljOiAn5Z+656GA6K6+572uJyxcbiAgICB0cmFpbExlbmd0aDogJ+i9qOi/uemVv+W6picsXG4gICAgdHJhaWxMZW5ndGhEZXNjcmlwdGlvbjogJ+i9qOi/uea3oeWHuueahOenkuaVsCcsXG4gICAgbmV3TGF5ZXI6ICfmlrDlu7rlm77lsYInLFxuICAgIGVsZXZhdGlvbkJ5RGVzY3JpcHRpb246ICflhbPpl63ml7bvvIzpq5jluqblj5blhrPkuo7ngrnmlbAnLFxuICAgIGNvbG9yQnlEZXNjcmlwdGlvbjogJ+WFs+mXreaXtu+8jOminOiJsuWPluWGs+S6jueCueaVsCcsXG4gICAgYWdncmVnYXRlQnk6ICd7ZmllbGR96IGa5ZCI5aaC5LiLOiAnLFxuICAgICczRE1vZGVsJzogJzNE5qih5Z6LJyxcbiAgICAnM0RNb2RlbE9wdGlvbnMnOiAnM0TmqKHlnovpgInpobknLFxuICAgIHR5cGU6IHtcbiAgICAgIHBvaW50OiAncG9pbnQnLFxuICAgICAgYXJjOiAnYXJjJyxcbiAgICAgIGxpbmU6ICdsaW5lJyxcbiAgICAgIGdyaWQ6ICdncmlkJyxcbiAgICAgIGhleGJpbjogJ2hleGJpbicsXG4gICAgICBwb2x5Z29uOiAncG9seWdvbicsXG4gICAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgICBjbHVzdGVyOiAnY2x1c3RlcicsXG4gICAgICBpY29uOiAnaWNvbicsXG4gICAgICBoZWF0bWFwOiAnaGVhdG1hcCcsXG4gICAgICBoZXhhZ29uOiAnaGV4YWdvbicsXG4gICAgICBoZXhhZ29uaWQ6ICdIMycsXG4gICAgICB0cmlwOiAndHJpcCcsXG4gICAgICBzMjogJ1MyJyxcbiAgICAgICczZCc6ICczRCdcbiAgICB9XG4gIH0sXG4gIGxheWVyVmlzQ29uZmlnczoge1xuICAgIGFuZ2xlOiAn6KeS5bqmJyxcbiAgICBzdHJva2VXaWR0aDogJ+e6v+adoeWuveW6picsXG4gICAgc3Ryb2tlV2lkdGhSYW5nZTogJ+e6v+adoeWuveW6puiMg+WbtCcsXG4gICAgcmFkaXVzOiAn5Y2K5b6EJyxcbiAgICBmaXhlZFJhZGl1czogJ+S7peexs+S4uuWNleS9jeWbuuWumuWNiuW+hCcsXG4gICAgZml4ZWRSYWRpdXNEZXNjcmlwdGlvbjogJ+WwhuWNiuW+hOaYoOWwhOWIsOS7peexs+S4uuWNleS9jeeahOe7neWvueWNiuW+hO+8iOS+izogNSDihpIgNeexs++8iScsXG4gICAgcmFkaXVzUmFuZ2U6ICfljYrlvoTojIPlm7QnLFxuICAgIGNsdXN0ZXJSYWRpdXM6ICfogZrnsbvljYrlvoQnLFxuICAgIHJhZGl1c1JhbmdlUGl4ZWxzOiAn5Y2K5b6E6IyD5Zu0W+WDj+e0oF0nLFxuICAgIG9wYWNpdHk6ICfpgI/mmI7luqYnLFxuICAgIGNvdmVyYWdlOiAn6KaG55uW6IyD5Zu0JyxcbiAgICBvdXRsaW5lOiAn6L2u5buTJyxcbiAgICBjb2xvclJhbmdlOiAn6Imy5b2p6IyD5Zu0JyxcbiAgICBzdHJva2U6ICfnur8nLFxuICAgIHN0cm9rZUNvbG9yOiAn57q/5p2h6aKc6ImyJyxcbiAgICBzdHJva2VDb2xvclJhbmdlOiAn57q/5p2h6Imy5b2p6IyD5Zu0JyxcbiAgICB0YXJnZXRDb2xvcjogJ+ebruagh+minOiJsicsXG4gICAgY29sb3JBZ2dyZWdhdGlvbjogJ+minOiJsuiBmuWQiCcsXG4gICAgaGVpZ2h0QWdncmVnYXRpb246ICfpq5jluqbogZrlkIgnLFxuICAgIHJlc29sdXRpb25SYW5nZTogJ+WIhui+qOeOh+iMg+WbtCcsXG4gICAgc2l6ZVNjYWxlOiAn5aSn5bCP5q+U5L6LJyxcbiAgICB3b3JsZFVuaXRTaXplOiAn5LiW55WM5Y2V5L2N5aSn5bCPJyxcbiAgICBlbGV2YXRpb25TY2FsZTogJ+a1t+aLlOavlOS+iycsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvcjogJ+S9v+eUqOmrmOeoi+e8qeaUvuezu+aVsCcsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvckRlc2NyaXB0aW9uOiAn5qC55o2u5b2T5YmN57yp5pS+57O75pWw6LCD5pW05rW35ouUJyxcbiAgICBoZWlnaHRTY2FsZTogJ+mrmOW6puavlOS+iycsXG4gICAgY292ZXJhZ2VSYW5nZTogJ+imhuebluiMg+WbtCcsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZzogJ+mrmOeyvuW6pua4suafkycsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZ0Rlc2NyaXB0aW9uOiAn6auY57K+5bqm5riy5p+T5Lya5a+86Ie05oCn6IO95LiL6ZmNJyxcbiAgICBoZWlnaHQ6ICfpq5jluqYnLFxuICAgIGhlaWdodERlc2NyaXB0aW9uOiAn54K55Ye75bGP5bmV5Y+z5LiK6KeS55qE5oyJ6ZKu5YiH5o2i5YiwM0Top4blm74nLFxuICAgIGZpbGw6ICfloavlhYUnLFxuICAgIGVuYWJsZVBvbHlnb25IZWlnaHQ6ICflkK/nlKjlpJrovrnlvaLpq5jluqYnLFxuICAgIHNob3dXaXJlZnJhbWU6ICfmmL7npLrnur/moYYnLFxuICAgIHdlaWdodEludGVuc2l0eTogJ+WKoOadg+W8uuW6picsXG4gICAgem9vbVNjYWxlOiAn57yp5pS+5q+U5L6LJyxcbiAgICBoZWlnaHRSYW5nZTogJ+mrmOW6puiMg+WbtCdcbiAgfSxcbiAgbGF5ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRGF0YTogJ+a3u+WKoOaVsOaNricsXG4gICAgYWRkTGF5ZXI6ICfmt7vliqDlm77lsYInLFxuICAgIGxheWVyQmxlbmRpbmc6ICfmt7flkIjlm77lsYInXG4gIH0sXG4gIG1hcE1hbmFnZXI6IHtcbiAgICBtYXBTdHlsZTogJ+WcsOWbvuagt+W8jycsXG4gICAgYWRkTWFwU3R5bGU6ICfmt7vliqDlnLDlm77moLflvI8nLFxuICAgICczZEJ1aWxkaW5nQ29sb3InOiAnM0Qg5bu6562R6aKc6ImyJ1xuICB9LFxuICBsYXllckNvbmZpZ3VyYXRpb246IHtcbiAgICBkZWZhdWx0RGVzY3JpcHRpb246ICfmoLnmja7miYDpgInlrZfmrrXorqHnrpcge3Byb3BlcnR5fScsXG4gICAgaG93VG86ICfkvb/nlKjmlrnms5UnXG4gIH0sXG4gIGZpbHRlck1hbmFnZXI6IHtcbiAgICBhZGRGaWx0ZXI6ICfmt7vliqDov4fmu6TlmagnXG4gIH0sXG4gIGRhdGFzZXRUaXRsZToge1xuICAgIHNob3dEYXRhVGFibGU6ICfmmL7npLrmlbDmja7ooagnLFxuICAgIHJlbW92ZURhdGFzZXQ6ICfliKDpmaTmlbDmja7pm4YnXG4gIH0sXG4gIGRhdGFzZXRJbmZvOiB7XG4gICAgcm93Q291bnQ6ICd7cm93Q291bnR96KGMJ1xuICB9LFxuICB0b29sdGlwOiB7XG4gICAgaGlkZUxheWVyOiAn6ZqQ6JeP5Zu+5bGCJyxcbiAgICBzaG93TGF5ZXI6ICfmmL7npLrlm77lsYInLFxuICAgIGhpZGVGZWF0dXJlOiAn6ZqQ6JeP54m55b6BJyxcbiAgICBzaG93RmVhdHVyZTogJ+aYvuekuueJueW+gScsXG4gICAgaGlkZTogJ+makOiXjycsXG4gICAgc2hvdzogJ+aYvuekuicsXG4gICAgcmVtb3ZlTGF5ZXI6ICfliKDpmaTlm77lsYInLFxuICAgIHpvb21Ub0xheWVyOiAn57yp5pS+4pie5Zu+5bGCJyxcbiAgICBkdXBsaWNhdGVMYXllcjogJ+WkjeWItuWbvuWxgicsXG4gICAgbGF5ZXJTZXR0aW5nczogJ+WbvuWxguiuvue9ricsXG4gICAgY2xvc2VQYW5lbDogJ+WFs+mXreW9k+WJjemdouadvycsXG4gICAgc3dpdGNoVG9EdWFsVmlldzogJ+WIh+aNouWIsOWPjOWcsOWbvuinhuWbvicsXG4gICAgc2hvd0xlZ2VuZDogJ+aYvuekuuWbvuS+iycsXG4gICAgZGlzYWJsZTNETWFwOiAn56aB55SoIDNEIOWcsOWbvicsXG4gICAgRHJhd09uTWFwOiAn5Zyo5Zyw5Zu+5LiK57uY5Yi2JyxcbiAgICBzZWxlY3RMb2NhbGU6ICfpgInmi6nor63oqIAnLFxuICAgIHNob3dBaUFzc2lzdGFudFBhbmVsOiAn5pi+56S6IEFJIOWKqeaJi+mdouadvycsXG4gICAgaGlkZUFpQXNzaXN0YW50UGFuZWw6ICfpmpDol48gQUkg5Yqp5omL6Z2i5p2/JyxcbiAgICBoaWRlTGF5ZXJQYW5lbDogJ+makOiXj+WbvuWxgumdouadvycsXG4gICAgc2hvd0xheWVyUGFuZWw6ICfmmL7npLrlm77lsYLpnaLmnb8nLFxuICAgIG1vdmVUb1RvcDogJ+enu+iHs+WbvuWxgumhtumDqCcsXG4gICAgc2VsZWN0QmFzZU1hcFN0eWxlOiAn6YCJ5oup5bqV5Zu+5qC35byPJyxcbiAgICBkZWxldGU6ICfliKDpmaQnLFxuICAgIHRpbWVQbGF5YmFjazogJ+aXtuepuuWbnuaUvicsXG4gICAgY2xvdWRTdG9yYWdlOiAn5LqR5a2Y5YKoJyxcbiAgICAnM0RNYXAnOiAnM0Qg5Zyw5Zu+JyxcbiAgICBhbmltYXRpb25CeVdpbmRvdzogJ+enu+WKqOaXtumXtOeql+WPoycsXG4gICAgYW5pbWF0aW9uQnlJbmNyZW1lbnRhbDogJ+WinumHj+aXtumXtOeql+WPoycsXG4gICAgc3BlZWQ6ICfpgJ/luqYnLFxuICAgIHBsYXk6ICfmkq3mlL4nLFxuICAgIHBhdXNlOiAn5pqC5YGcJyxcbiAgICByZXNldDogJ+mHjee9ridcbiAgfSxcbiAgdG9vbGJhcjoge1xuICAgIGV4cG9ydEltYWdlOiAn5a+85Ye65Zu+54mHJyxcbiAgICBleHBvcnREYXRhOiAn5a+85Ye65pWw5o2uJyxcbiAgICBleHBvcnRNYXA6ICflr7zlh7rlnLDlm74nLFxuICAgIHNoYXJlTWFwVVJMOiAn5YiG5Lqr5Zyw5Zu+572R5Z2AJyxcbiAgICBzYXZlTWFwOiAn5L+d5a2Y5Zyw5Zu+JyxcbiAgICBzZWxlY3Q6ICfpgInmi6knLFxuICAgIHBvbHlnb246ICdwb2x5Z29uJyxcbiAgICByZWN0YW5nbGU6ICdyZWN0YW5nbGUnLFxuICAgIGhpZGU6ICfpmpDol48nLFxuICAgIHNob3c6ICfmmL7npLonLFxuICAgIC4uLkxPQ0FMRVNcbiAgfSxcbiAgZWRpdG9yOiB7XG4gICAgZmlsdGVyTGF5ZXI6ICfov4fmu6Tlm77lsYInLFxuICAgIGNvcHlHZW9tZXRyeTogJ+WkjeWItuWHoOS9leWbvuW9oidcbiAgfSxcbiAgbW9kYWw6IHtcbiAgICB0aXRsZToge1xuICAgICAgZGVsZXRlRGF0YXNldDogJ+WIoOmZpOaVsOaNrumbhicsXG4gICAgICBhZGREYXRhVG9NYXA6ICfmt7vliqDmlbDmja7liLDlnLDlm74nLFxuICAgICAgZXhwb3J0SW1hZ2U6ICflr7zlh7rlm77niYcnLFxuICAgICAgZXhwb3J0RGF0YTogJ+WvvOWHuuaVsOaNricsXG4gICAgICBleHBvcnRNYXA6ICflr7zlh7rlnLDlm74nLFxuICAgICAgYWRkQ3VzdG9tTWFwYm94U3R5bGU6ICfmt7vliqDoh6rlrprkuYnlnLDlm74nLFxuICAgICAgc2F2ZU1hcDogJ+S/neWtmOWcsOWbvicsXG4gICAgICBzaGFyZVVSTDogJ+WIhuS6q+e9keWdgCdcbiAgICB9LFxuICAgIGJ1dHRvbjoge1xuICAgICAgZGVsZXRlOiAn5Yig6ZmkJyxcbiAgICAgIGRvd25sb2FkOiAn5LiL6L29JyxcbiAgICAgIGV4cG9ydDogJ+WHuuWPoycsXG4gICAgICBhZGRTdHlsZTogJ+a3u+WKoOagt+W8jycsXG4gICAgICBzYXZlOiAn5L+d5a2YJyxcbiAgICAgIGRlZmF1bHRDYW5jZWw6ICflj5bmtognLFxuICAgICAgZGVmYXVsdENvbmZpcm06ICfnoa7orqQnXG4gICAgfSxcbiAgICBleHBvcnRJbWFnZToge1xuICAgICAgcmF0aW9UaXRsZTogJ+avlOeOhycsXG4gICAgICByYXRpb0Rlc2NyaXB0aW9uOiAn6YCJ5oup5LiN5ZCM55So6YCU55qE5q+U5L6L44CCJyxcbiAgICAgIHJhdGlvT3JpZ2luYWxTY3JlZW46ICfljp/lp4vlsY/luZUnLFxuICAgICAgcmF0aW9DdXN0b206ICfoh6rlrprkuYknLFxuICAgICAgcmF0aW80XzM6ICc0OjMnLFxuICAgICAgcmF0aW8xNl85OiAnMTY6OScsXG4gICAgICByZXNvbHV0aW9uVGl0bGU6ICfliIbovqjnjocnLFxuICAgICAgcmVzb2x1dGlvbkRlc2NyaXB0aW9uOiAn6auY5YiG6L6o546H5pu06YCC5ZCI5omT5Y2w44CCJyxcbiAgICAgIG1hcExlZ2VuZFRpdGxlOiAn5Zyw5Zu+5Zu+5L6LJyxcbiAgICAgIG1hcExlZ2VuZEFkZDogJ+WcqOWcsOWbvuS4iua3u+WKoOWbvuS+iydcbiAgICB9LFxuICAgIGV4cG9ydERhdGE6IHtcbiAgICAgIGRhdGFzZXRUaXRsZTogJ+aVsOaNrumbhicsXG4gICAgICBkYXRhc2V0U3VidGl0bGU6ICfpgInmi6nopoHlr7zlh7rnmoTmlbDmja7pm4YnLFxuICAgICAgYWxsRGF0YXNldHM6ICflhajpg6gnLFxuICAgICAgZGF0YVR5cGVUaXRsZTogJ+aVsOaNruexu+WeiycsXG4gICAgICBkYXRhVHlwZVN1YnRpdGxlOiAn6YCJ5oup6KaB5a+85Ye655qE5pWw5o2u57G75Z6LJyxcbiAgICAgIGZpbHRlckRhdGFUaXRsZTogJ+i/h+a7pOaVsOaNricsXG4gICAgICBmaWx0ZXJEYXRhU3VidGl0bGU6ICflj6/ku6XpgInmi6nlr7zlh7rljp/lp4vmlbDmja7miJbov4fmu6TlkI7nmoTmlbDmja4nLFxuICAgICAgZmlsdGVyZWREYXRhOiAn6L+H5ruk5pWw5o2uJyxcbiAgICAgIHVuZmlsdGVyZWREYXRhOiAn5YWD5pWw5o2uJyxcbiAgICAgIGZpbGVDb3VudDogJ3tmaWxlQ291bnR9IOS4quaWh+S7ticsXG4gICAgICByb3dDb3VudDogJ3tyb3dDb3VudH0g6KGMJ1xuICAgIH0sXG4gICAgZGVsZXRlRGF0YToge1xuICAgICAgd2FybmluZzogJ+ehruiupOimgeWIoOmZpOi/meS4quaVsOaNrumbhuOAguWug+S8muW9seWTjSB7bGVuZ3RofSDkuKrlsYInXG4gICAgfSxcbiAgICBhZGRTdHlsZToge1xuICAgICAgcHVibGlzaFRpdGxlOlxuICAgICAgICAnMi4g5aaC5p6c5Zyo5q2l6aqkMeS4rei+k+WFpeS6hiBtYXBib3gg5qC35byP55qEIHVybO+8jOmcgOimgeWcqCBtYXBib3gg5LiK5Y+R5biD5qC35byP5oiW5o+Q5L6b6K6/6Zeu5Luk54mM77yIYWNjZXNzIHRva2Vu77yJ44CC77yI5Y+v6YCJ77yJJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTE6ICflj6/ku6XlnKjku6XkuIvkvY3nva7liJvlu7roh6rlt7HnmoTlnLDlm77moLflvI8nLFxuICAgICAgcHVibGlzaFN1YnRpdGxlMjogJ+W5ticsXG4gICAgICBwdWJsaXNoU3VidGl0bGUzOiAn5Y+R5biDJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTQ6ICfjgIInLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNTogJ+S9v+eUqOengeacieagt+W8j++8jOmcgOeymOi0tCcsXG4gICAgICBwdWJsaXNoU3VidGl0bGU2OiAn6K6/6Zeu5Luk54mM77yIYWNjZXNzIHRva2Vu77yJJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTc6ICfjgIIqIEtlcGxlci5nbCDmmK/kuIDkuKrlrqLmiLfnq6/lupTnlKjnqIvluo/vvIzmlbDmja7kv53nlZnlnKjmgqjnmoTmtY/op4jlmajkuK3jgIInLFxuICAgICAgZXhhbXBsZVRva2VuOiAn5L6LKSBway5hYmNkZWZnLnh4eHh4eCcsXG4gICAgICBwYXN0ZVRpdGxlOiAnMS4g57KY6LS05qC35byPIHVybCcsXG4gICAgICBwYXN0ZVN1YnRpdGxlMDogJ+agt+W8jyB1cmwg5Y+v5Lul5pivIE1hcGJveCDnmoQnLFxuICAgICAgcGFzdGVTdWJ0aXRsZTE6ICfku4DkuYjmmK8nLFxuICAgICAgcGFzdGVTdWJ0aXRsZTI6ICfmoLflvI8gVVJM77yMJyxcbiAgICAgIHBhc3RlU3VidGl0bGUzOiAn6L+Y5Y+v5Lul5L2/55So6YG15LuOTWFwYm94IEdM5qC35byP55qEc3R5bGUuanNvbueahHVybO+8micsXG4gICAgICBwYXN0ZVN1YnRpdGxlNDogJ01hcGJveCBHTCDmoLflvI/op4TojIMnLFxuICAgICAgbmFtaW5nVGl0bGU6ICczLiDlkb3lkI3kvaDnmoTmoLflvI8nXG4gICAgfSxcbiAgICBzaGFyZU1hcDoge1xuICAgICAgc2hhcmVVcmlUaXRsZTogJ+WIhuS6q+WcsOWbvue9keWdgCcsXG4gICAgICBzaGFyZVVyaVN1YnRpdGxlOiAn55Sf5oiQ5YiG5Lqr5Zyw5Zu+55qE6ZO+5o6lJyxcbiAgICAgIGNsb3VkVGl0bGU6ICfkupHlrZjlgqgnLFxuICAgICAgY2xvdWRTdWJ0aXRsZTogJ+eZu+W9leW5tuWwhuWcsOWbvuaVsOaNruS4iuS8oOWIsOS4quS6uuS6keWtmOWCqCcsXG4gICAgICBzaGFyZURpc2NsYWltZXI6XG4gICAgICAgICdrZXBsZXIuZ2wg5bCG5Yib5bu655qE5Zyw5Zu+5a2Y5YKo5Zyo5Liq5Lq65LqR5a2Y5YKo5Lit77yM5Zug5q2k5Y+q5pyJ55+l6YGTIFVSTCDnmoTkurrmiY3og73orr/pl67lnLDlm77lj4rlhbbmlbDmja7jgIInICtcbiAgICAgICAgJ+WPr+S7pemaj+aXtuS9v+eUqOS4quS6uuS6keWtmOWCqOW4kOaIt+e8lui+kS/liKDpmaTmlbDmja7mlofku7bjgIInLFxuICAgICAgZ290b1BhZ2U6ICfot7PovazliLBLZXBsZXIuZ2znmoR7Y3VycmVudFByb3ZpZGVyfemhtemdoidcbiAgICB9LFxuICAgIHN0YXR1c1BhbmVsOiB7XG4gICAgICBtYXBVcGxvYWRpbmc6ICflnLDlm77kuIrkvKDkuK0nLFxuICAgICAgZXJyb3I6ICfplJnor68nXG4gICAgfSxcbiAgICBzYXZlTWFwOiB7XG4gICAgICB0aXRsZTogJ+S6keWtmOWCqCcsXG4gICAgICBzdWJ0aXRsZTogJ+eZu+W9leS7peWwhuWcsOWbvuS/neWtmOWIsOS4quS6uuS6keWtmOWCqCdcbiAgICB9LFxuICAgIGV4cG9ydE1hcDoge1xuICAgICAgZm9ybWF0VGl0bGU6ICflnLDlm77nmoTmoLzlvI8nLFxuICAgICAgZm9ybWF0U3VidGl0bGU6ICfpgInmi6nlr7zlh7rlnLDlm77nmoTmoLzlvI8nLFxuICAgICAgaHRtbDoge1xuICAgICAgICBzZWxlY3Rpb246ICflsIblnLDlm77lr7zlh7roh7PkuqTkupLlvI/nmoRodG1s5paH5Lu25Lit44CCJyxcbiAgICAgICAgdG9rZW5UaXRsZTogJ01hcGJveOeahOiuv+mXruS7pOeJjO+8iGFjY2VzcyB0b2tlbu+8iScsXG4gICAgICAgIHRva2VuU3VidGl0bGU6ICflnKggaHRtbCDkuK3kvb/nlKjoh6rlt7HnmoQgTWFwYm94IOiuv+mXruS7pOeJjO+8iGFjY2VzcyB0b2tlbu+8ie+8iOWPr+mAie+8iScsXG4gICAgICAgIHRva2VuUGxhY2Vob2xkZXI6ICfnspjotLTkuKrkurrnmoQgTWFwYm94IOiuv+mXruS7pOeJjGFjY2VzcyB0b2tlbu+8iScsXG4gICAgICAgIHRva2VuTWlzdXNlV2FybmluZzpcbiAgICAgICAgICAnKiDlpoLmnpzmgqjkuI3mj5Dkvpvoh6rlt7HnmoTku6TniYzvvIzliJnlnKjmiJHku6zmm7TmjaLku6TniYzml7bvvIzlnLDlm77lj6/og73pmo/ml7bml6Dms5XmmL7npLrvvIzku6XlhY3ooqvmu6XnlKjjgIInLFxuICAgICAgICB0b2tlbkRpc2NsYWltZXI6ICflj6/ku6XnqI3lkI7kvb/nlKjku6XkuIvor7TmmI7mm7TmlLkgTWFwYm94IOS7pOeJjO+8micsXG4gICAgICAgIHRva2VuVXBkYXRlOiAn5aaC5L2V5pu05paw546w5pyJ55qE5Zyw5Zu+5Luk54mM44CCJyxcbiAgICAgICAgbW9kZVRpdGxlOiAn5Zyw5Zu+5qih5byPJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMTogJ+mAieaLqeWcsOWbvuaooeW8j+OAguabtOWkmueahCcsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTI6ICfkv6Hmga8nLFxuICAgICAgICBtb2RlRGVzY3JpcHRpb246ICflhYHorrjnlKjmiLd7bW9kZX3lnLDlm74nLFxuICAgICAgICByZWFkOiAn6ZiF6K+7JyxcbiAgICAgICAgZWRpdDogJ+e8lui+kSdcbiAgICAgIH0sXG4gICAgICBqc29uOiB7XG4gICAgICAgIGNvbmZpZ1RpdGxlOiAn5Zyw5Zu+6YWN572uJyxcbiAgICAgICAgY29uZmlnRGlzY2xhaW1lcjpcbiAgICAgICAgICAn5Zyw5Zu+6YWN572u5bCG5YyF5ZCr5ZyoIEpzb24g5paH5Lu25Lit44CC5aaC5p6c5oKo5Zyo6Ieq5bex55qE5bqU55So56iL5bqP5Lit5L2/55SoIGtlcGxlci5nbOOAguaCqOWPr+S7peWkjeWItuatpOmFjee9ruW5tuWwhuWFtuS8oOmAkue7mScsXG4gICAgICAgIHNlbGVjdGlvbjpcbiAgICAgICAgICAn5bCG5b2T5YmN5Zyw5Zu+5pWw5o2u5ZKM6YWN572u5a+85Ye65Yiw5Y2V5LiqIEpzb24g5paH5Lu25Lit44CC56iN5ZCO5oKo5Y+v5Lul6YCa6L+H5bCG5q2k5paH5Lu25LiK5Lyg5YiwIGtlcGxlci5nbCDmnaXmiZPlvIDlkIzkuIDlvKDlnLDlm77jgIInLFxuICAgICAgICBkaXNjbGFpbWVyOlxuICAgICAgICAgICcqIOWcsOWbvumFjee9ruS4juWKoOi9veeahOaVsOaNrumbhuebuOe7k+WQiOOAgiDigJxkYXRhSWTigJ3nlKjkuo7lsIblm77lsYLjgIHov4fmu6Tlmajlkozlt6Xlhbfmj5DnpLrnu5HlrprliLDnibnlrprmlbDmja7pm4bjgIInICtcbiAgICAgICAgICAn5bCG5q2k6YWN572u5Lyg6YCS57uZIGFkZERhdGFUb01hcCDml7bvvIzor7fnoa7kv53mlbDmja7pm4YgSUQg5LiO5q2k6YWN572u5Lit55qEIGRhdGFJZC9zIOWMuemFjeOAgidcbiAgICAgIH1cbiAgICB9LFxuICAgIGxvYWRpbmdEaWFsb2c6IHtcbiAgICAgIGxvYWRpbmc6ICfliqDovb3kuK0uLi4nXG4gICAgfSxcbiAgICBsb2FkRGF0YToge1xuICAgICAgdXBsb2FkOiAn5LiK5Lyg5paH5Lu2JyxcbiAgICAgIHN0b3JhZ2U6ICfku47lrZjlgqjkuK3liqDovb0nXG4gICAgfSxcbiAgICB0cmlwSW5mbzoge1xuICAgICAgdGl0bGU6ICflpoLkvZXlkK/nlKjnp7vliqjliqjnlLsnLFxuICAgICAgZGVzY3JpcHRpb24xOlxuICAgICAgICAn6KaB6Lev5b6E6K6+572u5Yqo55S777yMZ2VvSlNPTiDmlbDmja7lv4XpobvljIXlkKsgYExpbmVTdHJpbmdgIOS9nOS4uuimgee0oOWHoOS9leOAguatpOWklu+8jExpbmVTdHJpbmcg55qE5Z2Q5qCH5pyJ5Zub5Liq5YWD57SgJyxcbiAgICAgIGNvZGU6ICcgW+e7j+W6pu+8jOe6rOW6pu+8jOmrmOeoi++8jOaXtumXtOaIs10gJyxcbiAgICAgIGRlc2NyaXB0aW9uMjpcbiAgICAgICAgJ+acgOWQjuS4gOS4quWFg+e0oOaYr+aXtumXtOaIs+OAguacieaViOeahOaXtumXtOaIs+agvOW8j+WMheaLrOS7peenkuS4uuWNleS9jeeahCB1bml477yM5L6L5aaCYDE1NjQxODQzNjNg5oiW5Lul5q+r56eS5Li65Y2V5L2N55qEYDE1NjQxODQzNjMwMDBg44CCJyxcbiAgICAgIGV4YW1wbGU6ICfkvovvvJonXG4gICAgfSxcbiAgICBpY29uSW5mbzoge1xuICAgICAgdGl0bGU6ICflpoLkvZXnu5jliLblm77moIcnLFxuICAgICAgZGVzY3JpcHRpb24xOlxuICAgICAgICAn5Zyo5oKo55qEIGNzdiDkuK3vvIzliJvlu7rkuIDliJfvvIzlsIbmgqjopoHnu5jliLbnmoTlm77moIfnmoTlkI3np7DmlL7lhaXlhbbkuK3jgILlpoLmnpzkuI3mg7PlnKjmn5DkupvngrnkuIrmmL7npLrlm77moIfvvIzlj6/ku6XlsIbljZXlhYPmoLznlZnnqbrjgILlvZPliJfooqvlkb3lkI3kuLonLFxuICAgICAgY29kZTogJ+WbvuaghycsXG4gICAgICBkZXNjcmlwdGlvbjI6ICfml7bvvIxrZXBsZXIuZ2wg5Lya6Ieq5Yqo5Li65L2g5Yib5bu65LiA5Liq5Zu+5qCH5bGC44CCJyxcbiAgICAgIGV4YW1wbGU6ICfkvos6JyxcbiAgICAgIGljb25zOiAn5Zu+5qCH5LiA6KeIJ1xuICAgIH0sXG4gICAgc3RvcmFnZU1hcFZpZXdlcjoge1xuICAgICAgbGFzdE1vZGlmaWVkOiAn5LiK5qyh5L+u5pS5IHtsYXN0VXBkYXRlZH0g5YmNJyxcbiAgICAgIGJhY2s6ICfov5Tlm54nXG4gICAgfSxcbiAgICBvdmVyd3JpdGVNYXA6IHtcbiAgICAgIHRpdGxlOiAn5q2j5Zyo5L+d5a2Y5Zyw5Zu+Li4uJyxcbiAgICAgIGFscmVhZHlFeGlzdHM6ICflt7Lnu4/lrZjlnKjkuo4ge21hcFNhdmVkfSDkuK3jgILkvaDmg7Popobnm5blkJfvvJ8nXG4gICAgfSxcbiAgICBsb2FkU3RvcmFnZU1hcDoge1xuICAgICAgYmFjazogJ+i/lOWbnicsXG4gICAgICBnb1RvUGFnZTogJ+i3s+i9rOWIsCBLZXBsZXIuZ2wg55qEIHtkaXNwbGF5TmFtZX0g6aG16Z2iJyxcbiAgICAgIHN0b3JhZ2VNYXBzOiAn5a2Y5YKoIC8g5Zyw5ZuzJyxcbiAgICAgIG5vU2F2ZWRNYXBzOiAn6L+Y5rKh5pyJ5L+d5a2Y55qE5Zyw5Zu+J1xuICAgIH1cbiAgfSxcbiAgaGVhZGVyOiB7XG4gICAgdmlzaWJsZUxheWVyczogJ+WPr+ingeWbvuWxgicsXG4gICAgbGF5ZXJMZWdlbmQ6ICflm77lsYLlm77kvosnXG4gIH0sXG4gIGludGVyYWN0aW9uczoge1xuICAgIHRvb2x0aXA6ICflt6Xlhbfmj5DnpLonLFxuICAgIGJydXNoOiAn5Yi3JyxcbiAgICBjb29yZGluYXRlOiAn5Z2Q5qCHJyxcbiAgICBnZW9jb2RlcjogJ+WcsOeQhue8lueggeWZqCdcbiAgfSxcbiAgbGF5ZXJCbGVuZGluZzoge1xuICAgIHRpdGxlOiAn5Zu+5bGC5re35ZCIJyxcbiAgICBhZGRpdGl2ZTogJ2FkZGl0aXZlJyxcbiAgICBub3JtYWw6ICdub3JtYWwnLFxuICAgIHN1YnRyYWN0aXZlOiAnc3VidHJhY3RpdmUnXG4gIH0sXG4gIGNvbHVtbnM6IHtcbiAgICB0aXRsZTogJ+WIlycsXG4gICAgbGF0OiAn57qs5bqmJyxcbiAgICBsbmc6ICfnu4/luqYnLFxuICAgIGFsdGl0dWRlOiAn5rW35ouUJyxcbiAgICBpY29uOiAn5Zu+5qCHJyxcbiAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgdG9rZW46ICfku6TniYwnLFxuICAgIGFyYzoge1xuICAgICAgbGF0MDogJ+i1t+eCuSDnuqzluqYnLFxuICAgICAgbG5nMDogJ+i1t+eCuSDnu4/luqYnLFxuICAgICAgbGF0MTogJ+e7iOeCuSDnuqzluqYnLFxuICAgICAgbG5nMTogJ+e7iOeCuSDnu4/luqYnXG4gICAgfSxcbiAgICBncmlkOiB7XG4gICAgICB3b3JsZFVuaXRTaXplOiAn572R5qC85aSn5bCPIChrbSknXG4gICAgfSxcbiAgICBoZXhhZ29uOiB7XG4gICAgICB3b3JsZFVuaXRTaXplOiAn5YWt6L655b2i5Y2K5b6EIChrbSknXG4gICAgfSxcbiAgICBoZXhfaWQ6ICdoZXggaWQnXG4gIH0sXG4gIGNvbG9yOiB7XG4gICAgY3VzdG9tUGFsZXR0ZTogJ+iHquWumuS5ieiwg+iJsuadvycsXG4gICAgc3RlcHM6ICfmraXpqqQnLFxuICAgIHR5cGU6ICfnsbvlnosnLFxuICAgIHJldmVyc2VkOiAn5Y+N6L2sJ1xuICB9LFxuICBzY2FsZToge1xuICAgIGNvbG9yU2NhbGU6ICfoibLpmLYnLFxuICAgIHNpemVTY2FsZTogJ+Wkp+Wwj+avlOS+iycsXG4gICAgc3Ryb2tlU2NhbGU6ICfmj4/ovrnmr5TkvosnLFxuICAgIHNjYWxlOiAn6KeE5qihJ1xuICB9LFxuICBmaWxlVXBsb2FkZXI6IHtcbiAgICBtZXNzYWdlOiAn5bCG5oKo55qE5paH5Lu25ouW5pS+5Yiw5q2k5aSE77yI5Y+v5aSa5Liq77yJJyxcbiAgICBjaHJvbWVNZXNzYWdlOlxuICAgICAgJyrlr7nkuo4gQ2hyb21lIOeUqOaIt++8muaWh+S7tuWkp+Wwj+acgOWkp+S4uiAyNTBtYuOAguWmguaenOmcgOimgeS4iuS8oOabtOWkmuaWh+S7tu+8jOivt+WwneivleS9v+eUqCBTYWZhcmnjgIInLFxuICAgIGRpc2NsYWltZXI6XG4gICAgICAnKiBrZXBsZXIuZ2wg5Zyo5a6i5oi356uv5LiK5bel5L2c44CC5pWw5o2u5LuF5L+d55WZ5Zyo5oKo6Ieq5bex55qE6K6+5aSHL+a1j+iniOWZqOS4reOAgicgK1xuICAgICAgJ+ayoeacieS/oeaBr+aIluWcsOWbvuaVsOaNruiiq+WPkemAgeWIsOS7u+S9leacjeWKoeWZqOOAgicsXG4gICAgY29uZmlnVXBsb2FkTWVzc2FnZTpcbiAgICAgICfkuIrkvKAge2ZpbGVGb3JtYXROYW1lc30g5oiW5L+d5a2Y55qE5Zyw5Zu+ICoqSnNvbioq44CC6ZiF6K+75pu05aSa5YWz5LqOWyoq5pSv5oyB55qE5paH5Lu25qC85byPKipdJyxcbiAgICBicm93c2VGaWxlczogJ+a1j+iniOS9oOeahOaWh+S7ticsXG4gICAgdXBsb2FkaW5nOiAn5LiK5LygJyxcbiAgICBmaWxlTm90U3VwcG9ydGVkOiAn5LiN5pSv5oyB5paH5Lu2IHtlcnJvckZpbGVzfeOAgicsXG4gICAgb3I6ICfmiJYnXG4gIH0sXG4gIGdlb2NvZGVyOiB7XG4gICAgdGl0bGU6ICfovpPlhaXlnLDlnYDmiJblnZDmoIfvvIjkvovvvJogMzcuNzksLTEyMi40MO+8iSdcbiAgfSxcbiAgZmllbGRTZWxlY3Rvcjoge1xuICAgIGNsZWFyQWxsOiAn5riF6Zmk5omA5pyJJyxcbiAgICBmb3JtYXR0aW5nOiAn5qC85byP5YyWJ1xuICB9LFxuICBjb21wYXJlOiB7XG4gICAgbW9kZUxhYmVsOiAn5q+U6L6D5qih5byPJyxcbiAgICB0eXBlTGFiZWw6ICfmr5TovoPnsbvlnosnLFxuICAgIHR5cGVzOiB7XG4gICAgICBhYnNvbHV0ZTogJ+e7neWvuScsXG4gICAgICByZWxhdGl2ZTogJ+ebuOWvuSdcbiAgICB9XG4gIH0sXG4gIG1hcFBvcG92ZXI6IHtcbiAgICBwcmltYXJ5OiAn5Li76KaBJ1xuICB9LFxuICBkZW5zaXR5OiAn5a+G5bqmJyxcbiAgJ0J1ZyBSZXBvcnQnOiAn6ZSZ6K+v5oql5ZGKJyxcbiAgJ1VzZXIgR3VpZGUnOiAn55So5oi35oyH5Y2XJyxcbiAgU2F2ZTogJ+S/neWtmCcsXG4gIFNoYXJlOiAn5YiG5LqrJ1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFHQSxJQUFBQSxRQUFB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