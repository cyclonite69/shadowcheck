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
    weight: 'pes',
    label: 'etiqueta',
    fillColor: 'color fons',
    color: 'color',
    coverage: 'cobertura',
    strokeColor: 'color de traç',
    radius: 'radi',
    outline: 'outline',
    stroke: 'traç',
    density: 'densitat',
    height: 'alçada',
    sum: 'suma',
    pointCount: 'Recompte de Punts'
  },
  placeholder: {
    search: 'Cerca',
    selectField: 'Selecciona un camp',
    yAxis: 'Eix Y',
    selectType: 'Selecciona un Tipus',
    selectValue: 'Selecciona un Valor',
    enterValue: 'Entra un valor',
    empty: 'buit'
  },
  misc: {
    by: '',
    valuesIn: 'Valors a',
    valueEquals: 'Valor igual a',
    dataSource: 'Font de dades',
    brushRadius: 'Radi del pinzell (km)',
    empty: ' '
  },
  mapLayers: {
    title: 'Capes del mapa',
    label: 'Etiqueta',
    road: 'Carretera',
    border: 'Frontera',
    building: 'Edifici',
    water: 'Aigua',
    land: 'Terra',
    '3dBuilding': 'Edifici 3D',
    background: 'Fons'
  },
  panel: {
    text: {
      label: 'etiqueta',
      labelWithId: 'Etiqueta {labelId}',
      fontSize: 'Mida de la font',
      fontColor: 'Color de la font',
      textAnchor: 'Àncora del text',
      alignment: 'Alineació',
      addMoreLabel: 'Afegeix més etiquetes'
    }
  },
  sidebar: {
    panels: {
      layer: 'Capes',
      filter: 'Filtres',
      interaction: 'Interaccions',
      basemap: 'Mapa base'
    }
  },
  layer: {
    required: 'Requerit*',
    radius: 'Radi',
    color: 'Color',
    fillColor: 'Color fons',
    outline: 'Contorn',
    weight: 'Gruix',
    propertyBasedOn: '{property} basada en',
    coverage: 'Cobertura',
    stroke: 'Traç',
    strokeWidth: 'Amplada de traç',
    strokeColor: 'Color de traç',
    basic: 'Basic',
    trailLength: 'Longitud de pista',
    trailLengthDescription: 'Nombre de segons fins que desapareix el camí',
    newLayer: 'nova capa',
    elevationByDescription: "Si desactivat, l'alçada es basa en el recompte de punts",
    colorByDescription: 'Si desactivat, el color es basa en el recompte de punts',
    aggregateBy: '{field} agregat per',
    '3DModel': 'Model 3D',
    '3DModelOptions': 'Opcions del model 3D',
    type: {
      point: 'punt',
      arc: 'arc',
      line: 'línia',
      grid: 'malla',
      hexbin: 'hexbin',
      polygon: 'polígon',
      geojson: 'geojson',
      cluster: 'cluster',
      icon: 'icona',
      heatmap: 'heatmap',
      hexagon: 'hexàgon',
      hexagonid: 'H3',
      trip: 'viatge',
      s2: 'S2',
      '3d': '3D'
    },
    layerUpdateError: "S'ha produït un error durant l'actualització de la capa: {errorMessage}. Assegureu-vos que el format de les dades d’entrada sigui vàlid."
  },
  layerVisConfigs: {
    angle: 'Angle',
    strokeWidth: 'Amplada traç',
    strokeWidthRange: 'Rang amplada de traç',
    radius: 'Radi',
    fixedRadius: 'Radi fixe a mesurar',
    fixedRadiusDescription: 'Ajusta el radi al radi absolut en metres, p.ex 5 a 5 metres',
    radiusRange: 'Rang de radi',
    clusterRadius: 'Radi Cluster en Pixels',
    radiusRangePixels: 'Rang del radi en pixels',
    billboard: 'Mode de cartellera',
    billboardDescription: 'Orientar la geometria cap a la càmera',
    fadeTrail: 'Rastre de desvaniment',
    opacity: 'Opacitat',
    coverage: 'Cobertura',
    outline: 'Outline',
    colorRange: 'Rang de color',
    stroke: 'Traç',
    strokeColor: 'Color de traç',
    strokeColorRange: 'Rang de color de traç',
    targetColor: 'Color destí',
    colorAggregation: 'Agregació de color',
    heightAggregation: 'Agregació alçada',
    resolutionRange: 'Rang de resolució',
    sizeScale: 'Mida escala',
    worldUnitSize: 'Mida de la unitat mundial',
    elevationScale: 'Escala elevació',
    enableElevationZoomFactor: 'Utilitzeu el factor de zoom d’elevació',
    enableElevationZoomFactorDescription: "'Ajusteu l'alçada / elevació en funció del factor de zoom actual",
    enableHeightZoomFactor: 'Utilitzeu el factor de zoom d’alçada',
    heightScale: 'Escala alçada',
    coverageRange: 'Rang ed cobertura',
    highPrecisionRendering: 'Representació alta precisió',
    highPrecisionRenderingDescription: 'La precisió alta tindrà rendiment més baix',
    height: 'Alçada',
    heightDescription: 'Fes clic al botó a dalt a la dreta del mapa per canviar a vista 3D',
    fill: 'Omple',
    enablePolygonHeight: 'Activa alçada del polígon',
    showWireframe: 'Mostra Wireframe',
    weightIntensity: 'Intensitat de pes',
    zoomScale: 'Escala de zoom',
    heightRange: 'Rang alçada',
    heightMultiplier: "Multiplicador d'alçada",
    fixedHeight: 'Alçada fixa',
    fixedHeightDescription: "Utilitzeu l'alçada sense modificacions"
  },
  layerManager: {
    addData: 'Afegeix Dades',
    addLayer: 'Afegeix Capes',
    layerBlending: 'Combinar capes'
  },
  mapManager: {
    mapStyle: 'Estil de mapa',
    addMapStyle: 'Afegeix estils de mapa',
    '3dBuildingColor': 'Color edifici 3D',
    backgroundColor: 'Color de fons'
  },
  layerConfiguration: {
    defaultDescription: 'Calcula {property} segons el camp seleccionat',
    howTo: 'How to'
  },
  filterManager: {
    addFilter: 'Afegeix Filtre'
  },
  datasetTitle: {
    showDataTable: 'Mostra taula de dades',
    removeDataset: 'Elimina conjunt de dades'
  },
  datasetInfo: {
    rowCount: '{rowCount} files'
  },
  tooltip: {
    hideLayer: 'oculta la capa',
    showLayer: 'mostra la capa',
    hideFeature: "Amaga l'objecte",
    showFeature: "Mostra l'objecte",
    hide: 'amaga',
    show: 'mostra',
    removeLayer: 'Elimina capa',
    resetAfterError: 'Intenteu habilitar la capa després dun error',
    layerSettings: 'Configuració de capa',
    closePanel: 'Tanca panel actual',
    switchToDualView: 'Canvia a la vista de mapa dual',
    showLegend: 'mostra llegenda',
    disable3DMap: 'Desactiva mapa 3D',
    DrawOnMap: 'Dibuixa al mapa',
    selectLocale: 'Selecciona configuració regional',
    showAiAssistantPanel: 'Mostra el tauler de AI Assistant',
    hideAiAssistantPanel: 'Oculta el tauler de AI Assistant',
    hideLayerPanel: 'Oculta el tauler de capes',
    showLayerPanel: 'Mostra el tauler de capes',
    moveToTop: 'Desplaça a dalt de tot de les capes de dades',
    selectBaseMapStyle: 'Selecciona estil de mapa base',
    "delete": 'Esborra',
    timePlayback: 'Reproducció de temps',
    cloudStorage: 'Emmagatzematge al núvol',
    '3DMap': 'Mapa 3D',
    animationByWindow: 'Finestra Temporal Mòbil',
    animationByIncremental: 'Finestra Temporal Incremental',
    speed: 'velocitat',
    play: 'iniciar',
    pause: 'pausar',
    reset: 'reiniciar'
  },
  toolbar: _objectSpread({
    exportImage: 'Exporta imatge',
    exportData: 'Exporta dades',
    exportMap: 'Exporta mapa',
    shareMapURL: 'Comparteix URL del mapa',
    saveMap: 'Desa mapa',
    select: 'selecciona',
    polygon: 'polígon',
    rectangle: 'rectangle',
    hide: 'amaga',
    show: 'mostra'
  }, _locales.LOCALES),
  modal: {
    title: {
      deleteDataset: 'Esborra conjunt de dades',
      addDataToMap: 'Afegeix dades al mapa',
      exportImage: 'Exporta imatge',
      exportData: 'Exporta dades',
      exportMap: 'Exporta mapa',
      addCustomMapboxStyle: 'Afegeix estil Mapbox propi',
      saveMap: 'Desa mapa',
      shareURL: 'Comparteix URL'
    },
    button: {
      "delete": 'Esborra',
      download: 'Descarrega',
      "export": 'Exporta',
      addStyle: 'Afegeix estil',
      save: 'Desa',
      defaultCancel: 'Cancel·la',
      defaultConfirm: 'Confirma'
    },
    exportImage: {
      ratioTitle: 'Ràtio',
      ratioDescription: 'Escull ràtio per diversos usos.',
      ratioOriginalScreen: 'Pantalla original',
      ratioCustom: 'Personalitzat',
      ratio4_3: '4:3',
      ratio16_9: '16:9',
      resolutionTitle: 'Resolució',
      resolutionDescription: 'Alta resolució és millor per a les impressions.',
      mapLegendTitle: 'Llegenda del mapa',
      mapLegendAdd: 'Afegir llegenda al mapa'
    },
    exportData: {
      datasetTitle: 'Conjunt de dades',
      datasetSubtitle: 'Escull els conjunts de dades que vols exportar',
      allDatasets: 'Tots',
      dataTypeTitle: 'Tipus de dades',
      dataTypeSubtitle: 'Escull els tipus de dades que vols exportar',
      filterDataTitle: 'Filtra dades',
      filterDataSubtitle: 'Pots escollir exportar les dades originals o les filtrades',
      filteredData: 'Dades filtrades',
      unfilteredData: 'Dades sense filtrar',
      fileCount: '{fileCount} Arxius',
      rowCount: '{rowCount} Files'
    },
    deleteData: {
      warning: "estàs a punt d'esborrar aquest conjunt de dades. Afectarà {length} capes"
    },
    addStyle: {
      publishTitle: "2. Publica el teu estil a Mapbox o proporciona el token d'accés",
      publishSubtitle1: 'Pots crear el teu propi estil de mapa a',
      publishSubtitle2: 'i',
      publishSubtitle3: 'publicar',
      publishSubtitle4: 'ho.',
      publishSubtitle5: 'Per utilitzar un estil privat, enganxa el teu',
      publishSubtitle6: "token d'accés",
      publishSubtitle7: 'aquí. *kepler.gl és una aplicació client, les dades romanen al teu navegador..',
      exampleToken: 'p.ex. pk.abcdefg.xxxxxx',
      pasteTitle: "1. Enganxa la URL de l'estil",
      pasteSubtitle1: 'Què és un',
      pasteSubtitle2: "URL de l'estil",
      namingTitle: '3. Posa nom al teu estil'
    },
    shareMap: {
      shareUriTitle: 'Comparteix URL del mapa',
      shareUriSubtitle: 'Genera una URL del mapa per compartir amb altri',
      cloudTitle: 'Emmagatzematge al núvol',
      cloudSubtitle: 'Accedeix i carrega dades de mapa al teu emmagatzematge al núvol personal',
      shareDisclaimer: 'kepler.gl desarà les dades del mapa al teu emmagatzematge al núvol personal, només qui tingui la URL podrà accedir al mapa i a les dades . ' + "Pots editar/esborrar l'arxiu de dades en el teu compte al núvol en qualsevol moment.",
      gotoPage: 'Ves a la pàgina de {currentProvider} de Kepler.gl'
    },
    statusPanel: {
      mapUploading: 'Carregar un mapa',
      error: 'Error'
    },
    saveMap: {
      title: 'Emmagatzematge al núvol',
      subtitle: 'Accedeix per desar el mapa al teu emmagatzematge al núvol'
    },
    exportMap: {
      formatTitle: 'Format de mapa',
      formatSubtitle: 'Escull el format amb què vols exportar el teu mapa',
      html: {
        selection: 'Exporta el teu mapa com un arxiu HTML interactiu.',
        tokenTitle: "Token d'accés de Mapbox",
        tokenSubtitle: "Utilitza el teu token d'accés de Mapbox a l'arxiu HTML (opcional)",
        tokenPlaceholder: "Enganxa el teu token d'accés a Mapbox",
        tokenMisuseWarning: '* Si no proporciones el teu propi token, el mapa podria fallar en qualsevol moment quan reemplacem el nostre token per evitar abusos. ',
        tokenDisclaimer: 'Pots canviar el toke de Mapbox més endavant fent servir aquestes instruccions: ',
        tokenUpdate: 'Com actualitzar un token preexistent.',
        modeTitle: 'Mode mapa',
        modeSubtitle1: 'Selecciona mode app. Més ',
        modeSubtitle2: 'informació',
        modeDescription: 'Permet als usuaris {mode} el mapa',
        read: 'llegir',
        edit: 'editar'
      },
      json: {
        configTitle: 'Configuració del mapa',
        configDisclaimer: "La configuració del mapa s'inclourà a l'arxiu Json. Si utilitzes kepler.gl a la teva pròpia app pots copiar aquesta configuració i passar-la a  ",
        selection: 'Exporta les dades del mapa i la configuració en un sol arxiu Json. Més endavant pots obrir aquest mateix mapa carregant aquest mateix arxiu a kepler.gl.',
        disclaimer: "* La configuració del mapa es combina amb els conjunts de dades carregats. ‘dataId’ s'utilitza per lligar capes, filtres i suggeriments a un conjunt de dades específic. " + "Quan passis aquesta configuració a addDataToMap, assegura que l'identificador del conjunt de dades coincideixi amb els ‘dataId’ d'aquesta configuració."
      }
    },
    loadingDialog: {
      loading: 'Carregant...'
    },
    loadData: {
      upload: 'Carregar arxius',
      storage: "Carregar des d'emmagatzematge"
    },
    tripInfo: {
      title: 'Com habilitar l’animació de viatge',
      description1: 'Per animar la ruta, les dades geoJSON han de contenir `LineString` en la seva geometria i les coordenades de LineString han de tenir 4 elements en els formats de ',
      code: ' [longitude, latitude, altitude, timestamp] ',
      description2: 'i el darrer element ha de ser la marca de temps. Els formats vàlids per a la marca de temps inclouen Unix en segons com `1564184363` o en milisegons com `1564184363000`.',
      example: 'Exemple:'
    },
    iconInfo: {
      title: 'Com dibuixar icones',
      description1: "En el teu CSV crea una columna i posa-hi el nom de la icona que vols dibuixar. Pots deixar la cel·la buida quan no vulguis que es mostri per a certs punts. Quan la columna s'anomena",
      code: 'icon',
      description2: " kepler.gl automàticament crearà una capa d'icona.",
      example: 'Exemple:',
      icons: 'Icones'
    },
    storageMapViewer: {
      lastModified: 'Darrera modificació fa {lastUpdated}',
      back: 'Enrere'
    },
    overwriteMap: {
      title: 'Desant mapa...',
      alreadyExists: 'ja existeix a {mapSaved}. El vols sobreescriure?'
    },
    loadStorageMap: {
      back: 'Enrere',
      goToPage: 'Ves a la pàgina {displayName} de Kepler.gl',
      storageMaps: 'Emmagatzematge / Mapes',
      noSavedMaps: 'Cap mapa desat encara'
    }
  },
  header: {
    visibleLayers: 'Capes visibles',
    layerLegend: 'Llegenda de capes'
  },
  interactions: {
    tooltip: 'Suggeriment',
    brush: 'Pinzell',
    coordinate: 'Coordenades',
    geocoder: 'Geocodificador'
  },
  layerBlending: {
    title: 'Combinació de capes',
    additive: 'additiva',
    normal: 'normal',
    subtractive: 'substractiva'
  },
  columns: {
    title: 'Columnes',
    lat: 'lat',
    lng: 'lon',
    altitude: 'alçada',
    icon: 'icona',
    geojson: 'geojson',
    arc: {
      lat0: 'lat origen',
      lng0: 'lng origen ',
      lat1: 'lat destinació',
      lng1: 'lng destinació'
    },
    line: {
      alt0: 'alçada origen',
      alt1: 'alçada destinació'
    },
    grid: {
      worldUnitSize: 'Mida de malla (km)'
    },
    hexagon: {
      worldUnitSize: "Radi d'hexàgon (km)"
    },
    hex_id: 'id hex'
  },
  color: {
    customPalette: 'Paleta personalitzada',
    steps: 'intervals',
    type: 'tipus',
    reversed: 'invertida'
  },
  scale: {
    colorScale: 'Escala de color',
    sizeScale: 'Escala de mides',
    strokeScale: 'Escala de traç',
    scale: 'Escala'
  },
  fileUploader: {
    message: "Arrossega i deixa anar l'arxiu aquí",
    chromeMessage: '*usuari de Chrome: la mida màxima són 250mb, si has de carrgar un arxiu més gran fes servir Safari',
    disclaimer: '*kepler.gl és una aplicació a la banda client que no es recolza en cap servidor. Les dades només existeixen a la teva màquina/navegador. ' + "No s'envien dades ni mapes a cap servidor.",
    configUploadMessage: 'Carrega {fileFormatNames} o un mapa desat en **Json**. Més informació sobre [**supported file formats**]',
    browseFiles: 'navega pels teus arxius',
    uploading: 'Carregant',
    fileNotSupported: "L'arxiu {errorFiles} no és compatible.",
    or: 'o'
  },
  geocoder: {
    title: 'Introdueix una adreça'
  },
  fieldSelector: {
    clearAll: 'Treure tots',
    formatting: 'Format'
  },
  compare: {
    modeLabel: 'Mode Comparació',
    typeLabel: 'Tipus de Comparació',
    types: {
      absolute: 'Absoluta',
      relative: 'Relativa'
    }
  },
  mapPopover: {
    primary: 'Principal'
  },
  density: 'densitat',
  'Bug Report': "Informe d'errors",
  'User Guide': "Guia d'usuari",
  Save: 'Desa',
  Share: 'Comparteix'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsImNvdmVyYWdlIiwic3Ryb2tlQ29sb3IiLCJyYWRpdXMiLCJvdXRsaW5lIiwic3Ryb2tlIiwiZGVuc2l0eSIsImhlaWdodCIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJiYWNrZ3JvdW5kIiwicGFuZWwiLCJ0ZXh0IiwibGFiZWxXaXRoSWQiLCJmb250U2l6ZSIsImZvbnRDb2xvciIsInRleHRBbmNob3IiLCJhbGlnbm1lbnQiLCJhZGRNb3JlTGFiZWwiLCJzaWRlYmFyIiwicGFuZWxzIiwibGF5ZXIiLCJpbnRlcmFjdGlvbiIsImJhc2VtYXAiLCJyZXF1aXJlZCIsInByb3BlcnR5QmFzZWRPbiIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsImFuZ2xlIiwic3Ryb2tlV2lkdGhSYW5nZSIsImZpeGVkUmFkaXVzIiwiZml4ZWRSYWRpdXNEZXNjcmlwdGlvbiIsInJhZGl1c1JhbmdlIiwiY2x1c3RlclJhZGl1cyIsInJhZGl1c1JhbmdlUGl4ZWxzIiwiYmlsbGJvYXJkIiwiYmlsbGJvYXJkRGVzY3JpcHRpb24iLCJmYWRlVHJhaWwiLCJvcGFjaXR5IiwiY29sb3JSYW5nZSIsInN0cm9rZUNvbG9yUmFuZ2UiLCJ0YXJnZXRDb2xvciIsImNvbG9yQWdncmVnYXRpb24iLCJoZWlnaHRBZ2dyZWdhdGlvbiIsInJlc29sdXRpb25SYW5nZSIsInNpemVTY2FsZSIsIndvcmxkVW5pdFNpemUiLCJlbGV2YXRpb25TY2FsZSIsImVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3IiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yRGVzY3JpcHRpb24iLCJlbmFibGVIZWlnaHRab29tRmFjdG9yIiwiaGVpZ2h0U2NhbGUiLCJjb3ZlcmFnZVJhbmdlIiwiaGlnaFByZWNpc2lvblJlbmRlcmluZyIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbiIsImhlaWdodERlc2NyaXB0aW9uIiwiZmlsbCIsImVuYWJsZVBvbHlnb25IZWlnaHQiLCJzaG93V2lyZWZyYW1lIiwid2VpZ2h0SW50ZW5zaXR5Iiwiem9vbVNjYWxlIiwiaGVpZ2h0UmFuZ2UiLCJoZWlnaHRNdWx0aXBsaWVyIiwiZml4ZWRIZWlnaHQiLCJmaXhlZEhlaWdodERlc2NyaXB0aW9uIiwibGF5ZXJNYW5hZ2VyIiwiYWRkRGF0YSIsImFkZExheWVyIiwibGF5ZXJCbGVuZGluZyIsIm1hcE1hbmFnZXIiLCJtYXBTdHlsZSIsImFkZE1hcFN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwibGF5ZXJDb25maWd1cmF0aW9uIiwiZGVmYXVsdERlc2NyaXB0aW9uIiwiaG93VG8iLCJmaWx0ZXJNYW5hZ2VyIiwiYWRkRmlsdGVyIiwiZGF0YXNldFRpdGxlIiwic2hvd0RhdGFUYWJsZSIsInJlbW92ZURhdGFzZXQiLCJkYXRhc2V0SW5mbyIsInJvd0NvdW50IiwidG9vbHRpcCIsImhpZGVMYXllciIsInNob3dMYXllciIsImhpZGVGZWF0dXJlIiwic2hvd0ZlYXR1cmUiLCJoaWRlIiwic2hvdyIsInJlbW92ZUxheWVyIiwicmVzZXRBZnRlckVycm9yIiwibGF5ZXJTZXR0aW5ncyIsImNsb3NlUGFuZWwiLCJzd2l0Y2hUb0R1YWxWaWV3Iiwic2hvd0xlZ2VuZCIsImRpc2FibGUzRE1hcCIsIkRyYXdPbk1hcCIsInNlbGVjdExvY2FsZSIsInNob3dBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUFpQXNzaXN0YW50UGFuZWwiLCJoaWRlTGF5ZXJQYW5lbCIsInNob3dMYXllclBhbmVsIiwibW92ZVRvVG9wIiwic2VsZWN0QmFzZU1hcFN0eWxlIiwidGltZVBsYXliYWNrIiwiY2xvdWRTdG9yYWdlIiwiYW5pbWF0aW9uQnlXaW5kb3ciLCJhbmltYXRpb25CeUluY3JlbWVudGFsIiwic3BlZWQiLCJwbGF5IiwicGF1c2UiLCJyZXNldCIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImdlb2NvZGVyIiwiYWRkaXRpdmUiLCJub3JtYWwiLCJzdWJ0cmFjdGl2ZSIsImNvbHVtbnMiLCJsYXQiLCJsbmciLCJhbHRpdHVkZSIsImxhdDAiLCJsbmcwIiwibGF0MSIsImxuZzEiLCJhbHQwIiwiYWx0MSIsImhleF9pZCIsImN1c3RvbVBhbGV0dGUiLCJzdGVwcyIsInJldmVyc2VkIiwic2NhbGUiLCJjb2xvclNjYWxlIiwic3Ryb2tlU2NhbGUiLCJmaWxlVXBsb2FkZXIiLCJtZXNzYWdlIiwiY2hyb21lTWVzc2FnZSIsImNvbmZpZ1VwbG9hZE1lc3NhZ2UiLCJicm93c2VGaWxlcyIsInVwbG9hZGluZyIsImZpbGVOb3RTdXBwb3J0ZWQiLCJvciIsImZpZWxkU2VsZWN0b3IiLCJjbGVhckFsbCIsImZvcm1hdHRpbmciLCJjb21wYXJlIiwibW9kZUxhYmVsIiwidHlwZUxhYmVsIiwidHlwZXMiLCJhYnNvbHV0ZSIsInJlbGF0aXZlIiwibWFwUG9wb3ZlciIsInByaW1hcnkiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbG9jYWxpemF0aW9uL3NyYy90cmFuc2xhdGlvbnMvY2EudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuLy8gQ29weXJpZ2h0IGNvbnRyaWJ1dG9ycyB0byB0aGUga2VwbGVyLmdsIHByb2plY3RcblxuaW1wb3J0IHtMT0NBTEVTfSBmcm9tICcuLi9sb2NhbGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wZXJ0eToge1xuICAgIHdlaWdodDogJ3BlcycsXG4gICAgbGFiZWw6ICdldGlxdWV0YScsXG4gICAgZmlsbENvbG9yOiAnY29sb3IgZm9ucycsXG4gICAgY29sb3I6ICdjb2xvcicsXG4gICAgY292ZXJhZ2U6ICdjb2JlcnR1cmEnLFxuICAgIHN0cm9rZUNvbG9yOiAnY29sb3IgZGUgdHJhw6cnLFxuICAgIHJhZGl1czogJ3JhZGknLFxuICAgIG91dGxpbmU6ICdvdXRsaW5lJyxcbiAgICBzdHJva2U6ICd0cmHDpycsXG4gICAgZGVuc2l0eTogJ2RlbnNpdGF0JyxcbiAgICBoZWlnaHQ6ICdhbMOnYWRhJyxcbiAgICBzdW06ICdzdW1hJyxcbiAgICBwb2ludENvdW50OiAnUmVjb21wdGUgZGUgUHVudHMnXG4gIH0sXG4gIHBsYWNlaG9sZGVyOiB7XG4gICAgc2VhcmNoOiAnQ2VyY2EnLFxuICAgIHNlbGVjdEZpZWxkOiAnU2VsZWNjaW9uYSB1biBjYW1wJyxcbiAgICB5QXhpczogJ0VpeCBZJyxcbiAgICBzZWxlY3RUeXBlOiAnU2VsZWNjaW9uYSB1biBUaXB1cycsXG4gICAgc2VsZWN0VmFsdWU6ICdTZWxlY2Npb25hIHVuIFZhbG9yJyxcbiAgICBlbnRlclZhbHVlOiAnRW50cmEgdW4gdmFsb3InLFxuICAgIGVtcHR5OiAnYnVpdCdcbiAgfSxcbiAgbWlzYzoge1xuICAgIGJ5OiAnJyxcbiAgICB2YWx1ZXNJbjogJ1ZhbG9ycyBhJyxcbiAgICB2YWx1ZUVxdWFsczogJ1ZhbG9yIGlndWFsIGEnLFxuICAgIGRhdGFTb3VyY2U6ICdGb250IGRlIGRhZGVzJyxcbiAgICBicnVzaFJhZGl1czogJ1JhZGkgZGVsIHBpbnplbGwgKGttKScsXG4gICAgZW1wdHk6ICcgJ1xuICB9LFxuICBtYXBMYXllcnM6IHtcbiAgICB0aXRsZTogJ0NhcGVzIGRlbCBtYXBhJyxcbiAgICBsYWJlbDogJ0V0aXF1ZXRhJyxcbiAgICByb2FkOiAnQ2FycmV0ZXJhJyxcbiAgICBib3JkZXI6ICdGcm9udGVyYScsXG4gICAgYnVpbGRpbmc6ICdFZGlmaWNpJyxcbiAgICB3YXRlcjogJ0FpZ3VhJyxcbiAgICBsYW5kOiAnVGVycmEnLFxuICAgICczZEJ1aWxkaW5nJzogJ0VkaWZpY2kgM0QnLFxuICAgIGJhY2tncm91bmQ6ICdGb25zJ1xuICB9LFxuICBwYW5lbDoge1xuICAgIHRleHQ6IHtcbiAgICAgIGxhYmVsOiAnZXRpcXVldGEnLFxuICAgICAgbGFiZWxXaXRoSWQ6ICdFdGlxdWV0YSB7bGFiZWxJZH0nLFxuICAgICAgZm9udFNpemU6ICdNaWRhIGRlIGxhIGZvbnQnLFxuICAgICAgZm9udENvbG9yOiAnQ29sb3IgZGUgbGEgZm9udCcsXG4gICAgICB0ZXh0QW5jaG9yOiAnw4BuY29yYSBkZWwgdGV4dCcsXG4gICAgICBhbGlnbm1lbnQ6ICdBbGluZWFjacOzJyxcbiAgICAgIGFkZE1vcmVMYWJlbDogJ0FmZWdlaXggbcOpcyBldGlxdWV0ZXMnXG4gICAgfVxuICB9LFxuICBzaWRlYmFyOiB7XG4gICAgcGFuZWxzOiB7XG4gICAgICBsYXllcjogJ0NhcGVzJyxcbiAgICAgIGZpbHRlcjogJ0ZpbHRyZXMnLFxuICAgICAgaW50ZXJhY3Rpb246ICdJbnRlcmFjY2lvbnMnLFxuICAgICAgYmFzZW1hcDogJ01hcGEgYmFzZSdcbiAgICB9XG4gIH0sXG4gIGxheWVyOiB7XG4gICAgcmVxdWlyZWQ6ICdSZXF1ZXJpdConLFxuICAgIHJhZGl1czogJ1JhZGknLFxuICAgIGNvbG9yOiAnQ29sb3InLFxuICAgIGZpbGxDb2xvcjogJ0NvbG9yIGZvbnMnLFxuICAgIG91dGxpbmU6ICdDb250b3JuJyxcbiAgICB3ZWlnaHQ6ICdHcnVpeCcsXG4gICAgcHJvcGVydHlCYXNlZE9uOiAne3Byb3BlcnR5fSBiYXNhZGEgZW4nLFxuICAgIGNvdmVyYWdlOiAnQ29iZXJ0dXJhJyxcbiAgICBzdHJva2U6ICdUcmHDpycsXG4gICAgc3Ryb2tlV2lkdGg6ICdBbXBsYWRhIGRlIHRyYcOnJyxcbiAgICBzdHJva2VDb2xvcjogJ0NvbG9yIGRlIHRyYcOnJyxcbiAgICBiYXNpYzogJ0Jhc2ljJyxcbiAgICB0cmFpbExlbmd0aDogJ0xvbmdpdHVkIGRlIHBpc3RhJyxcbiAgICB0cmFpbExlbmd0aERlc2NyaXB0aW9uOiAnTm9tYnJlIGRlIHNlZ29ucyBmaW5zIHF1ZSBkZXNhcGFyZWl4IGVsIGNhbcOtJyxcbiAgICBuZXdMYXllcjogJ25vdmEgY2FwYScsXG4gICAgZWxldmF0aW9uQnlEZXNjcmlwdGlvbjogXCJTaSBkZXNhY3RpdmF0LCBsJ2Fsw6dhZGEgZXMgYmFzYSBlbiBlbCByZWNvbXB0ZSBkZSBwdW50c1wiLFxuICAgIGNvbG9yQnlEZXNjcmlwdGlvbjogJ1NpIGRlc2FjdGl2YXQsIGVsIGNvbG9yIGVzIGJhc2EgZW4gZWwgcmVjb21wdGUgZGUgcHVudHMnLFxuICAgIGFnZ3JlZ2F0ZUJ5OiAne2ZpZWxkfSBhZ3JlZ2F0IHBlcicsXG4gICAgJzNETW9kZWwnOiAnTW9kZWwgM0QnLFxuICAgICczRE1vZGVsT3B0aW9ucyc6ICdPcGNpb25zIGRlbCBtb2RlbCAzRCcsXG4gICAgdHlwZToge1xuICAgICAgcG9pbnQ6ICdwdW50JyxcbiAgICAgIGFyYzogJ2FyYycsXG4gICAgICBsaW5lOiAnbMOtbmlhJyxcbiAgICAgIGdyaWQ6ICdtYWxsYScsXG4gICAgICBoZXhiaW46ICdoZXhiaW4nLFxuICAgICAgcG9seWdvbjogJ3BvbMOtZ29uJyxcbiAgICAgIGdlb2pzb246ICdnZW9qc29uJyxcbiAgICAgIGNsdXN0ZXI6ICdjbHVzdGVyJyxcbiAgICAgIGljb246ICdpY29uYScsXG4gICAgICBoZWF0bWFwOiAnaGVhdG1hcCcsXG4gICAgICBoZXhhZ29uOiAnaGV4w6Bnb24nLFxuICAgICAgaGV4YWdvbmlkOiAnSDMnLFxuICAgICAgdHJpcDogJ3ZpYXRnZScsXG4gICAgICBzMjogJ1MyJyxcbiAgICAgICczZCc6ICczRCdcbiAgICB9LFxuICAgIGxheWVyVXBkYXRlRXJyb3I6XG4gICAgICBcIlMnaGEgcHJvZHXDr3QgdW4gZXJyb3IgZHVyYW50IGwnYWN0dWFsaXR6YWNpw7MgZGUgbGEgY2FwYToge2Vycm9yTWVzc2FnZX0uIEFzc2VndXJldS12b3MgcXVlIGVsIGZvcm1hdCBkZSBsZXMgZGFkZXMgZOKAmWVudHJhZGEgc2lndWkgdsOgbGlkLlwiXG4gIH0sXG4gIGxheWVyVmlzQ29uZmlnczoge1xuICAgIGFuZ2xlOiAnQW5nbGUnLFxuICAgIHN0cm9rZVdpZHRoOiAnQW1wbGFkYSB0cmHDpycsXG4gICAgc3Ryb2tlV2lkdGhSYW5nZTogJ1JhbmcgYW1wbGFkYSBkZSB0cmHDpycsXG4gICAgcmFkaXVzOiAnUmFkaScsXG4gICAgZml4ZWRSYWRpdXM6ICdSYWRpIGZpeGUgYSBtZXN1cmFyJyxcbiAgICBmaXhlZFJhZGl1c0Rlc2NyaXB0aW9uOiAnQWp1c3RhIGVsIHJhZGkgYWwgcmFkaSBhYnNvbHV0IGVuIG1ldHJlcywgcC5leCA1IGEgNSBtZXRyZXMnLFxuICAgIHJhZGl1c1JhbmdlOiAnUmFuZyBkZSByYWRpJyxcbiAgICBjbHVzdGVyUmFkaXVzOiAnUmFkaSBDbHVzdGVyIGVuIFBpeGVscycsXG4gICAgcmFkaXVzUmFuZ2VQaXhlbHM6ICdSYW5nIGRlbCByYWRpIGVuIHBpeGVscycsXG4gICAgYmlsbGJvYXJkOiAnTW9kZSBkZSBjYXJ0ZWxsZXJhJyxcbiAgICBiaWxsYm9hcmREZXNjcmlwdGlvbjogJ09yaWVudGFyIGxhIGdlb21ldHJpYSBjYXAgYSBsYSBjw6BtZXJhJyxcbiAgICBmYWRlVHJhaWw6ICdSYXN0cmUgZGUgZGVzdmFuaW1lbnQnLFxuICAgIG9wYWNpdHk6ICdPcGFjaXRhdCcsXG4gICAgY292ZXJhZ2U6ICdDb2JlcnR1cmEnLFxuICAgIG91dGxpbmU6ICdPdXRsaW5lJyxcbiAgICBjb2xvclJhbmdlOiAnUmFuZyBkZSBjb2xvcicsXG4gICAgc3Ryb2tlOiAnVHJhw6cnLFxuICAgIHN0cm9rZUNvbG9yOiAnQ29sb3IgZGUgdHJhw6cnLFxuICAgIHN0cm9rZUNvbG9yUmFuZ2U6ICdSYW5nIGRlIGNvbG9yIGRlIHRyYcOnJyxcbiAgICB0YXJnZXRDb2xvcjogJ0NvbG9yIGRlc3TDrScsXG4gICAgY29sb3JBZ2dyZWdhdGlvbjogJ0FncmVnYWNpw7MgZGUgY29sb3InLFxuICAgIGhlaWdodEFnZ3JlZ2F0aW9uOiAnQWdyZWdhY2nDsyBhbMOnYWRhJyxcbiAgICByZXNvbHV0aW9uUmFuZ2U6ICdSYW5nIGRlIHJlc29sdWNpw7MnLFxuICAgIHNpemVTY2FsZTogJ01pZGEgZXNjYWxhJyxcbiAgICB3b3JsZFVuaXRTaXplOiAnTWlkYSBkZSBsYSB1bml0YXQgbXVuZGlhbCcsXG4gICAgZWxldmF0aW9uU2NhbGU6ICdFc2NhbGEgZWxldmFjacOzJyxcbiAgICBlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yOiAnVXRpbGl0emV1IGVsIGZhY3RvciBkZSB6b29tIGTigJllbGV2YWNpw7MnLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbjpcbiAgICAgIFwiJ0FqdXN0ZXUgbCdhbMOnYWRhIC8gZWxldmFjacOzIGVuIGZ1bmNpw7MgZGVsIGZhY3RvciBkZSB6b29tIGFjdHVhbFwiLFxuICAgIGVuYWJsZUhlaWdodFpvb21GYWN0b3I6ICdVdGlsaXR6ZXUgZWwgZmFjdG9yIGRlIHpvb20gZOKAmWFsw6dhZGEnLFxuICAgIGhlaWdodFNjYWxlOiAnRXNjYWxhIGFsw6dhZGEnLFxuICAgIGNvdmVyYWdlUmFuZ2U6ICdSYW5nIGVkIGNvYmVydHVyYScsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZzogJ1JlcHJlc2VudGFjacOzIGFsdGEgcHJlY2lzacOzJyxcbiAgICBoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb246ICdMYSBwcmVjaXNpw7MgYWx0YSB0aW5kcsOgIHJlbmRpbWVudCBtw6lzIGJhaXgnLFxuICAgIGhlaWdodDogJ0Fsw6dhZGEnLFxuICAgIGhlaWdodERlc2NyaXB0aW9uOiAnRmVzIGNsaWMgYWwgYm90w7MgYSBkYWx0IGEgbGEgZHJldGEgZGVsIG1hcGEgcGVyIGNhbnZpYXIgYSB2aXN0YSAzRCcsXG4gICAgZmlsbDogJ09tcGxlJyxcbiAgICBlbmFibGVQb2x5Z29uSGVpZ2h0OiAnQWN0aXZhIGFsw6dhZGEgZGVsIHBvbMOtZ29uJyxcbiAgICBzaG93V2lyZWZyYW1lOiAnTW9zdHJhIFdpcmVmcmFtZScsXG4gICAgd2VpZ2h0SW50ZW5zaXR5OiAnSW50ZW5zaXRhdCBkZSBwZXMnLFxuICAgIHpvb21TY2FsZTogJ0VzY2FsYSBkZSB6b29tJyxcbiAgICBoZWlnaHRSYW5nZTogJ1JhbmcgYWzDp2FkYScsXG4gICAgaGVpZ2h0TXVsdGlwbGllcjogXCJNdWx0aXBsaWNhZG9yIGQnYWzDp2FkYVwiLFxuICAgIGZpeGVkSGVpZ2h0OiAnQWzDp2FkYSBmaXhhJyxcbiAgICBmaXhlZEhlaWdodERlc2NyaXB0aW9uOiBcIlV0aWxpdHpldSBsJ2Fsw6dhZGEgc2Vuc2UgbW9kaWZpY2FjaW9uc1wiXG4gIH0sXG4gIGxheWVyTWFuYWdlcjoge1xuICAgIGFkZERhdGE6ICdBZmVnZWl4IERhZGVzJyxcbiAgICBhZGRMYXllcjogJ0FmZWdlaXggQ2FwZXMnLFxuICAgIGxheWVyQmxlbmRpbmc6ICdDb21iaW5hciBjYXBlcydcbiAgfSxcbiAgbWFwTWFuYWdlcjoge1xuICAgIG1hcFN0eWxlOiAnRXN0aWwgZGUgbWFwYScsXG4gICAgYWRkTWFwU3R5bGU6ICdBZmVnZWl4IGVzdGlscyBkZSBtYXBhJyxcbiAgICAnM2RCdWlsZGluZ0NvbG9yJzogJ0NvbG9yIGVkaWZpY2kgM0QnLFxuICAgIGJhY2tncm91bmRDb2xvcjogJ0NvbG9yIGRlIGZvbnMnXG4gIH0sXG4gIGxheWVyQ29uZmlndXJhdGlvbjoge1xuICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJ0NhbGN1bGEge3Byb3BlcnR5fSBzZWdvbnMgZWwgY2FtcCBzZWxlY2Npb25hdCcsXG4gICAgaG93VG86ICdIb3cgdG8nXG4gIH0sXG4gIGZpbHRlck1hbmFnZXI6IHtcbiAgICBhZGRGaWx0ZXI6ICdBZmVnZWl4IEZpbHRyZSdcbiAgfSxcbiAgZGF0YXNldFRpdGxlOiB7XG4gICAgc2hvd0RhdGFUYWJsZTogJ01vc3RyYSB0YXVsYSBkZSBkYWRlcycsXG4gICAgcmVtb3ZlRGF0YXNldDogJ0VsaW1pbmEgY29uanVudCBkZSBkYWRlcydcbiAgfSxcbiAgZGF0YXNldEluZm86IHtcbiAgICByb3dDb3VudDogJ3tyb3dDb3VudH0gZmlsZXMnXG4gIH0sXG4gIHRvb2x0aXA6IHtcbiAgICBoaWRlTGF5ZXI6ICdvY3VsdGEgbGEgY2FwYScsXG4gICAgc2hvd0xheWVyOiAnbW9zdHJhIGxhIGNhcGEnLFxuICAgIGhpZGVGZWF0dXJlOiBcIkFtYWdhIGwnb2JqZWN0ZVwiLFxuICAgIHNob3dGZWF0dXJlOiBcIk1vc3RyYSBsJ29iamVjdGVcIixcbiAgICBoaWRlOiAnYW1hZ2EnLFxuICAgIHNob3c6ICdtb3N0cmEnLFxuICAgIHJlbW92ZUxheWVyOiAnRWxpbWluYSBjYXBhJyxcbiAgICByZXNldEFmdGVyRXJyb3I6ICdJbnRlbnRldSBoYWJpbGl0YXIgbGEgY2FwYSBkZXNwcsOpcyBkdW4gZXJyb3InLFxuICAgIGxheWVyU2V0dGluZ3M6ICdDb25maWd1cmFjacOzIGRlIGNhcGEnLFxuICAgIGNsb3NlUGFuZWw6ICdUYW5jYSBwYW5lbCBhY3R1YWwnLFxuICAgIHN3aXRjaFRvRHVhbFZpZXc6ICdDYW52aWEgYSBsYSB2aXN0YSBkZSBtYXBhIGR1YWwnLFxuICAgIHNob3dMZWdlbmQ6ICdtb3N0cmEgbGxlZ2VuZGEnLFxuICAgIGRpc2FibGUzRE1hcDogJ0Rlc2FjdGl2YSBtYXBhIDNEJyxcbiAgICBEcmF3T25NYXA6ICdEaWJ1aXhhIGFsIG1hcGEnLFxuICAgIHNlbGVjdExvY2FsZTogJ1NlbGVjY2lvbmEgY29uZmlndXJhY2nDsyByZWdpb25hbCcsXG4gICAgc2hvd0FpQXNzaXN0YW50UGFuZWw6ICdNb3N0cmEgZWwgdGF1bGVyIGRlIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUFpQXNzaXN0YW50UGFuZWw6ICdPY3VsdGEgZWwgdGF1bGVyIGRlIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUxheWVyUGFuZWw6ICdPY3VsdGEgZWwgdGF1bGVyIGRlIGNhcGVzJyxcbiAgICBzaG93TGF5ZXJQYW5lbDogJ01vc3RyYSBlbCB0YXVsZXIgZGUgY2FwZXMnLFxuICAgIG1vdmVUb1RvcDogJ0Rlc3BsYcOnYSBhIGRhbHQgZGUgdG90IGRlIGxlcyBjYXBlcyBkZSBkYWRlcycsXG4gICAgc2VsZWN0QmFzZU1hcFN0eWxlOiAnU2VsZWNjaW9uYSBlc3RpbCBkZSBtYXBhIGJhc2UnLFxuICAgIGRlbGV0ZTogJ0VzYm9ycmEnLFxuICAgIHRpbWVQbGF5YmFjazogJ1JlcHJvZHVjY2nDsyBkZSB0ZW1wcycsXG4gICAgY2xvdWRTdG9yYWdlOiAnRW1tYWdhdHplbWF0Z2UgYWwgbsO6dm9sJyxcbiAgICAnM0RNYXAnOiAnTWFwYSAzRCcsXG4gICAgYW5pbWF0aW9uQnlXaW5kb3c6ICdGaW5lc3RyYSBUZW1wb3JhbCBNw7JiaWwnLFxuICAgIGFuaW1hdGlvbkJ5SW5jcmVtZW50YWw6ICdGaW5lc3RyYSBUZW1wb3JhbCBJbmNyZW1lbnRhbCcsXG4gICAgc3BlZWQ6ICd2ZWxvY2l0YXQnLFxuICAgIHBsYXk6ICdpbmljaWFyJyxcbiAgICBwYXVzZTogJ3BhdXNhcicsXG4gICAgcmVzZXQ6ICdyZWluaWNpYXInXG4gIH0sXG4gIHRvb2xiYXI6IHtcbiAgICBleHBvcnRJbWFnZTogJ0V4cG9ydGEgaW1hdGdlJyxcbiAgICBleHBvcnREYXRhOiAnRXhwb3J0YSBkYWRlcycsXG4gICAgZXhwb3J0TWFwOiAnRXhwb3J0YSBtYXBhJyxcbiAgICBzaGFyZU1hcFVSTDogJ0NvbXBhcnRlaXggVVJMIGRlbCBtYXBhJyxcbiAgICBzYXZlTWFwOiAnRGVzYSBtYXBhJyxcbiAgICBzZWxlY3Q6ICdzZWxlY2Npb25hJyxcbiAgICBwb2x5Z29uOiAncG9sw61nb24nLFxuICAgIHJlY3RhbmdsZTogJ3JlY3RhbmdsZScsXG4gICAgaGlkZTogJ2FtYWdhJyxcbiAgICBzaG93OiAnbW9zdHJhJyxcbiAgICAuLi5MT0NBTEVTXG4gIH0sXG4gIG1vZGFsOiB7XG4gICAgdGl0bGU6IHtcbiAgICAgIGRlbGV0ZURhdGFzZXQ6ICdFc2JvcnJhIGNvbmp1bnQgZGUgZGFkZXMnLFxuICAgICAgYWRkRGF0YVRvTWFwOiAnQWZlZ2VpeCBkYWRlcyBhbCBtYXBhJyxcbiAgICAgIGV4cG9ydEltYWdlOiAnRXhwb3J0YSBpbWF0Z2UnLFxuICAgICAgZXhwb3J0RGF0YTogJ0V4cG9ydGEgZGFkZXMnLFxuICAgICAgZXhwb3J0TWFwOiAnRXhwb3J0YSBtYXBhJyxcbiAgICAgIGFkZEN1c3RvbU1hcGJveFN0eWxlOiAnQWZlZ2VpeCBlc3RpbCBNYXBib3ggcHJvcGknLFxuICAgICAgc2F2ZU1hcDogJ0Rlc2EgbWFwYScsXG4gICAgICBzaGFyZVVSTDogJ0NvbXBhcnRlaXggVVJMJ1xuICAgIH0sXG4gICAgYnV0dG9uOiB7XG4gICAgICBkZWxldGU6ICdFc2JvcnJhJyxcbiAgICAgIGRvd25sb2FkOiAnRGVzY2FycmVnYScsXG4gICAgICBleHBvcnQ6ICdFeHBvcnRhJyxcbiAgICAgIGFkZFN0eWxlOiAnQWZlZ2VpeCBlc3RpbCcsXG4gICAgICBzYXZlOiAnRGVzYScsXG4gICAgICBkZWZhdWx0Q2FuY2VsOiAnQ2FuY2VswrdsYScsXG4gICAgICBkZWZhdWx0Q29uZmlybTogJ0NvbmZpcm1hJ1xuICAgIH0sXG4gICAgZXhwb3J0SW1hZ2U6IHtcbiAgICAgIHJhdGlvVGl0bGU6ICdSw6B0aW8nLFxuICAgICAgcmF0aW9EZXNjcmlwdGlvbjogJ0VzY3VsbCByw6B0aW8gcGVyIGRpdmVyc29zIHVzb3MuJyxcbiAgICAgIHJhdGlvT3JpZ2luYWxTY3JlZW46ICdQYW50YWxsYSBvcmlnaW5hbCcsXG4gICAgICByYXRpb0N1c3RvbTogJ1BlcnNvbmFsaXR6YXQnLFxuICAgICAgcmF0aW80XzM6ICc0OjMnLFxuICAgICAgcmF0aW8xNl85OiAnMTY6OScsXG4gICAgICByZXNvbHV0aW9uVGl0bGU6ICdSZXNvbHVjacOzJyxcbiAgICAgIHJlc29sdXRpb25EZXNjcmlwdGlvbjogJ0FsdGEgcmVzb2x1Y2nDsyDDqXMgbWlsbG9yIHBlciBhIGxlcyBpbXByZXNzaW9ucy4nLFxuICAgICAgbWFwTGVnZW5kVGl0bGU6ICdMbGVnZW5kYSBkZWwgbWFwYScsXG4gICAgICBtYXBMZWdlbmRBZGQ6ICdBZmVnaXIgbGxlZ2VuZGEgYWwgbWFwYSdcbiAgICB9LFxuICAgIGV4cG9ydERhdGE6IHtcbiAgICAgIGRhdGFzZXRUaXRsZTogJ0Nvbmp1bnQgZGUgZGFkZXMnLFxuICAgICAgZGF0YXNldFN1YnRpdGxlOiAnRXNjdWxsIGVscyBjb25qdW50cyBkZSBkYWRlcyBxdWUgdm9scyBleHBvcnRhcicsXG4gICAgICBhbGxEYXRhc2V0czogJ1RvdHMnLFxuICAgICAgZGF0YVR5cGVUaXRsZTogJ1RpcHVzIGRlIGRhZGVzJyxcbiAgICAgIGRhdGFUeXBlU3VidGl0bGU6ICdFc2N1bGwgZWxzIHRpcHVzIGRlIGRhZGVzIHF1ZSB2b2xzIGV4cG9ydGFyJyxcbiAgICAgIGZpbHRlckRhdGFUaXRsZTogJ0ZpbHRyYSBkYWRlcycsXG4gICAgICBmaWx0ZXJEYXRhU3VidGl0bGU6ICdQb3RzIGVzY29sbGlyIGV4cG9ydGFyIGxlcyBkYWRlcyBvcmlnaW5hbHMgbyBsZXMgZmlsdHJhZGVzJyxcbiAgICAgIGZpbHRlcmVkRGF0YTogJ0RhZGVzIGZpbHRyYWRlcycsXG4gICAgICB1bmZpbHRlcmVkRGF0YTogJ0RhZGVzIHNlbnNlIGZpbHRyYXInLFxuICAgICAgZmlsZUNvdW50OiAne2ZpbGVDb3VudH0gQXJ4aXVzJyxcbiAgICAgIHJvd0NvdW50OiAne3Jvd0NvdW50fSBGaWxlcydcbiAgICB9LFxuICAgIGRlbGV0ZURhdGE6IHtcbiAgICAgIHdhcm5pbmc6IFwiZXN0w6BzIGEgcHVudCBkJ2VzYm9ycmFyIGFxdWVzdCBjb25qdW50IGRlIGRhZGVzLiBBZmVjdGFyw6Age2xlbmd0aH0gY2FwZXNcIlxuICAgIH0sXG4gICAgYWRkU3R5bGU6IHtcbiAgICAgIHB1Ymxpc2hUaXRsZTogXCIyLiBQdWJsaWNhIGVsIHRldSBlc3RpbCBhIE1hcGJveCBvIHByb3BvcmNpb25hIGVsIHRva2VuIGQnYWNjw6lzXCIsXG4gICAgICBwdWJsaXNoU3VidGl0bGUxOiAnUG90cyBjcmVhciBlbCB0ZXUgcHJvcGkgZXN0aWwgZGUgbWFwYSBhJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTI6ICdpJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTM6ICdwdWJsaWNhcicsXG4gICAgICBwdWJsaXNoU3VidGl0bGU0OiAnaG8uJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTU6ICdQZXIgdXRpbGl0emFyIHVuIGVzdGlsIHByaXZhdCwgZW5nYW54YSBlbCB0ZXUnLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNjogXCJ0b2tlbiBkJ2FjY8Opc1wiLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNzpcbiAgICAgICAgJ2FxdcOtLiAqa2VwbGVyLmdsIMOpcyB1bmEgYXBsaWNhY2nDsyBjbGllbnQsIGxlcyBkYWRlcyByb21hbmVuIGFsIHRldSBuYXZlZ2Fkb3IuLicsXG4gICAgICBleGFtcGxlVG9rZW46ICdwLmV4LiBway5hYmNkZWZnLnh4eHh4eCcsXG4gICAgICBwYXN0ZVRpdGxlOiBcIjEuIEVuZ2FueGEgbGEgVVJMIGRlIGwnZXN0aWxcIixcbiAgICAgIHBhc3RlU3VidGl0bGUxOiAnUXXDqCDDqXMgdW4nLFxuICAgICAgcGFzdGVTdWJ0aXRsZTI6IFwiVVJMIGRlIGwnZXN0aWxcIixcbiAgICAgIG5hbWluZ1RpdGxlOiAnMy4gUG9zYSBub20gYWwgdGV1IGVzdGlsJ1xuICAgIH0sXG4gICAgc2hhcmVNYXA6IHtcbiAgICAgIHNoYXJlVXJpVGl0bGU6ICdDb21wYXJ0ZWl4IFVSTCBkZWwgbWFwYScsXG4gICAgICBzaGFyZVVyaVN1YnRpdGxlOiAnR2VuZXJhIHVuYSBVUkwgZGVsIG1hcGEgcGVyIGNvbXBhcnRpciBhbWIgYWx0cmknLFxuICAgICAgY2xvdWRUaXRsZTogJ0VtbWFnYXR6ZW1hdGdlIGFsIG7DunZvbCcsXG4gICAgICBjbG91ZFN1YnRpdGxlOiAnQWNjZWRlaXggaSBjYXJyZWdhIGRhZGVzIGRlIG1hcGEgYWwgdGV1IGVtbWFnYXR6ZW1hdGdlIGFsIG7DunZvbCBwZXJzb25hbCcsXG4gICAgICBzaGFyZURpc2NsYWltZXI6XG4gICAgICAgICdrZXBsZXIuZ2wgZGVzYXLDoCBsZXMgZGFkZXMgZGVsIG1hcGEgYWwgdGV1IGVtbWFnYXR6ZW1hdGdlIGFsIG7DunZvbCBwZXJzb25hbCwgbm9tw6lzIHF1aSB0aW5ndWkgbGEgVVJMIHBvZHLDoCBhY2NlZGlyIGFsIG1hcGEgaSBhIGxlcyBkYWRlcyAuICcgK1xuICAgICAgICBcIlBvdHMgZWRpdGFyL2VzYm9ycmFyIGwnYXJ4aXUgZGUgZGFkZXMgZW4gZWwgdGV1IGNvbXB0ZSBhbCBuw7p2b2wgZW4gcXVhbHNldm9sIG1vbWVudC5cIixcbiAgICAgIGdvdG9QYWdlOiAnVmVzIGEgbGEgcMOgZ2luYSBkZSB7Y3VycmVudFByb3ZpZGVyfSBkZSBLZXBsZXIuZ2wnXG4gICAgfSxcbiAgICBzdGF0dXNQYW5lbDoge1xuICAgICAgbWFwVXBsb2FkaW5nOiAnQ2FycmVnYXIgdW4gbWFwYScsXG4gICAgICBlcnJvcjogJ0Vycm9yJ1xuICAgIH0sXG4gICAgc2F2ZU1hcDoge1xuICAgICAgdGl0bGU6ICdFbW1hZ2F0emVtYXRnZSBhbCBuw7p2b2wnLFxuICAgICAgc3VidGl0bGU6ICdBY2NlZGVpeCBwZXIgZGVzYXIgZWwgbWFwYSBhbCB0ZXUgZW1tYWdhdHplbWF0Z2UgYWwgbsO6dm9sJ1xuICAgIH0sXG4gICAgZXhwb3J0TWFwOiB7XG4gICAgICBmb3JtYXRUaXRsZTogJ0Zvcm1hdCBkZSBtYXBhJyxcbiAgICAgIGZvcm1hdFN1YnRpdGxlOiAnRXNjdWxsIGVsIGZvcm1hdCBhbWIgcXXDqCB2b2xzIGV4cG9ydGFyIGVsIHRldSBtYXBhJyxcbiAgICAgIGh0bWw6IHtcbiAgICAgICAgc2VsZWN0aW9uOiAnRXhwb3J0YSBlbCB0ZXUgbWFwYSBjb20gdW4gYXJ4aXUgSFRNTCBpbnRlcmFjdGl1LicsXG4gICAgICAgIHRva2VuVGl0bGU6IFwiVG9rZW4gZCdhY2PDqXMgZGUgTWFwYm94XCIsXG4gICAgICAgIHRva2VuU3VidGl0bGU6IFwiVXRpbGl0emEgZWwgdGV1IHRva2VuIGQnYWNjw6lzIGRlIE1hcGJveCBhIGwnYXJ4aXUgSFRNTCAob3BjaW9uYWwpXCIsXG4gICAgICAgIHRva2VuUGxhY2Vob2xkZXI6IFwiRW5nYW54YSBlbCB0ZXUgdG9rZW4gZCdhY2PDqXMgYSBNYXBib3hcIixcbiAgICAgICAgdG9rZW5NaXN1c2VXYXJuaW5nOlxuICAgICAgICAgICcqIFNpIG5vIHByb3BvcmNpb25lcyBlbCB0ZXUgcHJvcGkgdG9rZW4sIGVsIG1hcGEgcG9kcmlhIGZhbGxhciBlbiBxdWFsc2V2b2wgbW9tZW50IHF1YW4gcmVlbXBsYWNlbSBlbCBub3N0cmUgdG9rZW4gcGVyIGV2aXRhciBhYnVzb3MuICcsXG4gICAgICAgIHRva2VuRGlzY2xhaW1lcjpcbiAgICAgICAgICAnUG90cyBjYW52aWFyIGVsIHRva2UgZGUgTWFwYm94IG3DqXMgZW5kYXZhbnQgZmVudCBzZXJ2aXIgYXF1ZXN0ZXMgaW5zdHJ1Y2Npb25zOiAnLFxuICAgICAgICB0b2tlblVwZGF0ZTogJ0NvbSBhY3R1YWxpdHphciB1biB0b2tlbiBwcmVleGlzdGVudC4nLFxuICAgICAgICBtb2RlVGl0bGU6ICdNb2RlIG1hcGEnLFxuICAgICAgICBtb2RlU3VidGl0bGUxOiAnU2VsZWNjaW9uYSBtb2RlIGFwcC4gTcOpcyAnLFxuICAgICAgICBtb2RlU3VidGl0bGUyOiAnaW5mb3JtYWNpw7MnLFxuICAgICAgICBtb2RlRGVzY3JpcHRpb246ICdQZXJtZXQgYWxzIHVzdWFyaXMge21vZGV9IGVsIG1hcGEnLFxuICAgICAgICByZWFkOiAnbGxlZ2lyJyxcbiAgICAgICAgZWRpdDogJ2VkaXRhcidcbiAgICAgIH0sXG4gICAgICBqc29uOiB7XG4gICAgICAgIGNvbmZpZ1RpdGxlOiAnQ29uZmlndXJhY2nDsyBkZWwgbWFwYScsXG4gICAgICAgIGNvbmZpZ0Rpc2NsYWltZXI6XG4gICAgICAgICAgXCJMYSBjb25maWd1cmFjacOzIGRlbCBtYXBhIHMnaW5jbG91csOgIGEgbCdhcnhpdSBKc29uLiBTaSB1dGlsaXR6ZXMga2VwbGVyLmdsIGEgbGEgdGV2YSBwcsOycGlhIGFwcCBwb3RzIGNvcGlhciBhcXVlc3RhIGNvbmZpZ3VyYWNpw7MgaSBwYXNzYXItbGEgYSAgXCIsXG4gICAgICAgIHNlbGVjdGlvbjpcbiAgICAgICAgICAnRXhwb3J0YSBsZXMgZGFkZXMgZGVsIG1hcGEgaSBsYSBjb25maWd1cmFjacOzIGVuIHVuIHNvbCBhcnhpdSBKc29uLiBNw6lzIGVuZGF2YW50IHBvdHMgb2JyaXIgYXF1ZXN0IG1hdGVpeCBtYXBhIGNhcnJlZ2FudCBhcXVlc3QgbWF0ZWl4IGFyeGl1IGEga2VwbGVyLmdsLicsXG4gICAgICAgIGRpc2NsYWltZXI6XG4gICAgICAgICAgXCIqIExhIGNvbmZpZ3VyYWNpw7MgZGVsIG1hcGEgZXMgY29tYmluYSBhbWIgZWxzIGNvbmp1bnRzIGRlIGRhZGVzIGNhcnJlZ2F0cy4g4oCYZGF0YUlk4oCZIHMndXRpbGl0emEgcGVyIGxsaWdhciBjYXBlcywgZmlsdHJlcyBpIHN1Z2dlcmltZW50cyBhIHVuIGNvbmp1bnQgZGUgZGFkZXMgZXNwZWPDrWZpYy4gXCIgK1xuICAgICAgICAgIFwiUXVhbiBwYXNzaXMgYXF1ZXN0YSBjb25maWd1cmFjacOzIGEgYWRkRGF0YVRvTWFwLCBhc3NlZ3VyYSBxdWUgbCdpZGVudGlmaWNhZG9yIGRlbCBjb25qdW50IGRlIGRhZGVzIGNvaW5jaWRlaXhpIGFtYiBlbHMg4oCYZGF0YUlk4oCZIGQnYXF1ZXN0YSBjb25maWd1cmFjacOzLlwiXG4gICAgICB9XG4gICAgfSxcbiAgICBsb2FkaW5nRGlhbG9nOiB7XG4gICAgICBsb2FkaW5nOiAnQ2FycmVnYW50Li4uJ1xuICAgIH0sXG4gICAgbG9hZERhdGE6IHtcbiAgICAgIHVwbG9hZDogJ0NhcnJlZ2FyIGFyeGl1cycsXG4gICAgICBzdG9yYWdlOiBcIkNhcnJlZ2FyIGRlcyBkJ2VtbWFnYXR6ZW1hdGdlXCJcbiAgICB9LFxuICAgIHRyaXBJbmZvOiB7XG4gICAgICB0aXRsZTogJ0NvbSBoYWJpbGl0YXIgbOKAmWFuaW1hY2nDsyBkZSB2aWF0Z2UnLFxuICAgICAgZGVzY3JpcHRpb24xOlxuICAgICAgICAnUGVyIGFuaW1hciBsYSBydXRhLCBsZXMgZGFkZXMgZ2VvSlNPTiBoYW4gZGUgY29udGVuaXIgYExpbmVTdHJpbmdgIGVuIGxhIHNldmEgZ2VvbWV0cmlhIGkgbGVzIGNvb3JkZW5hZGVzIGRlIExpbmVTdHJpbmcgaGFuIGRlIHRlbmlyIDQgZWxlbWVudHMgZW4gZWxzIGZvcm1hdHMgZGUgJyxcbiAgICAgIGNvZGU6ICcgW2xvbmdpdHVkZSwgbGF0aXR1ZGUsIGFsdGl0dWRlLCB0aW1lc3RhbXBdICcsXG4gICAgICBkZXNjcmlwdGlvbjI6XG4gICAgICAgICdpIGVsIGRhcnJlciBlbGVtZW50IGhhIGRlIHNlciBsYSBtYXJjYSBkZSB0ZW1wcy4gRWxzIGZvcm1hdHMgdsOgbGlkcyBwZXIgYSBsYSBtYXJjYSBkZSB0ZW1wcyBpbmNsb3VlbiBVbml4IGVuIHNlZ29ucyBjb20gYDE1NjQxODQzNjNgIG8gZW4gbWlsaXNlZ29ucyBjb20gYDE1NjQxODQzNjMwMDBgLicsXG4gICAgICBleGFtcGxlOiAnRXhlbXBsZTonXG4gICAgfSxcbiAgICBpY29uSW5mbzoge1xuICAgICAgdGl0bGU6ICdDb20gZGlidWl4YXIgaWNvbmVzJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgXCJFbiBlbCB0ZXUgQ1NWIGNyZWEgdW5hIGNvbHVtbmEgaSBwb3NhLWhpIGVsIG5vbSBkZSBsYSBpY29uYSBxdWUgdm9scyBkaWJ1aXhhci4gUG90cyBkZWl4YXIgbGEgY2VswrdsYSBidWlkYSBxdWFuIG5vIHZ1bGd1aXMgcXVlIGVzIG1vc3RyaSBwZXIgYSBjZXJ0cyBwdW50cy4gUXVhbiBsYSBjb2x1bW5hIHMnYW5vbWVuYVwiLFxuICAgICAgY29kZTogJ2ljb24nLFxuICAgICAgZGVzY3JpcHRpb24yOiBcIiBrZXBsZXIuZ2wgYXV0b23DoHRpY2FtZW50IGNyZWFyw6AgdW5hIGNhcGEgZCdpY29uYS5cIixcbiAgICAgIGV4YW1wbGU6ICdFeGVtcGxlOicsXG4gICAgICBpY29uczogJ0ljb25lcydcbiAgICB9LFxuICAgIHN0b3JhZ2VNYXBWaWV3ZXI6IHtcbiAgICAgIGxhc3RNb2RpZmllZDogJ0RhcnJlcmEgbW9kaWZpY2FjacOzIGZhIHtsYXN0VXBkYXRlZH0nLFxuICAgICAgYmFjazogJ0VucmVyZSdcbiAgICB9LFxuICAgIG92ZXJ3cml0ZU1hcDoge1xuICAgICAgdGl0bGU6ICdEZXNhbnQgbWFwYS4uLicsXG4gICAgICBhbHJlYWR5RXhpc3RzOiAnamEgZXhpc3RlaXggYSB7bWFwU2F2ZWR9LiBFbCB2b2xzIHNvYnJlZXNjcml1cmU/J1xuICAgIH0sXG4gICAgbG9hZFN0b3JhZ2VNYXA6IHtcbiAgICAgIGJhY2s6ICdFbnJlcmUnLFxuICAgICAgZ29Ub1BhZ2U6ICdWZXMgYSBsYSBww6BnaW5hIHtkaXNwbGF5TmFtZX0gZGUgS2VwbGVyLmdsJyxcbiAgICAgIHN0b3JhZ2VNYXBzOiAnRW1tYWdhdHplbWF0Z2UgLyBNYXBlcycsXG4gICAgICBub1NhdmVkTWFwczogJ0NhcCBtYXBhIGRlc2F0IGVuY2FyYSdcbiAgICB9XG4gIH0sXG4gIGhlYWRlcjoge1xuICAgIHZpc2libGVMYXllcnM6ICdDYXBlcyB2aXNpYmxlcycsXG4gICAgbGF5ZXJMZWdlbmQ6ICdMbGVnZW5kYSBkZSBjYXBlcydcbiAgfSxcbiAgaW50ZXJhY3Rpb25zOiB7XG4gICAgdG9vbHRpcDogJ1N1Z2dlcmltZW50JyxcbiAgICBicnVzaDogJ1BpbnplbGwnLFxuICAgIGNvb3JkaW5hdGU6ICdDb29yZGVuYWRlcycsXG4gICAgZ2VvY29kZXI6ICdHZW9jb2RpZmljYWRvcidcbiAgfSxcbiAgbGF5ZXJCbGVuZGluZzoge1xuICAgIHRpdGxlOiAnQ29tYmluYWNpw7MgZGUgY2FwZXMnLFxuICAgIGFkZGl0aXZlOiAnYWRkaXRpdmEnLFxuICAgIG5vcm1hbDogJ25vcm1hbCcsXG4gICAgc3VidHJhY3RpdmU6ICdzdWJzdHJhY3RpdmEnXG4gIH0sXG4gIGNvbHVtbnM6IHtcbiAgICB0aXRsZTogJ0NvbHVtbmVzJyxcbiAgICBsYXQ6ICdsYXQnLFxuICAgIGxuZzogJ2xvbicsXG4gICAgYWx0aXR1ZGU6ICdhbMOnYWRhJyxcbiAgICBpY29uOiAnaWNvbmEnLFxuICAgIGdlb2pzb246ICdnZW9qc29uJyxcbiAgICBhcmM6IHtcbiAgICAgIGxhdDA6ICdsYXQgb3JpZ2VuJyxcbiAgICAgIGxuZzA6ICdsbmcgb3JpZ2VuICcsXG4gICAgICBsYXQxOiAnbGF0IGRlc3RpbmFjacOzJyxcbiAgICAgIGxuZzE6ICdsbmcgZGVzdGluYWNpw7MnXG4gICAgfSxcbiAgICBsaW5lOiB7XG4gICAgICBhbHQwOiAnYWzDp2FkYSBvcmlnZW4nLFxuICAgICAgYWx0MTogJ2Fsw6dhZGEgZGVzdGluYWNpw7MnXG4gICAgfSxcbiAgICBncmlkOiB7XG4gICAgICB3b3JsZFVuaXRTaXplOiAnTWlkYSBkZSBtYWxsYSAoa20pJ1xuICAgIH0sXG4gICAgaGV4YWdvbjoge1xuICAgICAgd29ybGRVbml0U2l6ZTogXCJSYWRpIGQnaGV4w6Bnb24gKGttKVwiXG4gICAgfSxcbiAgICBoZXhfaWQ6ICdpZCBoZXgnXG4gIH0sXG4gIGNvbG9yOiB7XG4gICAgY3VzdG9tUGFsZXR0ZTogJ1BhbGV0YSBwZXJzb25hbGl0emFkYScsXG4gICAgc3RlcHM6ICdpbnRlcnZhbHMnLFxuICAgIHR5cGU6ICd0aXB1cycsXG4gICAgcmV2ZXJzZWQ6ICdpbnZlcnRpZGEnXG4gIH0sXG4gIHNjYWxlOiB7XG4gICAgY29sb3JTY2FsZTogJ0VzY2FsYSBkZSBjb2xvcicsXG4gICAgc2l6ZVNjYWxlOiAnRXNjYWxhIGRlIG1pZGVzJyxcbiAgICBzdHJva2VTY2FsZTogJ0VzY2FsYSBkZSB0cmHDpycsXG4gICAgc2NhbGU6ICdFc2NhbGEnXG4gIH0sXG4gIGZpbGVVcGxvYWRlcjoge1xuICAgIG1lc3NhZ2U6IFwiQXJyb3NzZWdhIGkgZGVpeGEgYW5hciBsJ2FyeGl1IGFxdcOtXCIsXG4gICAgY2hyb21lTWVzc2FnZTpcbiAgICAgICcqdXN1YXJpIGRlIENocm9tZTogbGEgbWlkYSBtw6B4aW1hIHPDs24gMjUwbWIsIHNpIGhhcyBkZSBjYXJyZ2FyIHVuIGFyeGl1IG3DqXMgZ3JhbiBmZXMgc2VydmlyIFNhZmFyaScsXG4gICAgZGlzY2xhaW1lcjpcbiAgICAgICcqa2VwbGVyLmdsIMOpcyB1bmEgYXBsaWNhY2nDsyBhIGxhIGJhbmRhIGNsaWVudCBxdWUgbm8gZXMgcmVjb2x6YSBlbiBjYXAgc2Vydmlkb3IuIExlcyBkYWRlcyBub23DqXMgZXhpc3RlaXhlbiBhIGxhIHRldmEgbcOgcXVpbmEvbmF2ZWdhZG9yLiAnICtcbiAgICAgIFwiTm8gcydlbnZpZW4gZGFkZXMgbmkgbWFwZXMgYSBjYXAgc2Vydmlkb3IuXCIsXG4gICAgY29uZmlnVXBsb2FkTWVzc2FnZTpcbiAgICAgICdDYXJyZWdhIHtmaWxlRm9ybWF0TmFtZXN9IG8gdW4gbWFwYSBkZXNhdCBlbiAqKkpzb24qKi4gTcOpcyBpbmZvcm1hY2nDsyBzb2JyZSBbKipzdXBwb3J0ZWQgZmlsZSBmb3JtYXRzKipdJyxcbiAgICBicm93c2VGaWxlczogJ25hdmVnYSBwZWxzIHRldXMgYXJ4aXVzJyxcbiAgICB1cGxvYWRpbmc6ICdDYXJyZWdhbnQnLFxuICAgIGZpbGVOb3RTdXBwb3J0ZWQ6IFwiTCdhcnhpdSB7ZXJyb3JGaWxlc30gbm8gw6lzIGNvbXBhdGlibGUuXCIsXG4gICAgb3I6ICdvJ1xuICB9LFxuICBnZW9jb2Rlcjoge1xuICAgIHRpdGxlOiAnSW50cm9kdWVpeCB1bmEgYWRyZcOnYSdcbiAgfSxcbiAgZmllbGRTZWxlY3Rvcjoge1xuICAgIGNsZWFyQWxsOiAnVHJldXJlIHRvdHMnLFxuICAgIGZvcm1hdHRpbmc6ICdGb3JtYXQnXG4gIH0sXG4gIGNvbXBhcmU6IHtcbiAgICBtb2RlTGFiZWw6ICdNb2RlIENvbXBhcmFjacOzJyxcbiAgICB0eXBlTGFiZWw6ICdUaXB1cyBkZSBDb21wYXJhY2nDsycsXG4gICAgdHlwZXM6IHtcbiAgICAgIGFic29sdXRlOiAnQWJzb2x1dGEnLFxuICAgICAgcmVsYXRpdmU6ICdSZWxhdGl2YSdcbiAgICB9XG4gIH0sXG4gIG1hcFBvcG92ZXI6IHtcbiAgICBwcmltYXJ5OiAnUHJpbmNpcGFsJ1xuICB9LFxuICBkZW5zaXR5OiAnZGVuc2l0YXQnLFxuICAnQnVnIFJlcG9ydCc6IFwiSW5mb3JtZSBkJ2Vycm9yc1wiLFxuICAnVXNlciBHdWlkZSc6IFwiR3VpYSBkJ3VzdWFyaVwiLFxuICBTYXZlOiAnRGVzYScsXG4gIFNoYXJlOiAnQ29tcGFydGVpeCdcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBR0EsSUFBQUEsUUFBQSxHQUFBQyxPQUFBO0FBQW1DLFNBQUFDLFFBQUFDLENBQUEsRUFBQUMsQ0FBQSxRQUFBQyxDQUFBLEdBQUFDLE1BQUEsQ0FBQUMsSUFBQSxDQUFBSixDQUFBLE9BQUFHLE1BQUEsQ0FBQUUscUJBQUEsUUFBQUMsQ0FBQSxHQUFBSCxNQUFBLENBQUFFLHFCQUFBLENBQUFMLENBQUEsR0FBQUMsQ0FBQSxLQUFBSyxDQUFBLEdBQUFBLENBQUEsQ0FBQUMsTUFBQSxXQUFBTixDQUFB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