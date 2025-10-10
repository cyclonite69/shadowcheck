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
    weight: 'вес',
    label: 'ярлык',
    fillColor: 'цвет заливки',
    color: 'цвет',
    coverage: 'покрытие',
    strokeColor: 'цвет обводки',
    radius: 'радиус',
    outline: 'контур',
    stroke: 'обводка',
    density: 'плотность',
    height: 'высота',
    sum: 'сумма',
    pointCount: 'Кол-во точек'
  },
  placeholder: {
    search: 'Поиск',
    selectField: 'Выберите поле',
    yAxis: 'Y Ось',
    selectType: 'Выберите A тип',
    selectValue: 'Выберите A значение',
    enterValue: 'Введите значение',
    empty: 'пустой'
  },
  misc: {
    by: '',
    valuesIn: 'Значение в',
    valueEquals: 'Значение равно',
    dataSource: 'Источник данных',
    brushRadius: 'Радиус кисти (km)',
    empty: ' '
  },
  mapLayers: {
    title: 'Слои карты',
    label: 'Обозначения',
    road: 'Дороги',
    border: 'Границы',
    building: 'Здания',
    water: 'Вода',
    land: 'Земля',
    '3dBuilding': '3d здания'
  },
  panel: {
    text: {
      label: 'Ярлык',
      labelWithId: 'Ярлык {labelId}',
      fontSize: 'Размер шрифта',
      fontColor: 'Цвет шрифта',
      textAnchor: 'Анкор текста',
      alignment: 'Положение',
      addMoreLabel: 'Добавить еще ярлык'
    }
  },
  sidebar: {
    panels: {
      layer: 'Слои',
      filter: 'Фильтры',
      interaction: 'Взаимодействия',
      basemap: 'Базовая карта'
    }
  },
  layer: {
    required: 'Требования*',
    radius: 'Радиус',
    color: 'Цвет',
    fillColor: 'Цвет заливки',
    outline: 'Контур',
    weight: 'Вес',
    propertyBasedOn: '{property} на основе',
    coverage: 'Покрытие',
    stroke: 'Обводка',
    strokeWidth: 'Ширина обводки',
    strokeColor: 'Цвет обводки',
    basic: 'Basic',
    trailLength: 'Trail Length',
    trailLengthDescription: 'Number of seconds for a path to completely fade out',
    newLayer: 'new layer',
    elevationByDescription: 'When off, height is based on count of points',
    colorByDescription: 'When off, color is based on count of points',
    aggregateBy: 'Aggregate {field} by',
    '3DModel': '3D Model',
    '3DModelOptions': '3D Model Options',
    type: {
      point: 'точки',
      arc: 'дуги',
      line: 'линии',
      grid: 'сетка',
      hexbin: 'hexbin',
      polygon: 'многоугольники',
      geojson: 'geojson',
      cluster: 'кластеры',
      icon: 'значки',
      heatmap: 'тепловая карта',
      hexagon: 'шестиугольник',
      hexagonid: 'H3',
      trip: 'пути',
      s2: 'S2',
      '3d': '3D'
    }
  },
  layerVisConfigs: {
    angle: 'Угол',
    strokeWidth: 'Ширина штриха (в пикселях)',
    strokeWidthRange: 'Диапазон ширины штриха',
    radius: 'Радиус',
    fixedRadius: 'Фиксированный радиус в метрах',
    fixedRadiusDescription: 'Сопоставьте радиус с абсолютным радиусом в метрах, например От 5 до 5 метров',
    radiusRange: 'Диапазон радиуса',
    clusterRadius: 'Радиус кластера в пикселях',
    radiusRangePixels: 'Диапазон радиуса в пикселях',
    opacity: 'Непрозрачность',
    coverage: 'Покрытие',
    outline: 'Контур',
    colorRange: 'Цветовая гамма',
    stroke: 'Обводка',
    strokeColor: 'Цвет обводки',
    strokeColorRange: 'Обводка Цветовой диапазон',
    targetColor: 'Целевой цвет',
    colorAggregation: 'Цветовая агрегация',
    heightAggregation: 'Агрегация по высоте',
    resolutionRange: 'Диапазон разрешения',
    sizeScale: 'Шкала размеров',
    worldUnitSize: 'Мировые ед.изм.',
    elevationScale: 'Шкала возвышения',
    enableElevationZoomFactor: 'Использовать коэффициент увеличения по высоте',
    enableElevationZoomFactorDescription: 'Отрегулируйте высоту / возвышение на основе текущего коэффициента масштабирования',
    enableHeightZoomFactor: 'вкл. коэффициент масштабирования по высоте',
    heightScale: 'Масштаб высоты',
    coverageRange: 'Диапазон покрытия',
    highPrecisionRendering: 'Высокая точность рендеринга',
    highPrecisionRenderingDescription: 'Высокая точность приведет к снижению производительности',
    height: 'Высота',
    heightDescription: 'Нажмите кнопку в правом верхнем углу карты, чтобы переключиться в 3D-вид',
    fill: 'Наполнить',
    enablePolygonHeight: 'Включить высоту многоугольника',
    showWireframe: 'Показать каркас',
    weightIntensity: 'Вес Интенсивность',
    zoomScale: 'Масштаб увеличения',
    heightRange: 'Диапазон высоты',
    heightMultiplier: 'Множитель высоты'
  },
  layerManager: {
    addData: 'Добавить данные',
    addLayer: 'Добавить слой',
    layerBlending: 'Смешивание слоев'
  },
  mapManager: {
    mapStyle: 'Стиль карты',
    addMapStyle: 'Добавить стиль карты',
    '3dBuildingColor': '3D Цвет здания'
  },
  layerConfiguration: {
    defaultDescription: 'Рассчитать {property} на основе выбранного поля',
    howTo: 'How to'
  },
  filterManager: {
    addFilter: 'Добавить фильтр'
  },
  datasetTitle: {
    showDataTable: 'Показать таблицу данных ',
    removeDataset: 'Удалить набор данных'
  },
  datasetInfo: {
    rowCount: '{rowCount} строк'
  },
  tooltip: {
    hideLayer: 'скрыть слой',
    showLayer: 'показать слой',
    hideFeature: 'Скрыть функцию',
    showFeature: 'Показать функцию',
    hide: 'скрыть',
    show: 'показать',
    removeLayer: 'Удалить слой',
    duplicateLayer: 'Дублировать слой',
    layerSettings: 'Настройки слоя',
    closePanel: 'Закрыть текущую панель',
    switchToDualView: 'Перейти в режим двойной карты',
    showLegend: 'Показать легенду',
    disable3DMap: 'Отключить 3D Карту',
    DrawOnMap: 'Рисовать на карте',
    selectLocale: 'Выберите регион',
    showAiAssistantPanel: 'Показать панель AI Assistant',
    hideAiAssistantPanel: 'Скрыть панель AI Assistant',
    hideLayerPanel: 'Скрыть панель слоев',
    showLayerPanel: 'Показать панель слоев',
    moveToTop: 'Перейти к верхним слоям данных',
    selectBaseMapStyle: 'Выберите стиль базовой карты',
    "delete": 'Удалить',
    timePlayback: 'Воспроизведение времени',
    cloudStorage: 'Облачное хранилище',
    '3DMap': '3D Карта',
    animationByWindow: 'Перемещение временного окна',
    animationByIncremental: 'Дополнительное временное окно',
    speed: 'скорость',
    play: 'проиграть',
    pause: 'пауза',
    reset: 'перезапустить'
  },
  toolbar: _objectSpread({
    exportImage: 'Экспорт изображения',
    exportData: 'Экспорт данных',
    exportMap: 'Экспорт карты',
    shareMapURL: 'Share Map URL',
    saveMap: 'Сохарнить Карту',
    select: 'Выбрать',
    polygon: 'Многоугольник',
    rectangle: 'Квадрат',
    hide: 'Скрыть',
    show: 'Показать'
  }, _locales.LOCALES),
  editor: {
    filterLayer: 'Слои фильтров',
    copyGeometry: 'Копировать геометрию'
  },
  modal: {
    title: {
      deleteDataset: 'Удалить данные',
      addDataToMap: 'Добавить данные на карту',
      exportImage: 'Экспорт изображения',
      exportData: 'Экспорт данных',
      exportMap: 'Экспорт карты',
      addCustomMapboxStyle: 'Добавить собственный стиль карты',
      saveMap: 'Поделиться Картой',
      shareURL: 'Поделиться URL'
    },
    button: {
      "delete": 'Удалить',
      download: 'Скачать',
      "export": 'Экспортировать',
      addStyle: 'Добавить стиль',
      save: 'Сохранить',
      defaultCancel: 'Отменить',
      defaultConfirm: 'Подтвердить'
    },
    exportImage: {
      ratioTitle: 'Ratio',
      ratioDescription: 'Выберите соотношение для различного использования',
      ratioOriginalScreen: 'Исходный экран',
      ratioCustom: 'Настройки',
      ratio4_3: '4:3',
      ratio16_9: '16:9',
      resolutionTitle: 'Разрешение',
      resolutionDescription: 'Для печати лучше использовать высокое разрешение',
      mapLegendTitle: 'Легенда карты',
      mapLegendAdd: 'Добавить легенду на карту'
    },
    exportData: {
      datasetTitle: 'Набор данных',
      datasetSubtitle: 'Выберите наборы данных, которые хотите экспортировать',
      allDatasets: 'Все',
      dataTypeTitle: 'Тип данных',
      dataTypeSubtitle: 'Выберите тип данных, которые вы хотите экспортировать',
      filterDataTitle: 'Отфильтрованные данные',
      filterDataSubtitle: 'Вы можете выбрать экспорт исходных данных или отфильтрованных данных',
      filteredData: 'Отфильтрованные данные',
      unfilteredData: 'Нефильтрованные данные',
      fileCount: '{fileCount} Файлов',
      rowCount: '{rowCount} Строк'
    },
    deleteData: {
      warning: 'вы собираетесь удалить этот набор данных. Это повлияет на {length} слой'
    },
    addStyle: {
      publishTitle: '2. Если вы указали URL-адрес файла mapbox на шаге 1, опубликуйте свой стиль на mapbox или предоставьте токен доступа. (Необязательно)',
      publishSubtitle1: 'Вы можете создать свой собственный стиль карты',
      publishSubtitle2: 'и',
      publishSubtitle3: 'опубликовать',
      publishSubtitle4: 'его.',
      publishSubtitle5: 'Чтобы использовать частный стиль, вставьте свой',
      publishSubtitle6: 'token доступа',
      publishSubtitle7: 'прим. kepler.gl - это клиентское приложение, данные остаются в вашем браузере .',
      exampleToken: 'например pk.abcdefg.xxxxxx',
      pasteTitle: '1. Вставить URL стиля',
      pasteSubtitle0: 'URL стиля может быть mapbox',
      pasteSubtitle1: 'Или',
      pasteSubtitle2: 'URL стиля',
      pasteSubtitle3: 'style.json используя',
      pasteSubtitle4: 'Mapbox GL Style Spec',
      namingTitle: '3. Назови свой стиль'
    },
    shareMap: {
      shareUriTitle: 'Поделиться URL карты',
      shareUriSubtitle: 'Создать URL карты, чтобы поделиться с другими',
      cloudTitle: 'Облачное хранилище',
      cloudSubtitle: 'Войдите и загрузите данные карты в свое личное облачное хранилище',
      shareDisclaimer: 'kepler.gl сохранит данные вашей карты в вашем личном облачном хранилище, только люди с URL-адресом могут получить доступ к вашей карте и данным. ' + 'Вы можете редактировать / удалить файл данных в своей облачной учетной записи в любое время.',
      gotoPage: 'Перейти на страницу Kepler.gl {currentProvider}'
    },
    statusPanel: {
      mapUploading: 'Загрузка карты',
      error: 'Ошибка'
    },
    saveMap: {
      title: 'Облачное хранилище',
      subtitle: 'Авторизуйтесь, чтобы сохранить карту в вашем личном облачном хранилище'
    },
    exportMap: {
      formatTitle: 'Формат карты',
      formatSubtitle: 'Выберите формат для экспорта карты',
      html: {
        selection: 'Экспорт карты в интерактивный файл HTML.',
        tokenTitle: 'Токен доступа к Mapbox',
        tokenSubtitle: 'Используйте свой токен доступа Mapbox в html(необязательно)',
        tokenPlaceholder: 'Вставьте токен доступа Mapbox',
        tokenMisuseWarning: '* If you do not provide your own token, the map may fail to display at any time when we replace ours to avoid misuse. ',
        tokenDisclaimer: 'Если вы не предоставите свой собственный токен, карта может не отображаться в любое время, когда мы заменяем наш, чтобы избежать неправильного использования.',
        tokenUpdate: 'Как обновить существующий токен карты.',
        modeTitle: 'Режим карты',
        modeSubtitle1: 'Выберите режим приложения. Подробнее',
        modeSubtitle2: 'Информация',
        modeDescription: 'Разрешить пользователям {mode} карту',
        read: 'чтение',
        edit: 'редактирование'
      },
      json: {
        configTitle: 'Конфигурация карты',
        configDisclaimer: 'Конфигурация карты будет включена в файл Json. Если вы используете kepler.gl в своем собственном приложении. Вы можете скопировать этот конфиг и передать его ',
        selection: 'Экспорт текущих данных карты и конфигурации в один файл Json. Позже вы сможете открыть ту же карту, загрузив этот файл на kepler.gl.',
        disclaimer: '* Конфигурация карты связана с загруженными наборами данных. DataId используется для привязки слоев, фильтров и всплывающих подсказок к определенному набору данных. ' + 'При передаче этой конфигурации addDataToMap, убедитесь, что идентификатор набора данных совпадает с dataId / s в этой конфигурации.'
      }
    },
    loadingDialog: {
      loading: 'Загрузка...'
    },
    loadData: {
      upload: 'Загрузить файлы',
      storage: 'Загрузить из хранилища'
    },
    tripInfo: {
      title: 'Как включить анимацию поездки',
      description1: 'Чтобы анимировать путь, данные geoJSON должны содержать LineString в своей геометрии объекта, а координаты в LineString должны иметь 4 элемента в форматах',
      code: ' [longitude, latitude, altitude, timestamp] ',
      description2: 'с последним элементом, являющимся отметкой времени. Допустимые форматы меток времени включают unix в секундах, например 1564184363, или в миллисекундах, например 1564184363000',
      example: ',Пример:'
    },
    iconInfo: {
      title: 'Как рисовать значки',
      description1: 'В вашем csv создайте столбец, поместите в него имя значка, который вы хотите нарисовать. Вы можете оставить ячейку пустой, если не хотите, чтобы значок отображался для некоторых точек. Когда столбец назван',
      code: 'значек',
      description2: ' kepler.gl автоматически создаст для вас слой значков.',
      example: 'Пример:',
      icons: 'Значки'
    },
    storageMapViewer: {
      lastModified: 'Последнее изменение {lastUpdated} назад',
      back: 'Назад'
    },
    overwriteMap: {
      title: 'Сохранение карты...',
      alreadyExists: 'уже существует в вашем {mapSaved}. Хотите его перезаписать?'
    },
    loadStorageMap: {
      back: 'Назад',
      goToPage: 'Перейти на страницу Kepler.gl {displayName}',
      storageMaps: 'Хранилище / Карты',
      noSavedMaps: 'Нет сохраненных карт'
    }
  },
  header: {
    visibleLayers: 'Видимые слои',
    layerLegend: 'Легенда слоя'
  },
  interactions: {
    tooltip: 'Подсказка',
    brush: 'Кисть',
    coordinate: 'Координаты',
    geocoder: 'Геокодер'
  },
  layerBlending: {
    title: 'Смешивание слоев',
    additive: 'добавление',
    normal: 'нормальное',
    subtractive: 'вычитание'
  },
  columns: {
    title: 'Столбцы',
    lat: 'lat',
    lng: 'lon',
    altitude: 'высота',
    icon: 'значек',
    geojson: 'geojson',
    token: 'token',
    arc: {
      lat0: 'lat источника',
      lng0: 'lng источника',
      lat1: 'lat цели',
      lng1: 'lng цели'
    },
    line: {
      alt0: 'высота источника',
      alt1: 'высота цели'
    },
    grid: {
      worldUnitSize: 'Размер сетки (km)'
    },
    hexagon: {
      worldUnitSize: 'Hexagon радиус (km)'
    },
    hex_id: 'hex id'
  },
  color: {
    customPalette: 'Ваша палитра',
    steps: 'шагов',
    type: 'тип',
    reversed: 'перевернуть'
  },
  scale: {
    colorScale: 'Цветовая шкала',
    sizeScale: 'Масштаб размера',
    strokeScale: 'Масштаб штриха',
    scale: 'Масштаб'
  },
  fileUploader: {
    message: 'Перетащите сюда ваши файлы',
    chromeMessage: '*Пользователь Chrome: ограничьте размер файла до 250 МБ, если нужно загрузить файл большего размера, попробуйте Safari',
    disclaimer: '*kepler.gl - это клиентское приложение без серверной части. Данные живут только на вашем компьютере. ' + 'Никакая информация или данные карты не отправляются ни на один сервер.',
    configUploadMessage: 'Загрузите {fileFormatNames} или сохраненную карту **Json**. Подробнее [**supported file formats**]',
    browseFiles: 'Просматреть файлы',
    uploading: 'Загрузка',
    fileNotSupported: 'File {errorFiles} is not supported.',
    or: 'or'
  },
  geocoder: {
    title: 'Введите адрес или координаты, например 37.79, -122.40'
  },
  fieldSelector: {
    clearAll: 'Очистить все',
    formatting: 'Форматирование'
  },
  compare: {
    modeLabel: 'Режим сравнения',
    typeLabel: 'Тип сравнения',
    types: {
      absolute: 'Абсолютный',
      relative: 'Относительный'
    }
  },
  mapPopover: {
    primary: 'Первичный'
  },
  density: 'density',
  'Bug Report': 'Отчет об ошибках',
  'User Guide': 'Инструкции',
  Save: 'Сохранить',
  Share: 'Поделиться'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfbG9jYWxlcyIsInJlcXVpcmUiLCJvd25LZXlzIiwiZSIsInIiLCJ0IiwiT2JqZWN0Iiwia2V5cyIsImdldE93blByb3BlcnR5U3ltYm9scyIsIm8iLCJmaWx0ZXIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJlbnVtZXJhYmxlIiwicHVzaCIsImFwcGx5IiwiX29iamVjdFNwcmVhZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsImZvckVhY2giLCJfZGVmaW5lUHJvcGVydHkyIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsIl9kZWZhdWx0IiwiZXhwb3J0cyIsInByb3BlcnR5Iiwid2VpZ2h0IiwibGFiZWwiLCJmaWxsQ29sb3IiLCJjb2xvciIsImNvdmVyYWdlIiwic3Ryb2tlQ29sb3IiLCJyYWRpdXMiLCJvdXRsaW5lIiwic3Ryb2tlIiwiZGVuc2l0eSIsImhlaWdodCIsInN1bSIsInBvaW50Q291bnQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsInNlbGVjdEZpZWxkIiwieUF4aXMiLCJzZWxlY3RUeXBlIiwic2VsZWN0VmFsdWUiLCJlbnRlclZhbHVlIiwiZW1wdHkiLCJtaXNjIiwiYnkiLCJ2YWx1ZXNJbiIsInZhbHVlRXF1YWxzIiwiZGF0YVNvdXJjZSIsImJydXNoUmFkaXVzIiwibWFwTGF5ZXJzIiwidGl0bGUiLCJyb2FkIiwiYm9yZGVyIiwiYnVpbGRpbmciLCJ3YXRlciIsImxhbmQiLCJwYW5lbCIsInRleHQiLCJsYWJlbFdpdGhJZCIsImZvbnRTaXplIiwiZm9udENvbG9yIiwidGV4dEFuY2hvciIsImFsaWdubWVudCIsImFkZE1vcmVMYWJlbCIsInNpZGViYXIiLCJwYW5lbHMiLCJsYXllciIsImludGVyYWN0aW9uIiwiYmFzZW1hcCIsInJlcXVpcmVkIiwicHJvcGVydHlCYXNlZE9uIiwic3Ryb2tlV2lkdGgiLCJiYXNpYyIsInRyYWlsTGVuZ3RoIiwidHJhaWxMZW5ndGhEZXNjcmlwdGlvbiIsIm5ld0xheWVyIiwiZWxldmF0aW9uQnlEZXNjcmlwdGlvbiIsImNvbG9yQnlEZXNjcmlwdGlvbiIsImFnZ3JlZ2F0ZUJ5IiwidHlwZSIsInBvaW50IiwiYXJjIiwibGluZSIsImdyaWQiLCJoZXhiaW4iLCJwb2x5Z29uIiwiZ2VvanNvbiIsImNsdXN0ZXIiLCJpY29uIiwiaGVhdG1hcCIsImhleGFnb24iLCJoZXhhZ29uaWQiLCJ0cmlwIiwiczIiLCJsYXllclZpc0NvbmZpZ3MiLCJhbmdsZSIsInN0cm9rZVdpZHRoUmFuZ2UiLCJmaXhlZFJhZGl1cyIsImZpeGVkUmFkaXVzRGVzY3JpcHRpb24iLCJyYWRpdXNSYW5nZSIsImNsdXN0ZXJSYWRpdXMiLCJyYWRpdXNSYW5nZVBpeGVscyIsIm9wYWNpdHkiLCJjb2xvclJhbmdlIiwic3Ryb2tlQ29sb3JSYW5nZSIsInRhcmdldENvbG9yIiwiY29sb3JBZ2dyZWdhdGlvbiIsImhlaWdodEFnZ3JlZ2F0aW9uIiwicmVzb2x1dGlvblJhbmdlIiwic2l6ZVNjYWxlIiwid29ybGRVbml0U2l6ZSIsImVsZXZhdGlvblNjYWxlIiwiZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvciIsImVuYWJsZUVsZXZhdGlvblpvb21GYWN0b3JEZXNjcmlwdGlvbiIsImVuYWJsZUhlaWdodFpvb21GYWN0b3IiLCJoZWlnaHRTY2FsZSIsImNvdmVyYWdlUmFuZ2UiLCJoaWdoUHJlY2lzaW9uUmVuZGVyaW5nIiwiaGlnaFByZWNpc2lvblJlbmRlcmluZ0Rlc2NyaXB0aW9uIiwiaGVpZ2h0RGVzY3JpcHRpb24iLCJmaWxsIiwiZW5hYmxlUG9seWdvbkhlaWdodCIsInNob3dXaXJlZnJhbWUiLCJ3ZWlnaHRJbnRlbnNpdHkiLCJ6b29tU2NhbGUiLCJoZWlnaHRSYW5nZSIsImhlaWdodE11bHRpcGxpZXIiLCJsYXllck1hbmFnZXIiLCJhZGREYXRhIiwiYWRkTGF5ZXIiLCJsYXllckJsZW5kaW5nIiwibWFwTWFuYWdlciIsIm1hcFN0eWxlIiwiYWRkTWFwU3R5bGUiLCJsYXllckNvbmZpZ3VyYXRpb24iLCJkZWZhdWx0RGVzY3JpcHRpb24iLCJob3dUbyIsImZpbHRlck1hbmFnZXIiLCJhZGRGaWx0ZXIiLCJkYXRhc2V0VGl0bGUiLCJzaG93RGF0YVRhYmxlIiwicmVtb3ZlRGF0YXNldCIsImRhdGFzZXRJbmZvIiwicm93Q291bnQiLCJ0b29sdGlwIiwiaGlkZUxheWVyIiwic2hvd0xheWVyIiwiaGlkZUZlYXR1cmUiLCJzaG93RmVhdHVyZSIsImhpZGUiLCJzaG93IiwicmVtb3ZlTGF5ZXIiLCJkdXBsaWNhdGVMYXllciIsImxheWVyU2V0dGluZ3MiLCJjbG9zZVBhbmVsIiwic3dpdGNoVG9EdWFsVmlldyIsInNob3dMZWdlbmQiLCJkaXNhYmxlM0RNYXAiLCJEcmF3T25NYXAiLCJzZWxlY3RMb2NhbGUiLCJzaG93QWlBc3Npc3RhbnRQYW5lbCIsImhpZGVBaUFzc2lzdGFudFBhbmVsIiwiaGlkZUxheWVyUGFuZWwiLCJzaG93TGF5ZXJQYW5lbCIsIm1vdmVUb1RvcCIsInNlbGVjdEJhc2VNYXBTdHlsZSIsInRpbWVQbGF5YmFjayIsImNsb3VkU3RvcmFnZSIsImFuaW1hdGlvbkJ5V2luZG93IiwiYW5pbWF0aW9uQnlJbmNyZW1lbnRhbCIsInNwZWVkIiwicGxheSIsInBhdXNlIiwicmVzZXQiLCJ0b29sYmFyIiwiZXhwb3J0SW1hZ2UiLCJleHBvcnREYXRhIiwiZXhwb3J0TWFwIiwic2hhcmVNYXBVUkwiLCJzYXZlTWFwIiwic2VsZWN0IiwicmVjdGFuZ2xlIiwiTE9DQUxFUyIsImVkaXRvciIsImZpbHRlckxheWVyIiwiY29weUdlb21ldHJ5IiwibW9kYWwiLCJkZWxldGVEYXRhc2V0IiwiYWRkRGF0YVRvTWFwIiwiYWRkQ3VzdG9tTWFwYm94U3R5bGUiLCJzaGFyZVVSTCIsImJ1dHRvbiIsImRvd25sb2FkIiwiYWRkU3R5bGUiLCJzYXZlIiwiZGVmYXVsdENhbmNlbCIsImRlZmF1bHRDb25maXJtIiwicmF0aW9UaXRsZSIsInJhdGlvRGVzY3JpcHRpb24iLCJyYXRpb09yaWdpbmFsU2NyZWVuIiwicmF0aW9DdXN0b20iLCJyYXRpbzRfMyIsInJhdGlvMTZfOSIsInJlc29sdXRpb25UaXRsZSIsInJlc29sdXRpb25EZXNjcmlwdGlvbiIsIm1hcExlZ2VuZFRpdGxlIiwibWFwTGVnZW5kQWRkIiwiZGF0YXNldFN1YnRpdGxlIiwiYWxsRGF0YXNldHMiLCJkYXRhVHlwZVRpdGxlIiwiZGF0YVR5cGVTdWJ0aXRsZSIsImZpbHRlckRhdGFUaXRsZSIsImZpbHRlckRhdGFTdWJ0aXRsZSIsImZpbHRlcmVkRGF0YSIsInVuZmlsdGVyZWREYXRhIiwiZmlsZUNvdW50IiwiZGVsZXRlRGF0YSIsIndhcm5pbmciLCJwdWJsaXNoVGl0bGUiLCJwdWJsaXNoU3VidGl0bGUxIiwicHVibGlzaFN1YnRpdGxlMiIsInB1Ymxpc2hTdWJ0aXRsZTMiLCJwdWJsaXNoU3VidGl0bGU0IiwicHVibGlzaFN1YnRpdGxlNSIsInB1Ymxpc2hTdWJ0aXRsZTYiLCJwdWJsaXNoU3VidGl0bGU3IiwiZXhhbXBsZVRva2VuIiwicGFzdGVUaXRsZSIsInBhc3RlU3VidGl0bGUwIiwicGFzdGVTdWJ0aXRsZTEiLCJwYXN0ZVN1YnRpdGxlMiIsInBhc3RlU3VidGl0bGUzIiwicGFzdGVTdWJ0aXRsZTQiLCJuYW1pbmdUaXRsZSIsInNoYXJlTWFwIiwic2hhcmVVcmlUaXRsZSIsInNoYXJlVXJpU3VidGl0bGUiLCJjbG91ZFRpdGxlIiwiY2xvdWRTdWJ0aXRsZSIsInNoYXJlRGlzY2xhaW1lciIsImdvdG9QYWdlIiwic3RhdHVzUGFuZWwiLCJtYXBVcGxvYWRpbmciLCJlcnJvciIsInN1YnRpdGxlIiwiZm9ybWF0VGl0bGUiLCJmb3JtYXRTdWJ0aXRsZSIsImh0bWwiLCJzZWxlY3Rpb24iLCJ0b2tlblRpdGxlIiwidG9rZW5TdWJ0aXRsZSIsInRva2VuUGxhY2Vob2xkZXIiLCJ0b2tlbk1pc3VzZVdhcm5pbmciLCJ0b2tlbkRpc2NsYWltZXIiLCJ0b2tlblVwZGF0ZSIsIm1vZGVUaXRsZSIsIm1vZGVTdWJ0aXRsZTEiLCJtb2RlU3VidGl0bGUyIiwibW9kZURlc2NyaXB0aW9uIiwicmVhZCIsImVkaXQiLCJqc29uIiwiY29uZmlnVGl0bGUiLCJjb25maWdEaXNjbGFpbWVyIiwiZGlzY2xhaW1lciIsImxvYWRpbmdEaWFsb2ciLCJsb2FkaW5nIiwibG9hZERhdGEiLCJ1cGxvYWQiLCJzdG9yYWdlIiwidHJpcEluZm8iLCJkZXNjcmlwdGlvbjEiLCJjb2RlIiwiZGVzY3JpcHRpb24yIiwiZXhhbXBsZSIsImljb25JbmZvIiwiaWNvbnMiLCJzdG9yYWdlTWFwVmlld2VyIiwibGFzdE1vZGlmaWVkIiwiYmFjayIsIm92ZXJ3cml0ZU1hcCIsImFscmVhZHlFeGlzdHMiLCJsb2FkU3RvcmFnZU1hcCIsImdvVG9QYWdlIiwic3RvcmFnZU1hcHMiLCJub1NhdmVkTWFwcyIsImhlYWRlciIsInZpc2libGVMYXllcnMiLCJsYXllckxlZ2VuZCIsImludGVyYWN0aW9ucyIsImJydXNoIiwiY29vcmRpbmF0ZSIsImdlb2NvZGVyIiwiYWRkaXRpdmUiLCJub3JtYWwiLCJzdWJ0cmFjdGl2ZSIsImNvbHVtbnMiLCJsYXQiLCJsbmciLCJhbHRpdHVkZSIsInRva2VuIiwibGF0MCIsImxuZzAiLCJsYXQxIiwibG5nMSIsImFsdDAiLCJhbHQxIiwiaGV4X2lkIiwiY3VzdG9tUGFsZXR0ZSIsInN0ZXBzIiwicmV2ZXJzZWQiLCJzY2FsZSIsImNvbG9yU2NhbGUiLCJzdHJva2VTY2FsZSIsImZpbGVVcGxvYWRlciIsIm1lc3NhZ2UiLCJjaHJvbWVNZXNzYWdlIiwiY29uZmlnVXBsb2FkTWVzc2FnZSIsImJyb3dzZUZpbGVzIiwidXBsb2FkaW5nIiwiZmlsZU5vdFN1cHBvcnRlZCIsIm9yIiwiZmllbGRTZWxlY3RvciIsImNsZWFyQWxsIiwiZm9ybWF0dGluZyIsImNvbXBhcmUiLCJtb2RlTGFiZWwiLCJ0eXBlTGFiZWwiLCJ0eXBlcyIsImFic29sdXRlIiwicmVsYXRpdmUiLCJtYXBQb3BvdmVyIiwicHJpbWFyeSIsIlNhdmUiLCJTaGFyZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sb2NhbGl6YXRpb24vc3JjL3RyYW5zbGF0aW9ucy9ydS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4vLyBDb3B5cmlnaHQgY29udHJpYnV0b3JzIHRvIHRoZSBrZXBsZXIuZ2wgcHJvamVjdFxuXG5pbXBvcnQge0xPQ0FMRVN9IGZyb20gJy4uL2xvY2FsZXMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHByb3BlcnR5OiB7XG4gICAgd2VpZ2h0OiAn0LLQtdGBJyxcbiAgICBsYWJlbDogJ9GP0YDQu9GL0LonLFxuICAgIGZpbGxDb2xvcjogJ9GG0LLQtdGCINC30LDQu9C40LLQutC4JyxcbiAgICBjb2xvcjogJ9GG0LLQtdGCJyxcbiAgICBjb3ZlcmFnZTogJ9C/0L7QutGA0YvRgtC40LUnLFxuICAgIHN0cm9rZUNvbG9yOiAn0YbQstC10YIg0L7QsdCy0L7QtNC60LgnLFxuICAgIHJhZGl1czogJ9GA0LDQtNC40YPRgScsXG4gICAgb3V0bGluZTogJ9C60L7QvdGC0YPRgCcsXG4gICAgc3Ryb2tlOiAn0L7QsdCy0L7QtNC60LAnLFxuICAgIGRlbnNpdHk6ICfQv9C70L7RgtC90L7RgdGC0YwnLFxuICAgIGhlaWdodDogJ9Cy0YvRgdC+0YLQsCcsXG4gICAgc3VtOiAn0YHRg9C80LzQsCcsXG4gICAgcG9pbnRDb3VudDogJ9Ca0L7Quy3QstC+INGC0L7Rh9C10LonXG4gIH0sXG4gIHBsYWNlaG9sZGVyOiB7XG4gICAgc2VhcmNoOiAn0J/QvtC40YHQuicsXG4gICAgc2VsZWN0RmllbGQ6ICfQktGL0LHQtdGA0LjRgtC1INC/0L7Qu9C1JyxcbiAgICB5QXhpczogJ1kg0J7RgdGMJyxcbiAgICBzZWxlY3RUeXBlOiAn0JLRi9Cx0LXRgNC40YLQtSBBINGC0LjQvycsXG4gICAgc2VsZWN0VmFsdWU6ICfQktGL0LHQtdGA0LjRgtC1IEEg0LfQvdCw0YfQtdC90LjQtScsXG4gICAgZW50ZXJWYWx1ZTogJ9CS0LLQtdC00LjRgtC1INC30L3QsNGH0LXQvdC40LUnLFxuICAgIGVtcHR5OiAn0L/Rg9GB0YLQvtC5J1xuICB9LFxuICBtaXNjOiB7XG4gICAgYnk6ICcnLFxuICAgIHZhbHVlc0luOiAn0JfQvdCw0YfQtdC90LjQtSDQsicsXG4gICAgdmFsdWVFcXVhbHM6ICfQl9C90LDRh9C10L3QuNC1INGA0LDQstC90L4nLFxuICAgIGRhdGFTb3VyY2U6ICfQmNGB0YLQvtGH0L3QuNC6INC00LDQvdC90YvRhScsXG4gICAgYnJ1c2hSYWRpdXM6ICfQoNCw0LTQuNGD0YEg0LrQuNGB0YLQuCAoa20pJyxcbiAgICBlbXB0eTogJyAnXG4gIH0sXG4gIG1hcExheWVyczoge1xuICAgIHRpdGxlOiAn0KHQu9C+0Lgg0LrQsNGA0YLRiycsXG4gICAgbGFiZWw6ICfQntCx0L7Qt9C90LDRh9C10L3QuNGPJyxcbiAgICByb2FkOiAn0JTQvtGA0L7Qs9C4JyxcbiAgICBib3JkZXI6ICfQk9GA0LDQvdC40YbRiycsXG4gICAgYnVpbGRpbmc6ICfQl9C00LDQvdC40Y8nLFxuICAgIHdhdGVyOiAn0JLQvtC00LAnLFxuICAgIGxhbmQ6ICfQl9C10LzQu9GPJyxcbiAgICAnM2RCdWlsZGluZyc6ICczZCDQt9C00LDQvdC40Y8nXG4gIH0sXG4gIHBhbmVsOiB7XG4gICAgdGV4dDoge1xuICAgICAgbGFiZWw6ICfQr9GA0LvRi9C6JyxcbiAgICAgIGxhYmVsV2l0aElkOiAn0K/RgNC70YvQuiB7bGFiZWxJZH0nLFxuICAgICAgZm9udFNpemU6ICfQoNCw0LfQvNC10YAg0YjRgNC40YTRgtCwJyxcbiAgICAgIGZvbnRDb2xvcjogJ9Cm0LLQtdGCINGI0YDQuNGE0YLQsCcsXG4gICAgICB0ZXh0QW5jaG9yOiAn0JDQvdC60L7RgCDRgtC10LrRgdGC0LAnLFxuICAgICAgYWxpZ25tZW50OiAn0J/QvtC70L7QttC10L3QuNC1JyxcbiAgICAgIGFkZE1vcmVMYWJlbDogJ9CU0L7QsdCw0LLQuNGC0Ywg0LXRidC1INGP0YDQu9GL0LonXG4gICAgfVxuICB9LFxuICBzaWRlYmFyOiB7XG4gICAgcGFuZWxzOiB7XG4gICAgICBsYXllcjogJ9Ch0LvQvtC4JyxcbiAgICAgIGZpbHRlcjogJ9Ck0LjQu9GM0YLRgNGLJyxcbiAgICAgIGludGVyYWN0aW9uOiAn0JLQt9Cw0LjQvNC+0LTQtdC50YHRgtCy0LjRjycsXG4gICAgICBiYXNlbWFwOiAn0JHQsNC30L7QstCw0Y8g0LrQsNGA0YLQsCdcbiAgICB9XG4gIH0sXG4gIGxheWVyOiB7XG4gICAgcmVxdWlyZWQ6ICfQotGA0LXQsdC+0LLQsNC90LjRjyonLFxuICAgIHJhZGl1czogJ9Cg0LDQtNC40YPRgScsXG4gICAgY29sb3I6ICfQptCy0LXRgicsXG4gICAgZmlsbENvbG9yOiAn0KbQstC10YIg0LfQsNC70LjQstC60LgnLFxuICAgIG91dGxpbmU6ICfQmtC+0L3RgtGD0YAnLFxuICAgIHdlaWdodDogJ9CS0LXRgScsXG4gICAgcHJvcGVydHlCYXNlZE9uOiAne3Byb3BlcnR5fSDQvdCwINC+0YHQvdC+0LLQtScsXG4gICAgY292ZXJhZ2U6ICfQn9C+0LrRgNGL0YLQuNC1JyxcbiAgICBzdHJva2U6ICfQntCx0LLQvtC00LrQsCcsXG4gICAgc3Ryb2tlV2lkdGg6ICfQqNC40YDQuNC90LAg0L7QsdCy0L7QtNC60LgnLFxuICAgIHN0cm9rZUNvbG9yOiAn0KbQstC10YIg0L7QsdCy0L7QtNC60LgnLFxuICAgIGJhc2ljOiAnQmFzaWMnLFxuICAgIHRyYWlsTGVuZ3RoOiAnVHJhaWwgTGVuZ3RoJyxcbiAgICB0cmFpbExlbmd0aERlc2NyaXB0aW9uOiAnTnVtYmVyIG9mIHNlY29uZHMgZm9yIGEgcGF0aCB0byBjb21wbGV0ZWx5IGZhZGUgb3V0JyxcbiAgICBuZXdMYXllcjogJ25ldyBsYXllcicsXG4gICAgZWxldmF0aW9uQnlEZXNjcmlwdGlvbjogJ1doZW4gb2ZmLCBoZWlnaHQgaXMgYmFzZWQgb24gY291bnQgb2YgcG9pbnRzJyxcbiAgICBjb2xvckJ5RGVzY3JpcHRpb246ICdXaGVuIG9mZiwgY29sb3IgaXMgYmFzZWQgb24gY291bnQgb2YgcG9pbnRzJyxcbiAgICBhZ2dyZWdhdGVCeTogJ0FnZ3JlZ2F0ZSB7ZmllbGR9IGJ5JyxcbiAgICAnM0RNb2RlbCc6ICczRCBNb2RlbCcsXG4gICAgJzNETW9kZWxPcHRpb25zJzogJzNEIE1vZGVsIE9wdGlvbnMnLFxuICAgIHR5cGU6IHtcbiAgICAgIHBvaW50OiAn0YLQvtGH0LrQuCcsXG4gICAgICBhcmM6ICfQtNGD0LPQuCcsXG4gICAgICBsaW5lOiAn0LvQuNC90LjQuCcsXG4gICAgICBncmlkOiAn0YHQtdGC0LrQsCcsXG4gICAgICBoZXhiaW46ICdoZXhiaW4nLFxuICAgICAgcG9seWdvbjogJ9C80L3QvtCz0L7Rg9Cz0L7Qu9GM0L3QuNC60LgnLFxuICAgICAgZ2VvanNvbjogJ2dlb2pzb24nLFxuICAgICAgY2x1c3RlcjogJ9C60LvQsNGB0YLQtdGA0YsnLFxuICAgICAgaWNvbjogJ9C30L3QsNGH0LrQuCcsXG4gICAgICBoZWF0bWFwOiAn0YLQtdC/0LvQvtCy0LDRjyDQutCw0YDRgtCwJyxcbiAgICAgIGhleGFnb246ICfRiNC10YHRgtC40YPQs9C+0LvRjNC90LjQuicsXG4gICAgICBoZXhhZ29uaWQ6ICdIMycsXG4gICAgICB0cmlwOiAn0L/Rg9GC0LgnLFxuICAgICAgczI6ICdTMicsXG4gICAgICAnM2QnOiAnM0QnXG4gICAgfVxuICB9LFxuICBsYXllclZpc0NvbmZpZ3M6IHtcbiAgICBhbmdsZTogJ9Cj0LPQvtC7JyxcbiAgICBzdHJva2VXaWR0aDogJ9Co0LjRgNC40L3QsCDRiNGC0YDQuNGF0LAgKNCyINC/0LjQutGB0LXQu9GP0YUpJyxcbiAgICBzdHJva2VXaWR0aFJhbmdlOiAn0JTQuNCw0L/QsNC30L7QvSDRiNC40YDQuNC90Ysg0YjRgtGA0LjRhdCwJyxcbiAgICByYWRpdXM6ICfQoNCw0LTQuNGD0YEnLFxuICAgIGZpeGVkUmFkaXVzOiAn0KTQuNC60YHQuNGA0L7QstCw0L3QvdGL0Lkg0YDQsNC00LjRg9GBINCyINC80LXRgtGA0LDRhScsXG4gICAgZml4ZWRSYWRpdXNEZXNjcmlwdGlvbjpcbiAgICAgICfQodC+0L/QvtGB0YLQsNCy0YzRgtC1INGA0LDQtNC40YPRgSDRgSDQsNCx0YHQvtC70Y7RgtC90YvQvCDRgNCw0LTQuNGD0YHQvtC8INCyINC80LXRgtGA0LDRhSwg0L3QsNC/0YDQuNC80LXRgCDQntGCIDUg0LTQviA1INC80LXRgtGA0L7QsicsXG4gICAgcmFkaXVzUmFuZ2U6ICfQlNC40LDQv9Cw0LfQvtC9INGA0LDQtNC40YPRgdCwJyxcbiAgICBjbHVzdGVyUmFkaXVzOiAn0KDQsNC00LjRg9GBINC60LvQsNGB0YLQtdGA0LAg0LIg0L/QuNC60YHQtdC70Y/RhScsXG4gICAgcmFkaXVzUmFuZ2VQaXhlbHM6ICfQlNC40LDQv9Cw0LfQvtC9INGA0LDQtNC40YPRgdCwINCyINC/0LjQutGB0LXQu9GP0YUnLFxuICAgIG9wYWNpdHk6ICfQndC10L/RgNC+0LfRgNCw0YfQvdC+0YHRgtGMJyxcbiAgICBjb3ZlcmFnZTogJ9Cf0L7QutGA0YvRgtC40LUnLFxuICAgIG91dGxpbmU6ICfQmtC+0L3RgtGD0YAnLFxuICAgIGNvbG9yUmFuZ2U6ICfQptCy0LXRgtC+0LLQsNGPINCz0LDQvNC80LAnLFxuICAgIHN0cm9rZTogJ9Ce0LHQstC+0LTQutCwJyxcbiAgICBzdHJva2VDb2xvcjogJ9Cm0LLQtdGCINC+0LHQstC+0LTQutC4JyxcbiAgICBzdHJva2VDb2xvclJhbmdlOiAn0J7QsdCy0L7QtNC60LAg0KbQstC10YLQvtCy0L7QuSDQtNC40LDQv9Cw0LfQvtC9JyxcbiAgICB0YXJnZXRDb2xvcjogJ9Cm0LXQu9C10LLQvtC5INGG0LLQtdGCJyxcbiAgICBjb2xvckFnZ3JlZ2F0aW9uOiAn0KbQstC10YLQvtCy0LDRjyDQsNCz0YDQtdCz0LDRhtC40Y8nLFxuICAgIGhlaWdodEFnZ3JlZ2F0aW9uOiAn0JDQs9GA0LXQs9Cw0YbQuNGPINC/0L4g0LLRi9GB0L7RgtC1JyxcbiAgICByZXNvbHV0aW9uUmFuZ2U6ICfQlNC40LDQv9Cw0LfQvtC9INGA0LDQt9GA0LXRiNC10L3QuNGPJyxcbiAgICBzaXplU2NhbGU6ICfQqNC60LDQu9CwINGA0LDQt9C80LXRgNC+0LInLFxuICAgIHdvcmxkVW5pdFNpemU6ICfQnNC40YDQvtCy0YvQtSDQtdC0LtC40LfQvC4nLFxuICAgIGVsZXZhdGlvblNjYWxlOiAn0KjQutCw0LvQsCDQstC+0LfQstGL0YjQtdC90LjRjycsXG4gICAgZW5hYmxlRWxldmF0aW9uWm9vbUZhY3RvcjogJ9CY0YHQv9C+0LvRjNC30L7QstCw0YLRjCDQutC+0Y3RhNGE0LjRhtC40LXQvdGCINGD0LLQtdC70LjRh9C10L3QuNGPINC/0L4g0LLRi9GB0L7RgtC1JyxcbiAgICBlbmFibGVFbGV2YXRpb25ab29tRmFjdG9yRGVzY3JpcHRpb246XG4gICAgICAn0J7RgtGA0LXQs9GD0LvQuNGA0YPQudGC0LUg0LLRi9GB0L7RgtGDIC8g0LLQvtC30LLRi9GI0LXQvdC40LUg0L3QsCDQvtGB0L3QvtCy0LUg0YLQtdC60YPRidC10LPQviDQutC+0Y3RhNGE0LjRhtC40LXQvdGC0LAg0LzQsNGB0YjRgtCw0LHQuNGA0L7QstCw0L3QuNGPJyxcbiAgICBlbmFibGVIZWlnaHRab29tRmFjdG9yOiAn0LLQutC7LiDQutC+0Y3RhNGE0LjRhtC40LXQvdGCINC80LDRgdGI0YLQsNCx0LjRgNC+0LLQsNC90LjRjyDQv9C+INCy0YvRgdC+0YLQtScsXG4gICAgaGVpZ2h0U2NhbGU6ICfQnNCw0YHRiNGC0LDQsSDQstGL0YHQvtGC0YsnLFxuICAgIGNvdmVyYWdlUmFuZ2U6ICfQlNC40LDQv9Cw0LfQvtC9INC/0L7QutGA0YvRgtC40Y8nLFxuICAgIGhpZ2hQcmVjaXNpb25SZW5kZXJpbmc6ICfQktGL0YHQvtC60LDRjyDRgtC+0YfQvdC+0YHRgtGMINGA0LXQvdC00LXRgNC40L3Qs9CwJyxcbiAgICBoaWdoUHJlY2lzaW9uUmVuZGVyaW5nRGVzY3JpcHRpb246ICfQktGL0YHQvtC60LDRjyDRgtC+0YfQvdC+0YHRgtGMINC/0YDQuNCy0LXQtNC10YIg0Log0YHQvdC40LbQtdC90LjRjiDQv9GA0L7QuNC30LLQvtC00LjRgtC10LvRjNC90L7RgdGC0LgnLFxuICAgIGhlaWdodDogJ9CS0YvRgdC+0YLQsCcsXG4gICAgaGVpZ2h0RGVzY3JpcHRpb246ICfQndCw0LbQvNC40YLQtSDQutC90L7Qv9C60YMg0LIg0L/RgNCw0LLQvtC8INCy0LXRgNGF0L3QtdC8INGD0LPQu9GDINC60LDRgNGC0YssINGH0YLQvtCx0Ysg0L/QtdGA0LXQutC70Y7Rh9C40YLRjNGB0Y8g0LIgM0Qt0LLQuNC0JyxcbiAgICBmaWxsOiAn0J3QsNC/0L7Qu9C90LjRgtGMJyxcbiAgICBlbmFibGVQb2x5Z29uSGVpZ2h0OiAn0JLQutC70Y7Rh9C40YLRjCDQstGL0YHQvtGC0YMg0LzQvdC+0LPQvtGD0LPQvtC70YzQvdC40LrQsCcsXG4gICAgc2hvd1dpcmVmcmFtZTogJ9Cf0L7QutCw0LfQsNGC0Ywg0LrQsNGA0LrQsNGBJyxcbiAgICB3ZWlnaHRJbnRlbnNpdHk6ICfQktC10YEg0JjQvdGC0LXQvdGB0LjQstC90L7RgdGC0YwnLFxuICAgIHpvb21TY2FsZTogJ9Cc0LDRgdGI0YLQsNCxINGD0LLQtdC70LjRh9C10L3QuNGPJyxcbiAgICBoZWlnaHRSYW5nZTogJ9CU0LjQsNC/0LDQt9C+0L0g0LLRi9GB0L7RgtGLJyxcbiAgICBoZWlnaHRNdWx0aXBsaWVyOiAn0JzQvdC+0LbQuNGC0LXQu9GMINCy0YvRgdC+0YLRiydcbiAgfSxcbiAgbGF5ZXJNYW5hZ2VyOiB7XG4gICAgYWRkRGF0YTogJ9CU0L7QsdCw0LLQuNGC0Ywg0LTQsNC90L3Ri9C1JyxcbiAgICBhZGRMYXllcjogJ9CU0L7QsdCw0LLQuNGC0Ywg0YHQu9C+0LknLFxuICAgIGxheWVyQmxlbmRpbmc6ICfQodC80LXRiNC40LLQsNC90LjQtSDRgdC70L7QtdCyJ1xuICB9LFxuICBtYXBNYW5hZ2VyOiB7XG4gICAgbWFwU3R5bGU6ICfQodGC0LjQu9GMINC60LDRgNGC0YsnLFxuICAgIGFkZE1hcFN0eWxlOiAn0JTQvtCx0LDQstC40YLRjCDRgdGC0LjQu9GMINC60LDRgNGC0YsnLFxuICAgICczZEJ1aWxkaW5nQ29sb3InOiAnM0Qg0KbQstC10YIg0LfQtNCw0L3QuNGPJ1xuICB9LFxuICBsYXllckNvbmZpZ3VyYXRpb246IHtcbiAgICBkZWZhdWx0RGVzY3JpcHRpb246ICfQoNCw0YHRgdGH0LjRgtCw0YLRjCB7cHJvcGVydHl9INC90LAg0L7RgdC90L7QstC1INCy0YvQsdGA0LDQvdC90L7Qs9C+INC/0L7Qu9GPJyxcbiAgICBob3dUbzogJ0hvdyB0bydcbiAgfSxcbiAgZmlsdGVyTWFuYWdlcjoge1xuICAgIGFkZEZpbHRlcjogJ9CU0L7QsdCw0LLQuNGC0Ywg0YTQuNC70YzRgtGAJ1xuICB9LFxuICBkYXRhc2V0VGl0bGU6IHtcbiAgICBzaG93RGF0YVRhYmxlOiAn0J/QvtC60LDQt9Cw0YLRjCDRgtCw0LHQu9C40YbRgyDQtNCw0L3QvdGL0YUgJyxcbiAgICByZW1vdmVEYXRhc2V0OiAn0KPQtNCw0LvQuNGC0Ywg0L3QsNCx0L7RgCDQtNCw0L3QvdGL0YUnXG4gIH0sXG4gIGRhdGFzZXRJbmZvOiB7XG4gICAgcm93Q291bnQ6ICd7cm93Q291bnR9INGB0YLRgNC+0LonXG4gIH0sXG4gIHRvb2x0aXA6IHtcbiAgICBoaWRlTGF5ZXI6ICfRgdC60YDRi9GC0Ywg0YHQu9C+0LknLFxuICAgIHNob3dMYXllcjogJ9C/0L7QutCw0LfQsNGC0Ywg0YHQu9C+0LknLFxuICAgIGhpZGVGZWF0dXJlOiAn0KHQutGA0YvRgtGMINGE0YPQvdC60YbQuNGOJyxcbiAgICBzaG93RmVhdHVyZTogJ9Cf0L7QutCw0LfQsNGC0Ywg0YTRg9C90LrRhtC40Y4nLFxuICAgIGhpZGU6ICfRgdC60YDRi9GC0YwnLFxuICAgIHNob3c6ICfQv9C+0LrQsNC30LDRgtGMJyxcbiAgICByZW1vdmVMYXllcjogJ9Cj0LTQsNC70LjRgtGMINGB0LvQvtC5JyxcbiAgICBkdXBsaWNhdGVMYXllcjogJ9CU0YPQsdC70LjRgNC+0LLQsNGC0Ywg0YHQu9C+0LknLFxuICAgIGxheWVyU2V0dGluZ3M6ICfQndCw0YHRgtGA0L7QudC60Lgg0YHQu9C+0Y8nLFxuICAgIGNsb3NlUGFuZWw6ICfQl9Cw0LrRgNGL0YLRjCDRgtC10LrRg9GJ0YPRjiDQv9Cw0L3QtdC70YwnLFxuICAgIHN3aXRjaFRvRHVhbFZpZXc6ICfQn9C10YDQtdC50YLQuCDQsiDRgNC10LbQuNC8INC00LLQvtC50L3QvtC5INC60LDRgNGC0YsnLFxuICAgIHNob3dMZWdlbmQ6ICfQn9C+0LrQsNC30LDRgtGMINC70LXQs9C10L3QtNGDJyxcbiAgICBkaXNhYmxlM0RNYXA6ICfQntGC0LrQu9GO0YfQuNGC0YwgM0Qg0JrQsNGA0YLRgycsXG4gICAgRHJhd09uTWFwOiAn0KDQuNGB0L7QstCw0YLRjCDQvdCwINC60LDRgNGC0LUnLFxuICAgIHNlbGVjdExvY2FsZTogJ9CS0YvQsdC10YDQuNGC0LUg0YDQtdCz0LjQvtC9JyxcbiAgICBzaG93QWlBc3Npc3RhbnRQYW5lbDogJ9Cf0L7QutCw0LfQsNGC0Ywg0L/QsNC90LXQu9GMIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUFpQXNzaXN0YW50UGFuZWw6ICfQodC60YDRi9GC0Ywg0L/QsNC90LXQu9GMIEFJIEFzc2lzdGFudCcsXG4gICAgaGlkZUxheWVyUGFuZWw6ICfQodC60YDRi9GC0Ywg0L/QsNC90LXQu9GMINGB0LvQvtC10LInLFxuICAgIHNob3dMYXllclBhbmVsOiAn0J/QvtC60LDQt9Cw0YLRjCDQv9Cw0L3QtdC70Ywg0YHQu9C+0LXQsicsXG4gICAgbW92ZVRvVG9wOiAn0J/QtdGA0LXQudGC0Lgg0Log0LLQtdGA0YXQvdC40Lwg0YHQu9C+0Y/QvCDQtNCw0L3QvdGL0YUnLFxuICAgIHNlbGVjdEJhc2VNYXBTdHlsZTogJ9CS0YvQsdC10YDQuNGC0LUg0YHRgtC40LvRjCDQsdCw0LfQvtCy0L7QuSDQutCw0YDRgtGLJyxcbiAgICBkZWxldGU6ICfQo9C00LDQu9C40YLRjCcsXG4gICAgdGltZVBsYXliYWNrOiAn0JLQvtGB0L/RgNC+0LjQt9Cy0LXQtNC10L3QuNC1INCy0YDQtdC80LXQvdC4JyxcbiAgICBjbG91ZFN0b3JhZ2U6ICfQntCx0LvQsNGH0L3QvtC1INGF0YDQsNC90LjQu9C40YnQtScsXG4gICAgJzNETWFwJzogJzNEINCa0LDRgNGC0LAnLFxuICAgIGFuaW1hdGlvbkJ5V2luZG93OiAn0J/QtdGA0LXQvNC10YnQtdC90LjQtSDQstGA0LXQvNC10L3QvdC+0LPQviDQvtC60L3QsCcsXG4gICAgYW5pbWF0aW9uQnlJbmNyZW1lbnRhbDogJ9CU0L7Qv9C+0LvQvdC40YLQtdC70YzQvdC+0LUg0LLRgNC10LzQtdC90L3QvtC1INC+0LrQvdC+JyxcbiAgICBzcGVlZDogJ9GB0LrQvtGA0L7RgdGC0YwnLFxuICAgIHBsYXk6ICfQv9GA0L7QuNCz0YDQsNGC0YwnLFxuICAgIHBhdXNlOiAn0L/QsNGD0LfQsCcsXG4gICAgcmVzZXQ6ICfQv9C10YDQtdC30LDQv9GD0YHRgtC40YLRjCdcbiAgfSxcbiAgdG9vbGJhcjoge1xuICAgIGV4cG9ydEltYWdlOiAn0K3QutGB0L/QvtGA0YIg0LjQt9C+0LHRgNCw0LbQtdC90LjRjycsXG4gICAgZXhwb3J0RGF0YTogJ9Ct0LrRgdC/0L7RgNGCINC00LDQvdC90YvRhScsXG4gICAgZXhwb3J0TWFwOiAn0K3QutGB0L/QvtGA0YIg0LrQsNGA0YLRiycsXG4gICAgc2hhcmVNYXBVUkw6ICdTaGFyZSBNYXAgVVJMJyxcbiAgICBzYXZlTWFwOiAn0KHQvtGF0LDRgNC90LjRgtGMINCa0LDRgNGC0YMnLFxuICAgIHNlbGVjdDogJ9CS0YvQsdGA0LDRgtGMJyxcbiAgICBwb2x5Z29uOiAn0JzQvdC+0LPQvtGD0LPQvtC70YzQvdC40LonLFxuICAgIHJlY3RhbmdsZTogJ9Ca0LLQsNC00YDQsNGCJyxcbiAgICBoaWRlOiAn0KHQutGA0YvRgtGMJyxcbiAgICBzaG93OiAn0J/QvtC60LDQt9Cw0YLRjCcsXG4gICAgLi4uTE9DQUxFU1xuICB9LFxuICBlZGl0b3I6IHtcbiAgICBmaWx0ZXJMYXllcjogJ9Ch0LvQvtC4INGE0LjQu9GM0YLRgNC+0LInLFxuICAgIGNvcHlHZW9tZXRyeTogJ9Ca0L7Qv9C40YDQvtCy0LDRgtGMINCz0LXQvtC80LXRgtGA0LjRjidcbiAgfSxcblxuICBtb2RhbDoge1xuICAgIHRpdGxlOiB7XG4gICAgICBkZWxldGVEYXRhc2V0OiAn0KPQtNCw0LvQuNGC0Ywg0LTQsNC90L3Ri9C1JyxcbiAgICAgIGFkZERhdGFUb01hcDogJ9CU0L7QsdCw0LLQuNGC0Ywg0LTQsNC90L3Ri9C1INC90LAg0LrQsNGA0YLRgycsXG4gICAgICBleHBvcnRJbWFnZTogJ9Ct0LrRgdC/0L7RgNGCINC40LfQvtCx0YDQsNC20LXQvdC40Y8nLFxuICAgICAgZXhwb3J0RGF0YTogJ9Ct0LrRgdC/0L7RgNGCINC00LDQvdC90YvRhScsXG4gICAgICBleHBvcnRNYXA6ICfQrdC60YHQv9C+0YDRgiDQutCw0YDRgtGLJyxcbiAgICAgIGFkZEN1c3RvbU1hcGJveFN0eWxlOiAn0JTQvtCx0LDQstC40YLRjCDRgdC+0LHRgdGC0LLQtdC90L3Ri9C5INGB0YLQuNC70Ywg0LrQsNGA0YLRiycsXG4gICAgICBzYXZlTWFwOiAn0J/QvtC00LXQu9C40YLRjNGB0Y8g0JrQsNGA0YLQvtC5JyxcbiAgICAgIHNoYXJlVVJMOiAn0J/QvtC00LXQu9C40YLRjNGB0Y8gVVJMJ1xuICAgIH0sXG4gICAgYnV0dG9uOiB7XG4gICAgICBkZWxldGU6ICfQo9C00LDQu9C40YLRjCcsXG4gICAgICBkb3dubG9hZDogJ9Ch0LrQsNGH0LDRgtGMJyxcbiAgICAgIGV4cG9ydDogJ9Ct0LrRgdC/0L7RgNGC0LjRgNC+0LLQsNGC0YwnLFxuICAgICAgYWRkU3R5bGU6ICfQlNC+0LHQsNCy0LjRgtGMINGB0YLQuNC70YwnLFxuICAgICAgc2F2ZTogJ9Ch0L7RhdGA0LDQvdC40YLRjCcsXG4gICAgICBkZWZhdWx0Q2FuY2VsOiAn0J7RgtC80LXQvdC40YLRjCcsXG4gICAgICBkZWZhdWx0Q29uZmlybTogJ9Cf0L7QtNGC0LLQtdGA0LTQuNGC0YwnXG4gICAgfSxcbiAgICBleHBvcnRJbWFnZToge1xuICAgICAgcmF0aW9UaXRsZTogJ1JhdGlvJyxcbiAgICAgIHJhdGlvRGVzY3JpcHRpb246ICfQktGL0LHQtdGA0LjRgtC1INGB0L7QvtGC0L3QvtGI0LXQvdC40LUg0LTQu9GPINGA0LDQt9C70LjRh9C90L7Qs9C+INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPJyxcbiAgICAgIHJhdGlvT3JpZ2luYWxTY3JlZW46ICfQmNGB0YXQvtC00L3Ri9C5INGN0LrRgNCw0L0nLFxuICAgICAgcmF0aW9DdXN0b206ICfQndCw0YHRgtGA0L7QudC60LgnLFxuICAgICAgcmF0aW80XzM6ICc0OjMnLFxuICAgICAgcmF0aW8xNl85OiAnMTY6OScsXG4gICAgICByZXNvbHV0aW9uVGl0bGU6ICfQoNCw0LfRgNC10YjQtdC90LjQtScsXG4gICAgICByZXNvbHV0aW9uRGVzY3JpcHRpb246ICfQlNC70Y8g0L/QtdGH0LDRgtC4INC70YPRh9GI0LUg0LjRgdC/0L7Qu9GM0LfQvtCy0LDRgtGMINCy0YvRgdC+0LrQvtC1INGA0LDQt9GA0LXRiNC10L3QuNC1JyxcbiAgICAgIG1hcExlZ2VuZFRpdGxlOiAn0JvQtdCz0LXQvdC00LAg0LrQsNGA0YLRiycsXG4gICAgICBtYXBMZWdlbmRBZGQ6ICfQlNC+0LHQsNCy0LjRgtGMINC70LXQs9C10L3QtNGDINC90LAg0LrQsNGA0YLRgydcbiAgICB9LFxuICAgIGV4cG9ydERhdGE6IHtcbiAgICAgIGRhdGFzZXRUaXRsZTogJ9Cd0LDQsdC+0YAg0LTQsNC90L3Ri9GFJyxcbiAgICAgIGRhdGFzZXRTdWJ0aXRsZTogJ9CS0YvQsdC10YDQuNGC0LUg0L3QsNCx0L7RgNGLINC00LDQvdC90YvRhSwg0LrQvtGC0L7RgNGL0LUg0YXQvtGC0LjRgtC1INGN0LrRgdC/0L7RgNGC0LjRgNC+0LLQsNGC0YwnLFxuICAgICAgYWxsRGF0YXNldHM6ICfQktGB0LUnLFxuICAgICAgZGF0YVR5cGVUaXRsZTogJ9Ci0LjQvyDQtNCw0L3QvdGL0YUnLFxuICAgICAgZGF0YVR5cGVTdWJ0aXRsZTogJ9CS0YvQsdC10YDQuNGC0LUg0YLQuNC/INC00LDQvdC90YvRhSwg0LrQvtGC0L7RgNGL0LUg0LLRiyDRhdC+0YLQuNGC0LUg0Y3QutGB0L/QvtGA0YLQuNGA0L7QstCw0YLRjCcsXG4gICAgICBmaWx0ZXJEYXRhVGl0bGU6ICfQntGC0YTQuNC70YzRgtGA0L7QstCw0L3QvdGL0LUg0LTQsNC90L3Ri9C1JyxcbiAgICAgIGZpbHRlckRhdGFTdWJ0aXRsZTogJ9CS0Ysg0LzQvtC20LXRgtC1INCy0YvQsdGA0LDRgtGMINGN0LrRgdC/0L7RgNGCINC40YHRhdC+0LTQvdGL0YUg0LTQsNC90L3Ri9GFINC40LvQuCDQvtGC0YTQuNC70YzRgtGA0L7QstCw0L3QvdGL0YUg0LTQsNC90L3Ri9GFJyxcbiAgICAgIGZpbHRlcmVkRGF0YTogJ9Ce0YLRhNC40LvRjNGC0YDQvtCy0LDQvdC90YvQtSDQtNCw0L3QvdGL0LUnLFxuICAgICAgdW5maWx0ZXJlZERhdGE6ICfQndC10YTQuNC70YzRgtGA0L7QstCw0L3QvdGL0LUg0LTQsNC90L3Ri9C1JyxcbiAgICAgIGZpbGVDb3VudDogJ3tmaWxlQ291bnR9INCk0LDQudC70L7QsicsXG4gICAgICByb3dDb3VudDogJ3tyb3dDb3VudH0g0KHRgtGA0L7QuidcbiAgICB9LFxuICAgIGRlbGV0ZURhdGE6IHtcbiAgICAgIHdhcm5pbmc6ICfQstGLINGB0L7QsdC40YDQsNC10YLQtdGB0Ywg0YPQtNCw0LvQuNGC0Ywg0Y3RgtC+0YIg0L3QsNCx0L7RgCDQtNCw0L3QvdGL0YUuINCt0YLQviDQv9C+0LLQu9C40Y/QtdGCINC90LAge2xlbmd0aH0g0YHQu9C+0LknXG4gICAgfSxcbiAgICBhZGRTdHlsZToge1xuICAgICAgcHVibGlzaFRpdGxlOlxuICAgICAgICAnMi4g0JXRgdC70Lgg0LLRiyDRg9C60LDQt9Cw0LvQuCBVUkwt0LDQtNGA0LXRgSDRhNCw0LnQu9CwIG1hcGJveCDQvdCwINGI0LDQs9C1IDEsINC+0L/Rg9Cx0LvQuNC60YPQudGC0LUg0YHQstC+0Lkg0YHRgtC40LvRjCDQvdCwIG1hcGJveCDQuNC70Lgg0L/RgNC10LTQvtGB0YLQsNCy0YzRgtC1INGC0L7QutC10L0g0LTQvtGB0YLRg9C/0LAuICjQndC10L7QsdGP0LfQsNGC0LXQu9GM0L3QviknLFxuICAgICAgcHVibGlzaFN1YnRpdGxlMTogJ9CS0Ysg0LzQvtC20LXRgtC1INGB0L7Qt9C00LDRgtGMINGB0LLQvtC5INGB0L7QsdGB0YLQstC10L3QvdGL0Lkg0YHRgtC40LvRjCDQutCw0YDRgtGLJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTI6ICfQuCcsXG4gICAgICBwdWJsaXNoU3VidGl0bGUzOiAn0L7Qv9GD0LHQu9C40LrQvtCy0LDRgtGMJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTQ6ICfQtdCz0L4uJyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTU6ICfQp9GC0L7QsdGLINC40YHQv9C+0LvRjNC30L7QstCw0YLRjCDRh9Cw0YHRgtC90YvQuSDRgdGC0LjQu9GMLCDQstGB0YLQsNCy0YzRgtC1INGB0LLQvtC5JyxcbiAgICAgIHB1Ymxpc2hTdWJ0aXRsZTY6ICd0b2tlbiDQtNC+0YHRgtGD0L/QsCcsXG4gICAgICBwdWJsaXNoU3VidGl0bGU3OlxuICAgICAgICAn0L/RgNC40LwuIGtlcGxlci5nbCAtINGN0YLQviDQutC70LjQtdC90YLRgdC60L7QtSDQv9GA0LjQu9C+0LbQtdC90LjQtSwg0LTQsNC90L3Ri9C1INC+0YHRgtCw0Y7RgtGB0Y8g0LIg0LLQsNGI0LXQvCDQsdGA0LDRg9C30LXRgNC1IC4nLFxuICAgICAgZXhhbXBsZVRva2VuOiAn0L3QsNC/0YDQuNC80LXRgCBway5hYmNkZWZnLnh4eHh4eCcsXG4gICAgICBwYXN0ZVRpdGxlOiAnMS4g0JLRgdGC0LDQstC40YLRjCBVUkwg0YHRgtC40LvRjycsXG4gICAgICBwYXN0ZVN1YnRpdGxlMDogJ1VSTCDRgdGC0LjQu9GPINC80L7QttC10YIg0LHRi9GC0YwgbWFwYm94JyxcbiAgICAgIHBhc3RlU3VidGl0bGUxOiAn0JjQu9C4JyxcbiAgICAgIHBhc3RlU3VidGl0bGUyOiAnVVJMINGB0YLQuNC70Y8nLFxuICAgICAgcGFzdGVTdWJ0aXRsZTM6ICdzdHlsZS5qc29uINC40YHQv9C+0LvRjNC30YPRjycsXG4gICAgICBwYXN0ZVN1YnRpdGxlNDogJ01hcGJveCBHTCBTdHlsZSBTcGVjJyxcbiAgICAgIG5hbWluZ1RpdGxlOiAnMy4g0J3QsNC30L7QstC4INGB0LLQvtC5INGB0YLQuNC70YwnXG4gICAgfSxcbiAgICBzaGFyZU1hcDoge1xuICAgICAgc2hhcmVVcmlUaXRsZTogJ9Cf0L7QtNC10LvQuNGC0YzRgdGPIFVSTCDQutCw0YDRgtGLJyxcbiAgICAgIHNoYXJlVXJpU3VidGl0bGU6ICfQodC+0LfQtNCw0YLRjCBVUkwg0LrQsNGA0YLRiywg0YfRgtC+0LHRiyDQv9C+0LTQtdC70LjRgtGM0YHRjyDRgSDQtNGA0YPQs9C40LzQuCcsXG4gICAgICBjbG91ZFRpdGxlOiAn0J7QsdC70LDRh9C90L7QtSDRhdGA0LDQvdC40LvQuNGJ0LUnLFxuICAgICAgY2xvdWRTdWJ0aXRsZTogJ9CS0L7QudC00LjRgtC1INC4INC30LDQs9GA0YPQt9C40YLQtSDQtNCw0L3QvdGL0LUg0LrQsNGA0YLRiyDQsiDRgdCy0L7QtSDQu9C40YfQvdC+0LUg0L7QsdC70LDRh9C90L7QtSDRhdGA0LDQvdC40LvQuNGJ0LUnLFxuICAgICAgc2hhcmVEaXNjbGFpbWVyOlxuICAgICAgICAna2VwbGVyLmdsINGB0L7RhdGA0LDQvdC40YIg0LTQsNC90L3Ri9C1INCy0LDRiNC10Lkg0LrQsNGA0YLRiyDQsiDQstCw0YjQtdC8INC70LjRh9C90L7QvCDQvtCx0LvQsNGH0L3QvtC8INGF0YDQsNC90LjQu9C40YnQtSwg0YLQvtC70YzQutC+INC70Y7QtNC4INGBIFVSTC3QsNC00YDQtdGB0L7QvCDQvNC+0LPRg9GCINC/0L7Qu9GD0YfQuNGC0Ywg0LTQvtGB0YLRg9C/INC6INCy0LDRiNC10Lkg0LrQsNGA0YLQtSDQuCDQtNCw0L3QvdGL0LwuICcgK1xuICAgICAgICAn0JLRiyDQvNC+0LbQtdGC0LUg0YDQtdC00LDQutGC0LjRgNC+0LLQsNGC0YwgLyDRg9C00LDQu9C40YLRjCDRhNCw0LnQuyDQtNCw0L3QvdGL0YUg0LIg0YHQstC+0LXQuSDQvtCx0LvQsNGH0L3QvtC5INGD0YfQtdGC0L3QvtC5INC30LDQv9C40YHQuCDQsiDQu9GO0LHQvtC1INCy0YDQtdC80Y8uJyxcbiAgICAgIGdvdG9QYWdlOiAn0J/QtdGA0LXQudGC0Lgg0L3QsCDRgdGC0YDQsNC90LjRhtGDIEtlcGxlci5nbCB7Y3VycmVudFByb3ZpZGVyfSdcbiAgICB9LFxuICAgIHN0YXR1c1BhbmVsOiB7XG4gICAgICBtYXBVcGxvYWRpbmc6ICfQl9Cw0LPRgNGD0LfQutCwINC60LDRgNGC0YsnLFxuICAgICAgZXJyb3I6ICfQntGI0LjQsdC60LAnXG4gICAgfSxcbiAgICBzYXZlTWFwOiB7XG4gICAgICB0aXRsZTogJ9Ce0LHQu9Cw0YfQvdC+0LUg0YXRgNCw0L3QuNC70LjRidC1JyxcbiAgICAgIHN1YnRpdGxlOiAn0JDQstGC0L7RgNC40LfRg9C50YLQtdGB0YwsINGH0YLQvtCx0Ysg0YHQvtGF0YDQsNC90LjRgtGMINC60LDRgNGC0YMg0LIg0LLQsNGI0LXQvCDQu9C40YfQvdC+0Lwg0L7QsdC70LDRh9C90L7QvCDRhdGA0LDQvdC40LvQuNGJ0LUnXG4gICAgfSxcbiAgICBleHBvcnRNYXA6IHtcbiAgICAgIGZvcm1hdFRpdGxlOiAn0KTQvtGA0LzQsNGCINC60LDRgNGC0YsnLFxuICAgICAgZm9ybWF0U3VidGl0bGU6ICfQktGL0LHQtdGA0LjRgtC1INGE0L7RgNC80LDRgiDQtNC70Y8g0Y3QutGB0L/QvtGA0YLQsCDQutCw0YDRgtGLJyxcbiAgICAgIGh0bWw6IHtcbiAgICAgICAgc2VsZWN0aW9uOiAn0K3QutGB0L/QvtGA0YIg0LrQsNGA0YLRiyDQsiDQuNC90YLQtdGA0LDQutGC0LjQstC90YvQuSDRhNCw0LnQuyBIVE1MLicsXG4gICAgICAgIHRva2VuVGl0bGU6ICfQotC+0LrQtdC9INC00L7RgdGC0YPQv9CwINC6IE1hcGJveCcsXG4gICAgICAgIHRva2VuU3VidGl0bGU6ICfQmNGB0L/QvtC70YzQt9GD0LnRgtC1INGB0LLQvtC5INGC0L7QutC10L0g0LTQvtGB0YLRg9C/0LAgTWFwYm94INCyIGh0bWwo0L3QtdC+0LHRj9C30LDRgtC10LvRjNC90L4pJyxcbiAgICAgICAgdG9rZW5QbGFjZWhvbGRlcjogJ9CS0YHRgtCw0LLRjNGC0LUg0YLQvtC60LXQvSDQtNC+0YHRgtGD0L/QsCBNYXBib3gnLFxuICAgICAgICB0b2tlbk1pc3VzZVdhcm5pbmc6XG4gICAgICAgICAgJyogSWYgeW91IGRvIG5vdCBwcm92aWRlIHlvdXIgb3duIHRva2VuLCB0aGUgbWFwIG1heSBmYWlsIHRvIGRpc3BsYXkgYXQgYW55IHRpbWUgd2hlbiB3ZSByZXBsYWNlIG91cnMgdG8gYXZvaWQgbWlzdXNlLiAnLFxuICAgICAgICB0b2tlbkRpc2NsYWltZXI6XG4gICAgICAgICAgJ9CV0YHQu9C4INCy0Ysg0L3QtSDQv9GA0LXQtNC+0YHRgtCw0LLQuNGC0LUg0YHQstC+0Lkg0YHQvtCx0YHRgtCy0LXQvdC90YvQuSDRgtC+0LrQtdC9LCDQutCw0YDRgtCwINC80L7QttC10YIg0L3QtSDQvtGC0L7QsdGA0LDQttCw0YLRjNGB0Y8g0LIg0LvRjtCx0L7QtSDQstGA0LXQvNGPLCDQutC+0LPQtNCwINC80Ysg0LfQsNC80LXQvdGP0LXQvCDQvdCw0YgsINGH0YLQvtCx0Ysg0LjQt9Cx0LXQttCw0YLRjCDQvdC10L/RgNCw0LLQuNC70YzQvdC+0LPQviDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjy4nLFxuICAgICAgICB0b2tlblVwZGF0ZTogJ9Ca0LDQuiDQvtCx0L3QvtCy0LjRgtGMINGB0YPRidC10YHRgtCy0YPRjtGJ0LjQuSDRgtC+0LrQtdC9INC60LDRgNGC0YsuJyxcbiAgICAgICAgbW9kZVRpdGxlOiAn0KDQtdC20LjQvCDQutCw0YDRgtGLJyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMTogJ9CS0YvQsdC10YDQuNGC0LUg0YDQtdC20LjQvCDQv9GA0LjQu9C+0LbQtdC90LjRjy4g0J/QvtC00YDQvtCx0L3QtdC1JyxcbiAgICAgICAgbW9kZVN1YnRpdGxlMjogJ9CY0L3RhNC+0YDQvNCw0YbQuNGPJyxcbiAgICAgICAgbW9kZURlc2NyaXB0aW9uOiAn0KDQsNC30YDQtdGI0LjRgtGMINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj9C8IHttb2RlfSDQutCw0YDRgtGDJyxcbiAgICAgICAgcmVhZDogJ9GH0YLQtdC90LjQtScsXG4gICAgICAgIGVkaXQ6ICfRgNC10LTQsNC60YLQuNGA0L7QstCw0L3QuNC1J1xuICAgICAgfSxcbiAgICAgIGpzb246IHtcbiAgICAgICAgY29uZmlnVGl0bGU6ICfQmtC+0L3RhNC40LPRg9GA0LDRhtC40Y8g0LrQsNGA0YLRiycsXG4gICAgICAgIGNvbmZpZ0Rpc2NsYWltZXI6XG4gICAgICAgICAgJ9Ca0L7QvdGE0LjQs9GD0YDQsNGG0LjRjyDQutCw0YDRgtGLINCx0YPQtNC10YIg0LLQutC70Y7Rh9C10L3QsCDQsiDRhNCw0LnQuyBKc29uLiDQldGB0LvQuCDQstGLINC40YHQv9C+0LvRjNC30YPQtdGC0LUga2VwbGVyLmdsINCyINGB0LLQvtC10Lwg0YHQvtCx0YHRgtCy0LXQvdC90L7QvCDQv9GA0LjQu9C+0LbQtdC90LjQuC4g0JLRiyDQvNC+0LbQtdGC0LUg0YHQutC+0L/QuNGA0L7QstCw0YLRjCDRjdGC0L7RgiDQutC+0L3RhNC40LMg0Lgg0L/QtdGA0LXQtNCw0YLRjCDQtdCz0L4gJyxcbiAgICAgICAgc2VsZWN0aW9uOlxuICAgICAgICAgICfQrdC60YHQv9C+0YDRgiDRgtC10LrRg9GJ0LjRhSDQtNCw0L3QvdGL0YUg0LrQsNGA0YLRiyDQuCDQutC+0L3RhNC40LPRg9GA0LDRhtC40Lgg0LIg0L7QtNC40L0g0YTQsNC50LsgSnNvbi4g0J/QvtC30LbQtSDQstGLINGB0LzQvtC20LXRgtC1INC+0YLQutGA0YvRgtGMINGC0YMg0LbQtSDQutCw0YDRgtGDLCDQt9Cw0LPRgNGD0LfQuNCyINGN0YLQvtGCINGE0LDQudC7INC90LAga2VwbGVyLmdsLicsXG4gICAgICAgIGRpc2NsYWltZXI6XG4gICAgICAgICAgJyog0JrQvtC90YTQuNCz0YPRgNCw0YbQuNGPINC60LDRgNGC0Ysg0YHQstGP0LfQsNC90LAg0YEg0LfQsNCz0YDRg9C20LXQvdC90YvQvNC4INC90LDQsdC+0YDQsNC80Lgg0LTQsNC90L3Ri9GFLiBEYXRhSWQg0LjRgdC/0L7Qu9GM0LfRg9C10YLRgdGPINC00LvRjyDQv9GA0LjQstGP0LfQutC4INGB0LvQvtC10LIsINGE0LjQu9GM0YLRgNC+0LIg0Lgg0LLRgdC/0LvRi9Cy0LDRjtGJ0LjRhSDQv9C+0LTRgdC60LDQt9C+0Log0Log0L7Qv9GA0LXQtNC10LvQtdC90L3QvtC80YMg0L3QsNCx0L7RgNGDINC00LDQvdC90YvRhS4gJyArXG4gICAgICAgICAgJ9Cf0YDQuCDQv9C10YDQtdC00LDRh9C1INGN0YLQvtC5INC60L7QvdGE0LjQs9GD0YDQsNGG0LjQuCBhZGREYXRhVG9NYXAsINGD0LHQtdC00LjRgtC10YHRjCwg0YfRgtC+INC40LTQtdC90YLQuNGE0LjQutCw0YLQvtGAINC90LDQsdC+0YDQsCDQtNCw0L3QvdGL0YUg0YHQvtCy0L/QsNC00LDQtdGCINGBIGRhdGFJZCAvIHMg0LIg0Y3RgtC+0Lkg0LrQvtC90YTQuNCz0YPRgNCw0YbQuNC4LidcbiAgICAgIH1cbiAgICB9LFxuICAgIGxvYWRpbmdEaWFsb2c6IHtcbiAgICAgIGxvYWRpbmc6ICfQl9Cw0LPRgNGD0LfQutCwLi4uJ1xuICAgIH0sXG4gICAgbG9hZERhdGE6IHtcbiAgICAgIHVwbG9hZDogJ9CX0LDQs9GA0YPQt9C40YLRjCDRhNCw0LnQu9GLJyxcbiAgICAgIHN0b3JhZ2U6ICfQl9Cw0LPRgNGD0LfQuNGC0Ywg0LjQtyDRhdGA0LDQvdC40LvQuNGJ0LAnXG4gICAgfSxcbiAgICB0cmlwSW5mbzoge1xuICAgICAgdGl0bGU6ICfQmtCw0Log0LLQutC70Y7Rh9C40YLRjCDQsNC90LjQvNCw0YbQuNGOINC/0L7QtdC30LTQutC4JyxcbiAgICAgIGRlc2NyaXB0aW9uMTpcbiAgICAgICAgJ9Cn0YLQvtCx0Ysg0LDQvdC40LzQuNGA0L7QstCw0YLRjCDQv9GD0YLRjCwg0LTQsNC90L3Ri9C1IGdlb0pTT04g0LTQvtC70LbQvdGLINGB0L7QtNC10YDQttCw0YLRjCBMaW5lU3RyaW5nINCyINGB0LLQvtC10Lkg0LPQtdC+0LzQtdGC0YDQuNC4INC+0LHRitC10LrRgtCwLCDQsCDQutC+0L7RgNC00LjQvdCw0YLRiyDQsiBMaW5lU3RyaW5nINC00L7Qu9C20L3RiyDQuNC80LXRgtGMIDQg0Y3Qu9C10LzQtdC90YLQsCDQsiDRhNC+0YDQvNCw0YLQsNGFJyxcbiAgICAgIGNvZGU6ICcgW2xvbmdpdHVkZSwgbGF0aXR1ZGUsIGFsdGl0dWRlLCB0aW1lc3RhbXBdICcsXG4gICAgICBkZXNjcmlwdGlvbjI6XG4gICAgICAgICfRgSDQv9C+0YHQu9C10LTQvdC40Lwg0Y3Qu9C10LzQtdC90YLQvtC8LCDRj9Cy0LvRj9GO0YnQuNC80YHRjyDQvtGC0LzQtdGC0LrQvtC5INCy0YDQtdC80LXQvdC4LiDQlNC+0L/Rg9GB0YLQuNC80YvQtSDRhNC+0YDQvNCw0YLRiyDQvNC10YLQvtC6INCy0YDQtdC80LXQvdC4INCy0LrQu9GO0YfQsNGO0YIgdW5peCDQsiDRgdC10LrRg9C90LTQsNGFLCDQvdCw0L/RgNC40LzQtdGAIDE1NjQxODQzNjMsINC40LvQuCDQsiDQvNC40LvQu9C40YHQtdC60YPQvdC00LDRhSwg0L3QsNC/0YDQuNC80LXRgCAxNTY0MTg0MzYzMDAwJyxcbiAgICAgIGV4YW1wbGU6ICcs0J/RgNC40LzQtdGAOidcbiAgICB9LFxuICAgIGljb25JbmZvOiB7XG4gICAgICB0aXRsZTogJ9Ca0LDQuiDRgNC40YHQvtCy0LDRgtGMINC30L3QsNGH0LrQuCcsXG4gICAgICBkZXNjcmlwdGlvbjE6XG4gICAgICAgICfQkiDQstCw0YjQtdC8IGNzdiDRgdC+0LfQtNCw0LnRgtC1INGB0YLQvtC70LHQtdGGLCDQv9C+0LzQtdGB0YLQuNGC0LUg0LIg0L3QtdCz0L4g0LjQvNGPINC30L3QsNGH0LrQsCwg0LrQvtGC0L7RgNGL0Lkg0LLRiyDRhdC+0YLQuNGC0LUg0L3QsNGA0LjRgdC+0LLQsNGC0YwuINCS0Ysg0LzQvtC20LXRgtC1INC+0YHRgtCw0LLQuNGC0Ywg0Y/Rh9C10LnQutGDINC/0YPRgdGC0L7QuSwg0LXRgdC70Lgg0L3QtSDRhdC+0YLQuNGC0LUsINGH0YLQvtCx0Ysg0LfQvdCw0YfQvtC6INC+0YLQvtCx0YDQsNC20LDQu9GB0Y8g0LTQu9GPINC90LXQutC+0YLQvtGA0YvRhSDRgtC+0YfQtdC6LiDQmtC+0LPQtNCwINGB0YLQvtC70LHQtdGGINC90LDQt9Cy0LDQvScsXG4gICAgICBjb2RlOiAn0LfQvdCw0YfQtdC6JyxcbiAgICAgIGRlc2NyaXB0aW9uMjogJyBrZXBsZXIuZ2wg0LDQstGC0L7QvNCw0YLQuNGH0LXRgdC60Lgg0YHQvtC30LTQsNGB0YIg0LTQu9GPINCy0LDRgSDRgdC70L7QuSDQt9C90LDRh9C60L7Qsi4nLFxuICAgICAgZXhhbXBsZTogJ9Cf0YDQuNC80LXRgDonLFxuICAgICAgaWNvbnM6ICfQl9C90LDRh9C60LgnXG4gICAgfSxcbiAgICBzdG9yYWdlTWFwVmlld2VyOiB7XG4gICAgICBsYXN0TW9kaWZpZWQ6ICfQn9C+0YHQu9C10LTQvdC10LUg0LjQt9C80LXQvdC10L3QuNC1IHtsYXN0VXBkYXRlZH0g0L3QsNC30LDQtCcsXG4gICAgICBiYWNrOiAn0J3QsNC30LDQtCdcbiAgICB9LFxuICAgIG92ZXJ3cml0ZU1hcDoge1xuICAgICAgdGl0bGU6ICfQodC+0YXRgNCw0L3QtdC90LjQtSDQutCw0YDRgtGLLi4uJyxcbiAgICAgIGFscmVhZHlFeGlzdHM6ICfRg9C20LUg0YHRg9GJ0LXRgdGC0LLRg9C10YIg0LIg0LLQsNGI0LXQvCB7bWFwU2F2ZWR9LiDQpdC+0YLQuNGC0LUg0LXQs9C+INC/0LXRgNC10LfQsNC/0LjRgdCw0YLRjD8nXG4gICAgfSxcbiAgICBsb2FkU3RvcmFnZU1hcDoge1xuICAgICAgYmFjazogJ9Cd0LDQt9Cw0LQnLFxuICAgICAgZ29Ub1BhZ2U6ICfQn9C10YDQtdC50YLQuCDQvdCwINGB0YLRgNCw0L3QuNGG0YMgS2VwbGVyLmdsIHtkaXNwbGF5TmFtZX0nLFxuICAgICAgc3RvcmFnZU1hcHM6ICfQpdGA0LDQvdC40LvQuNGJ0LUgLyDQmtCw0YDRgtGLJyxcbiAgICAgIG5vU2F2ZWRNYXBzOiAn0J3QtdGCINGB0L7RhdGA0LDQvdC10L3QvdGL0YUg0LrQsNGA0YInXG4gICAgfVxuICB9LFxuICBoZWFkZXI6IHtcbiAgICB2aXNpYmxlTGF5ZXJzOiAn0JLQuNC00LjQvNGL0LUg0YHQu9C+0LgnLFxuICAgIGxheWVyTGVnZW5kOiAn0JvQtdCz0LXQvdC00LAg0YHQu9C+0Y8nXG4gIH0sXG4gIGludGVyYWN0aW9uczoge1xuICAgIHRvb2x0aXA6ICfQn9C+0LTRgdC60LDQt9C60LAnLFxuICAgIGJydXNoOiAn0JrQuNGB0YLRjCcsXG4gICAgY29vcmRpbmF0ZTogJ9Ca0L7QvtGA0LTQuNC90LDRgtGLJyxcbiAgICBnZW9jb2RlcjogJ9CT0LXQvtC60L7QtNC10YAnXG4gIH0sXG4gIGxheWVyQmxlbmRpbmc6IHtcbiAgICB0aXRsZTogJ9Ch0LzQtdGI0LjQstCw0L3QuNC1INGB0LvQvtC10LInLFxuICAgIGFkZGl0aXZlOiAn0LTQvtCx0LDQstC70LXQvdC40LUnLFxuICAgIG5vcm1hbDogJ9C90L7RgNC80LDQu9GM0L3QvtC1JyxcbiAgICBzdWJ0cmFjdGl2ZTogJ9Cy0YvRh9C40YLQsNC90LjQtSdcbiAgfSxcbiAgY29sdW1uczoge1xuICAgIHRpdGxlOiAn0KHRgtC+0LvQsdGG0YsnLFxuICAgIGxhdDogJ2xhdCcsXG4gICAgbG5nOiAnbG9uJyxcbiAgICBhbHRpdHVkZTogJ9Cy0YvRgdC+0YLQsCcsXG4gICAgaWNvbjogJ9C30L3QsNGH0LXQuicsXG4gICAgZ2VvanNvbjogJ2dlb2pzb24nLFxuICAgIHRva2VuOiAndG9rZW4nLFxuICAgIGFyYzoge1xuICAgICAgbGF0MDogJ2xhdCDQuNGB0YLQvtGH0L3QuNC60LAnLFxuICAgICAgbG5nMDogJ2xuZyDQuNGB0YLQvtGH0L3QuNC60LAnLFxuICAgICAgbGF0MTogJ2xhdCDRhtC10LvQuCcsXG4gICAgICBsbmcxOiAnbG5nINGG0LXQu9C4J1xuICAgIH0sXG4gICAgbGluZToge1xuICAgICAgYWx0MDogJ9Cy0YvRgdC+0YLQsCDQuNGB0YLQvtGH0L3QuNC60LAnLFxuICAgICAgYWx0MTogJ9Cy0YvRgdC+0YLQsCDRhtC10LvQuCdcbiAgICB9LFxuICAgIGdyaWQ6IHtcbiAgICAgIHdvcmxkVW5pdFNpemU6ICfQoNCw0LfQvNC10YAg0YHQtdGC0LrQuCAoa20pJ1xuICAgIH0sXG4gICAgaGV4YWdvbjoge1xuICAgICAgd29ybGRVbml0U2l6ZTogJ0hleGFnb24g0YDQsNC00LjRg9GBIChrbSknXG4gICAgfSxcbiAgICBoZXhfaWQ6ICdoZXggaWQnXG4gIH0sXG4gIGNvbG9yOiB7XG4gICAgY3VzdG9tUGFsZXR0ZTogJ9CS0LDRiNCwINC/0LDQu9C40YLRgNCwJyxcbiAgICBzdGVwczogJ9GI0LDQs9C+0LInLFxuICAgIHR5cGU6ICfRgtC40L8nLFxuICAgIHJldmVyc2VkOiAn0L/QtdGA0LXQstC10YDQvdGD0YLRjCdcbiAgfSxcbiAgc2NhbGU6IHtcbiAgICBjb2xvclNjYWxlOiAn0KbQstC10YLQvtCy0LDRjyDRiNC60LDQu9CwJyxcbiAgICBzaXplU2NhbGU6ICfQnNCw0YHRiNGC0LDQsSDRgNCw0LfQvNC10YDQsCcsXG4gICAgc3Ryb2tlU2NhbGU6ICfQnNCw0YHRiNGC0LDQsSDRiNGC0YDQuNGF0LAnLFxuICAgIHNjYWxlOiAn0JzQsNGB0YjRgtCw0LEnXG4gIH0sXG4gIGZpbGVVcGxvYWRlcjoge1xuICAgIG1lc3NhZ2U6ICfQn9C10YDQtdGC0LDRidC40YLQtSDRgdGO0LTQsCDQstCw0YjQuCDRhNCw0LnQu9GLJyxcbiAgICBjaHJvbWVNZXNzYWdlOlxuICAgICAgJyrQn9C+0LvRjNC30L7QstCw0YLQtdC70YwgQ2hyb21lOiDQvtCz0YDQsNC90LjRh9GM0YLQtSDRgNCw0LfQvNC10YAg0YTQsNC50LvQsCDQtNC+IDI1MCDQnNCRLCDQtdGB0LvQuCDQvdGD0LbQvdC+INC30LDQs9GA0YPQt9C40YLRjCDRhNCw0LnQuyDQsdC+0LvRjNGI0LXQs9C+INGA0LDQt9C80LXRgNCwLCDQv9C+0L/RgNC+0LHRg9C50YLQtSBTYWZhcmknLFxuICAgIGRpc2NsYWltZXI6XG4gICAgICAnKmtlcGxlci5nbCAtINGN0YLQviDQutC70LjQtdC90YLRgdC60L7QtSDQv9GA0LjQu9C+0LbQtdC90LjQtSDQsdC10Lcg0YHQtdGA0LLQtdGA0L3QvtC5INGH0LDRgdGC0LguINCU0LDQvdC90YvQtSDQttC40LLRg9GCINGC0L7Qu9GM0LrQviDQvdCwINCy0LDRiNC10Lwg0LrQvtC80L/RjNGO0YLQtdGA0LUuICcgK1xuICAgICAgJ9Cd0LjQutCw0LrQsNGPINC40L3RhNC+0YDQvNCw0YbQuNGPINC40LvQuCDQtNCw0L3QvdGL0LUg0LrQsNGA0YLRiyDQvdC1INC+0YLQv9GA0LDQstC70Y/RjtGC0YHRjyDQvdC4INC90LAg0L7QtNC40L0g0YHQtdGA0LLQtdGALicsXG4gICAgY29uZmlnVXBsb2FkTWVzc2FnZTpcbiAgICAgICfQl9Cw0LPRgNGD0LfQuNGC0LUge2ZpbGVGb3JtYXROYW1lc30g0LjQu9C4INGB0L7RhdGA0LDQvdC10L3QvdGD0Y4g0LrQsNGA0YLRgyAqKkpzb24qKi4g0J/QvtC00YDQvtCx0L3QtdC1IFsqKnN1cHBvcnRlZCBmaWxlIGZvcm1hdHMqKl0nLFxuICAgIGJyb3dzZUZpbGVzOiAn0J/RgNC+0YHQvNCw0YLRgNC10YLRjCDRhNCw0LnQu9GLJyxcbiAgICB1cGxvYWRpbmc6ICfQl9Cw0LPRgNGD0LfQutCwJyxcbiAgICBmaWxlTm90U3VwcG9ydGVkOiAnRmlsZSB7ZXJyb3JGaWxlc30gaXMgbm90IHN1cHBvcnRlZC4nLFxuICAgIG9yOiAnb3InXG4gIH0sXG4gIGdlb2NvZGVyOiB7XG4gICAgdGl0bGU6ICfQktCy0LXQtNC40YLQtSDQsNC00YDQtdGBINC40LvQuCDQutC+0L7RgNC00LjQvdCw0YLRiywg0L3QsNC/0YDQuNC80LXRgCAzNy43OSwgLTEyMi40MCdcbiAgfSxcbiAgZmllbGRTZWxlY3Rvcjoge1xuICAgIGNsZWFyQWxsOiAn0J7Rh9C40YHRgtC40YLRjCDQstGB0LUnLFxuICAgIGZvcm1hdHRpbmc6ICfQpNC+0YDQvNCw0YLQuNGA0L7QstCw0L3QuNC1J1xuICB9LFxuICBjb21wYXJlOiB7XG4gICAgbW9kZUxhYmVsOiAn0KDQtdC20LjQvCDRgdGA0LDQstC90LXQvdC40Y8nLFxuICAgIHR5cGVMYWJlbDogJ9Ci0LjQvyDRgdGA0LDQstC90LXQvdC40Y8nLFxuICAgIHR5cGVzOiB7XG4gICAgICBhYnNvbHV0ZTogJ9CQ0LHRgdC+0LvRjtGC0L3Ri9C5JyxcbiAgICAgIHJlbGF0aXZlOiAn0J7RgtC90L7RgdC40YLQtdC70YzQvdGL0LknXG4gICAgfVxuICB9LFxuICBtYXBQb3BvdmVyOiB7XG4gICAgcHJpbWFyeTogJ9Cf0LXRgNCy0LjRh9C90YvQuSdcbiAgfSxcbiAgZGVuc2l0eTogJ2RlbnNpdHknLFxuICAnQnVnIFJlcG9ydCc6ICfQntGC0YfQtdGCINC+0LEg0L7RiNC40LHQutCw0YUnLFxuICAnVXNlciBHdWlkZSc6ICfQmNC90YHRgtGA0YPQutGG0LjQuCcsXG4gIFNhdmU6ICfQodC+0YXRgNCw0L3QuNGC0YwnLFxuICBTaGFyZTogJ9Cf0L7QtNC10LvQuNGC0YzRgdGPJ1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFHQSxJQUFBQSxRQUFBLEdBQUFDLE9BQUE7QUFBbUMsU0FBQUMsUUFBQUMsQ0FBQSxFQUFBQyxDQUFBLFFBQUFDLENBQUEsR0FBQUMsTUFBQSxDQUFBQyxJQUFBLENBQUFKLENBQUEsT0FBQUcsTUFB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