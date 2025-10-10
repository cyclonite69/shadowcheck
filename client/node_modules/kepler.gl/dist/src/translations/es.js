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
    weight: 'peso',
    label: 'etiqueta',
    fillColor: 'color de relleno',
    color: 'color',
    coverage: 'cobertura',
    strokeColor: 'color de trazo',
    radius: 'radio',
    outline: 'contorno',
    stroke: 'trazo',
    density: 'densidad',
    height: 'altura',
    sum: 'suma',
    pointCount: 'Recuento de puntos'
  },
  placeholder: {
    search: 'Busqueda',
    selectField: 'Selecciona un campo',
    yAxis: 'Eje Y',
    selectType: 'Selecciona un Tipo',
    selectValue: 'Selecciona un Valor',
    enterValue: 'Entra un valor',
    empty: 'vacio'
  },
  misc: {
    by: '',
    valuesIn: 'Valores en',
    valueEquals: 'Valor igual a',
    dataSource: 'Fuente de datos',
    brushRadius: 'Radio del pincel (km)',
    empty: ' '
  },
  mapLayers: {
    title: 'Capas del mapa',
    label: 'Etiqueta',
    road: 'Carretera',
    border: 'Frontera',
    building: 'Edificio',
    water: 'Agua',
    land: 'Tierra',
    '3dBuilding': 'Edificio 3D',
    background: 'Fondo'
  },
  panel: {
    text: {
      label: 'etiqueta',
      labelWithId: 'Etiqueta {labelId}',
      fontSize: 'Tamaño de fuente',
      fontColor: 'Color de fuente',
      textAnchor: 'Anclaje del texto',
      alignment: 'Alineación',
      addMoreLabel: 'Añadir más etiquetas'
    }
  },
  sidebar: {
    panels: {
      layer: 'Capas',
      filter: 'Filtros',
      interaction: 'Interacciones',
      basemap: 'Mapa base'
    }
  },
  layer: {
    required: 'Requerido*',
    radius: 'Radio',
    color: 'Color',
    fillColor: 'Color de relleno',
    outline: 'Contorno',
    weight: 'Grueso',
    propertyBasedOn: '{property} basado en',
    coverage: 'Cobertura',
    stroke: 'Trazo',
    strokeWidth: 'Grosor de trazo',
    strokeColor: 'Color de trazo',
    basic: 'Básico',
    trailLength: 'Longitud de pista',
    trailLengthDescription: 'Numero de segundos hasta que desaparezca el camino',
    newLayer: 'nueva capa',
    elevationByDescription: 'Si desactivado, la altura se basa en el recuento de puntos',
    colorByDescription: 'Si desactivado, el color se basa en el recuento de puntos',
    aggregateBy: '{field} agregado por',
    '3DModel': 'Modelo 3D',
    '3DModelOptions': 'Opciones del modelo 3D',
    type: {
      point: 'punto',
      arc: 'arco',
      line: 'línea',
      grid: 'malla',
      hexbin: 'hexbin',
      polygon: 'polígono',
      geojson: 'geojson',
      cluster: 'cluster',
      icon: 'icono',
      heatmap: 'concentración',
      hexagon: 'hexágono',
      hexagonid: 'H3',
      trip: 'viaje',
      s2: 'S2',
      '3d': '3D'
    },
    layerUpdateError: 'Se produjo un error durante la actualización de la capa: {errorMessage}. Asegúrese de que el formato de los datos de entrada sea válido.'
  },
  layerVisConfigs: {
    angle: 'Ángulo',
    strokeWidth: 'Ancho del trazo',
    strokeWidthRange: 'Rango del ancho del trazo',
    radius: 'Radio',
    fixedRadius: 'Radio fijo a medir',
    fixedRadiusDescription: 'Ajustar el radio al radio absoluto en metros, p.e. 5 a 5 metros',
    radiusRange: 'Rango de radio',
    clusterRadius: 'Radio del cluster en píxeles',
    radiusRangePixels: 'Rango del radio en píxeles',
    billboard: 'Modo cartelera',
    billboardDescription: 'Oriente la geometría hacia la cámara',
    fadeTrail: 'Sendero de desvanecimiento',
    opacity: 'Opacidad',
    coverage: 'Cobertura',
    outline: 'Contorno',
    colorRange: 'Rango de color',
    stroke: 'Trazo',
    strokeColor: 'Color de trazo',
    strokeColorRange: 'Rango de color de trazo',
    targetColor: 'Color destino',
    colorAggregation: 'Agregación de color',
    heightAggregation: 'Agregación de la altura',
    resolutionRange: 'Rango de resolución',
    sizeScale: 'Medida de escala',
    worldUnitSize: 'Medida de la unidad mundial',
    elevationScale: 'Escala de elevación',
    enableElevationZoomFactor: 'Usar factor de zoom de elevación',
    enableElevationZoomFactorDescription: 'Ajuste la altura / elevación según el factor de zoom actual',
    enableHeightZoomFactor: 'Usar factor de zoom de altura',
    heightScale: 'Escala de altura',
    coverageRange: 'Rango de cobertura',
    highPrecisionRendering: 'Representación de alta precisión',
    highPrecisionRenderingDescription: 'La precisión alta tendrá un rendimiento más bajo',
    height: 'Altura',
    heightDescription: 'Haz clic en el botón de arriba a la derecha del mapa per cambiar a vista 3D',
    fill: 'Rellenar',
    enablePolygonHeight: 'Activar la altura del polígono',
    showWireframe: 'Muestra esquemàtico',
    weightIntensity: 'Intensidad de peso',
    zoomScale: 'Escala de zoom',
    heightRange: 'Rango de alturas',
    heightMultiplier: 'Multiplicador de altura',
    fixedHeight: 'Altura fija',
    fixedHeightDescription: 'Usar altura sin modificaciones'
  },
  layerManager: {
    addData: 'Añadir datos',
    addLayer: 'Añadir capa',
    layerBlending: 'Combinar capas'
  },
  mapManager: {
    mapStyle: 'Estilo de mapa',
    addMapStyle: 'Añadir estilo de mapa',
    '3dBuildingColor': 'Color edificios 3D',
    backgroundColor: 'Color de fondo'
  },
  layerConfiguration: {
    defaultDescription: 'Calcular {property} según el campo seleccionado',
    howTo: 'How to'
  },
  filterManager: {
    addFilter: 'Añadir filtro'
  },
  datasetTitle: {
    showDataTable: 'Mostar la tabla de datos',
    removeDataset: 'Eliminar conjunto de datos'
  },
  datasetInfo: {
    rowCount: '{rowCount} files'
  },
  tooltip: {
    hideLayer: 'Ocultar la capa',
    showLayer: 'Mostrar la capa',
    hideFeature: 'Ocultar el objeto',
    showFeature: 'Mostrar el objeto',
    hide: 'Ocultar',
    show: 'Mostrar',
    removeLayer: 'Eliminar capa',
    resetAfterError: 'Intente habilitar la capa después de un error',
    layerSettings: 'Configuración de capa',
    closePanel: 'Cerrar el panel actual',
    switchToDualView: 'Cambiar a la vista de mapa dual',
    showLegend: 'Mostrar leyenda',
    disable3DMap: 'Desactivar mapa 3D',
    DrawOnMap: 'Dibujar en el mapa',
    selectLocale: 'Seleccionar configuración regional',
    showAiAssistantPanel: 'Mostrar el panel de AI Assistant',
    hideAiAssistantPanel: 'Ocultar el panel de AI Assistant',
    hideLayerPanel: 'Ocultar la tabla de capas',
    showLayerPanel: 'Mostrar la tabla  de capas',
    moveToTop: 'Desplazar arriba de las capas de datos',
    selectBaseMapStyle: 'Seleccionar estilo de mapa base',
    "delete": 'Borrar',
    timePlayback: 'Reproducción de tiempo',
    cloudStorage: 'Almacenaje en la nube',
    '3DMap': 'Mapa 3D',
    animationByWindow: 'Ventana Temporal Móvil',
    animationByIncremental: 'Ventana Temporal Incremental',
    speed: 'velocidad',
    play: 'iniciar',
    pause: 'pausar',
    reset: 'reiniciar'
  },
  toolbar: _objectSpread({
    exportImage: 'Exportar imagen',
    exportData: 'Exportar datos',
    exportMap: 'Exportar mapa',
    shareMapURL: 'Compartir el enlace del mapa',
    saveMap: 'Guardar mapa',
    select: 'selecciona',
    polygon: 'polígono',
    rectangle: 'rectángulo',
    hide: 'esconder',
    show: 'mostrar'
  }, _locales.LOCALES),
  modal: {
    title: {
      deleteDataset: 'Borrar conjunto de datos',
      addDataToMap: 'Añadir datos al mapa',
      exportImage: 'Exportar imagen',
      exportData: 'Exportar datos',
      exportMap: 'Exportar mapa',
      addCustomMapboxStyle: 'Añadir estilo de Mapbox propio',
      saveMap: 'Guardar mapa',
      shareURL: 'Compartir enlace'
    },
    button: {
      "delete": 'Borrar',
      download: 'Descargar',
      "export": 'Exportar',
      addStyle: 'Añadir estilo',
      save: 'Guardar',
      defaultCancel: 'Cancelar',
      defaultConfirm: 'Confirmar'
    },
    exportImage: {
      ratioTitle: 'Ratio',
      ratioDescription: 'Esoger ratio por diversos usos.',
      ratioOriginalScreen: 'Pantalla original',
      ratioCustom: 'Personalizado',
      ratio4_3: '4:3',
      ratio16_9: '16:9',
      resolutionTitle: 'Resolución',
      resolutionDescription: 'Una alta resolución es mejor para las impresiones.',
      mapLegendTitle: 'Leyenda del mapa',
      mapLegendAdd: 'Añadir leyenda al mapa'
    },
    exportData: {
      datasetTitle: 'Conjunto de datos',
      datasetSubtitle: 'Escoger los conjuntos de datos a exportar',
      allDatasets: 'Todos',
      dataTypeTitle: 'Tipo de datos',
      dataTypeSubtitle: 'Escoger el tipo de datos a exportar',
      filterDataTitle: 'Filtrar datos',
      filterDataSubtitle: 'Se puede escoger exportar los datos originales o filtrados',
      filteredData: 'Datos filtrados',
      unfilteredData: 'Datos sin filtrar',
      fileCount: '{fileCount} Archivos',
      rowCount: '{rowCount} Files'
    },
    deleteData: {
      warning: 'estás a punto de borrar este conjunto de datos. Afectará a {length} capas'
    },
    addStyle: {
      publishTitle: '1. Publicar tu estilo en Mapbox o proporcionar el token de acceso',
      publishSubtitle1: 'Puedes crear el tu propio estilo de mapa en',
      publishSubtitle2: 'y',
      publishSubtitle3: 'publicar',
      publishSubtitle4: 'lo.',
      publishSubtitle5: 'Para utilizar un estilo privado, engancha tu',
      publishSubtitle6: 'token de acceso',
      publishSubtitle7: 'aquí. *kepler.gl es una aplicación cliente, los datos quedan en tu navegador..',
      exampleToken: 'p.e. pk.abcdefg.xxxxxx',
      pasteTitle: '2. Engancha el enlace del estilo',
      pasteSubtitle1: 'Qué es un',
      pasteSubtitle2: 'enlace del estilo',
      namingTitle: '3. Poner nombre a tu estilo'
    },
    shareMap: {
      shareUriTitle: 'Compartir el enlace del mapa',
      shareUriSubtitle: 'Generar un enlace del mapa para compartir con otros',
      cloudTitle: 'Almacenage en la nube',
      cloudSubtitle: 'Acceder y cargar datos del mapa a tu almacenage a la nube personal',
      shareDisclaimer: 'kepler.gl guardará los datos del mapa en el almacenage de tu nube personal, sólo quien tenga el enlace podra acceder al mapa y a los datos . ' + 'Puedes editar/borrar el archivo de datos en tu cuenta en la nube en cualquier momento.',
      gotoPage: 'Ves a la página de {currentProvider} de Kepler.gl'
    },
    statusPanel: {
      mapUploading: 'Cargar un mapa',
      error: 'Error'
    },
    saveMap: {
      title: 'Almacentage en la nube',
      subtitle: 'Acceder para guardar el mapa en teu almacenage en la nube'
    },
    exportMap: {
      formatTitle: 'Formato de mapa',
      formatSubtitle: 'Escoger el formato al que se desea exportar el mapa',
      html: {
        selection: 'Exportar tu mapa como un archivo HTML interactivo.',
        tokenTitle: 'Token de acceso de Mapbox',
        tokenSubtitle: 'Utilizar tu token de acceso a Mapbox al archivo HTML (opcional)',
        tokenPlaceholder: 'Enganchar tu token de acceso a Mapbox',
        tokenMisuseWarning: '* Si no proporcionas tu propio token, el mapa podría fallar en cualquier momento cuando reemplacemos nuestro token para evitar abusos. ',
        tokenDisclaimer: 'Puedes cambiar el token de Mapbox posteriormente utilizando estas instrucciones: ',
        tokenUpdate: 'Como actualitzar un token preexistente.',
        modeTitle: 'Modo mapa',
        modeSubtitle1: 'Seleccionar modo app. Más ',
        modeSubtitle2: 'información',
        modeDescription: 'Permmite a los usuarios {modo} el mapa',
        read: 'leer',
        edit: 'editar'
      },
      json: {
        configTitle: 'Configuración del mapa',
        configDisclaimer: 'La configuración del mapa será incluida en el archivo Json. Si utilitzas kepler.gl en tu propia app puedes copiar esta configuración y pasarla a  ',
        selection: 'Exportar los datos del mapa y la configuración en un solo archivo Json. Posteriormente puedes abrir este mismo mapa cargando este mismo archivo a kepler.gl.',
        disclaimer: '* La configuración del mapa se combina con los conjuntos de datos cargados. ‘dataId’ se utiliza para vincular capas, filtros y sugerencias a un conjunto de datos específico. ' + 'Cuando pases esta configuración a addDataToMap, asegura que el identificador del conjunto de datos coincida con los ‘dataId’ de esta configuración.'
      }
    },
    loadingDialog: {
      loading: 'Cargando...'
    },
    loadData: {
      upload: 'Cargar archivos',
      storage: 'Cargar desde almacenage'
    },
    tripInfo: {
      title: 'Como habilitar la animación de viaje',
      description1: 'Para animar la ruta, los datos geoJSON han de contener `LineString` en su geometría y las coordenadas de LineString deben tener 4 elementos en los formats de ',
      code: ' [longitude, latitude, altitude, timestamp] ',
      description2: 'y el último elemento debe ser la marca del tiempo. Los formatos válidos para la marca de tiempo incluyen Unix en segundos como `1564184363` o en milisegundos como `1564184363000`.',
      example: 'Ejemplo:'
    },
    iconInfo: {
      title: 'Como dibujar íconos',
      description1: 'En tu CSV crea una columna y pon el nombre del ícono que quieres dibujar. Puedes dejar la celda vacía cuando no quieras que se muestre para ciertos puntos. Cuando la columna se llama',
      code: 'ícono',
      description2: ' kepler.gl automáticamente creará una capa de ícono.',
      example: 'Ejemplo:',
      icons: 'Iconos'
    },
    storageMapViewer: {
      lastModified: 'Última modificación hace {lastUpdated}',
      back: 'Atrás'
    },
    overwriteMap: {
      title: 'Guardando el mapa...',
      alreadyExists: 'ja existe en {mapSaved}. Lo quieres sobreescrivir?'
    },
    loadStorageMap: {
      back: 'Atrás',
      goToPage: 'Ves a la página {displayName} de Kepler.gl',
      storageMaps: 'Almancenage / Mapas',
      noSavedMaps: 'No hay ningún mapa guardado todavía'
    }
  },
  header: {
    visibleLayers: 'Capas visibles',
    layerLegend: 'Capa de leyenda'
  },
  interactions: {
    tooltip: 'Sugerencias',
    brush: 'Pincel',
    coordinate: 'Coordenadas',
    geocoder: 'Geocodificador'
  },
  layerBlending: {
    title: 'Combinación de capas',
    additive: 'aditiva',
    normal: 'normal',
    subtractive: 'substractiva'
  },
  columns: {
    title: 'Columnas',
    lat: 'lat',
    lng: 'lon',
    altitude: 'altura',
    icon: 'ícono',
    geojson: 'geojson',
    arc: {
      lat0: 'lat origen',
      lng0: 'lng origen ',
      lat1: 'lat destino',
      lng1: 'lng destino'
    },
    line: {
      alt0: 'altura origen',
      alt1: 'altura destino'
    },
    grid: {
      worldUnitSize: 'Tamaño de la malla (km)'
    },
    hexagon: {
      worldUnitSize: 'Radio de hexágono (km)'
    },
    hex_id: 'id hex'
  },
  color: {
    customPalette: 'Paleta personalizada',
    steps: 'pasos',
    type: 'tipo',
    reversed: 'invertida'
  },
  scale: {
    colorScale: 'Escala de color',
    sizeScale: 'Escala de medidas',
    strokeScale: 'Escala de trazo',
    scale: 'Escala'
  },
  fileUploader: {
    message: 'Arrastra y suelta el archivo aquí',
    chromeMessage: '*usuario de Chrome: la medida máxima son 250mb, si debes cargar un archivo más grande utiliza Safari',
    disclaimer: '*kepler.gl es una aplicación al lado cliente que no utiliza ningún servidor. Los datos sólo existen en tu máquina/navegador. ' + 'No se envian datos ni mapas a ningún servidor.',
    configUploadMessage: 'Cargar {fileFormatNames} o un mapa guardado en **Json**. Más información sobre [**supported file formats**]',
    browseFiles: 'navega por tus archivos',
    uploading: 'Cargando',
    fileNotSupported: 'El archivo {errorFiles} no es compatible.',
    or: 'o'
  },
  geocoder: {
    title: 'Introduce una dirección'
  },
  fieldSelector: {
    clearAll: 'Quitar todos',
    formatting: 'Formato'
  },
  compare: {
    modeLabel: 'Modo Comparación',
    typeLabel: 'Tipo de Comparación',
    types: {
      absolute: 'Absoluta',
      relative: 'Relativa'
    }
  },
  mapPopover: {
    primary: 'Principal'
  },
  density: 'densidad',
  'Bug Report': 'Informe de errores',
  'User Guide': 'Guía de usuario',
  Save: 'Guadar',
  Share: 'Compartir'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsImNvdmVyYWdlIiwic3Ryb2tlQ29sb3IiLCJyYWRpdXMiLCJvdXRsaW5lIiwic3Ryb2tlIiwiZGVuc2l0eSIsImhlaWdodCIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJiYWNrZ3JvdW5kIiwicGFuZWwiLCJ0ZXh0IiwibGFiZWxXaXRoSWQiLCJmb250U2l6ZSIsImZvbnRDb2xvciIsInRleHRBbmNob3IiLCJhbGlnbm1lbnQiLCJhZGRNb3JlTGFiZWwiLCJzaWRlYmFyIiwicGFuZWxzIiwibGF5ZXIiLCJpbnRlcmFjdGlvbiIsImJhc2VtYXAiLCJyZXF1aXJlZCIsInByb3BlcnR5QmFzZWRPbiIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsImFuZ2xlIiwic3Ryb2tlV2lkdGhSYW5nZSIsImZpeGVkUmFkaXVzIiwiZml4ZWRSYWRpdXNEZXNjcmlwdGlvbiIsInJhZGl1c1JhbmdlIiwiY2x1c3RlclJhZGl1cyIsInJhZGl1c1JhbmdlUGl4ZWxzIiwiYmlsbGJvYXJkIiwiYmlsbGJvYXJkRGVzY3JpcHRpb24iLCJmYWRlVHJhaWwiLCJvcGFjaXR5IiwiY29sb3JSYW5nZSIsInN0cm9rZUNvbG9yUmFuZ2UiLCJ0YXJnZXRDb2xvciIsImNvbG9yQWdncmVnYXRpb24iLCJoZWlnaHRBZ2dyZWdhdGlvbiIsInJlc29sdXRpb25SYW5nZSIsInNpemVTY2FsZSIsIndvcmxkVW5pdFNpemUiLCJlbGV2YXRpb25TY2FsZSIsImVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3IiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yRGVzY3JpcHRpb24iLCJlbmFibGVIZWlnaHRab29tRmFjdG9yIiwiaGVpZ2h0U2NhbGUiLCJjb3ZlcmFnZVJhbmdlIiwiaGlnaFByZWNpc2lvblJlbmRlcmluZyIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbiIsImhlaWdodERlc2NyaXB0aW9uIiwiZmlsbCIsImVuYWJsZVBvbHlnb25IZWlnaHQiLCJzaG93V2lyZWZyYW1lIiwid2VpZ2h0SW50ZW5zaXR5Iiwiem9vbVNjYWxlIiwiaGVpZ2h0UmFuZ2UiLCJoZWlnaHRNdWx0aXBsaWVyIiwiZml4ZWRIZWlnaHQiLCJmaXhlZEhlaWdodERlc2NyaXB0aW9uIiwibGF5ZXJNYW5hZ2VyIiwiYWRkRGF0YSIsImFkZExheWVyIiwibGF5ZXJCbGVuZGluZyIsIm1hcE1hbmFnZXIiLCJtYXBTdHlsZSIsImFkZE1hcFN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwibGF5ZXJDb25maWd1cmF0aW9uIiwiZGVmYXVsdERlc2NyaXB0aW9uIiwiaG93VG8iLCJmaWx0ZXJNYW5hZ2VyIiwiYWRkRmlsdGVyIiwiZGF0YXNldFRpdGxlIiwic2hvd0RhdGFUYWJsZSIsInJlbW92ZURhdGFzZXQiLCJkYXRhc2V0SW5mbyIsInJvd0NvdW50IiwidG9vbHRpcCIsImhpZGVMYXllciIsInNob3dMYXllciIsImhpZGVGZWF0dXJlIiwic2hvd0ZlYXR1cmUiLCJoaWRlIiwic2hvdyIsInJlbW92ZUxheWVyIiwicmVzZXRBZnRlckVycm9yIiwibGF5ZXJTZXR0aW5ncyIsImNsb3NlUGFuZWwiLCJzd2l0Y2hUb0R1YWxWaWV3Iiwic2hvd0xlZ2VuZCIsImRpc2FibGUzRE1hcCIsIkRyYXdPbk1hcCIsInNlbGVjdExvY2FsZSIsInNob3dBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUFpQXNzaXN0YW50UGFuZWwiLCJoaWRlTGF5ZXJQYW5lbCIsInNob3dMYXllclBhbmVsIiwibW92ZVRvVG9wIiwic2VsZWN0QmFzZU1hcFN0eWxlIiwidGltZVBsYXliYWNrIiwiY2xvdWRTdG9yYWdlIiwiYW5pbWF0aW9uQnlXaW5kb3ciLCJhbmltYXRpb25CeUluY3JlbWVudGFsIiwic3BlZWQiLCJwbGF5IiwicGF1c2UiLCJyZXNldCIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImdlb2NvZGVyIiwiYWRkaXRpdmUiLCJub3JtYWwiLCJzdWJ0cmFjdGl2ZSIsImNvbHVtbnMiLCJsYXQiLCJsbmciLCJhbHRpdHVkZSIsImxhdDAiLCJsbmcwIiwibGF0MSIsImxuZzEiLCJhbHQwIiwiYWx0MSIsImhleF9pZCIsImN1c3RvbVBhbGV0dGUiLCJzdGVwcyIsInJldmVyc2VkIiwic2NhbGUiLCJjb2xvclNjYWxlIiwic3Ryb2tlU2NhbGUiLCJmaWxlVXBsb2FkZXIiLCJtZXNzYWdlIiwiY2hyb21lTWVzc2FnZSIsImNvbmZpZ1VwbG9hZE1lc3NhZ2UiLCJicm93c2VGaWxlcyIsInVwbG9hZGluZyIsImZpbGVOb3RTdXBwb3J0ZWQiLCJvciIsImZpZWxkU2VsZWN0b3IiLCJjbGVhckFsbCIsImZvcm1hdHRpbmciLCJjb21wYXJlIiwibW9kZUxhYmVsIiwidHlwZUxhYmVsIiwidHlwZXMiLCJhYnNvbHV0ZSIsInJlbGF0aXZlIiwibWFwUG9wb3ZlciIsInByaW1hcnkiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbG9jYWxpemF0aW9uL3NyYy90cmFuc2xhdGlvbnMvZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuLy8gQ29weXJpZ2h0IGNvbnRyaWJ1dG9ycyB0byB0aGUga2VwbGVyLmdsIHByb2plY3RcblxuaW1wb3J0IHtMT0NBTEVTfSBmcm9tICcuLi9sb2NhbGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wZXJ0eToge1xuICAgIHdlaWdodDogJ3Blc28nLFxuICAgIGxhYmVsOiAnZXRpcXVldGEnLFxuICAgIGZpbGxDb2xvcjogJ2NvbG9yIGRlIHJlbGxlbm8nLFxuICAgIGNvbG9yOiAnY29sb3InLFxuICAgIGNvdmVyYWdlOiAnY29iZXJ0dXJhJyxcbiAgICBzdHJva2VDb2xvcjogJ2NvbG9yIGRlIHRyYXpvJyxcbiAgICByYWRpdXM6ICdyYWRpbycsXG4gICAgb3V0bGluZTogJ2NvbnRvcm5vJyxcbiAgICBzdHJva2U6ICd0cmF6bycsXG4gICAgZGVuc2l0eTogJ2RlbnNpZGFkJyxcbiAgICBoZWlnaHQ6ICdhbHR1cmEnLFxuICAgIHN1bTogJ3N1bWEnLFxuICAgIHBvaW50Q291bnQ6ICdSZWN1ZW50byBkZSBwdW50b3MnXG4gIH0sXG4gIHBsYWNlaG9sZGVyOiB7XG4gICAgc2VhcmNoOiAnQnVzcXVlZGEnLFxuICAgIHNlbGVjdEZpZWxkOiAnU2VsZWNjaW9uYSB1biBjYW1wbycsXG4gICAgeUF4aXM6ICdFamUgWScsXG4gICAgc2VsZWN0VHlwZTogJ1NlbGVjY2lvbmEgdW4gVGlwbycsXG4gICAgc2VsZWN0VmFsdWU6ICdTZWxlY2Npb25hIHVuIFZhbG9yJyxcbiAgICBlbnRlclZhbHVlOiAnRW50cmEgdW4gdmFsb3InLFxuICAgIGVtcHR5OiAndmFjaW8nXG4gIH0sXG4gIG1pc2M6IHtcbiAgICBieTogJycsXG4gICAgdmFsdWVzSW46ICdWYWxvcmVzIGVuJyxcbiAgICB2YWx1ZUVxdWFsczogJ1ZhbG9yIGlndWFsIGEnLFxuICAgIGRhdGFTb3VyY2U6ICdGdWVudGUgZGUgZGF0b3MnLFxuICAgIGJydXNoUmFkaXVzOiAnUmFkaW8gZGVsIHBpbmNlbCAoa20pJyxcbiAgICBlbXB0eTogJyAnXG4gIH0sXG4gIG1hcExheWVyczoge1xuICAgIHRpdGxlOiAnQ2FwYXMgZGVsIG1hcGEnLFxuICAgIGxhYmVsOiAnRXRpcXVldGEnLFxuICAgIHJvYWQ6ICdDYXJyZXRlcmEnLFxuICAgIGJvcmRlcjogJ0Zyb250ZXJhJyxcbiAgICBidWlsZGluZzogJ0VkaWZpY2lvJyxcbiAgICB3YXRlcjogJ0FndWEnLFxuICAgIGxhbmQ6ICdUaWVycmEnLFxuICAgICczZEJ1aWxkaW5nJzogJ0VkaWZpY2lvIDNEJyxcbiAgICBiYWNrZ3JvdW5kOiAnRm9uZG8nXG4gIH0sXG4gIHBhbmVsOiB7XG4gICAgdGV4dDoge1xuICAgICAgbGFiZWw6ICdldGlxdWV0YScsXG4gICAgICBsYWJlbFdpdGhJZDogJ0V0aXF1ZXRhIHtsYWJlbElkfScsXG4gICAgICBmb250U2l6ZTogJ1RhbWHDsW8gZGUgZnVlbnRlJyxcbiAgICAgIGZvbnRDb2xvcjogJ0NvbG9yIGRlIGZ1ZW50ZScsXG4gICAgICB0ZXh0QW5jaG9yOiAnQW5jbGFqZSBkZWwgdGV4dG8nLFxuICAgICAgYWxpZ25tZW50OiAnQWxpbmVhY2nDs24nLFxuICAgICAgYWRkTW9yZUxhYmVsOiAnQcOxYWRpciBtw6FzIGV0aXF1ZXRhcydcbiAgICB9XG4gIH0sXG4gIHNpZGViYXI6IHtcbiAgICBwYW5lbHM6IHtcbiAgICAgIGxheWVyOiAnQ2FwYXMnLFxuICAgICAgZmlsdGVyOiAnRmlsdHJvcycsXG4gICAgICBpbnRlcmFjdGlvbjogJ0ludGVyYWNjaW9uZXMnLFxuICAgICAgYmFzZW1hcDogJ01hcGEgYmFzZSdcbiAgICB9XG4gIH0sXG4gIGxheWVyOiB7XG4gICAgcmVxdWlyZWQ6ICdSZXF1ZXJpZG8qJyxcbiAgICByYWRpdXM6ICdSYWRpbycsXG4gICAgY29sb3I6ICdDb2xvcicsXG4gICAgZmlsbENvbG9yOiAnQ29sb3IgZGUgcmVsbGVubycsXG4gICAgb3V0bGluZTogJ0NvbnRvcm5vJyxcbiAgICB3ZWlnaHQ6ICdHcnVlc28nLFxuICAgIHByb3BlcnR5QmFzZWRPbjogJ3twcm9wZXJ0eX0gYmFzYWRvIGVuJyxcbiAgICBjb3ZlcmFnZTogJ0NvYmVydHVyYScsXG4gICAgc3Ryb2tlOiAnVHJhem8nLFxuICAgIHN0cm9rZVdpZHRoOiAnR3Jvc29yIGRlIHRyYXpvJyxcbiAgICBzdHJva2VDb2xvcjogJ0NvbG9yIGRlIHRyYXpvJyxcbiAgICBiYXNpYzogJ0LDoXNpY28nLFxuICAgIHRyYWlsTGVuZ3RoOiAnTG9uZ2l0dWQgZGUgcGlzdGEnLFxuICAgIHRyYWlsTGVuZ3RoRGVzY3JpcHRpb246ICdOdW1lcm8gZGUgc2VndW5kb3MgaGFzdGEgcXVlIGRlc2FwYXJlemNhIGVsIGNhbWlubycsXG4gICAgbmV3TGF5ZXI6ICdudWV2YSBjYXBhJyxcbiAgICBlbGV2YXRpb25CeURlc2NyaXB0aW9uOiAnU2kgZGVzYWN0aXZhZG8sIGxhIGFsdHVyYSBzZSBiYXNhIGVuIGVsIHJlY3VlbnRvIGRlIHB1bnRvcycsXG4gICAgY29sb3JCeURlc2NyaXB0aW9uOiAnU2kgZGVzYWN0aXZhZG8sIGVsIGNvbG9yIHNlIGJhc2EgZW4gZWwgcmVjdWVudG8gZGUgcHVudG9zJyxcbiAgICBhZ2dyZWdhdGVCeTogJ3tmaWVsZH0gYWdyZWdhZG8gcG9yJyxcbiAgICAnM0RNb2RlbCc6ICdNb2RlbG8gM0QnLFxuICAgICczRE1vZGVsT3B0aW9ucyc6ICdPcGNpb25lcyBkZWwgbW9kZWxvIDNEJyxcbiAgICB0eXBlOiB7XG4gICAgICBwb2ludDogJ3B1bnRvJyxcbiAgICAgIGFyYzogJ2FyY28nLFxuICAgICAgbGluZTogJ2zDrW5lYScsXG4gICAgICBncmlkOiAnbWFsbGEnLFxuICAgICAgaGV4YmluOiAnaGV4YmluJyxcbiAgICAgIHBvbHlnb246ICdwb2zDrWdvbm8nLFxuICAgICAgZ2VvanNvbjogJ2dlb2pzb24nLFxuICAgICAgY2x1c3RlcjogJ2NsdXN0ZXInLFxuICAgICAgaWNvbjogJ2ljb25vJyxcbiAgICAgIGhlYXRtYXA6ICdjb25jZW50cmFjacOzbicsXG4gICAgICBoZXhhZ29uOiAnaGV4w6Fnb25vJyxcbiAgICAgIGhleGFnb25pZDogJ0gzJyxcbiAgICAgIHRyaXA6ICd2aWFqZScsXG4gICAgICBzMjogJ1MyJyxcbiAgICAgICczZCc6ICczRCdcbiAgICB9LFxuICAgIGxheWVyVXBkYXRlRXJyb3I6XG4gICAgICAnU2UgcHJvZHVqbyB1biBlcnJvciBkdXJhbnRlIGxhIGFjdHVhbGl6YWNpw7NuIGRlIGxhIGNhcGE6IHtlcnJvck1lc3NhZ2V9LiBBc2Vnw7pyZXNlIGRlIHF1ZSBlbCBmb3JtYXRvIGRlIGxvcyBkYXRvcyBkZSBlbnRyYWRhIHNlYSB2w6FsaWRvLidcbiAgfSxcbiAgbGF5ZXJWaXNDb25maWdzOiB7XG4gICAgYW5nbGU6ICfDgW5ndWxvJyxcbiAgICBzdHJva2VXaWR0aDogJ0FuY2hvIGRlbCB0cmF6bycsXG4gICAgc3Ryb2tlV2lkdGhSYW5nZTogJ1JhbmdvIGRlbCBhbmNobyBkZWwgdHJhem8nLFxuICAgIHJhZGl1czogJ1JhZGlvJyxcbiAgICBmaXhlZFJhZGl1czogJ1JhZGlvIGZpam8gYSBtZWRpcicsXG4gICAgZml4ZWRSYWRpdXNEZXNjcmlwdGlvbjogJ0FqdXN0YXIgZWwgcmFkaW8gYWwgcmFkaW8gYWJzb2x1dG8gZW4gbWV0cm9zLCBwLmUuIDUgYSA1IG1ldHJvcycsXG4gICAgcmFkaXVzUmFuZ2U6ICdSYW5nbyBkZSByYWRpbycsXG4gICAgY2x1c3RlclJhZGl1czogJ1JhZGlvIGRlbCBjbHVzdGVyIGVuIHDDrXhlbGVzJyxcbiAgICByYWRpdXNSYW5nZVBpeGVsczogJ1JhbmdvIGRlbCByYWRpbyBlbiBww614ZWxlcycsXG4gICAgYmlsbGJvYXJkOiAnTW9kbyBjYXJ0ZWxlcmEnLFxuICAgIGJpbGxib2FyZERlc2NyaXB0aW9uOiAnT3JpZW50ZSBsYSBnZW9tZXRyw61hIGhhY2lhIGxhIGPDoW1hcmEnLFxuICAgIGZhZGVUcmFpbDogJ1NlbmRlcm8gZGUgZGVzdmFuZWNpbWllbnRvJyxcbiAgICBvcGFjaXR5OiAnT3BhY2lkYWQnLFxuICAgIGNvdmVyYWdlOiAnQ29iZXJ0dXJhJyxcbiAgICBvdXRsaW5lOiAnQ29udG9ybm8nLFxuICAgIGNvbG9yUmFuZ2U6ICdSYW5nbyBkZSBjb2xvcicsXG4gICAgc3Ryb2tlOiAnVHJhem8nLFxuICAgIHN0cm9rZUNvbG9yOiAnQ29sb3IgZGUgdHJhem8nLFxuICAgIHN0cm9rZUNvbG9yUmFuZ2U6ICdSYW5nbyBkZSBjb2xvciBkZSB0cmF6bycsXG4gICAgdGFyZ2V0Q29sb3I6ICdDb2xvciBkZXN0aW5vJyxcbiAgICBjb2xvckFnZ3JlZ2F0aW9uOiAnQWdyZWdhY2nDs24gZGUgY29sb3InLFxuICAgIGhlaWdodEFnZ3JlZ2F0aW9uOiAnQWdyZWdhY2nDs24gZGUgbGEgYWx0dXJhJyxcbiAgICByZXNvbHV0aW9uUmFuZ2U6ICdSYW5nbyBkZSByZXNvbHVjacOzbicsXG4gICAgc2l6ZVNjYWxlOiAnTWVkaWRhIGRlIGVzY2FsYScsXG4gICAgd29ybGRVbml0U2l6ZTogJ01lZGlkYSBkZSBsYSB1bmlkYWQgbXVuZGlhbCcsXG4gICAgZWxldmF0aW9uU2NhbGU6ICdFc2NhbGEgZGUgZWxldmFjacOzbicsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvcjogJ1VzYXIgZmFjdG9yIGRlIHpvb20gZGUgZWxldmFjacOzbicsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvckRlc2NyaXB0aW9uOlxuICAgICAgJ0FqdXN0ZSBsYSBhbHR1cmEgLyBlbGV2YWNpw7NuIHNlZ8O6biBlbCBmYWN0b3IgZGUgem9vbSBhY3R1YWwnLFxuICAgIGVuYWJsZUhlaWdodFpvb21GYWN0b3I6ICdVc2FyIGZhY3RvciBkZSB6b29tIGRlIGFsdHVyYScsXG4gICAgaGVpZ2h0U2NhbGU6ICdFc2NhbGEgZGUgYWx0dXJhJyxcbiAgICBjb3ZlcmFnZVJhbmdlOiAnUmFuZ28gZGUgY29iZXJ0dXJhJyxcbiAgICBoaWdoUHJlY2lzaW9uUmVuZGVyaW5nOiAnUmVwcmVzZW50YWNpw7NuIGRlIGFsdGEgcHJlY2lzacOzbicsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZ0Rlc2NyaXB0aW9uOiAnTGEgcHJlY2lzacOzbiBhbHRhIHRlbmRyw6EgdW4gcmVuZGltaWVudG8gbcOhcyBiYWpvJyxcbiAgICBoZWlnaHQ6ICdBbHR1cmEnLFxuICAgIGhlaWdodERlc2NyaXB0aW9uOlxuICAgICAgJ0hheiBjbGljIGVuIGVsIGJvdMOzbiBkZSBhcnJpYmEgYSBsYSBkZXJlY2hhIGRlbCBtYXBhIHBlciBjYW1iaWFyIGEgdmlzdGEgM0QnLFxuICAgIGZpbGw6ICdSZWxsZW5hcicsXG4gICAgZW5hYmxlUG9seWdvbkhlaWdodDogJ0FjdGl2YXIgbGEgYWx0dXJhIGRlbCBwb2zDrWdvbm8nLFxuICAgIHNob3dXaXJlZnJhbWU6ICdNdWVzdHJhIGVzcXVlbcOgdGljbycsXG4gICAgd2VpZ2h0SW50ZW5zaXR5OiAnSW50ZW5zaWRhZCBkZSBwZXNvJyxcbiAgICB6b29tU2NhbGU6ICdFc2NhbGEgZGUgem9vbScsXG4gICAgaGVpZ2h0UmFuZ2U6ICdSYW5nbyBkZSBhbHR1cmFzJyxcbiAgICBoZWlnaHRNdWx0aXBsaWVyOiAnTXVsdGlwbGljYWRvciBkZSBhbHR1cmEnLFxuICAgIGZpeGVkSGVpZ2h0OiAnQWx0dXJhIGZpamEnLFxuICAgIGZpeGVkSGVpZ2h0RGVzY3JpcHRpb246ICdVc2FyIGFsdHVyYSBzaW4gbW9kaWZpY2FjaW9uZXMnXG4gIH0sXG4gIGxheWVyTWFuYWdlcjoge1xuICAgIGFkZERhdGE6ICdBw7FhZGlyIGRhdG9zJyxcbiAgICBhZGRMYXllcjogJ0HDsWFkaXIgY2FwYScsXG4gICAgbGF5ZXJCbGVuZGluZzogJ0NvbWJpbmFyIGNhcGFzJ1xuICB9LFxuICBtYXBNYW5hZ2VyOiB7XG4gICAgbWFwU3R5bGU6ICdFc3RpbG8gZGUgbWFwYScsXG4gICAgYWRkTWFwU3R5bGU6ICdBw7FhZGlyIGVzdGlsbyBkZSBtYXBhJyxcbiAgICAnM2RCdWlsZGluZ0NvbG9yJzogJ0NvbG9yIGVkaWZpY2lvcyAzRCcsXG4gICAgYmFja2dyb3VuZENvbG9yOiAnQ29sb3IgZGUgZm9uZG8nXG4gIH0sXG4gIGxheWVyQ29uZmlndXJhdGlvbjoge1xuICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJ0NhbGN1bGFyIHtwcm9wZXJ0eX0gc2Vnw7puIGVsIGNhbXBvIHNlbGVjY2lvbmFkbycsXG4gICAgaG93VG86ICdIb3cgdG8nXG4gIH0sXG4gIGZpbHRlck1hbmFnZXI6IHtcbiAgICBhZGRGaWx0ZXI6ICdBw7FhZGlyIGZpbHRybydcbiAgfSxcbiAgZGF0YXNldFRpdGxlOiB7XG4gICAgc2hvd0RhdGFUYWJsZTogJ01vc3RhciBsYSB0YWJsYSBkZSBkYXRvcycsXG4gICAgcmVtb3ZlRGF0YXNldDogJ0VsaW1pbmFyIGNvbmp1bnRvIGRlIGRhdG9zJ1xuICB9LFxuICBkYXRhc2V0SW5mbzoge1xuICAgIHJvd0NvdW50OiAne3Jvd0NvdW50fSBmaWxlcydcbiAgfSxcbiAgdG9vbHRpcDoge1xuICAgIGhpZGVMYXllcjogJ09jdWx0YXIgbGEgY2FwYScsXG4gICAgc2hvd0xheWVyOiAnTW9zdHJhciBsYSBjYXBhJyxcbiAgICBoaWRlRmVhdHVyZTogJ09jdWx0YXIgZWwgb2JqZXRvJyxcbiAgICBzaG93RmVhdHVyZTogJ01vc3RyYXIgZWwgb2JqZXRvJyxcbiAgICBoaWRlOiAnT2N1bHRhcicsXG4gICAgc2hvdzogJ01vc3RyYXInLFxuICAgIHJlbW92ZUxheWVyOiAnRWxpbWluYXIgY2FwYScsXG4gICAgcmVzZXRBZnRlckVycm9yOiAnSW50ZW50ZSBoYWJpbGl0YXIgbGEgY2FwYSBkZXNwdcOpcyBkZSB1biBlcnJvcicsXG4gICAgbGF5ZXJTZXR0aW5nczogJ0NvbmZpZ3VyYWNpw7NuIGRlIGNhcGEnLFxuICAgIGNsb3NlUGFuZWw6ICdDZXJyYXIgZWwgcGFuZWwgYWN0dWFsJyxcbiAgICBzd2l0Y2hUb0R1YWxWaWV3OiAnQ2FtYmlhciBhIGxhIHZpc3RhIGRlIG1hcGEgZHVhbCcsXG4gICAgc2hvd0xlZ2VuZDogJ01vc3RyYXIgbGV5ZW5kYScsXG4gICAgZGlzYWJsZTNETWFwOiAnRGVzYWN0aXZhciBtYXBhIDNEJyxcbiAgICBEcmF3T25NYXA6ICdEaWJ1amFyIGVuIGVsIG1hcGEnLFxuICAgIHNlbGVjdExvY2FsZTogJ1NlbGVjY2lvbmFyIGNvbmZpZ3VyYWNpw7NuIHJlZ2lvbmFsJyxcbiAgICBzaG93QWlBc3Npc3RhbnRQYW5lbDogJ01vc3RyYXIgZWwgcGFuZWwgZGUgQUkgQXNzaXN0YW50JyxcbiAgICBoaWRlQWlBc3Npc3RhbnRQYW5lbDogJ09jdWx0YXIgZWwgcGFuZWwgZGUgQUkgQXNzaXN0YW50JyxcbiAgICBoaWRlTGF5ZXJQYW5lbDogJ09jdWx0YXIgbGEgdGFibGEgZGUgY2FwYXMnLFxuICAgIHNob3dMYXllclBhbmVsOiAnTW9zdHJhciBsYSB0YWJsYSAgZGUgY2FwYXMnLFxuICAgIG1vdmVUb1RvcDogJ0Rlc3BsYXphciBhcnJpYmEgZGUgbGFzIGNhcGFzIGRlIGRhdG9zJyxcbiAgICBzZWxlY3RCYXNlTWFwU3R5bGU6ICdTZWxlY2Npb25hciBlc3RpbG8gZGUgbWFwYSBiYXNlJyxcbiAgICBkZWxldGU6ICdCb3JyYXInLFxuICAgIHRpbWVQbGF5YmFjazogJ1JlcHJvZHVjY2nDs24gZGUgdGllbXBvJyxcbiAgICBjbG91ZFN0b3JhZ2U6ICdBbG1hY2VuYWplIGVuIGxhIG51YmUnLFxuICAgICczRE1hcCc6ICdNYXBhIDNEJyxcbiAgICBhbmltYXRpb25CeVdpbmRvdzogJ1ZlbnRhbmEgVGVtcG9yYWwgTcOzdmlsJyxcbiAgICBhbmltYXRpb25CeUluY3JlbWVudGFsOiAnVmVudGFuYSBUZW1wb3JhbCBJbmNyZW1lbnRhbCcsXG4gICAgc3BlZWQ6ICd2ZWxvY2lkYWQnLFxuICAgIHBsYXk6ICdpbmljaWFyJyxcbiAgICBwYXVzZTogJ3BhdXNhcicsXG4gICAgcmVzZXQ6ICdyZWluaWNpYXInXG4gIH0sXG4gIHRvb2xiYXI6IHtcbiAgICBleHBvcnRJbWFnZTogJ0V4cG9ydGFyIGltYWdlbicsXG4gICAgZXhwb3J0RGF0YTogJ0V4cG9ydGFyIGRhdG9zJyxcbiAgICBleHBvcnRNYXA6ICdFeHBvcnRhciBtYXBhJyxcbiAgICBzaGFyZU1hcFVSTDogJ0NvbXBhcnRpciBlbCBlbmxhY2UgZGVsIG1hcGEnLFxuICAgIHNhdmVNYXA6ICdHdWFyZGFyIG1hcGEnLFxuICAgIHNlbGVjdDogJ3NlbGVjY2lvbmEnLFxuICAgIHBvbHlnb246ICdwb2zDrWdvbm8nLFxuICAgIHJlY3RhbmdsZTogJ3JlY3TDoW5ndWxvJyxcbiAgICBoaWRlOiAnZXNjb25kZXInLFxuICAgIHNob3c6ICdtb3N0cmFyJyxcbiAgICAuLi5MT0NBTEVTXG4gIH0sXG4gIG1vZGFsOiB7XG4gICAgdGl0bGU6IHtcbiAgICAgIGRlbGV0ZURhdGFzZXQ6ICdCb3JyYXIgY29uanVudG8gZGUgZGF0b3MnLFxuICAgICAgYWRkRGF0YVRvTWFwOiAnQcOxYWRpciBkYXRvcyBhbCBtYXBhJyxcbiAgICAgIGV4cG9ydEltYWdlOiAnRXhwb3J0YXIgaW1hZ2VuJyxcbiAgICAgIGV4cG9ydERhdGE6ICdFeHBvcnRhciBkYXRvcycsXG4gICAgICBleHBvcnRNYXA6ICdFeHBvcnRhciBtYXBhJyxcbiAgICAgIGFkZEN1c3RvbU1hcGJveFN0eWxlOiAnQcOxYWRpciBlc3RpbG8gZGUgTWFwYm94IHByb3BpbycsXG4gICAgICBzYXZlTWFwOiAnR3VhcmRhciBtYXBhJyxcbiAgICAgIHNoYXJlVVJMOiAnQ29tcGFydGlyIGVubGFjZSdcbiAgICB9LFxuICAgIGJ1dHRvbjoge1xuICAgICAgZGVsZXRlOiAnQm9ycmFyJyxcbiAgICAgIGRvd25sb2FkOiAnRGVzY2FyZ2FyJyxcbiAgICAgIGV4cG9ydDogJ0V4cG9ydGFyJyxcbiAgICAgIGFkZFN0eWxlOiAnQcOxYWRpciBlc3RpbG8nLFxuICAgICAgc2F2ZTogJ0d1YXJkYXInLFxuICAgICAgZGVmYXVsdENhbmNlbDogJ0NhbmNlbGFyJyxcbiAgICAgIGRlZmF1bHRDb25maXJtOiAnQ29uZmlybWFyJ1xuICAgIH0sXG4gICAgZXhwb3J0SW1hZ2U6IHtcbiAgICAgIHJhdGlvVGl0bGU6ICdSYXRpbycsXG4gICAgICByYXRpb0Rlc2NyaXB0aW9uOiAnRXNvZ2VyIHJhdGlvIHBvciBkaXZlcnNvcyB1c29zLicsXG4gICAgICByYXRpb09yaWdpbmFsU2NyZWVuOiAnUGFudGFsbGEgb3JpZ2luYWwnLFxuICAgICAgcmF0aW9DdXN0b206ICdQZXJzb25hbGl6YWRvJyxcbiAgICAgIHJhdGlvNF8zOiAnNDozJyxcbiAgICAgIHJhdGlvMTZfOTogJzE2OjknLFxuICAgICAgcmVzb2x1dGlvblRpdGxlOiAnUmVzb2x1Y2nDs24nLFxuICAgICAgcmVzb2x1dGlvbkRlc2NyaXB0aW9uOiAnVW5hIGFsdGEgcmVzb2x1Y2nDs24gZXMgbWVqb3IgcGFyYSBsYXMgaW1wcmVzaW9uZXMuJyxcbiAgICAgIG1hcExlZ2VuZFRpdGxlOiAnTGV5ZW5kYSBkZWwgbWFwYScsXG4gICAgICBtYXBMZWdlbmRBZGQ6ICdBw7FhZGlyIGxleWVuZGEgYWwgbWFwYSdcbiAgICB9LFxuICAgIGV4cG9ydERhdGE6IHtcbiAgICAgIGRhdGFzZXRUaXRsZTogJ0Nvbmp1bnRvIGRlIGRhdG9zJyxcbiAgICAgIGRhdGFzZXRTdWJ0aXRsZTogJ0VzY29nZXIgbG9zIGNvbmp1bnRvcyBkZSBkYXRvcyBhIGV4cG9ydGFyJyxcbiAgICAgIGFsbERhdGFzZXRzOiAnVG9kb3MnLFxuICAgICAgZGF0YVR5cGVUaXRsZTogJ1RpcG8gZGUgZGF0b3MnLFxuICAgICAgZGF0YVR5cGVTdWJ0aXRsZTogJ0VzY29nZXIgZWwgdGlwbyBkZSBkYXRvcyBhIGV4cG9ydGFyJyxcbiAgICAgIGZpbHRlckRhdGFUaXRsZTogJ0ZpbHRyYXIgZGF0b3MnLFxuICAgICAgZmlsdGVyRGF0YVN1YnRpdGxlOiAnU2UgcHVlZGUgZXNjb2dlciBleHBvcnRhciBsb3MgZGF0b3Mgb3JpZ2luYWxlcyBvIGZpbHRyYWRvcycsXG4gICAgICBmaWx0ZXJlZERhdGE6ICdEYXRvcyBmaWx0cmFkb3MnLFxuICAgICAgdW5maWx0ZXJlZERhdGE6ICdEYXRvcyBzaW4gZmlsdHJhcicsXG4gICAgICBmaWxlQ291bnQ6ICd7ZmlsZUNvdW50fSBBcmNoaXZvcycsXG4gICAgICByb3dDb3VudDogJ3tyb3dDb3VudH0gRmlsZXMnXG4gICAgfSxcbiAgICBkZWxldGVEYXRhOiB7XG4gICAgICB3YXJuaW5nOiAnZXN0w6FzIGEgcHVudG8gZGUgYm9ycmFyIGVzdGUgY29uanVudG8gZGUgZGF0b3MuIEFmZWN0YXLDoSBhIHtsZW5ndGh9IGNhcGFzJ1xuICAgIH0sXG4gICAgYWRkU3R5bGU6IHtcbiAgICAgIHB1Ymxpc2hUaXRsZTogJzEuIFB1YmxpY2FyIHR1IGVzdGlsbyBlbiBNYXBib3ggbyBwcm9wb3JjaW9uYXIgZWwgdG9rZW4gZGUgYWNjZXNvJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTE6ICdQdWVkZXMgY3JlYXIgZWwgdHUgcHJvcGlvIGVzdGlsbyBkZSBtYXBhIGVuJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTI6ICd5JyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTM6ICdwdWJsaWNhcicsXG4gICAgICBwdWJsaXNoU3VidGl0bGU0OiAnbG8uJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTU6ICdQYXJhIHV0aWxpemFyIHVuIGVzdGlsbyBwcml2YWRvLCBlbmdhbmNoYSB0dScsXG4gICAgICBwdWJsaXNoU3VidGl0bGU2OiAndG9rZW4gZGUgYWNjZXNvJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTc6XG4gICAgICAgICdhcXXDrS4gKmtlcGxlci5nbCBlcyB1bmEgYXBsaWNhY2nDs24gY2xpZW50ZSwgbG9zIGRhdG9zIHF1ZWRhbiBlbiB0dSBuYXZlZ2Fkb3IuLicsXG4gICAgICBleGFtcGxlVG9rZW46ICdwLmUuIHBrLmFiY2RlZmcueHh4eHh4JyxcbiAgICAgIHBhc3RlVGl0bGU6ICcyLiBFbmdhbmNoYSBlbCBlbmxhY2UgZGVsIGVzdGlsbycsXG4gICAgICBwYXN0ZVN1YnRpdGxlMTogJ1F1w6kgZXMgdW4nLFxuICAgICAgcGFzdGVTdWJ0aXRsZTI6ICdlbmxhY2UgZGVsIGVzdGlsbycsXG4gICAgICBuYW1pbmdUaXRsZTogJzMuIFBvbmVyIG5vbWJyZSBhIHR1IGVzdGlsbydcbiAgICB9LFxuICAgIHNoYXJlTWFwOiB7XG4gICAgICBzaGFyZVVyaVRpdGxlOiAnQ29tcGFydGlyIGVsIGVubGFjZSBkZWwgbWFwYScsXG4gICAgICBzaGFyZVVyaVN1YnRpdGxlOiAnR2VuZXJhciB1biBlbmxhY2UgZGVsIG1hcGEgcGFyYSBjb21wYXJ0aXIgY29uIG90cm9zJyxcbiAgICAgIGNsb3VkVGl0bGU6ICdBbG1hY2VuYWdlIGVuIGxhIG51YmUnLFxuICAgICAgY2xvdWRTdWJ0aXRsZTogJ0FjY2VkZXIgeSBjYXJnYXIgZGF0b3MgZGVsIG1hcGEgYSB0dSBhbG1hY2VuYWdlIGEgbGEgbnViZSBwZXJzb25hbCcsXG4gICAgICBzaGFyZURpc2NsYWltZXI6XG4gICAgICAgICdrZXBsZXIuZ2wgZ3VhcmRhcsOhIGxvcyBkYXRvcyBkZWwgbWFwYSBlbiBlbCBhbG1hY2VuYWdlIGRlIHR1IG51YmUgcGVyc29uYWwsIHPDs2xvIHF1aWVuIHRlbmdhIGVsIGVubGFjZSBwb2RyYSBhY2NlZGVyIGFsIG1hcGEgeSBhIGxvcyBkYXRvcyAuICcgK1xuICAgICAgICAnUHVlZGVzIGVkaXRhci9ib3JyYXIgZWwgYXJjaGl2byBkZSBkYXRvcyBlbiB0dSBjdWVudGEgZW4gbGEgbnViZSBlbiBjdWFscXVpZXIgbW9tZW50by4nLFxuICAgICAgZ290b1BhZ2U6ICdWZXMgYSBsYSBww6FnaW5hIGRlIHtjdXJyZW50UHJvdmlkZXJ9IGRlIEtlcGxlci5nbCdcbiAgICB9LFxuICAgIHN0YXR1c1BhbmVsOiB7XG4gICAgICBtYXBVcGxvYWRpbmc6ICdDYXJnYXIgdW4gbWFwYScsXG4gICAgICBlcnJvcjogJ0Vycm9yJ1xuICAgIH0sXG4gICAgc2F2ZU1hcDoge1xuICAgICAgdGl0bGU6ICdBbG1hY2VudGFnZSBlbiBsYSBudWJlJyxcbiAgICAgIHN1YnRpdGxlOiAnQWNjZWRlciBwYXJhIGd1YXJkYXIgZWwgbWFwYSBlbiB0ZXUgYWxtYWNlbmFnZSBlbiBsYSBudWJlJ1xuICAgIH0sXG4gICAgZXhwb3J0TWFwOiB7XG4gICAgICBmb3JtYXRUaXRsZTogJ0Zvcm1hdG8gZGUgbWFwYScsXG4gICAgICBmb3JtYXRTdWJ0aXRsZTogJ0VzY29nZXIgZWwgZm9ybWF0byBhbCBxdWUgc2UgZGVzZWEgZXhwb3J0YXIgZWwgbWFwYScsXG4gICAgICBodG1sOiB7XG4gICAgICAgIHNlbGVjdGlvbjogJ0V4cG9ydGFyIHR1IG1hcGEgY29tbyB1biBhcmNoaXZvIEhUTUwgaW50ZXJhY3Rpdm8uJyxcbiAgICAgICAgdG9rZW5UaXRsZTogJ1Rva2VuIGRlIGFjY2VzbyBkZSBNYXBib3gnLFxuICAgICAgICB0b2tlblN1YnRpdGxlOiAnVXRpbGl6YXIgdHUgdG9rZW4gZGUgYWNjZXNvIGEgTWFwYm94IGFsIGFyY2hpdm8gSFRNTCAob3BjaW9uYWwpJyxcbiAgICAgICAgdG9rZW5QbGFjZWhvbGRlcjogJ0VuZ2FuY2hhciB0dSB0b2tlbiBkZSBhY2Nlc28gYSBNYXBib3gnLFxuICAgICAgICB0b2tlbk1pc3VzZVdhcm5pbmc6XG4gICAgICAgICAgJyogU2kgbm8gcHJvcG9yY2lvbmFzIHR1IHByb3BpbyB0b2tlbiwgZWwgbWFwYSBwb2Ryw61hIGZhbGxhciBlbiBjdWFscXVpZXIgbW9tZW50byBjdWFuZG8gcmVlbXBsYWNlbW9zIG51ZXN0cm8gdG9rZW4gcGFyYSBldml0YXIgYWJ1c29zLiAnLFxuICAgICAgICB0b2tlbkRpc2NsYWltZXI6XG4gICAgICAgICAgJ1B1ZWRlcyBjYW1iaWFyIGVsIHRva2VuIGRlIE1hcGJveCBwb3N0ZXJpb3JtZW50ZSB1dGlsaXphbmRvIGVzdGFzIGluc3RydWNjaW9uZXM6ICcsXG4gICAgICAgIHRva2VuVXBkYXRlOiAnQ29tbyBhY3R1YWxpdHphciB1biB0b2tlbiBwcmVleGlzdGVudGUuJyxcbiAgICAgICAgbW9kZVRpdGxlOiAnTW9kbyBtYXBhJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMTogJ1NlbGVjY2lvbmFyIG1vZG8gYXBwLiBNw6FzICcsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTI6ICdpbmZvcm1hY2nDs24nLFxuICAgICAgICBtb2RlRGVzY3JpcHRpb246ICdQZXJtbWl0ZSBhIGxvcyB1c3VhcmlvcyB7bW9kb30gZWwgbWFwYScsXG4gICAgICAgIHJlYWQ6ICdsZWVyJyxcbiAgICAgICAgZWRpdDogJ2VkaXRhcidcbiAgICAgIH0sXG4gICAgICBqc29uOiB7XG4gICAgICAgIGNvbmZpZ1RpdGxlOiAnQ29uZmlndXJhY2nDs24gZGVsIG1hcGEnLFxuICAgICAgICBjb25maWdEaXNjbGFpbWVyOlxuICAgICAgICAgICdMYSBjb25maWd1cmFjacOzbiBkZWwgbWFwYSBzZXLDoSBpbmNsdWlkYSBlbiBlbCBhcmNoaXZvIEpzb24uIFNpIHV0aWxpdHphcyBrZXBsZXIuZ2wgZW4gdHUgcHJvcGlhIGFwcCBwdWVkZXMgY29waWFyIGVzdGEgY29uZmlndXJhY2nDs24geSBwYXNhcmxhIGEgICcsXG4gICAgICAgIHNlbGVjdGlvbjpcbiAgICAgICAgICAnRXhwb3J0YXIgbG9zIGRhdG9zIGRlbCBtYXBhIHkgbGEgY29uZmlndXJhY2nDs24gZW4gdW4gc29sbyBhcmNoaXZvIEpzb24uIFBvc3Rlcmlvcm1lbnRlIHB1ZWRlcyBhYnJpciBlc3RlIG1pc21vIG1hcGEgY2FyZ2FuZG8gZXN0ZSBtaXNtbyBhcmNoaXZvIGEga2VwbGVyLmdsLicsXG4gICAgICAgIGRpc2NsYWltZXI6XG4gICAgICAgICAgJyogTGEgY29uZmlndXJhY2nDs24gZGVsIG1hcGEgc2UgY29tYmluYSBjb24gbG9zIGNvbmp1bnRvcyBkZSBkYXRvcyBjYXJnYWRvcy4g4oCYZGF0YUlk4oCZIHNlIHV0aWxpemEgcGFyYSB2aW5jdWxhciBjYXBhcywgZmlsdHJvcyB5IHN1Z2VyZW5jaWFzIGEgdW4gY29uanVudG8gZGUgZGF0b3MgZXNwZWPDrWZpY28uICcgK1xuICAgICAgICAgICdDdWFuZG8gcGFzZXMgZXN0YSBjb25maWd1cmFjacOzbiBhIGFkZERhdGFUb01hcCwgYXNlZ3VyYSBxdWUgZWwgaWRlbnRpZmljYWRvciBkZWwgY29uanVudG8gZGUgZGF0b3MgY29pbmNpZGEgY29uIGxvcyDigJhkYXRhSWTigJkgZGUgZXN0YSBjb25maWd1cmFjacOzbi4nXG4gICAgICB9XG4gICAgfSxcbiAgICBsb2FkaW5nRGlhbG9nOiB7XG4gICAgICBsb2FkaW5nOiAnQ2FyZ2FuZG8uLi4nXG4gICAgfSxcbiAgICBsb2FkRGF0YToge1xuICAgICAgdXBsb2FkOiAnQ2FyZ2FyIGFyY2hpdm9zJyxcbiAgICAgIHN0b3JhZ2U6ICdDYXJnYXIgZGVzZGUgYWxtYWNlbmFnZSdcbiAgICB9LFxuICAgIHRyaXBJbmZvOiB7XG4gICAgICB0aXRsZTogJ0NvbW8gaGFiaWxpdGFyIGxhIGFuaW1hY2nDs24gZGUgdmlhamUnLFxuICAgICAgZGVzY3JpcHRpb24xOlxuICAgICAgICAnUGFyYSBhbmltYXIgbGEgcnV0YSwgbG9zIGRhdG9zIGdlb0pTT04gaGFuIGRlIGNvbnRlbmVyIGBMaW5lU3RyaW5nYCBlbiBzdSBnZW9tZXRyw61hIHkgbGFzIGNvb3JkZW5hZGFzIGRlIExpbmVTdHJpbmcgZGViZW4gdGVuZXIgNCBlbGVtZW50b3MgZW4gbG9zIGZvcm1hdHMgZGUgJyxcbiAgICAgIGNvZGU6ICcgW2xvbmdpdHVkZSwgbGF0aXR1ZGUsIGFsdGl0dWRlLCB0aW1lc3RhbXBdICcsXG4gICAgICBkZXNjcmlwdGlvbjI6XG4gICAgICAgICd5IGVsIMO6bHRpbW8gZWxlbWVudG8gZGViZSBzZXIgbGEgbWFyY2EgZGVsIHRpZW1wby4gTG9zIGZvcm1hdG9zIHbDoWxpZG9zIHBhcmEgbGEgbWFyY2EgZGUgdGllbXBvIGluY2x1eWVuIFVuaXggZW4gc2VndW5kb3MgY29tbyBgMTU2NDE4NDM2M2AgbyBlbiBtaWxpc2VndW5kb3MgY29tbyBgMTU2NDE4NDM2MzAwMGAuJyxcbiAgICAgIGV4YW1wbGU6ICdFamVtcGxvOidcbiAgICB9LFxuICAgIGljb25JbmZvOiB7XG4gICAgICB0aXRsZTogJ0NvbW8gZGlidWphciDDrWNvbm9zJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ0VuIHR1IENTViBjcmVhIHVuYSBjb2x1bW5hIHkgcG9uIGVsIG5vbWJyZSBkZWwgw61jb25vIHF1ZSBxdWllcmVzIGRpYnVqYXIuIFB1ZWRlcyBkZWphciBsYSBjZWxkYSB2YWPDrWEgY3VhbmRvIG5vIHF1aWVyYXMgcXVlIHNlIG11ZXN0cmUgcGFyYSBjaWVydG9zIHB1bnRvcy4gQ3VhbmRvIGxhIGNvbHVtbmEgc2UgbGxhbWEnLFxuICAgICAgY29kZTogJ8OtY29ubycsXG4gICAgICBkZXNjcmlwdGlvbjI6ICcga2VwbGVyLmdsIGF1dG9tw6F0aWNhbWVudGUgY3JlYXLDoSB1bmEgY2FwYSBkZSDDrWNvbm8uJyxcbiAgICAgIGV4YW1wbGU6ICdFamVtcGxvOicsXG4gICAgICBpY29uczogJ0ljb25vcydcbiAgICB9LFxuICAgIHN0b3JhZ2VNYXBWaWV3ZXI6IHtcbiAgICAgIGxhc3RNb2RpZmllZDogJ8OabHRpbWEgbW9kaWZpY2FjacOzbiBoYWNlIHtsYXN0VXBkYXRlZH0nLFxuICAgICAgYmFjazogJ0F0csOhcydcbiAgICB9LFxuICAgIG92ZXJ3cml0ZU1hcDoge1xuICAgICAgdGl0bGU6ICdHdWFyZGFuZG8gZWwgbWFwYS4uLicsXG4gICAgICBhbHJlYWR5RXhpc3RzOiAnamEgZXhpc3RlIGVuIHttYXBTYXZlZH0uIExvIHF1aWVyZXMgc29icmVlc2NyaXZpcj8nXG4gICAgfSxcbiAgICBsb2FkU3RvcmFnZU1hcDoge1xuICAgICAgYmFjazogJ0F0csOhcycsXG4gICAgICBnb1RvUGFnZTogJ1ZlcyBhIGxhIHDDoWdpbmEge2Rpc3BsYXlOYW1lfSBkZSBLZXBsZXIuZ2wnLFxuICAgICAgc3RvcmFnZU1hcHM6ICdBbG1hbmNlbmFnZSAvIE1hcGFzJyxcbiAgICAgIG5vU2F2ZWRNYXBzOiAnTm8gaGF5IG5pbmfDum4gbWFwYSBndWFyZGFkbyB0b2RhdsOtYSdcbiAgICB9XG4gIH0sXG4gIGhlYWRlcjoge1xuICAgIHZpc2libGVMYXllcnM6ICdDYXBhcyB2aXNpYmxlcycsXG4gICAgbGF5ZXJMZWdlbmQ6ICdDYXBhIGRlIGxleWVuZGEnXG4gIH0sXG4gIGludGVyYWN0aW9uczoge1xuICAgIHRvb2x0aXA6ICdTdWdlcmVuY2lhcycsXG4gICAgYnJ1c2g6ICdQaW5jZWwnLFxuICAgIGNvb3JkaW5hdGU6ICdDb29yZGVuYWRhcycsXG4gICAgZ2VvY29kZXI6ICdHZW9jb2RpZmljYWRvcidcbiAgfSxcbiAgbGF5ZXJCbGVuZGluZzoge1xuICAgIHRpdGxlOiAnQ29tYmluYWNpw7NuIGRlIGNhcGFzJyxcbiAgICBhZGRpdGl2ZTogJ2FkaXRpdmEnLFxuICAgIG5vcm1hbDogJ25vcm1hbCcsXG4gICAgc3VidHJhY3RpdmU6ICdzdWJzdHJhY3RpdmEnXG4gIH0sXG4gIGNvbHVtbnM6IHtcbiAgICB0aXRsZTogJ0NvbHVtbmFzJyxcbiAgICBsYXQ6ICdsYXQnLFxuICAgIGxuZzogJ2xvbicsXG4gICAgYWx0aXR1ZGU6ICdhbHR1cmEnLFxuICAgIGljb246ICfDrWNvbm8nLFxuICAgIGdlb2pzb246ICdnZW9qc29uJyxcbiAgICBhcmM6IHtcbiAgICAgIGxhdDA6ICdsYXQgb3JpZ2VuJyxcbiAgICAgIGxuZzA6ICdsbmcgb3JpZ2VuICcsXG4gICAgICBsYXQxOiAnbGF0IGRlc3Rpbm8nLFxuICAgICAgbG5nMTogJ2xuZyBkZXN0aW5vJ1xuICAgIH0sXG4gICAgbGluZToge1xuICAgICAgYWx0MDogJ2FsdHVyYSBvcmlnZW4nLFxuICAgICAgYWx0MTogJ2FsdHVyYSBkZXN0aW5vJ1xuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ1RhbWHDsW8gZGUgbGEgbWFsbGEgKGttKSdcbiAgICB9LFxuICAgIGhleGFnb246IHtcbiAgICAgIHdvcmxkVW5pdFNpemU6ICdSYWRpbyBkZSBoZXjDoWdvbm8gKGttKSdcbiAgICB9LFxuICAgIGhleF9pZDogJ2lkIGhleCdcbiAgfSxcbiAgY29sb3I6IHtcbiAgICBjdXN0b21QYWxldHRlOiAnUGFsZXRhIHBlcnNvbmFsaXphZGEnLFxuICAgIHN0ZXBzOiAncGFzb3MnLFxuICAgIHR5cGU6ICd0aXBvJyxcbiAgICByZXZlcnNlZDogJ2ludmVydGlkYSdcbiAgfSxcbiAgc2NhbGU6IHtcbiAgICBjb2xvclNjYWxlOiAnRXNjYWxhIGRlIGNvbG9yJyxcbiAgICBzaXplU2NhbGU6ICdFc2NhbGEgZGUgbWVkaWRhcycsXG4gICAgc3Ryb2tlU2NhbGU6ICdFc2NhbGEgZGUgdHJhem8nLFxuICAgIHNjYWxlOiAnRXNjYWxhJ1xuICB9LFxuICBmaWxlVXBsb2FkZXI6IHtcbiAgICBtZXNzYWdlOiAnQXJyYXN0cmEgeSBzdWVsdGEgZWwgYXJjaGl2byBhcXXDrScsXG4gICAgY2hyb21lTWVzc2FnZTpcbiAgICAgICcqdXN1YXJpbyBkZSBDaHJvbWU6IGxhIG1lZGlkYSBtw6F4aW1hIHNvbiAyNTBtYiwgc2kgZGViZXMgY2FyZ2FyIHVuIGFyY2hpdm8gbcOhcyBncmFuZGUgdXRpbGl6YSBTYWZhcmknLFxuICAgIGRpc2NsYWltZXI6XG4gICAgICAnKmtlcGxlci5nbCBlcyB1bmEgYXBsaWNhY2nDs24gYWwgbGFkbyBjbGllbnRlIHF1ZSBubyB1dGlsaXphIG5pbmfDum4gc2Vydmlkb3IuIExvcyBkYXRvcyBzw7NsbyBleGlzdGVuIGVuIHR1IG3DoXF1aW5hL25hdmVnYWRvci4gJyArXG4gICAgICAnTm8gc2UgZW52aWFuIGRhdG9zIG5pIG1hcGFzIGEgbmluZ8O6biBzZXJ2aWRvci4nLFxuICAgIGNvbmZpZ1VwbG9hZE1lc3NhZ2U6XG4gICAgICAnQ2FyZ2FyIHtmaWxlRm9ybWF0TmFtZXN9IG8gdW4gbWFwYSBndWFyZGFkbyBlbiAqKkpzb24qKi4gTcOhcyBpbmZvcm1hY2nDs24gc29icmUgWyoqc3VwcG9ydGVkIGZpbGUgZm9ybWF0cyoqXScsXG4gICAgYnJvd3NlRmlsZXM6ICduYXZlZ2EgcG9yIHR1cyBhcmNoaXZvcycsXG4gICAgdXBsb2FkaW5nOiAnQ2FyZ2FuZG8nLFxuICAgIGZpbGVOb3RTdXBwb3J0ZWQ6ICdFbCBhcmNoaXZvIHtlcnJvckZpbGVzfSBubyBlcyBjb21wYXRpYmxlLicsXG4gICAgb3I6ICdvJ1xuICB9LFxuICBnZW9jb2Rlcjoge1xuICAgIHRpdGxlOiAnSW50cm9kdWNlIHVuYSBkaXJlY2Npw7NuJ1xuICB9LFxuICBmaWVsZFNlbGVjdG9yOiB7XG4gICAgY2xlYXJBbGw6ICdRdWl0YXIgdG9kb3MnLFxuICAgIGZvcm1hdHRpbmc6ICdGb3JtYXRvJ1xuICB9LFxuICBjb21wYXJlOiB7XG4gICAgbW9kZUxhYmVsOiAnTW9kbyBDb21wYXJhY2nDs24nLFxuICAgIHR5cGVMYWJlbDogJ1RpcG8gZGUgQ29tcGFyYWNpw7NuJyxcbiAgICB0eXBlczoge1xuICAgICAgYWJzb2x1dGU6ICdBYnNvbHV0YScsXG4gICAgICByZWxhdGl2ZTogJ1JlbGF0aXZhJ1xuICAgIH1cbiAgfSxcbiAgbWFwUG9wb3Zlcjoge1xuICAgIHByaW1hcnk6ICdQcmluY2lwYWwnXG4gIH0sXG4gIGRlbnNpdHk6ICdkZW5zaWRhZCcsXG4gICdCdWcgUmVwb3J0JzogJ0luZm9ybWUgZGUgZXJyb3JlcycsXG4gICdVc2VyIEd1aWRlJzogJ0d1w61hIGRlIHVzdWFyaW8nLFxuICBTYXZlOiAnR3VhZGFyJyxcbiAgU2hhcmU6ICdDb21wYXJ0aXInXG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUdBLElBQUFBLFFBQUEsR0FBQUMsT0FBQTtBQUFtQyxTQUFBQyxRQUFBQyxDQUFBLEVBQUFDLENBQUEsUUFBQUMs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