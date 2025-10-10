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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsImNvdmVyYWdlIiwic3Ryb2tlQ29sb3IiLCJyYWRpdXMiLCJvdXRsaW5lIiwic3Ryb2tlIiwiZGVuc2l0eSIsImhlaWdodCIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJiYWNrZ3JvdW5kIiwicGFuZWwiLCJ0ZXh0IiwibGFiZWxXaXRoSWQiLCJmb250U2l6ZSIsImZvbnRDb2xvciIsInRleHRBbmNob3IiLCJhbGlnbm1lbnQiLCJhZGRNb3JlTGFiZWwiLCJzaWRlYmFyIiwicGFuZWxzIiwibGF5ZXIiLCJpbnRlcmFjdGlvbiIsImJhc2VtYXAiLCJyZXF1aXJlZCIsInByb3BlcnR5QmFzZWRPbiIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsImFuZ2xlIiwic3Ryb2tlV2lkdGhSYW5nZSIsImZpeGVkUmFkaXVzIiwiZml4ZWRSYWRpdXNEZXNjcmlwdGlvbiIsInJhZGl1c1JhbmdlIiwiY2x1c3RlclJhZGl1cyIsInJhZGl1c1JhbmdlUGl4ZWxzIiwiYmlsbGJvYXJkIiwiYmlsbGJvYXJkRGVzY3JpcHRpb24iLCJmYWRlVHJhaWwiLCJvcGFjaXR5IiwiY29sb3JSYW5nZSIsInN0cm9rZUNvbG9yUmFuZ2UiLCJ0YXJnZXRDb2xvciIsImNvbG9yQWdncmVnYXRpb24iLCJoZWlnaHRBZ2dyZWdhdGlvbiIsInJlc29sdXRpb25SYW5nZSIsInNpemVTY2FsZSIsIndvcmxkVW5pdFNpemUiLCJlbGV2YXRpb25TY2FsZSIsImVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3IiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yRGVzY3JpcHRpb24iLCJlbmFibGVIZWlnaHRab29tRmFjdG9yIiwiaGVpZ2h0U2NhbGUiLCJjb3ZlcmFnZVJhbmdlIiwiaGlnaFByZWNpc2lvblJlbmRlcmluZyIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbiIsImhlaWdodERlc2NyaXB0aW9uIiwiZmlsbCIsImVuYWJsZVBvbHlnb25IZWlnaHQiLCJzaG93V2lyZWZyYW1lIiwid2VpZ2h0SW50ZW5zaXR5Iiwiem9vbVNjYWxlIiwiaGVpZ2h0UmFuZ2UiLCJoZWlnaHRNdWx0aXBsaWVyIiwiZml4ZWRIZWlnaHQiLCJmaXhlZEhlaWdodERlc2NyaXB0aW9uIiwibGF5ZXJNYW5hZ2VyIiwiYWRkRGF0YSIsImFkZExheWVyIiwibGF5ZXJCbGVuZGluZyIsIm1hcE1hbmFnZXIiLCJtYXBTdHlsZSIsImFkZE1hcFN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwibGF5ZXJDb25maWd1cmF0aW9uIiwiZGVmYXVsdERlc2NyaXB0aW9uIiwiaG93VG8iLCJmaWx0ZXJNYW5hZ2VyIiwiYWRkRmlsdGVyIiwiZGF0YXNldFRpdGxlIiwic2hvd0RhdGFUYWJsZSIsInJlbW92ZURhdGFzZXQiLCJkYXRhc2V0SW5mbyIsInJvd0NvdW50IiwidG9vbHRpcCIsImhpZGVMYXllciIsInNob3dMYXllciIsImhpZGVGZWF0dXJlIiwic2hvd0ZlYXR1cmUiLCJoaWRlIiwic2hvdyIsInJlbW92ZUxheWVyIiwicmVzZXRBZnRlckVycm9yIiwibGF5ZXJTZXR0aW5ncyIsImNsb3NlUGFuZWwiLCJzd2l0Y2hUb0R1YWxWaWV3Iiwic2hvd0xlZ2VuZCIsImRpc2FibGUzRE1hcCIsIkRyYXdPbk1hcCIsInNlbGVjdExvY2FsZSIsInNob3dBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUFpQXNzaXN0YW50UGFuZWwiLCJoaWRlTGF5ZXJQYW5lbCIsInNob3dMYXllclBhbmVsIiwibW92ZVRvVG9wIiwic2VsZWN0QmFzZU1hcFN0eWxlIiwidGltZVBsYXliYWNrIiwiY2xvdWRTdG9yYWdlIiwiYW5pbWF0aW9uQnlXaW5kb3ciLCJhbmltYXRpb25CeUluY3JlbWVudGFsIiwic3BlZWQiLCJwbGF5IiwicGF1c2UiLCJyZXNldCIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImdlb2NvZGVyIiwiYWRkaXRpdmUiLCJub3JtYWwiLCJzdWJ0cmFjdGl2ZSIsImNvbHVtbnMiLCJsYXQiLCJsbmciLCJhbHRpdHVkZSIsImxhdDAiLCJsbmcwIiwibGF0MSIsImxuZzEiLCJhbHQwIiwiYWx0MSIsImhleF9pZCIsImN1c3RvbVBhbGV0dGUiLCJzdGVwcyIsInJldmVyc2VkIiwic2NhbGUiLCJjb2xvclNjYWxlIiwic3Ryb2tlU2NhbGUiLCJmaWxlVXBsb2FkZXIiLCJtZXNzYWdlIiwiY2hyb21lTWVzc2FnZSIsImNvbmZpZ1VwbG9hZE1lc3NhZ2UiLCJicm93c2VGaWxlcyIsInVwbG9hZGluZyIsImZpbGVOb3RTdXBwb3J0ZWQiLCJvciIsImZpZWxkU2VsZWN0b3IiLCJjbGVhckFsbCIsImZvcm1hdHRpbmciLCJjb21wYXJlIiwibW9kZUxhYmVsIiwidHlwZUxhYmVsIiwidHlwZXMiLCJhYnNvbHV0ZSIsInJlbGF0aXZlIiwibWFwUG9wb3ZlciIsInByaW1hcnkiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdHJhbnNsYXRpb25zL2NhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmltcG9ydCB7TE9DQUxFU30gZnJvbSAnLi4vbG9jYWxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcGVydHk6IHtcbiAgICB3ZWlnaHQ6ICdwZXMnLFxuICAgIGxhYmVsOiAnZXRpcXVldGEnLFxuICAgIGZpbGxDb2xvcjogJ2NvbG9yIGZvbnMnLFxuICAgIGNvbG9yOiAnY29sb3InLFxuICAgIGNvdmVyYWdlOiAnY29iZXJ0dXJhJyxcbiAgICBzdHJva2VDb2xvcjogJ2NvbG9yIGRlIHRyYcOnJyxcbiAgICByYWRpdXM6ICdyYWRpJyxcbiAgICBvdXRsaW5lOiAnb3V0bGluZScsXG4gICAgc3Ryb2tlOiAndHJhw6cnLFxuICAgIGRlbnNpdHk6ICdkZW5zaXRhdCcsXG4gICAgaGVpZ2h0OiAnYWzDp2FkYScsXG4gICAgc3VtOiAnc3VtYScsXG4gICAgcG9pbnRDb3VudDogJ1JlY29tcHRlIGRlIFB1bnRzJ1xuICB9LFxuICBwbGFjZWhvbGRlcjoge1xuICAgIHNlYXJjaDogJ0NlcmNhJyxcbiAgICBzZWxlY3RGaWVsZDogJ1NlbGVjY2lvbmEgdW4gY2FtcCcsXG4gICAgeUF4aXM6ICdFaXggWScsXG4gICAgc2VsZWN0VHlwZTogJ1NlbGVjY2lvbmEgdW4gVGlwdXMnLFxuICAgIHNlbGVjdFZhbHVlOiAnU2VsZWNjaW9uYSB1biBWYWxvcicsXG4gICAgZW50ZXJWYWx1ZTogJ0VudHJhIHVuIHZhbG9yJyxcbiAgICBlbXB0eTogJ2J1aXQnXG4gIH0sXG4gIG1pc2M6IHtcbiAgICBieTogJycsXG4gICAgdmFsdWVzSW46ICdWYWxvcnMgYScsXG4gICAgdmFsdWVFcXVhbHM6ICdWYWxvciBpZ3VhbCBhJyxcbiAgICBkYXRhU291cmNlOiAnRm9udCBkZSBkYWRlcycsXG4gICAgYnJ1c2hSYWRpdXM6ICdSYWRpIGRlbCBwaW56ZWxsIChrbSknLFxuICAgIGVtcHR5OiAnICdcbiAgfSxcbiAgbWFwTGF5ZXJzOiB7XG4gICAgdGl0bGU6ICdDYXBlcyBkZWwgbWFwYScsXG4gICAgbGFiZWw6ICdFdGlxdWV0YScsXG4gICAgcm9hZDogJ0NhcnJldGVyYScsXG4gICAgYm9yZGVyOiAnRnJvbnRlcmEnLFxuICAgIGJ1aWxkaW5nOiAnRWRpZmljaScsXG4gICAgd2F0ZXI6ICdBaWd1YScsXG4gICAgbGFuZDogJ1RlcnJhJyxcbiAgICAnM2RCdWlsZGluZyc6ICdFZGlmaWNpIDNEJyxcbiAgICBiYWNrZ3JvdW5kOiAnRm9ucydcbiAgfSxcbiAgcGFuZWw6IHtcbiAgICB0ZXh0OiB7XG4gICAgICBsYWJlbDogJ2V0aXF1ZXRhJyxcbiAgICAgIGxhYmVsV2l0aElkOiAnRXRpcXVldGEge2xhYmVsSWR9JyxcbiAgICAgIGZvbnRTaXplOiAnTWlkYSBkZSBsYSBmb250JyxcbiAgICAgIGZvbnRDb2xvcjogJ0NvbG9yIGRlIGxhIGZvbnQnLFxuICAgICAgdGV4dEFuY2hvcjogJ8OAbmNvcmEgZGVsIHRleHQnLFxuICAgICAgYWxpZ25tZW50OiAnQWxpbmVhY2nDsycsXG4gICAgICBhZGRNb3JlTGFiZWw6ICdBZmVnZWl4IG3DqXMgZXRpcXVldGVzJ1xuICAgIH1cbiAgfSxcbiAgc2lkZWJhcjoge1xuICAgIHBhbmVsczoge1xuICAgICAgbGF5ZXI6ICdDYXBlcycsXG4gICAgICBmaWx0ZXI6ICdGaWx0cmVzJyxcbiAgICAgIGludGVyYWN0aW9uOiAnSW50ZXJhY2Npb25zJyxcbiAgICAgIGJhc2VtYXA6ICdNYXBhIGJhc2UnXG4gICAgfVxuICB9LFxuICBsYXllcjoge1xuICAgIHJlcXVpcmVkOiAnUmVxdWVyaXQqJyxcbiAgICByYWRpdXM6ICdSYWRpJyxcbiAgICBjb2xvcjogJ0NvbG9yJyxcbiAgICBmaWxsQ29sb3I6ICdDb2xvciBmb25zJyxcbiAgICBvdXRsaW5lOiAnQ29udG9ybicsXG4gICAgd2VpZ2h0OiAnR3J1aXgnLFxuICAgIHByb3BlcnR5QmFzZWRPbjogJ3twcm9wZXJ0eX0gYmFzYWRhIGVuJyxcbiAgICBjb3ZlcmFnZTogJ0NvYmVydHVyYScsXG4gICAgc3Ryb2tlOiAnVHJhw6cnLFxuICAgIHN0cm9rZVdpZHRoOiAnQW1wbGFkYSBkZSB0cmHDpycsXG4gICAgc3Ryb2tlQ29sb3I6ICdDb2xvciBkZSB0cmHDpycsXG4gICAgYmFzaWM6ICdCYXNpYycsXG4gICAgdHJhaWxMZW5ndGg6ICdMb25naXR1ZCBkZSBwaXN0YScsXG4gICAgdHJhaWxMZW5ndGhEZXNjcmlwdGlvbjogJ05vbWJyZSBkZSBzZWdvbnMgZmlucyBxdWUgZGVzYXBhcmVpeCBlbCBjYW3DrScsXG4gICAgbmV3TGF5ZXI6ICdub3ZhIGNhcGEnLFxuICAgIGVsZXZhdGlvbkJ5RGVzY3JpcHRpb246IFwiU2kgZGVzYWN0aXZhdCwgbCdhbMOnYWRhIGVzIGJhc2EgZW4gZWwgcmVjb21wdGUgZGUgcHVudHNcIixcbiAgICBjb2xvckJ5RGVzY3JpcHRpb246ICdTaSBkZXNhY3RpdmF0LCBlbCBjb2xvciBlcyBiYXNhIGVuIGVsIHJlY29tcHRlIGRlIHB1bnRzJyxcbiAgICBhZ2dyZWdhdGVCeTogJ3tmaWVsZH0gYWdyZWdhdCBwZXInLFxuICAgICczRE1vZGVsJzogJ01vZGVsIDNEJyxcbiAgICAnM0RNb2RlbE9wdGlvbnMnOiAnT3BjaW9ucyBkZWwgbW9kZWwgM0QnLFxuICAgIHR5cGU6IHtcbiAgICAgIHBvaW50OiAncHVudCcsXG4gICAgICBhcmM6ICdhcmMnLFxuICAgICAgbGluZTogJ2zDrW5pYScsXG4gICAgICBncmlkOiAnbWFsbGEnLFxuICAgICAgaGV4YmluOiAnaGV4YmluJyxcbiAgICAgIHBvbHlnb246ICdwb2zDrWdvbicsXG4gICAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgICBjbHVzdGVyOiAnY2x1c3RlcicsXG4gICAgICBpY29uOiAnaWNvbmEnLFxuICAgICAgaGVhdG1hcDogJ2hlYXRtYXAnLFxuICAgICAgaGV4YWdvbjogJ2hleMOgZ29uJyxcbiAgICAgIGhleGFnb25pZDogJ0gzJyxcbiAgICAgIHRyaXA6ICd2aWF0Z2UnLFxuICAgICAgczI6ICdTMicsXG4gICAgICAnM2QnOiAnM0QnXG4gICAgfSxcbiAgICBsYXllclVwZGF0ZUVycm9yOlxuICAgICAgXCJTJ2hhIHByb2R1w690IHVuIGVycm9yIGR1cmFudCBsJ2FjdHVhbGl0emFjacOzIGRlIGxhIGNhcGE6IHtlcnJvck1lc3NhZ2V9LiBBc3NlZ3VyZXUtdm9zIHF1ZSBlbCBmb3JtYXQgZGUgbGVzIGRhZGVzIGTigJllbnRyYWRhIHNpZ3VpIHbDoGxpZC5cIlxuICB9LFxuICBsYXllclZpc0NvbmZpZ3M6IHtcbiAgICBhbmdsZTogJ0FuZ2xlJyxcbiAgICBzdHJva2VXaWR0aDogJ0FtcGxhZGEgdHJhw6cnLFxuICAgIHN0cm9rZVdpZHRoUmFuZ2U6ICdSYW5nIGFtcGxhZGEgZGUgdHJhw6cnLFxuICAgIHJhZGl1czogJ1JhZGknLFxuICAgIGZpeGVkUmFkaXVzOiAnUmFkaSBmaXhlIGEgbWVzdXJhcicsXG4gICAgZml4ZWRSYWRpdXNEZXNjcmlwdGlvbjogJ0FqdXN0YSBlbCByYWRpIGFsIHJhZGkgYWJzb2x1dCBlbiBtZXRyZXMsIHAuZXggNSBhIDUgbWV0cmVzJyxcbiAgICByYWRpdXNSYW5nZTogJ1JhbmcgZGUgcmFkaScsXG4gICAgY2x1c3RlclJhZGl1czogJ1JhZGkgQ2x1c3RlciBlbiBQaXhlbHMnLFxuICAgIHJhZGl1c1JhbmdlUGl4ZWxzOiAnUmFuZyBkZWwgcmFkaSBlbiBwaXhlbHMnLFxuICAgIGJpbGxib2FyZDogJ01vZGUgZGUgY2FydGVsbGVyYScsXG4gICAgYmlsbGJvYXJkRGVzY3JpcHRpb246ICdPcmllbnRhciBsYSBnZW9tZXRyaWEgY2FwIGEgbGEgY8OgbWVyYScsXG4gICAgZmFkZVRyYWlsOiAnUmFzdHJlIGRlIGRlc3ZhbmltZW50JyxcbiAgICBvcGFjaXR5OiAnT3BhY2l0YXQnLFxuICAgIGNvdmVyYWdlOiAnQ29iZXJ0dXJhJyxcbiAgICBvdXRsaW5lOiAnT3V0bGluZScsXG4gICAgY29sb3JSYW5nZTogJ1JhbmcgZGUgY29sb3InLFxuICAgIHN0cm9rZTogJ1RyYcOnJyxcbiAgICBzdHJva2VDb2xvcjogJ0NvbG9yIGRlIHRyYcOnJyxcbiAgICBzdHJva2VDb2xvclJhbmdlOiAnUmFuZyBkZSBjb2xvciBkZSB0cmHDpycsXG4gICAgdGFyZ2V0Q29sb3I6ICdDb2xvciBkZXN0w60nLFxuICAgIGNvbG9yQWdncmVnYXRpb246ICdBZ3JlZ2FjacOzIGRlIGNvbG9yJyxcbiAgICBoZWlnaHRBZ2dyZWdhdGlvbjogJ0FncmVnYWNpw7MgYWzDp2FkYScsXG4gICAgcmVzb2x1dGlvblJhbmdlOiAnUmFuZyBkZSByZXNvbHVjacOzJyxcbiAgICBzaXplU2NhbGU6ICdNaWRhIGVzY2FsYScsXG4gICAgd29ybGRVbml0U2l6ZTogJ01pZGEgZGUgbGEgdW5pdGF0IG11bmRpYWwnLFxuICAgIGVsZXZhdGlvblNjYWxlOiAnRXNjYWxhIGVsZXZhY2nDsycsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvcjogJ1V0aWxpdHpldSBlbCBmYWN0b3IgZGUgem9vbSBk4oCZZWxldmFjacOzJyxcbiAgICBlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yRGVzY3JpcHRpb246XG4gICAgICBcIidBanVzdGV1IGwnYWzDp2FkYSAvIGVsZXZhY2nDsyBlbiBmdW5jacOzIGRlbCBmYWN0b3IgZGUgem9vbSBhY3R1YWxcIixcbiAgICBlbmFibGVIZWlnaHRab29tRmFjdG9yOiAnVXRpbGl0emV1IGVsIGZhY3RvciBkZSB6b29tIGTigJlhbMOnYWRhJyxcbiAgICBoZWlnaHRTY2FsZTogJ0VzY2FsYSBhbMOnYWRhJyxcbiAgICBjb3ZlcmFnZVJhbmdlOiAnUmFuZyBlZCBjb2JlcnR1cmEnLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmc6ICdSZXByZXNlbnRhY2nDsyBhbHRhIHByZWNpc2nDsycsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZ0Rlc2NyaXB0aW9uOiAnTGEgcHJlY2lzacOzIGFsdGEgdGluZHLDoCByZW5kaW1lbnQgbcOpcyBiYWl4JyxcbiAgICBoZWlnaHQ6ICdBbMOnYWRhJyxcbiAgICBoZWlnaHREZXNjcmlwdGlvbjogJ0ZlcyBjbGljIGFsIGJvdMOzIGEgZGFsdCBhIGxhIGRyZXRhIGRlbCBtYXBhIHBlciBjYW52aWFyIGEgdmlzdGEgM0QnLFxuICAgIGZpbGw6ICdPbXBsZScsXG4gICAgZW5hYmxlUG9seWdvbkhlaWdodDogJ0FjdGl2YSBhbMOnYWRhIGRlbCBwb2zDrWdvbicsXG4gICAgc2hvd1dpcmVmcmFtZTogJ01vc3RyYSBXaXJlZnJhbWUnLFxuICAgIHdlaWdodEludGVuc2l0eTogJ0ludGVuc2l0YXQgZGUgcGVzJyxcbiAgICB6b29tU2NhbGU6ICdFc2NhbGEgZGUgem9vbScsXG4gICAgaGVpZ2h0UmFuZ2U6ICdSYW5nIGFsw6dhZGEnLFxuICAgIGhlaWdodE11bHRpcGxpZXI6IFwiTXVsdGlwbGljYWRvciBkJ2Fsw6dhZGFcIixcbiAgICBmaXhlZEhlaWdodDogJ0Fsw6dhZGEgZml4YScsXG4gICAgZml4ZWRIZWlnaHREZXNjcmlwdGlvbjogXCJVdGlsaXR6ZXUgbCdhbMOnYWRhIHNlbnNlIG1vZGlmaWNhY2lvbnNcIlxuICB9LFxuICBsYXllck1hbmFnZXI6IHtcbiAgICBhZGREYXRhOiAnQWZlZ2VpeCBEYWRlcycsXG4gICAgYWRkTGF5ZXI6ICdBZmVnZWl4IENhcGVzJyxcbiAgICBsYXllckJsZW5kaW5nOiAnQ29tYmluYXIgY2FwZXMnXG4gIH0sXG4gIG1hcE1hbmFnZXI6IHtcbiAgICBtYXBTdHlsZTogJ0VzdGlsIGRlIG1hcGEnLFxuICAgIGFkZE1hcFN0eWxlOiAnQWZlZ2VpeCBlc3RpbHMgZGUgbWFwYScsXG4gICAgJzNkQnVpbGRpbmdDb2xvcic6ICdDb2xvciBlZGlmaWNpIDNEJyxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICdDb2xvciBkZSBmb25zJ1xuICB9LFxuICBsYXllckNvbmZpZ3VyYXRpb246IHtcbiAgICBkZWZhdWx0RGVzY3JpcHRpb246ICdDYWxjdWxhIHtwcm9wZXJ0eX0gc2Vnb25zIGVsIGNhbXAgc2VsZWNjaW9uYXQnLFxuICAgIGhvd1RvOiAnSG93IHRvJ1xuICB9LFxuICBmaWx0ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRmlsdGVyOiAnQWZlZ2VpeCBGaWx0cmUnXG4gIH0sXG4gIGRhdGFzZXRUaXRsZToge1xuICAgIHNob3dEYXRhVGFibGU6ICdNb3N0cmEgdGF1bGEgZGUgZGFkZXMnLFxuICAgIHJlbW92ZURhdGFzZXQ6ICdFbGltaW5hIGNvbmp1bnQgZGUgZGFkZXMnXG4gIH0sXG4gIGRhdGFzZXRJbmZvOiB7XG4gICAgcm93Q291bnQ6ICd7cm93Q291bnR9IGZpbGVzJ1xuICB9LFxuICB0b29sdGlwOiB7XG4gICAgaGlkZUxheWVyOiAnb2N1bHRhIGxhIGNhcGEnLFxuICAgIHNob3dMYXllcjogJ21vc3RyYSBsYSBjYXBhJyxcbiAgICBoaWRlRmVhdHVyZTogXCJBbWFnYSBsJ29iamVjdGVcIixcbiAgICBzaG93RmVhdHVyZTogXCJNb3N0cmEgbCdvYmplY3RlXCIsXG4gICAgaGlkZTogJ2FtYWdhJyxcbiAgICBzaG93OiAnbW9zdHJhJyxcbiAgICByZW1vdmVMYXllcjogJ0VsaW1pbmEgY2FwYScsXG4gICAgcmVzZXRBZnRlckVycm9yOiAnSW50ZW50ZXUgaGFiaWxpdGFyIGxhIGNhcGEgZGVzcHLDqXMgZHVuIGVycm9yJyxcbiAgICBsYXllclNldHRpbmdzOiAnQ29uZmlndXJhY2nDsyBkZSBjYXBhJyxcbiAgICBjbG9zZVBhbmVsOiAnVGFuY2EgcGFuZWwgYWN0dWFsJyxcbiAgICBzd2l0Y2hUb0R1YWxWaWV3OiAnQ2FudmlhIGEgbGEgdmlzdGEgZGUgbWFwYSBkdWFsJyxcbiAgICBzaG93TGVnZW5kOiAnbW9zdHJhIGxsZWdlbmRhJyxcbiAgICBkaXNhYmxlM0RNYXA6ICdEZXNhY3RpdmEgbWFwYSAzRCcsXG4gICAgRHJhd09uTWFwOiAnRGlidWl4YSBhbCBtYXBhJyxcbiAgICBzZWxlY3RMb2NhbGU6ICdTZWxlY2Npb25hIGNvbmZpZ3VyYWNpw7MgcmVnaW9uYWwnLFxuICAgIHNob3dBaUFzc2lzdGFudFBhbmVsOiAnTW9zdHJhIGVsIHRhdWxlciBkZSBBSSBBc3Npc3RhbnQnLFxuICAgIGhpZGVBaUFzc2lzdGFudFBhbmVsOiAnT2N1bHRhIGVsIHRhdWxlciBkZSBBSSBBc3Npc3RhbnQnLFxuICAgIGhpZGVMYXllclBhbmVsOiAnT2N1bHRhIGVsIHRhdWxlciBkZSBjYXBlcycsXG4gICAgc2hvd0xheWVyUGFuZWw6ICdNb3N0cmEgZWwgdGF1bGVyIGRlIGNhcGVzJyxcbiAgICBtb3ZlVG9Ub3A6ICdEZXNwbGHDp2EgYSBkYWx0IGRlIHRvdCBkZSBsZXMgY2FwZXMgZGUgZGFkZXMnLFxuICAgIHNlbGVjdEJhc2VNYXBTdHlsZTogJ1NlbGVjY2lvbmEgZXN0aWwgZGUgbWFwYSBiYXNlJyxcbiAgICBkZWxldGU6ICdFc2JvcnJhJyxcbiAgICB0aW1lUGxheWJhY2s6ICdSZXByb2R1Y2Npw7MgZGUgdGVtcHMnLFxuICAgIGNsb3VkU3RvcmFnZTogJ0VtbWFnYXR6ZW1hdGdlIGFsIG7DunZvbCcsXG4gICAgJzNETWFwJzogJ01hcGEgM0QnLFxuICAgIGFuaW1hdGlvbkJ5V2luZG93OiAnRmluZXN0cmEgVGVtcG9yYWwgTcOyYmlsJyxcbiAgICBhbmltYXRpb25CeUluY3JlbWVudGFsOiAnRmluZXN0cmEgVGVtcG9yYWwgSW5jcmVtZW50YWwnLFxuICAgIHNwZWVkOiAndmVsb2NpdGF0JyxcbiAgICBwbGF5OiAnaW5pY2lhcicsXG4gICAgcGF1c2U6ICdwYXVzYXInLFxuICAgIHJlc2V0OiAncmVpbmljaWFyJ1xuICB9LFxuICB0b29sYmFyOiB7XG4gICAgZXhwb3J0SW1hZ2U6ICdFeHBvcnRhIGltYXRnZScsXG4gICAgZXhwb3J0RGF0YTogJ0V4cG9ydGEgZGFkZXMnLFxuICAgIGV4cG9ydE1hcDogJ0V4cG9ydGEgbWFwYScsXG4gICAgc2hhcmVNYXBVUkw6ICdDb21wYXJ0ZWl4IFVSTCBkZWwgbWFwYScsXG4gICAgc2F2ZU1hcDogJ0Rlc2EgbWFwYScsXG4gICAgc2VsZWN0OiAnc2VsZWNjaW9uYScsXG4gICAgcG9seWdvbjogJ3BvbMOtZ29uJyxcbiAgICByZWN0YW5nbGU6ICdyZWN0YW5nbGUnLFxuICAgIGhpZGU6ICdhbWFnYScsXG4gICAgc2hvdzogJ21vc3RyYScsXG4gICAgLi4uTE9DQUxFU1xuICB9LFxuICBtb2RhbDoge1xuICAgIHRpdGxlOiB7XG4gICAgICBkZWxldGVEYXRhc2V0OiAnRXNib3JyYSBjb25qdW50IGRlIGRhZGVzJyxcbiAgICAgIGFkZERhdGFUb01hcDogJ0FmZWdlaXggZGFkZXMgYWwgbWFwYScsXG4gICAgICBleHBvcnRJbWFnZTogJ0V4cG9ydGEgaW1hdGdlJyxcbiAgICAgIGV4cG9ydERhdGE6ICdFeHBvcnRhIGRhZGVzJyxcbiAgICAgIGV4cG9ydE1hcDogJ0V4cG9ydGEgbWFwYScsXG4gICAgICBhZGRDdXN0b21NYXBib3hTdHlsZTogJ0FmZWdlaXggZXN0aWwgTWFwYm94IHByb3BpJyxcbiAgICAgIHNhdmVNYXA6ICdEZXNhIG1hcGEnLFxuICAgICAgc2hhcmVVUkw6ICdDb21wYXJ0ZWl4IFVSTCdcbiAgICB9LFxuICAgIGJ1dHRvbjoge1xuICAgICAgZGVsZXRlOiAnRXNib3JyYScsXG4gICAgICBkb3dubG9hZDogJ0Rlc2NhcnJlZ2EnLFxuICAgICAgZXhwb3J0OiAnRXhwb3J0YScsXG4gICAgICBhZGRTdHlsZTogJ0FmZWdlaXggZXN0aWwnLFxuICAgICAgc2F2ZTogJ0Rlc2EnLFxuICAgICAgZGVmYXVsdENhbmNlbDogJ0NhbmNlbMK3bGEnLFxuICAgICAgZGVmYXVsdENvbmZpcm06ICdDb25maXJtYSdcbiAgICB9LFxuICAgIGV4cG9ydEltYWdlOiB7XG4gICAgICByYXRpb1RpdGxlOiAnUsOgdGlvJyxcbiAgICAgIHJhdGlvRGVzY3JpcHRpb246ICdFc2N1bGwgcsOgdGlvIHBlciBkaXZlcnNvcyB1c29zLicsXG4gICAgICByYXRpb09yaWdpbmFsU2NyZWVuOiAnUGFudGFsbGEgb3JpZ2luYWwnLFxuICAgICAgcmF0aW9DdXN0b206ICdQZXJzb25hbGl0emF0JyxcbiAgICAgIHJhdGlvNF8zOiAnNDozJyxcbiAgICAgIHJhdGlvMTZfOTogJzE2OjknLFxuICAgICAgcmVzb2x1dGlvblRpdGxlOiAnUmVzb2x1Y2nDsycsXG4gICAgICByZXNvbHV0aW9uRGVzY3JpcHRpb246ICdBbHRhIHJlc29sdWNpw7Mgw6lzIG1pbGxvciBwZXIgYSBsZXMgaW1wcmVzc2lvbnMuJyxcbiAgICAgIG1hcExlZ2VuZFRpdGxlOiAnTGxlZ2VuZGEgZGVsIG1hcGEnLFxuICAgICAgbWFwTGVnZW5kQWRkOiAnQWZlZ2lyIGxsZWdlbmRhIGFsIG1hcGEnXG4gICAgfSxcbiAgICBleHBvcnREYXRhOiB7XG4gICAgICBkYXRhc2V0VGl0bGU6ICdDb25qdW50IGRlIGRhZGVzJyxcbiAgICAgIGRhdGFzZXRTdWJ0aXRsZTogJ0VzY3VsbCBlbHMgY29uanVudHMgZGUgZGFkZXMgcXVlIHZvbHMgZXhwb3J0YXInLFxuICAgICAgYWxsRGF0YXNldHM6ICdUb3RzJyxcbiAgICAgIGRhdGFUeXBlVGl0bGU6ICdUaXB1cyBkZSBkYWRlcycsXG4gICAgICBkYXRhVHlwZVN1YnRpdGxlOiAnRXNjdWxsIGVscyB0aXB1cyBkZSBkYWRlcyBxdWUgdm9scyBleHBvcnRhcicsXG4gICAgICBmaWx0ZXJEYXRhVGl0bGU6ICdGaWx0cmEgZGFkZXMnLFxuICAgICAgZmlsdGVyRGF0YVN1YnRpdGxlOiAnUG90cyBlc2NvbGxpciBleHBvcnRhciBsZXMgZGFkZXMgb3JpZ2luYWxzIG8gbGVzIGZpbHRyYWRlcycsXG4gICAgICBmaWx0ZXJlZERhdGE6ICdEYWRlcyBmaWx0cmFkZXMnLFxuICAgICAgdW5maWx0ZXJlZERhdGE6ICdEYWRlcyBzZW5zZSBmaWx0cmFyJyxcbiAgICAgIGZpbGVDb3VudDogJ3tmaWxlQ291bnR9IEFyeGl1cycsXG4gICAgICByb3dDb3VudDogJ3tyb3dDb3VudH0gRmlsZXMnXG4gICAgfSxcbiAgICBkZWxldGVEYXRhOiB7XG4gICAgICB3YXJuaW5nOiBcImVzdMOgcyBhIHB1bnQgZCdlc2JvcnJhciBhcXVlc3QgY29uanVudCBkZSBkYWRlcy4gQWZlY3RhcsOgIHtsZW5ndGh9IGNhcGVzXCJcbiAgICB9LFxuICAgIGFkZFN0eWxlOiB7XG4gICAgICBwdWJsaXNoVGl0bGU6IFwiMi4gUHVibGljYSBlbCB0ZXUgZXN0aWwgYSBNYXBib3ggbyBwcm9wb3JjaW9uYSBlbCB0b2tlbiBkJ2FjY8Opc1wiLFxuICAgICAgcHVibGlzaFN1YnRpdGxlMTogJ1BvdHMgY3JlYXIgZWwgdGV1IHByb3BpIGVzdGlsIGRlIG1hcGEgYScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUyOiAnaScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUzOiAncHVibGljYXInLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNDogJ2hvLicsXG4gICAgICBwdWJsaXNoU3VidGl0bGU1OiAnUGVyIHV0aWxpdHphciB1biBlc3RpbCBwcml2YXQsIGVuZ2FueGEgZWwgdGV1JyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTY6IFwidG9rZW4gZCdhY2PDqXNcIixcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTc6XG4gICAgICAgICdhcXXDrS4gKmtlcGxlci5nbCDDqXMgdW5hIGFwbGljYWNpw7MgY2xpZW50LCBsZXMgZGFkZXMgcm9tYW5lbiBhbCB0ZXUgbmF2ZWdhZG9yLi4nLFxuICAgICAgZXhhbXBsZVRva2VuOiAncC5leC4gcGsuYWJjZGVmZy54eHh4eHgnLFxuICAgICAgcGFzdGVUaXRsZTogXCIxLiBFbmdhbnhhIGxhIFVSTCBkZSBsJ2VzdGlsXCIsXG4gICAgICBwYXN0ZVN1YnRpdGxlMTogJ1F1w6ggw6lzIHVuJyxcbiAgICAgIHBhc3RlU3VidGl0bGUyOiBcIlVSTCBkZSBsJ2VzdGlsXCIsXG4gICAgICBuYW1pbmdUaXRsZTogJzMuIFBvc2Egbm9tIGFsIHRldSBlc3RpbCdcbiAgICB9LFxuICAgIHNoYXJlTWFwOiB7XG4gICAgICBzaGFyZVVyaVRpdGxlOiAnQ29tcGFydGVpeCBVUkwgZGVsIG1hcGEnLFxuICAgICAgc2hhcmVVcmlTdWJ0aXRsZTogJ0dlbmVyYSB1bmEgVVJMIGRlbCBtYXBhIHBlciBjb21wYXJ0aXIgYW1iIGFsdHJpJyxcbiAgICAgIGNsb3VkVGl0bGU6ICdFbW1hZ2F0emVtYXRnZSBhbCBuw7p2b2wnLFxuICAgICAgY2xvdWRTdWJ0aXRsZTogJ0FjY2VkZWl4IGkgY2FycmVnYSBkYWRlcyBkZSBtYXBhIGFsIHRldSBlbW1hZ2F0emVtYXRnZSBhbCBuw7p2b2wgcGVyc29uYWwnLFxuICAgICAgc2hhcmVEaXNjbGFpbWVyOlxuICAgICAgICAna2VwbGVyLmdsIGRlc2Fyw6AgbGVzIGRhZGVzIGRlbCBtYXBhIGFsIHRldSBlbW1hZ2F0emVtYXRnZSBhbCBuw7p2b2wgcGVyc29uYWwsIG5vbcOpcyBxdWkgdGluZ3VpIGxhIFVSTCBwb2Ryw6AgYWNjZWRpciBhbCBtYXBhIGkgYSBsZXMgZGFkZXMgLiAnICtcbiAgICAgICAgXCJQb3RzIGVkaXRhci9lc2JvcnJhciBsJ2FyeGl1IGRlIGRhZGVzIGVuIGVsIHRldSBjb21wdGUgYWwgbsO6dm9sIGVuIHF1YWxzZXZvbCBtb21lbnQuXCIsXG4gICAgICBnb3RvUGFnZTogJ1ZlcyBhIGxhIHDDoGdpbmEgZGUge2N1cnJlbnRQcm92aWRlcn0gZGUgS2VwbGVyLmdsJ1xuICAgIH0sXG4gICAgc3RhdHVzUGFuZWw6IHtcbiAgICAgIG1hcFVwbG9hZGluZzogJ0NhcnJlZ2FyIHVuIG1hcGEnLFxuICAgICAgZXJyb3I6ICdFcnJvcidcbiAgICB9LFxuICAgIHNhdmVNYXA6IHtcbiAgICAgIHRpdGxlOiAnRW1tYWdhdHplbWF0Z2UgYWwgbsO6dm9sJyxcbiAgICAgIHN1YnRpdGxlOiAnQWNjZWRlaXggcGVyIGRlc2FyIGVsIG1hcGEgYWwgdGV1IGVtbWFnYXR6ZW1hdGdlIGFsIG7DunZvbCdcbiAgICB9LFxuICAgIGV4cG9ydE1hcDoge1xuICAgICAgZm9ybWF0VGl0bGU6ICdGb3JtYXQgZGUgbWFwYScsXG4gICAgICBmb3JtYXRTdWJ0aXRsZTogJ0VzY3VsbCBlbCBmb3JtYXQgYW1iIHF1w6ggdm9scyBleHBvcnRhciBlbCB0ZXUgbWFwYScsXG4gICAgICBodG1sOiB7XG4gICAgICAgIHNlbGVjdGlvbjogJ0V4cG9ydGEgZWwgdGV1IG1hcGEgY29tIHVuIGFyeGl1IEhUTUwgaW50ZXJhY3RpdS4nLFxuICAgICAgICB0b2tlblRpdGxlOiBcIlRva2VuIGQnYWNjw6lzIGRlIE1hcGJveFwiLFxuICAgICAgICB0b2tlblN1YnRpdGxlOiBcIlV0aWxpdHphIGVsIHRldSB0b2tlbiBkJ2FjY8OpcyBkZSBNYXBib3ggYSBsJ2FyeGl1IEhUTUwgKG9wY2lvbmFsKVwiLFxuICAgICAgICB0b2tlblBsYWNlaG9sZGVyOiBcIkVuZ2FueGEgZWwgdGV1IHRva2VuIGQnYWNjw6lzIGEgTWFwYm94XCIsXG4gICAgICAgIHRva2VuTWlzdXNlV2FybmluZzpcbiAgICAgICAgICAnKiBTaSBubyBwcm9wb3JjaW9uZXMgZWwgdGV1IHByb3BpIHRva2VuLCBlbCBtYXBhIHBvZHJpYSBmYWxsYXIgZW4gcXVhbHNldm9sIG1vbWVudCBxdWFuIHJlZW1wbGFjZW0gZWwgbm9zdHJlIHRva2VuIHBlciBldml0YXIgYWJ1c29zLiAnLFxuICAgICAgICB0b2tlbkRpc2NsYWltZXI6XG4gICAgICAgICAgJ1BvdHMgY2FudmlhciBlbCB0b2tlIGRlIE1hcGJveCBtw6lzIGVuZGF2YW50IGZlbnQgc2VydmlyIGFxdWVzdGVzIGluc3RydWNjaW9uczogJyxcbiAgICAgICAgdG9rZW5VcGRhdGU6ICdDb20gYWN0dWFsaXR6YXIgdW4gdG9rZW4gcHJlZXhpc3RlbnQuJyxcbiAgICAgICAgbW9kZVRpdGxlOiAnTW9kZSBtYXBhJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMTogJ1NlbGVjY2lvbmEgbW9kZSBhcHAuIE3DqXMgJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMjogJ2luZm9ybWFjacOzJyxcbiAgICAgICAgbW9kZURlc2NyaXB0aW9uOiAnUGVybWV0IGFscyB1c3VhcmlzIHttb2RlfSBlbCBtYXBhJyxcbiAgICAgICAgcmVhZDogJ2xsZWdpcicsXG4gICAgICAgIGVkaXQ6ICdlZGl0YXInXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICBjb25maWdUaXRsZTogJ0NvbmZpZ3VyYWNpw7MgZGVsIG1hcGEnLFxuICAgICAgICBjb25maWdEaXNjbGFpbWVyOlxuICAgICAgICAgIFwiTGEgY29uZmlndXJhY2nDsyBkZWwgbWFwYSBzJ2luY2xvdXLDoCBhIGwnYXJ4aXUgSnNvbi4gU2kgdXRpbGl0emVzIGtlcGxlci5nbCBhIGxhIHRldmEgcHLDsnBpYSBhcHAgcG90cyBjb3BpYXIgYXF1ZXN0YSBjb25maWd1cmFjacOzIGkgcGFzc2FyLWxhIGEgIFwiLFxuICAgICAgICBzZWxlY3Rpb246XG4gICAgICAgICAgJ0V4cG9ydGEgbGVzIGRhZGVzIGRlbCBtYXBhIGkgbGEgY29uZmlndXJhY2nDsyBlbiB1biBzb2wgYXJ4aXUgSnNvbi4gTcOpcyBlbmRhdmFudCBwb3RzIG9icmlyIGFxdWVzdCBtYXRlaXggbWFwYSBjYXJyZWdhbnQgYXF1ZXN0IG1hdGVpeCBhcnhpdSBhIGtlcGxlci5nbC4nLFxuICAgICAgICBkaXNjbGFpbWVyOlxuICAgICAgICAgIFwiKiBMYSBjb25maWd1cmFjacOzIGRlbCBtYXBhIGVzIGNvbWJpbmEgYW1iIGVscyBjb25qdW50cyBkZSBkYWRlcyBjYXJyZWdhdHMuIOKAmGRhdGFJZOKAmSBzJ3V0aWxpdHphIHBlciBsbGlnYXIgY2FwZXMsIGZpbHRyZXMgaSBzdWdnZXJpbWVudHMgYSB1biBjb25qdW50IGRlIGRhZGVzIGVzcGVjw61maWMuIFwiICtcbiAgICAgICAgICBcIlF1YW4gcGFzc2lzIGFxdWVzdGEgY29uZmlndXJhY2nDsyBhIGFkZERhdGFUb01hcCwgYXNzZWd1cmEgcXVlIGwnaWRlbnRpZmljYWRvciBkZWwgY29uanVudCBkZSBkYWRlcyBjb2luY2lkZWl4aSBhbWIgZWxzIOKAmGRhdGFJZOKAmSBkJ2FxdWVzdGEgY29uZmlndXJhY2nDsy5cIlxuICAgICAgfVxuICAgIH0sXG4gICAgbG9hZGluZ0RpYWxvZzoge1xuICAgICAgbG9hZGluZzogJ0NhcnJlZ2FudC4uLidcbiAgICB9LFxuICAgIGxvYWREYXRhOiB7XG4gICAgICB1cGxvYWQ6ICdDYXJyZWdhciBhcnhpdXMnLFxuICAgICAgc3RvcmFnZTogXCJDYXJyZWdhciBkZXMgZCdlbW1hZ2F0emVtYXRnZVwiXG4gICAgfSxcbiAgICB0cmlwSW5mbzoge1xuICAgICAgdGl0bGU6ICdDb20gaGFiaWxpdGFyIGzigJlhbmltYWNpw7MgZGUgdmlhdGdlJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ1BlciBhbmltYXIgbGEgcnV0YSwgbGVzIGRhZGVzIGdlb0pTT04gaGFuIGRlIGNvbnRlbmlyIGBMaW5lU3RyaW5nYCBlbiBsYSBzZXZhIGdlb21ldHJpYSBpIGxlcyBjb29yZGVuYWRlcyBkZSBMaW5lU3RyaW5nIGhhbiBkZSB0ZW5pciA0IGVsZW1lbnRzIGVuIGVscyBmb3JtYXRzIGRlICcsXG4gICAgICBjb2RlOiAnIFtsb25naXR1ZGUsIGxhdGl0dWRlLCBhbHRpdHVkZSwgdGltZXN0YW1wXSAnLFxuICAgICAgZGVzY3JpcHRpb24yOlxuICAgICAgICAnaSBlbCBkYXJyZXIgZWxlbWVudCBoYSBkZSBzZXIgbGEgbWFyY2EgZGUgdGVtcHMuIEVscyBmb3JtYXRzIHbDoGxpZHMgcGVyIGEgbGEgbWFyY2EgZGUgdGVtcHMgaW5jbG91ZW4gVW5peCBlbiBzZWdvbnMgY29tIGAxNTY0MTg0MzYzYCBvIGVuIG1pbGlzZWdvbnMgY29tIGAxNTY0MTg0MzYzMDAwYC4nLFxuICAgICAgZXhhbXBsZTogJ0V4ZW1wbGU6J1xuICAgIH0sXG4gICAgaWNvbkluZm86IHtcbiAgICAgIHRpdGxlOiAnQ29tIGRpYnVpeGFyIGljb25lcycsXG4gICAgICBkZXNjcmlwdGlvbjE6XG4gICAgICAgIFwiRW4gZWwgdGV1IENTViBjcmVhIHVuYSBjb2x1bW5hIGkgcG9zYS1oaSBlbCBub20gZGUgbGEgaWNvbmEgcXVlIHZvbHMgZGlidWl4YXIuIFBvdHMgZGVpeGFyIGxhIGNlbMK3bGEgYnVpZGEgcXVhbiBubyB2dWxndWlzIHF1ZSBlcyBtb3N0cmkgcGVyIGEgY2VydHMgcHVudHMuIFF1YW4gbGEgY29sdW1uYSBzJ2Fub21lbmFcIixcbiAgICAgIGNvZGU6ICdpY29uJyxcbiAgICAgIGRlc2NyaXB0aW9uMjogXCIga2VwbGVyLmdsIGF1dG9tw6B0aWNhbWVudCBjcmVhcsOgIHVuYSBjYXBhIGQnaWNvbmEuXCIsXG4gICAgICBleGFtcGxlOiAnRXhlbXBsZTonLFxuICAgICAgaWNvbnM6ICdJY29uZXMnXG4gICAgfSxcbiAgICBzdG9yYWdlTWFwVmlld2VyOiB7XG4gICAgICBsYXN0TW9kaWZpZWQ6ICdEYXJyZXJhIG1vZGlmaWNhY2nDsyBmYSB7bGFzdFVwZGF0ZWR9JyxcbiAgICAgIGJhY2s6ICdFbnJlcmUnXG4gICAgfSxcbiAgICBvdmVyd3JpdGVNYXA6IHtcbiAgICAgIHRpdGxlOiAnRGVzYW50IG1hcGEuLi4nLFxuICAgICAgYWxyZWFkeUV4aXN0czogJ2phIGV4aXN0ZWl4IGEge21hcFNhdmVkfS4gRWwgdm9scyBzb2JyZWVzY3JpdXJlPydcbiAgICB9LFxuICAgIGxvYWRTdG9yYWdlTWFwOiB7XG4gICAgICBiYWNrOiAnRW5yZXJlJyxcbiAgICAgIGdvVG9QYWdlOiAnVmVzIGEgbGEgcMOgZ2luYSB7ZGlzcGxheU5hbWV9IGRlIEtlcGxlci5nbCcsXG4gICAgICBzdG9yYWdlTWFwczogJ0VtbWFnYXR6ZW1hdGdlIC8gTWFwZXMnLFxuICAgICAgbm9TYXZlZE1hcHM6ICdDYXAgbWFwYSBkZXNhdCBlbmNhcmEnXG4gICAgfVxuICB9LFxuICBoZWFkZXI6IHtcbiAgICB2aXNpYmxlTGF5ZXJzOiAnQ2FwZXMgdmlzaWJsZXMnLFxuICAgIGxheWVyTGVnZW5kOiAnTGxlZ2VuZGEgZGUgY2FwZXMnXG4gIH0sXG4gIGludGVyYWN0aW9uczoge1xuICAgIHRvb2x0aXA6ICdTdWdnZXJpbWVudCcsXG4gICAgYnJ1c2g6ICdQaW56ZWxsJyxcbiAgICBjb29yZGluYXRlOiAnQ29vcmRlbmFkZXMnLFxuICAgIGdlb2NvZGVyOiAnR2VvY29kaWZpY2Fkb3InXG4gIH0sXG4gIGxheWVyQmxlbmRpbmc6IHtcbiAgICB0aXRsZTogJ0NvbWJpbmFjacOzIGRlIGNhcGVzJyxcbiAgICBhZGRpdGl2ZTogJ2FkZGl0aXZhJyxcbiAgICBub3JtYWw6ICdub3JtYWwnLFxuICAgIHN1YnRyYWN0aXZlOiAnc3Vic3RyYWN0aXZhJ1xuICB9LFxuICBjb2x1bW5zOiB7XG4gICAgdGl0bGU6ICdDb2x1bW5lcycsXG4gICAgbGF0OiAnbGF0JyxcbiAgICBsbmc6ICdsb24nLFxuICAgIGFsdGl0dWRlOiAnYWzDp2FkYScsXG4gICAgaWNvbjogJ2ljb25hJyxcbiAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgYXJjOiB7XG4gICAgICBsYXQwOiAnbGF0IG9yaWdlbicsXG4gICAgICBsbmcwOiAnbG5nIG9yaWdlbiAnLFxuICAgICAgbGF0MTogJ2xhdCBkZXN0aW5hY2nDsycsXG4gICAgICBsbmcxOiAnbG5nIGRlc3RpbmFjacOzJ1xuICAgIH0sXG4gICAgbGluZToge1xuICAgICAgYWx0MDogJ2Fsw6dhZGEgb3JpZ2VuJyxcbiAgICAgIGFsdDE6ICdhbMOnYWRhIGRlc3RpbmFjacOzJ1xuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ01pZGEgZGUgbWFsbGEgKGttKSdcbiAgICB9LFxuICAgIGhleGFnb246IHtcbiAgICAgIHdvcmxkVW5pdFNpemU6IFwiUmFkaSBkJ2hleMOgZ29uIChrbSlcIlxuICAgIH0sXG4gICAgaGV4X2lkOiAnaWQgaGV4J1xuICB9LFxuICBjb2xvcjoge1xuICAgIGN1c3RvbVBhbGV0dGU6ICdQYWxldGEgcGVyc29uYWxpdHphZGEnLFxuICAgIHN0ZXBzOiAnaW50ZXJ2YWxzJyxcbiAgICB0eXBlOiAndGlwdXMnLFxuICAgIHJldmVyc2VkOiAnaW52ZXJ0aWRhJ1xuICB9LFxuICBzY2FsZToge1xuICAgIGNvbG9yU2NhbGU6ICdFc2NhbGEgZGUgY29sb3InLFxuICAgIHNpemVTY2FsZTogJ0VzY2FsYSBkZSBtaWRlcycsXG4gICAgc3Ryb2tlU2NhbGU6ICdFc2NhbGEgZGUgdHJhw6cnLFxuICAgIHNjYWxlOiAnRXNjYWxhJ1xuICB9LFxuICBmaWxlVXBsb2FkZXI6IHtcbiAgICBtZXNzYWdlOiBcIkFycm9zc2VnYSBpIGRlaXhhIGFuYXIgbCdhcnhpdSBhcXXDrVwiLFxuICAgIGNocm9tZU1lc3NhZ2U6XG4gICAgICAnKnVzdWFyaSBkZSBDaHJvbWU6IGxhIG1pZGEgbcOgeGltYSBzw7NuIDI1MG1iLCBzaSBoYXMgZGUgY2FycmdhciB1biBhcnhpdSBtw6lzIGdyYW4gZmVzIHNlcnZpciBTYWZhcmknLFxuICAgIGRpc2NsYWltZXI6XG4gICAgICAnKmtlcGxlci5nbCDDqXMgdW5hIGFwbGljYWNpw7MgYSBsYSBiYW5kYSBjbGllbnQgcXVlIG5vIGVzIHJlY29semEgZW4gY2FwIHNlcnZpZG9yLiBMZXMgZGFkZXMgbm9tw6lzIGV4aXN0ZWl4ZW4gYSBsYSB0ZXZhIG3DoHF1aW5hL25hdmVnYWRvci4gJyArXG4gICAgICBcIk5vIHMnZW52aWVuIGRhZGVzIG5pIG1hcGVzIGEgY2FwIHNlcnZpZG9yLlwiLFxuICAgIGNvbmZpZ1VwbG9hZE1lc3NhZ2U6XG4gICAgICAnQ2FycmVnYSB7ZmlsZUZvcm1hdE5hbWVzfSBvIHVuIG1hcGEgZGVzYXQgZW4gKipKc29uKiouIE3DqXMgaW5mb3JtYWNpw7Mgc29icmUgWyoqc3VwcG9ydGVkIGZpbGUgZm9ybWF0cyoqXScsXG4gICAgYnJvd3NlRmlsZXM6ICduYXZlZ2EgcGVscyB0ZXVzIGFyeGl1cycsXG4gICAgdXBsb2FkaW5nOiAnQ2FycmVnYW50JyxcbiAgICBmaWxlTm90U3VwcG9ydGVkOiBcIkwnYXJ4aXUge2Vycm9yRmlsZXN9IG5vIMOpcyBjb21wYXRpYmxlLlwiLFxuICAgIG9yOiAnbydcbiAgfSxcbiAgZ2VvY29kZXI6IHtcbiAgICB0aXRsZTogJ0ludHJvZHVlaXggdW5hIGFkcmXDp2EnXG4gIH0sXG4gIGZpZWxkU2VsZWN0b3I6IHtcbiAgICBjbGVhckFsbDogJ1RyZXVyZSB0b3RzJyxcbiAgICBmb3JtYXR0aW5nOiAnRm9ybWF0J1xuICB9LFxuICBjb21wYXJlOiB7XG4gICAgbW9kZUxhYmVsOiAnTW9kZSBDb21wYXJhY2nDsycsXG4gICAgdHlwZUxhYmVsOiAnVGlwdXMgZGUgQ29tcGFyYWNpw7MnLFxuICAgIHR5cGVzOiB7XG4gICAgICBhYnNvbHV0ZTogJ0Fic29sdXRhJyxcbiAgICAgIHJlbGF0aXZlOiAnUmVsYXRpdmEnXG4gICAgfVxuICB9LFxuICBtYXBQb3BvdmVyOiB7XG4gICAgcHJpbWFyeTogJ1ByaW5jaXBhbCdcbiAgfSxcbiAgZGVuc2l0eTogJ2RlbnNpdGF0JyxcbiAgJ0J1ZyBSZXBvcnQnOiBcIkluZm9ybWUgZCdlcnJvcnNcIixcbiAgJ1VzZXIgR3VpZGUnOiBcIkd1aWEgZCd1c3VhcmlcIixcbiAgU2F2ZTogJ0Rlc2EnLFxuICBTaGFyZTogJ0NvbXBhcnRlaXgnXG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUdBLElBQUFBLFFBQUEsR0FBQUMsT0FBQTtBQUFtQyxTQUFBQyxRQUFBQyxDQUFBLEVBQUFDLENBQUEsUUFBQUMsQ0FBQSxHQUFBQyxNQUFBLENBQUFDLElBQUEsQ0FBQUosQ0FBQSxPQUFBRyxNQUFBLENBQUFFLHFCQUFBLFFBQUFDLENBQUEsR0FBQUgsTUFBQSxDQUFBRSxxQkFBQSxDQUFBTCxDQUFBLEdBQUFDLENBQUEsS0FBQUssQ0FBQSxHQUFBQSxDQUFBLENBQUFDLE1BQUEsV0FBQU4sQ0FBQSxXQUFBRSxNQUFBLENBQUFLLHdC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