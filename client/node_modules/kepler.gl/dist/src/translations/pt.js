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
    weight: 'Espessura do texto',
    label: 'Rótulo',
    fillColor: 'Cor do preenchimento',
    color: 'Cor',
    strokeColor: 'Cor da borda',
    radius: 'Raio',
    outline: 'Contorno',
    stroke: 'Traçado',
    density: 'Densidade',
    height: 'Altura',
    sum: 'Soma',
    pointCount: 'Contagem de Pontos'
  },
  placeholder: {
    search: 'Pesquisar',
    selectField: 'Selecione um campo',
    yAxis: 'Eixo Y',
    selectType: 'Selecione um Tipo',
    selectValue: 'Selecione um valor',
    enterValue: 'Insira um valor',
    empty: 'Vazio'
  },
  misc: {
    by: '',
    valuesIn: 'Valores em',
    valueEquals: 'Valor igual a',
    dataSource: 'Origem dos dados',
    brushRadius: 'Raio do Traço (km)',
    empty: ' '
  },
  mapLayers: {
    title: 'Camadas do mapa',
    label: 'Rótulo',
    road: 'Estrada',
    border: 'Fronteira',
    building: 'Edifícios',
    water: 'Água',
    land: 'Terra',
    '3dBuilding': 'Edifícios em 3d',
    background: 'Fundo'
  },
  panel: {
    text: {
      label: 'Rótulo',
      labelWithId: 'Rótulo {labelId}',
      fontSize: 'Tamanho da fonte',
      fontColor: 'Cor da fonte',
      textAnchor: 'Âncora do texto',
      alignment: 'Alinhamento',
      addMoreLabel: 'Adicionar mais Rótulos'
    }
  },
  sidebar: {
    panels: {
      layer: 'Camadas',
      filter: 'Filtros',
      interaction: 'Interações',
      basemap: 'Mapa base'
    }
  },
  layer: {
    required: 'Obrigatório*',
    radius: 'Raio',
    color: 'Cor',
    fillColor: 'Cor de preenchimento',
    outline: 'Contorno',
    weight: 'Espessura',
    propertyBasedOn: '{property} baseada em',
    coverage: 'Cobertura',
    stroke: 'Traço',
    strokeWidth: 'Largura do Traçado',
    strokeColor: 'Cor do Traçado',
    basic: 'Básico',
    trailLength: 'Comprimento da trilha',
    trailLengthDescription: 'Número de segundos para um caminho completamente desaparecer',
    newLayer: 'nova camada',
    elevationByDescription: 'Quando desligado, a altura é baseada na contagem de pontos',
    colorByDescription: 'Quando desligado, a cor é baseada na contagem de pontos',
    aggregateBy: '{field} agregado por',
    '3DModel': 'Modelo 3D',
    '3DModelOptions': 'Opções do Modelo 3D',
    type: {
      point: 'ponto',
      arc: 'arco',
      line: 'linha',
      grid: 'grade',
      hexbin: 'hexágono',
      polygon: 'polígono',
      geojson: 'geojson',
      cluster: 'grupo',
      icon: 'icon',
      heatmap: 'mapa de calor',
      hexagon: 'hexágono',
      hexagonid: 'H3',
      trip: 'viagem',
      s2: 'S2',
      '3d': '3D'
    },
    layerUpdateError: 'Ocorreu um erro ao atualizar a camada: {errorMessage}. Certifique-se de que o formato dos dados de entrada seja válido.'
  },
  layerVisConfigs: {
    strokeWidth: 'Largura do Traço',
    strokeWidthRange: 'Alcance da Largura do Traço',
    radius: 'Raio',
    fixedRadius: 'Raio ajustado para metro',
    fixedRadiusDescription: 'Raio do Mapa para Raio absoluto em metros, e.g. 5 para 5 metros',
    radiusRange: 'Alcance do Raio',
    clusterRadius: 'Raio do Agrupamento em pixels',
    radiusRangePixels: 'Alcance do Raio em pixels',
    billboard: 'Câmera de rosto',
    billboardDescription: 'Oriente a geometria em direção à câmera',
    fadeTrail: 'Fade trilha',
    opacity: 'Opacidade',
    coverage: 'Cobertura',
    outline: 'Contorno',
    colorRange: 'Alcance da Cor',
    stroke: 'Traçado',
    strokeColor: 'Cor do Traçado',
    strokeColorRange: 'Alcance da Cor do Traçado',
    targetColor: 'Cor de destino',
    colorAggregation: 'Agregação da Cor',
    heightAggregation: 'Agregação da Altura',
    resolutionRange: 'Alcance da Resolução',
    sizeScale: 'Escala de tamanho',
    worldUnitSize: 'Tamanho unitário do mundo',
    elevationScale: 'Escala de Elevação',
    enableElevationZoomFactor: 'Use fator de zoom de elevação',
    enableElevationZoomFactorDescription: 'Ajuste a altura / elevação com base no fator de zoom atual',
    enableHeightZoomFactor: 'Usar fator de zoom de altura',
    heightScale: 'Escala de Altura',
    coverageRange: 'Alcance de cobertura',
    highPrecisionRendering: 'Renderização de Alta Precisão',
    highPrecisionRenderingDescription: 'Alta precisão irá em resultar em baixa performance',
    height: 'Altura',
    heightDescription: 'Clique no botão no canto superior direito para trocar para a visualização 3d',
    fill: 'Preenchimento',
    enablePolygonHeight: 'Habilitar Altura de Polígono',
    showWireframe: 'Mostrar Wireframe',
    weightIntensity: 'Intensidade da Espessura',
    zoomScale: 'Escala do Zoom',
    heightRange: 'Alcance da Altura',
    heightMultiplier: 'Multiplicador de altura',
    fixedHeight: 'Altura fixa',
    fixedHeightDescription: 'Use a altura sem modificações'
  },
  layerManager: {
    addData: 'Adicionar Dados',
    addLayer: 'Adicionar Camada',
    layerBlending: 'Mistura de Camada'
  },
  mapManager: {
    mapStyle: 'Estilo do Mapa',
    addMapStyle: 'Adicionar Estilo de Mapa',
    '3dBuildingColor': 'Cor do Edifício 3D',
    backgroundColor: 'Cor de Fundo'
  },
  layerConfiguration: {
    defaultDescription: 'Calcular {property} baseada no campo selecionado',
    howTo: 'Como'
  },
  filterManager: {
    addFilter: 'Adicionar Filtro'
  },
  datasetTitle: {
    showDataTable: 'Mostrar tabela de dados',
    removeDataset: 'Remover tabela de dados'
  },
  datasetInfo: {
    rowCount: '{rowCount} linhas'
  },
  tooltip: {
    hideLayer: 'esconder camada',
    showLayer: 'mostrar camada',
    hideFeature: 'Esconder propriedade',
    showFeature: 'Mostrar propriedade',
    hide: 'esconder',
    show: 'mostrar',
    removeLayer: 'Remover Camada',
    resetAfterError: 'Tente habilitar a camada após um erro',
    layerSettings: 'Configurações de Camada',
    closePanel: 'Fechar painel atual',
    switchToDualView: 'Trocar para visualização dupla de mapa',
    showLegend: 'mostrar legenda',
    disable3DMap: 'Desabilitar Mapa 3D',
    DrawOnMap: 'Desenhar no mapa',
    selectLocale: 'Selecionar língua',
    showAiAssistantPanel: 'Mostrar painel de AI Assistant',
    hideAiAssistantPanel: 'Esconder painel de AI Assistant',
    hideLayerPanel: 'Esconder painel de camada',
    showLayerPanel: 'Mostrar painel de camada',
    moveToTop: 'Mover para o topo das camadas',
    selectBaseMapStyle: 'Selecionar o Estilo do Mapa Base',
    "delete": 'Deletar',
    timePlayback: 'Tempo de reprodução',
    cloudStorage: 'Armazenamento Cloud',
    '3DMap': ' Mapa 3D'
  },
  toolbar: _objectSpread({
    exportImage: 'Exportar Imagem',
    exportData: 'Exportar Dados',
    exportMap: 'Exportar Mapa',
    shareMapURL: 'Compartilhar URL do Mapa',
    saveMap: 'Salvar Mapa',
    select: 'selecionar',
    polygon: 'polígono',
    rectangle: 'retângulo',
    hide: 'esconder',
    show: 'mostrar'
  }, _locales.LOCALES),
  modal: {
    title: {
      deleteDataset: 'Deletar Conjunto de Dados',
      addDataToMap: 'Adicionar Dados ao Mapa',
      exportImage: 'Exportar Imagem',
      exportData: 'Exportar Dados',
      exportMap: 'Exportar Mapa',
      addCustomMapboxStyle: 'Adicionar Estilo Mapbox Customizado',
      saveMap: 'Salvar Mapa',
      shareURL: 'Compartilhar URL'
    },
    button: {
      "delete": 'Deletar',
      download: 'Download',
      "export": 'Exportar',
      addStyle: 'Adicionar Estilo',
      save: 'Salvar',
      defaultCancel: 'Cancelar',
      defaultConfirm: 'Confirmar'
    },
    exportImage: {
      ratioTitle: 'Proporção',
      ratioDescription: 'Escolha a proporção para vários usos.',
      ratioOriginalScreen: 'Tela Original',
      ratioCustom: 'Customizado',
      ratio4_3: '4:3',
      ratio16_9: '16:9',
      resolutionTitle: 'Resolução',
      resolutionDescription: 'Alta resolução é melhor para impressões.',
      mapLegendTitle: 'Legenda do Mapa',
      mapLegendAdd: 'Adicionar Legenda no mapa'
    },
    exportData: {
      datasetTitle: 'Conjunto de dados',
      datasetSubtitle: 'Escolha o conjunto de dados que você quer exportar',
      allDatasets: 'Todos',
      dataTypeTitle: 'Tipo de Dado',
      dataTypeSubtitle: 'Escolha o tipo de dados que você quer exportar',
      filterDataTitle: 'Filtrar Dados',
      filterDataSubtitle: 'Você pode escolher exportar os dados originais ou os dados filtrados',
      filteredData: 'Dados Filtrados',
      unfilteredData: 'Dados não filtrados',
      fileCount: '{fileCount} Arquivos',
      rowCount: '{rowCount} Linhas'
    },
    deleteData: {
      warning: 'você irá deletar esse conjunto de dados. Isso irá afetar {length} camadas'
    },
    addStyle: {
      publishTitle: '1. Publique o seu Estilo no Mapbox ou providencie a chave de acesso',
      publishSubtitle1: 'Você pode criar o seu próprio estilo em',
      publishSubtitle2: 'e',
      publishSubtitle3: 'publicar',
      publishSubtitle4: 'isso.',
      publishSubtitle5: 'Para utilizar estilo privado, cole a sua',
      publishSubtitle6: 'chave de acesso',
      publishSubtitle7: 'aqui. *kepler.gl é uma aplicação client-side, os dados permanecem no seu browser..',
      exampleToken: 'e.g. pk.abcdefg.xxxxxx',
      pasteTitle: '2. Cole a url do seu estilo',
      pasteSubtitle1: 'O que é uma',
      pasteSubtitle2: 'URL de estilo',
      namingTitle: '3. Nomeie o seu estilo'
    },
    shareMap: {
      shareUriTitle: 'Compartilhar a URL do Mapa',
      shareUriSubtitle: 'Gerar a url do mapa e compartilhar com outros',
      cloudTitle: 'Armazenamento Cloud',
      cloudSubtitle: 'Conecte-se e envie os dados do mapa para o seu armazenamento cloud pessoal',
      shareDisclaimer: 'kepler.gl irá salvar os dados do mapa em seu armazenamento cloud pessoal, apenas pessoas com a URL podem acessar o seu mapa e dados. ' + 'Você pode editar/deletar o arquivo de dados na sua conta de armazenamento cloud em qualquer momento.',
      gotoPage: 'Vá para a sua página Kepler.gl {currentProvider}'
    },
    statusPanel: {
      mapUploading: 'Enviando Mapa',
      error: 'Erro'
    },
    saveMap: {
      title: 'Armazenamento Cloud',
      subtitle: 'Conecte-se para salvar o mapa para o seu armazenamento cloud pessoal'
    },
    exportMap: {
      formatTitle: 'Formato do mapa',
      formatSubtitle: 'Escolher o formato de mapa para exportar',
      html: {
        selection: 'Exportar seu mapa em um arquivo html interativo.',
        tokenTitle: 'Chave de acesso do Mapbox',
        tokenSubtitle: 'Use a sua própria chave de acesso Mapbox em seu arquivo html (opcional)',
        tokenPlaceholder: 'Cole a sua chave de acesso Mapbox',
        tokenMisuseWarning: '* Se você não fornecer a sua própria chave de acesso, o mapa pode falhar em exibir a qualquer momento quando nós substituirmos a nossa para evitar mau uso. ',
        tokenDisclaimer: 'Você pode trocar a sua chave de acesso Mapbox mais tarde utizando as instruções seguintes: ',
        tokenUpdate: 'Como atualizar a chave de acesso de um mapa existente.',
        modeTitle: 'Modo do Mapa',
        modeSubtitle1: 'Selecionar o modo do aplicativo. Mais ',
        modeSubtitle2: 'info',
        modeDescription: 'Permitir usuários a {mode} o mapa',
        read: 'ler',
        edit: 'editar'
      },
      json: {
        configTitle: 'Configurações do Mapa',
        configDisclaimer: 'A configuração do mapa será incluida no arquivo Json. Se você está utilizando kepler.gl no seu próprio mapa. Você pode copiar essa configuração e passar para ele ',
        selection: 'Exportar atuais dados e configurações do mapa em um único arquivo Json. Você pode mais tarde abrir o mesmo mapa enviando esse arquivo para o kepler.gl.',
        disclaimer: '* Configuração do mapa é aclopado com conjunto de dados carregados. ‘dataId’ é utilizado para ligar as camadas, filtros, e dicas de contextos a conjunto de dados expecíficos. ' + 'Quando passando essa configuração para addDataToMap, tenha certeza de que o id do conjunto de dados combina com o(s) dataId/s nessa configuração.'
      }
    },
    loadingDialog: {
      loading: 'Carregando...'
    },
    loadData: {
      upload: 'Carregar arquivo',
      storage: 'Carregar do armazenamento'
    },
    tripInfo: {
      title: 'Como habilitar animação de viagem',
      description1: 'Para animar o caminho, o dado geoJSON deve conter `LineString` na sua propriedade geometry, e as coordenadas na LineString devem ter 4 elementos no seguinte formato',
      code: ' [longitude, latitude, altitude, data] ',
      description2: 'com um ultimo elemento sendo uma data. Um formato de data válida inclui segundos unix como `1564184363` ou em milisegundos como `1564184363000`.',
      example: 'Exemplo:'
    },
    iconInfo: {
      title: 'Como desenhar ícones',
      description1: 'No seu csv, crie uma coluna, coloque o nome do ícone que você quer desenhar nele. Você pode deixar o campo vazio se você não desejar que o ícone apareça para alguns pontos. Quando a coluna tem nome',
      code: 'icon',
      description2: ' kepler.gl irá automaticamente criar uma camada de ícone para você.',
      example: 'Exemplos:',
      icons: 'Ícones'
    },
    storageMapViewer: {
      lastModified: 'Modificado há {lastUpdated}',
      back: 'Voltar'
    },
    overwriteMap: {
      title: 'Salvando mapa...',
      alreadyExists: 'já existe no mapa {mapSaved}. Você desejaria sobrescrever o mapa?'
    },
    loadStorageMap: {
      back: 'Voltar',
      goToPage: 'Vá para a sua página {displayName} do Kepler.gl',
      storageMaps: 'Armazenamento / Mapas',
      noSavedMaps: 'Nenhum mapa salvo'
    }
  },
  header: {
    visibleLayers: 'Camadas Visíveis',
    layerLegend: 'Legenda da Camada'
  },
  interactions: {
    tooltip: 'Dica de contexto',
    brush: 'Pincel',
    coordinate: 'Coordenadas'
  },
  layerBlending: {
    title: 'Mistura de Camadas',
    additive: 'aditivo',
    normal: 'normal',
    subtractive: 'subtrativo'
  },
  columns: {
    title: 'Colunas',
    lat: 'lat',
    lng: 'lon',
    altitude: 'altitude',
    icon: 'ícone',
    geojson: 'geojson',
    arc: {
      lat0: 'origem lat',
      lng0: 'origem lng',
      lat1: 'destino lat',
      lng1: 'destino lng'
    },
    line: {
      alt0: 'origem altitude',
      alt1: 'destino altitude'
    },
    grid: {
      worldUnitSize: 'Tamanho da Grade (km)'
    },
    hexagon: {
      worldUnitSize: 'Raio do Hexágono (km)'
    }
  },
  color: {
    customPalette: 'Paletas customizadas',
    steps: 'caminhos',
    type: 'tipo',
    reversed: 'reverso'
  },
  scale: {
    colorScale: 'Escala da Cor',
    sizeScale: 'Tamanho da Escala',
    strokeScale: 'Escala do Traço',
    scale: 'Escala'
  },
  fileUploader: {
    message: 'Arraste e solte seu(s) arquivo(s) aqui',
    chromeMessage: '*Usuários do chrome: O limite de tamanho de arquivo é 250mb, se você precisa fazer upload de arquivos maiores tente o Safari',
    disclaimer: '*kepler.gl é uma aplicação client-side, sem um servidor backend. Os dados ficam apenas na sua máquina/browser. ' + 'Nenhuma informação ou dados de mapa é enviado para qualquer server.',
    configUploadMessage: 'Envie {fileFormatNames} ou mapas salvos **Json**. Leia mais sobre [**tipos de arquivos suportados**]',
    browseFiles: 'procure seus arquivos',
    uploading: 'Enviando',
    fileNotSupported: 'Arquivo {errorFiles} não é suportado.',
    or: 'ou'
  },
  density: 'densidade',
  'Bug Report': 'Reportar Bug',
  'User Guide': 'Guia do Usuário',
  Save: 'Salvar',
  Share: 'Compartilhar'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsInN0cm9rZUNvbG9yIiwicmFkaXVzIiwib3V0bGluZSIsInN0cm9rZSIsImRlbnNpdHkiLCJoZWlnaHQiLCJzdW0iLCJwb2ludENvdW50IiwicGxhY2Vob2xkZXIiLCJzZWFyY2giLCJzZWxlY3RGaWVsZCIsInlBeGlzIiwic2VsZWN0VHlwZSIsInNlbGVjdFZhbHVlIiwiZW50ZXJWYWx1ZSIsImVtcHR5IiwibWlzYyIsImJ5IiwidmFsdWVzSW4iLCJ2YWx1ZUVxdWFscyIsImRhdGFTb3VyY2UiLCJicnVzaFJhZGl1cyIsIm1hcExheWVycyIsInRpdGxlIiwicm9hZCIsImJvcmRlciIsImJ1aWxkaW5nIiwid2F0ZXIiLCJsYW5kIiwiYmFja2dyb3VuZCIsInBhbmVsIiwidGV4dCIsImxhYmVsV2l0aElkIiwiZm9udFNpemUiLCJmb250Q29sb3IiLCJ0ZXh0QW5jaG9yIiwiYWxpZ25tZW50IiwiYWRkTW9yZUxhYmVsIiwic2lkZWJhciIsInBhbmVscyIsImxheWVyIiwiaW50ZXJhY3Rpb24iLCJiYXNlbWFwIiwicmVxdWlyZWQiLCJwcm9wZXJ0eUJhc2VkT24iLCJjb3ZlcmFnZSIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsInN0cm9rZVdpZHRoUmFuZ2UiLCJmaXhlZFJhZGl1cyIsImZpeGVkUmFkaXVzRGVzY3JpcHRpb24iLCJyYWRpdXNSYW5nZSIsImNsdXN0ZXJSYWRpdXMiLCJyYWRpdXNSYW5nZVBpeGVscyIsImJpbGxib2FyZCIsImJpbGxib2FyZERlc2NyaXB0aW9uIiwiZmFkZVRyYWlsIiwib3BhY2l0eSIsImNvbG9yUmFuZ2UiLCJzdHJva2VDb2xvclJhbmdlIiwidGFyZ2V0Q29sb3IiLCJjb2xvckFnZ3JlZ2F0aW9uIiwiaGVpZ2h0QWdncmVnYXRpb24iLCJyZXNvbHV0aW9uUmFuZ2UiLCJzaXplU2NhbGUiLCJ3b3JsZFVuaXRTaXplIiwiZWxldmF0aW9uU2NhbGUiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yIiwiZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvckRlc2NyaXB0aW9uIiwiZW5hYmxlSGVpZ2h0Wm9vbUZhY3RvciIsImhlaWdodFNjYWxlIiwiY292ZXJhZ2VSYW5nZSIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmciLCJoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb24iLCJoZWlnaHREZXNjcmlwdGlvbiIsImZpbGwiLCJlbmFibGVQb2x5Z29uSGVpZ2h0Iiwic2hvd1dpcmVmcmFtZSIsIndlaWdodEludGVuc2l0eSIsInpvb21TY2FsZSIsImhlaWdodFJhbmdlIiwiaGVpZ2h0TXVsdGlwbGllciIsImZpeGVkSGVpZ2h0IiwiZml4ZWRIZWlnaHREZXNjcmlwdGlvbiIsImxheWVyTWFuYWdlciIsImFkZERhdGEiLCJhZGRMYXllciIsImxheWVyQmxlbmRpbmciLCJtYXBNYW5hZ2VyIiwibWFwU3R5bGUiLCJhZGRNYXBTdHlsZSIsImJhY2tncm91bmRDb2xvciIsImxheWVyQ29uZmlndXJhdGlvbiIsImRlZmF1bHREZXNjcmlwdGlvbiIsImhvd1RvIiwiZmlsdGVyTWFuYWdlciIsImFkZEZpbHRlciIsImRhdGFzZXRUaXRsZSIsInNob3dEYXRhVGFibGUiLCJyZW1vdmVEYXRhc2V0IiwiZGF0YXNldEluZm8iLCJyb3dDb3VudCIsInRvb2x0aXAiLCJoaWRlTGF5ZXIiLCJzaG93TGF5ZXIiLCJoaWRlRmVhdHVyZSIsInNob3dGZWF0dXJlIiwiaGlkZSIsInNob3ciLCJyZW1vdmVMYXllciIsInJlc2V0QWZ0ZXJFcnJvciIsImxheWVyU2V0dGluZ3MiLCJjbG9zZVBhbmVsIiwic3dpdGNoVG9EdWFsVmlldyIsInNob3dMZWdlbmQiLCJkaXNhYmxlM0RNYXAiLCJEcmF3T25NYXAiLCJzZWxlY3RMb2NhbGUiLCJzaG93QWlBc3Npc3RhbnRQYW5lbCIsImhpZGVBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUxheWVyUGFuZWwiLCJzaG93TGF5ZXJQYW5lbCIsIm1vdmVUb1RvcCIsInNlbGVjdEJhc2VNYXBTdHlsZSIsInRpbWVQbGF5YmFjayIsImNsb3VkU3RvcmFnZSIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImFkZGl0aXZlIiwibm9ybWFsIiwic3VidHJhY3RpdmUiLCJjb2x1bW5zIiwibGF0IiwibG5nIiwiYWx0aXR1ZGUiLCJsYXQwIiwibG5nMCIsImxhdDEiLCJsbmcxIiwiYWx0MCIsImFsdDEiLCJjdXN0b21QYWxldHRlIiwic3RlcHMiLCJyZXZlcnNlZCIsInNjYWxlIiwiY29sb3JTY2FsZSIsInN0cm9rZVNjYWxlIiwiZmlsZVVwbG9hZGVyIiwibWVzc2FnZSIsImNocm9tZU1lc3NhZ2UiLCJjb25maWdVcGxvYWRNZXNzYWdlIiwiYnJvd3NlRmlsZXMiLCJ1cGxvYWRpbmciLCJmaWxlTm90U3VwcG9ydGVkIiwib3IiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbG9jYWxpemF0aW9uL3NyYy90cmFuc2xhdGlvbnMvcHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuLy8gQ29weXJpZ2h0IGNvbnRyaWJ1dG9ycyB0byB0aGUga2VwbGVyLmdsIHByb2plY3RcblxuaW1wb3J0IHtMT0NBTEVTfSBmcm9tICcuLi9sb2NhbGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wZXJ0eToge1xuICAgIHdlaWdodDogJ0VzcGVzc3VyYSBkbyB0ZXh0bycsXG4gICAgbGFiZWw6ICdSw7N0dWxvJyxcbiAgICBmaWxsQ29sb3I6ICdDb3IgZG8gcHJlZW5jaGltZW50bycsXG4gICAgY29sb3I6ICdDb3InLFxuICAgIHN0cm9rZUNvbG9yOiAnQ29yIGRhIGJvcmRhJyxcbiAgICByYWRpdXM6ICdSYWlvJyxcbiAgICBvdXRsaW5lOiAnQ29udG9ybm8nLFxuICAgIHN0cm9rZTogJ1RyYcOnYWRvJyxcbiAgICBkZW5zaXR5OiAnRGVuc2lkYWRlJyxcbiAgICBoZWlnaHQ6ICdBbHR1cmEnLFxuICAgIHN1bTogJ1NvbWEnLFxuICAgIHBvaW50Q291bnQ6ICdDb250YWdlbSBkZSBQb250b3MnXG4gIH0sXG4gIHBsYWNlaG9sZGVyOiB7XG4gICAgc2VhcmNoOiAnUGVzcXVpc2FyJyxcbiAgICBzZWxlY3RGaWVsZDogJ1NlbGVjaW9uZSB1bSBjYW1wbycsXG4gICAgeUF4aXM6ICdFaXhvIFknLFxuICAgIHNlbGVjdFR5cGU6ICdTZWxlY2lvbmUgdW0gVGlwbycsXG4gICAgc2VsZWN0VmFsdWU6ICdTZWxlY2lvbmUgdW0gdmFsb3InLFxuICAgIGVudGVyVmFsdWU6ICdJbnNpcmEgdW0gdmFsb3InLFxuICAgIGVtcHR5OiAnVmF6aW8nXG4gIH0sXG4gIG1pc2M6IHtcbiAgICBieTogJycsXG4gICAgdmFsdWVzSW46ICdWYWxvcmVzIGVtJyxcbiAgICB2YWx1ZUVxdWFsczogJ1ZhbG9yIGlndWFsIGEnLFxuICAgIGRhdGFTb3VyY2U6ICdPcmlnZW0gZG9zIGRhZG9zJyxcbiAgICBicnVzaFJhZGl1czogJ1JhaW8gZG8gVHJhw6dvIChrbSknLFxuICAgIGVtcHR5OiAnICdcbiAgfSxcbiAgbWFwTGF5ZXJzOiB7XG4gICAgdGl0bGU6ICdDYW1hZGFzIGRvIG1hcGEnLFxuICAgIGxhYmVsOiAnUsOzdHVsbycsXG4gICAgcm9hZDogJ0VzdHJhZGEnLFxuICAgIGJvcmRlcjogJ0Zyb250ZWlyYScsXG4gICAgYnVpbGRpbmc6ICdFZGlmw61jaW9zJyxcbiAgICB3YXRlcjogJ8OBZ3VhJyxcbiAgICBsYW5kOiAnVGVycmEnLFxuICAgICczZEJ1aWxkaW5nJzogJ0VkaWbDrWNpb3MgZW0gM2QnLFxuICAgIGJhY2tncm91bmQ6ICdGdW5kbydcbiAgfSxcbiAgcGFuZWw6IHtcbiAgICB0ZXh0OiB7XG4gICAgICBsYWJlbDogJ1LDs3R1bG8nLFxuICAgICAgbGFiZWxXaXRoSWQ6ICdSw7N0dWxvIHtsYWJlbElkfScsXG4gICAgICBmb250U2l6ZTogJ1RhbWFuaG8gZGEgZm9udGUnLFxuICAgICAgZm9udENvbG9yOiAnQ29yIGRhIGZvbnRlJyxcbiAgICAgIHRleHRBbmNob3I6ICfDgm5jb3JhIGRvIHRleHRvJyxcbiAgICAgIGFsaWdubWVudDogJ0FsaW5oYW1lbnRvJyxcbiAgICAgIGFkZE1vcmVMYWJlbDogJ0FkaWNpb25hciBtYWlzIFLDs3R1bG9zJ1xuICAgIH1cbiAgfSxcbiAgc2lkZWJhcjoge1xuICAgIHBhbmVsczoge1xuICAgICAgbGF5ZXI6ICdDYW1hZGFzJyxcbiAgICAgIGZpbHRlcjogJ0ZpbHRyb3MnLFxuICAgICAgaW50ZXJhY3Rpb246ICdJbnRlcmHDp8O1ZXMnLFxuICAgICAgYmFzZW1hcDogJ01hcGEgYmFzZSdcbiAgICB9XG4gIH0sXG4gIGxheWVyOiB7XG4gICAgcmVxdWlyZWQ6ICdPYnJpZ2F0w7NyaW8qJyxcbiAgICByYWRpdXM6ICdSYWlvJyxcbiAgICBjb2xvcjogJ0NvcicsXG4gICAgZmlsbENvbG9yOiAnQ29yIGRlIHByZWVuY2hpbWVudG8nLFxuICAgIG91dGxpbmU6ICdDb250b3JubycsXG4gICAgd2VpZ2h0OiAnRXNwZXNzdXJhJyxcbiAgICBwcm9wZXJ0eUJhc2VkT246ICd7cHJvcGVydHl9IGJhc2VhZGEgZW0nLFxuICAgIGNvdmVyYWdlOiAnQ29iZXJ0dXJhJyxcbiAgICBzdHJva2U6ICdUcmHDp28nLFxuICAgIHN0cm9rZVdpZHRoOiAnTGFyZ3VyYSBkbyBUcmHDp2FkbycsXG4gICAgc3Ryb2tlQ29sb3I6ICdDb3IgZG8gVHJhw6dhZG8nLFxuICAgIGJhc2ljOiAnQsOhc2ljbycsXG4gICAgdHJhaWxMZW5ndGg6ICdDb21wcmltZW50byBkYSB0cmlsaGEnLFxuICAgIHRyYWlsTGVuZ3RoRGVzY3JpcHRpb246ICdOw7ptZXJvIGRlIHNlZ3VuZG9zIHBhcmEgdW0gY2FtaW5obyBjb21wbGV0YW1lbnRlIGRlc2FwYXJlY2VyJyxcbiAgICBuZXdMYXllcjogJ25vdmEgY2FtYWRhJyxcbiAgICBlbGV2YXRpb25CeURlc2NyaXB0aW9uOiAnUXVhbmRvIGRlc2xpZ2FkbywgYSBhbHR1cmEgw6kgYmFzZWFkYSBuYSBjb250YWdlbSBkZSBwb250b3MnLFxuICAgIGNvbG9yQnlEZXNjcmlwdGlvbjogJ1F1YW5kbyBkZXNsaWdhZG8sIGEgY29yIMOpIGJhc2VhZGEgbmEgY29udGFnZW0gZGUgcG9udG9zJyxcbiAgICBhZ2dyZWdhdGVCeTogJ3tmaWVsZH0gYWdyZWdhZG8gcG9yJyxcbiAgICAnM0RNb2RlbCc6ICdNb2RlbG8gM0QnLFxuICAgICczRE1vZGVsT3B0aW9ucyc6ICdPcMOnw7VlcyBkbyBNb2RlbG8gM0QnLFxuICAgIHR5cGU6IHtcbiAgICAgIHBvaW50OiAncG9udG8nLFxuICAgICAgYXJjOiAnYXJjbycsXG4gICAgICBsaW5lOiAnbGluaGEnLFxuICAgICAgZ3JpZDogJ2dyYWRlJyxcbiAgICAgIGhleGJpbjogJ2hleMOhZ29ubycsXG4gICAgICBwb2x5Z29uOiAncG9sw61nb25vJyxcbiAgICAgIGdlb2pzb246ICdnZW9qc29uJyxcbiAgICAgIGNsdXN0ZXI6ICdncnVwbycsXG4gICAgICBpY29uOiAnaWNvbicsXG4gICAgICBoZWF0bWFwOiAnbWFwYSBkZSBjYWxvcicsXG4gICAgICBoZXhhZ29uOiAnaGV4w6Fnb25vJyxcbiAgICAgIGhleGFnb25pZDogJ0gzJyxcbiAgICAgIHRyaXA6ICd2aWFnZW0nLFxuICAgICAgczI6ICdTMicsXG4gICAgICAnM2QnOiAnM0QnXG4gICAgfSxcbiAgICBsYXllclVwZGF0ZUVycm9yOlxuICAgICAgJ09jb3JyZXUgdW0gZXJybyBhbyBhdHVhbGl6YXIgYSBjYW1hZGE6IHtlcnJvck1lc3NhZ2V9LiBDZXJ0aWZpcXVlLXNlIGRlIHF1ZSBvIGZvcm1hdG8gZG9zIGRhZG9zIGRlIGVudHJhZGEgc2VqYSB2w6FsaWRvLidcbiAgfSxcbiAgbGF5ZXJWaXNDb25maWdzOiB7XG4gICAgc3Ryb2tlV2lkdGg6ICdMYXJndXJhIGRvIFRyYcOnbycsXG4gICAgc3Ryb2tlV2lkdGhSYW5nZTogJ0FsY2FuY2UgZGEgTGFyZ3VyYSBkbyBUcmHDp28nLFxuICAgIHJhZGl1czogJ1JhaW8nLFxuICAgIGZpeGVkUmFkaXVzOiAnUmFpbyBhanVzdGFkbyBwYXJhIG1ldHJvJyxcbiAgICBmaXhlZFJhZGl1c0Rlc2NyaXB0aW9uOiAnUmFpbyBkbyBNYXBhIHBhcmEgUmFpbyBhYnNvbHV0byBlbSBtZXRyb3MsIGUuZy4gNSBwYXJhIDUgbWV0cm9zJyxcbiAgICByYWRpdXNSYW5nZTogJ0FsY2FuY2UgZG8gUmFpbycsXG4gICAgY2x1c3RlclJhZGl1czogJ1JhaW8gZG8gQWdydXBhbWVudG8gZW0gcGl4ZWxzJyxcbiAgICByYWRpdXNSYW5nZVBpeGVsczogJ0FsY2FuY2UgZG8gUmFpbyBlbSBwaXhlbHMnLFxuICAgIGJpbGxib2FyZDogJ0PDom1lcmEgZGUgcm9zdG8nLFxuICAgIGJpbGxib2FyZERlc2NyaXB0aW9uOiAnT3JpZW50ZSBhIGdlb21ldHJpYSBlbSBkaXJlw6fDo28gw6AgY8OibWVyYScsXG4gICAgZmFkZVRyYWlsOiAnRmFkZSB0cmlsaGEnLFxuICAgIG9wYWNpdHk6ICdPcGFjaWRhZGUnLFxuICAgIGNvdmVyYWdlOiAnQ29iZXJ0dXJhJyxcbiAgICBvdXRsaW5lOiAnQ29udG9ybm8nLFxuICAgIGNvbG9yUmFuZ2U6ICdBbGNhbmNlIGRhIENvcicsXG4gICAgc3Ryb2tlOiAnVHJhw6dhZG8nLFxuICAgIHN0cm9rZUNvbG9yOiAnQ29yIGRvIFRyYcOnYWRvJyxcbiAgICBzdHJva2VDb2xvclJhbmdlOiAnQWxjYW5jZSBkYSBDb3IgZG8gVHJhw6dhZG8nLFxuICAgIHRhcmdldENvbG9yOiAnQ29yIGRlIGRlc3Rpbm8nLFxuICAgIGNvbG9yQWdncmVnYXRpb246ICdBZ3JlZ2HDp8OjbyBkYSBDb3InLFxuICAgIGhlaWdodEFnZ3JlZ2F0aW9uOiAnQWdyZWdhw6fDo28gZGEgQWx0dXJhJyxcbiAgICByZXNvbHV0aW9uUmFuZ2U6ICdBbGNhbmNlIGRhIFJlc29sdcOnw6NvJyxcbiAgICBzaXplU2NhbGU6ICdFc2NhbGEgZGUgdGFtYW5obycsXG4gICAgd29ybGRVbml0U2l6ZTogJ1RhbWFuaG8gdW5pdMOhcmlvIGRvIG11bmRvJyxcbiAgICBlbGV2YXRpb25TY2FsZTogJ0VzY2FsYSBkZSBFbGV2YcOnw6NvJyxcbiAgICBlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yOiAnVXNlIGZhdG9yIGRlIHpvb20gZGUgZWxldmHDp8OjbycsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvckRlc2NyaXB0aW9uOlxuICAgICAgJ0FqdXN0ZSBhIGFsdHVyYSAvIGVsZXZhw6fDo28gY29tIGJhc2Ugbm8gZmF0b3IgZGUgem9vbSBhdHVhbCcsXG4gICAgZW5hYmxlSGVpZ2h0Wm9vbUZhY3RvcjogJ1VzYXIgZmF0b3IgZGUgem9vbSBkZSBhbHR1cmEnLFxuICAgIGhlaWdodFNjYWxlOiAnRXNjYWxhIGRlIEFsdHVyYScsXG4gICAgY292ZXJhZ2VSYW5nZTogJ0FsY2FuY2UgZGUgY29iZXJ0dXJhJyxcbiAgICBoaWdoUHJlY2lzaW9uUmVuZGVyaW5nOiAnUmVuZGVyaXphw6fDo28gZGUgQWx0YSBQcmVjaXPDo28nLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbjogJ0FsdGEgcHJlY2lzw6NvIGlyw6EgZW0gcmVzdWx0YXIgZW0gYmFpeGEgcGVyZm9ybWFuY2UnLFxuICAgIGhlaWdodDogJ0FsdHVyYScsXG4gICAgaGVpZ2h0RGVzY3JpcHRpb246XG4gICAgICAnQ2xpcXVlIG5vIGJvdMOjbyBubyBjYW50byBzdXBlcmlvciBkaXJlaXRvIHBhcmEgdHJvY2FyIHBhcmEgYSB2aXN1YWxpemHDp8OjbyAzZCcsXG4gICAgZmlsbDogJ1ByZWVuY2hpbWVudG8nLFxuICAgIGVuYWJsZVBvbHlnb25IZWlnaHQ6ICdIYWJpbGl0YXIgQWx0dXJhIGRlIFBvbMOtZ29ubycsXG4gICAgc2hvd1dpcmVmcmFtZTogJ01vc3RyYXIgV2lyZWZyYW1lJyxcbiAgICB3ZWlnaHRJbnRlbnNpdHk6ICdJbnRlbnNpZGFkZSBkYSBFc3Blc3N1cmEnLFxuICAgIHpvb21TY2FsZTogJ0VzY2FsYSBkbyBab29tJyxcbiAgICBoZWlnaHRSYW5nZTogJ0FsY2FuY2UgZGEgQWx0dXJhJyxcbiAgICBoZWlnaHRNdWx0aXBsaWVyOiAnTXVsdGlwbGljYWRvciBkZSBhbHR1cmEnLFxuICAgIGZpeGVkSGVpZ2h0OiAnQWx0dXJhIGZpeGEnLFxuICAgIGZpeGVkSGVpZ2h0RGVzY3JpcHRpb246ICdVc2UgYSBhbHR1cmEgc2VtIG1vZGlmaWNhw6fDtWVzJ1xuICB9LFxuICBsYXllck1hbmFnZXI6IHtcbiAgICBhZGREYXRhOiAnQWRpY2lvbmFyIERhZG9zJyxcbiAgICBhZGRMYXllcjogJ0FkaWNpb25hciBDYW1hZGEnLFxuICAgIGxheWVyQmxlbmRpbmc6ICdNaXN0dXJhIGRlIENhbWFkYSdcbiAgfSxcbiAgbWFwTWFuYWdlcjoge1xuICAgIG1hcFN0eWxlOiAnRXN0aWxvIGRvIE1hcGEnLFxuICAgIGFkZE1hcFN0eWxlOiAnQWRpY2lvbmFyIEVzdGlsbyBkZSBNYXBhJyxcbiAgICAnM2RCdWlsZGluZ0NvbG9yJzogJ0NvciBkbyBFZGlmw61jaW8gM0QnLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ0NvciBkZSBGdW5kbydcbiAgfSxcbiAgbGF5ZXJDb25maWd1cmF0aW9uOiB7XG4gICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnQ2FsY3VsYXIge3Byb3BlcnR5fSBiYXNlYWRhIG5vIGNhbXBvIHNlbGVjaW9uYWRvJyxcbiAgICBob3dUbzogJ0NvbW8nXG4gIH0sXG4gIGZpbHRlck1hbmFnZXI6IHtcbiAgICBhZGRGaWx0ZXI6ICdBZGljaW9uYXIgRmlsdHJvJ1xuICB9LFxuICBkYXRhc2V0VGl0bGU6IHtcbiAgICBzaG93RGF0YVRhYmxlOiAnTW9zdHJhciB0YWJlbGEgZGUgZGFkb3MnLFxuICAgIHJlbW92ZURhdGFzZXQ6ICdSZW1vdmVyIHRhYmVsYSBkZSBkYWRvcydcbiAgfSxcbiAgZGF0YXNldEluZm86IHtcbiAgICByb3dDb3VudDogJ3tyb3dDb3VudH0gbGluaGFzJ1xuICB9LFxuICB0b29sdGlwOiB7XG4gICAgaGlkZUxheWVyOiAnZXNjb25kZXIgY2FtYWRhJyxcbiAgICBzaG93TGF5ZXI6ICdtb3N0cmFyIGNhbWFkYScsXG4gICAgaGlkZUZlYXR1cmU6ICdFc2NvbmRlciBwcm9wcmllZGFkZScsXG4gICAgc2hvd0ZlYXR1cmU6ICdNb3N0cmFyIHByb3ByaWVkYWRlJyxcbiAgICBoaWRlOiAnZXNjb25kZXInLFxuICAgIHNob3c6ICdtb3N0cmFyJyxcbiAgICByZW1vdmVMYXllcjogJ1JlbW92ZXIgQ2FtYWRhJyxcbiAgICByZXNldEFmdGVyRXJyb3I6ICdUZW50ZSBoYWJpbGl0YXIgYSBjYW1hZGEgYXDDs3MgdW0gZXJybycsXG4gICAgbGF5ZXJTZXR0aW5nczogJ0NvbmZpZ3VyYcOnw7VlcyBkZSBDYW1hZGEnLFxuICAgIGNsb3NlUGFuZWw6ICdGZWNoYXIgcGFpbmVsIGF0dWFsJyxcbiAgICBzd2l0Y2hUb0R1YWxWaWV3OiAnVHJvY2FyIHBhcmEgdmlzdWFsaXphw6fDo28gZHVwbGEgZGUgbWFwYScsXG4gICAgc2hvd0xlZ2VuZDogJ21vc3RyYXIgbGVnZW5kYScsXG4gICAgZGlzYWJsZTNETWFwOiAnRGVzYWJpbGl0YXIgTWFwYSAzRCcsXG4gICAgRHJhd09uTWFwOiAnRGVzZW5oYXIgbm8gbWFwYScsXG4gICAgc2VsZWN0TG9jYWxlOiAnU2VsZWNpb25hciBsw61uZ3VhJyxcbiAgICBzaG93QWlBc3Npc3RhbnRQYW5lbDogJ01vc3RyYXIgcGFpbmVsIGRlIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUFpQXNzaXN0YW50UGFuZWw6ICdFc2NvbmRlciBwYWluZWwgZGUgQUkgQXNzaXN0YW50JyxcbiAgICBoaWRlTGF5ZXJQYW5lbDogJ0VzY29uZGVyIHBhaW5lbCBkZSBjYW1hZGEnLFxuICAgIHNob3dMYXllclBhbmVsOiAnTW9zdHJhciBwYWluZWwgZGUgY2FtYWRhJyxcbiAgICBtb3ZlVG9Ub3A6ICdNb3ZlciBwYXJhIG8gdG9wbyBkYXMgY2FtYWRhcycsXG4gICAgc2VsZWN0QmFzZU1hcFN0eWxlOiAnU2VsZWNpb25hciBvIEVzdGlsbyBkbyBNYXBhIEJhc2UnLFxuICAgIGRlbGV0ZTogJ0RlbGV0YXInLFxuICAgIHRpbWVQbGF5YmFjazogJ1RlbXBvIGRlIHJlcHJvZHXDp8OjbycsXG4gICAgY2xvdWRTdG9yYWdlOiAnQXJtYXplbmFtZW50byBDbG91ZCcsXG4gICAgJzNETWFwJzogJyBNYXBhIDNEJ1xuICB9LFxuICB0b29sYmFyOiB7XG4gICAgZXhwb3J0SW1hZ2U6ICdFeHBvcnRhciBJbWFnZW0nLFxuICAgIGV4cG9ydERhdGE6ICdFeHBvcnRhciBEYWRvcycsXG4gICAgZXhwb3J0TWFwOiAnRXhwb3J0YXIgTWFwYScsXG4gICAgc2hhcmVNYXBVUkw6ICdDb21wYXJ0aWxoYXIgVVJMIGRvIE1hcGEnLFxuICAgIHNhdmVNYXA6ICdTYWx2YXIgTWFwYScsXG4gICAgc2VsZWN0OiAnc2VsZWNpb25hcicsXG4gICAgcG9seWdvbjogJ3BvbMOtZ29ubycsXG4gICAgcmVjdGFuZ2xlOiAncmV0w6JuZ3VsbycsXG4gICAgaGlkZTogJ2VzY29uZGVyJyxcbiAgICBzaG93OiAnbW9zdHJhcicsXG4gICAgLi4uTE9DQUxFU1xuICB9LFxuICBtb2RhbDoge1xuICAgIHRpdGxlOiB7XG4gICAgICBkZWxldGVEYXRhc2V0OiAnRGVsZXRhciBDb25qdW50byBkZSBEYWRvcycsXG4gICAgICBhZGREYXRhVG9NYXA6ICdBZGljaW9uYXIgRGFkb3MgYW8gTWFwYScsXG4gICAgICBleHBvcnRJbWFnZTogJ0V4cG9ydGFyIEltYWdlbScsXG4gICAgICBleHBvcnREYXRhOiAnRXhwb3J0YXIgRGFkb3MnLFxuICAgICAgZXhwb3J0TWFwOiAnRXhwb3J0YXIgTWFwYScsXG4gICAgICBhZGRDdXN0b21NYXBib3hTdHlsZTogJ0FkaWNpb25hciBFc3RpbG8gTWFwYm94IEN1c3RvbWl6YWRvJyxcbiAgICAgIHNhdmVNYXA6ICdTYWx2YXIgTWFwYScsXG4gICAgICBzaGFyZVVSTDogJ0NvbXBhcnRpbGhhciBVUkwnXG4gICAgfSxcbiAgICBidXR0b246IHtcbiAgICAgIGRlbGV0ZTogJ0RlbGV0YXInLFxuICAgICAgZG93bmxvYWQ6ICdEb3dubG9hZCcsXG4gICAgICBleHBvcnQ6ICdFeHBvcnRhcicsXG4gICAgICBhZGRTdHlsZTogJ0FkaWNpb25hciBFc3RpbG8nLFxuICAgICAgc2F2ZTogJ1NhbHZhcicsXG4gICAgICBkZWZhdWx0Q2FuY2VsOiAnQ2FuY2VsYXInLFxuICAgICAgZGVmYXVsdENvbmZpcm06ICdDb25maXJtYXInXG4gICAgfSxcbiAgICBleHBvcnRJbWFnZToge1xuICAgICAgcmF0aW9UaXRsZTogJ1Byb3BvcsOnw6NvJyxcbiAgICAgIHJhdGlvRGVzY3JpcHRpb246ICdFc2NvbGhhIGEgcHJvcG9yw6fDo28gcGFyYSB2w6FyaW9zIHVzb3MuJyxcbiAgICAgIHJhdGlvT3JpZ2luYWxTY3JlZW46ICdUZWxhIE9yaWdpbmFsJyxcbiAgICAgIHJhdGlvQ3VzdG9tOiAnQ3VzdG9taXphZG8nLFxuICAgICAgcmF0aW80XzM6ICc0OjMnLFxuICAgICAgcmF0aW8xNl85OiAnMTY6OScsXG4gICAgICByZXNvbHV0aW9uVGl0bGU6ICdSZXNvbHXDp8OjbycsXG4gICAgICByZXNvbHV0aW9uRGVzY3JpcHRpb246ICdBbHRhIHJlc29sdcOnw6NvIMOpIG1lbGhvciBwYXJhIGltcHJlc3PDtWVzLicsXG4gICAgICBtYXBMZWdlbmRUaXRsZTogJ0xlZ2VuZGEgZG8gTWFwYScsXG4gICAgICBtYXBMZWdlbmRBZGQ6ICdBZGljaW9uYXIgTGVnZW5kYSBubyBtYXBhJ1xuICAgIH0sXG4gICAgZXhwb3J0RGF0YToge1xuICAgICAgZGF0YXNldFRpdGxlOiAnQ29uanVudG8gZGUgZGFkb3MnLFxuICAgICAgZGF0YXNldFN1YnRpdGxlOiAnRXNjb2xoYSBvIGNvbmp1bnRvIGRlIGRhZG9zIHF1ZSB2b2PDqiBxdWVyIGV4cG9ydGFyJyxcbiAgICAgIGFsbERhdGFzZXRzOiAnVG9kb3MnLFxuICAgICAgZGF0YVR5cGVUaXRsZTogJ1RpcG8gZGUgRGFkbycsXG4gICAgICBkYXRhVHlwZVN1YnRpdGxlOiAnRXNjb2xoYSBvIHRpcG8gZGUgZGFkb3MgcXVlIHZvY8OqIHF1ZXIgZXhwb3J0YXInLFxuICAgICAgZmlsdGVyRGF0YVRpdGxlOiAnRmlsdHJhciBEYWRvcycsXG4gICAgICBmaWx0ZXJEYXRhU3VidGl0bGU6ICdWb2PDqiBwb2RlIGVzY29saGVyIGV4cG9ydGFyIG9zIGRhZG9zIG9yaWdpbmFpcyBvdSBvcyBkYWRvcyBmaWx0cmFkb3MnLFxuICAgICAgZmlsdGVyZWREYXRhOiAnRGFkb3MgRmlsdHJhZG9zJyxcbiAgICAgIHVuZmlsdGVyZWREYXRhOiAnRGFkb3MgbsOjbyBmaWx0cmFkb3MnLFxuICAgICAgZmlsZUNvdW50OiAne2ZpbGVDb3VudH0gQXJxdWl2b3MnLFxuICAgICAgcm93Q291bnQ6ICd7cm93Q291bnR9IExpbmhhcydcbiAgICB9LFxuICAgIGRlbGV0ZURhdGE6IHtcbiAgICAgIHdhcm5pbmc6ICd2b2PDqiBpcsOhIGRlbGV0YXIgZXNzZSBjb25qdW50byBkZSBkYWRvcy4gSXNzbyBpcsOhIGFmZXRhciB7bGVuZ3RofSBjYW1hZGFzJ1xuICAgIH0sXG4gICAgYWRkU3R5bGU6IHtcbiAgICAgIHB1Ymxpc2hUaXRsZTogJzEuIFB1YmxpcXVlIG8gc2V1IEVzdGlsbyBubyBNYXBib3ggb3UgcHJvdmlkZW5jaWUgYSBjaGF2ZSBkZSBhY2Vzc28nLFxuICAgICAgcHVibGlzaFN1YnRpdGxlMTogJ1ZvY8OqIHBvZGUgY3JpYXIgbyBzZXUgcHLDs3ByaW8gZXN0aWxvIGVtJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTI6ICdlJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTM6ICdwdWJsaWNhcicsXG4gICAgICBwdWJsaXNoU3VidGl0bGU0OiAnaXNzby4nLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNTogJ1BhcmEgdXRpbGl6YXIgZXN0aWxvIHByaXZhZG8sIGNvbGUgYSBzdWEnLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNjogJ2NoYXZlIGRlIGFjZXNzbycsXG4gICAgICBwdWJsaXNoU3VidGl0bGU3OlxuICAgICAgICAnYXF1aS4gKmtlcGxlci5nbCDDqSB1bWEgYXBsaWNhw6fDo28gY2xpZW50LXNpZGUsIG9zIGRhZG9zIHBlcm1hbmVjZW0gbm8gc2V1IGJyb3dzZXIuLicsXG4gICAgICBleGFtcGxlVG9rZW46ICdlLmcuIHBrLmFiY2RlZmcueHh4eHh4JyxcbiAgICAgIHBhc3RlVGl0bGU6ICcyLiBDb2xlIGEgdXJsIGRvIHNldSBlc3RpbG8nLFxuICAgICAgcGFzdGVTdWJ0aXRsZTE6ICdPIHF1ZSDDqSB1bWEnLFxuICAgICAgcGFzdGVTdWJ0aXRsZTI6ICdVUkwgZGUgZXN0aWxvJyxcbiAgICAgIG5hbWluZ1RpdGxlOiAnMy4gTm9tZWllIG8gc2V1IGVzdGlsbydcbiAgICB9LFxuICAgIHNoYXJlTWFwOiB7XG4gICAgICBzaGFyZVVyaVRpdGxlOiAnQ29tcGFydGlsaGFyIGEgVVJMIGRvIE1hcGEnLFxuICAgICAgc2hhcmVVcmlTdWJ0aXRsZTogJ0dlcmFyIGEgdXJsIGRvIG1hcGEgZSBjb21wYXJ0aWxoYXIgY29tIG91dHJvcycsXG4gICAgICBjbG91ZFRpdGxlOiAnQXJtYXplbmFtZW50byBDbG91ZCcsXG4gICAgICBjbG91ZFN1YnRpdGxlOiAnQ29uZWN0ZS1zZSBlIGVudmllIG9zIGRhZG9zIGRvIG1hcGEgcGFyYSBvIHNldSBhcm1hemVuYW1lbnRvIGNsb3VkIHBlc3NvYWwnLFxuICAgICAgc2hhcmVEaXNjbGFpbWVyOlxuICAgICAgICAna2VwbGVyLmdsIGlyw6Egc2FsdmFyIG9zIGRhZG9zIGRvIG1hcGEgZW0gc2V1IGFybWF6ZW5hbWVudG8gY2xvdWQgcGVzc29hbCwgYXBlbmFzIHBlc3NvYXMgY29tIGEgVVJMIHBvZGVtIGFjZXNzYXIgbyBzZXUgbWFwYSBlIGRhZG9zLiAnICtcbiAgICAgICAgJ1ZvY8OqIHBvZGUgZWRpdGFyL2RlbGV0YXIgbyBhcnF1aXZvIGRlIGRhZG9zIG5hIHN1YSBjb250YSBkZSBhcm1hemVuYW1lbnRvIGNsb3VkIGVtIHF1YWxxdWVyIG1vbWVudG8uJyxcbiAgICAgIGdvdG9QYWdlOiAnVsOhIHBhcmEgYSBzdWEgcMOhZ2luYSBLZXBsZXIuZ2wge2N1cnJlbnRQcm92aWRlcn0nXG4gICAgfSxcbiAgICBzdGF0dXNQYW5lbDoge1xuICAgICAgbWFwVXBsb2FkaW5nOiAnRW52aWFuZG8gTWFwYScsXG4gICAgICBlcnJvcjogJ0Vycm8nXG4gICAgfSxcbiAgICBzYXZlTWFwOiB7XG4gICAgICB0aXRsZTogJ0FybWF6ZW5hbWVudG8gQ2xvdWQnLFxuICAgICAgc3VidGl0bGU6ICdDb25lY3RlLXNlIHBhcmEgc2FsdmFyIG8gbWFwYSBwYXJhIG8gc2V1IGFybWF6ZW5hbWVudG8gY2xvdWQgcGVzc29hbCdcbiAgICB9LFxuICAgIGV4cG9ydE1hcDoge1xuICAgICAgZm9ybWF0VGl0bGU6ICdGb3JtYXRvIGRvIG1hcGEnLFxuICAgICAgZm9ybWF0U3VidGl0bGU6ICdFc2NvbGhlciBvIGZvcm1hdG8gZGUgbWFwYSBwYXJhIGV4cG9ydGFyJyxcbiAgICAgIGh0bWw6IHtcbiAgICAgICAgc2VsZWN0aW9uOiAnRXhwb3J0YXIgc2V1IG1hcGEgZW0gdW0gYXJxdWl2byBodG1sIGludGVyYXRpdm8uJyxcbiAgICAgICAgdG9rZW5UaXRsZTogJ0NoYXZlIGRlIGFjZXNzbyBkbyBNYXBib3gnLFxuICAgICAgICB0b2tlblN1YnRpdGxlOiAnVXNlIGEgc3VhIHByw7NwcmlhIGNoYXZlIGRlIGFjZXNzbyBNYXBib3ggZW0gc2V1IGFycXVpdm8gaHRtbCAob3BjaW9uYWwpJyxcbiAgICAgICAgdG9rZW5QbGFjZWhvbGRlcjogJ0NvbGUgYSBzdWEgY2hhdmUgZGUgYWNlc3NvIE1hcGJveCcsXG4gICAgICAgIHRva2VuTWlzdXNlV2FybmluZzpcbiAgICAgICAgICAnKiBTZSB2b2PDqiBuw6NvIGZvcm5lY2VyIGEgc3VhIHByw7NwcmlhIGNoYXZlIGRlIGFjZXNzbywgbyBtYXBhIHBvZGUgZmFsaGFyIGVtIGV4aWJpciBhIHF1YWxxdWVyIG1vbWVudG8gcXVhbmRvIG7Ds3Mgc3Vic3RpdHVpcm1vcyBhIG5vc3NhIHBhcmEgZXZpdGFyIG1hdSB1c28uICcsXG4gICAgICAgIHRva2VuRGlzY2xhaW1lcjpcbiAgICAgICAgICAnVm9jw6ogcG9kZSB0cm9jYXIgYSBzdWEgY2hhdmUgZGUgYWNlc3NvIE1hcGJveCBtYWlzIHRhcmRlIHV0aXphbmRvIGFzIGluc3RydcOnw7VlcyBzZWd1aW50ZXM6ICcsXG4gICAgICAgIHRva2VuVXBkYXRlOiAnQ29tbyBhdHVhbGl6YXIgYSBjaGF2ZSBkZSBhY2Vzc28gZGUgdW0gbWFwYSBleGlzdGVudGUuJyxcbiAgICAgICAgbW9kZVRpdGxlOiAnTW9kbyBkbyBNYXBhJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMTogJ1NlbGVjaW9uYXIgbyBtb2RvIGRvIGFwbGljYXRpdm8uIE1haXMgJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMjogJ2luZm8nLFxuICAgICAgICBtb2RlRGVzY3JpcHRpb246ICdQZXJtaXRpciB1c3XDoXJpb3MgYSB7bW9kZX0gbyBtYXBhJyxcbiAgICAgICAgcmVhZDogJ2xlcicsXG4gICAgICAgIGVkaXQ6ICdlZGl0YXInXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICBjb25maWdUaXRsZTogJ0NvbmZpZ3VyYcOnw7VlcyBkbyBNYXBhJyxcbiAgICAgICAgY29uZmlnRGlzY2xhaW1lcjpcbiAgICAgICAgICAnQSBjb25maWd1cmHDp8OjbyBkbyBtYXBhIHNlcsOhIGluY2x1aWRhIG5vIGFycXVpdm8gSnNvbi4gU2Ugdm9jw6ogZXN0w6EgdXRpbGl6YW5kbyBrZXBsZXIuZ2wgbm8gc2V1IHByw7NwcmlvIG1hcGEuIFZvY8OqIHBvZGUgY29waWFyIGVzc2EgY29uZmlndXJhw6fDo28gZSBwYXNzYXIgcGFyYSBlbGUgJyxcbiAgICAgICAgc2VsZWN0aW9uOlxuICAgICAgICAgICdFeHBvcnRhciBhdHVhaXMgZGFkb3MgZSBjb25maWd1cmHDp8O1ZXMgZG8gbWFwYSBlbSB1bSDDum5pY28gYXJxdWl2byBKc29uLiBWb2PDqiBwb2RlIG1haXMgdGFyZGUgYWJyaXIgbyBtZXNtbyBtYXBhIGVudmlhbmRvIGVzc2UgYXJxdWl2byBwYXJhIG8ga2VwbGVyLmdsLicsXG4gICAgICAgIGRpc2NsYWltZXI6XG4gICAgICAgICAgJyogQ29uZmlndXJhw6fDo28gZG8gbWFwYSDDqSBhY2xvcGFkbyBjb20gY29uanVudG8gZGUgZGFkb3MgY2FycmVnYWRvcy4g4oCYZGF0YUlk4oCZIMOpIHV0aWxpemFkbyBwYXJhIGxpZ2FyIGFzIGNhbWFkYXMsIGZpbHRyb3MsIGUgZGljYXMgZGUgY29udGV4dG9zIGEgY29uanVudG8gZGUgZGFkb3MgZXhwZWPDrWZpY29zLiAnICtcbiAgICAgICAgICAnUXVhbmRvIHBhc3NhbmRvIGVzc2EgY29uZmlndXJhw6fDo28gcGFyYSBhZGREYXRhVG9NYXAsIHRlbmhhIGNlcnRlemEgZGUgcXVlIG8gaWQgZG8gY29uanVudG8gZGUgZGFkb3MgY29tYmluYSBjb20gbyhzKSBkYXRhSWQvcyBuZXNzYSBjb25maWd1cmHDp8Ojby4nXG4gICAgICB9XG4gICAgfSxcbiAgICBsb2FkaW5nRGlhbG9nOiB7XG4gICAgICBsb2FkaW5nOiAnQ2FycmVnYW5kby4uLidcbiAgICB9LFxuICAgIGxvYWREYXRhOiB7XG4gICAgICB1cGxvYWQ6ICdDYXJyZWdhciBhcnF1aXZvJyxcbiAgICAgIHN0b3JhZ2U6ICdDYXJyZWdhciBkbyBhcm1hemVuYW1lbnRvJ1xuICAgIH0sXG4gICAgdHJpcEluZm86IHtcbiAgICAgIHRpdGxlOiAnQ29tbyBoYWJpbGl0YXIgYW5pbWHDp8OjbyBkZSB2aWFnZW0nLFxuICAgICAgZGVzY3JpcHRpb24xOlxuICAgICAgICAnUGFyYSBhbmltYXIgbyBjYW1pbmhvLCBvIGRhZG8gZ2VvSlNPTiBkZXZlIGNvbnRlciBgTGluZVN0cmluZ2AgbmEgc3VhIHByb3ByaWVkYWRlIGdlb21ldHJ5LCBlIGFzIGNvb3JkZW5hZGFzIG5hIExpbmVTdHJpbmcgZGV2ZW0gdGVyIDQgZWxlbWVudG9zIG5vIHNlZ3VpbnRlIGZvcm1hdG8nLFxuICAgICAgY29kZTogJyBbbG9uZ2l0dWRlLCBsYXRpdHVkZSwgYWx0aXR1ZGUsIGRhdGFdICcsXG4gICAgICBkZXNjcmlwdGlvbjI6XG4gICAgICAgICdjb20gdW0gdWx0aW1vIGVsZW1lbnRvIHNlbmRvIHVtYSBkYXRhLiBVbSBmb3JtYXRvIGRlIGRhdGEgdsOhbGlkYSBpbmNsdWkgc2VndW5kb3MgdW5peCBjb21vIGAxNTY0MTg0MzYzYCBvdSBlbSBtaWxpc2VndW5kb3MgY29tbyBgMTU2NDE4NDM2MzAwMGAuJyxcbiAgICAgIGV4YW1wbGU6ICdFeGVtcGxvOidcbiAgICB9LFxuICAgIGljb25JbmZvOiB7XG4gICAgICB0aXRsZTogJ0NvbW8gZGVzZW5oYXIgw61jb25lcycsXG4gICAgICBkZXNjcmlwdGlvbjE6XG4gICAgICAgICdObyBzZXUgY3N2LCBjcmllIHVtYSBjb2x1bmEsIGNvbG9xdWUgbyBub21lIGRvIMOtY29uZSBxdWUgdm9jw6ogcXVlciBkZXNlbmhhciBuZWxlLiBWb2PDqiBwb2RlIGRlaXhhciBvIGNhbXBvIHZhemlvIHNlIHZvY8OqIG7Do28gZGVzZWphciBxdWUgbyDDrWNvbmUgYXBhcmXDp2EgcGFyYSBhbGd1bnMgcG9udG9zLiBRdWFuZG8gYSBjb2x1bmEgdGVtIG5vbWUnLFxuICAgICAgY29kZTogJ2ljb24nLFxuICAgICAgZGVzY3JpcHRpb24yOiAnIGtlcGxlci5nbCBpcsOhIGF1dG9tYXRpY2FtZW50ZSBjcmlhciB1bWEgY2FtYWRhIGRlIMOtY29uZSBwYXJhIHZvY8OqLicsXG4gICAgICBleGFtcGxlOiAnRXhlbXBsb3M6JyxcbiAgICAgIGljb25zOiAnw41jb25lcydcbiAgICB9LFxuICAgIHN0b3JhZ2VNYXBWaWV3ZXI6IHtcbiAgICAgIGxhc3RNb2RpZmllZDogJ01vZGlmaWNhZG8gaMOhIHtsYXN0VXBkYXRlZH0nLFxuICAgICAgYmFjazogJ1ZvbHRhcidcbiAgICB9LFxuICAgIG92ZXJ3cml0ZU1hcDoge1xuICAgICAgdGl0bGU6ICdTYWx2YW5kbyBtYXBhLi4uJyxcbiAgICAgIGFscmVhZHlFeGlzdHM6ICdqw6EgZXhpc3RlIG5vIG1hcGEge21hcFNhdmVkfS4gVm9jw6ogZGVzZWphcmlhIHNvYnJlc2NyZXZlciBvIG1hcGE/J1xuICAgIH0sXG4gICAgbG9hZFN0b3JhZ2VNYXA6IHtcbiAgICAgIGJhY2s6ICdWb2x0YXInLFxuICAgICAgZ29Ub1BhZ2U6ICdWw6EgcGFyYSBhIHN1YSBww6FnaW5hIHtkaXNwbGF5TmFtZX0gZG8gS2VwbGVyLmdsJyxcbiAgICAgIHN0b3JhZ2VNYXBzOiAnQXJtYXplbmFtZW50byAvIE1hcGFzJyxcbiAgICAgIG5vU2F2ZWRNYXBzOiAnTmVuaHVtIG1hcGEgc2Fsdm8nXG4gICAgfVxuICB9LFxuICBoZWFkZXI6IHtcbiAgICB2aXNpYmxlTGF5ZXJzOiAnQ2FtYWRhcyBWaXPDrXZlaXMnLFxuICAgIGxheWVyTGVnZW5kOiAnTGVnZW5kYSBkYSBDYW1hZGEnXG4gIH0sXG4gIGludGVyYWN0aW9uczoge1xuICAgIHRvb2x0aXA6ICdEaWNhIGRlIGNvbnRleHRvJyxcbiAgICBicnVzaDogJ1BpbmNlbCcsXG4gICAgY29vcmRpbmF0ZTogJ0Nvb3JkZW5hZGFzJ1xuICB9LFxuICBsYXllckJsZW5kaW5nOiB7XG4gICAgdGl0bGU6ICdNaXN0dXJhIGRlIENhbWFkYXMnLFxuICAgIGFkZGl0aXZlOiAnYWRpdGl2bycsXG4gICAgbm9ybWFsOiAnbm9ybWFsJyxcbiAgICBzdWJ0cmFjdGl2ZTogJ3N1YnRyYXRpdm8nXG4gIH0sXG4gIGNvbHVtbnM6IHtcbiAgICB0aXRsZTogJ0NvbHVuYXMnLFxuICAgIGxhdDogJ2xhdCcsXG4gICAgbG5nOiAnbG9uJyxcbiAgICBhbHRpdHVkZTogJ2FsdGl0dWRlJyxcbiAgICBpY29uOiAnw61jb25lJyxcbiAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgYXJjOiB7XG4gICAgICBsYXQwOiAnb3JpZ2VtIGxhdCcsXG4gICAgICBsbmcwOiAnb3JpZ2VtIGxuZycsXG4gICAgICBsYXQxOiAnZGVzdGlubyBsYXQnLFxuICAgICAgbG5nMTogJ2Rlc3Rpbm8gbG5nJ1xuICAgIH0sXG4gICAgbGluZToge1xuICAgICAgYWx0MDogJ29yaWdlbSBhbHRpdHVkZScsXG4gICAgICBhbHQxOiAnZGVzdGlubyBhbHRpdHVkZSdcbiAgICB9LFxuICAgIGdyaWQ6IHtcbiAgICAgIHdvcmxkVW5pdFNpemU6ICdUYW1hbmhvIGRhIEdyYWRlIChrbSknXG4gICAgfSxcbiAgICBoZXhhZ29uOiB7XG4gICAgICB3b3JsZFVuaXRTaXplOiAnUmFpbyBkbyBIZXjDoWdvbm8gKGttKSdcbiAgICB9XG4gIH0sXG4gIGNvbG9yOiB7XG4gICAgY3VzdG9tUGFsZXR0ZTogJ1BhbGV0YXMgY3VzdG9taXphZGFzJyxcbiAgICBzdGVwczogJ2NhbWluaG9zJyxcbiAgICB0eXBlOiAndGlwbycsXG4gICAgcmV2ZXJzZWQ6ICdyZXZlcnNvJ1xuICB9LFxuICBzY2FsZToge1xuICAgIGNvbG9yU2NhbGU6ICdFc2NhbGEgZGEgQ29yJyxcbiAgICBzaXplU2NhbGU6ICdUYW1hbmhvIGRhIEVzY2FsYScsXG4gICAgc3Ryb2tlU2NhbGU6ICdFc2NhbGEgZG8gVHJhw6dvJyxcbiAgICBzY2FsZTogJ0VzY2FsYSdcbiAgfSxcbiAgZmlsZVVwbG9hZGVyOiB7XG4gICAgbWVzc2FnZTogJ0FycmFzdGUgZSBzb2x0ZSBzZXUocykgYXJxdWl2byhzKSBhcXVpJyxcbiAgICBjaHJvbWVNZXNzYWdlOlxuICAgICAgJypVc3XDoXJpb3MgZG8gY2hyb21lOiBPIGxpbWl0ZSBkZSB0YW1hbmhvIGRlIGFycXVpdm8gw6kgMjUwbWIsIHNlIHZvY8OqIHByZWNpc2EgZmF6ZXIgdXBsb2FkIGRlIGFycXVpdm9zIG1haW9yZXMgdGVudGUgbyBTYWZhcmknLFxuICAgIGRpc2NsYWltZXI6XG4gICAgICAnKmtlcGxlci5nbCDDqSB1bWEgYXBsaWNhw6fDo28gY2xpZW50LXNpZGUsIHNlbSB1bSBzZXJ2aWRvciBiYWNrZW5kLiBPcyBkYWRvcyBmaWNhbSBhcGVuYXMgbmEgc3VhIG3DoXF1aW5hL2Jyb3dzZXIuICcgK1xuICAgICAgJ05lbmh1bWEgaW5mb3JtYcOnw6NvIG91IGRhZG9zIGRlIG1hcGEgw6kgZW52aWFkbyBwYXJhIHF1YWxxdWVyIHNlcnZlci4nLFxuICAgIGNvbmZpZ1VwbG9hZE1lc3NhZ2U6XG4gICAgICAnRW52aWUge2ZpbGVGb3JtYXROYW1lc30gb3UgbWFwYXMgc2Fsdm9zICoqSnNvbioqLiBMZWlhIG1haXMgc29icmUgWyoqdGlwb3MgZGUgYXJxdWl2b3Mgc3Vwb3J0YWRvcyoqXScsXG4gICAgYnJvd3NlRmlsZXM6ICdwcm9jdXJlIHNldXMgYXJxdWl2b3MnLFxuICAgIHVwbG9hZGluZzogJ0VudmlhbmRvJyxcbiAgICBmaWxlTm90U3VwcG9ydGVkOiAnQXJxdWl2byB7ZXJyb3JGaWxlc30gbsOjbyDDqSBzdXBvcnRhZG8uJyxcbiAgICBvcjogJ291J1xuICB9LFxuICBkZW5zaXR5OiAnZGVuc2lkYWRlJyxcbiAgJ0J1ZyBSZXBvcnQnOiAnUmVwb3J0YXIgQnVnJyxcbiAgJ1VzZXIgR3VpZGUnOiAnR3VpYSBkbyBVc3XDoXJpbycsXG4g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