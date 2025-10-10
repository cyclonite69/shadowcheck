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
    weight: 'painotus',
    label: 'nimiö',
    fillColor: 'täyttöväri',
    color: 'väri',
    strokeColor: 'viivan väri',
    radius: 'säde',
    outline: 'ääriviiva',
    stroke: 'viiva',
    density: 'tiheys',
    coverage: 'kattavuus',
    sum: 'summa',
    pointCount: 'pisteiden lukumäärä'
  },
  placeholder: {
    search: 'Etsi',
    selectField: 'Valitse kenttä',
    yAxis: 'Y-akseli',
    selectType: 'Valitse tyyppi',
    selectValue: 'Valitse arvo',
    enterValue: 'Anna arvo',
    empty: 'tyhjä'
  },
  misc: {
    by: '',
    valuesIn: 'Arvot joukossa:',
    valueEquals: 'Arvo on yhtäsuuri kuin',
    dataSource: 'Aineistolähde',
    brushRadius: 'Harjan säde (km)',
    empty: ' '
  },
  mapLayers: {
    title: 'Kartan tasot',
    label: 'Nimiöt',
    road: 'Tiet',
    border: 'Rajat',
    building: 'Rakennukset',
    water: 'Vesi',
    land: 'Maa',
    '3dBuilding': '3d-rakennukset',
    background: 'Tausta'
  },
  panel: {
    text: {
      label: 'Nimiö',
      labelWithId: 'Nimiö {labelId}',
      fontSize: 'Fontin koko',
      fontColor: 'Fontin väri',
      textAnchor: 'Tekstin ankkuri',
      alignment: 'Sijoittelu',
      addMoreLabel: 'Lisää uusia nimiöitä'
    }
  },
  sidebar: {
    panels: {
      layer: 'Tasot',
      filter: 'Suodattimet',
      interaction: 'Interaktiot',
      basemap: 'Taustakartta'
    }
  },
  layer: {
    required: 'Pakollinen*',
    radius: 'Säde',
    weight: 'Painotus',
    propertyBasedOn: '{property} perustuen arvoon',
    color: 'Väri',
    fillColor: 'Täytön väri',
    outline: 'ääriviiva',
    coverage: 'Kattavuus',
    stroke: 'Viiva',
    strokeWidth: 'Viivan paksuus',
    strokeColor: 'Viivan väri',
    basic: 'Perus',
    trailLength: 'Jäljen pituus',
    trailLengthDescription: 'Jäljen kesto sekunteina, ennenkuin se himmenee näkyvistä',
    newLayer: 'uusi taso',
    elevationByDescription: 'Kun asetus on pois päältä, korkeus perustuu pisteiden määrään',
    colorByDescription: 'Kun asetus on pois päältä, väri perustuu pisteiden määrään',
    aggregateBy: 'Aggregoi kenttä {field} by',
    '3DModel': '3D-malli',
    '3DModelOptions': '3D-mallin asetukset',
    type: {
      point: 'piste',
      arc: 'kaari',
      line: 'viiva',
      grid: 'ruudukko',
      hexbin: 'hexbin',
      polygon: 'polygoni',
      geojson: 'geojson',
      cluster: 'klusteri',
      icon: 'kuva',
      heatmap: 'lämpökartta',
      hexagon: 'kuusikulmio',
      hexagonid: 'H3',
      trip: 'matka',
      s2: 'S2',
      '3d': '3D'
    },
    layerUpdateError: 'Tason päivityksen aikana tapahtui virhe: {errorMessage}. Varmista, että syötetietojen muoto on kelvollinen.'
  },
  layerVisConfigs: {
    strokeWidth: 'Viivan paksuus',
    strokeWidthRange: 'Viivan paksuuden rajat',
    radius: 'Säde',
    fixedRadius: 'Vakiosäde metreinä',
    fixedRadiusDescription: 'Kartan säde absoluuttiseksi säteeksi metreinä, esim. 5 -> 5 metriin',
    radiusRange: 'Säteen rajat',
    clusterRadius: 'Klusterien säde pikseleinä',
    radiusRangePixels: 'Säteen rajat pikseleinä',
    billboard: 'Billboard -tila',
    billboardDescription: 'Suuntaa geometria kameraa kohti',
    fadeTrail: 'Häipyvä polku',
    opacity: 'Läpinäkyvyys',
    coverage: 'Kattavuus',
    outline: 'Ääriviiva',
    colorRange: 'Värien rajat',
    stroke: 'Viiva',
    strokeColor: 'Viivan väri',
    strokeColorRange: 'Viivan värin rajat',
    targetColor: 'Kohteen väri',
    colorAggregation: 'Värien aggregointi',
    heightAggregation: 'Korkeuden aggregointi',
    resolutionRange: 'Resoluution rajat',
    sizeScale: 'Koon skaala',
    worldUnitSize: 'Yksikkö',
    elevationScale: 'Korottamisen skaala',
    enableElevationZoomFactor: 'Käytä korkeuden zoomauskerrointa',
    enableElevationZoomFactorDescription: 'Säädä korkeus / korkeus nykyisen zoomauskertoimen perusteella',
    enableHeightZoomFactor: 'Käytä korkeuden zoomauskerrointa',
    heightScale: 'Korkeuden skaala',
    coverageRange: 'Peittävyyden rajat',
    highPrecisionRendering: 'Tarkka renderöinti',
    highPrecisionRenderingDescription: 'Tarkka renderöinti johtaa hitaampaan suorittamiseen',
    height: 'Korkeus',
    heightDescription: 'Klikkaa oikeasta ylänurkasta nappia vaihtaaksesi 3D-näkymään',
    fill: 'Täyttö',
    enablePolygonHeight: 'Salli polygonien korkeus',
    showWireframe: 'Näytä rautalankamalli',
    weightIntensity: 'Painotuksen intensiteetti',
    zoomScale: 'Zoomausskaala',
    heightRange: 'Korkeuden rajat',
    heightMultiplier: 'Korkeuskerroin',
    fixedHeight: 'Kiinteä korkeus',
    fixedHeightDescription: 'Käytä korkeutta ilman muutoksia'
  },
  layerManager: {
    addData: 'Lisää aineisto',
    addLayer: 'Lisää taso',
    layerBlending: 'Tasojen sekoittuvuus'
  },
  mapManager: {
    mapStyle: 'Kartan tyyli',
    addMapStyle: 'Lisää tyyli kartalle',
    '3dBuildingColor': '3D-rakennusten väri',
    backgroundColor: 'Taustaväri'
  },
  layerConfiguration: {
    defaultDescription: 'Laske suureen {property} arvo valitun kentän perusteella',
    howTo: 'Miten toimii'
  },
  filterManager: {
    addFilter: 'Lisää suodatin'
  },
  datasetTitle: {
    showDataTable: 'Näytä attribuuttitaulu',
    removeDataset: 'Poista aineisto'
  },
  datasetInfo: {
    rowCount: '{rowCount} riviä'
  },
  tooltip: {
    hideLayer: 'Piilota taso',
    showLayer: 'Näytä taso',
    hideFeature: 'Piilota kohde',
    showFeature: 'Näytä kohde',
    hide: 'piilota',
    show: 'näytä',
    removeLayer: 'Poista taso',
    resetAfterError: 'Yritä ottaa taso käyttöön virheen jälkeen',
    layerSettings: 'Tason asetukset',
    closePanel: 'Sulje paneeli',
    switchToDualView: 'Vaihda kaksoiskarrtanäkymään',
    showLegend: 'Näytä selite',
    disable3DMap: 'Poistu 3D-näkymästä',
    DrawOnMap: 'Piirrä kartalle',
    selectLocale: 'Valitse kielisyys',
    showAiAssistantPanel: 'Näytä AI-apuohjelman paneeli',
    hideAiAssistantPanel: 'Piilota AI-apuohjelman paneeli',
    hideLayerPanel: 'Piilota tasopaneeli',
    showLayerPanel: 'Näytä tasopaneeli',
    moveToTop: 'Siirrä tasojen päällimmäiseksi',
    selectBaseMapStyle: 'Valitse taustakarttatyyli',
    "delete": 'Poista',
    timePlayback: 'Ajan animointi',
    cloudStorage: 'Pilvitallennus',
    '3DMap': '3D-näkymä'
  },
  toolbar: _objectSpread({
    exportImage: 'Vie kuva',
    exportData: 'Vie aineistot',
    exportMap: 'Vie kartta',
    shareMapURL: 'Jaa kartan URL',
    saveMap: 'Tallenna kartta',
    select: 'valitse',
    polygon: 'polygoni',
    rectangle: 'nelikulmio',
    hide: 'piilota',
    show: 'näytä'
  }, _locales.LOCALES),
  modal: {
    title: {
      deleteDataset: 'Poista aineisto',
      addDataToMap: 'Lisää aineistoja kartalle',
      exportImage: 'Vie kuva',
      exportData: 'Vie aineistot',
      exportMap: 'Vie kartta',
      addCustomMapboxStyle: 'Lisää oma Mapbox-tyyli',
      saveMap: 'Tallenna kartta',
      shareURL: 'Jaa URL'
    },
    button: {
      "delete": 'Poista',
      download: 'Lataa',
      "export": 'Vie',
      addStyle: 'Lisää tyyli',
      save: 'Tallenna',
      defaultCancel: 'Peru',
      defaultConfirm: 'Vahvista'
    },
    exportImage: {
      ratioTitle: 'Kuvasuhde',
      ratioDescription: 'Valitse sopiva kuvasuhde käyttötapaustasi varten.',
      ratioOriginalScreen: 'Alkuperäinen näyttö',
      ratioCustom: 'Kustomoitu',
      ratio4_3: '4:3',
      ratio16_9: '16:9',
      resolutionTitle: 'Resoluutio',
      resolutionDescription: 'Korkea resoluutio on parempi tulostamista varten.',
      mapLegendTitle: 'Kartan selite',
      mapLegendAdd: 'Lisää selite karttaan'
    },
    exportData: {
      datasetTitle: 'Aineistot',
      datasetSubtitle: 'Valitse aineisto, jonka aiot viedä',
      allDatasets: 'Kaikki',
      dataTypeTitle: 'Aineistojen formaatti',
      dataTypeSubtitle: 'Valitse aineistoformaatti valitsemillesi aineistoille',
      filterDataTitle: 'Suodata aineistoja',
      filterDataSubtitle: 'Voit viedä joko alkuperäiset aineistot tai suodatetut aineistot',
      filteredData: 'Suodatetut aineistot',
      unfilteredData: 'Suodattamattomat aineistot',
      fileCount: '{fileCount} tiedostoa',
      rowCount: '{rowCount} riviä'
    },
    deleteData: {
      warning: 'aiot poistaa tämän aineiston. Aineostoa käyttävien tasojen lukumäärä: {length}'
    },
    addStyle: {
      publishTitle: '1. Julkaise tyylisi Mapboxissa tai anna tunniste',
      publishSubtitle1: 'Voit luoda oman karttatyylisi sivulla',
      publishSubtitle2: 'ja',
      publishSubtitle3: 'julkaista',
      publishSubtitle4: 'sen.',
      publishSubtitle5: 'Käyttääksesi yksityistä tyyliä, liitä',
      publishSubtitle6: 'tunnisteesi',
      publishSubtitle7: 'tänne. *kepler.gl on client-side sovellus, data pysyy vain selaimessasi...',
      exampleToken: 'esim. pk.abcdefg.xxxxxx',
      pasteTitle: '2. Liitä tyyli-URL',
      pasteSubtitle1: 'Mikä on',
      pasteSubtitle2: 'tyyli-URL?',
      namingTitle: '3. Nimeä tyylisi'
    },
    shareMap: {
      shareUriTitle: 'Jaa kartan URL',
      shareUriSubtitle: 'Luo kartalle URL, jonka voit jakaa muiden kanssa',
      cloudTitle: 'Pilvitallennus',
      cloudSubtitle: 'Kirjaudu sisään ja lataa kartta ja aineistot henkilökohtaiseen pilvipalveluun',
      shareDisclaimer: 'kepler.gl tallentaa kartan datan henkilökohtaiseen pilvitallennustilaasi, vain ihmiset, joilla on URL, voivat päästä käsiksi karttaan ja aineistoihin. ' + 'Voit muokata tiedostoja tai poistaa ne pilvipalvelustasi milloin vain.',
      gotoPage: 'Mene Kepler.gl {currentProvider} sivullesi'
    },
    statusPanel: {
      mapUploading: 'Karttaa ladataan',
      error: 'Virhe'
    },
    saveMap: {
      title: 'Pilvitallennus',
      subtitle: 'Kirjaudu sisään pilvipalveluusi tallentaaksesi kartan'
    },
    exportMap: {
      formatTitle: 'Kartan formaatti',
      formatSubtitle: 'Valitse formaatti, jossa viet kartan',
      html: {
        selection: 'Vie kartta interaktiivisena html-tiedostona',
        tokenTitle: 'Mapbox-tunniste',
        tokenSubtitle: 'Käytä omaa Mapbox-tunnistettasi html-tiedostossa (valinnainen)',
        tokenPlaceholder: 'Liitä Mapbox-tunnisteesi',
        tokenMisuseWarning: '* Jos et käytä omaa tunnistettasi, kartta voi lakata toimimasta milloin vain kun vaihdamme omaa tunnistettamme väärinkäytön estämiseksi. ',
        tokenDisclaimer: 'Voit vaihtaa Mapbox-tunnisteesi näiden ohjeiden avulla: ',
        tokenUpdate: 'Kuinka vaihtaa olemassaoleva Mapbox-tunniste',
        modeTitle: 'Kartan tila',
        modeSubtitle1: 'Valitse kartan tila.',
        modeSubtitle2: 'Lisätietoja',
        modeDescription: 'Anna käyttäjien {mode} karttaa',
        read: 'lukea',
        edit: 'muokata'
      },
      json: {
        configTitle: 'Kartan asetukset',
        configDisclaimer: 'Kartan asetukset sisältyvät Json-tiedostoon. Jos käytät kirjastoa kepler.gl omassa sovelluksessasi. Voit kopioida asetukset ja antaa ne funktiolle: ',
        selection: 'Vie kyseisen kartan aineistot ja asetukset yhdessä json-tiedostossa. Voit myöhemmin avata saman kartan lataamalla tiedoston kepler.gl:n',
        disclaimer: '* Kartan asetukset ovat sidoksissa ladattuihin aineistoihin. Arvoa ‘dataId’ käytetään tasojen, suodattimien ja vihjeiden liittämiseksi tiettyyn aineistoon. ' + 'Varmista, että aineiston dataId:t vastaavat asetusten arvoja jos lataat asetukset käyttäen `addDataToMap`-funktiolle.'
      }
    },
    loadingDialog: {
      loading: 'Ladataan...'
    },
    loadData: {
      upload: 'Lataa tiedostot',
      storage: 'Lataa tallennustilasta'
    },
    tripInfo: {
      title: 'Kuinka käyttää matka-animaatiota',
      description1: 'Reitin animoimiseksi geoJSON-aineiston täytyy olla geometriatyypiltään `LineString`, LineString-koordinaattien täytyy sisältää 4 elementtiä formaatissa:',
      code: ' [pituusaste, leveysaste, korkeus, aikaleima] ',
      description2: 'siten, että viimeinen elementti on aikaleima. Aikaleima voi olla muodoltaan unix-sekunteja, kuten `1564184363` tai millisekunteja, kuten `1564184363000`.',
      example: 'Esimerkki:'
    },
    iconInfo: {
      title: 'Miten piirtää kuvia',
      description1: 'csv-tiedostossasi, luo sarake nimeltä icon. Voit jättää sen tyhjäksi jos et halua piirtää kuvaa joillain pisteillä. Kun sarakkeen nimi on ',
      code: 'icon',
      description2: ' kepler.gl luo automaattisesti kuvatason sinua varten.',
      example: 'Esimerkki:',
      icons: 'Kuvat'
    },
    storageMapViewer: {
      lastModified: 'Viimeksi muokattu {lastUpdated} sitten',
      back: 'Takaisin'
    },
    overwriteMap: {
      title: 'Tallennetaan karttaa...',
      alreadyExists: 'on jo {mapSaved}:ssa. Haluatko ylikirjoittaa sen?'
    },
    loadStorageMap: {
      back: 'Takaisin',
      goToPage: 'Mene Kepler.gl {displayName} sivullesi',
      storageMaps: 'Tallennus / Kartat',
      noSavedMaps: 'Ei tallennettuja karttoja vielä'
    }
  },
  header: {
    visibleLayers: 'Näkyvissä olevat tasot',
    layerLegend: 'Tason selite'
  },
  interactions: {
    tooltip: 'Vihje',
    brush: 'Harja',
    coordinate: 'Koordinaatit'
  },
  layerBlending: {
    title: 'Tasojen sekoittuvuus',
    additive: 'lisäävä',
    normal: 'normaali',
    subtractive: 'vähentävä'
  },
  columns: {
    title: 'Sarakkeet',
    lat: 'lat',
    lng: 'lng',
    altitude: 'korkeus',
    icon: 'kuva',
    geojson: 'geojson',
    arc: {
      lat0: 'lähdön lat',
      lng0: 'lähdön lng',
      lat1: 'kohteen lat',
      lng1: 'kohteen lng'
    },
    line: {
      alt0: 'lähteen korkeus',
      alt1: 'kohde korkeus'
    },
    grid: {
      worldUnitSize: 'Ruutujen koko (km)'
    },
    hexagon: {
      worldUnitSize: 'Hexagonien säde (km)'
    }
  },
  color: {
    customPalette: 'Mukautettu paletti',
    steps: 'askeleet',
    type: 'tyyppi',
    reversed: 'käänteinen'
  },
  scale: {
    colorScale: 'Värin skaala',
    sizeScale: 'Koon skaala',
    strokeScale: 'Viivan paksuuden skaala',
    scale: 'Skaala'
  },
  fileUploader: {
    message: 'Raahaa ja pudota tiedostosi tänne',
    chromeMessage: '*Chromen käyttäjä: Rajoita tiedostokokosi 250Mb:hen. Jos haluat suurempia tiedostoja, kokeile Safaria',
    disclaimer: '*kepler.gl on client-side sovellus, data pysyy vain selaimessasi...' + 'Tietoja ei lähetetä palvelimelle.',
    configUploadMessage: 'Lisää {fileFormatNames} tai tallennettu kartta **Json**. Lue lisää [**tuetuista formaateista**]',
    browseFiles: 'selaa tiedostojasi',
    uploading: 'ladataan',
    fileNotSupported: 'Tiedosto {errorFiles} ei ole tuettu.',
    or: 'tai'
  },
  density: 'tiheys',
  'Bug Report': 'Bugiraportointi',
  'User Guide': 'Opas',
  Save: 'Tallenna',
  Share: 'Jaa'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsInN0cm9rZUNvbG9yIiwicmFkaXVzIiwib3V0bGluZSIsInN0cm9rZSIsImRlbnNpdHkiLCJjb3ZlcmFnZSIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJiYWNrZ3JvdW5kIiwicGFuZWwiLCJ0ZXh0IiwibGFiZWxXaXRoSWQiLCJmb250U2l6ZSIsImZvbnRDb2xvciIsInRleHRBbmNob3IiLCJhbGlnbm1lbnQiLCJhZGRNb3JlTGFiZWwiLCJzaWRlYmFyIiwicGFuZWxzIiwibGF5ZXIiLCJpbnRlcmFjdGlvbiIsImJhc2VtYXAiLCJyZXF1aXJlZCIsInByb3BlcnR5QmFzZWRPbiIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsInN0cm9rZVdpZHRoUmFuZ2UiLCJmaXhlZFJhZGl1cyIsImZpeGVkUmFkaXVzRGVzY3JpcHRpb24iLCJyYWRpdXNSYW5nZSIsImNsdXN0ZXJSYWRpdXMiLCJyYWRpdXNSYW5nZVBpeGVscyIsImJpbGxib2FyZCIsImJpbGxib2FyZERlc2NyaXB0aW9uIiwiZmFkZVRyYWlsIiwib3BhY2l0eSIsImNvbG9yUmFuZ2UiLCJzdHJva2VDb2xvclJhbmdlIiwidGFyZ2V0Q29sb3IiLCJjb2xvckFnZ3JlZ2F0aW9uIiwiaGVpZ2h0QWdncmVnYXRpb24iLCJyZXNvbHV0aW9uUmFuZ2UiLCJzaXplU2NhbGUiLCJ3b3JsZFVuaXRTaXplIiwiZWxldmF0aW9uU2NhbGUiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yIiwiZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvckRlc2NyaXB0aW9uIiwiZW5hYmxlSGVpZ2h0Wm9vbUZhY3RvciIsImhlaWdodFNjYWxlIiwiY292ZXJhZ2VSYW5nZSIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmciLCJoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb24iLCJoZWlnaHQiLCJoZWlnaHREZXNjcmlwdGlvbiIsImZpbGwiLCJlbmFibGVQb2x5Z29uSGVpZ2h0Iiwic2hvd1dpcmVmcmFtZSIsIndlaWdodEludGVuc2l0eSIsInpvb21TY2FsZSIsImhlaWdodFJhbmdlIiwiaGVpZ2h0TXVsdGlwbGllciIsImZpeGVkSGVpZ2h0IiwiZml4ZWRIZWlnaHREZXNjcmlwdGlvbiIsImxheWVyTWFuYWdlciIsImFkZERhdGEiLCJhZGRMYXllciIsImxheWVyQmxlbmRpbmciLCJtYXBNYW5hZ2VyIiwibWFwU3R5bGUiLCJhZGRNYXBTdHlsZSIsImJhY2tncm91bmRDb2xvciIsImxheWVyQ29uZmlndXJhdGlvbiIsImRlZmF1bHREZXNjcmlwdGlvbiIsImhvd1RvIiwiZmlsdGVyTWFuYWdlciIsImFkZEZpbHRlciIsImRhdGFzZXRUaXRsZSIsInNob3dEYXRhVGFibGUiLCJyZW1vdmVEYXRhc2V0IiwiZGF0YXNldEluZm8iLCJyb3dDb3VudCIsInRvb2x0aXAiLCJoaWRlTGF5ZXIiLCJzaG93TGF5ZXIiLCJoaWRlRmVhdHVyZSIsInNob3dGZWF0dXJlIiwiaGlkZSIsInNob3ciLCJyZW1vdmVMYXllciIsInJlc2V0QWZ0ZXJFcnJvciIsImxheWVyU2V0dGluZ3MiLCJjbG9zZVBhbmVsIiwic3dpdGNoVG9EdWFsVmlldyIsInNob3dMZWdlbmQiLCJkaXNhYmxlM0RNYXAiLCJEcmF3T25NYXAiLCJzZWxlY3RMb2NhbGUiLCJzaG93QWlBc3Npc3RhbnRQYW5lbCIsImhpZGVBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUxheWVyUGFuZWwiLCJzaG93TGF5ZXJQYW5lbCIsIm1vdmVUb1RvcCIsInNlbGVjdEJhc2VNYXBTdHlsZSIsInRpbWVQbGF5YmFjayIsImNsb3VkU3RvcmFnZSIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImFkZGl0aXZlIiwibm9ybWFsIiwic3VidHJhY3RpdmUiLCJjb2x1bW5zIiwibGF0IiwibG5nIiwiYWx0aXR1ZGUiLCJsYXQwIiwibG5nMCIsImxhdDEiLCJsbmcxIiwiYWx0MCIsImFsdDEiLCJjdXN0b21QYWxldHRlIiwic3RlcHMiLCJyZXZlcnNlZCIsInNjYWxlIiwiY29sb3JTY2FsZSIsInN0cm9rZVNjYWxlIiwiZmlsZVVwbG9hZGVyIiwibWVzc2FnZSIsImNocm9tZU1lc3NhZ2UiLCJjb25maWdVcGxvYWRNZXNzYWdlIiwiYnJvd3NlRmlsZXMiLCJ1cGxvYWRpbmciLCJmaWxlTm90U3VwcG9ydGVkIiwib3IiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbG9jYWxpemF0aW9uL3NyYy90cmFuc2xhdGlvbnMvZmkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IE1JVFxuLy8gQ29weXJpZ2h0IGNvbnRyaWJ1dG9ycyB0byB0aGUga2VwbGVyLmdsIHByb2plY3RcblxuaW1wb3J0IHtMT0NBTEVTfSBmcm9tICcuLi9sb2NhbGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wZXJ0eToge1xuICAgIHdlaWdodDogJ3BhaW5vdHVzJyxcbiAgICBsYWJlbDogJ25pbWnDticsXG4gICAgZmlsbENvbG9yOiAndMOkeXR0w7Z2w6RyaScsXG4gICAgY29sb3I6ICd2w6RyaScsXG4gICAgc3Ryb2tlQ29sb3I6ICd2aWl2YW4gdsOkcmknLFxuICAgIHJhZGl1czogJ3PDpGRlJyxcbiAgICBvdXRsaW5lOiAnw6TDpHJpdmlpdmEnLFxuICAgIHN0cm9rZTogJ3ZpaXZhJyxcbiAgICBkZW5zaXR5OiAndGloZXlzJyxcbiAgICBjb3ZlcmFnZTogJ2thdHRhdnV1cycsXG4gICAgc3VtOiAnc3VtbWEnLFxuICAgIHBvaW50Q291bnQ6ICdwaXN0ZWlkZW4gbHVrdW3DpMOkcsOkJ1xuICB9LFxuICBwbGFjZWhvbGRlcjoge1xuICAgIHNlYXJjaDogJ0V0c2knLFxuICAgIHNlbGVjdEZpZWxkOiAnVmFsaXRzZSBrZW50dMOkJyxcbiAgICB5QXhpczogJ1ktYWtzZWxpJyxcbiAgICBzZWxlY3RUeXBlOiAnVmFsaXRzZSB0eXlwcGknLFxuICAgIHNlbGVjdFZhbHVlOiAnVmFsaXRzZSBhcnZvJyxcbiAgICBlbnRlclZhbHVlOiAnQW5uYSBhcnZvJyxcbiAgICBlbXB0eTogJ3R5aGrDpCdcbiAgfSxcbiAgbWlzYzoge1xuICAgIGJ5OiAnJyxcbiAgICB2YWx1ZXNJbjogJ0Fydm90IGpvdWtvc3NhOicsXG4gICAgdmFsdWVFcXVhbHM6ICdBcnZvIG9uIHlodMOkc3V1cmkga3VpbicsXG4gICAgZGF0YVNvdXJjZTogJ0FpbmVpc3RvbMOkaGRlJyxcbiAgICBicnVzaFJhZGl1czogJ0hhcmphbiBzw6RkZSAoa20pJyxcbiAgICBlbXB0eTogJyAnXG4gIH0sXG4gIG1hcExheWVyczoge1xuICAgIHRpdGxlOiAnS2FydGFuIHRhc290JyxcbiAgICBsYWJlbDogJ05pbWnDtnQnLFxuICAgIHJvYWQ6ICdUaWV0JyxcbiAgICBib3JkZXI6ICdSYWphdCcsXG4gICAgYnVpbGRpbmc6ICdSYWtlbm51a3NldCcsXG4gICAgd2F0ZXI6ICdWZXNpJyxcbiAgICBsYW5kOiAnTWFhJyxcbiAgICAnM2RCdWlsZGluZyc6ICczZC1yYWtlbm51a3NldCcsXG4gICAgYmFja2dyb3VuZDogJ1RhdXN0YSdcbiAgfSxcbiAgcGFuZWw6IHtcbiAgICB0ZXh0OiB7XG4gICAgICBsYWJlbDogJ05pbWnDticsXG4gICAgICBsYWJlbFdpdGhJZDogJ05pbWnDtiB7bGFiZWxJZH0nLFxuICAgICAgZm9udFNpemU6ICdGb250aW4ga29rbycsXG4gICAgICBmb250Q29sb3I6ICdGb250aW4gdsOkcmknLFxuICAgICAgdGV4dEFuY2hvcjogJ1Rla3N0aW4gYW5ra3VyaScsXG4gICAgICBhbGlnbm1lbnQ6ICdTaWpvaXR0ZWx1JyxcbiAgICAgIGFkZE1vcmVMYWJlbDogJ0xpc8Okw6QgdXVzaWEgbmltacO2aXTDpCdcbiAgICB9XG4gIH0sXG4gIHNpZGViYXI6IHtcbiAgICBwYW5lbHM6IHtcbiAgICAgIGxheWVyOiAnVGFzb3QnLFxuICAgICAgZmlsdGVyOiAnU3VvZGF0dGltZXQnLFxuICAgICAgaW50ZXJhY3Rpb246ICdJbnRlcmFrdGlvdCcsXG4gICAgICBiYXNlbWFwOiAnVGF1c3Rha2FydHRhJ1xuICAgIH1cbiAgfSxcbiAgbGF5ZXI6IHtcbiAgICByZXF1aXJlZDogJ1Bha29sbGluZW4qJyxcbiAgICByYWRpdXM6ICdTw6RkZScsXG4gICAgd2VpZ2h0OiAnUGFpbm90dXMnLFxuICAgIHByb3BlcnR5QmFzZWRPbjogJ3twcm9wZXJ0eX0gcGVydXN0dWVuIGFydm9vbicsXG4gICAgY29sb3I6ICdWw6RyaScsXG4gICAgZmlsbENvbG9yOiAnVMOkeXTDtm4gdsOkcmknLFxuICAgIG91dGxpbmU6ICfDpMOkcml2aWl2YScsXG4gICAgY292ZXJhZ2U6ICdLYXR0YXZ1dXMnLFxuICAgIHN0cm9rZTogJ1ZpaXZhJyxcbiAgICBzdHJva2VXaWR0aDogJ1ZpaXZhbiBwYWtzdXVzJyxcbiAgICBzdHJva2VDb2xvcjogJ1ZpaXZhbiB2w6RyaScsXG4gICAgYmFzaWM6ICdQZXJ1cycsXG4gICAgdHJhaWxMZW5ndGg6ICdKw6RsamVuIHBpdHV1cycsXG4gICAgdHJhaWxMZW5ndGhEZXNjcmlwdGlvbjogJ0rDpGxqZW4ga2VzdG8gc2VrdW50ZWluYSwgZW5uZW5rdWluIHNlIGhpbW1lbmVlIG7DpGt5dmlzdMOkJyxcbiAgICBuZXdMYXllcjogJ3V1c2kgdGFzbycsXG4gICAgZWxldmF0aW9uQnlEZXNjcmlwdGlvbjogJ0t1biBhc2V0dXMgb24gcG9pcyBww6TDpGx0w6QsIGtvcmtldXMgcGVydXN0dXUgcGlzdGVpZGVuIG3DpMOkcsOkw6RuJyxcbiAgICBjb2xvckJ5RGVzY3JpcHRpb246ICdLdW4gYXNldHVzIG9uIHBvaXMgcMOkw6RsdMOkLCB2w6RyaSBwZXJ1c3R1dSBwaXN0ZWlkZW4gbcOkw6Ryw6TDpG4nLFxuICAgIGFnZ3JlZ2F0ZUJ5OiAnQWdncmVnb2kga2VudHTDpCB7ZmllbGR9IGJ5JyxcbiAgICAnM0RNb2RlbCc6ICczRC1tYWxsaScsXG4gICAgJzNETW9kZWxPcHRpb25zJzogJzNELW1hbGxpbiBhc2V0dWtzZXQnLFxuICAgIHR5cGU6IHtcbiAgICAgIHBvaW50OiAncGlzdGUnLFxuICAgICAgYXJjOiAna2FhcmknLFxuICAgICAgbGluZTogJ3ZpaXZhJyxcbiAgICAgIGdyaWQ6ICdydXVkdWtrbycsXG4gICAgICBoZXhiaW46ICdoZXhiaW4nLFxuICAgICAgcG9seWdvbjogJ3BvbHlnb25pJyxcbiAgICAgIGdlb2pzb246ICdnZW9qc29uJyxcbiAgICAgIGNsdXN0ZXI6ICdrbHVzdGVyaScsXG4gICAgICBpY29uOiAna3V2YScsXG4gICAgICBoZWF0bWFwOiAnbMOkbXDDtmthcnR0YScsXG4gICAgICBoZXhhZ29uOiAna3V1c2lrdWxtaW8nLFxuICAgICAgaGV4YWdvbmlkOiAnSDMnLFxuICAgICAgdHJpcDogJ21hdGthJyxcbiAgICAgIHMyOiAnUzInLFxuICAgICAgJzNkJzogJzNEJ1xuICAgIH0sXG4gICAgbGF5ZXJVcGRhdGVFcnJvcjpcbiAgICAgICdUYXNvbiBww6Rpdml0eWtzZW4gYWlrYW5hIHRhcGFodHVpIHZpcmhlOiB7ZXJyb3JNZXNzYWdlfS4gVmFybWlzdGEsIGV0dMOkIHN5w7Z0ZXRpZXRvamVuIG11b3RvIG9uIGtlbHZvbGxpbmVuLidcbiAgfSxcbiAgbGF5ZXJWaXNDb25maWdzOiB7XG4gICAgc3Ryb2tlV2lkdGg6ICdWaWl2YW4gcGFrc3V1cycsXG4gICAgc3Ryb2tlV2lkdGhSYW5nZTogJ1ZpaXZhbiBwYWtzdXVkZW4gcmFqYXQnLFxuICAgIHJhZGl1czogJ1PDpGRlJyxcbiAgICBmaXhlZFJhZGl1czogJ1Zha2lvc8OkZGUgbWV0cmVpbsOkJyxcbiAgICBmaXhlZFJhZGl1c0Rlc2NyaXB0aW9uOiAnS2FydGFuIHPDpGRlIGFic29sdXV0dGlzZWtzaSBzw6R0ZWVrc2kgbWV0cmVpbsOkLCBlc2ltLiA1IC0+IDUgbWV0cmlpbicsXG4gICAgcmFkaXVzUmFuZ2U6ICdTw6R0ZWVuIHJhamF0JyxcbiAgICBjbHVzdGVyUmFkaXVzOiAnS2x1c3RlcmllbiBzw6RkZSBwaWtzZWxlaW7DpCcsXG4gICAgcmFkaXVzUmFuZ2VQaXhlbHM6ICdTw6R0ZWVuIHJhamF0IHBpa3NlbGVpbsOkJyxcbiAgICBiaWxsYm9hcmQ6ICdCaWxsYm9hcmQgLXRpbGEnLFxuICAgIGJpbGxib2FyZERlc2NyaXB0aW9uOiAnU3V1bnRhYSBnZW9tZXRyaWEga2FtZXJhYSBrb2h0aScsXG4gICAgZmFkZVRyYWlsOiAnSMOkaXB5dsOkIHBvbGt1JyxcbiAgICBvcGFjaXR5OiAnTMOkcGluw6RreXZ5eXMnLFxuICAgIGNvdmVyYWdlOiAnS2F0dGF2dXVzJyxcbiAgICBvdXRsaW5lOiAnw4TDpHJpdmlpdmEnLFxuICAgIGNvbG9yUmFuZ2U6ICdWw6RyaWVuIHJhamF0JyxcbiAgICBzdHJva2U6ICdWaWl2YScsXG4gICAgc3Ryb2tlQ29sb3I6ICdWaWl2YW4gdsOkcmknLFxuICAgIHN0cm9rZUNvbG9yUmFuZ2U6ICdWaWl2YW4gdsOkcmluIHJhamF0JyxcbiAgICB0YXJnZXRDb2xvcjogJ0tvaHRlZW4gdsOkcmknLFxuICAgIGNvbG9yQWdncmVnYXRpb246ICdWw6RyaWVuIGFnZ3JlZ29pbnRpJyxcbiAgICBoZWlnaHRBZ2dyZWdhdGlvbjogJ0tvcmtldWRlbiBhZ2dyZWdvaW50aScsXG4gICAgcmVzb2x1dGlvblJhbmdlOiAnUmVzb2x1dXRpb24gcmFqYXQnLFxuICAgIHNpemVTY2FsZTogJ0tvb24gc2thYWxhJyxcbiAgICB3b3JsZFVuaXRTaXplOiAnWWtzaWtrw7YnLFxuICAgIGVsZXZhdGlvblNjYWxlOiAnS29yb3R0YW1pc2VuIHNrYWFsYScsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvcjogJ0vDpHl0w6Qga29ya2V1ZGVuIHpvb21hdXNrZXJyb2ludGEnLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbjpcbiAgICAgICdTw6TDpGTDpCBrb3JrZXVzIC8ga29ya2V1cyBueWt5aXNlbiB6b29tYXVza2VydG9pbWVuIHBlcnVzdGVlbGxhJyxcbiAgICBlbmFibGVIZWlnaHRab29tRmFjdG9yOiAnS8OkeXTDpCBrb3JrZXVkZW4gem9vbWF1c2tlcnJvaW50YScsXG4gICAgaGVpZ2h0U2NhbGU6ICdLb3JrZXVkZW4gc2thYWxhJyxcbiAgICBjb3ZlcmFnZVJhbmdlOiAnUGVpdHTDpHZ5eWRlbiByYWphdCcsXG4gICAgaGlnaFByZWNpc2lvblJlbmRlcmluZzogJ1RhcmtrYSByZW5kZXLDtmludGknLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmdEZXNjcmlwdGlvbjogJ1RhcmtrYSByZW5kZXLDtmludGkgam9odGFhIGhpdGFhbXBhYW4gc3Vvcml0dGFtaXNlZW4nLFxuICAgIGhlaWdodDogJ0tvcmtldXMnLFxuICAgIGhlaWdodERlc2NyaXB0aW9uOiAnS2xpa2thYSBvaWtlYXN0YSB5bMOkbnVya2FzdGEgbmFwcGlhIHZhaWh0YWFrc2VzaSAzRC1uw6RreW3DpMOkbicsXG4gICAgZmlsbDogJ1TDpHl0dMO2JyxcbiAgICBlbmFibGVQb2x5Z29uSGVpZ2h0OiAnU2FsbGkgcG9seWdvbmllbiBrb3JrZXVzJyxcbiAgICBzaG93V2lyZWZyYW1lOiAnTsOkeXTDpCByYXV0YWxhbmthbWFsbGknLFxuICAgIHdlaWdodEludGVuc2l0eTogJ1BhaW5vdHVrc2VuIGludGVuc2l0ZWV0dGknLFxuICAgIHpvb21TY2FsZTogJ1pvb21hdXNza2FhbGEnLFxuICAgIGhlaWdodFJhbmdlOiAnS29ya2V1ZGVuIHJhamF0JyxcbiAgICBoZWlnaHRNdWx0aXBsaWVyOiAnS29ya2V1c2tlcnJvaW4nLFxuICAgIGZpeGVkSGVpZ2h0OiAnS2lpbnRlw6Qga29ya2V1cycsXG4gICAgZml4ZWRIZWlnaHREZXNjcmlwdGlvbjogJ0vDpHl0w6Qga29ya2V1dHRhIGlsbWFuIG11dXRva3NpYSdcbiAgfSxcbiAgbGF5ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRGF0YTogJ0xpc8Okw6QgYWluZWlzdG8nLFxuICAgIGFkZExheWVyOiAnTGlzw6TDpCB0YXNvJyxcbiAgICBsYXllckJsZW5kaW5nOiAnVGFzb2plbiBzZWtvaXR0dXZ1dXMnXG4gIH0sXG4gIG1hcE1hbmFnZXI6IHtcbiAgICBtYXBTdHlsZTogJ0thcnRhbiB0eXlsaScsXG4gICAgYWRkTWFwU3R5bGU6ICdMaXPDpMOkIHR5eWxpIGthcnRhbGxlJyxcbiAgICAnM2RCdWlsZGluZ0NvbG9yJzogJzNELXJha2VubnVzdGVuIHbDpHJpJyxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6ICdUYXVzdGF2w6RyaSdcbiAgfSxcbiAgbGF5ZXJDb25maWd1cmF0aW9uOiB7XG4gICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnTGFza2Ugc3V1cmVlbiB7cHJvcGVydHl9IGFydm8gdmFsaXR1biBrZW50w6RuIHBlcnVzdGVlbGxhJyxcbiAgICBob3dUbzogJ01pdGVuIHRvaW1paSdcbiAgfSxcbiAgZmlsdGVyTWFuYWdlcjoge1xuICAgIGFkZEZpbHRlcjogJ0xpc8Okw6Qgc3VvZGF0aW4nXG4gIH0sXG4gIGRhdGFzZXRUaXRsZToge1xuICAgIHNob3dEYXRhVGFibGU6ICdOw6R5dMOkIGF0dHJpYnV1dHRpdGF1bHUnLFxuICAgIHJlbW92ZURhdGFzZXQ6ICdQb2lzdGEgYWluZWlzdG8nXG4gIH0sXG4gIGRhdGFzZXRJbmZvOiB7XG4gICAgcm93Q291bnQ6ICd7cm93Q291bnR9IHJpdmnDpCdcbiAgfSxcbiAgdG9vbHRpcDoge1xuICAgIGhpZGVMYXllcjogJ1BpaWxvdGEgdGFzbycsXG4gICAgc2hvd0xheWVyOiAnTsOkeXTDpCB0YXNvJyxcbiAgICBoaWRlRmVhdHVyZTogJ1BpaWxvdGEga29oZGUnLFxuICAgIHNob3dGZWF0dXJlOiAnTsOkeXTDpCBrb2hkZScsXG4gICAgaGlkZTogJ3BpaWxvdGEnLFxuICAgIHNob3c6ICduw6R5dMOkJyxcbiAgICByZW1vdmVMYXllcjogJ1BvaXN0YSB0YXNvJyxcbiAgICByZXNldEFmdGVyRXJyb3I6ICdZcml0w6Qgb3R0YWEgdGFzbyBrw6R5dHTDtsO2biB2aXJoZWVuIGrDpGxrZWVuJyxcbiAgICBsYXllclNldHRpbmdzOiAnVGFzb24gYXNldHVrc2V0JyxcbiAgICBjbG9zZVBhbmVsOiAnU3VsamUgcGFuZWVsaScsXG4gICAgc3dpdGNoVG9EdWFsVmlldzogJ1ZhaWhkYSBrYWtzb2lza2FycnRhbsOka3ltw6TDpG4nLFxuICAgIHNob3dMZWdlbmQ6ICdOw6R5dMOkIHNlbGl0ZScsXG4gICAgZGlzYWJsZTNETWFwOiAnUG9pc3R1IDNELW7DpGt5bcOkc3TDpCcsXG4gICAgRHJhd09uTWFwOiAnUGlpcnLDpCBrYXJ0YWxsZScsXG4gICAgc2VsZWN0TG9jYWxlOiAnVmFsaXRzZSBraWVsaXN5eXMnLFxuICAgIHNob3dBaUFzc2lzdGFudFBhbmVsOiAnTsOkeXTDpCBBSS1hcHVvaGplbG1hbiBwYW5lZWxpJyxcbiAgICBoaWRlQWlBc3Npc3RhbnRQYW5lbDogJ1BpaWxvdGEgQUktYXB1b2hqZWxtYW4gcGFuZWVsaScsXG4gICAgaGlkZUxheWVyUGFuZWw6ICdQaWlsb3RhIHRhc29wYW5lZWxpJyxcbiAgICBzaG93TGF5ZXJQYW5lbDogJ07DpHl0w6QgdGFzb3BhbmVlbGknLFxuICAgIG1vdmVUb1RvcDogJ1NpaXJyw6QgdGFzb2plbiBww6TDpGxsaW1tw6Rpc2Vrc2knLFxuICAgIHNlbGVjdEJhc2VNYXBTdHlsZTogJ1ZhbGl0c2UgdGF1c3Rha2FydHRhdHl5bGknLFxuICAgIGRlbGV0ZTogJ1BvaXN0YScsXG4gICAgdGltZVBsYXliYWNrOiAnQWphbiBhbmltb2ludGknLFxuICAgIGNsb3VkU3RvcmFnZTogJ1BpbHZpdGFsbGVubnVzJyxcbiAgICAnM0RNYXAnOiAnM0QtbsOka3ltw6QnXG4gIH0sXG4gIHRvb2xiYXI6IHtcbiAgICBleHBvcnRJbWFnZTogJ1ZpZSBrdXZhJyxcbiAgICBleHBvcnREYXRhOiAnVmllIGFpbmVpc3RvdCcsXG4gICAgZXhwb3J0TWFwOiAnVmllIGthcnR0YScsXG4gICAgc2hhcmVNYXBVUkw6ICdKYWEga2FydGFuIFVSTCcsXG4gICAgc2F2ZU1hcDogJ1RhbGxlbm5hIGthcnR0YScsXG4gICAgc2VsZWN0OiAndmFsaXRzZScsXG4gICAgcG9seWdvbjogJ3BvbHlnb25pJyxcbiAgICByZWN0YW5nbGU6ICduZWxpa3VsbWlvJyxcbiAgICBoaWRlOiAncGlpbG90YScsXG4gICAgc2hvdzogJ27DpHl0w6QnLFxuICAgIC4uLkxPQ0FMRVNcbiAgfSxcbiAgbW9kYWw6IHtcbiAgICB0aXRsZToge1xuICAgICAgZGVsZXRlRGF0YXNldDogJ1BvaXN0YSBhaW5laXN0bycsXG4gICAgICBhZGREYXRhVG9NYXA6ICdMaXPDpMOkIGFpbmVpc3RvamEga2FydGFsbGUnLFxuICAgICAgZXhwb3J0SW1hZ2U6ICdWaWUga3V2YScsXG4gICAgICBleHBvcnREYXRhOiAnVmllIGFpbmVpc3RvdCcsXG4gICAgICBleHBvcnRNYXA6ICdWaWUga2FydHRhJyxcbiAgICAgIGFkZEN1c3RvbU1hcGJveFN0eWxlOiAnTGlzw6TDpCBvbWEgTWFwYm94LXR5eWxpJyxcbiAgICAgIHNhdmVNYXA6ICdUYWxsZW5uYSBrYXJ0dGEnLFxuICAgICAgc2hhcmVVUkw6ICdKYWEgVVJMJ1xuICAgIH0sXG4gICAgYnV0dG9uOiB7XG4gICAgICBkZWxldGU6ICdQb2lzdGEnLFxuICAgICAgZG93bmxvYWQ6ICdMYXRhYScsXG4gICAgICBleHBvcnQ6ICdWaWUnLFxuICAgICAgYWRkU3R5bGU6ICdMaXPDpMOkIHR5eWxpJyxcbiAgICAgIHNhdmU6ICdUYWxsZW5uYScsXG4gICAgICBkZWZhdWx0Q2FuY2VsOiAnUGVydScsXG4gICAgICBkZWZhdWx0Q29uZmlybTogJ1ZhaHZpc3RhJ1xuICAgIH0sXG4gICAgZXhwb3J0SW1hZ2U6IHtcbiAgICAgIHJhdGlvVGl0bGU6ICdLdXZhc3VoZGUnLFxuICAgICAgcmF0aW9EZXNjcmlwdGlvbjogJ1ZhbGl0c2Ugc29waXZhIGt1dmFzdWhkZSBrw6R5dHTDtnRhcGF1c3Rhc2kgdmFydGVuLicsXG4gICAgICByYXRpb09yaWdpbmFsU2NyZWVuOiAnQWxrdXBlcsOkaW5lbiBuw6R5dHTDticsXG4gICAgICByYXRpb0N1c3RvbTogJ0t1c3RvbW9pdHUnLFxuICAgICAgcmF0aW80XzM6ICc0OjMnLFxuICAgICAgcmF0aW8xNl85OiAnMTY6OScsXG4gICAgICByZXNvbHV0aW9uVGl0bGU6ICdSZXNvbHV1dGlvJyxcbiAgICAgIHJlc29sdXRpb25EZXNjcmlwdGlvbjogJ0tvcmtlYSByZXNvbHV1dGlvIG9uIHBhcmVtcGkgdHVsb3N0YW1pc3RhIHZhcnRlbi4nLFxuICAgICAgbWFwTGVnZW5kVGl0bGU6ICdLYXJ0YW4gc2VsaXRlJyxcbiAgICAgIG1hcExlZ2VuZEFkZDogJ0xpc8Okw6Qgc2VsaXRlIGthcnR0YWFuJ1xuICAgIH0sXG4gICAgZXhwb3J0RGF0YToge1xuICAgICAgZGF0YXNldFRpdGxlOiAnQWluZWlzdG90JyxcbiAgICAgIGRhdGFzZXRTdWJ0aXRsZTogJ1ZhbGl0c2UgYWluZWlzdG8sIGpvbmthIGFpb3QgdmllZMOkJyxcbiAgICAgIGFsbERhdGFzZXRzOiAnS2Fpa2tpJyxcbiAgICAgIGRhdGFUeXBlVGl0bGU6ICdBaW5laXN0b2plbiBmb3JtYWF0dGknLFxuICAgICAgZGF0YVR5cGVTdWJ0aXRsZTogJ1ZhbGl0c2UgYWluZWlzdG9mb3JtYWF0dGkgdmFsaXRzZW1pbGxlc2kgYWluZWlzdG9pbGxlJyxcbiAgICAgIGZpbHRlckRhdGFUaXRsZTogJ1N1b2RhdGEgYWluZWlzdG9qYScsXG4gICAgICBmaWx0ZXJEYXRhU3VidGl0bGU6ICdWb2l0IHZpZWTDpCBqb2tvIGFsa3VwZXLDpGlzZXQgYWluZWlzdG90IHRhaSBzdW9kYXRldHV0IGFpbmVpc3RvdCcsXG4gICAgICBmaWx0ZXJlZERhdGE6ICdTdW9kYXRldHV0IGFpbmVpc3RvdCcsXG4gICAgICB1bmZpbHRlcmVkRGF0YTogJ1N1b2RhdHRhbWF0dG9tYXQgYWluZWlzdG90JyxcbiAgICAgIGZpbGVDb3VudDogJ3tmaWxlQ291bnR9IHRpZWRvc3RvYScsXG4gICAgICByb3dDb3VudDogJ3tyb3dDb3VudH0gcml2acOkJ1xuICAgIH0sXG4gICAgZGVsZXRlRGF0YToge1xuICAgICAgd2FybmluZzogJ2Fpb3QgcG9pc3RhYSB0w6Rtw6RuIGFpbmVpc3Rvbi4gQWluZW9zdG9hIGvDpHl0dMOkdmllbiB0YXNvamVuIGx1a3Vtw6TDpHLDpDoge2xlbmd0aH0nXG4gICAgfSxcbiAgICBhZGRTdHlsZToge1xuICAgICAgcHVibGlzaFRpdGxlOiAnMS4gSnVsa2Fpc2UgdHl5bGlzaSBNYXBib3hpc3NhIHRhaSBhbm5hIHR1bm5pc3RlJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTE6ICdWb2l0IGx1b2RhIG9tYW4ga2FydHRhdHl5bGlzaSBzaXZ1bGxhJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTI6ICdqYScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUzOiAnanVsa2Fpc3RhJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTQ6ICdzZW4uJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTU6ICdLw6R5dHTDpMOka3Nlc2kgeWtzaXR5aXN0w6QgdHl5bGnDpCwgbGlpdMOkJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTY6ICd0dW5uaXN0ZWVzaScsXG4gICAgICBwdWJsaXNoU3VidGl0bGU3OlxuICAgICAgICAndMOkbm5lLiAqa2VwbGVyLmdsIG9uIGNsaWVudC1zaWRlIHNvdmVsbHVzLCBkYXRhIHB5c3l5IHZhaW4gc2VsYWltZXNzYXNpLi4uJyxcbiAgICAgIGV4YW1wbGVUb2tlbjogJ2VzaW0uIHBrLmFiY2RlZmcueHh4eHh4JyxcbiAgICAgIHBhc3RlVGl0bGU6ICcyLiBMaWl0w6QgdHl5bGktVVJMJyxcbiAgICAgIHBhc3RlU3VidGl0bGUxOiAnTWlrw6Qgb24nLFxuICAgICAgcGFzdGVTdWJ0aXRsZTI6ICd0eXlsaS1VUkw/JyxcbiAgICAgIG5hbWluZ1RpdGxlOiAnMy4gTmltZcOkIHR5eWxpc2knXG4gICAgfSxcbiAgICBzaGFyZU1hcDoge1xuICAgICAgc2hhcmVVcmlUaXRsZTogJ0phYSBrYXJ0YW4gVVJMJyxcbiAgICAgIHNoYXJlVXJpU3VidGl0bGU6ICdMdW8ga2FydGFsbGUgVVJMLCBqb25rYSB2b2l0IGpha2FhIG11aWRlbiBrYW5zc2EnLFxuICAgICAgY2xvdWRUaXRsZTogJ1BpbHZpdGFsbGVubnVzJyxcbiAgICAgIGNsb3VkU3VidGl0bGU6XG4gICAgICAgICdLaXJqYXVkdSBzaXPDpMOkbiBqYSBsYXRhYSBrYXJ0dGEgamEgYWluZWlzdG90IGhlbmtpbMO2a29odGFpc2VlbiBwaWx2aXBhbHZlbHV1bicsXG4gICAgICBzaGFyZURpc2NsYWltZXI6XG4gICAgICAgICdrZXBsZXIuZ2wgdGFsbGVudGFhIGthcnRhbiBkYXRhbiBoZW5raWzDtmtvaHRhaXNlZW4gcGlsdml0YWxsZW5udXN0aWxhYXNpLCB2YWluIGlobWlzZXQsIGpvaWxsYSBvbiBVUkwsIHZvaXZhdCBww6TDpHN0w6Qga8Okc2lrc2kga2FydHRhYW4gamEgYWluZWlzdG9paGluLiAnICtcbiAgICAgICAgJ1ZvaXQgbXVva2F0YSB0aWVkb3N0b2phIHRhaSBwb2lzdGFhIG5lIHBpbHZpcGFsdmVsdXN0YXNpIG1pbGxvaW4gdmFpbi4nLFxuICAgICAgZ290b1BhZ2U6ICdNZW5lIEtlcGxlci5nbCB7Y3VycmVudFByb3ZpZGVyfSBzaXZ1bGxlc2knXG4gICAgfSxcbiAgICBzdGF0dXNQYW5lbDoge1xuICAgICAgbWFwVXBsb2FkaW5nOiAnS2FydHRhYSBsYWRhdGFhbicsXG4gICAgICBlcnJvcjogJ1ZpcmhlJ1xuICAgIH0sXG4gICAgc2F2ZU1hcDoge1xuICAgICAgdGl0bGU6ICdQaWx2aXRhbGxlbm51cycsXG4gICAgICBzdWJ0aXRsZTogJ0tpcmphdWR1IHNpc8Okw6RuIHBpbHZpcGFsdmVsdXVzaSB0YWxsZW50YWFrc2VzaSBrYXJ0YW4nXG4gICAgfSxcbiAgICBleHBvcnRNYXA6IHtcbiAgICAgIGZvcm1hdFRpdGxlOiAnS2FydGFuIGZvcm1hYXR0aScsXG4gICAgICBmb3JtYXRTdWJ0aXRsZTogJ1ZhbGl0c2UgZm9ybWFhdHRpLCBqb3NzYSB2aWV0IGthcnRhbicsXG4gICAgICBodG1sOiB7XG4gICAgICAgIHNlbGVjdGlvbjogJ1ZpZSBrYXJ0dGEgaW50ZXJha3RpaXZpc2VuYSBodG1sLXRpZWRvc3RvbmEnLFxuICAgICAgICB0b2tlblRpdGxlOiAnTWFwYm94LXR1bm5pc3RlJyxcbiAgICAgICAgdG9rZW5TdWJ0aXRsZTogJ0vDpHl0w6Qgb21hYSBNYXBib3gtdHVubmlzdGV0dGFzaSBodG1sLXRpZWRvc3Rvc3NhICh2YWxpbm5haW5lbiknLFxuICAgICAgICB0b2tlblBsYWNlaG9sZGVyOiAnTGlpdMOkIE1hcGJveC10dW5uaXN0ZWVzaScsXG4gICAgICAgIHRva2VuTWlzdXNlV2FybmluZzpcbiAgICAgICAgICAnKiBKb3MgZXQga8OkeXTDpCBvbWFhIHR1bm5pc3RldHRhc2ksIGthcnR0YSB2b2kgbGFrYXRhIHRvaW1pbWFzdGEgbWlsbG9pbiB2YWluIGt1biB2YWloZGFtbWUgb21hYSB0dW5uaXN0ZXR0YW1tZSB2w6TDpHJpbmvDpHl0w7ZuIGVzdMOkbWlzZWtzaS4gJyxcbiAgICAgICAgdG9rZW5EaXNjbGFpbWVyOiAnVm9pdCB2YWlodGFhIE1hcGJveC10dW5uaXN0ZWVzaSBuw6RpZGVuIG9oamVpZGVuIGF2dWxsYTogJyxcbiAgICAgICAgdG9rZW5VcGRhdGU6ICdLdWlua2EgdmFpaHRhYSBvbGVtYXNzYW9sZXZhIE1hcGJveC10dW5uaXN0ZScsXG4gICAgICAgIG1vZGVUaXRsZTogJ0thcnRhbiB0aWxhJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMTogJ1ZhbGl0c2Uga2FydGFuIHRpbGEuJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMjogJ0xpc8OkdGlldG9qYScsXG4gICAgICAgIG1vZGVEZXNjcmlwdGlvbjogJ0FubmEga8OkeXR0w6RqaWVuIHttb2RlfSBrYXJ0dGFhJyxcbiAgICAgICAgcmVhZDogJ2x1a2VhJyxcbiAgICAgICAgZWRpdDogJ211b2thdGEnXG4gICAgICB9LFxuICAgICAganNvbjoge1xuICAgICAgICBjb25maWdUaXRsZTogJ0thcnRhbiBhc2V0dWtzZXQnLFxuICAgICAgICBjb25maWdEaXNjbGFpbWVyOlxuICAgICAgICAgICdLYXJ0YW4gYXNldHVrc2V0IHNpc8OkbHR5dsOkdCBKc29uLXRpZWRvc3Rvb24uIEpvcyBrw6R5dMOkdCBraXJqYXN0b2Ega2VwbGVyLmdsIG9tYXNzYSBzb3ZlbGx1a3Nlc3Nhc2kuIFZvaXQga29waW9pZGEgYXNldHVrc2V0IGphIGFudGFhIG5lIGZ1bmt0aW9sbGU6ICcsXG4gICAgICAgIHNlbGVjdGlvbjpcbiAgICAgICAgICAnVmllIGt5c2Vpc2VuIGthcnRhbiBhaW5laXN0b3QgamEgYXNldHVrc2V0IHloZGVzc8OkIGpzb24tdGllZG9zdG9zc2EuIFZvaXQgbXnDtmhlbW1pbiBhdmF0YSBzYW1hbiBrYXJ0YW4gbGF0YWFtYWxsYSB0aWVkb3N0b24ga2VwbGVyLmdsOm4nLFxuICAgICAgICBkaXNjbGFpbWVyOlxuICAgICAgICAgICcqIEthcnRhbiBhc2V0dWtzZXQgb3ZhdCBzaWRva3Npc3NhIGxhZGF0dHVpaGluIGFpbmVpc3RvaWhpbi4gQXJ2b2Eg4oCYZGF0YUlk4oCZIGvDpHl0ZXTDpMOkbiB0YXNvamVuLCBzdW9kYXR0aW1pZW4gamEgdmloamVpZGVuIGxpaXR0w6RtaXNla3NpIHRpZXR0eXluIGFpbmVpc3Rvb24uICcgK1xuICAgICAgICAgICdWYXJtaXN0YSwgZXR0w6QgYWluZWlzdG9uIGRhdGFJZDp0IHZhc3RhYXZhdCBhc2V0dXN0ZW4gYXJ2b2phIGpvcyBsYXRhYXQgYXNldHVrc2V0IGvDpHl0dMOkZW4gYGFkZERhdGFUb01hcGAtZnVua3Rpb2xsZS4nXG4gICAgICB9XG4gICAgfSxcbiAgICBsb2FkaW5nRGlhbG9nOiB7XG4gICAgICBsb2FkaW5nOiAnTGFkYXRhYW4uLi4nXG4gICAgfSxcbiAgICBsb2FkRGF0YToge1xuICAgICAgdXBsb2FkOiAnTGF0YWEgdGllZG9zdG90JyxcbiAgICAgIHN0b3JhZ2U6ICdMYXRhYSB0YWxsZW5udXN0aWxhc3RhJ1xuICAgIH0sXG4gICAgdHJpcEluZm86IHtcbiAgICAgIHRpdGxlOiAnS3VpbmthIGvDpHl0dMOkw6QgbWF0a2EtYW5pbWFhdGlvdGEnLFxuICAgICAgZGVzY3JpcHRpb24xOlxuICAgICAgICAnUmVpdGluIGFuaW1vaW1pc2Vrc2kgZ2VvSlNPTi1haW5laXN0b24gdMOkeXR5eSBvbGxhIGdlb21ldHJpYXR5eXBpbHTDpMOkbiBgTGluZVN0cmluZ2AsIExpbmVTdHJpbmcta29vcmRpbmFhdHRpZW4gdMOkeXR5eSBzaXPDpGx0w6TDpCA0IGVsZW1lbnR0acOkIGZvcm1hYXRpc3NhOicsXG4gICAgICBjb2RlOiAnIFtwaXR1dXNhc3RlLCBsZXZleXNhc3RlLCBrb3JrZXVzLCBhaWthbGVpbWFdICcsXG4gICAgICBkZXNjcmlwdGlvbjI6XG4gICAgICAgICdzaXRlbiwgZXR0w6QgdmlpbWVpbmVuIGVsZW1lbnR0aSBvbiBhaWthbGVpbWEuIEFpa2FsZWltYSB2b2kgb2xsYSBtdW9kb2x0YWFuIHVuaXgtc2VrdW50ZWphLCBrdXRlbiBgMTU2NDE4NDM2M2AgdGFpIG1pbGxpc2VrdW50ZWphLCBrdXRlbiBgMTU2NDE4NDM2MzAwMGAuJyxcbiAgICAgIGV4YW1wbGU6ICdFc2ltZXJra2k6J1xuICAgIH0sXG4gICAgaWNvbkluZm86IHtcbiAgICAgIHRpdGxlOiAnTWl0ZW4gcGlpcnTDpMOkIGt1dmlhJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ2Nzdi10aWVkb3N0b3NzYXNpLCBsdW8gc2FyYWtlIG5pbWVsdMOkIGljb24uIFZvaXQgasOkdHTDpMOkIHNlbiB0eWhqw6Rrc2kgam9zIGV0IGhhbHVhIHBpaXJ0w6TDpCBrdXZhYSBqb2lsbGFpbiBwaXN0ZWlsbMOkLiBLdW4gc2FyYWtrZWVuIG5pbWkgb24gJyxcbiAgICAgIGNvZGU6ICdpY29uJyxcbiAgICAgIGRlc2NyaXB0aW9uMjogJyBrZXBsZXIuZ2wgbHVvIGF1dG9tYWF0dGlzZXN0aSBrdXZhdGFzb24gc2ludWEgdmFydGVuLicsXG4gICAgICBleGFtcGxlOiAnRXNpbWVya2tpOicsXG4gICAgICBpY29uczogJ0t1dmF0J1xuICAgIH0sXG4gICAgc3RvcmFnZU1hcFZpZXdlcjoge1xuICAgICAgbGFzdE1vZGlmaWVkOiAnVmlpbWVrc2kgbXVva2F0dHUge2xhc3RVcGRhdGVkfSBzaXR0ZW4nLFxuICAgICAgYmFjazogJ1Rha2Fpc2luJ1xuICAgIH0sXG4gICAgb3ZlcndyaXRlTWFwOiB7XG4gICAgICB0aXRsZTogJ1RhbGxlbm5ldGFhbiBrYXJ0dGFhLi4uJyxcbiAgICAgIGFscmVhZHlFeGlzdHM6ICdvbiBqbyB7bWFwU2F2ZWR9OnNzYS4gSGFsdWF0a28geWxpa2lyam9pdHRhYSBzZW4/J1xuICAgIH0sXG4gICAgbG9hZFN0b3JhZ2VNYXA6IHtcbiAgICAgIGJhY2s6ICdUYWthaXNpbicsXG4gICAgICBnb1RvUGFnZTogJ01lbmUgS2VwbGVyLmdsIHtkaXNwbGF5TmFtZX0gc2l2dWxsZXNpJyxcbiAgICAgIHN0b3JhZ2VNYXBzOiAnVGFsbGVubnVzIC8gS2FydGF0JyxcbiAgICAgIG5vU2F2ZWRNYXBzOiAnRWkgdGFsbGVubmV0dHVqYSBrYXJ0dG9qYSB2aWVsw6QnXG4gICAgfVxuICB9LFxuICBoZWFkZXI6IHtcbiAgICB2aXNpYmxlTGF5ZXJzOiAnTsOka3l2aXNzw6Qgb2xldmF0IHRhc290JyxcbiAgICBsYXllckxlZ2VuZDogJ1Rhc29uIHNlbGl0ZSdcbiAgfSxcbiAgaW50ZXJhY3Rpb25zOiB7XG4gICAgdG9vbHRpcDogJ1ZpaGplJyxcbiAgICBicnVzaDogJ0hhcmphJyxcbiAgICBjb29yZGluYXRlOiAnS29vcmRpbmFhdGl0J1xuICB9LFxuICBsYXllckJsZW5kaW5nOiB7XG4gICAgdGl0bGU6ICdUYXNvamVuIHNla29pdHR1dnV1cycsXG4gICAgYWRkaXRpdmU6ICdsaXPDpMOkdsOkJyxcbiAgICBub3JtYWw6ICdub3JtYWFsaScsXG4gICAgc3VidHJhY3RpdmU6ICd2w6RoZW50w6R2w6QnXG4gIH0sXG4gIGNvbHVtbnM6IHtcbiAgICB0aXRsZTogJ1NhcmFra2VldCcsXG4gICAgbGF0OiAnbGF0JyxcbiAgICBsbmc6ICdsbmcnLFxuICAgIGFsdGl0dWRlOiAna29ya2V1cycsXG4gICAgaWNvbjogJ2t1dmEnLFxuICAgIGdlb2pzb246ICdnZW9qc29uJyxcbiAgICBhcmM6IHtcbiAgICAgIGxhdDA6ICdsw6RoZMO2biBsYXQnLFxuICAgICAgbG5nMDogJ2zDpGhkw7ZuIGxuZycsXG4gICAgICBsYXQxOiAna29odGVlbiBsYXQnLFxuICAgICAgbG5nMTogJ2tvaHRlZW4gbG5nJ1xuICAgIH0sXG4gICAgbGluZToge1xuICAgICAgYWx0MDogJ2zDpGh0ZWVuIGtvcmtldXMnLFxuICAgICAgYWx0MTogJ2tvaGRlIGtvcmtldXMnXG4gICAgfSxcbiAgICBncmlkOiB7XG4gICAgICB3b3JsZFVuaXRTaXplOiAnUnV1dHVqZW4ga29rbyAoa20pJ1xuICAgIH0sXG4gICAgaGV4YWdvbjoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ0hleGFnb25pZW4gc8OkZGUgKGttKSdcbiAgICB9XG4gIH0sXG4gIGNvbG9yOiB7XG4gICAgY3VzdG9tUGFsZXR0ZTogJ011a2F1dGV0dHUgcGFsZXR0aScsXG4gICAgc3RlcHM6ICdhc2tlbGVldCcsXG4gICAgdHlwZTogJ3R5eXBwaScsXG4gICAgcmV2ZXJzZWQ6ICdrw6TDpG50ZWluZW4nXG4gIH0sXG4gIHNjYWxlOiB7XG4gICAgY29sb3JTY2FsZTogJ1bDpHJpbiBza2FhbGEnLFxuICAgIHNpemVTY2FsZTogJ0tvb24gc2thYWxhJyxcbiAgICBzdHJva2VTY2FsZTogJ1ZpaXZhbiBwYWtzdXVkZW4gc2thYWxhJyxcbiAgICBzY2FsZTogJ1NrYWFsYSdcbiAgfSxcbiAgZmlsZVVwbG9hZGVyOiB7XG4gICAgbWVzc2FnZTogJ1JhYWhhYSBqYSBwdWRvdGEgdGllZG9zdG9zaSB0w6RubmUnLFxuICAgIGNocm9tZU1lc3NhZ2U6XG4gICAgICAnKkNocm9tZW4ga8OkeXR0w6Rqw6Q6IFJham9pdGEgdGllZG9zdG9rb2tvc2kgMjUwTWI6aGVuLiBKb3MgaGFsdWF0IHN1dXJlbXBpYSB0aWVkb3N0b2phLCBrb2tlaWxlIFNhZmFyaWEnLFxuICAgIGRpc2NsYWltZXI6XG4gICAgICAnKmtlcGxlci5nbCBvbiBjbGllbnQtc2lkZSBzb3ZlbGx1cywgZGF0YSBweXN5eSB2YWluIHNlbGFpbWVzc2FzaS4uLicgK1xuICAgICAgJ1RpZXRvamEgZWkgbMOkaGV0ZXTDpCBwYWx2ZWxpbWVsbGUuJyxcbiAgICBjb25maWdVcGxvYWRNZXNzYWdlOlxuICAgICAgJ0xpc8Okw6Qge2ZpbGVGb3JtYXROYW1lc30gdGFpIHRhbGxlbm5ldHR1IGthcnR0YSAqKkpzb24qKi4gTHVlIGxpc8Okw6QgWyoqdHVldHVpc3RhIGZvcm1hYXRlaXN0YSoqXScsXG4gICAgYnJvd3NlRmlsZXM6ICdzZWxhYSB0aWVkb3N0b2phc2knLFxuICAgIHVwbG9hZGluZzogJ2xhZGF0YWFuJyxcbiAgICBmaWxlTm90U3VwcG9ydGVkOiAnVGllZG9zdG8ge2Vycm9yRmlsZXN9IGVpIG9sZSB0dWV0dHUuJyxcbiAgICBvcjogJ3RhaSdcbiAgfSxcbiAgZGVuc2l0eTogJ3RpaGV5cycsXG4gICdCdWcgUmVwb3J0JzogJ0J1Z2lyYXBvcnRvaW50aScsXG4gICdVc2VyIEd1aWRlJzogJ09wYXMnLFxuICBTYXZlOiAnVGFsbGVubmEnLFxuICBTaGFyZTogJ0phYSdcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBR0EsSUFBQUEsUUFBQSxHQUFBQyxPQUFBO0FBQW1DLFNBQUFDLFFBQUFDLENBQUEsRUFBQUMsQ0FBQSxRQUFBQyxDQUFBLEdBQUFDLE1BQUEsQ0FBQUMsSUFBQSxDQUFBSixDQUFBLE9BQUFHLE1BQUEsQ0FBQUUscUJBQUEsUUFBQUMsQ0FBQSxHQUFBSCxNQUFBLENBQUFFLHFCQUFBLENBQUFMLENBQUEsR0FBQUMsQ0FBQSxLQUFBSyxDQUFBLEdBQUFBLENBQUEsQ0FBQUMsTUFBQSxXQUFBTixDQUFBLFdBQUFFLE1BQUEsQ0FBQUssd0JBQUEsQ0FBQVIsQ0FBQSxFQUFBQyxDQUFBLEVBQUFRLFVBQUEsT0FBQVAsQ0FBQSxDQUFBUSxJQUFBLENBQUFDLEtBQUEsQ0FBQVQsQ0FBQSxFQUFBSSxDQUFBLFlBQUFKLENBQUE7QUFBQSxTQUFBVSxjQUFBWixDQUFBLGFBQUFDLENBQUEsTUFBQUEsQ0FBQSxHQUFBWSxTQUFBLENBQUFDLE1BQUEsRUFBQWIsQ0FBQSxVQUFBQyxDQUFBLFdBQUFXLFNBQUEsQ0FBQVosQ0FBQSxJQUFBWSxTQUFBLENBQUFaLENBQUEsUUFBQUEsQ0FBQSxPQUFBRixPQUFBLENBQUFJLE1BQUEsQ0FBQUQsQ0FBQSxPQUFBYSxPQUFBLFdBQUFkLENBQUEsUUFBQWUsZ0JBQUEsYUFBQWhCLENBQUEsRUFBQUMsQ0FBQSxFQUFBQyxDQUFBLENBQUFELENBQUEsU0FBQUUsTUFBQSxDQUFBYyx5QkFBQSxHQUFB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