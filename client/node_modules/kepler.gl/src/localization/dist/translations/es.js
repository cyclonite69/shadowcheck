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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsImNvdmVyYWdlIiwic3Ryb2tlQ29sb3IiLCJyYWRpdXMiLCJvdXRsaW5lIiwic3Ryb2tlIiwiZGVuc2l0eSIsImhlaWdodCIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJiYWNrZ3JvdW5kIiwicGFuZWwiLCJ0ZXh0IiwibGFiZWxXaXRoSWQiLCJmb250U2l6ZSIsImZvbnRDb2xvciIsInRleHRBbmNob3IiLCJhbGlnbm1lbnQiLCJhZGRNb3JlTGFiZWwiLCJzaWRlYmFyIiwicGFuZWxzIiwibGF5ZXIiLCJpbnRlcmFjdGlvbiIsImJhc2VtYXAiLCJyZXF1aXJlZCIsInByb3BlcnR5QmFzZWRPbiIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsImFuZ2xlIiwic3Ryb2tlV2lkdGhSYW5nZSIsImZpeGVkUmFkaXVzIiwiZml4ZWRSYWRpdXNEZXNjcmlwdGlvbiIsInJhZGl1c1JhbmdlIiwiY2x1c3RlclJhZGl1cyIsInJhZGl1c1JhbmdlUGl4ZWxzIiwiYmlsbGJvYXJkIiwiYmlsbGJvYXJkRGVzY3JpcHRpb24iLCJmYWRlVHJhaWwiLCJvcGFjaXR5IiwiY29sb3JSYW5nZSIsInN0cm9rZUNvbG9yUmFuZ2UiLCJ0YXJnZXRDb2xvciIsImNvbG9yQWdncmVnYXRpb24iLCJoZWlnaHRBZ2dyZWdhdGlvbiIsInJlc29sdXRpb25SYW5nZSIsInNpemVTY2FsZSIsIndvcmxkVW5pdFNpemUiLCJlbGV2YXRpb25TY2FsZSIsImVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3IiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yRGVzY3JpcHRpb24iLCJlbmFibGVIZWlnaHRab29tRmFjdG9yIiwiaGVpZ2h0U2NhbGUiLCJjb3ZlcmFnZVJhbmdlIiwiaGlnaFByZWNpc2lvblJlbmRlcmluZyIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbiIsImhlaWdodERlc2NyaXB0aW9uIiwiZmlsbCIsImVuYWJsZVBvbHlnb25IZWlnaHQiLCJzaG93V2lyZWZyYW1lIiwid2VpZ2h0SW50ZW5zaXR5Iiwiem9vbVNjYWxlIiwiaGVpZ2h0UmFuZ2UiLCJoZWlnaHRNdWx0aXBsaWVyIiwiZml4ZWRIZWlnaHQiLCJmaXhlZEhlaWdodERlc2NyaXB0aW9uIiwibGF5ZXJNYW5hZ2VyIiwiYWRkRGF0YSIsImFkZExheWVyIiwibGF5ZXJCbGVuZGluZyIsIm1hcE1hbmFnZXIiLCJtYXBTdHlsZSIsImFkZE1hcFN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwibGF5ZXJDb25maWd1cmF0aW9uIiwiZGVmYXVsdERlc2NyaXB0aW9uIiwiaG93VG8iLCJmaWx0ZXJNYW5hZ2VyIiwiYWRkRmlsdGVyIiwiZGF0YXNldFRpdGxlIiwic2hvd0RhdGFUYWJsZSIsInJlbW92ZURhdGFzZXQiLCJkYXRhc2V0SW5mbyIsInJvd0NvdW50IiwidG9vbHRpcCIsImhpZGVMYXllciIsInNob3dMYXllciIsImhpZGVGZWF0dXJlIiwic2hvd0ZlYXR1cmUiLCJoaWRlIiwic2hvdyIsInJlbW92ZUxheWVyIiwicmVzZXRBZnRlckVycm9yIiwibGF5ZXJTZXR0aW5ncyIsImNsb3NlUGFuZWwiLCJzd2l0Y2hUb0R1YWxWaWV3Iiwic2hvd0xlZ2VuZCIsImRpc2FibGUzRE1hcCIsIkRyYXdPbk1hcCIsInNlbGVjdExvY2FsZSIsInNob3dBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUFpQXNzaXN0YW50UGFuZWwiLCJoaWRlTGF5ZXJQYW5lbCIsInNob3dMYXllclBhbmVsIiwibW92ZVRvVG9wIiwic2VsZWN0QmFzZU1hcFN0eWxlIiwidGltZVBsYXliYWNrIiwiY2xvdWRTdG9yYWdlIiwiYW5pbWF0aW9uQnlXaW5kb3ciLCJhbmltYXRpb25CeUluY3JlbWVudGFsIiwic3BlZWQiLCJwbGF5IiwicGF1c2UiLCJyZXNldCIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImdlb2NvZGVyIiwiYWRkaXRpdmUiLCJub3JtYWwiLCJzdWJ0cmFjdGl2ZSIsImNvbHVtbnMiLCJsYXQiLCJsbmciLCJhbHRpdHVkZSIsImxhdDAiLCJsbmcwIiwibGF0MSIsImxuZzEiLCJhbHQwIiwiYWx0MSIsImhleF9pZCIsImN1c3RvbVBhbGV0dGUiLCJzdGVwcyIsInJldmVyc2VkIiwic2NhbGUiLCJjb2xvclNjYWxlIiwic3Ryb2tlU2NhbGUiLCJmaWxlVXBsb2FkZXIiLCJtZXNzYWdlIiwiY2hyb21lTWVzc2FnZSIsImNvbmZpZ1VwbG9hZE1lc3NhZ2UiLCJicm93c2VGaWxlcyIsInVwbG9hZGluZyIsImZpbGVOb3RTdXBwb3J0ZWQiLCJvciIsImZpZWxkU2VsZWN0b3IiLCJjbGVhckFsbCIsImZvcm1hdHRpbmciLCJjb21wYXJlIiwibW9kZUxhYmVsIiwidHlwZUxhYmVsIiwidHlwZXMiLCJhYnNvbHV0ZSIsInJlbGF0aXZlIiwibWFwUG9wb3ZlciIsInByaW1hcnkiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdHJhbnNsYXRpb25zL2VzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmltcG9ydCB7TE9DQUxFU30gZnJvbSAnLi4vbG9jYWxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcGVydHk6IHtcbiAgICB3ZWlnaHQ6ICdwZXNvJyxcbiAgICBsYWJlbDogJ2V0aXF1ZXRhJyxcbiAgICBmaWxsQ29sb3I6ICdjb2xvciBkZSByZWxsZW5vJyxcbiAgICBjb2xvcjogJ2NvbG9yJyxcbiAgICBjb3ZlcmFnZTogJ2NvYmVydHVyYScsXG4gICAgc3Ryb2tlQ29sb3I6ICdjb2xvciBkZSB0cmF6bycsXG4gICAgcmFkaXVzOiAncmFkaW8nLFxuICAgIG91dGxpbmU6ICdjb250b3JubycsXG4gICAgc3Ryb2tlOiAndHJhem8nLFxuICAgIGRlbnNpdHk6ICdkZW5zaWRhZCcsXG4gICAgaGVpZ2h0OiAnYWx0dXJhJyxcbiAgICBzdW06ICdzdW1hJyxcbiAgICBwb2ludENvdW50OiAnUmVjdWVudG8gZGUgcHVudG9zJ1xuICB9LFxuICBwbGFjZWhvbGRlcjoge1xuICAgIHNlYXJjaDogJ0J1c3F1ZWRhJyxcbiAgICBzZWxlY3RGaWVsZDogJ1NlbGVjY2lvbmEgdW4gY2FtcG8nLFxuICAgIHlBeGlzOiAnRWplIFknLFxuICAgIHNlbGVjdFR5cGU6ICdTZWxlY2Npb25hIHVuIFRpcG8nLFxuICAgIHNlbGVjdFZhbHVlOiAnU2VsZWNjaW9uYSB1biBWYWxvcicsXG4gICAgZW50ZXJWYWx1ZTogJ0VudHJhIHVuIHZhbG9yJyxcbiAgICBlbXB0eTogJ3ZhY2lvJ1xuICB9LFxuICBtaXNjOiB7XG4gICAgYnk6ICcnLFxuICAgIHZhbHVlc0luOiAnVmFsb3JlcyBlbicsXG4gICAgdmFsdWVFcXVhbHM6ICdWYWxvciBpZ3VhbCBhJyxcbiAgICBkYXRhU291cmNlOiAnRnVlbnRlIGRlIGRhdG9zJyxcbiAgICBicnVzaFJhZGl1czogJ1JhZGlvIGRlbCBwaW5jZWwgKGttKScsXG4gICAgZW1wdHk6ICcgJ1xuICB9LFxuICBtYXBMYXllcnM6IHtcbiAgICB0aXRsZTogJ0NhcGFzIGRlbCBtYXBhJyxcbiAgICBsYWJlbDogJ0V0aXF1ZXRhJyxcbiAgICByb2FkOiAnQ2FycmV0ZXJhJyxcbiAgICBib3JkZXI6ICdGcm9udGVyYScsXG4gICAgYnVpbGRpbmc6ICdFZGlmaWNpbycsXG4gICAgd2F0ZXI6ICdBZ3VhJyxcbiAgICBsYW5kOiAnVGllcnJhJyxcbiAgICAnM2RCdWlsZGluZyc6ICdFZGlmaWNpbyAzRCcsXG4gICAgYmFja2dyb3VuZDogJ0ZvbmRvJ1xuICB9LFxuICBwYW5lbDoge1xuICAgIHRleHQ6IHtcbiAgICAgIGxhYmVsOiAnZXRpcXVldGEnLFxuICAgICAgbGFiZWxXaXRoSWQ6ICdFdGlxdWV0YSB7bGFiZWxJZH0nLFxuICAgICAgZm9udFNpemU6ICdUYW1hw7FvIGRlIGZ1ZW50ZScsXG4gICAgICBmb250Q29sb3I6ICdDb2xvciBkZSBmdWVudGUnLFxuICAgICAgdGV4dEFuY2hvcjogJ0FuY2xhamUgZGVsIHRleHRvJyxcbiAgICAgIGFsaWdubWVudDogJ0FsaW5lYWNpw7NuJyxcbiAgICAgIGFkZE1vcmVMYWJlbDogJ0HDsWFkaXIgbcOhcyBldGlxdWV0YXMnXG4gICAgfVxuICB9LFxuICBzaWRlYmFyOiB7XG4gICAgcGFuZWxzOiB7XG4gICAgICBsYXllcjogJ0NhcGFzJyxcbiAgICAgIGZpbHRlcjogJ0ZpbHRyb3MnLFxuICAgICAgaW50ZXJhY3Rpb246ICdJbnRlcmFjY2lvbmVzJyxcbiAgICAgIGJhc2VtYXA6ICdNYXBhIGJhc2UnXG4gICAgfVxuICB9LFxuICBsYXllcjoge1xuICAgIHJlcXVpcmVkOiAnUmVxdWVyaWRvKicsXG4gICAgcmFkaXVzOiAnUmFkaW8nLFxuICAgIGNvbG9yOiAnQ29sb3InLFxuICAgIGZpbGxDb2xvcjogJ0NvbG9yIGRlIHJlbGxlbm8nLFxuICAgIG91dGxpbmU6ICdDb250b3JubycsXG4gICAgd2VpZ2h0OiAnR3J1ZXNvJyxcbiAgICBwcm9wZXJ0eUJhc2VkT246ICd7cHJvcGVydHl9IGJhc2FkbyBlbicsXG4gICAgY292ZXJhZ2U6ICdDb2JlcnR1cmEnLFxuICAgIHN0cm9rZTogJ1RyYXpvJyxcbiAgICBzdHJva2VXaWR0aDogJ0dyb3NvciBkZSB0cmF6bycsXG4gICAgc3Ryb2tlQ29sb3I6ICdDb2xvciBkZSB0cmF6bycsXG4gICAgYmFzaWM6ICdCw6FzaWNvJyxcbiAgICB0cmFpbExlbmd0aDogJ0xvbmdpdHVkIGRlIHBpc3RhJyxcbiAgICB0cmFpbExlbmd0aERlc2NyaXB0aW9uOiAnTnVtZXJvIGRlIHNlZ3VuZG9zIGhhc3RhIHF1ZSBkZXNhcGFyZXpjYSBlbCBjYW1pbm8nLFxuICAgIG5ld0xheWVyOiAnbnVldmEgY2FwYScsXG4gICAgZWxldmF0aW9uQnlEZXNjcmlwdGlvbjogJ1NpIGRlc2FjdGl2YWRvLCBsYSBhbHR1cmEgc2UgYmFzYSBlbiBlbCByZWN1ZW50byBkZSBwdW50b3MnLFxuICAgIGNvbG9yQnlEZXNjcmlwdGlvbjogJ1NpIGRlc2FjdGl2YWRvLCBlbCBjb2xvciBzZSBiYXNhIGVuIGVsIHJlY3VlbnRvIGRlIHB1bnRvcycsXG4gICAgYWdncmVnYXRlQnk6ICd7ZmllbGR9IGFncmVnYWRvIHBvcicsXG4gICAgJzNETW9kZWwnOiAnTW9kZWxvIDNEJyxcbiAgICAnM0RNb2RlbE9wdGlvbnMnOiAnT3BjaW9uZXMgZGVsIG1vZGVsbyAzRCcsXG4gICAgdHlwZToge1xuICAgICAgcG9pbnQ6ICdwdW50bycsXG4gICAgICBhcmM6ICdhcmNvJyxcbiAgICAgIGxpbmU6ICdsw61uZWEnLFxuICAgICAgZ3JpZDogJ21hbGxhJyxcbiAgICAgIGhleGJpbjogJ2hleGJpbicsXG4gICAgICBwb2x5Z29uOiAncG9sw61nb25vJyxcbiAgICAgIGdlb2pzb246ICdnZW9qc29uJyxcbiAgICAgIGNsdXN0ZXI6ICdjbHVzdGVyJyxcbiAgICAgIGljb246ICdpY29ubycsXG4gICAgICBoZWF0bWFwOiAnY29uY2VudHJhY2nDs24nLFxuICAgICAgaGV4YWdvbjogJ2hleMOhZ29ubycsXG4gICAgICBoZXhhZ29uaWQ6ICdIMycsXG4gICAgICB0cmlwOiAndmlhamUnLFxuICAgICAgczI6ICdTMicsXG4gICAgICAnM2QnOiAnM0QnXG4gICAgfSxcbiAgICBsYXllclVwZGF0ZUVycm9yOlxuICAgICAgJ1NlIHByb2R1am8gdW4gZXJyb3IgZHVyYW50ZSBsYSBhY3R1YWxpemFjacOzbiBkZSBsYSBjYXBhOiB7ZXJyb3JNZXNzYWdlfS4gQXNlZ8O6cmVzZSBkZSBxdWUgZWwgZm9ybWF0byBkZSBsb3MgZGF0b3MgZGUgZW50cmFkYSBzZWEgdsOhbGlkby4nXG4gIH0sXG4gIGxheWVyVmlzQ29uZmlnczoge1xuICAgIGFuZ2xlOiAnw4FuZ3VsbycsXG4gICAgc3Ryb2tlV2lkdGg6ICdBbmNobyBkZWwgdHJhem8nLFxuICAgIHN0cm9rZVdpZHRoUmFuZ2U6ICdSYW5nbyBkZWwgYW5jaG8gZGVsIHRyYXpvJyxcbiAgICByYWRpdXM6ICdSYWRpbycsXG4gICAgZml4ZWRSYWRpdXM6ICdSYWRpbyBmaWpvIGEgbWVkaXInLFxuICAgIGZpeGVkUmFkaXVzRGVzY3JpcHRpb246ICdBanVzdGFyIGVsIHJhZGlvIGFsIHJhZGlvIGFic29sdXRvIGVuIG1ldHJvcywgcC5lLiA1IGEgNSBtZXRyb3MnLFxuICAgIHJhZGl1c1JhbmdlOiAnUmFuZ28gZGUgcmFkaW8nLFxuICAgIGNsdXN0ZXJSYWRpdXM6ICdSYWRpbyBkZWwgY2x1c3RlciBlbiBww614ZWxlcycsXG4gICAgcmFkaXVzUmFuZ2VQaXhlbHM6ICdSYW5nbyBkZWwgcmFkaW8gZW4gcMOteGVsZXMnLFxuICAgIGJpbGxib2FyZDogJ01vZG8gY2FydGVsZXJhJyxcbiAgICBiaWxsYm9hcmREZXNjcmlwdGlvbjogJ09yaWVudGUgbGEgZ2VvbWV0csOtYSBoYWNpYSBsYSBjw6FtYXJhJyxcbiAgICBmYWRlVHJhaWw6ICdTZW5kZXJvIGRlIGRlc3ZhbmVjaW1pZW50bycsXG4gICAgb3BhY2l0eTogJ09wYWNpZGFkJyxcbiAgICBjb3ZlcmFnZTogJ0NvYmVydHVyYScsXG4gICAgb3V0bGluZTogJ0NvbnRvcm5vJyxcbiAgICBjb2xvclJhbmdlOiAnUmFuZ28gZGUgY29sb3InLFxuICAgIHN0cm9rZTogJ1RyYXpvJyxcbiAgICBzdHJva2VDb2xvcjogJ0NvbG9yIGRlIHRyYXpvJyxcbiAgICBzdHJva2VDb2xvclJhbmdlOiAnUmFuZ28gZGUgY29sb3IgZGUgdHJhem8nLFxuICAgIHRhcmdldENvbG9yOiAnQ29sb3IgZGVzdGlubycsXG4gICAgY29sb3JBZ2dyZWdhdGlvbjogJ0FncmVnYWNpw7NuIGRlIGNvbG9yJyxcbiAgICBoZWlnaHRBZ2dyZWdhdGlvbjogJ0FncmVnYWNpw7NuIGRlIGxhIGFsdHVyYScsXG4gICAgcmVzb2x1dGlvblJhbmdlOiAnUmFuZ28gZGUgcmVzb2x1Y2nDs24nLFxuICAgIHNpemVTY2FsZTogJ01lZGlkYSBkZSBlc2NhbGEnLFxuICAgIHdvcmxkVW5pdFNpemU6ICdNZWRpZGEgZGUgbGEgdW5pZGFkIG11bmRpYWwnLFxuICAgIGVsZXZhdGlvblNjYWxlOiAnRXNjYWxhIGRlIGVsZXZhY2nDs24nLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3I6ICdVc2FyIGZhY3RvciBkZSB6b29tIGRlIGVsZXZhY2nDs24nLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbjpcbiAgICAgICdBanVzdGUgbGEgYWx0dXJhIC8gZWxldmFjacOzbiBzZWfDum4gZWwgZmFjdG9yIGRlIHpvb20gYWN0dWFsJyxcbiAgICBlbmFibGVIZWlnaHRab29tRmFjdG9yOiAnVXNhciBmYWN0b3IgZGUgem9vbSBkZSBhbHR1cmEnLFxuICAgIGhlaWdodFNjYWxlOiAnRXNjYWxhIGRlIGFsdHVyYScsXG4gICAgY292ZXJhZ2VSYW5nZTogJ1JhbmdvIGRlIGNvYmVydHVyYScsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZzogJ1JlcHJlc2VudGFjacOzbiBkZSBhbHRhIHByZWNpc2nDs24nLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbjogJ0xhIHByZWNpc2nDs24gYWx0YSB0ZW5kcsOhIHVuIHJlbmRpbWllbnRvIG3DoXMgYmFqbycsXG4gICAgaGVpZ2h0OiAnQWx0dXJhJyxcbiAgICBoZWlnaHREZXNjcmlwdGlvbjpcbiAgICAgICdIYXogY2xpYyBlbiBlbCBib3TDs24gZGUgYXJyaWJhIGEgbGEgZGVyZWNoYSBkZWwgbWFwYSBwZXIgY2FtYmlhciBhIHZpc3RhIDNEJyxcbiAgICBmaWxsOiAnUmVsbGVuYXInLFxuICAgIGVuYWJsZVBvbHlnb25IZWlnaHQ6ICdBY3RpdmFyIGxhIGFsdHVyYSBkZWwgcG9sw61nb25vJyxcbiAgICBzaG93V2lyZWZyYW1lOiAnTXVlc3RyYSBlc3F1ZW3DoHRpY28nLFxuICAgIHdlaWdodEludGVuc2l0eTogJ0ludGVuc2lkYWQgZGUgcGVzbycsXG4gICAgem9vbVNjYWxlOiAnRXNjYWxhIGRlIHpvb20nLFxuICAgIGhlaWdodFJhbmdlOiAnUmFuZ28gZGUgYWx0dXJhcycsXG4gICAgaGVpZ2h0TXVsdGlwbGllcjogJ011bHRpcGxpY2Fkb3IgZGUgYWx0dXJhJyxcbiAgICBmaXhlZEhlaWdodDogJ0FsdHVyYSBmaWphJyxcbiAgICBmaXhlZEhlaWdodERlc2NyaXB0aW9uOiAnVXNhciBhbHR1cmEgc2luIG1vZGlmaWNhY2lvbmVzJ1xuICB9LFxuICBsYXllck1hbmFnZXI6IHtcbiAgICBhZGREYXRhOiAnQcOxYWRpciBkYXRvcycsXG4gICAgYWRkTGF5ZXI6ICdBw7FhZGlyIGNhcGEnLFxuICAgIGxheWVyQmxlbmRpbmc6ICdDb21iaW5hciBjYXBhcydcbiAgfSxcbiAgbWFwTWFuYWdlcjoge1xuICAgIG1hcFN0eWxlOiAnRXN0aWxvIGRlIG1hcGEnLFxuICAgIGFkZE1hcFN0eWxlOiAnQcOxYWRpciBlc3RpbG8gZGUgbWFwYScsXG4gICAgJzNkQnVpbGRpbmdDb2xvcic6ICdDb2xvciBlZGlmaWNpb3MgM0QnLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ0NvbG9yIGRlIGZvbmRvJ1xuICB9LFxuICBsYXllckNvbmZpZ3VyYXRpb246IHtcbiAgICBkZWZhdWx0RGVzY3JpcHRpb246ICdDYWxjdWxhciB7cHJvcGVydHl9IHNlZ8O6biBlbCBjYW1wbyBzZWxlY2Npb25hZG8nLFxuICAgIGhvd1RvOiAnSG93IHRvJ1xuICB9LFxuICBmaWx0ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRmlsdGVyOiAnQcOxYWRpciBmaWx0cm8nXG4gIH0sXG4gIGRhdGFzZXRUaXRsZToge1xuICAgIHNob3dEYXRhVGFibGU6ICdNb3N0YXIgbGEgdGFibGEgZGUgZGF0b3MnLFxuICAgIHJlbW92ZURhdGFzZXQ6ICdFbGltaW5hciBjb25qdW50byBkZSBkYXRvcydcbiAgfSxcbiAgZGF0YXNldEluZm86IHtcbiAgICByb3dDb3VudDogJ3tyb3dDb3VudH0gZmlsZXMnXG4gIH0sXG4gIHRvb2x0aXA6IHtcbiAgICBoaWRlTGF5ZXI6ICdPY3VsdGFyIGxhIGNhcGEnLFxuICAgIHNob3dMYXllcjogJ01vc3RyYXIgbGEgY2FwYScsXG4gICAgaGlkZUZlYXR1cmU6ICdPY3VsdGFyIGVsIG9iamV0bycsXG4gICAgc2hvd0ZlYXR1cmU6ICdNb3N0cmFyIGVsIG9iamV0bycsXG4gICAgaGlkZTogJ09jdWx0YXInLFxuICAgIHNob3c6ICdNb3N0cmFyJyxcbiAgICByZW1vdmVMYXllcjogJ0VsaW1pbmFyIGNhcGEnLFxuICAgIHJlc2V0QWZ0ZXJFcnJvcjogJ0ludGVudGUgaGFiaWxpdGFyIGxhIGNhcGEgZGVzcHXDqXMgZGUgdW4gZXJyb3InLFxuICAgIGxheWVyU2V0dGluZ3M6ICdDb25maWd1cmFjacOzbiBkZSBjYXBhJyxcbiAgICBjbG9zZVBhbmVsOiAnQ2VycmFyIGVsIHBhbmVsIGFjdHVhbCcsXG4gICAgc3dpdGNoVG9EdWFsVmlldzogJ0NhbWJpYXIgYSBsYSB2aXN0YSBkZSBtYXBhIGR1YWwnLFxuICAgIHNob3dMZWdlbmQ6ICdNb3N0cmFyIGxleWVuZGEnLFxuICAgIGRpc2FibGUzRE1hcDogJ0Rlc2FjdGl2YXIgbWFwYSAzRCcsXG4gICAgRHJhd09uTWFwOiAnRGlidWphciBlbiBlbCBtYXBhJyxcbiAgICBzZWxlY3RMb2NhbGU6ICdTZWxlY2Npb25hciBjb25maWd1cmFjacOzbiByZWdpb25hbCcsXG4gICAgc2hvd0FpQXNzaXN0YW50UGFuZWw6ICdNb3N0cmFyIGVsIHBhbmVsIGRlIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUFpQXNzaXN0YW50UGFuZWw6ICdPY3VsdGFyIGVsIHBhbmVsIGRlIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUxheWVyUGFuZWw6ICdPY3VsdGFyIGxhIHRhYmxhIGRlIGNhcGFzJyxcbiAgICBzaG93TGF5ZXJQYW5lbDogJ01vc3RyYXIgbGEgdGFibGEgIGRlIGNhcGFzJyxcbiAgICBtb3ZlVG9Ub3A6ICdEZXNwbGF6YXIgYXJyaWJhIGRlIGxhcyBjYXBhcyBkZSBkYXRvcycsXG4gICAgc2VsZWN0QmFzZU1hcFN0eWxlOiAnU2VsZWNjaW9uYXIgZXN0aWxvIGRlIG1hcGEgYmFzZScsXG4gICAgZGVsZXRlOiAnQm9ycmFyJyxcbiAgICB0aW1lUGxheWJhY2s6ICdSZXByb2R1Y2Npw7NuIGRlIHRpZW1wbycsXG4gICAgY2xvdWRTdG9yYWdlOiAnQWxtYWNlbmFqZSBlbiBsYSBudWJlJyxcbiAgICAnM0RNYXAnOiAnTWFwYSAzRCcsXG4gICAgYW5pbWF0aW9uQnlXaW5kb3c6ICdWZW50YW5hIFRlbXBvcmFsIE3Ds3ZpbCcsXG4gICAgYW5pbWF0aW9uQnlJbmNyZW1lbnRhbDogJ1ZlbnRhbmEgVGVtcG9yYWwgSW5jcmVtZW50YWwnLFxuICAgIHNwZWVkOiAndmVsb2NpZGFkJyxcbiAgICBwbGF5OiAnaW5pY2lhcicsXG4gICAgcGF1c2U6ICdwYXVzYXInLFxuICAgIHJlc2V0OiAncmVpbmljaWFyJ1xuICB9LFxuICB0b29sYmFyOiB7XG4gICAgZXhwb3J0SW1hZ2U6ICdFeHBvcnRhciBpbWFnZW4nLFxuICAgIGV4cG9ydERhdGE6ICdFeHBvcnRhciBkYXRvcycsXG4gICAgZXhwb3J0TWFwOiAnRXhwb3J0YXIgbWFwYScsXG4gICAgc2hhcmVNYXBVUkw6ICdDb21wYXJ0aXIgZWwgZW5sYWNlIGRlbCBtYXBhJyxcbiAgICBzYXZlTWFwOiAnR3VhcmRhciBtYXBhJyxcbiAgICBzZWxlY3Q6ICdzZWxlY2Npb25hJyxcbiAgICBwb2x5Z29uOiAncG9sw61nb25vJyxcbiAgICByZWN0YW5nbGU6ICdyZWN0w6FuZ3VsbycsXG4gICAgaGlkZTogJ2VzY29uZGVyJyxcbiAgICBzaG93OiAnbW9zdHJhcicsXG4gICAgLi4uTE9DQUxFU1xuICB9LFxuICBtb2RhbDoge1xuICAgIHRpdGxlOiB7XG4gICAgICBkZWxldGVEYXRhc2V0OiAnQm9ycmFyIGNvbmp1bnRvIGRlIGRhdG9zJyxcbiAgICAgIGFkZERhdGFUb01hcDogJ0HDsWFkaXIgZGF0b3MgYWwgbWFwYScsXG4gICAgICBleHBvcnRJbWFnZTogJ0V4cG9ydGFyIGltYWdlbicsXG4gICAgICBleHBvcnREYXRhOiAnRXhwb3J0YXIgZGF0b3MnLFxuICAgICAgZXhwb3J0TWFwOiAnRXhwb3J0YXIgbWFwYScsXG4gICAgICBhZGRDdXN0b21NYXBib3hTdHlsZTogJ0HDsWFkaXIgZXN0aWxvIGRlIE1hcGJveCBwcm9waW8nLFxuICAgICAgc2F2ZU1hcDogJ0d1YXJkYXIgbWFwYScsXG4gICAgICBzaGFyZVVSTDogJ0NvbXBhcnRpciBlbmxhY2UnXG4gICAgfSxcbiAgICBidXR0b246IHtcbiAgICAgIGRlbGV0ZTogJ0JvcnJhcicsXG4gICAgICBkb3dubG9hZDogJ0Rlc2NhcmdhcicsXG4gICAgICBleHBvcnQ6ICdFeHBvcnRhcicsXG4gICAgICBhZGRTdHlsZTogJ0HDsWFkaXIgZXN0aWxvJyxcbiAgICAgIHNhdmU6ICdHdWFyZGFyJyxcbiAgICAgIGRlZmF1bHRDYW5jZWw6ICdDYW5jZWxhcicsXG4gICAgICBkZWZhdWx0Q29uZmlybTogJ0NvbmZpcm1hcidcbiAgICB9LFxuICAgIGV4cG9ydEltYWdlOiB7XG4gICAgICByYXRpb1RpdGxlOiAnUmF0aW8nLFxuICAgICAgcmF0aW9EZXNjcmlwdGlvbjogJ0Vzb2dlciByYXRpbyBwb3IgZGl2ZXJzb3MgdXNvcy4nLFxuICAgICAgcmF0aW9PcmlnaW5hbFNjcmVlbjogJ1BhbnRhbGxhIG9yaWdpbmFsJyxcbiAgICAgIHJhdGlvQ3VzdG9tOiAnUGVyc29uYWxpemFkbycsXG4gICAgICByYXRpbzRfMzogJzQ6MycsXG4gICAgICByYXRpbzE2Xzk6ICcxNjo5JyxcbiAgICAgIHJlc29sdXRpb25UaXRsZTogJ1Jlc29sdWNpw7NuJyxcbiAgICAgIHJlc29sdXRpb25EZXNjcmlwdGlvbjogJ1VuYSBhbHRhIHJlc29sdWNpw7NuIGVzIG1lam9yIHBhcmEgbGFzIGltcHJlc2lvbmVzLicsXG4gICAgICBtYXBMZWdlbmRUaXRsZTogJ0xleWVuZGEgZGVsIG1hcGEnLFxuICAgICAgbWFwTGVnZW5kQWRkOiAnQcOxYWRpciBsZXllbmRhIGFsIG1hcGEnXG4gICAgfSxcbiAgICBleHBvcnREYXRhOiB7XG4gICAgICBkYXRhc2V0VGl0bGU6ICdDb25qdW50byBkZSBkYXRvcycsXG4gICAgICBkYXRhc2V0U3VidGl0bGU6ICdFc2NvZ2VyIGxvcyBjb25qdW50b3MgZGUgZGF0b3MgYSBleHBvcnRhcicsXG4gICAgICBhbGxEYXRhc2V0czogJ1RvZG9zJyxcbiAgICAgIGRhdGFUeXBlVGl0bGU6ICdUaXBvIGRlIGRhdG9zJyxcbiAgICAgIGRhdGFUeXBlU3VidGl0bGU6ICdFc2NvZ2VyIGVsIHRpcG8gZGUgZGF0b3MgYSBleHBvcnRhcicsXG4gICAgICBmaWx0ZXJEYXRhVGl0bGU6ICdGaWx0cmFyIGRhdG9zJyxcbiAgICAgIGZpbHRlckRhdGFTdWJ0aXRsZTogJ1NlIHB1ZWRlIGVzY29nZXIgZXhwb3J0YXIgbG9zIGRhdG9zIG9yaWdpbmFsZXMgbyBmaWx0cmFkb3MnLFxuICAgICAgZmlsdGVyZWREYXRhOiAnRGF0b3MgZmlsdHJhZG9zJyxcbiAgICAgIHVuZmlsdGVyZWREYXRhOiAnRGF0b3Mgc2luIGZpbHRyYXInLFxuICAgICAgZmlsZUNvdW50OiAne2ZpbGVDb3VudH0gQXJjaGl2b3MnLFxuICAgICAgcm93Q291bnQ6ICd7cm93Q291bnR9IEZpbGVzJ1xuICAgIH0sXG4gICAgZGVsZXRlRGF0YToge1xuICAgICAgd2FybmluZzogJ2VzdMOhcyBhIHB1bnRvIGRlIGJvcnJhciBlc3RlIGNvbmp1bnRvIGRlIGRhdG9zLiBBZmVjdGFyw6EgYSB7bGVuZ3RofSBjYXBhcydcbiAgICB9LFxuICAgIGFkZFN0eWxlOiB7XG4gICAgICBwdWJsaXNoVGl0bGU6ICcxLiBQdWJsaWNhciB0dSBlc3RpbG8gZW4gTWFwYm94IG8gcHJvcG9yY2lvbmFyIGVsIHRva2VuIGRlIGFjY2VzbycsXG4gICAgICBwdWJsaXNoU3VidGl0bGUxOiAnUHVlZGVzIGNyZWFyIGVsIHR1IHByb3BpbyBlc3RpbG8gZGUgbWFwYSBlbicsXG4gICAgICBwdWJsaXNoU3VidGl0bGUyOiAneScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUzOiAncHVibGljYXInLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNDogJ2xvLicsXG4gICAgICBwdWJsaXNoU3VidGl0bGU1OiAnUGFyYSB1dGlsaXphciB1biBlc3RpbG8gcHJpdmFkbywgZW5nYW5jaGEgdHUnLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNjogJ3Rva2VuIGRlIGFjY2VzbycsXG4gICAgICBwdWJsaXNoU3VidGl0bGU3OlxuICAgICAgICAnYXF1w60uICprZXBsZXIuZ2wgZXMgdW5hIGFwbGljYWNpw7NuIGNsaWVudGUsIGxvcyBkYXRvcyBxdWVkYW4gZW4gdHUgbmF2ZWdhZG9yLi4nLFxuICAgICAgZXhhbXBsZVRva2VuOiAncC5lLiBway5hYmNkZWZnLnh4eHh4eCcsXG4gICAgICBwYXN0ZVRpdGxlOiAnMi4gRW5nYW5jaGEgZWwgZW5sYWNlIGRlbCBlc3RpbG8nLFxuICAgICAgcGFzdGVTdWJ0aXRsZTE6ICdRdcOpIGVzIHVuJyxcbiAgICAgIHBhc3RlU3VidGl0bGUyOiAnZW5sYWNlIGRlbCBlc3RpbG8nLFxuICAgICAgbmFtaW5nVGl0bGU6ICczLiBQb25lciBub21icmUgYSB0dSBlc3RpbG8nXG4gICAgfSxcbiAgICBzaGFyZU1hcDoge1xuICAgICAgc2hhcmVVcmlUaXRsZTogJ0NvbXBhcnRpciBlbCBlbmxhY2UgZGVsIG1hcGEnLFxuICAgICAgc2hhcmVVcmlTdWJ0aXRsZTogJ0dlbmVyYXIgdW4gZW5sYWNlIGRlbCBtYXBhIHBhcmEgY29tcGFydGlyIGNvbiBvdHJvcycsXG4gICAgICBjbG91ZFRpdGxlOiAnQWxtYWNlbmFnZSBlbiBsYSBudWJlJyxcbiAgICAgIGNsb3VkU3VidGl0bGU6ICdBY2NlZGVyIHkgY2FyZ2FyIGRhdG9zIGRlbCBtYXBhIGEgdHUgYWxtYWNlbmFnZSBhIGxhIG51YmUgcGVyc29uYWwnLFxuICAgICAgc2hhcmVEaXNjbGFpbWVyOlxuICAgICAgICAna2VwbGVyLmdsIGd1YXJkYXLDoSBsb3MgZGF0b3MgZGVsIG1hcGEgZW4gZWwgYWxtYWNlbmFnZSBkZSB0dSBudWJlIHBlcnNvbmFsLCBzw7NsbyBxdWllbiB0ZW5nYSBlbCBlbmxhY2UgcG9kcmEgYWNjZWRlciBhbCBtYXBhIHkgYSBsb3MgZGF0b3MgLiAnICtcbiAgICAgICAgJ1B1ZWRlcyBlZGl0YXIvYm9ycmFyIGVsIGFyY2hpdm8gZGUgZGF0b3MgZW4gdHUgY3VlbnRhIGVuIGxhIG51YmUgZW4gY3VhbHF1aWVyIG1vbWVudG8uJyxcbiAgICAgIGdvdG9QYWdlOiAnVmVzIGEgbGEgcMOhZ2luYSBkZSB7Y3VycmVudFByb3ZpZGVyfSBkZSBLZXBsZXIuZ2wnXG4gICAgfSxcbiAgICBzdGF0dXNQYW5lbDoge1xuICAgICAgbWFwVXBsb2FkaW5nOiAnQ2FyZ2FyIHVuIG1hcGEnLFxuICAgICAgZXJyb3I6ICdFcnJvcidcbiAgICB9LFxuICAgIHNhdmVNYXA6IHtcbiAgICAgIHRpdGxlOiAnQWxtYWNlbnRhZ2UgZW4gbGEgbnViZScsXG4gICAgICBzdWJ0aXRsZTogJ0FjY2VkZXIgcGFyYSBndWFyZGFyIGVsIG1hcGEgZW4gdGV1IGFsbWFjZW5hZ2UgZW4gbGEgbnViZSdcbiAgICB9LFxuICAgIGV4cG9ydE1hcDoge1xuICAgICAgZm9ybWF0VGl0bGU6ICdGb3JtYXRvIGRlIG1hcGEnLFxuICAgICAgZm9ybWF0U3VidGl0bGU6ICdFc2NvZ2VyIGVsIGZvcm1hdG8gYWwgcXVlIHNlIGRlc2VhIGV4cG9ydGFyIGVsIG1hcGEnLFxuICAgICAgaHRtbDoge1xuICAgICAgICBzZWxlY3Rpb246ICdFeHBvcnRhciB0dSBtYXBhIGNvbW8gdW4gYXJjaGl2byBIVE1MIGludGVyYWN0aXZvLicsXG4gICAgICAgIHRva2VuVGl0bGU6ICdUb2tlbiBkZSBhY2Nlc28gZGUgTWFwYm94JyxcbiAgICAgICAgdG9rZW5TdWJ0aXRsZTogJ1V0aWxpemFyIHR1IHRva2VuIGRlIGFjY2VzbyBhIE1hcGJveCBhbCBhcmNoaXZvIEhUTUwgKG9wY2lvbmFsKScsXG4gICAgICAgIHRva2VuUGxhY2Vob2xkZXI6ICdFbmdhbmNoYXIgdHUgdG9rZW4gZGUgYWNjZXNvIGEgTWFwYm94JyxcbiAgICAgICAgdG9rZW5NaXN1c2VXYXJuaW5nOlxuICAgICAgICAgICcqIFNpIG5vIHByb3BvcmNpb25hcyB0dSBwcm9waW8gdG9rZW4sIGVsIG1hcGEgcG9kcsOtYSBmYWxsYXIgZW4gY3VhbHF1aWVyIG1vbWVudG8gY3VhbmRvIHJlZW1wbGFjZW1vcyBudWVzdHJvIHRva2VuIHBhcmEgZXZpdGFyIGFidXNvcy4gJyxcbiAgICAgICAgdG9rZW5EaXNjbGFpbWVyOlxuICAgICAgICAgICdQdWVkZXMgY2FtYmlhciBlbCB0b2tlbiBkZSBNYXBib3ggcG9zdGVyaW9ybWVudGUgdXRpbGl6YW5kbyBlc3RhcyBpbnN0cnVjY2lvbmVzOiAnLFxuICAgICAgICB0b2tlblVwZGF0ZTogJ0NvbW8gYWN0dWFsaXR6YXIgdW4gdG9rZW4gcHJlZXhpc3RlbnRlLicsXG4gICAgICAgIG1vZGVUaXRsZTogJ01vZG8gbWFwYScsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTE6ICdTZWxlY2Npb25hciBtb2RvIGFwcC4gTcOhcyAnLFxuICAgICAgICBtb2RlU3VidGl0bGUyOiAnaW5mb3JtYWNpw7NuJyxcbiAgICAgICAgbW9kZURlc2NyaXB0aW9uOiAnUGVybW1pdGUgYSBsb3MgdXN1YXJpb3Mge21vZG99IGVsIG1hcGEnLFxuICAgICAgICByZWFkOiAnbGVlcicsXG4gICAgICAgIGVkaXQ6ICdlZGl0YXInXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICBjb25maWdUaXRsZTogJ0NvbmZpZ3VyYWNpw7NuIGRlbCBtYXBhJyxcbiAgICAgICAgY29uZmlnRGlzY2xhaW1lcjpcbiAgICAgICAgICAnTGEgY29uZmlndXJhY2nDs24gZGVsIG1hcGEgc2Vyw6EgaW5jbHVpZGEgZW4gZWwgYXJjaGl2byBKc29uLiBTaSB1dGlsaXR6YXMga2VwbGVyLmdsIGVuIHR1IHByb3BpYSBhcHAgcHVlZGVzIGNvcGlhciBlc3RhIGNvbmZpZ3VyYWNpw7NuIHkgcGFzYXJsYSBhICAnLFxuICAgICAgICBzZWxlY3Rpb246XG4gICAgICAgICAgJ0V4cG9ydGFyIGxvcyBkYXRvcyBkZWwgbWFwYSB5IGxhIGNvbmZpZ3VyYWNpw7NuIGVuIHVuIHNvbG8gYXJjaGl2byBKc29uLiBQb3N0ZXJpb3JtZW50ZSBwdWVkZXMgYWJyaXIgZXN0ZSBtaXNtbyBtYXBhIGNhcmdhbmRvIGVzdGUgbWlzbW8gYXJjaGl2byBhIGtlcGxlci5nbC4nLFxuICAgICAgICBkaXNjbGFpbWVyOlxuICAgICAgICAgICcqIExhIGNvbmZpZ3VyYWNpw7NuIGRlbCBtYXBhIHNlIGNvbWJpbmEgY29uIGxvcyBjb25qdW50b3MgZGUgZGF0b3MgY2FyZ2Fkb3MuIOKAmGRhdGFJZOKAmSBzZSB1dGlsaXphIHBhcmEgdmluY3VsYXIgY2FwYXMsIGZpbHRyb3MgeSBzdWdlcmVuY2lhcyBhIHVuIGNvbmp1bnRvIGRlIGRhdG9zIGVzcGVjw61maWNvLiAnICtcbiAgICAgICAgICAnQ3VhbmRvIHBhc2VzIGVzdGEgY29uZmlndXJhY2nDs24gYSBhZGREYXRhVG9NYXAsIGFzZWd1cmEgcXVlIGVsIGlkZW50aWZpY2Fkb3IgZGVsIGNvbmp1bnRvIGRlIGRhdG9zIGNvaW5jaWRhIGNvbiBsb3Mg4oCYZGF0YUlk4oCZIGRlIGVzdGEgY29uZmlndXJhY2nDs24uJ1xuICAgICAgfVxuICAgIH0sXG4gICAgbG9hZGluZ0RpYWxvZzoge1xuICAgICAgbG9hZGluZzogJ0NhcmdhbmRvLi4uJ1xuICAgIH0sXG4gICAgbG9hZERhdGE6IHtcbiAgICAgIHVwbG9hZDogJ0NhcmdhciBhcmNoaXZvcycsXG4gICAgICBzdG9yYWdlOiAnQ2FyZ2FyIGRlc2RlIGFsbWFjZW5hZ2UnXG4gICAgfSxcbiAgICB0cmlwSW5mbzoge1xuICAgICAgdGl0bGU6ICdDb21vIGhhYmlsaXRhciBsYSBhbmltYWNpw7NuIGRlIHZpYWplJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ1BhcmEgYW5pbWFyIGxhIHJ1dGEsIGxvcyBkYXRvcyBnZW9KU09OIGhhbiBkZSBjb250ZW5lciBgTGluZVN0cmluZ2AgZW4gc3UgZ2VvbWV0csOtYSB5IGxhcyBjb29yZGVuYWRhcyBkZSBMaW5lU3RyaW5nIGRlYmVuIHRlbmVyIDQgZWxlbWVudG9zIGVuIGxvcyBmb3JtYXRzIGRlICcsXG4gICAgICBjb2RlOiAnIFtsb25naXR1ZGUsIGxhdGl0dWRlLCBhbHRpdHVkZSwgdGltZXN0YW1wXSAnLFxuICAgICAgZGVzY3JpcHRpb24yOlxuICAgICAgICAneSBlbCDDumx0aW1vIGVsZW1lbnRvIGRlYmUgc2VyIGxhIG1hcmNhIGRlbCB0aWVtcG8uIExvcyBmb3JtYXRvcyB2w6FsaWRvcyBwYXJhIGxhIG1hcmNhIGRlIHRpZW1wbyBpbmNsdXllbiBVbml4IGVuIHNlZ3VuZG9zIGNvbW8gYDE1NjQxODQzNjNgIG8gZW4gbWlsaXNlZ3VuZG9zIGNvbW8gYDE1NjQxODQzNjMwMDBgLicsXG4gICAgICBleGFtcGxlOiAnRWplbXBsbzonXG4gICAgfSxcbiAgICBpY29uSW5mbzoge1xuICAgICAgdGl0bGU6ICdDb21vIGRpYnVqYXIgw61jb25vcycsXG4gICAgICBkZXNjcmlwdGlvbjE6XG4gICAgICAgICdFbiB0dSBDU1YgY3JlYSB1bmEgY29sdW1uYSB5IHBvbiBlbCBub21icmUgZGVsIMOtY29ubyBxdWUgcXVpZXJlcyBkaWJ1amFyLiBQdWVkZXMgZGVqYXIgbGEgY2VsZGEgdmFjw61hIGN1YW5kbyBubyBxdWllcmFzIHF1ZSBzZSBtdWVzdHJlIHBhcmEgY2llcnRvcyBwdW50b3MuIEN1YW5kbyBsYSBjb2x1bW5hIHNlIGxsYW1hJyxcbiAgICAgIGNvZGU6ICfDrWNvbm8nLFxuICAgICAgZGVzY3JpcHRpb24yOiAnIGtlcGxlci5nbCBhdXRvbcOhdGljYW1lbnRlIGNyZWFyw6EgdW5hIGNhcGEgZGUgw61jb25vLicsXG4gICAgICBleGFtcGxlOiAnRWplbXBsbzonLFxuICAgICAgaWNvbnM6ICdJY29ub3MnXG4gICAgfSxcbiAgICBzdG9yYWdlTWFwVmlld2VyOiB7XG4gICAgICBsYXN0TW9kaWZpZWQ6ICfDmmx0aW1hIG1vZGlmaWNhY2nDs24gaGFjZSB7bGFzdFVwZGF0ZWR9JyxcbiAgICAgIGJhY2s6ICdBdHLDoXMnXG4gICAgfSxcbiAgICBvdmVyd3JpdGVNYXA6IHtcbiAgICAgIHRpdGxlOiAnR3VhcmRhbmRvIGVsIG1hcGEuLi4nLFxuICAgICAgYWxyZWFkeUV4aXN0czogJ2phIGV4aXN0ZSBlbiB7bWFwU2F2ZWR9LiBMbyBxdWllcmVzIHNvYnJlZXNjcml2aXI/J1xuICAgIH0sXG4gICAgbG9hZFN0b3JhZ2VNYXA6IHtcbiAgICAgIGJhY2s6ICdBdHLDoXMnLFxuICAgICAgZ29Ub1BhZ2U6ICdWZXMgYSBsYSBww6FnaW5hIHtkaXNwbGF5TmFtZX0gZGUgS2VwbGVyLmdsJyxcbiAgICAgIHN0b3JhZ2VNYXBzOiAnQWxtYW5jZW5hZ2UgLyBNYXBhcycsXG4gICAgICBub1NhdmVkTWFwczogJ05vIGhheSBuaW5nw7puIG1hcGEgZ3VhcmRhZG8gdG9kYXbDrWEnXG4gICAgfVxuICB9LFxuICBoZWFkZXI6IHtcbiAgICB2aXNpYmxlTGF5ZXJzOiAnQ2FwYXMgdmlzaWJsZXMnLFxuICAgIGxheWVyTGVnZW5kOiAnQ2FwYSBkZSBsZXllbmRhJ1xuICB9LFxuICBpbnRlcmFjdGlvbnM6IHtcbiAgICB0b29sdGlwOiAnU3VnZXJlbmNpYXMnLFxuICAgIGJydXNoOiAnUGluY2VsJyxcbiAgICBjb29yZGluYXRlOiAnQ29vcmRlbmFkYXMnLFxuICAgIGdlb2NvZGVyOiAnR2VvY29kaWZpY2Fkb3InXG4gIH0sXG4gIGxheWVyQmxlbmRpbmc6IHtcbiAgICB0aXRsZTogJ0NvbWJpbmFjacOzbiBkZSBjYXBhcycsXG4gICAgYWRkaXRpdmU6ICdhZGl0aXZhJyxcbiAgICBub3JtYWw6ICdub3JtYWwnLFxuICAgIHN1YnRyYWN0aXZlOiAnc3Vic3RyYWN0aXZhJ1xuICB9LFxuICBjb2x1bW5zOiB7XG4gICAgdGl0bGU6ICdDb2x1bW5hcycsXG4gICAgbGF0OiAnbGF0JyxcbiAgICBsbmc6ICdsb24nLFxuICAgIGFsdGl0dWRlOiAnYWx0dXJhJyxcbiAgICBpY29uOiAnw61jb25vJyxcbiAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgYXJjOiB7XG4gICAgICBsYXQwOiAnbGF0IG9yaWdlbicsXG4gICAgICBsbmcwOiAnbG5nIG9yaWdlbiAnLFxuICAgICAgbGF0MTogJ2xhdCBkZXN0aW5vJyxcbiAgICAgIGxuZzE6ICdsbmcgZGVzdGlubydcbiAgICB9LFxuICAgIGxpbmU6IHtcbiAgICAgIGFsdDA6ICdhbHR1cmEgb3JpZ2VuJyxcbiAgICAgIGFsdDE6ICdhbHR1cmEgZGVzdGlubydcbiAgICB9LFxuICAgIGdyaWQ6IHtcbiAgICAgIHdvcmxkVW5pdFNpemU6ICdUYW1hw7FvIGRlIGxhIG1hbGxhIChrbSknXG4gICAgfSxcbiAgICBoZXhhZ29uOiB7XG4gICAgICB3b3JsZFVuaXRTaXplOiAnUmFkaW8gZGUgaGV4w6Fnb25vIChrbSknXG4gICAgfSxcbiAgICBoZXhfaWQ6ICdpZCBoZXgnXG4gIH0sXG4gIGNvbG9yOiB7XG4gICAgY3VzdG9tUGFsZXR0ZTogJ1BhbGV0YSBwZXJzb25hbGl6YWRhJyxcbiAgICBzdGVwczogJ3Bhc29zJyxcbiAgICB0eXBlOiAndGlwbycsXG4gICAgcmV2ZXJzZWQ6ICdpbnZlcnRpZGEnXG4gIH0sXG4gIHNjYWxlOiB7XG4gICAgY29sb3JTY2FsZTogJ0VzY2FsYSBkZSBjb2xvcicsXG4gICAgc2l6ZVNjYWxlOiAnRXNjYWxhIGRlIG1lZGlkYXMnLFxuICAgIHN0cm9rZVNjYWxlOiAnRXNjYWxhIGRlIHRyYXpvJyxcbiAgICBzY2FsZTogJ0VzY2FsYSdcbiAgfSxcbiAgZmlsZVVwbG9hZGVyOiB7XG4gICAgbWVzc2FnZTogJ0FycmFzdHJhIHkgc3VlbHRhIGVsIGFyY2hpdm8gYXF1w60nLFxuICAgIGNocm9tZU1lc3NhZ2U6XG4gICAgICAnKnVzdWFyaW8gZGUgQ2hyb21lOiBsYSBtZWRpZGEgbcOheGltYSBzb24gMjUwbWIsIHNpIGRlYmVzIGNhcmdhciB1biBhcmNoaXZvIG3DoXMgZ3JhbmRlIHV0aWxpemEgU2FmYXJpJyxcbiAgICBkaXNjbGFpbWVyOlxuICAgICAgJyprZXBsZXIuZ2wgZXMgdW5hIGFwbGljYWNpw7NuIGFsIGxhZG8gY2xpZW50ZSBxdWUgbm8gdXRpbGl6YSBuaW5nw7puIHNlcnZpZG9yLiBMb3MgZGF0b3Mgc8OzbG8gZXhpc3RlbiBlbiB0dSBtw6FxdWluYS9uYXZlZ2Fkb3IuICcgK1xuICAgICAgJ05vIHNlIGVudmlhbiBkYXRvcyBuaSBtYXBhcyBhIG5pbmfDum4gc2Vydmlkb3IuJyxcbiAgICBjb25maWdVcGxvYWRNZXNzYWdlOlxuICAgICAgJ0NhcmdhciB7ZmlsZUZvcm1hdE5hbWVzfSBvIHVuIG1hcGEgZ3VhcmRhZG8gZW4gKipKc29uKiouIE3DoXMgaW5mb3JtYWNpw7NuIHNvYnJlIFsqKnN1cHBvcnRlZCBmaWxlIGZvcm1hdHMqKl0nLFxuICAgIGJyb3dzZUZpbGVzOiAnbmF2ZWdhIHBvciB0dXMgYXJjaGl2b3MnLFxuICAgIHVwbG9hZGluZzogJ0NhcmdhbmRvJyxcbiAgICBmaWxlTm90U3VwcG9ydGVkOiAnRWwgYXJjaGl2byB7ZXJyb3JGaWxlc30gbm8gZXMgY29tcGF0aWJsZS4nLFxuICAgIG9yOiAnbydcbiAgfSxcbiAgZ2VvY29kZXI6IHtcbiAgICB0aXRsZTogJ0ludHJvZHVjZSB1bmEgZGlyZWNjacOzbidcbiAgfSxcbiAgZmllbGRTZWxlY3Rvcjoge1xuICAgIGNsZWFyQWxsOiAnUXVpdGFyIHRvZG9zJyxcbiAgICBmb3JtYXR0aW5nOiAnRm9ybWF0bydcbiAgfSxcbiAgY29tcGFyZToge1xuICAgIG1vZGVMYWJlbDogJ01vZG8gQ29tcGFyYWNpw7NuJyxcbiAgICB0eXBlTGFiZWw6ICdUaXBvIGRlIENvbXBhcmFjacOzbicsXG4gICAgdHlwZXM6IHtcbiAgICAgIGFic29sdXRlOiAnQWJzb2x1dGEnLFxuICAgICAgcmVsYXRpdmU6ICdSZWxhdGl2YSdcbiAgICB9XG4gIH0sXG4gIG1hcFBvcG92ZXI6IHtcbiAgICBwcmltYXJ5OiAnUHJpbmNpcGFsJ1xuICB9LFxuICBkZW5zaXR5OiAnZGVuc2lkYWQnLFxuICAnQnVnIFJlcG9ydCc6ICdJbmZvcm1lIGRlIGVycm9yZXMnLFxuICAnVXNlciBHdWlkZSc6ICdHdcOtYSBkZSB1c3VhcmlvJyxcbiAgU2F2ZTogJ0d1YWRhcicsXG4gIFNoYXJlOiAnQ29tcGFydGlyJ1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFHQSxJQUFBQSxRQUFBLEdBQUFDLE9BQUE7QUFBbUMsU0FBQUMsUUFBQUMsQ0FBQSxFQUFBQyxDQUFBLFFBQUFDLENBQUEsR0FBQUMsTUFBQSxDQUFB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