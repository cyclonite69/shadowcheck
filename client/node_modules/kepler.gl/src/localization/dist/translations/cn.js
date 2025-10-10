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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsImNvdmVyYWdlIiwic3Ryb2tlQ29sb3IiLCJyYWRpdXMiLCJvdXRsaW5lIiwic3Ryb2tlIiwiZGVuc2l0eSIsImhlaWdodCIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJwYW5lbCIsInRleHQiLCJsYWJlbFdpdGhJZCIsImZvbnRTaXplIiwiZm9udENvbG9yIiwidGV4dEFuY2hvciIsImFsaWdubWVudCIsImFkZE1vcmVMYWJlbCIsInNpZGViYXIiLCJwYW5lbHMiLCJsYXllciIsImludGVyYWN0aW9uIiwiYmFzZW1hcCIsInJlcXVpcmVkIiwicHJvcGVydHlCYXNlZE9uIiwic3Ryb2tlV2lkdGgiLCJiYXNpYyIsInRyYWlsTGVuZ3RoIiwidHJhaWxMZW5ndGhEZXNjcmlwdGlvbiIsIm5ld0xheWVyIiwiZWxldmF0aW9uQnlEZXNjcmlwdGlvbiIsImNvbG9yQnlEZXNjcmlwdGlvbiIsImFnZ3JlZ2F0ZUJ5IiwidHlwZSIsInBvaW50IiwiYXJjIiwibGluZSIsImdyaWQiLCJoZXhiaW4iLCJwb2x5Z29uIiwiZ2VvanNvbiIsImNsdXN0ZXIiLCJpY29uIiwiaGVhdG1hcCIsImhleGFnb24iLCJoZXhhZ29uaWQiLCJ0cmlwIiwiczIiLCJsYXllclZpc0NvbmZpZ3MiLCJhbmdsZSIsInN0cm9rZVdpZHRoUmFuZ2UiLCJmaXhlZFJhZGl1cyIsImZpeGVkUmFkaXVzRGVzY3JpcHRpb24iLCJyYWRpdXNSYW5nZSIsImNsdXN0ZXJSYWRpdXMiLCJyYWRpdXNSYW5nZVBpeGVscyIsIm9wYWNpdHkiLCJjb2xvclJhbmdlIiwic3Ryb2tlQ29sb3JSYW5nZSIsInRhcmdldENvbG9yIiwiY29sb3JBZ2dyZWdhdGlvbiIsImhlaWdodEFnZ3JlZ2F0aW9uIiwicmVzb2x1dGlvblJhbmdlIiwic2l6ZVNjYWxlIiwid29ybGRVbml0U2l6ZSIsImVsZXZhdGlvblNjYWxlIiwiZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvciIsImVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbiIsImhlaWdodFNjYWxlIiwiY292ZXJhZ2VSYW5nZSIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmciLCJoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb24iLCJoZWlnaHREZXNjcmlwdGlvbiIsImZpbGwiLCJlbmFibGVQb2x5Z29uSGVpZ2h0Iiwic2hvd1dpcmVmcmFtZSIsIndlaWdodEludGVuc2l0eSIsInpvb21TY2FsZSIsImhlaWdodFJhbmdlIiwibGF5ZXJNYW5hZ2VyIiwiYWRkRGF0YSIsImFkZExheWVyIiwibGF5ZXJCbGVuZGluZyIsIm1hcE1hbmFnZXIiLCJtYXBTdHlsZSIsImFkZE1hcFN0eWxlIiwibGF5ZXJDb25maWd1cmF0aW9uIiwiZGVmYXVsdERlc2NyaXB0aW9uIiwiaG93VG8iLCJmaWx0ZXJNYW5hZ2VyIiwiYWRkRmlsdGVyIiwiZGF0YXNldFRpdGxlIiwic2hvd0RhdGFUYWJsZSIsInJlbW92ZURhdGFzZXQiLCJkYXRhc2V0SW5mbyIsInJvd0NvdW50IiwidG9vbHRpcCIsImhpZGVMYXllciIsInNob3dMYXllciIsImhpZGVGZWF0dXJlIiwic2hvd0ZlYXR1cmUiLCJoaWRlIiwic2hvdyIsInJlbW92ZUxheWVyIiwiem9vbVRvTGF5ZXIiLCJkdXBsaWNhdGVMYXllciIsImxheWVyU2V0dGluZ3MiLCJjbG9zZVBhbmVsIiwic3dpdGNoVG9EdWFsVmlldyIsInNob3dMZWdlbmQiLCJkaXNhYmxlM0RNYXAiLCJEcmF3T25NYXAiLCJzZWxlY3RMb2NhbGUiLCJzaG93QWlBc3Npc3RhbnRQYW5lbCIsImhpZGVBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUxheWVyUGFuZWwiLCJzaG93TGF5ZXJQYW5lbCIsIm1vdmVUb1RvcCIsInNlbGVjdEJhc2VNYXBTdHlsZSIsInRpbWVQbGF5YmFjayIsImNsb3VkU3RvcmFnZSIsImFuaW1hdGlvbkJ5V2luZG93IiwiYW5pbWF0aW9uQnlJbmNyZW1lbnRhbCIsInNwZWVkIiwicGxheSIsInBhdXNlIiwicmVzZXQiLCJ0b29sYmFyIiwiZXhwb3J0SW1hZ2UiLCJleHBvcnREYXRhIiwiZXhwb3J0TWFwIiwic2hhcmVNYXBVUkwiLCJzYXZlTWFwIiwic2VsZWN0IiwicmVjdGFuZ2xlIiwiTE9DQUxFUyIsImVkaXRvciIsImZpbHRlckxheWVyIiwiY29weUdlb21ldHJ5IiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUwIiwicGFzdGVTdWJ0aXRsZTEiLCJwYXN0ZVN1YnRpdGxlMiIsInBhc3RlU3VidGl0bGUzIiwicGFzdGVTdWJ0aXRsZTQiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImdlb2NvZGVyIiwiYWRkaXRpdmUiLCJub3JtYWwiLCJzdWJ0cmFjdGl2ZSIsImNvbHVtbnMiLCJsYXQiLCJsbmciLCJhbHRpdHVkZSIsInRva2VuIiwibGF0MCIsImxuZzAiLCJsYXQxIiwibG5nMSIsImhleF9pZCIsImN1c3RvbVBhbGV0dGUiLCJzdGVwcyIsInJldmVyc2VkIiwic2NhbGUiLCJjb2xvclNjYWxlIiwic3Ryb2tlU2NhbGUiLCJmaWxlVXBsb2FkZXIiLCJtZXNzYWdlIiwiY2hyb21lTWVzc2FnZSIsImNvbmZpZ1VwbG9hZE1lc3NhZ2UiLCJicm93c2VGaWxlcyIsInVwbG9hZGluZyIsImZpbGVOb3RTdXBwb3J0ZWQiLCJvciIsImZpZWxkU2VsZWN0b3IiLCJjbGVhckFsbCIsImZvcm1hdHRpbmciLCJjb21wYXJlIiwibW9kZUxhYmVsIiwidHlwZUxhYmVsIiwidHlwZXMiLCJhYnNvbHV0ZSIsInJlbGF0aXZlIiwibWFwUG9wb3ZlciIsInByaW1hcnkiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdHJhbnNsYXRpb25zL2NuLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmltcG9ydCB7TE9DQUxFU30gZnJvbSAnLi4vbG9jYWxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcGVydHk6IHtcbiAgICB3ZWlnaHQ6ICfmnYPph40nLFxuICAgIGxhYmVsOiAn5qCH562+JyxcbiAgICBmaWxsQ29sb3I6ICfloavlhYXoibInLFxuICAgIGNvbG9yOiAn6aKc6ImyJyxcbiAgICBjb3ZlcmFnZTogJ+imhuebluiMg+WbtCcsXG4gICAgc3Ryb2tlQ29sb3I6ICfnur/mnaHpopzoibInLFxuICAgIHJhZGl1czogJ+WNiuW+hCcsXG4gICAgb3V0bGluZTogJ+i9ruW7k+e6vycsXG4gICAgc3Ryb2tlOiAn57q/5p2h57KX57uGJyxcbiAgICBkZW5zaXR5OiAn5a+G5bqmJyxcbiAgICBoZWlnaHQ6ICfpq5jluqYnLFxuICAgIHN1bTogJ+aAu+WSjCcsXG4gICAgcG9pbnRDb3VudDogJ+eCueaVsCdcbiAgfSxcbiAgcGxhY2Vob2xkZXI6IHtcbiAgICBzZWFyY2g6ICfmkJzntKInLFxuICAgIHNlbGVjdEZpZWxkOiAn6YCJ5oup5Yy65Z+fJyxcbiAgICB5QXhpczogJ1novbQnLFxuICAgIHNlbGVjdFR5cGU6ICfpgInmi6nnsbvlnosnLFxuICAgIHNlbGVjdFZhbHVlOiAn6YCJ5oup5YC8JyxcbiAgICBlbnRlclZhbHVlOiAn6L6T5YWl5YC8JyxcbiAgICBlbXB0eTogJ+acqumAieaLqSdcbiAgfSxcbiAgbWlzYzoge1xuICAgIGJ5OiAnJyxcbiAgICB2YWx1ZXNJbjogJ+WAvOWMheWQqycsXG4gICAgdmFsdWVFcXVhbHM6ICflgLznrYnkuo4nLFxuICAgIGRhdGFTb3VyY2U6ICfmlbDmja7mupAnLFxuICAgIGJydXNoUmFkaXVzOiAn55S756yU5Y2K5b6EIChrbSknLFxuICAgIGVtcHR5OiAnICdcbiAgfSxcbiAgbWFwTGF5ZXJzOiB7XG4gICAgdGl0bGU6ICflm77lsYInLFxuICAgIGxhYmVsOiAn5qCH562+JyxcbiAgICByb2FkOiAn6YGT6LevJyxcbiAgICBib3JkZXI6ICfovrnnlYznur8nLFxuICAgIGJ1aWxkaW5nOiAn5bu6562R54mpJyxcbiAgICB3YXRlcjogJ+awtCcsXG4gICAgbGFuZDogJ+WcsOmdoicsXG4gICAgJzNkQnVpbGRpbmcnOiAnM0Tlu7rnrZEnXG4gIH0sXG4gIHBhbmVsOiB7XG4gICAgdGV4dDoge1xuICAgICAgbGFiZWw6ICfmoIfnrb4nLFxuICAgICAgbGFiZWxXaXRoSWQ6ICfmoIfnrb4ge2xhYmVsSWR9JyxcbiAgICAgIGZvbnRTaXplOiAn5a2X5L2T5aSn5bCPJyxcbiAgICAgIGZvbnRDb2xvcjogJ+Wtl+S9k+minOiJsicsXG4gICAgICB0ZXh0QW5jaG9yOiAn5paH5pys6ZSaJyxcbiAgICAgIGFsaWdubWVudDogJ+Wvuem9kOaWueW8jycsXG4gICAgICBhZGRNb3JlTGFiZWw6ICfmt7vliqDmm7TlpJrmoIfnrb4nXG4gICAgfVxuICB9LFxuICBzaWRlYmFyOiB7XG4gICAgcGFuZWxzOiB7XG4gICAgICBsYXllcjogJ+WbvuWxgicsXG4gICAgICBmaWx0ZXI6ICfov4fmu6TlmagnLFxuICAgICAgaW50ZXJhY3Rpb246ICfkuqTkupInLFxuICAgICAgYmFzZW1hcDogJ+W6leWbvidcbiAgICB9XG4gIH0sXG4gIGxheWVyOiB7XG4gICAgcmVxdWlyZWQ6ICflv4XloasqJyxcbiAgICByYWRpdXM6ICfljYrlvoQnLFxuICAgIGNvbG9yOiAn6aKc6ImyJyxcbiAgICBmaWxsQ29sb3I6ICfloavlhYXoibInLFxuICAgIG91dGxpbmU6ICfova7lu5Pnur8nLFxuICAgIHdlaWdodDogJ+adg+mHjScsXG4gICAgcHJvcGVydHlCYXNlZE9uOiAne3Byb3BlcnR5feeahOWfuuWHhicsXG4gICAgY292ZXJhZ2U6ICfopobnm5bojIPlm7QnLFxuICAgIHN0cm9rZTogJ+e6v+adoeeyl+e7hicsXG4gICAgc3Ryb2tlV2lkdGg6ICfnur/mnaHlrr3luqYnLFxuICAgIHN0cm9rZUNvbG9yOiAn57q/5p2h6aKc6ImyJyxcbiAgICBiYXNpYzogJ+WfuuehgOiuvue9ricsXG4gICAgdHJhaWxMZW5ndGg6ICfovajov7nplb/luqYnLFxuICAgIHRyYWlsTGVuZ3RoRGVzY3JpcHRpb246ICfovajov7nmt6Hlh7rnmoTnp5LmlbAnLFxuICAgIG5ld0xheWVyOiAn5paw5bu65Zu+5bGCJyxcbiAgICBlbGV2YXRpb25CeURlc2NyaXB0aW9uOiAn5YWz6Zet5pe277yM6auY5bqm5Y+W5Yaz5LqO54K55pWwJyxcbiAgICBjb2xvckJ5RGVzY3JpcHRpb246ICflhbPpl63ml7bvvIzpopzoibLlj5blhrPkuo7ngrnmlbAnLFxuICAgIGFnZ3JlZ2F0ZUJ5OiAne2ZpZWxkfeiBmuWQiOWmguS4izogJyxcbiAgICAnM0RNb2RlbCc6ICczROaooeWeiycsXG4gICAgJzNETW9kZWxPcHRpb25zJzogJzNE5qih5Z6L6YCJ6aG5JyxcbiAgICB0eXBlOiB7XG4gICAgICBwb2ludDogJ3BvaW50JyxcbiAgICAgIGFyYzogJ2FyYycsXG4gICAgICBsaW5lOiAnbGluZScsXG4gICAgICBncmlkOiAnZ3JpZCcsXG4gICAgICBoZXhiaW46ICdoZXhiaW4nLFxuICAgICAgcG9seWdvbjogJ3BvbHlnb24nLFxuICAgICAgZ2VvanNvbjogJ2dlb2pzb24nLFxuICAgICAgY2x1c3RlcjogJ2NsdXN0ZXInLFxuICAgICAgaWNvbjogJ2ljb24nLFxuICAgICAgaGVhdG1hcDogJ2hlYXRtYXAnLFxuICAgICAgaGV4YWdvbjogJ2hleGFnb24nLFxuICAgICAgaGV4YWdvbmlkOiAnSDMnLFxuICAgICAgdHJpcDogJ3RyaXAnLFxuICAgICAgczI6ICdTMicsXG4gICAgICAnM2QnOiAnM0QnXG4gICAgfVxuICB9LFxuICBsYXllclZpc0NvbmZpZ3M6IHtcbiAgICBhbmdsZTogJ+inkuW6picsXG4gICAgc3Ryb2tlV2lkdGg6ICfnur/mnaHlrr3luqYnLFxuICAgIHN0cm9rZVdpZHRoUmFuZ2U6ICfnur/mnaHlrr3luqbojIPlm7QnLFxuICAgIHJhZGl1czogJ+WNiuW+hCcsXG4gICAgZml4ZWRSYWRpdXM6ICfku6XnsbPkuLrljZXkvY3lm7rlrprljYrlvoQnLFxuICAgIGZpeGVkUmFkaXVzRGVzY3JpcHRpb246ICflsIbljYrlvoTmmKDlsITliLDku6XnsbPkuLrljZXkvY3nmoTnu53lr7nljYrlvoTvvIjkvos6IDUg4oaSIDXnsbPvvIknLFxuICAgIHJhZGl1c1JhbmdlOiAn5Y2K5b6E6IyD5Zu0JyxcbiAgICBjbHVzdGVyUmFkaXVzOiAn6IGa57G75Y2K5b6EJyxcbiAgICByYWRpdXNSYW5nZVBpeGVsczogJ+WNiuW+hOiMg+WbtFvlg4/ntKBdJyxcbiAgICBvcGFjaXR5OiAn6YCP5piO5bqmJyxcbiAgICBjb3ZlcmFnZTogJ+imhuebluiMg+WbtCcsXG4gICAgb3V0bGluZTogJ+i9ruW7kycsXG4gICAgY29sb3JSYW5nZTogJ+iJsuW9qeiMg+WbtCcsXG4gICAgc3Ryb2tlOiAn57q/JyxcbiAgICBzdHJva2VDb2xvcjogJ+e6v+adoeminOiJsicsXG4gICAgc3Ryb2tlQ29sb3JSYW5nZTogJ+e6v+adoeiJsuW9qeiMg+WbtCcsXG4gICAgdGFyZ2V0Q29sb3I6ICfnm67moIfpopzoibInLFxuICAgIGNvbG9yQWdncmVnYXRpb246ICfpopzoibLogZrlkIgnLFxuICAgIGhlaWdodEFnZ3JlZ2F0aW9uOiAn6auY5bqm6IGa5ZCIJyxcbiAgICByZXNvbHV0aW9uUmFuZ2U6ICfliIbovqjnjofojIPlm7QnLFxuICAgIHNpemVTY2FsZTogJ+Wkp+Wwj+avlOS+iycsXG4gICAgd29ybGRVbml0U2l6ZTogJ+S4lueVjOWNleS9jeWkp+WwjycsXG4gICAgZWxldmF0aW9uU2NhbGU6ICfmtbfmi5Tmr5TkvosnLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3I6ICfkvb/nlKjpq5jnqIvnvKnmlL7ns7vmlbAnLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbjogJ+agueaNruW9k+WJjee8qeaUvuezu+aVsOiwg+aVtOa1t+aLlCcsXG4gICAgaGVpZ2h0U2NhbGU6ICfpq5jluqbmr5TkvosnLFxuICAgIGNvdmVyYWdlUmFuZ2U6ICfopobnm5bojIPlm7QnLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmc6ICfpq5jnsr7luqbmuLLmn5MnLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbjogJ+mrmOeyvuW6pua4suafk+S8muWvvOiHtOaAp+iDveS4i+mZjScsXG4gICAgaGVpZ2h0OiAn6auY5bqmJyxcbiAgICBoZWlnaHREZXNjcmlwdGlvbjogJ+eCueWHu+Wxj+W5leWPs+S4iuinkueahOaMiemSruWIh+aNouWIsDNE6KeG5Zu+JyxcbiAgICBmaWxsOiAn5aGr5YWFJyxcbiAgICBlbmFibGVQb2x5Z29uSGVpZ2h0OiAn5ZCv55So5aSa6L655b2i6auY5bqmJyxcbiAgICBzaG93V2lyZWZyYW1lOiAn5pi+56S657q/5qGGJyxcbiAgICB3ZWlnaHRJbnRlbnNpdHk6ICfliqDmnYPlvLrluqYnLFxuICAgIHpvb21TY2FsZTogJ+e8qeaUvuavlOS+iycsXG4gICAgaGVpZ2h0UmFuZ2U6ICfpq5jluqbojIPlm7QnXG4gIH0sXG4gIGxheWVyTWFuYWdlcjoge1xuICAgIGFkZERhdGE6ICfmt7vliqDmlbDmja4nLFxuICAgIGFkZExheWVyOiAn5re75Yqg5Zu+5bGCJyxcbiAgICBsYXllckJsZW5kaW5nOiAn5re35ZCI5Zu+5bGCJ1xuICB9LFxuICBtYXBNYW5hZ2VyOiB7XG4gICAgbWFwU3R5bGU6ICflnLDlm77moLflvI8nLFxuICAgIGFkZE1hcFN0eWxlOiAn5re75Yqg5Zyw5Zu+5qC35byPJyxcbiAgICAnM2RCdWlsZGluZ0NvbG9yJzogJzNEIOW7uuetkeminOiJsidcbiAgfSxcbiAgbGF5ZXJDb25maWd1cmF0aW9uOiB7XG4gICAgZGVmYXVsdERlc2NyaXB0aW9uOiAn5qC55o2u5omA6YCJ5a2X5q616K6h566XIHtwcm9wZXJ0eX0nLFxuICAgIGhvd1RvOiAn5L2/55So5pa55rOVJ1xuICB9LFxuICBmaWx0ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRmlsdGVyOiAn5re75Yqg6L+H5ruk5ZmoJ1xuICB9LFxuICBkYXRhc2V0VGl0bGU6IHtcbiAgICBzaG93RGF0YVRhYmxlOiAn5pi+56S65pWw5o2u6KGoJyxcbiAgICByZW1vdmVEYXRhc2V0OiAn5Yig6Zmk5pWw5o2u6ZuGJ1xuICB9LFxuICBkYXRhc2V0SW5mbzoge1xuICAgIHJvd0NvdW50OiAne3Jvd0NvdW50feihjCdcbiAgfSxcbiAgdG9vbHRpcDoge1xuICAgIGhpZGVMYXllcjogJ+makOiXj+WbvuWxgicsXG4gICAgc2hvd0xheWVyOiAn5pi+56S65Zu+5bGCJyxcbiAgICBoaWRlRmVhdHVyZTogJ+makOiXj+eJueW+gScsXG4gICAgc2hvd0ZlYXR1cmU6ICfmmL7npLrnibnlvoEnLFxuICAgIGhpZGU6ICfpmpDol48nLFxuICAgIHNob3c6ICfmmL7npLonLFxuICAgIHJlbW92ZUxheWVyOiAn5Yig6Zmk5Zu+5bGCJyxcbiAgICB6b29tVG9MYXllcjogJ+e8qeaUvuKYnuWbvuWxgicsXG4gICAgZHVwbGljYXRlTGF5ZXI6ICflpI3liLblm77lsYInLFxuICAgIGxheWVyU2V0dGluZ3M6ICflm77lsYLorr7nva4nLFxuICAgIGNsb3NlUGFuZWw6ICflhbPpl63lvZPliY3pnaLmnb8nLFxuICAgIHN3aXRjaFRvRHVhbFZpZXc6ICfliIfmjaLliLDlj4zlnLDlm77op4blm74nLFxuICAgIHNob3dMZWdlbmQ6ICfmmL7npLrlm77kvosnLFxuICAgIGRpc2FibGUzRE1hcDogJ+emgeeUqCAzRCDlnLDlm74nLFxuICAgIERyYXdPbk1hcDogJ+WcqOWcsOWbvuS4iue7mOWIticsXG4gICAgc2VsZWN0TG9jYWxlOiAn6YCJ5oup6K+t6KiAJyxcbiAgICBzaG93QWlBc3Npc3RhbnRQYW5lbDogJ+aYvuekuiBBSSDliqnmiYvpnaLmnb8nLFxuICAgIGhpZGVBaUFzc2lzdGFudFBhbmVsOiAn6ZqQ6JePIEFJIOWKqeaJi+mdouadvycsXG4gICAgaGlkZUxheWVyUGFuZWw6ICfpmpDol4/lm77lsYLpnaLmnb8nLFxuICAgIHNob3dMYXllclBhbmVsOiAn5pi+56S65Zu+5bGC6Z2i5p2/JyxcbiAgICBtb3ZlVG9Ub3A6ICfnp7voh7Plm77lsYLpobbpg6gnLFxuICAgIHNlbGVjdEJhc2VNYXBTdHlsZTogJ+mAieaLqeW6leWbvuagt+W8jycsXG4gICAgZGVsZXRlOiAn5Yig6ZmkJyxcbiAgICB0aW1lUGxheWJhY2s6ICfml7bnqbrlm57mlL4nLFxuICAgIGNsb3VkU3RvcmFnZTogJ+S6keWtmOWCqCcsXG4gICAgJzNETWFwJzogJzNEIOWcsOWbvicsXG4gICAgYW5pbWF0aW9uQnlXaW5kb3c6ICfnp7vliqjml7bpl7Tnqpflj6MnLFxuICAgIGFuaW1hdGlvbkJ5SW5jcmVtZW50YWw6ICflop7ph4/ml7bpl7Tnqpflj6MnLFxuICAgIHNwZWVkOiAn6YCf5bqmJyxcbiAgICBwbGF5OiAn5pKt5pS+JyxcbiAgICBwYXVzZTogJ+aaguWBnCcsXG4gICAgcmVzZXQ6ICfph43nva4nXG4gIH0sXG4gIHRvb2xiYXI6IHtcbiAgICBleHBvcnRJbWFnZTogJ+WvvOWHuuWbvueJhycsXG4gICAgZXhwb3J0RGF0YTogJ+WvvOWHuuaVsOaNricsXG4gICAgZXhwb3J0TWFwOiAn5a+85Ye65Zyw5Zu+JyxcbiAgICBzaGFyZU1hcFVSTDogJ+WIhuS6q+WcsOWbvue9keWdgCcsXG4gICAgc2F2ZU1hcDogJ+S/neWtmOWcsOWbvicsXG4gICAgc2VsZWN0OiAn6YCJ5oupJyxcbiAgICBwb2x5Z29uOiAncG9seWdvbicsXG4gICAgcmVjdGFuZ2xlOiAncmVjdGFuZ2xlJyxcbiAgICBoaWRlOiAn6ZqQ6JePJyxcbiAgICBzaG93OiAn5pi+56S6JyxcbiAgICAuLi5MT0NBTEVTXG4gIH0sXG4gIGVkaXRvcjoge1xuICAgIGZpbHRlckxheWVyOiAn6L+H5ruk5Zu+5bGCJyxcbiAgICBjb3B5R2VvbWV0cnk6ICflpI3liLblh6DkvZXlm77lvaInXG4gIH0sXG4gIG1vZGFsOiB7XG4gICAgdGl0bGU6IHtcbiAgICAgIGRlbGV0ZURhdGFzZXQ6ICfliKDpmaTmlbDmja7pm4YnLFxuICAgICAgYWRkRGF0YVRvTWFwOiAn5re75Yqg5pWw5o2u5Yiw5Zyw5Zu+JyxcbiAgICAgIGV4cG9ydEltYWdlOiAn5a+85Ye65Zu+54mHJyxcbiAgICAgIGV4cG9ydERhdGE6ICflr7zlh7rmlbDmja4nLFxuICAgICAgZXhwb3J0TWFwOiAn5a+85Ye65Zyw5Zu+JyxcbiAgICAgIGFkZEN1c3RvbU1hcGJveFN0eWxlOiAn5re75Yqg6Ieq5a6a5LmJ5Zyw5Zu+JyxcbiAgICAgIHNhdmVNYXA6ICfkv53lrZjlnLDlm74nLFxuICAgICAgc2hhcmVVUkw6ICfliIbkuqvnvZHlnYAnXG4gICAgfSxcbiAgICBidXR0b246IHtcbiAgICAgIGRlbGV0ZTogJ+WIoOmZpCcsXG4gICAgICBkb3dubG9hZDogJ+S4i+i9vScsXG4gICAgICBleHBvcnQ6ICflh7rlj6MnLFxuICAgICAgYWRkU3R5bGU6ICfmt7vliqDmoLflvI8nLFxuICAgICAgc2F2ZTogJ+S/neWtmCcsXG4gICAgICBkZWZhdWx0Q2FuY2VsOiAn5Y+W5raIJyxcbiAgICAgIGRlZmF1bHRDb25maXJtOiAn56Gu6K6kJ1xuICAgIH0sXG4gICAgZXhwb3J0SW1hZ2U6IHtcbiAgICAgIHJhdGlvVGl0bGU6ICfmr5TnjocnLFxuICAgICAgcmF0aW9EZXNjcmlwdGlvbjogJ+mAieaLqeS4jeWQjOeUqOmAlOeahOavlOS+i+OAgicsXG4gICAgICByYXRpb09yaWdpbmFsU2NyZWVuOiAn5Y6f5aeL5bGP5bmVJyxcbiAgICAgIHJhdGlvQ3VzdG9tOiAn6Ieq5a6a5LmJJyxcbiAgICAgIHJhdGlvNF8zOiAnNDozJyxcbiAgICAgIHJhdGlvMTZfOTogJzE2OjknLFxuICAgICAgcmVzb2x1dGlvblRpdGxlOiAn5YiG6L6o546HJyxcbiAgICAgIHJlc29sdXRpb25EZXNjcmlwdGlvbjogJ+mrmOWIhui+qOeOh+abtOmAguWQiOaJk+WNsOOAgicsXG4gICAgICBtYXBMZWdlbmRUaXRsZTogJ+WcsOWbvuWbvuS+iycsXG4gICAgICBtYXBMZWdlbmRBZGQ6ICflnKjlnLDlm77kuIrmt7vliqDlm77kvosnXG4gICAgfSxcbiAgICBleHBvcnREYXRhOiB7XG4gICAgICBkYXRhc2V0VGl0bGU6ICfmlbDmja7pm4YnLFxuICAgICAgZGF0YXNldFN1YnRpdGxlOiAn6YCJ5oup6KaB5a+85Ye655qE5pWw5o2u6ZuGJyxcbiAgICAgIGFsbERhdGFzZXRzOiAn5YWo6YOoJyxcbiAgICAgIGRhdGFUeXBlVGl0bGU6ICfmlbDmja7nsbvlnosnLFxuICAgICAgZGF0YVR5cGVTdWJ0aXRsZTogJ+mAieaLqeimgeWvvOWHuueahOaVsOaNruexu+WeiycsXG4gICAgICBmaWx0ZXJEYXRhVGl0bGU6ICfov4fmu6TmlbDmja4nLFxuICAgICAgZmlsdGVyRGF0YVN1YnRpdGxlOiAn5Y+v5Lul6YCJ5oup5a+85Ye65Y6f5aeL5pWw5o2u5oiW6L+H5ruk5ZCO55qE5pWw5o2uJyxcbiAgICAgIGZpbHRlcmVkRGF0YTogJ+i/h+a7pOaVsOaNricsXG4gICAgICB1bmZpbHRlcmVkRGF0YTogJ+WFg+aVsOaNricsXG4gICAgICBmaWxlQ291bnQ6ICd7ZmlsZUNvdW50fSDkuKrmlofku7YnLFxuICAgICAgcm93Q291bnQ6ICd7cm93Q291bnR9IOihjCdcbiAgICB9LFxuICAgIGRlbGV0ZURhdGE6IHtcbiAgICAgIHdhcm5pbmc6ICfnoa7orqTopoHliKDpmaTov5nkuKrmlbDmja7pm4bjgILlroPkvJrlvbHlk40ge2xlbmd0aH0g5Liq5bGCJ1xuICAgIH0sXG4gICAgYWRkU3R5bGU6IHtcbiAgICAgIHB1Ymxpc2hUaXRsZTpcbiAgICAgICAgJzIuIOWmguaenOWcqOatpemqpDHkuK3ovpPlhaXkuoYgbWFwYm94IOagt+W8j+eahCB1cmzvvIzpnIDopoHlnKggbWFwYm94IOS4iuWPkeW4g+agt+W8j+aIluaPkOS+m+iuv+mXruS7pOeJjO+8iGFjY2VzcyB0b2tlbu+8ieOAgu+8iOWPr+mAie+8iScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUxOiAn5Y+v5Lul5Zyo5Lul5LiL5L2N572u5Yib5bu66Ieq5bex55qE5Zyw5Zu+5qC35byPJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTI6ICflubYnLFxuICAgICAgcHVibGlzaFN1YnRpdGxlMzogJ+WPkeW4gycsXG4gICAgICBwdWJsaXNoU3VidGl0bGU0OiAn44CCJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTU6ICfkvb/nlKjnp4HmnInmoLflvI/vvIzpnIDnspjotLQnLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNjogJ+iuv+mXruS7pOeJjO+8iGFjY2VzcyB0b2tlbu+8iScsXG4gICAgICBwdWJsaXNoU3VidGl0bGU3OiAn44CCKiBLZXBsZXIuZ2wg5piv5LiA5Liq5a6i5oi356uv5bqU55So56iL5bqP77yM5pWw5o2u5L+d55WZ5Zyo5oKo55qE5rWP6KeI5Zmo5Lit44CCJyxcbiAgICAgIGV4YW1wbGVUb2tlbjogJ+S+iykgcGsuYWJjZGVmZy54eHh4eHgnLFxuICAgICAgcGFzdGVUaXRsZTogJzEuIOeymOi0tOagt+W8jyB1cmwnLFxuICAgICAgcGFzdGVTdWJ0aXRsZTA6ICfmoLflvI8gdXJsIOWPr+S7peaYryBNYXBib3gg55qEJyxcbiAgICAgIHBhc3RlU3VidGl0bGUxOiAn5LuA5LmI5pivJyxcbiAgICAgIHBhc3RlU3VidGl0bGUyOiAn5qC35byPIFVSTO+8jCcsXG4gICAgICBwYXN0ZVN1YnRpdGxlMzogJ+i/mOWPr+S7peS9v+eUqOmBteS7jk1hcGJveCBHTOagt+W8j+eahHN0eWxlLmpzb27nmoR1cmzvvJonLFxuICAgICAgcGFzdGVTdWJ0aXRsZTQ6ICdNYXBib3ggR0wg5qC35byP6KeE6IyDJyxcbiAgICAgIG5hbWluZ1RpdGxlOiAnMy4g5ZG95ZCN5L2g55qE5qC35byPJ1xuICAgIH0sXG4gICAgc2hhcmVNYXA6IHtcbiAgICAgIHNoYXJlVXJpVGl0bGU6ICfliIbkuqvlnLDlm77nvZHlnYAnLFxuICAgICAgc2hhcmVVcmlTdWJ0aXRsZTogJ+eUn+aIkOWIhuS6q+WcsOWbvueahOmTvuaOpScsXG4gICAgICBjbG91ZFRpdGxlOiAn5LqR5a2Y5YKoJyxcbiAgICAgIGNsb3VkU3VidGl0bGU6ICfnmbvlvZXlubblsIblnLDlm77mlbDmja7kuIrkvKDliLDkuKrkurrkupHlrZjlgqgnLFxuICAgICAgc2hhcmVEaXNjbGFpbWVyOlxuICAgICAgICAna2VwbGVyLmdsIOWwhuWIm+W7uueahOWcsOWbvuWtmOWCqOWcqOS4quS6uuS6keWtmOWCqOS4re+8jOWboOatpOWPquacieefpemBkyBVUkwg55qE5Lq65omN6IO96K6/6Zeu5Zyw5Zu+5Y+K5YW25pWw5o2u44CCJyArXG4gICAgICAgICflj6/ku6Xpmo/ml7bkvb/nlKjkuKrkurrkupHlrZjlgqjluJDmiLfnvJbovpEv5Yig6Zmk5pWw5o2u5paH5Lu244CCJyxcbiAgICAgIGdvdG9QYWdlOiAn6Lez6L2s5YiwS2VwbGVyLmds55qEe2N1cnJlbnRQcm92aWRlcn3pobXpnaInXG4gICAgfSxcbiAgICBzdGF0dXNQYW5lbDoge1xuICAgICAgbWFwVXBsb2FkaW5nOiAn5Zyw5Zu+5LiK5Lyg5LitJyxcbiAgICAgIGVycm9yOiAn6ZSZ6K+vJ1xuICAgIH0sXG4gICAgc2F2ZU1hcDoge1xuICAgICAgdGl0bGU6ICfkupHlrZjlgqgnLFxuICAgICAgc3VidGl0bGU6ICfnmbvlvZXku6XlsIblnLDlm77kv53lrZjliLDkuKrkurrkupHlrZjlgqgnXG4gICAgfSxcbiAgICBleHBvcnRNYXA6IHtcbiAgICAgIGZvcm1hdFRpdGxlOiAn5Zyw5Zu+55qE5qC85byPJyxcbiAgICAgIGZvcm1hdFN1YnRpdGxlOiAn6YCJ5oup5a+85Ye65Zyw5Zu+55qE5qC85byPJyxcbiAgICAgIGh0bWw6IHtcbiAgICAgICAgc2VsZWN0aW9uOiAn5bCG5Zyw5Zu+5a+85Ye66Iez5Lqk5LqS5byP55qEaHRtbOaWh+S7tuS4reOAgicsXG4gICAgICAgIHRva2VuVGl0bGU6ICdNYXBib3jnmoTorr/pl67ku6TniYzvvIhhY2Nlc3MgdG9rZW7vvIknLFxuICAgICAgICB0b2tlblN1YnRpdGxlOiAn5ZyoIGh0bWwg5Lit5L2/55So6Ieq5bex55qEIE1hcGJveCDorr/pl67ku6TniYzvvIhhY2Nlc3MgdG9rZW7vvInvvIjlj6/pgInvvIknLFxuICAgICAgICB0b2tlblBsYWNlaG9sZGVyOiAn57KY6LS05Liq5Lq655qEIE1hcGJveCDorr/pl67ku6TniYxhY2Nlc3MgdG9rZW7vvIknLFxuICAgICAgICB0b2tlbk1pc3VzZVdhcm5pbmc6XG4gICAgICAgICAgJyog5aaC5p6c5oKo5LiN5o+Q5L6b6Ieq5bex55qE5Luk54mM77yM5YiZ5Zyo5oiR5Lus5pu05o2i5Luk54mM5pe277yM5Zyw5Zu+5Y+v6IO96ZqP5pe25peg5rOV5pi+56S677yM5Lul5YWN6KKr5rul55So44CCJyxcbiAgICAgICAgdG9rZW5EaXNjbGFpbWVyOiAn5Y+v5Lul56iN5ZCO5L2/55So5Lul5LiL6K+05piO5pu05pS5IE1hcGJveCDku6TniYzvvJonLFxuICAgICAgICB0b2tlblVwZGF0ZTogJ+WmguS9leabtOaWsOeOsOacieeahOWcsOWbvuS7pOeJjOOAgicsXG4gICAgICAgIG1vZGVUaXRsZTogJ+WcsOWbvuaooeW8jycsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTE6ICfpgInmi6nlnLDlm77mqKHlvI/jgILmm7TlpJrnmoQnLFxuICAgICAgICBtb2RlU3VidGl0bGUyOiAn5L+h5oGvJyxcbiAgICAgICAgbW9kZURlc2NyaXB0aW9uOiAn5YWB6K6455So5oi3e21vZGV95Zyw5Zu+JyxcbiAgICAgICAgcmVhZDogJ+mYheivuycsXG4gICAgICAgIGVkaXQ6ICfnvJbovpEnXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICBjb25maWdUaXRsZTogJ+WcsOWbvumFjee9ricsXG4gICAgICAgIGNvbmZpZ0Rpc2NsYWltZXI6XG4gICAgICAgICAgJ+WcsOWbvumFjee9ruWwhuWMheWQq+WcqCBKc29uIOaWh+S7tuS4reOAguWmguaenOaCqOWcqOiHquW3seeahOW6lOeUqOeoi+W6j+S4reS9v+eUqCBrZXBsZXIuZ2zjgILmgqjlj6/ku6XlpI3liLbmraTphY3nva7lubblsIblhbbkvKDpgJLnu5knLFxuICAgICAgICBzZWxlY3Rpb246XG4gICAgICAgICAgJ+WwhuW9k+WJjeWcsOWbvuaVsOaNruWSjOmFjee9ruWvvOWHuuWIsOWNleS4qiBKc29uIOaWh+S7tuS4reOAgueojeWQjuaCqOWPr+S7pemAmui/h+WwhuatpOaWh+S7tuS4iuS8oOWIsCBrZXBsZXIuZ2wg5p2l5omT5byA5ZCM5LiA5byg5Zyw5Zu+44CCJyxcbiAgICAgICAgZGlzY2xhaW1lcjpcbiAgICAgICAgICAnKiDlnLDlm77phY3nva7kuI7liqDovb3nmoTmlbDmja7pm4bnm7jnu5PlkIjjgIIg4oCcZGF0YUlk4oCd55So5LqO5bCG5Zu+5bGC44CB6L+H5ruk5Zmo5ZKM5bel5YW35o+Q56S657uR5a6a5Yiw54m55a6a5pWw5o2u6ZuG44CCJyArXG4gICAgICAgICAgJ+WwhuatpOmFjee9ruS8oOmAkue7mSBhZGREYXRhVG9NYXAg5pe277yM6K+356Gu5L+d5pWw5o2u6ZuGIElEIOS4juatpOmFjee9ruS4reeahCBkYXRhSWQvcyDljLnphY3jgIInXG4gICAgICB9XG4gICAgfSxcbiAgICBsb2FkaW5nRGlhbG9nOiB7XG4gICAgICBsb2FkaW5nOiAn5Yqg6L295LitLi4uJ1xuICAgIH0sXG4gICAgbG9hZERhdGE6IHtcbiAgICAgIHVwbG9hZDogJ+S4iuS8oOaWh+S7ticsXG4gICAgICBzdG9yYWdlOiAn5LuO5a2Y5YKo5Lit5Yqg6L29J1xuICAgIH0sXG4gICAgdHJpcEluZm86IHtcbiAgICAgIHRpdGxlOiAn5aaC5L2V5ZCv55So56e75Yqo5Yqo55S7JyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ+imgei3r+W+hOiuvue9ruWKqOeUu++8jGdlb0pTT04g5pWw5o2u5b+F6aG75YyF5ZCrIGBMaW5lU3RyaW5nYCDkvZzkuLropoHntKDlh6DkvZXjgILmraTlpJbvvIxMaW5lU3RyaW5nIOeahOWdkOagh+acieWbm+S4quWFg+e0oCcsXG4gICAgICBjb2RlOiAnIFvnu4/luqbvvIznuqzluqbvvIzpq5jnqIvvvIzml7bpl7TmiLNdICcsXG4gICAgICBkZXNjcmlwdGlvbjI6XG4gICAgICAgICfmnIDlkI7kuIDkuKrlhYPntKDmmK/ml7bpl7TmiLPjgILmnInmlYjnmoTml7bpl7TmiLPmoLzlvI/ljIXmi6zku6Xnp5LkuLrljZXkvY3nmoQgdW5peO+8jOS+i+WmgmAxNTY0MTg0MzYzYOaIluS7peavq+enkuS4uuWNleS9jeeahGAxNTY0MTg0MzYzMDAwYOOAgicsXG4gICAgICBleGFtcGxlOiAn5L6L77yaJ1xuICAgIH0sXG4gICAgaWNvbkluZm86IHtcbiAgICAgIHRpdGxlOiAn5aaC5L2V57uY5Yi25Zu+5qCHJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ+WcqOaCqOeahCBjc3Yg5Lit77yM5Yib5bu65LiA5YiX77yM5bCG5oKo6KaB57uY5Yi255qE5Zu+5qCH55qE5ZCN56ew5pS+5YWl5YW25Lit44CC5aaC5p6c5LiN5oOz5Zyo5p+Q5Lqb54K55LiK5pi+56S65Zu+5qCH77yM5Y+v5Lul5bCG5Y2V5YWD5qC855WZ56m644CC5b2T5YiX6KKr5ZG95ZCN5Li6JyxcbiAgICAgIGNvZGU6ICflm77moIcnLFxuICAgICAgZGVzY3JpcHRpb24yOiAn5pe277yMa2VwbGVyLmdsIOS8muiHquWKqOS4uuS9oOWIm+W7uuS4gOS4quWbvuagh+WxguOAgicsXG4gICAgICBleGFtcGxlOiAn5L6LOicsXG4gICAgICBpY29uczogJ+Wbvuagh+S4gOiniCdcbiAgICB9LFxuICAgIHN0b3JhZ2VNYXBWaWV3ZXI6IHtcbiAgICAgIGxhc3RNb2RpZmllZDogJ+S4iuasoeS/ruaUuSB7bGFzdFVwZGF0ZWR9IOWJjScsXG4gICAgICBiYWNrOiAn6L+U5ZueJ1xuICAgIH0sXG4gICAgb3ZlcndyaXRlTWFwOiB7XG4gICAgICB0aXRsZTogJ+ato+WcqOS/neWtmOWcsOWbvi4uLicsXG4gICAgICBhbHJlYWR5RXhpc3RzOiAn5bey57uP5a2Y5Zyo5LqOIHttYXBTYXZlZH0g5Lit44CC5L2g5oOz6KaG55uW5ZCX77yfJ1xuICAgIH0sXG4gICAgbG9hZFN0b3JhZ2VNYXA6IHtcbiAgICAgIGJhY2s6ICfov5Tlm54nLFxuICAgICAgZ29Ub1BhZ2U6ICfot7PovazliLAgS2VwbGVyLmdsIOeahCB7ZGlzcGxheU5hbWV9IOmhtemdoicsXG4gICAgICBzdG9yYWdlTWFwczogJ+WtmOWCqCAvIOWcsOWbsycsXG4gICAgICBub1NhdmVkTWFwczogJ+i/mOayoeacieS/neWtmOeahOWcsOWbvidcbiAgICB9XG4gIH0sXG4gIGhlYWRlcjoge1xuICAgIHZpc2libGVMYXllcnM6ICflj6/op4Hlm77lsYInLFxuICAgIGxheWVyTGVnZW5kOiAn5Zu+5bGC5Zu+5L6LJ1xuICB9LFxuICBpbnRlcmFjdGlvbnM6IHtcbiAgICB0b29sdGlwOiAn5bel5YW35o+Q56S6JyxcbiAgICBicnVzaDogJ+WItycsXG4gICAgY29vcmRpbmF0ZTogJ+WdkOaghycsXG4gICAgZ2VvY29kZXI6ICflnLDnkIbnvJbnoIHlmagnXG4gIH0sXG4gIGxheWVyQmxlbmRpbmc6IHtcbiAgICB0aXRsZTogJ+WbvuWxgua3t+WQiCcsXG4gICAgYWRkaXRpdmU6ICdhZGRpdGl2ZScsXG4gICAgbm9ybWFsOiAnbm9ybWFsJyxcbiAgICBzdWJ0cmFjdGl2ZTogJ3N1YnRyYWN0aXZlJ1xuICB9LFxuICBjb2x1bW5zOiB7XG4gICAgdGl0bGU6ICfliJcnLFxuICAgIGxhdDogJ+e6rOW6picsXG4gICAgbG5nOiAn57uP5bqmJyxcbiAgICBhbHRpdHVkZTogJ+a1t+aLlCcsXG4gICAgaWNvbjogJ+WbvuaghycsXG4gICAgZ2VvanNvbjogJ2dlb2pzb24nLFxuICAgIHRva2VuOiAn5Luk54mMJyxcbiAgICBhcmM6IHtcbiAgICAgIGxhdDA6ICfotbfngrkg57qs5bqmJyxcbiAgICAgIGxuZzA6ICfotbfngrkg57uP5bqmJyxcbiAgICAgIGxhdDE6ICfnu4jngrkg57qs5bqmJyxcbiAgICAgIGxuZzE6ICfnu4jngrkg57uP5bqmJ1xuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ+e9keagvOWkp+WwjyAoa20pJ1xuICAgIH0sXG4gICAgaGV4YWdvbjoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ+WFrei+ueW9ouWNiuW+hCAoa20pJ1xuICAgIH0sXG4gICAgaGV4X2lkOiAnaGV4IGlkJ1xuICB9LFxuICBjb2xvcjoge1xuICAgIGN1c3RvbVBhbGV0dGU6ICfoh6rlrprkuYnosIPoibLmnb8nLFxuICAgIHN0ZXBzOiAn5q2l6aqkJyxcbiAgICB0eXBlOiAn57G75Z6LJyxcbiAgICByZXZlcnNlZDogJ+WPjei9rCdcbiAgfSxcbiAgc2NhbGU6IHtcbiAgICBjb2xvclNjYWxlOiAn6Imy6Zi2JyxcbiAgICBzaXplU2NhbGU6ICflpKflsI/mr5TkvosnLFxuICAgIHN0cm9rZVNjYWxlOiAn5o+P6L655q+U5L6LJyxcbiAgICBzY2FsZTogJ+inhOaooSdcbiAgfSxcbiAgZmlsZVVwbG9hZGVyOiB7XG4gICAgbWVzc2FnZTogJ+WwhuaCqOeahOaWh+S7tuaLluaUvuWIsOatpOWkhO+8iOWPr+WkmuS4qu+8iScsXG4gICAgY2hyb21lTWVzc2FnZTpcbiAgICAgICcq5a+55LqOIENocm9tZSDnlKjmiLfvvJrmlofku7blpKflsI/mnIDlpKfkuLogMjUwbWLjgILlpoLmnpzpnIDopoHkuIrkvKDmm7TlpJrmlofku7bvvIzor7flsJ3or5Xkvb/nlKggU2FmYXJp44CCJyxcbiAgICBkaXNjbGFpbWVyOlxuICAgICAgJyoga2VwbGVyLmdsIOWcqOWuouaIt+err+S4iuW3peS9nOOAguaVsOaNruS7heS/neeVmeWcqOaCqOiHquW3seeahOiuvuWkhy/mtY/op4jlmajkuK3jgIInICtcbiAgICAgICfmsqHmnInkv6Hmga/miJblnLDlm77mlbDmja7ooqvlj5HpgIHliLDku7vkvZXmnI3liqHlmajjgIInLFxuICAgIGNvbmZpZ1VwbG9hZE1lc3NhZ2U6XG4gICAgICAn5LiK5LygIHtmaWxlRm9ybWF0TmFtZXN9IOaIluS/neWtmOeahOWcsOWbviAqKkpzb24qKuOAgumYheivu+abtOWkmuWFs+S6jlsqKuaUr+aMgeeahOaWh+S7tuagvOW8jyoqXScsXG4gICAgYnJvd3NlRmlsZXM6ICfmtY/op4jkvaDnmoTmlofku7YnLFxuICAgIHVwbG9hZGluZzogJ+S4iuS8oCcsXG4gICAgZmlsZU5vdFN1cHBvcnRlZDogJ+S4jeaUr+aMgeaWh+S7tiB7ZXJyb3JGaWxlc33jgIInLFxuICAgIG9yOiAn5oiWJ1xuICB9LFxuICBnZW9jb2Rlcjoge1xuICAgIHRpdGxlOiAn6L6T5YWl5Zyw5Z2A5oiW5Z2Q5qCH77yI5L6L77yaIDM3Ljc5LC0xMjIuNDDvvIknXG4gIH0sXG4gIGZpZWxkU2VsZWN0b3I6IHtcbiAgICBjbGVhckFsbDogJ+a4hemZpOaJgOaciScsXG4gICAgZm9ybWF0dGluZzogJ+agvOW8j+WMlidcbiAgfSxcbiAgY29tcGFyZToge1xuICAgIG1vZGVMYWJlbDogJ+avlOi+g+aooeW8jycsXG4gICAgdHlwZUxhYmVsOiAn5q+U6L6D57G75Z6LJyxcbiAgICB0eXBlczoge1xuICAgICAgYWJzb2x1dGU6ICfnu53lr7knLFxuICAgICAgcmVsYXRpdmU6ICfnm7jlr7knXG4gICAgfVxuICB9LFxuICBtYXBQb3BvdmVyOiB7XG4gICAgcHJpbWFyeTogJ+S4u+imgSdcbiAgfSxcbiAgZGVuc2l0eTogJ+WvhuW6picsXG4gICdCdWcgUmVwb3J0JzogJ+mUmeivr+aKpeWRiicsXG4gICdVc2VyIEd1aWRlJzogJ+eUqOaIt+aMh+WNlycsXG4gIFNhdmU6ICfkv53lrZgnLFxuICBTaGFyZTogJ+WIhuS6qydcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBR0EsSUFBQUEsUUFBQSxHQUFBQyxPQUFBO0FBQW1DLFNB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