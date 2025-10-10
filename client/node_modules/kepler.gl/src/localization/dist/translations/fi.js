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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsInN0cm9rZUNvbG9yIiwicmFkaXVzIiwib3V0bGluZSIsInN0cm9rZSIsImRlbnNpdHkiLCJjb3ZlcmFnZSIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJiYWNrZ3JvdW5kIiwicGFuZWwiLCJ0ZXh0IiwibGFiZWxXaXRoSWQiLCJmb250U2l6ZSIsImZvbnRDb2xvciIsInRleHRBbmNob3IiLCJhbGlnbm1lbnQiLCJhZGRNb3JlTGFiZWwiLCJzaWRlYmFyIiwicGFuZWxzIiwibGF5ZXIiLCJpbnRlcmFjdGlvbiIsImJhc2VtYXAiLCJyZXF1aXJlZCIsInByb3BlcnR5QmFzZWRPbiIsInN0cm9rZVdpZHRoIiwiYmFzaWMiLCJ0cmFpbExlbmd0aCIsInRyYWlsTGVuZ3RoRGVzY3JpcHRpb24iLCJuZXdMYXllciIsImVsZXZhdGlvbkJ5RGVzY3JpcHRpb24iLCJjb2xvckJ5RGVzY3JpcHRpb24iLCJhZ2dyZWdhdGVCeSIsInR5cGUiLCJwb2ludCIsImFyYyIsImxpbmUiLCJncmlkIiwiaGV4YmluIiwicG9seWdvbiIsImdlb2pzb24iLCJjbHVzdGVyIiwiaWNvbiIsImhlYXRtYXAiLCJoZXhhZ29uIiwiaGV4YWdvbmlkIiwidHJpcCIsInMyIiwibGF5ZXJVcGRhdGVFcnJvciIsImxheWVyVmlzQ29uZmlncyIsInN0cm9rZVdpZHRoUmFuZ2UiLCJmaXhlZFJhZGl1cyIsImZpeGVkUmFkaXVzRGVzY3JpcHRpb24iLCJyYWRpdXNSYW5nZSIsImNsdXN0ZXJSYWRpdXMiLCJyYWRpdXNSYW5nZVBpeGVscyIsImJpbGxib2FyZCIsImJpbGxib2FyZERlc2NyaXB0aW9uIiwiZmFkZVRyYWlsIiwib3BhY2l0eSIsImNvbG9yUmFuZ2UiLCJzdHJva2VDb2xvclJhbmdlIiwidGFyZ2V0Q29sb3IiLCJjb2xvckFnZ3JlZ2F0aW9uIiwiaGVpZ2h0QWdncmVnYXRpb24iLCJyZXNvbHV0aW9uUmFuZ2UiLCJzaXplU2NhbGUiLCJ3b3JsZFVuaXRTaXplIiwiZWxldmF0aW9uU2NhbGUiLCJlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yIiwiZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvckRlc2NyaXB0aW9uIiwiZW5hYmxlSGVpZ2h0Wm9vbUZhY3RvciIsImhlaWdodFNjYWxlIiwiY292ZXJhZ2VSYW5nZSIsImhpZ2hQcmVjaXNpb25SZW5kZXJpbmciLCJoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb24iLCJoZWlnaHQiLCJoZWlnaHREZXNjcmlwdGlvbiIsImZpbGwiLCJlbmFibGVQb2x5Z29uSGVpZ2h0Iiwic2hvd1dpcmVmcmFtZSIsIndlaWdodEludGVuc2l0eSIsInpvb21TY2FsZSIsImhlaWdodFJhbmdlIiwiaGVpZ2h0TXVsdGlwbGllciIsImZpeGVkSGVpZ2h0IiwiZml4ZWRIZWlnaHREZXNjcmlwdGlvbiIsImxheWVyTWFuYWdlciIsImFkZERhdGEiLCJhZGRMYXllciIsImxheWVyQmxlbmRpbmciLCJtYXBNYW5hZ2VyIiwibWFwU3R5bGUiLCJhZGRNYXBTdHlsZSIsImJhY2tncm91bmRDb2xvciIsImxheWVyQ29uZmlndXJhdGlvbiIsImRlZmF1bHREZXNjcmlwdGlvbiIsImhvd1RvIiwiZmlsdGVyTWFuYWdlciIsImFkZEZpbHRlciIsImRhdGFzZXRUaXRsZSIsInNob3dEYXRhVGFibGUiLCJyZW1vdmVEYXRhc2V0IiwiZGF0YXNldEluZm8iLCJyb3dDb3VudCIsInRvb2x0aXAiLCJoaWRlTGF5ZXIiLCJzaG93TGF5ZXIiLCJoaWRlRmVhdHVyZSIsInNob3dGZWF0dXJlIiwiaGlkZSIsInNob3ciLCJyZW1vdmVMYXllciIsInJlc2V0QWZ0ZXJFcnJvciIsImxheWVyU2V0dGluZ3MiLCJjbG9zZVBhbmVsIiwic3dpdGNoVG9EdWFsVmlldyIsInNob3dMZWdlbmQiLCJkaXNhYmxlM0RNYXAiLCJEcmF3T25NYXAiLCJzZWxlY3RMb2NhbGUiLCJzaG93QWlBc3Npc3RhbnRQYW5lbCIsImhpZGVBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUxheWVyUGFuZWwiLCJzaG93TGF5ZXJQYW5lbCIsIm1vdmVUb1RvcCIsInNlbGVjdEJhc2VNYXBTdHlsZSIsInRpbWVQbGF5YmFjayIsImNsb3VkU3RvcmFnZSIsInRvb2xiYXIiLCJleHBvcnRJbWFnZSIsImV4cG9ydERhdGEiLCJleHBvcnRNYXAiLCJzaGFyZU1hcFVSTCIsInNhdmVNYXAiLCJzZWxlY3QiLCJyZWN0YW5nbGUiLCJMT0NBTEVTIiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUxIiwicGFzdGVTdWJ0aXRsZTIiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImFkZGl0aXZlIiwibm9ybWFsIiwic3VidHJhY3RpdmUiLCJjb2x1bW5zIiwibGF0IiwibG5nIiwiYWx0aXR1ZGUiLCJsYXQwIiwibG5nMCIsImxhdDEiLCJsbmcxIiwiYWx0MCIsImFsdDEiLCJjdXN0b21QYWxldHRlIiwic3RlcHMiLCJyZXZlcnNlZCIsInNjYWxlIiwiY29sb3JTY2FsZSIsInN0cm9rZVNjYWxlIiwiZmlsZVVwbG9hZGVyIiwibWVzc2FnZSIsImNocm9tZU1lc3NhZ2UiLCJjb25maWdVcGxvYWRNZXNzYWdlIiwiYnJvd3NlRmlsZXMiLCJ1cGxvYWRpbmciLCJmaWxlTm90U3VwcG9ydGVkIiwib3IiLCJTYXZlIiwiU2hhcmUiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdHJhbnNsYXRpb25zL2ZpLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmltcG9ydCB7TE9DQUxFU30gZnJvbSAnLi4vbG9jYWxlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcGVydHk6IHtcbiAgICB3ZWlnaHQ6ICdwYWlub3R1cycsXG4gICAgbGFiZWw6ICduaW1pw7YnLFxuICAgIGZpbGxDb2xvcjogJ3TDpHl0dMO2dsOkcmknLFxuICAgIGNvbG9yOiAndsOkcmknLFxuICAgIHN0cm9rZUNvbG9yOiAndmlpdmFuIHbDpHJpJyxcbiAgICByYWRpdXM6ICdzw6RkZScsXG4gICAgb3V0bGluZTogJ8Okw6RyaXZpaXZhJyxcbiAgICBzdHJva2U6ICd2aWl2YScsXG4gICAgZGVuc2l0eTogJ3RpaGV5cycsXG4gICAgY292ZXJhZ2U6ICdrYXR0YXZ1dXMnLFxuICAgIHN1bTogJ3N1bW1hJyxcbiAgICBwb2ludENvdW50OiAncGlzdGVpZGVuIGx1a3Vtw6TDpHLDpCdcbiAgfSxcbiAgcGxhY2Vob2xkZXI6IHtcbiAgICBzZWFyY2g6ICdFdHNpJyxcbiAgICBzZWxlY3RGaWVsZDogJ1ZhbGl0c2Uga2VudHTDpCcsXG4gICAgeUF4aXM6ICdZLWFrc2VsaScsXG4gICAgc2VsZWN0VHlwZTogJ1ZhbGl0c2UgdHl5cHBpJyxcbiAgICBzZWxlY3RWYWx1ZTogJ1ZhbGl0c2UgYXJ2bycsXG4gICAgZW50ZXJWYWx1ZTogJ0FubmEgYXJ2bycsXG4gICAgZW1wdHk6ICd0eWhqw6QnXG4gIH0sXG4gIG1pc2M6IHtcbiAgICBieTogJycsXG4gICAgdmFsdWVzSW46ICdBcnZvdCBqb3Vrb3NzYTonLFxuICAgIHZhbHVlRXF1YWxzOiAnQXJ2byBvbiB5aHTDpHN1dXJpIGt1aW4nLFxuICAgIGRhdGFTb3VyY2U6ICdBaW5laXN0b2zDpGhkZScsXG4gICAgYnJ1c2hSYWRpdXM6ICdIYXJqYW4gc8OkZGUgKGttKScsXG4gICAgZW1wdHk6ICcgJ1xuICB9LFxuICBtYXBMYXllcnM6IHtcbiAgICB0aXRsZTogJ0thcnRhbiB0YXNvdCcsXG4gICAgbGFiZWw6ICdOaW1pw7Z0JyxcbiAgICByb2FkOiAnVGlldCcsXG4gICAgYm9yZGVyOiAnUmFqYXQnLFxuICAgIGJ1aWxkaW5nOiAnUmFrZW5udWtzZXQnLFxuICAgIHdhdGVyOiAnVmVzaScsXG4gICAgbGFuZDogJ01hYScsXG4gICAgJzNkQnVpbGRpbmcnOiAnM2QtcmFrZW5udWtzZXQnLFxuICAgIGJhY2tncm91bmQ6ICdUYXVzdGEnXG4gIH0sXG4gIHBhbmVsOiB7XG4gICAgdGV4dDoge1xuICAgICAgbGFiZWw6ICdOaW1pw7YnLFxuICAgICAgbGFiZWxXaXRoSWQ6ICdOaW1pw7Yge2xhYmVsSWR9JyxcbiAgICAgIGZvbnRTaXplOiAnRm9udGluIGtva28nLFxuICAgICAgZm9udENvbG9yOiAnRm9udGluIHbDpHJpJyxcbiAgICAgIHRleHRBbmNob3I6ICdUZWtzdGluIGFua2t1cmknLFxuICAgICAgYWxpZ25tZW50OiAnU2lqb2l0dGVsdScsXG4gICAgICBhZGRNb3JlTGFiZWw6ICdMaXPDpMOkIHV1c2lhIG5pbWnDtml0w6QnXG4gICAgfVxuICB9LFxuICBzaWRlYmFyOiB7XG4gICAgcGFuZWxzOiB7XG4gICAgICBsYXllcjogJ1Rhc290JyxcbiAgICAgIGZpbHRlcjogJ1N1b2RhdHRpbWV0JyxcbiAgICAgIGludGVyYWN0aW9uOiAnSW50ZXJha3Rpb3QnLFxuICAgICAgYmFzZW1hcDogJ1RhdXN0YWthcnR0YSdcbiAgICB9XG4gIH0sXG4gIGxheWVyOiB7XG4gICAgcmVxdWlyZWQ6ICdQYWtvbGxpbmVuKicsXG4gICAgcmFkaXVzOiAnU8OkZGUnLFxuICAgIHdlaWdodDogJ1BhaW5vdHVzJyxcbiAgICBwcm9wZXJ0eUJhc2VkT246ICd7cHJvcGVydHl9IHBlcnVzdHVlbiBhcnZvb24nLFxuICAgIGNvbG9yOiAnVsOkcmknLFxuICAgIGZpbGxDb2xvcjogJ1TDpHl0w7ZuIHbDpHJpJyxcbiAgICBvdXRsaW5lOiAnw6TDpHJpdmlpdmEnLFxuICAgIGNvdmVyYWdlOiAnS2F0dGF2dXVzJyxcbiAgICBzdHJva2U6ICdWaWl2YScsXG4gICAgc3Ryb2tlV2lkdGg6ICdWaWl2YW4gcGFrc3V1cycsXG4gICAgc3Ryb2tlQ29sb3I6ICdWaWl2YW4gdsOkcmknLFxuICAgIGJhc2ljOiAnUGVydXMnLFxuICAgIHRyYWlsTGVuZ3RoOiAnSsOkbGplbiBwaXR1dXMnLFxuICAgIHRyYWlsTGVuZ3RoRGVzY3JpcHRpb246ICdKw6RsamVuIGtlc3RvIHNla3VudGVpbmEsIGVubmVua3VpbiBzZSBoaW1tZW5lZSBuw6RreXZpc3TDpCcsXG4gICAgbmV3TGF5ZXI6ICd1dXNpIHRhc28nLFxuICAgIGVsZXZhdGlvbkJ5RGVzY3JpcHRpb246ICdLdW4gYXNldHVzIG9uIHBvaXMgcMOkw6RsdMOkLCBrb3JrZXVzIHBlcnVzdHV1IHBpc3RlaWRlbiBtw6TDpHLDpMOkbicsXG4gICAgY29sb3JCeURlc2NyaXB0aW9uOiAnS3VuIGFzZXR1cyBvbiBwb2lzIHDDpMOkbHTDpCwgdsOkcmkgcGVydXN0dXUgcGlzdGVpZGVuIG3DpMOkcsOkw6RuJyxcbiAgICBhZ2dyZWdhdGVCeTogJ0FnZ3JlZ29pIGtlbnR0w6Qge2ZpZWxkfSBieScsXG4gICAgJzNETW9kZWwnOiAnM0QtbWFsbGknLFxuICAgICczRE1vZGVsT3B0aW9ucyc6ICczRC1tYWxsaW4gYXNldHVrc2V0JyxcbiAgICB0eXBlOiB7XG4gICAgICBwb2ludDogJ3Bpc3RlJyxcbiAgICAgIGFyYzogJ2thYXJpJyxcbiAgICAgIGxpbmU6ICd2aWl2YScsXG4gICAgICBncmlkOiAncnV1ZHVra28nLFxuICAgICAgaGV4YmluOiAnaGV4YmluJyxcbiAgICAgIHBvbHlnb246ICdwb2x5Z29uaScsXG4gICAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgICBjbHVzdGVyOiAna2x1c3RlcmknLFxuICAgICAgaWNvbjogJ2t1dmEnLFxuICAgICAgaGVhdG1hcDogJ2zDpG1ww7ZrYXJ0dGEnLFxuICAgICAgaGV4YWdvbjogJ2t1dXNpa3VsbWlvJyxcbiAgICAgIGhleGFnb25pZDogJ0gzJyxcbiAgICAgIHRyaXA6ICdtYXRrYScsXG4gICAgICBzMjogJ1MyJyxcbiAgICAgICczZCc6ICczRCdcbiAgICB9LFxuICAgIGxheWVyVXBkYXRlRXJyb3I6XG4gICAgICAnVGFzb24gcMOkaXZpdHlrc2VuIGFpa2FuYSB0YXBhaHR1aSB2aXJoZToge2Vycm9yTWVzc2FnZX0uIFZhcm1pc3RhLCBldHTDpCBzecO2dGV0aWV0b2plbiBtdW90byBvbiBrZWx2b2xsaW5lbi4nXG4gIH0sXG4gIGxheWVyVmlzQ29uZmlnczoge1xuICAgIHN0cm9rZVdpZHRoOiAnVmlpdmFuIHBha3N1dXMnLFxuICAgIHN0cm9rZVdpZHRoUmFuZ2U6ICdWaWl2YW4gcGFrc3V1ZGVuIHJhamF0JyxcbiAgICByYWRpdXM6ICdTw6RkZScsXG4gICAgZml4ZWRSYWRpdXM6ICdWYWtpb3PDpGRlIG1ldHJlaW7DpCcsXG4gICAgZml4ZWRSYWRpdXNEZXNjcmlwdGlvbjogJ0thcnRhbiBzw6RkZSBhYnNvbHV1dHRpc2Vrc2kgc8OkdGVla3NpIG1ldHJlaW7DpCwgZXNpbS4gNSAtPiA1IG1ldHJpaW4nLFxuICAgIHJhZGl1c1JhbmdlOiAnU8OkdGVlbiByYWphdCcsXG4gICAgY2x1c3RlclJhZGl1czogJ0tsdXN0ZXJpZW4gc8OkZGUgcGlrc2VsZWluw6QnLFxuICAgIHJhZGl1c1JhbmdlUGl4ZWxzOiAnU8OkdGVlbiByYWphdCBwaWtzZWxlaW7DpCcsXG4gICAgYmlsbGJvYXJkOiAnQmlsbGJvYXJkIC10aWxhJyxcbiAgICBiaWxsYm9hcmREZXNjcmlwdGlvbjogJ1N1dW50YWEgZ2VvbWV0cmlhIGthbWVyYWEga29odGknLFxuICAgIGZhZGVUcmFpbDogJ0jDpGlweXbDpCBwb2xrdScsXG4gICAgb3BhY2l0eTogJ0zDpHBpbsOka3l2eXlzJyxcbiAgICBjb3ZlcmFnZTogJ0thdHRhdnV1cycsXG4gICAgb3V0bGluZTogJ8OEw6RyaXZpaXZhJyxcbiAgICBjb2xvclJhbmdlOiAnVsOkcmllbiByYWphdCcsXG4gICAgc3Ryb2tlOiAnVmlpdmEnLFxuICAgIHN0cm9rZUNvbG9yOiAnVmlpdmFuIHbDpHJpJyxcbiAgICBzdHJva2VDb2xvclJhbmdlOiAnVmlpdmFuIHbDpHJpbiByYWphdCcsXG4gICAgdGFyZ2V0Q29sb3I6ICdLb2h0ZWVuIHbDpHJpJyxcbiAgICBjb2xvckFnZ3JlZ2F0aW9uOiAnVsOkcmllbiBhZ2dyZWdvaW50aScsXG4gICAgaGVpZ2h0QWdncmVnYXRpb246ICdLb3JrZXVkZW4gYWdncmVnb2ludGknLFxuICAgIHJlc29sdXRpb25SYW5nZTogJ1Jlc29sdXV0aW9uIHJhamF0JyxcbiAgICBzaXplU2NhbGU6ICdLb29uIHNrYWFsYScsXG4gICAgd29ybGRVbml0U2l6ZTogJ1lrc2lra8O2JyxcbiAgICBlbGV2YXRpb25TY2FsZTogJ0tvcm90dGFtaXNlbiBza2FhbGEnLFxuICAgIGVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3I6ICdLw6R5dMOkIGtvcmtldWRlbiB6b29tYXVza2Vycm9pbnRhJyxcbiAgICBlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yRGVzY3JpcHRpb246XG4gICAgICAnU8Okw6Rkw6Qga29ya2V1cyAvIGtvcmtldXMgbnlreWlzZW4gem9vbWF1c2tlcnRvaW1lbiBwZXJ1c3RlZWxsYScsXG4gICAgZW5hYmxlSGVpZ2h0Wm9vbUZhY3RvcjogJ0vDpHl0w6Qga29ya2V1ZGVuIHpvb21hdXNrZXJyb2ludGEnLFxuICAgIGhlaWdodFNjYWxlOiAnS29ya2V1ZGVuIHNrYWFsYScsXG4gICAgY292ZXJhZ2VSYW5nZTogJ1BlaXR0w6R2eXlkZW4gcmFqYXQnLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmc6ICdUYXJra2EgcmVuZGVyw7ZpbnRpJyxcbiAgICBoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb246ICdUYXJra2EgcmVuZGVyw7ZpbnRpIGpvaHRhYSBoaXRhYW1wYWFuIHN1b3JpdHRhbWlzZWVuJyxcbiAgICBoZWlnaHQ6ICdLb3JrZXVzJyxcbiAgICBoZWlnaHREZXNjcmlwdGlvbjogJ0tsaWtrYWEgb2lrZWFzdGEgeWzDpG51cmthc3RhIG5hcHBpYSB2YWlodGFha3Nlc2kgM0QtbsOka3ltw6TDpG4nLFxuICAgIGZpbGw6ICdUw6R5dHTDticsXG4gICAgZW5hYmxlUG9seWdvbkhlaWdodDogJ1NhbGxpIHBvbHlnb25pZW4ga29ya2V1cycsXG4gICAgc2hvd1dpcmVmcmFtZTogJ07DpHl0w6QgcmF1dGFsYW5rYW1hbGxpJyxcbiAgICB3ZWlnaHRJbnRlbnNpdHk6ICdQYWlub3R1a3NlbiBpbnRlbnNpdGVldHRpJyxcbiAgICB6b29tU2NhbGU6ICdab29tYXVzc2thYWxhJyxcbiAgICBoZWlnaHRSYW5nZTogJ0tvcmtldWRlbiByYWphdCcsXG4gICAgaGVpZ2h0TXVsdGlwbGllcjogJ0tvcmtldXNrZXJyb2luJyxcbiAgICBmaXhlZEhlaWdodDogJ0tpaW50ZcOkIGtvcmtldXMnLFxuICAgIGZpeGVkSGVpZ2h0RGVzY3JpcHRpb246ICdLw6R5dMOkIGtvcmtldXR0YSBpbG1hbiBtdXV0b2tzaWEnXG4gIH0sXG4gIGxheWVyTWFuYWdlcjoge1xuICAgIGFkZERhdGE6ICdMaXPDpMOkIGFpbmVpc3RvJyxcbiAgICBhZGRMYXllcjogJ0xpc8Okw6QgdGFzbycsXG4gICAgbGF5ZXJCbGVuZGluZzogJ1Rhc29qZW4gc2Vrb2l0dHV2dXVzJ1xuICB9LFxuICBtYXBNYW5hZ2VyOiB7XG4gICAgbWFwU3R5bGU6ICdLYXJ0YW4gdHl5bGknLFxuICAgIGFkZE1hcFN0eWxlOiAnTGlzw6TDpCB0eXlsaSBrYXJ0YWxsZScsXG4gICAgJzNkQnVpbGRpbmdDb2xvcic6ICczRC1yYWtlbm51c3RlbiB2w6RyaScsXG4gICAgYmFja2dyb3VuZENvbG9yOiAnVGF1c3RhdsOkcmknXG4gIH0sXG4gIGxheWVyQ29uZmlndXJhdGlvbjoge1xuICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJ0xhc2tlIHN1dXJlZW4ge3Byb3BlcnR5fSBhcnZvIHZhbGl0dW4ga2VudMOkbiBwZXJ1c3RlZWxsYScsXG4gICAgaG93VG86ICdNaXRlbiB0b2ltaWknXG4gIH0sXG4gIGZpbHRlck1hbmFnZXI6IHtcbiAgICBhZGRGaWx0ZXI6ICdMaXPDpMOkIHN1b2RhdGluJ1xuICB9LFxuICBkYXRhc2V0VGl0bGU6IHtcbiAgICBzaG93RGF0YVRhYmxlOiAnTsOkeXTDpCBhdHRyaWJ1dXR0aXRhdWx1JyxcbiAgICByZW1vdmVEYXRhc2V0OiAnUG9pc3RhIGFpbmVpc3RvJ1xuICB9LFxuICBkYXRhc2V0SW5mbzoge1xuICAgIHJvd0NvdW50OiAne3Jvd0NvdW50fSByaXZpw6QnXG4gIH0sXG4gIHRvb2x0aXA6IHtcbiAgICBoaWRlTGF5ZXI6ICdQaWlsb3RhIHRhc28nLFxuICAgIHNob3dMYXllcjogJ07DpHl0w6QgdGFzbycsXG4gICAgaGlkZUZlYXR1cmU6ICdQaWlsb3RhIGtvaGRlJyxcbiAgICBzaG93RmVhdHVyZTogJ07DpHl0w6Qga29oZGUnLFxuICAgIGhpZGU6ICdwaWlsb3RhJyxcbiAgICBzaG93OiAnbsOkeXTDpCcsXG4gICAgcmVtb3ZlTGF5ZXI6ICdQb2lzdGEgdGFzbycsXG4gICAgcmVzZXRBZnRlckVycm9yOiAnWXJpdMOkIG90dGFhIHRhc28ga8OkeXR0w7bDtm4gdmlyaGVlbiBqw6Rsa2VlbicsXG4gICAgbGF5ZXJTZXR0aW5nczogJ1Rhc29uIGFzZXR1a3NldCcsXG4gICAgY2xvc2VQYW5lbDogJ1N1bGplIHBhbmVlbGknLFxuICAgIHN3aXRjaFRvRHVhbFZpZXc6ICdWYWloZGEga2Frc29pc2thcnJ0YW7DpGt5bcOkw6RuJyxcbiAgICBzaG93TGVnZW5kOiAnTsOkeXTDpCBzZWxpdGUnLFxuICAgIGRpc2FibGUzRE1hcDogJ1BvaXN0dSAzRC1uw6RreW3DpHN0w6QnLFxuICAgIERyYXdPbk1hcDogJ1BpaXJyw6Qga2FydGFsbGUnLFxuICAgIHNlbGVjdExvY2FsZTogJ1ZhbGl0c2Uga2llbGlzeXlzJyxcbiAgICBzaG93QWlBc3Npc3RhbnRQYW5lbDogJ07DpHl0w6QgQUktYXB1b2hqZWxtYW4gcGFuZWVsaScsXG4gICAgaGlkZUFpQXNzaXN0YW50UGFuZWw6ICdQaWlsb3RhIEFJLWFwdW9oamVsbWFuIHBhbmVlbGknLFxuICAgIGhpZGVMYXllclBhbmVsOiAnUGlpbG90YSB0YXNvcGFuZWVsaScsXG4gICAgc2hvd0xheWVyUGFuZWw6ICdOw6R5dMOkIHRhc29wYW5lZWxpJyxcbiAgICBtb3ZlVG9Ub3A6ICdTaWlycsOkIHRhc29qZW4gcMOkw6RsbGltbcOkaXNla3NpJyxcbiAgICBzZWxlY3RCYXNlTWFwU3R5bGU6ICdWYWxpdHNlIHRhdXN0YWthcnR0YXR5eWxpJyxcbiAgICBkZWxldGU6ICdQb2lzdGEnLFxuICAgIHRpbWVQbGF5YmFjazogJ0FqYW4gYW5pbW9pbnRpJyxcbiAgICBjbG91ZFN0b3JhZ2U6ICdQaWx2aXRhbGxlbm51cycsXG4gICAgJzNETWFwJzogJzNELW7DpGt5bcOkJ1xuICB9LFxuICB0b29sYmFyOiB7XG4gICAgZXhwb3J0SW1hZ2U6ICdWaWUga3V2YScsXG4gICAgZXhwb3J0RGF0YTogJ1ZpZSBhaW5laXN0b3QnLFxuICAgIGV4cG9ydE1hcDogJ1ZpZSBrYXJ0dGEnLFxuICAgIHNoYXJlTWFwVVJMOiAnSmFhIGthcnRhbiBVUkwnLFxuICAgIHNhdmVNYXA6ICdUYWxsZW5uYSBrYXJ0dGEnLFxuICAgIHNlbGVjdDogJ3ZhbGl0c2UnLFxuICAgIHBvbHlnb246ICdwb2x5Z29uaScsXG4gICAgcmVjdGFuZ2xlOiAnbmVsaWt1bG1pbycsXG4gICAgaGlkZTogJ3BpaWxvdGEnLFxuICAgIHNob3c6ICduw6R5dMOkJyxcbiAgICAuLi5MT0NBTEVTXG4gIH0sXG4gIG1vZGFsOiB7XG4gICAgdGl0bGU6IHtcbiAgICAgIGRlbGV0ZURhdGFzZXQ6ICdQb2lzdGEgYWluZWlzdG8nLFxuICAgICAgYWRkRGF0YVRvTWFwOiAnTGlzw6TDpCBhaW5laXN0b2phIGthcnRhbGxlJyxcbiAgICAgIGV4cG9ydEltYWdlOiAnVmllIGt1dmEnLFxuICAgICAgZXhwb3J0RGF0YTogJ1ZpZSBhaW5laXN0b3QnLFxuICAgICAgZXhwb3J0TWFwOiAnVmllIGthcnR0YScsXG4gICAgICBhZGRDdXN0b21NYXBib3hTdHlsZTogJ0xpc8Okw6Qgb21hIE1hcGJveC10eXlsaScsXG4gICAgICBzYXZlTWFwOiAnVGFsbGVubmEga2FydHRhJyxcbiAgICAgIHNoYXJlVVJMOiAnSmFhIFVSTCdcbiAgICB9LFxuICAgIGJ1dHRvbjoge1xuICAgICAgZGVsZXRlOiAnUG9pc3RhJyxcbiAgICAgIGRvd25sb2FkOiAnTGF0YWEnLFxuICAgICAgZXhwb3J0OiAnVmllJyxcbiAgICAgIGFkZFN0eWxlOiAnTGlzw6TDpCB0eXlsaScsXG4gICAgICBzYXZlOiAnVGFsbGVubmEnLFxuICAgICAgZGVmYXVsdENhbmNlbDogJ1BlcnUnLFxuICAgICAgZGVmYXVsdENvbmZpcm06ICdWYWh2aXN0YSdcbiAgICB9LFxuICAgIGV4cG9ydEltYWdlOiB7XG4gICAgICByYXRpb1RpdGxlOiAnS3V2YXN1aGRlJyxcbiAgICAgIHJhdGlvRGVzY3JpcHRpb246ICdWYWxpdHNlIHNvcGl2YSBrdXZhc3VoZGUga8OkeXR0w7Z0YXBhdXN0YXNpIHZhcnRlbi4nLFxuICAgICAgcmF0aW9PcmlnaW5hbFNjcmVlbjogJ0Fsa3VwZXLDpGluZW4gbsOkeXR0w7YnLFxuICAgICAgcmF0aW9DdXN0b206ICdLdXN0b21vaXR1JyxcbiAgICAgIHJhdGlvNF8zOiAnNDozJyxcbiAgICAgIHJhdGlvMTZfOTogJzE2OjknLFxuICAgICAgcmVzb2x1dGlvblRpdGxlOiAnUmVzb2x1dXRpbycsXG4gICAgICByZXNvbHV0aW9uRGVzY3JpcHRpb246ICdLb3JrZWEgcmVzb2x1dXRpbyBvbiBwYXJlbXBpIHR1bG9zdGFtaXN0YSB2YXJ0ZW4uJyxcbiAgICAgIG1hcExlZ2VuZFRpdGxlOiAnS2FydGFuIHNlbGl0ZScsXG4gICAgICBtYXBMZWdlbmRBZGQ6ICdMaXPDpMOkIHNlbGl0ZSBrYXJ0dGFhbidcbiAgICB9LFxuICAgIGV4cG9ydERhdGE6IHtcbiAgICAgIGRhdGFzZXRUaXRsZTogJ0FpbmVpc3RvdCcsXG4gICAgICBkYXRhc2V0U3VidGl0bGU6ICdWYWxpdHNlIGFpbmVpc3RvLCBqb25rYSBhaW90IHZpZWTDpCcsXG4gICAgICBhbGxEYXRhc2V0czogJ0thaWtraScsXG4gICAgICBkYXRhVHlwZVRpdGxlOiAnQWluZWlzdG9qZW4gZm9ybWFhdHRpJyxcbiAgICAgIGRhdGFUeXBlU3VidGl0bGU6ICdWYWxpdHNlIGFpbmVpc3RvZm9ybWFhdHRpIHZhbGl0c2VtaWxsZXNpIGFpbmVpc3RvaWxsZScsXG4gICAgICBmaWx0ZXJEYXRhVGl0bGU6ICdTdW9kYXRhIGFpbmVpc3RvamEnLFxuICAgICAgZmlsdGVyRGF0YVN1YnRpdGxlOiAnVm9pdCB2aWVkw6Qgam9rbyBhbGt1cGVyw6Rpc2V0IGFpbmVpc3RvdCB0YWkgc3VvZGF0ZXR1dCBhaW5laXN0b3QnLFxuICAgICAgZmlsdGVyZWREYXRhOiAnU3VvZGF0ZXR1dCBhaW5laXN0b3QnLFxuICAgICAgdW5maWx0ZXJlZERhdGE6ICdTdW9kYXR0YW1hdHRvbWF0IGFpbmVpc3RvdCcsXG4gICAgICBmaWxlQ291bnQ6ICd7ZmlsZUNvdW50fSB0aWVkb3N0b2EnLFxuICAgICAgcm93Q291bnQ6ICd7cm93Q291bnR9IHJpdmnDpCdcbiAgICB9LFxuICAgIGRlbGV0ZURhdGE6IHtcbiAgICAgIHdhcm5pbmc6ICdhaW90IHBvaXN0YWEgdMOkbcOkbiBhaW5laXN0b24uIEFpbmVvc3RvYSBrw6R5dHTDpHZpZW4gdGFzb2plbiBsdWt1bcOkw6Ryw6Q6IHtsZW5ndGh9J1xuICAgIH0sXG4gICAgYWRkU3R5bGU6IHtcbiAgICAgIHB1Ymxpc2hUaXRsZTogJzEuIEp1bGthaXNlIHR5eWxpc2kgTWFwYm94aXNzYSB0YWkgYW5uYSB0dW5uaXN0ZScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUxOiAnVm9pdCBsdW9kYSBvbWFuIGthcnR0YXR5eWxpc2kgc2l2dWxsYScsXG4gICAgICBwdWJsaXNoU3VidGl0bGUyOiAnamEnLFxuICAgICAgcHVibGlzaFN1YnRpdGxlMzogJ2p1bGthaXN0YScsXG4gICAgICBwdWJsaXNoU3VidGl0bGU0OiAnc2VuLicsXG4gICAgICBwdWJsaXNoU3VidGl0bGU1OiAnS8OkeXR0w6TDpGtzZXNpIHlrc2l0eWlzdMOkIHR5eWxpw6QsIGxpaXTDpCcsXG4gICAgICBwdWJsaXNoU3VidGl0bGU2OiAndHVubmlzdGVlc2knLFxuICAgICAgcHVibGlzaFN1YnRpdGxlNzpcbiAgICAgICAgJ3TDpG5uZS4gKmtlcGxlci5nbCBvbiBjbGllbnQtc2lkZSBzb3ZlbGx1cywgZGF0YSBweXN5eSB2YWluIHNlbGFpbWVzc2FzaS4uLicsXG4gICAgICBleGFtcGxlVG9rZW46ICdlc2ltLiBway5hYmNkZWZnLnh4eHh4eCcsXG4gICAgICBwYXN0ZVRpdGxlOiAnMi4gTGlpdMOkIHR5eWxpLVVSTCcsXG4gICAgICBwYXN0ZVN1YnRpdGxlMTogJ01pa8OkIG9uJyxcbiAgICAgIHBhc3RlU3VidGl0bGUyOiAndHl5bGktVVJMPycsXG4gICAgICBuYW1pbmdUaXRsZTogJzMuIE5pbWXDpCB0eXlsaXNpJ1xuICAgIH0sXG4gICAgc2hhcmVNYXA6IHtcbiAgICAgIHNoYXJlVXJpVGl0bGU6ICdKYWEga2FydGFuIFVSTCcsXG4gICAgICBzaGFyZVVyaVN1YnRpdGxlOiAnTHVvIGthcnRhbGxlIFVSTCwgam9ua2Egdm9pdCBqYWthYSBtdWlkZW4ga2Fuc3NhJyxcbiAgICAgIGNsb3VkVGl0bGU6ICdQaWx2aXRhbGxlbm51cycsXG4gICAgICBjbG91ZFN1YnRpdGxlOlxuICAgICAgICAnS2lyamF1ZHUgc2lzw6TDpG4gamEgbGF0YWEga2FydHRhIGphIGFpbmVpc3RvdCBoZW5raWzDtmtvaHRhaXNlZW4gcGlsdmlwYWx2ZWx1dW4nLFxuICAgICAgc2hhcmVEaXNjbGFpbWVyOlxuICAgICAgICAna2VwbGVyLmdsIHRhbGxlbnRhYSBrYXJ0YW4gZGF0YW4gaGVua2lsw7Zrb2h0YWlzZWVuIHBpbHZpdGFsbGVubnVzdGlsYWFzaSwgdmFpbiBpaG1pc2V0LCBqb2lsbGEgb24gVVJMLCB2b2l2YXQgcMOkw6RzdMOkIGvDpHNpa3NpIGthcnR0YWFuIGphIGFpbmVpc3RvaWhpbi4gJyArXG4gICAgICAgICdWb2l0IG11b2thdGEgdGllZG9zdG9qYSB0YWkgcG9pc3RhYSBuZSBwaWx2aXBhbHZlbHVzdGFzaSBtaWxsb2luIHZhaW4uJyxcbiAgICAgIGdvdG9QYWdlOiAnTWVuZSBLZXBsZXIuZ2wge2N1cnJlbnRQcm92aWRlcn0gc2l2dWxsZXNpJ1xuICAgIH0sXG4gICAgc3RhdHVzUGFuZWw6IHtcbiAgICAgIG1hcFVwbG9hZGluZzogJ0thcnR0YWEgbGFkYXRhYW4nLFxuICAgICAgZXJyb3I6ICdWaXJoZSdcbiAgICB9LFxuICAgIHNhdmVNYXA6IHtcbiAgICAgIHRpdGxlOiAnUGlsdml0YWxsZW5udXMnLFxuICAgICAgc3VidGl0bGU6ICdLaXJqYXVkdSBzaXPDpMOkbiBwaWx2aXBhbHZlbHV1c2kgdGFsbGVudGFha3Nlc2kga2FydGFuJ1xuICAgIH0sXG4gICAgZXhwb3J0TWFwOiB7XG4gICAgICBmb3JtYXRUaXRsZTogJ0thcnRhbiBmb3JtYWF0dGknLFxuICAgICAgZm9ybWF0U3VidGl0bGU6ICdWYWxpdHNlIGZvcm1hYXR0aSwgam9zc2EgdmlldCBrYXJ0YW4nLFxuICAgICAgaHRtbDoge1xuICAgICAgICBzZWxlY3Rpb246ICdWaWUga2FydHRhIGludGVyYWt0aWl2aXNlbmEgaHRtbC10aWVkb3N0b25hJyxcbiAgICAgICAgdG9rZW5UaXRsZTogJ01hcGJveC10dW5uaXN0ZScsXG4gICAgICAgIHRva2VuU3VidGl0bGU6ICdLw6R5dMOkIG9tYWEgTWFwYm94LXR1bm5pc3RldHRhc2kgaHRtbC10aWVkb3N0b3NzYSAodmFsaW5uYWluZW4pJyxcbiAgICAgICAgdG9rZW5QbGFjZWhvbGRlcjogJ0xpaXTDpCBNYXBib3gtdHVubmlzdGVlc2knLFxuICAgICAgICB0b2tlbk1pc3VzZVdhcm5pbmc6XG4gICAgICAgICAgJyogSm9zIGV0IGvDpHl0w6Qgb21hYSB0dW5uaXN0ZXR0YXNpLCBrYXJ0dGEgdm9pIGxha2F0YSB0b2ltaW1hc3RhIG1pbGxvaW4gdmFpbiBrdW4gdmFpaGRhbW1lIG9tYWEgdHVubmlzdGV0dGFtbWUgdsOkw6RyaW5rw6R5dMO2biBlc3TDpG1pc2Vrc2kuICcsXG4gICAgICAgIHRva2VuRGlzY2xhaW1lcjogJ1ZvaXQgdmFpaHRhYSBNYXBib3gtdHVubmlzdGVlc2kgbsOkaWRlbiBvaGplaWRlbiBhdnVsbGE6ICcsXG4gICAgICAgIHRva2VuVXBkYXRlOiAnS3VpbmthIHZhaWh0YWEgb2xlbWFzc2FvbGV2YSBNYXBib3gtdHVubmlzdGUnLFxuICAgICAgICBtb2RlVGl0bGU6ICdLYXJ0YW4gdGlsYScsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTE6ICdWYWxpdHNlIGthcnRhbiB0aWxhLicsXG4gICAgICAgIG1vZGVTdWJ0aXRsZTI6ICdMaXPDpHRpZXRvamEnLFxuICAgICAgICBtb2RlRGVzY3JpcHRpb246ICdBbm5hIGvDpHl0dMOkamllbiB7bW9kZX0ga2FydHRhYScsXG4gICAgICAgIHJlYWQ6ICdsdWtlYScsXG4gICAgICAgIGVkaXQ6ICdtdW9rYXRhJ1xuICAgICAgfSxcbiAgICAgIGpzb246IHtcbiAgICAgICAgY29uZmlnVGl0bGU6ICdLYXJ0YW4gYXNldHVrc2V0JyxcbiAgICAgICAgY29uZmlnRGlzY2xhaW1lcjpcbiAgICAgICAgICAnS2FydGFuIGFzZXR1a3NldCBzaXPDpGx0eXbDpHQgSnNvbi10aWVkb3N0b29uLiBKb3Mga8OkeXTDpHQga2lyamFzdG9hIGtlcGxlci5nbCBvbWFzc2Egc292ZWxsdWtzZXNzYXNpLiBWb2l0IGtvcGlvaWRhIGFzZXR1a3NldCBqYSBhbnRhYSBuZSBmdW5rdGlvbGxlOiAnLFxuICAgICAgICBzZWxlY3Rpb246XG4gICAgICAgICAgJ1ZpZSBreXNlaXNlbiBrYXJ0YW4gYWluZWlzdG90IGphIGFzZXR1a3NldCB5aGRlc3PDpCBqc29uLXRpZWRvc3Rvc3NhLiBWb2l0IG15w7ZoZW1taW4gYXZhdGEgc2FtYW4ga2FydGFuIGxhdGFhbWFsbGEgdGllZG9zdG9uIGtlcGxlci5nbDpuJyxcbiAgICAgICAgZGlzY2xhaW1lcjpcbiAgICAgICAgICAnKiBLYXJ0YW4gYXNldHVrc2V0IG92YXQgc2lkb2tzaXNzYSBsYWRhdHR1aWhpbiBhaW5laXN0b2loaW4uIEFydm9hIOKAmGRhdGFJZOKAmSBrw6R5dGV0w6TDpG4gdGFzb2plbiwgc3VvZGF0dGltaWVuIGphIHZpaGplaWRlbiBsaWl0dMOkbWlzZWtzaSB0aWV0dHl5biBhaW5laXN0b29uLiAnICtcbiAgICAgICAgICAnVmFybWlzdGEsIGV0dMOkIGFpbmVpc3RvbiBkYXRhSWQ6dCB2YXN0YWF2YXQgYXNldHVzdGVuIGFydm9qYSBqb3MgbGF0YWF0IGFzZXR1a3NldCBrw6R5dHTDpGVuIGBhZGREYXRhVG9NYXBgLWZ1bmt0aW9sbGUuJ1xuICAgICAgfVxuICAgIH0sXG4gICAgbG9hZGluZ0RpYWxvZzoge1xuICAgICAgbG9hZGluZzogJ0xhZGF0YWFuLi4uJ1xuICAgIH0sXG4gICAgbG9hZERhdGE6IHtcbiAgICAgIHVwbG9hZDogJ0xhdGFhIHRpZWRvc3RvdCcsXG4gICAgICBzdG9yYWdlOiAnTGF0YWEgdGFsbGVubnVzdGlsYXN0YSdcbiAgICB9LFxuICAgIHRyaXBJbmZvOiB7XG4gICAgICB0aXRsZTogJ0t1aW5rYSBrw6R5dHTDpMOkIG1hdGthLWFuaW1hYXRpb3RhJyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ1JlaXRpbiBhbmltb2ltaXNla3NpIGdlb0pTT04tYWluZWlzdG9uIHTDpHl0eXkgb2xsYSBnZW9tZXRyaWF0eXlwaWx0w6TDpG4gYExpbmVTdHJpbmdgLCBMaW5lU3RyaW5nLWtvb3JkaW5hYXR0aWVuIHTDpHl0eXkgc2lzw6RsdMOkw6QgNCBlbGVtZW50dGnDpCBmb3JtYWF0aXNzYTonLFxuICAgICAgY29kZTogJyBbcGl0dXVzYXN0ZSwgbGV2ZXlzYXN0ZSwga29ya2V1cywgYWlrYWxlaW1hXSAnLFxuICAgICAgZGVzY3JpcHRpb24yOlxuICAgICAgICAnc2l0ZW4sIGV0dMOkIHZpaW1laW5lbiBlbGVtZW50dGkgb24gYWlrYWxlaW1hLiBBaWthbGVpbWEgdm9pIG9sbGEgbXVvZG9sdGFhbiB1bml4LXNla3VudGVqYSwga3V0ZW4gYDE1NjQxODQzNjNgIHRhaSBtaWxsaXNla3VudGVqYSwga3V0ZW4gYDE1NjQxODQzNjMwMDBgLicsXG4gICAgICBleGFtcGxlOiAnRXNpbWVya2tpOidcbiAgICB9LFxuICAgIGljb25JbmZvOiB7XG4gICAgICB0aXRsZTogJ01pdGVuIHBpaXJ0w6TDpCBrdXZpYScsXG4gICAgICBkZXNjcmlwdGlvbjE6XG4gICAgICAgICdjc3YtdGllZG9zdG9zc2FzaSwgbHVvIHNhcmFrZSBuaW1lbHTDpCBpY29uLiBWb2l0IGrDpHR0w6TDpCBzZW4gdHloasOka3NpIGpvcyBldCBoYWx1YSBwaWlydMOkw6Qga3V2YWEgam9pbGxhaW4gcGlzdGVpbGzDpC4gS3VuIHNhcmFra2VlbiBuaW1pIG9uICcsXG4gICAgICBjb2RlOiAnaWNvbicsXG4gICAgICBkZXNjcmlwdGlvbjI6ICcga2VwbGVyLmdsIGx1byBhdXRvbWFhdHRpc2VzdGkga3V2YXRhc29uIHNpbnVhIHZhcnRlbi4nLFxuICAgICAgZXhhbXBsZTogJ0VzaW1lcmtraTonLFxuICAgICAgaWNvbnM6ICdLdXZhdCdcbiAgICB9LFxuICAgIHN0b3JhZ2VNYXBWaWV3ZXI6IHtcbiAgICAgIGxhc3RNb2RpZmllZDogJ1ZpaW1la3NpIG11b2thdHR1IHtsYXN0VXBkYXRlZH0gc2l0dGVuJyxcbiAgICAgIGJhY2s6ICdUYWthaXNpbidcbiAgICB9LFxuICAgIG92ZXJ3cml0ZU1hcDoge1xuICAgICAgdGl0bGU6ICdUYWxsZW5uZXRhYW4ga2FydHRhYS4uLicsXG4gICAgICBhbHJlYWR5RXhpc3RzOiAnb24gam8ge21hcFNhdmVkfTpzc2EuIEhhbHVhdGtvIHlsaWtpcmpvaXR0YWEgc2VuPydcbiAgICB9LFxuICAgIGxvYWRTdG9yYWdlTWFwOiB7XG4gICAgICBiYWNrOiAnVGFrYWlzaW4nLFxuICAgICAgZ29Ub1BhZ2U6ICdNZW5lIEtlcGxlci5nbCB7ZGlzcGxheU5hbWV9IHNpdnVsbGVzaScsXG4gICAgICBzdG9yYWdlTWFwczogJ1RhbGxlbm51cyAvIEthcnRhdCcsXG4gICAgICBub1NhdmVkTWFwczogJ0VpIHRhbGxlbm5ldHR1amEga2FydHRvamEgdmllbMOkJ1xuICAgIH1cbiAgfSxcbiAgaGVhZGVyOiB7XG4gICAgdmlzaWJsZUxheWVyczogJ07DpGt5dmlzc8OkIG9sZXZhdCB0YXNvdCcsXG4gICAgbGF5ZXJMZWdlbmQ6ICdUYXNvbiBzZWxpdGUnXG4gIH0sXG4gIGludGVyYWN0aW9uczoge1xuICAgIHRvb2x0aXA6ICdWaWhqZScsXG4gICAgYnJ1c2g6ICdIYXJqYScsXG4gICAgY29vcmRpbmF0ZTogJ0tvb3JkaW5hYXRpdCdcbiAgfSxcbiAgbGF5ZXJCbGVuZGluZzoge1xuICAgIHRpdGxlOiAnVGFzb2plbiBzZWtvaXR0dXZ1dXMnLFxuICAgIGFkZGl0aXZlOiAnbGlzw6TDpHbDpCcsXG4gICAgbm9ybWFsOiAnbm9ybWFhbGknLFxuICAgIHN1YnRyYWN0aXZlOiAndsOkaGVudMOkdsOkJ1xuICB9LFxuICBjb2x1bW5zOiB7XG4gICAgdGl0bGU6ICdTYXJha2tlZXQnLFxuICAgIGxhdDogJ2xhdCcsXG4gICAgbG5nOiAnbG5nJyxcbiAgICBhbHRpdHVkZTogJ2tvcmtldXMnLFxuICAgIGljb246ICdrdXZhJyxcbiAgICBnZW9qc29uOiAnZ2VvanNvbicsXG4gICAgYXJjOiB7XG4gICAgICBsYXQwOiAnbMOkaGTDtm4gbGF0JyxcbiAgICAgIGxuZzA6ICdsw6RoZMO2biBsbmcnLFxuICAgICAgbGF0MTogJ2tvaHRlZW4gbGF0JyxcbiAgICAgIGxuZzE6ICdrb2h0ZWVuIGxuZydcbiAgICB9LFxuICAgIGxpbmU6IHtcbiAgICAgIGFsdDA6ICdsw6RodGVlbiBrb3JrZXVzJyxcbiAgICAgIGFsdDE6ICdrb2hkZSBrb3JrZXVzJ1xuICAgIH0sXG4gICAgZ3JpZDoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ1J1dXR1amVuIGtva28gKGttKSdcbiAgICB9LFxuICAgIGhleGFnb246IHtcbiAgICAgIHdvcmxkVW5pdFNpemU6ICdIZXhhZ29uaWVuIHPDpGRlIChrbSknXG4gICAgfVxuICB9LFxuICBjb2xvcjoge1xuICAgIGN1c3RvbVBhbGV0dGU6ICdNdWthdXRldHR1IHBhbGV0dGknLFxuICAgIHN0ZXBzOiAnYXNrZWxlZXQnLFxuICAgIHR5cGU6ICd0eXlwcGknLFxuICAgIHJldmVyc2VkOiAna8Okw6RudGVpbmVuJ1xuICB9LFxuICBzY2FsZToge1xuICAgIGNvbG9yU2NhbGU6ICdWw6RyaW4gc2thYWxhJyxcbiAgICBzaXplU2NhbGU6ICdLb29uIHNrYWFsYScsXG4gICAgc3Ryb2tlU2NhbGU6ICdWaWl2YW4gcGFrc3V1ZGVuIHNrYWFsYScsXG4gICAgc2NhbGU6ICdTa2FhbGEnXG4gIH0sXG4gIGZpbGVVcGxvYWRlcjoge1xuICAgIG1lc3NhZ2U6ICdSYWFoYWEgamEgcHVkb3RhIHRpZWRvc3Rvc2kgdMOkbm5lJyxcbiAgICBjaHJvbWVNZXNzYWdlOlxuICAgICAgJypDaHJvbWVuIGvDpHl0dMOkasOkOiBSYWpvaXRhIHRpZWRvc3Rva29rb3NpIDI1ME1iOmhlbi4gSm9zIGhhbHVhdCBzdXVyZW1waWEgdGllZG9zdG9qYSwga29rZWlsZSBTYWZhcmlhJyxcbiAgICBkaXNjbGFpbWVyOlxuICAgICAgJyprZXBsZXIuZ2wgb24gY2xpZW50LXNpZGUgc292ZWxsdXMsIGRhdGEgcHlzeXkgdmFpbiBzZWxhaW1lc3Nhc2kuLi4nICtcbiAgICAgICdUaWV0b2phIGVpIGzDpGhldGV0w6QgcGFsdmVsaW1lbGxlLicsXG4gICAgY29uZmlnVXBsb2FkTWVzc2FnZTpcbiAgICAgICdMaXPDpMOkIHtmaWxlRm9ybWF0TmFtZXN9IHRhaSB0YWxsZW5uZXR0dSBrYXJ0dGEgKipKc29uKiouIEx1ZSBsaXPDpMOkIFsqKnR1ZXR1aXN0YSBmb3JtYWF0ZWlzdGEqKl0nLFxuICAgIGJyb3dzZUZpbGVzOiAnc2VsYWEgdGllZG9zdG9qYXNpJyxcbiAgICB1cGxvYWRpbmc6ICdsYWRhdGFhbicsXG4gICAgZmlsZU5vdFN1cHBvcnRlZDogJ1RpZWRvc3RvIHtlcnJvckZpbGVzfSBlaSBvbGUgdHVldHR1LicsXG4gICAgb3I6ICd0YWknXG4gIH0sXG4gIGRlbnNpdHk6ICd0aWhleXMnLFxuICAnQnVnIFJlcG9ydCc6ICdCdWdpcmFwb3J0b2ludGknLFxuICAnVXNlciBHdWlkZSc6ICdPcGFzJyxcbiAgU2F2ZTogJ1RhbGxlbm5hJyxcbiAgU2hhcmU6ICdKYWEnXG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUdBLElBQUFBLFFBQUEsR0FBQUMsT0FBQTtBQUFtQyxTQUFBQyxRQUFBQyxDQUFBLEVBQUFDLENBQUEsUUFBQUMsQ0FBQSxHQUFBQyxNQUFBLENBQUFDLElBQUEsQ0FBQUosQ0FBQSxPQUFBRyxNQUFBLENBQUFFLHFCQUFBLFFBQUFDLENBQUEsR0FBQUgsTUFBQSxDQUFBRSxxQkFBQSxDQUFBTCxDQUFBLEdBQUFDLENBQUEsS0FBQUssQ0FBQSxHQUFBQSxDQUFBLENBQUFDLE1BQUEsV0FBQU4sQ0FBQSxXQUFBRSxNQUFBLENBQUFLLHdCQUFBLENBQUFSLENBQUEsRUFBQUMsQ0FBQSxFQUFBUSxVQUFBLE9BQUFQLENBQUEsQ0FBQVEsSUFBQSxDQUFBQyxLQUFBLENBQUFULENBQUEsRUFBQUksQ0FBQSxZQUFBSixDQUFBO0FBQUEsU0FBQVUsY0FBQVosQ0FBQSxhQUFBQyxDQUFBLE1BQUFBLENBQUEsR0FBQVksU0FBQSxDQUFBQyxNQUFBLEVBQUFiLENBQUEsVUFBQUMsQ0FBQSxXQUFBVyxTQUFBLENBQUFaLENBQUEsSUFBQVksU0FBQSxDQUFBWixDQUFBLFFBQUFBLENBQUEsT0FBQUYsT0FBQSxDQUFBSSxNQUFBLENBQUFELENBQUEsT0FBQWEsT0FBQSxXQUFBZCxDQUFBLFFBQUFlLGdCQUFBLGFBQUFoQixDQUFBLEVBQUFDLENBQUEsRUFBQUMsQ0FBQSxDQUFBRCxDQUFBLFNBQUFFLE1BQUEsQ0FBQWMseUJBQUEsR0FBQWQsTUFBQSxDQUFBZSxnQkFBQSxD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