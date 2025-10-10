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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsInN0cm9rZUNvbG9yIiwicmFkaXVzIiwib3V0bGluZSIsInN0cm9rZSIsImRlbnNpdHkiLCJoZWlnaHQiLCJzdW0iLCJwb2ludENvdW50IiwicGxhY2Vob2xkZXIiLCJzZWFyY2giLCJzZWxlY3RGaWVsZCIsInlBeGlzIiwic2VsZWN0VHlwZSIsInNlbGVjdFZhbHVlIiwiZW50ZXJWYWx1ZSIsImVtcHR5IiwibWlzYyIsImJ5IiwidmFsdWVzSW4iLCJ2YWx1ZUVxdWFscyIsImRhdGFTb3VyY2UiLCJicnVzaFJhZGl1cyIsIm1hcExheWVycyIsInRpdGxlIiwicm9hZCIsImJvcmRlciIsImJ1aWxkaW5nIiwid2F0ZXIiLCJsYW5kIiwiYmFja2dyb3VuZCIsInBhbmVsIiwidGV4dCIsImxhYmVsV2l0aElkIiwiZm9udFNpemUiLCJmb250Q29sb3IiLCJ0ZXh0QW5jaG9yIiwiYWxpZ25tZW50IiwiYWRkTW9yZUxhYmVsIiwic2lkZWJhciIsInBhbmVscyIsImxheWVyIiwiaW50ZXJhY3Rpb24iLCJiYXNlbWFwIiwicmVxdWlyZWQiLCJwcm9wZXJ0eUJhc2VkT24iLCJjb3ZlcmFnZSIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsInN0cm9rZVdpZHRoUmFuZ2UiLCJmaXhlZFJhZGl1cyIsImZpeGVkUmFkaXVzRGVzY3JpcHRpb24iLCJyYWRpdXNSYW5nZSIsImNsdXN0ZXJSYWRpdXMiLCJyYWRpdXNSYW5nZVBpeGVscyIsImJpbGxib2FyZCIsImJpbGxib2FyZERlc2NyaXB0aW9uIiwiZmFkZVRyYWlsIiwib3BhY2l0eSIsImNvbG9yUmFuZ2UiLCJzdHJva2VDb2xvclJhbmdlIiwidGFyZ2V0Q29sb3IiLCJjb2xvckFnZ3JlZ2F0aW9uIiwiaGVpZ2h0QWdncmVnYXRpb24iLCJyZXNvbHV0aW9uUmFuZ2UiLCJzaXplU2NhbGUiLCJ3b3JsZFVuaXRTaXplIiwiZWxldmF0aW9uU2NhbGUiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yIiwiZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvckRlc2NyaXB0aW9uIiwiZW5hYmxlSGVpZ2h0Wm9vbUZhY3RvciIsImhlaWdodFNjYWxlIiwiY292ZXJhZ2VSYW5nZSIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmciLCJoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb24iLCJoZWlnaHREZXNjcmlwdGlvbiIsImZpbGwiLCJlbmFibGVQb2x5Z29uSGVpZ2h0Iiwic2hvd1dpcmVmcmFtZSIsIndlaWdodEludGVuc2l0eSIsInpvb21TY2FsZSIsImhlaWdodFJhbmdlIiwiaGVpZ2h0TXVsdGlwbGllciIsImZpeGVkSGVpZ2h0IiwiZml4ZWRIZWlnaHREZXNjcmlwdGlvbiIsImxheWVyTWFuYWdlciIsImFkZERhdGEiLCJhZGRMYXllciIsImxheWVyQmxlbmRpbmciLCJtYXBNYW5hZ2VyIiwibWFwU3R5bGUiLCJhZGRNYXBTdHlsZSIsImJhY2tncm91bmRDb2xvciIsImxheWVyQ29uZmlndXJhdGlvbiIsImRlZmF1bHREZXNjcmlwdGlvbiIsImhvd1RvIiwiZmlsdGVyTWFuYWdlciIsImFkZEZpbHRlciIsImRhdGFzZXRUaXRsZSIsInNob3dEYXRhVGFibGUiLCJyZW1vdmVEYXRhc2V0IiwiZGF0YXNldEluZm8iLCJyb3dDb3VudCIsInRvb2x0aXAiLCJoaWRlTGF5ZXIiLCJzaG93TGF5ZXIiLCJoaWRlRmVhdHVyZSIsInNob3dGZWF0dXJlIiwiaGlkZSIsInNob3ciLCJyZW1vdmVMYXllciIsInJlc2V0QWZ0ZXJFcnJvciIsImxheWVyU2V0dGluZ3MiLCJjbG9zZVBhbmVsIiwic3dpdGNoVG9EdWFsVmlldyIsInNob3dMZWdlbmQiLCJkaXNhYmxlM0RNYXAiLCJEcmF3T25NYXAiLCJzZWxlY3RMb2NhbGUiLCJzaG93QWlBc3Npc3RhbnRQYW5lbCIsImhpZGVBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUxheWVyUGFuZWwiLCJzaG93TGF5ZXJQYW5lbCIsIm1vdmVUb1RvcCIsInNlbGVjdEJhc2VNYXBTdHlsZSIsInRpbWVQbGF5YmFjayIsImNsb3VkU3RvcmFnZSIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImFkZGl0aXZlIiwibm9ybWFsIiwic3VidHJhY3RpdmUiLCJjb2x1bW5zIiwibGF0IiwibG5nIiwiYWx0aXR1ZGUiLCJsYXQwIiwibG5nMCIsImxhdDEiLCJsbmcxIiwiYWx0MCIsImFsdDEiLCJjdXN0b21QYWxldHRlIiwic3RlcHMiLCJyZXZlcnNlZCIsInNjYWxlIiwiY29sb3JTY2FsZSIsInN0cm9rZVNjYWxlIiwiZmlsZVVwbG9hZGVyIiwibWVzc2FnZSIsImNocm9tZU1lc3NhZ2UiLCJjb25maWdVcGxvYWRNZXNzYWdlIiwiYnJvd3NlRmlsZXMiLCJ1cGxvYWRpbmciLCJmaWxlTm90U3VwcG9ydGVkIiwib3IiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdHJhbnNsYXRpb25zL3B0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmltcG9ydCB7TE9DQUxFU30gZnJvbSAnLi4vbG9jYWxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcGVydHk6IHtcbiAgICB3ZWlnaHQ6ICdFc3Blc3N1cmEgZG8gdGV4dG8nLFxuICAgIGxhYmVsOiAnUsOzdHVsbycsXG4gICAgZmlsbENvbG9yOiAnQ29yIGRvIHByZWVuY2hpbWVudG8nLFxuICAgIGNvbG9yOiAnQ29yJyxcbiAgICBzdHJva2VDb2xvcjogJ0NvciBkYSBib3JkYScsXG4gICAgcmFkaXVzOiAnUmFpbycsXG4gICAgb3V0bGluZTogJ0NvbnRvcm5vJyxcbiAgICBzdHJva2U6ICdUcmHDp2FkbycsXG4gICAgZGVuc2l0eTogJ0RlbnNpZGFkZScsXG4gICAgaGVpZ2h0OiAnQWx0dXJhJyxcbiAgICBzdW06ICdTb21hJyxcbiAgICBwb2ludENvdW50OiAnQ29udGFnZW0gZGUgUG9udG9zJ1xuICB9LFxuICBwbGFjZWhvbGRlcjoge1xuICAgIHNlYXJjaDogJ1Blc3F1aXNhcicsXG4gICAgc2VsZWN0RmllbGQ6ICdTZWxlY2lvbmUgdW0gY2FtcG8nLFxuICAgIHlBeGlzOiAnRWl4byBZJyxcbiAgICBzZWxlY3RUeXBlOiAnU2VsZWNpb25lIHVtIFRpcG8nLFxuICAgIHNlbGVjdFZhbHVlOiAnU2VsZWNpb25lIHVtIHZhbG9yJyxcbiAgICBlbnRlclZhbHVlOiAnSW5zaXJhIHVtIHZhbG9yJyxcbiAgICBlbXB0eTogJ1ZhemlvJ1xuICB9LFxuICBtaXNjOiB7XG4gICAgYnk6ICcnLFxuICAgIHZhbHVlc0luOiAnVmFsb3JlcyBlbScsXG4gICAgdmFsdWVFcXVhbHM6ICdWYWxvciBpZ3VhbCBhJyxcbiAgICBkYXRhU291cmNlOiAnT3JpZ2VtIGRvcyBkYWRvcycsXG4gICAgYnJ1c2hSYWRpdXM6ICdSYWlvIGRvIFRyYcOnbyAoa20pJyxcbiAgICBlbXB0eTogJyAnXG4gIH0sXG4gIG1hcExheWVyczoge1xuICAgIHRpdGxlOiAnQ2FtYWRhcyBkbyBtYXBhJyxcbiAgICBsYWJlbDogJ1LDs3R1bG8nLFxuICAgIHJvYWQ6ICdFc3RyYWRhJyxcbiAgICBib3JkZXI6ICdGcm9udGVpcmEnLFxuICAgIGJ1aWxkaW5nOiAnRWRpZsOtY2lvcycsXG4gICAgd2F0ZXI6ICfDgWd1YScsXG4gICAgbGFuZDogJ1RlcnJhJyxcbiAgICAnM2RCdWlsZGluZyc6ICdFZGlmw61jaW9zIGVtIDNkJyxcbiAgICBiYWNrZ3JvdW5kOiAnRnVuZG8nXG4gIH0sXG4gIHBhbmVsOiB7XG4gICAgdGV4dDoge1xuICAgICAgbGFiZWw6ICdSw7N0dWxvJyxcbiAgICAgIGxhYmVsV2l0aElkOiAnUsOzdHVsbyB7bGFiZWxJZH0nLFxuICAgICAgZm9udFNpemU6ICdUYW1hbmhvIGRhIGZvbnRlJyxcbiAgICAgIGZvbnRDb2xvcjogJ0NvciBkYSBmb250ZScsXG4gICAgICB0ZXh0QW5jaG9yOiAnw4JuY29yYSBkbyB0ZXh0bycsXG4gICAgICBhbGlnbm1lbnQ6ICdBbGluaGFtZW50bycsXG4gICAgICBhZGRNb3JlTGFiZWw6ICdBZGljaW9uYXIgbWFpcyBSw7N0dWxvcydcbiAgICB9XG4gIH0sXG4gIHNpZGViYXI6IHtcbiAgICBwYW5lbHM6IHtcbiAgICAgIGxheWVyOiAnQ2FtYWRhcycsXG4gICAgICBmaWx0ZXI6ICdGaWx0cm9zJyxcbiAgICAgIGludGVyYWN0aW9uOiAnSW50ZXJhw6fDtWVzJyxcbiAgICAgIGJhc2VtYXA6ICdNYXBhIGJhc2UnXG4gICAgfVxuICB9LFxuICBsYXllcjoge1xuICAgIHJlcXVpcmVkOiAnT2JyaWdhdMOzcmlvKicsXG4gICAgcmFkaXVzOiAnUmFpbycsXG4gICAgY29sb3I6ICdDb3InLFxuICAgIGZpbGxDb2xvcjogJ0NvciBkZSBwcmVlbmNoaW1lbnRvJyxcbiAgICBvdXRsaW5lOiAnQ29udG9ybm8nLFxuICAgIHdlaWdodDogJ0VzcGVzc3VyYScsXG4gICAgcHJvcGVydHlCYXNlZE9uOiAne3Byb3BlcnR5fSBiYXNlYWRhIGVtJyxcbiAgICBjb3ZlcmFnZTogJ0NvYmVydHVyYScsXG4gICAgc3Ryb2tlOiAnVHJhw6dvJyxcbiAgICBzdHJva2VXaWR0aDogJ0xhcmd1cmEgZG8gVHJhw6dhZG8nLFxuICAgIHN0cm9rZUNvbG9yOiAnQ29yIGRvIFRyYcOnYWRvJyxcbiAgICBiYXNpYzogJ0LDoXNpY28nLFxuICAgIHRyYWlsTGVuZ3RoOiAnQ29tcHJpbWVudG8gZGEgdHJpbGhhJyxcbiAgICB0cmFpbExlbmd0aERlc2NyaXB0aW9uOiAnTsO6bWVybyBkZSBzZWd1bmRvcyBwYXJhIHVtIGNhbWluaG8gY29tcGxldGFtZW50ZSBkZXNhcGFyZWNlcicsXG4gICAgbmV3TGF5ZXI6ICdub3ZhIGNhbWFkYScsXG4gICAgZWxldmF0aW9uQnlEZXNjcmlwdGlvbjogJ1F1YW5kbyBkZXNsaWdhZG8sIGEgYWx0dXJhIMOpIGJhc2VhZGEgbmEgY29udGFnZW0gZGUgcG9udG9zJyxcbiAgICBjb2xvckJ5RGVzY3JpcHRpb246ICdRdWFuZG8gZGVzbGlnYWRvLCBhIGNvciDDqSBiYXNlYWRhIG5hIGNvbnRhZ2VtIGRlIHBvbnRvcycsXG4gICAgYWdncmVnYXRlQnk6ICd7ZmllbGR9IGFncmVnYWRvIHBvcicsXG4gICAgJzNETW9kZWwnOiAnTW9kZWxvIDNEJyxcbiAgICAnM0RNb2RlbE9wdGlvbnMnOiAnT3DDp8O1ZXMgZG8gTW9kZWxvIDNEJyxcbiAgICB0eXBlOiB7XG4gICAgICBwb2ludDogJ3BvbnRvJyxcbiAgICAgIGFyYzogJ2FyY28nLFxuICAgICAgbGluZTogJ2xpbmhhJyxcbiAgICAgIGdyaWQ6ICdncmFkZScsXG4gICAgICBoZXhiaW46ICdoZXjDoWdvbm8nLFxuICAgICAgcG9seWdvbjogJ3BvbMOtZ29ubycsXG4gICAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgICBjbHVzdGVyOiAnZ3J1cG8nLFxuICAgICAgaWNvbjogJ2ljb24nLFxuICAgICAgaGVhdG1hcDogJ21hcGEgZGUgY2Fsb3InLFxuICAgICAgaGV4YWdvbjogJ2hleMOhZ29ubycsXG4gICAgICBoZXhhZ29uaWQ6ICdIMycsXG4gICAgICB0cmlwOiAndmlhZ2VtJyxcbiAgICAgIHMyOiAnUzInLFxuICAgICAgJzNkJzogJzNEJ1xuICAgIH0sXG4gICAgbGF5ZXJVcGRhdGVFcnJvcjpcbiAgICAgICdPY29ycmV1IHVtIGVycm8gYW8gYXR1YWxpemFyIGEgY2FtYWRhOiB7ZXJyb3JNZXNzYWdlfS4gQ2VydGlmaXF1ZS1zZSBkZSBxdWUgbyBmb3JtYXRvIGRvcyBkYWRvcyBkZSBlbnRyYWRhIHNlamEgdsOhbGlkby4nXG4gIH0sXG4gIGxheWVyVmlzQ29uZmlnczoge1xuICAgIHN0cm9rZVdpZHRoOiAnTGFyZ3VyYSBkbyBUcmHDp28nLFxuICAgIHN0cm9rZVdpZHRoUmFuZ2U6ICdBbGNhbmNlIGRhIExhcmd1cmEgZG8gVHJhw6dvJyxcbiAgICByYWRpdXM6ICdSYWlvJyxcbiAgICBmaXhlZFJhZGl1czogJ1JhaW8gYWp1c3RhZG8gcGFyYSBtZXRybycsXG4gICAgZml4ZWRSYWRpdXNEZXNjcmlwdGlvbjogJ1JhaW8gZG8gTWFwYSBwYXJhIFJhaW8gYWJzb2x1dG8gZW0gbWV0cm9zLCBlLmcuIDUgcGFyYSA1IG1ldHJvcycsXG4gICAgcmFkaXVzUmFuZ2U6ICdBbGNhbmNlIGRvIFJhaW8nLFxuICAgIGNsdXN0ZXJSYWRpdXM6ICdSYWlvIGRvIEFncnVwYW1lbnRvIGVtIHBpeGVscycsXG4gICAgcmFkaXVzUmFuZ2VQaXhlbHM6ICdBbGNhbmNlIGRvIFJhaW8gZW0gcGl4ZWxzJyxcbiAgICBiaWxsYm9hcmQ6ICdDw6JtZXJhIGRlIHJvc3RvJyxcbiAgICBiaWxsYm9hcmREZXNjcmlwdGlvbjogJ09yaWVudGUgYSBnZW9tZXRyaWEgZW0gZGlyZcOnw6NvIMOgIGPDom1lcmEnLFxuICAgIGZhZGVUcmFpbDogJ0ZhZGUgdHJpbGhhJyxcbiAgICBvcGFjaXR5OiAnT3BhY2lkYWRlJyxcbiAgICBjb3ZlcmFnZTogJ0NvYmVydHVyYScsXG4gICAgb3V0bGluZTogJ0NvbnRvcm5vJyxcbiAgICBjb2xvclJhbmdlOiAnQWxjYW5jZSBkYSBDb3InLFxuICAgIHN0cm9rZTogJ1RyYcOnYWRvJyxcbiAgICBzdHJva2VDb2xvcjogJ0NvciBkbyBUcmHDp2FkbycsXG4gICAgc3Ryb2tlQ29sb3JSYW5nZTogJ0FsY2FuY2UgZGEgQ29yIGRvIFRyYcOnYWRvJyxcbiAgICB0YXJnZXRDb2xvcjogJ0NvciBkZSBkZXN0aW5vJyxcbiAgICBjb2xvckFnZ3JlZ2F0aW9uOiAnQWdyZWdhw6fDo28gZGEgQ29yJyxcbiAgICBoZWlnaHRBZ2dyZWdhdGlvbjogJ0FncmVnYcOnw6NvIGRhIEFsdHVyYScsXG4gICAgcmVzb2x1dGlvblJhbmdlOiAnQWxjYW5jZSBkYSBSZXNvbHXDp8OjbycsXG4gICAgc2l6ZVNjYWxlOiAnRXNjYWxhIGRlIHRhbWFuaG8nLFxuICAgIHdvcmxkVW5pdFNpemU6ICdUYW1hbmhvIHVuaXTDoXJpbyBkbyBtdW5kbycsXG4gICAgZWxldmF0aW9uU2NhbGU6ICdFc2NhbGEgZGUgRWxldmHDp8OjbycsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvcjogJ1VzZSBmYXRvciBkZSB6b29tIGRlIGVsZXZhw6fDo28nLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbjpcbiAgICAgICdBanVzdGUgYSBhbHR1cmEgLyBlbGV2YcOnw6NvIGNvbSBiYXNlIG5vIGZhdG9yIGRlIHpvb20gYXR1YWwnLFxuICAgIGVuYWJsZUhlaWdodFpvb21GYWN0b3I6ICdVc2FyIGZhdG9yIGRlIHpvb20gZGUgYWx0dXJhJyxcbiAgICBoZWlnaHRTY2FsZTogJ0VzY2FsYSBkZSBBbHR1cmEnLFxuICAgIGNvdmVyYWdlUmFuZ2U6ICdBbGNhbmNlIGRlIGNvYmVydHVyYScsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZzogJ1JlbmRlcml6YcOnw6NvIGRlIEFsdGEgUHJlY2lzw6NvJyxcbiAgICBoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb246ICdBbHRhIHByZWNpc8OjbyBpcsOhIGVtIHJlc3VsdGFyIGVtIGJhaXhhIHBlcmZvcm1hbmNlJyxcbiAgICBoZWlnaHQ6ICdBbHR1cmEnLFxuICAgIGhlaWdodERlc2NyaXB0aW9uOlxuICAgICAgJ0NsaXF1ZSBubyBib3TDo28gbm8gY2FudG8gc3VwZXJpb3IgZGlyZWl0byBwYXJhIHRyb2NhciBwYXJhIGEgdmlzdWFsaXphw6fDo28gM2QnLFxuICAgIGZpbGw6ICdQcmVlbmNoaW1lbnRvJyxcbiAgICBlbmFibGVQb2x5Z29uSGVpZ2h0OiAnSGFiaWxpdGFyIEFsdHVyYSBkZSBQb2zDrWdvbm8nLFxuICAgIHNob3dXaXJlZnJhbWU6ICdNb3N0cmFyIFdpcmVmcmFtZScsXG4gICAgd2VpZ2h0SW50ZW5zaXR5OiAnSW50ZW5zaWRhZGUgZGEgRXNwZXNzdXJhJyxcbiAgICB6b29tU2NhbGU6ICdFc2NhbGEgZG8gWm9vbScsXG4gICAgaGVpZ2h0UmFuZ2U6ICdBbGNhbmNlIGRhIEFsdHVyYScsXG4gICAgaGVpZ2h0TXVsdGlwbGllcjogJ011bHRpcGxpY2Fkb3IgZGUgYWx0dXJhJyxcbiAgICBmaXhlZEhlaWdodDogJ0FsdHVyYSBmaXhhJyxcbiAgICBmaXhlZEhlaWdodERlc2NyaXB0aW9uOiAnVXNlIGEgYWx0dXJhIHNlbSBtb2RpZmljYcOnw7VlcydcbiAgfSxcbiAgbGF5ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRGF0YTogJ0FkaWNpb25hciBEYWRvcycsXG4gICAgYWRkTGF5ZXI6ICdBZGljaW9uYXIgQ2FtYWRhJyxcbiAgICBsYXllckJsZW5kaW5nOiAnTWlzdHVyYSBkZSBDYW1hZGEnXG4gIH0sXG4gIG1hcE1hbmFnZXI6IHtcbiAgICBtYXBTdHlsZTogJ0VzdGlsbyBkbyBNYXBhJyxcbiAgICBhZGRNYXBTdHlsZTogJ0FkaWNpb25hciBFc3RpbG8gZGUgTWFwYScsXG4gICAgJzNkQnVpbGRpbmdDb2xvcic6ICdDb3IgZG8gRWRpZsOtY2lvIDNEJyxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICdDb3IgZGUgRnVuZG8nXG4gIH0sXG4gIGxheWVyQ29uZmlndXJhdGlvbjoge1xuICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJ0NhbGN1bGFyIHtwcm9wZXJ0eX0gYmFzZWFkYSBubyBjYW1wbyBzZWxlY2lvbmFkbycsXG4gICAgaG93VG86ICdDb21vJ1xuICB9LFxuICBmaWx0ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRmlsdGVyOiAnQWRpY2lvbmFyIEZpbHRybydcbiAgfSxcbiAgZGF0YXNldFRpdGxlOiB7XG4gICAgc2hvd0RhdGFUYWJsZTogJ01vc3RyYXIgdGFiZWxhIGRlIGRhZG9zJyxcbiAgICByZW1vdmVEYXRhc2V0OiAnUmVtb3ZlciB0YWJlbGEgZGUgZGFkb3MnXG4gIH0sXG4gIGRhdGFzZXRJbmZvOiB7XG4gICAgcm93Q291bnQ6ICd7cm93Q291bnR9IGxpbmhhcydcbiAgfSxcbiAgdG9vbHRpcDoge1xuICAgIGhpZGVMYXllcjogJ2VzY29uZGVyIGNhbWFkYScsXG4gICAgc2hvd0xheWVyOiAnbW9zdHJhciBjYW1hZGEnLFxuICAgIGhpZGVGZWF0dXJlOiAnRXNjb25kZXIgcHJvcHJpZWRhZGUnLFxuICAgIHNob3dGZWF0dXJlOiAnTW9zdHJhciBwcm9wcmllZGFkZScsXG4gICAgaGlkZTogJ2VzY29uZGVyJyxcbiAgICBzaG93OiAnbW9zdHJhcicsXG4gICAgcmVtb3ZlTGF5ZXI6ICdSZW1vdmVyIENhbWFkYScsXG4gICAgcmVzZXRBZnRlckVycm9yOiAnVGVudGUgaGFiaWxpdGFyIGEgY2FtYWRhIGFww7NzIHVtIGVycm8nLFxuICAgIGxheWVyU2V0dGluZ3M6ICdDb25maWd1cmHDp8O1ZXMgZGUgQ2FtYWRhJyxcbiAgICBjbG9zZVBhbmVsOiAnRmVjaGFyIHBhaW5lbCBhdHVhbCcsXG4gICAgc3dpdGNoVG9EdWFsVmlldzogJ1Ryb2NhciBwYXJhIHZpc3VhbGl6YcOnw6NvIGR1cGxhIGRlIG1hcGEnLFxuICAgIHNob3dMZWdlbmQ6ICdtb3N0cmFyIGxlZ2VuZGEnLFxuICAgIGRpc2FibGUzRE1hcDogJ0Rlc2FiaWxpdGFyIE1hcGEgM0QnLFxuICAgIERyYXdPbk1hcDogJ0Rlc2VuaGFyIG5vIG1hcGEnLFxuICAgIHNlbGVjdExvY2FsZTogJ1NlbGVjaW9uYXIgbMOtbmd1YScsXG4gICAgc2hvd0FpQXNzaXN0YW50UGFuZWw6ICdNb3N0cmFyIHBhaW5lbCBkZSBBSSBBc3Npc3RhbnQnLFxuICAgIGhpZGVBaUFzc2lzdGFudFBhbmVsOiAnRXNjb25kZXIgcGFpbmVsIGRlIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUxheWVyUGFuZWw6ICdFc2NvbmRlciBwYWluZWwgZGUgY2FtYWRhJyxcbiAgICBzaG93TGF5ZXJQYW5lbDogJ01vc3RyYXIgcGFpbmVsIGRlIGNhbWFkYScsXG4gICAgbW92ZVRvVG9wOiAnTW92ZXIgcGFyYSBvIHRvcG8gZGFzIGNhbWFkYXMnLFxuICAgIHNlbGVjdEJhc2VNYXBTdHlsZTogJ1NlbGVjaW9uYXIgbyBFc3RpbG8gZG8gTWFwYSBCYXNlJyxcbiAgICBkZWxldGU6ICdEZWxldGFyJyxcbiAgICB0aW1lUGxheWJhY2s6ICdUZW1wbyBkZSByZXByb2R1w6fDo28nLFxuICAgIGNsb3VkU3RvcmFnZTogJ0FybWF6ZW5hbWVudG8gQ2xvdWQnLFxuICAgICczRE1hcCc6ICcgTWFwYSAzRCdcbiAgfSxcbiAgdG9vbGJhcjoge1xuICAgIGV4cG9ydEltYWdlOiAnRXhwb3J0YXIgSW1hZ2VtJyxcbiAgICBleHBvcnREYXRhOiAnRXhwb3J0YXIgRGFkb3MnLFxuICAgIGV4cG9ydE1hcDogJ0V4cG9ydGFyIE1hcGEnLFxuICAgIHNoYXJlTWFwVVJMOiAnQ29tcGFydGlsaGFyIFVSTCBkbyBNYXBhJyxcbiAgICBzYXZlTWFwOiAnU2FsdmFyIE1hcGEnLFxuICAgIHNlbGVjdDogJ3NlbGVjaW9uYXInLFxuICAgIHBvbHlnb246ICdwb2zDrWdvbm8nLFxuICAgIHJlY3RhbmdsZTogJ3JldMOibmd1bG8nLFxuICAgIGhpZGU6ICdlc2NvbmRlcicsXG4gICAgc2hvdzogJ21vc3RyYXInLFxuICAgIC4uLkxPQ0FMRVNcbiAgfSxcbiAgbW9kYWw6IHtcbiAgICB0aXRsZToge1xuICAgICAgZGVsZXRlRGF0YXNldDogJ0RlbGV0YXIgQ29uanVudG8gZGUgRGFkb3MnLFxuICAgICAgYWRkRGF0YVRvTWFwOiAnQWRpY2lvbmFyIERhZG9zIGFvIE1hcGEnLFxuICAgICAgZXhwb3J0SW1hZ2U6ICdFeHBvcnRhciBJbWFnZW0nLFxuICAgICAgZXhwb3J0RGF0YTogJ0V4cG9ydGFyIERhZG9zJyxcbiAgICAgIGV4cG9ydE1hcDogJ0V4cG9ydGFyIE1hcGEnLFxuICAgICAgYWRkQ3VzdG9tTWFwYm94U3R5bGU6ICdBZGljaW9uYXIgRXN0aWxvIE1hcGJveCBDdXN0b21pemFkbycsXG4gICAgICBzYXZlTWFwOiAnU2FsdmFyIE1hcGEnLFxuICAgICAgc2hhcmVVUkw6ICdDb21wYXJ0aWxoYXIgVVJMJ1xuICAgIH0sXG4gICAgYnV0dG9uOiB7XG4gICAgICBkZWxldGU6ICdEZWxldGFyJyxcbiAgICAgIGRvd25sb2FkOiAnRG93bmxvYWQnLFxuICAgICAgZXhwb3J0OiAnRXhwb3J0YXInLFxuICAgICAgYWRkU3R5bGU6ICdBZGljaW9uYXIgRXN0aWxvJyxcbiAgICAgIHNhdmU6ICdTYWx2YXInLFxuICAgICAgZGVmYXVsdENhbmNlbDogJ0NhbmNlbGFyJyxcbiAgICAgIGRlZmF1bHRDb25maXJtOiAnQ29uZmlybWFyJ1xuICAgIH0sXG4gICAgZXhwb3J0SW1hZ2U6IHtcbiAgICAgIHJhdGlvVGl0bGU6ICdQcm9wb3LDp8OjbycsXG4gICAgICByYXRpb0Rlc2NyaXB0aW9uOiAnRXNjb2xoYSBhIHByb3BvcsOnw6NvIHBhcmEgdsOhcmlvcyB1c29zLicsXG4gICAgICByYXRpb09yaWdpbmFsU2NyZWVuOiAnVGVsYSBPcmlnaW5hbCcsXG4gICAgICByYXRpb0N1c3RvbTogJ0N1c3RvbWl6YWRvJyxcbiAgICAgIHJhdGlvNF8zOiAnNDozJyxcbiAgICAgIHJhdGlvMTZfOTogJzE2OjknLFxuICAgICAgcmVzb2x1dGlvblRpdGxlOiAnUmVzb2x1w6fDo28nLFxuICAgICAgcmVzb2x1dGlvbkRlc2NyaXB0aW9uOiAnQWx0YSByZXNvbHXDp8OjbyDDqSBtZWxob3IgcGFyYSBpbXByZXNzw7Vlcy4nLFxuICAgICAgbWFwTGVnZW5kVGl0bGU6ICdMZWdlbmRhIGRvIE1hcGEnLFxuICAgICAgbWFwTGVnZW5kQWRkOiAnQWRpY2lvbmFyIExlZ2VuZGEgbm8gbWFwYSdcbiAgICB9LFxuICAgIGV4cG9ydERhdGE6IHtcbiAgICAgIGRhdGFzZXRUaXRsZTogJ0Nvbmp1bnRvIGRlIGRhZG9zJyxcbiAgICAgIGRhdGFzZXRTdWJ0aXRsZTogJ0VzY29saGEgbyBjb25qdW50byBkZSBkYWRvcyBxdWUgdm9jw6ogcXVlciBleHBvcnRhcicsXG4gICAgICBhbGxEYXRhc2V0czogJ1RvZG9zJyxcbiAgICAgIGRhdGFUeXBlVGl0bGU6ICdUaXBvIGRlIERhZG8nLFxuICAgICAgZGF0YVR5cGVTdWJ0aXRsZTogJ0VzY29saGEgbyB0aXBvIGRlIGRhZG9zIHF1ZSB2b2PDqiBxdWVyIGV4cG9ydGFyJyxcbiAgICAgIGZpbHRlckRhdGFUaXRsZTogJ0ZpbHRyYXIgRGFkb3MnLFxuICAgICAgZmlsdGVyRGF0YVN1YnRpdGxlOiAnVm9jw6ogcG9kZSBlc2NvbGhlciBleHBvcnRhciBvcyBkYWRvcyBvcmlnaW5haXMgb3Ugb3MgZGFkb3MgZmlsdHJhZG9zJyxcbiAgICAgIGZpbHRlcmVkRGF0YTogJ0RhZG9zIEZpbHRyYWRvcycsXG4gICAgICB1bmZpbHRlcmVkRGF0YTogJ0RhZG9zIG7Do28gZmlsdHJhZG9zJyxcbiAgICAgIGZpbGVDb3VudDogJ3tmaWxlQ291bnR9IEFycXVpdm9zJyxcbiAgICAgIHJvd0NvdW50OiAne3Jvd0NvdW50fSBMaW5oYXMnXG4gICAgfSxcbiAgICBkZWxldGVEYXRhOiB7XG4gICAgICB3YXJuaW5nOiAndm9jw6ogaXLDoSBkZWxldGFyIGVzc2UgY29uanVudG8gZGUgZGFkb3MuIElzc28gaXLDoSBhZmV0YXIge2xlbmd0aH0gY2FtYWRhcydcbiAgICB9LFxuICAgIGFkZFN0eWxlOiB7XG4gICAgICBwdWJsaXNoVGl0bGU6ICcxLiBQdWJsaXF1ZSBvIHNldSBFc3RpbG8gbm8gTWFwYm94IG91IHByb3ZpZGVuY2llIGEgY2hhdmUgZGUgYWNlc3NvJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTE6ICdWb2PDqiBwb2RlIGNyaWFyIG8gc2V1IHByw7NwcmlvIGVzdGlsbyBlbScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUyOiAnZScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUzOiAncHVibGljYXInLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNDogJ2lzc28uJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTU6ICdQYXJhIHV0aWxpemFyIGVzdGlsbyBwcml2YWRvLCBjb2xlIGEgc3VhJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTY6ICdjaGF2ZSBkZSBhY2Vzc28nLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNzpcbiAgICAgICAgJ2FxdWkuICprZXBsZXIuZ2wgw6kgdW1hIGFwbGljYcOnw6NvIGNsaWVudC1zaWRlLCBvcyBkYWRvcyBwZXJtYW5lY2VtIG5vIHNldSBicm93c2VyLi4nLFxuICAgICAgZXhhbXBsZVRva2VuOiAnZS5nLiBway5hYmNkZWZnLnh4eHh4eCcsXG4gICAgICBwYXN0ZVRpdGxlOiAnMi4gQ29sZSBhIHVybCBkbyBzZXUgZXN0aWxvJyxcbiAgICAgIHBhc3RlU3VidGl0bGUxOiAnTyBxdWUgw6kgdW1hJyxcbiAgICAgIHBhc3RlU3VidGl0bGUyOiAnVVJMIGRlIGVzdGlsbycsXG4gICAgICBuYW1pbmdUaXRsZTogJzMuIE5vbWVpZSBvIHNldSBlc3RpbG8nXG4gICAgfSxcbiAgICBzaGFyZU1hcDoge1xuICAgICAgc2hhcmVVcmlUaXRsZTogJ0NvbXBhcnRpbGhhciBhIFVSTCBkbyBNYXBhJyxcbiAgICAgIHNoYXJlVXJpU3VidGl0bGU6ICdHZXJhciBhIHVybCBkbyBtYXBhIGUgY29tcGFydGlsaGFyIGNvbSBvdXRyb3MnLFxuICAgICAgY2xvdWRUaXRsZTogJ0FybWF6ZW5hbWVudG8gQ2xvdWQnLFxuICAgICAgY2xvdWRTdWJ0aXRsZTogJ0NvbmVjdGUtc2UgZSBlbnZpZSBvcyBkYWRvcyBkbyBtYXBhIHBhcmEgbyBzZXUgYXJtYXplbmFtZW50byBjbG91ZCBwZXNzb2FsJyxcbiAgICAgIHNoYXJlRGlzY2xhaW1lcjpcbiAgICAgICAgJ2tlcGxlci5nbCBpcsOhIHNhbHZhciBvcyBkYWRvcyBkbyBtYXBhIGVtIHNldSBhcm1hemVuYW1lbnRvIGNsb3VkIHBlc3NvYWwsIGFwZW5hcyBwZXNzb2FzIGNvbSBhIFVSTCBwb2RlbSBhY2Vzc2FyIG8gc2V1IG1hcGEgZSBkYWRvcy4gJyArXG4gICAgICAgICdWb2PDqiBwb2RlIGVkaXRhci9kZWxldGFyIG8gYXJxdWl2byBkZSBkYWRvcyBuYSBzdWEgY29udGEgZGUgYXJtYXplbmFtZW50byBjbG91ZCBlbSBxdWFscXVlciBtb21lbnRvLicsXG4gICAgICBnb3RvUGFnZTogJ1bDoSBwYXJhIGEgc3VhIHDDoWdpbmEgS2VwbGVyLmdsIHtjdXJyZW50UHJvdmlkZXJ9J1xuICAgIH0sXG4gICAgc3RhdHVzUGFuZWw6IHtcbiAgICAgIG1hcFVwbG9hZGluZzogJ0VudmlhbmRvIE1hcGEnLFxuICAgICAgZXJyb3I6ICdFcnJvJ1xuICAgIH0sXG4gICAgc2F2ZU1hcDoge1xuICAgICAgdGl0bGU6ICdBcm1hemVuYW1lbnRvIENsb3VkJyxcbiAgICAgIHN1YnRpdGxlOiAnQ29uZWN0ZS1zZSBwYXJhIHNhbHZhciBvIG1hcGEgcGFyYSBvIHNldSBhcm1hemVuYW1lbnRvIGNsb3VkIHBlc3NvYWwnXG4gICAgfSxcbiAgICBleHBvcnRNYXA6IHtcbiAgICAgIGZvcm1hdFRpdGxlOiAnRm9ybWF0byBkbyBtYXBhJyxcbiAgICAgIGZvcm1hdFN1YnRpdGxlOiAnRXNjb2xoZXIgbyBmb3JtYXRvIGRlIG1hcGEgcGFyYSBleHBvcnRhcicsXG4gICAgICBodG1sOiB7XG4gICAgICAgIHNlbGVjdGlvbjogJ0V4cG9ydGFyIHNldSBtYXBhIGVtIHVtIGFycXVpdm8gaHRtbCBpbnRlcmF0aXZvLicsXG4gICAgICAgIHRva2VuVGl0bGU6ICdDaGF2ZSBkZSBhY2Vzc28gZG8gTWFwYm94JyxcbiAgICAgICAgdG9rZW5TdWJ0aXRsZTogJ1VzZSBhIHN1YSBwcsOzcHJpYSBjaGF2ZSBkZSBhY2Vzc28gTWFwYm94IGVtIHNldSBhcnF1aXZvIGh0bWwgKG9wY2lvbmFsKScsXG4gICAgICAgIHRva2VuUGxhY2Vob2xkZXI6ICdDb2xlIGEgc3VhIGNoYXZlIGRlIGFjZXNzbyBNYXBib3gnLFxuICAgICAgICB0b2tlbk1pc3VzZVdhcm5pbmc6XG4gICAgICAgICAgJyogU2Ugdm9jw6ogbsOjbyBmb3JuZWNlciBhIHN1YSBwcsOzcHJpYSBjaGF2ZSBkZSBhY2Vzc28sIG8gbWFwYSBwb2RlIGZhbGhhciBlbSBleGliaXIgYSBxdWFscXVlciBtb21lbnRvIHF1YW5kbyBuw7NzIHN1YnN0aXR1aXJtb3MgYSBub3NzYSBwYXJhIGV2aXRhciBtYXUgdXNvLiAnLFxuICAgICAgICB0b2tlbkRpc2NsYWltZXI6XG4gICAgICAgICAgJ1ZvY8OqIHBvZGUgdHJvY2FyIGEgc3VhIGNoYXZlIGRlIGFjZXNzbyBNYXBib3ggbWFpcyB0YXJkZSB1dGl6YW5kbyBhcyBpbnN0cnXDp8O1ZXMgc2VndWludGVzOiAnLFxuICAgICAgICB0b2tlblVwZGF0ZTogJ0NvbW8gYXR1YWxpemFyIGEgY2hhdmUgZGUgYWNlc3NvIGRlIHVtIG1hcGEgZXhpc3RlbnRlLicsXG4gICAgICAgIG1vZGVUaXRsZTogJ01vZG8gZG8gTWFwYScsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTE6ICdTZWxlY2lvbmFyIG8gbW9kbyBkbyBhcGxpY2F0aXZvLiBNYWlzICcsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTI6ICdpbmZvJyxcbiAgICAgICAgbW9kZURlc2NyaXB0aW9uOiAnUGVybWl0aXIgdXN1w6FyaW9zIGEge21vZGV9IG8gbWFwYScsXG4gICAgICAgIHJlYWQ6ICdsZXInLFxuICAgICAgICBlZGl0OiAnZWRpdGFyJ1xuICAgICAgfSxcbiAgICAgIGpzb246IHtcbiAgICAgICAgY29uZmlnVGl0bGU6ICdDb25maWd1cmHDp8O1ZXMgZG8gTWFwYScsXG4gICAgICAgIGNvbmZpZ0Rpc2NsYWltZXI6XG4gICAgICAgICAgJ0EgY29uZmlndXJhw6fDo28gZG8gbWFwYSBzZXLDoSBpbmNsdWlkYSBubyBhcnF1aXZvIEpzb24uIFNlIHZvY8OqIGVzdMOhIHV0aWxpemFuZG8ga2VwbGVyLmdsIG5vIHNldSBwcsOzcHJpbyBtYXBhLiBWb2PDqiBwb2RlIGNvcGlhciBlc3NhIGNvbmZpZ3VyYcOnw6NvIGUgcGFzc2FyIHBhcmEgZWxlICcsXG4gICAgICAgIHNlbGVjdGlvbjpcbiAgICAgICAgICAnRXhwb3J0YXIgYXR1YWlzIGRhZG9zIGUgY29uZmlndXJhw6fDtWVzIGRvIG1hcGEgZW0gdW0gw7puaWNvIGFycXVpdm8gSnNvbi4gVm9jw6ogcG9kZSBtYWlzIHRhcmRlIGFicmlyIG8gbWVzbW8gbWFwYSBlbnZpYW5kbyBlc3NlIGFycXVpdm8gcGFyYSBvIGtlcGxlci5nbC4nLFxuICAgICAgICBkaXNjbGFpbWVyOlxuICAgICAgICAgICcqIENvbmZpZ3VyYcOnw6NvIGRvIG1hcGEgw6kgYWNsb3BhZG8gY29tIGNvbmp1bnRvIGRlIGRhZG9zIGNhcnJlZ2Fkb3MuIOKAmGRhdGFJZOKAmSDDqSB1dGlsaXphZG8gcGFyYSBsaWdhciBhcyBjYW1hZGFzLCBmaWx0cm9zLCBlIGRpY2FzIGRlIGNvbnRleHRvcyBhIGNvbmp1bnRvIGRlIGRhZG9zIGV4cGVjw61maWNvcy4gJyArXG4gICAgICAgICAgJ1F1YW5kbyBwYXNzYW5kbyBlc3NhIGNvbmZpZ3VyYcOnw6NvIHBhcmEgYWRkRGF0YVRvTWFwLCB0ZW5oYSBjZXJ0ZXphIGRlIHF1ZSBvIGlkIGRvIGNvbmp1bnRvIGRlIGRhZG9zIGNvbWJpbmEgY29tIG8ocykgZGF0YUlkL3MgbmVzc2EgY29uZmlndXJhw6fDo28uJ1xuICAgICAgfVxuICAgIH0sXG4gICAgbG9hZGluZ0RpYWxvZzoge1xuICAgICAgbG9hZGluZzogJ0NhcnJlZ2FuZG8uLi4nXG4gICAgfSxcbiAgICBsb2FkRGF0YToge1xuICAgICAgdXBsb2FkOiAnQ2FycmVnYXIgYXJxdWl2bycsXG4gICAgICBzdG9yYWdlOiAnQ2FycmVnYXIgZG8gYXJtYXplbmFtZW50bydcbiAgICB9LFxuICAgIHRyaXBJbmZvOiB7XG4gICAgICB0aXRsZTogJ0NvbW8gaGFiaWxpdGFyIGFuaW1hw6fDo28gZGUgdmlhZ2VtJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ1BhcmEgYW5pbWFyIG8gY2FtaW5obywgbyBkYWRvIGdlb0pTT04gZGV2ZSBjb250ZXIgYExpbmVTdHJpbmdgIG5hIHN1YSBwcm9wcmllZGFkZSBnZW9tZXRyeSwgZSBhcyBjb29yZGVuYWRhcyBuYSBMaW5lU3RyaW5nIGRldmVtIHRlciA0IGVsZW1lbnRvcyBubyBzZWd1aW50ZSBmb3JtYXRvJyxcbiAgICAgIGNvZGU6ICcgW2xvbmdpdHVkZSwgbGF0aXR1ZGUsIGFsdGl0dWRlLCBkYXRhXSAnLFxuICAgICAgZGVzY3JpcHRpb24yOlxuICAgICAgICAnY29tIHVtIHVsdGltbyBlbGVtZW50byBzZW5kbyB1bWEgZGF0YS4gVW0gZm9ybWF0byBkZSBkYXRhIHbDoWxpZGEgaW5jbHVpIHNlZ3VuZG9zIHVuaXggY29tbyBgMTU2NDE4NDM2M2Agb3UgZW0gbWlsaXNlZ3VuZG9zIGNvbW8gYDE1NjQxODQzNjMwMDBgLicsXG4gICAgICBleGFtcGxlOiAnRXhlbXBsbzonXG4gICAgfSxcbiAgICBpY29uSW5mbzoge1xuICAgICAgdGl0bGU6ICdDb21vIGRlc2VuaGFyIMOtY29uZXMnLFxuICAgICAgZGVzY3JpcHRpb24xOlxuICAgICAgICAnTm8gc2V1IGNzdiwgY3JpZSB1bWEgY29sdW5hLCBjb2xvcXVlIG8gbm9tZSBkbyDDrWNvbmUgcXVlIHZvY8OqIHF1ZXIgZGVzZW5oYXIgbmVsZS4gVm9jw6ogcG9kZSBkZWl4YXIgbyBjYW1wbyB2YXppbyBzZSB2b2PDqiBuw6NvIGRlc2VqYXIgcXVlIG8gw61jb25lIGFwYXJlw6dhIHBhcmEgYWxndW5zIHBvbnRvcy4gUXVhbmRvIGEgY29sdW5hIHRlbSBub21lJyxcbiAgICAgIGNvZGU6ICdpY29uJyxcbiAgICAgIGRlc2NyaXB0aW9uMjogJyBrZXBsZXIuZ2wgaXLDoSBhdXRvbWF0aWNhbWVudGUgY3JpYXIgdW1hIGNhbWFkYSBkZSDDrWNvbmUgcGFyYSB2b2PDqi4nLFxuICAgICAgZXhhbXBsZTogJ0V4ZW1wbG9zOicsXG4gICAgICBpY29uczogJ8ONY29uZXMnXG4gICAgfSxcbiAgICBzdG9yYWdlTWFwVmlld2VyOiB7XG4gICAgICBsYXN0TW9kaWZpZWQ6ICdNb2RpZmljYWRvIGjDoSB7bGFzdFVwZGF0ZWR9JyxcbiAgICAgIGJhY2s6ICdWb2x0YXInXG4gICAgfSxcbiAgICBvdmVyd3JpdGVNYXA6IHtcbiAgICAgIHRpdGxlOiAnU2FsdmFuZG8gbWFwYS4uLicsXG4gICAgICBhbHJlYWR5RXhpc3RzOiAnasOhIGV4aXN0ZSBubyBtYXBhIHttYXBTYXZlZH0uIFZvY8OqIGRlc2VqYXJpYSBzb2JyZXNjcmV2ZXIgbyBtYXBhPydcbiAgICB9LFxuICAgIGxvYWRTdG9yYWdlTWFwOiB7XG4gICAgICBiYWNrOiAnVm9sdGFyJyxcbiAgICAgIGdvVG9QYWdlOiAnVsOhIHBhcmEgYSBzdWEgcMOhZ2luYSB7ZGlzcGxheU5hbWV9IGRvIEtlcGxlci5nbCcsXG4gICAgICBzdG9yYWdlTWFwczogJ0FybWF6ZW5hbWVudG8gLyBNYXBhcycsXG4gICAgICBub1NhdmVkTWFwczogJ05lbmh1bSBtYXBhIHNhbHZvJ1xuICAgIH1cbiAgfSxcbiAgaGVhZGVyOiB7XG4gICAgdmlzaWJsZUxheWVyczogJ0NhbWFkYXMgVmlzw612ZWlzJyxcbiAgICBsYXllckxlZ2VuZDogJ0xlZ2VuZGEgZGEgQ2FtYWRhJ1xuICB9LFxuICBpbnRlcmFjdGlvbnM6IHtcbiAgICB0b29sdGlwOiAnRGljYSBkZSBjb250ZXh0bycsXG4gICAgYnJ1c2g6ICdQaW5jZWwnLFxuICAgIGNvb3JkaW5hdGU6ICdDb29yZGVuYWRhcydcbiAgfSxcbiAgbGF5ZXJCbGVuZGluZzoge1xuICAgIHRpdGxlOiAnTWlzdHVyYSBkZSBDYW1hZGFzJyxcbiAgICBhZGRpdGl2ZTogJ2FkaXRpdm8nLFxuICAgIG5vcm1hbDogJ25vcm1hbCcsXG4gICAgc3VidHJhY3RpdmU6ICdzdWJ0cmF0aXZvJ1xuICB9LFxuICBjb2x1bW5zOiB7XG4gICAgdGl0bGU6ICdDb2x1bmFzJyxcbiAgICBsYXQ6ICdsYXQnLFxuICAgIGxuZzogJ2xvbicsXG4gICAgYWx0aXR1ZGU6ICdhbHRpdHVkZScsXG4gICAgaWNvbjogJ8OtY29uZScsXG4gICAgZ2VvanNvbjogJ2dlb2pzb24nLFxuICAgIGFyYzoge1xuICAgICAgbGF0MDogJ29yaWdlbSBsYXQnLFxuICAgICAgbG5nMDogJ29yaWdlbSBsbmcnLFxuICAgICAgbGF0MTogJ2Rlc3Rpbm8gbGF0JyxcbiAgICAgIGxuZzE6ICdkZXN0aW5vIGxuZydcbiAgICB9LFxuICAgIGxpbmU6IHtcbiAgICAgIGFsdDA6ICdvcmlnZW0gYWx0aXR1ZGUnLFxuICAgICAgYWx0MTogJ2Rlc3Rpbm8gYWx0aXR1ZGUnXG4gICAgfSxcbiAgICBncmlkOiB7XG4gICAgICB3b3JsZFVuaXRTaXplOiAnVGFtYW5obyBkYSBHcmFkZSAoa20pJ1xuICAgIH0sXG4gICAgaGV4YWdvbjoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ1JhaW8gZG8gSGV4w6Fnb25vIChrbSknXG4gICAgfVxuICB9LFxuICBjb2xvcjoge1xuICAgIGN1c3RvbVBhbGV0dGU6ICdQYWxldGFzIGN1c3RvbWl6YWRhcycsXG4gICAgc3RlcHM6ICdjYW1pbmhvcycsXG4gICAgdHlwZTogJ3RpcG8nLFxuICAgIHJldmVyc2VkOiAncmV2ZXJzbydcbiAgfSxcbiAgc2NhbGU6IHtcbiAgICBjb2xvclNjYWxlOiAnRXNjYWxhIGRhIENvcicsXG4gICAgc2l6ZVNjYWxlOiAnVGFtYW5obyBkYSBFc2NhbGEnLFxuICAgIHN0cm9rZVNjYWxlOiAnRXNjYWxhIGRvIFRyYcOnbycsXG4gICAgc2NhbGU6ICdFc2NhbGEnXG4gIH0sXG4gIGZpbGVVcGxvYWRlcjoge1xuICAgIG1lc3NhZ2U6ICdBcnJhc3RlIGUgc29sdGUgc2V1KHMpIGFycXVpdm8ocykgYXF1aScsXG4gICAgY2hyb21lTWVzc2FnZTpcbiAgICAgICcqVXN1w6FyaW9zIGRvIGNocm9tZTogTyBsaW1pdGUgZGUgdGFtYW5obyBkZSBhcnF1aXZvIMOpIDI1MG1iLCBzZSB2b2PDqiBwcmVjaXNhIGZhemVyIHVwbG9hZCBkZSBhcnF1aXZvcyBtYWlvcmVzIHRlbnRlIG8gU2FmYXJpJyxcbiAgICBkaXNjbGFpbWVyOlxuICAgICAgJyprZXBsZXIuZ2wgw6kgdW1hIGFwbGljYcOnw6NvIGNsaWVudC1zaWRlLCBzZW0gdW0gc2Vydmlkb3IgYmFja2VuZC4gT3MgZGFkb3MgZmljYW0gYXBlbmFzIG5hIHN1YSBtw6FxdWluYS9icm93c2VyLiAnICtcbiAgICAgICdOZW5odW1hIGluZm9ybWHDp8OjbyBvdSBkYWRvcyBkZSBtYXBhIMOpIGVudmlhZG8gcGFyYSBxdWFscXVlciBzZXJ2ZXIuJyxcbiAgICBjb25maWdVcGxvYWRNZXNzYWdlOlxuICAgICAgJ0VudmllIHtmaWxlRm9ybWF0TmFtZXN9IG91IG1hcGFzIHNhbHZvcyAqKkpzb24qKi4gTGVpYSBtYWlzIHNvYnJlIFsqKnRpcG9zIGRlIGFycXVpdm9zIHN1cG9ydGFkb3MqKl0nLFxuICAgIGJyb3dzZUZpbGVzOiAncHJvY3VyZSBzZXVzIGFycXVpdm9zJyxcbiAgICB1cGxvYWRpbmc6ICdFbnZpYW5kbycsXG4gICAgZmlsZU5vdFN1cHBvcnRlZDogJ0FycXVpdm8ge2Vycm9yRmlsZXN9IG7Do28gw6kgc3Vwb3J0YWRvLicsXG4gICAgb3I6ICdvdSdcbiAgfSxcbiAgZGVuc2l0eTogJ2RlbnNpZGFkZScsXG4gICdCdWcgUmVwb3J0JzogJ1JlcG9ydGFyIEJ1ZycsXG4gICdVc2VyIEd1aWRlJzogJ0d1aWEgZG8gVXN1w6FyaW8nLFxuICBTYXZlOiAnU2FsdmFyJyxcbiAg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