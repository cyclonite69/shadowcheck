"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addEffect = addEffect;
exports.addFilter = addFilter;
exports.addLayer = addLayer;
exports.applyCPUFilter = applyCPUFilter;
exports.applyFilterConfig = applyFilterConfig;
exports.applyLayerConfig = applyLayerConfig;
exports.copyTableColumn = copyTableColumn;
exports.createNewDatasetSuccess = void 0;
exports.createOrUpdateFilter = createOrUpdateFilter;
exports.deleteFeature = deleteFeature;
exports.duplicateLayer = duplicateLayer;
exports.interactionConfigChange = interactionConfigChange;
exports.layerColorUIChange = layerColorUIChange;
exports.layerConfigChange = layerConfigChange;
exports.layerFilteredItemsChange = layerFilteredItemsChange;
exports.layerSetIsValid = layerSetIsValid;
exports.layerTextLabelChange = layerTextLabelChange;
exports.layerToggleVisibility = layerToggleVisibility;
exports.layerTypeChange = layerTypeChange;
exports.layerVisConfigChange = layerVisConfigChange;
exports.layerVisualChannelConfigChange = layerVisualChannelConfigChange;
exports.loadFileStepSuccess = loadFileStepSuccess;
exports.loadFiles = loadFiles;
exports.loadFilesErr = loadFilesErr;
exports.loadFilesSuccess = loadFilesSuccess;
exports.loadNextFile = loadNextFile;
exports.nextFileBatch = nextFileBatch;
exports.onLayerClick = onLayerClick;
exports.onLayerHover = onLayerHover;
exports.onMapClick = onMapClick;
exports.onMouseMove = onMouseMove;
exports.pinTableColumn = pinTableColumn;
exports.processFileContent = processFileContent;
exports.removeDataset = removeDataset;
exports.removeEffect = removeEffect;
exports.removeFilter = removeFilter;
exports.removeLayer = removeLayer;
exports.renameDataset = renameDataset;
exports.reorderEffect = reorderEffect;
exports.reorderLayer = reorderLayer;
exports.setAnimationConfig = setAnimationConfig;
exports.setColumnDisplayFormat = setColumnDisplayFormat;
exports.setEditorMode = setEditorMode;
exports.setFeatures = setFeatures;
exports.setFilter = setFilter;
exports.setFilterAnimationTime = setFilterAnimationTime;
exports.setFilterAnimationTimeConfig = setFilterAnimationTimeConfig;
exports.setFilterAnimationWindow = setFilterAnimationWindow;
exports.setFilterPlot = setFilterPlot;
exports.setFilterView = setFilterView;
exports.setLayerAnimationTime = setLayerAnimationTime;
exports.setLayerAnimationTimeConfig = setLayerAnimationTimeConfig;
exports.setLoadingIndicator = void 0;
exports.setMapInfo = setMapInfo;
exports.setPolygonFilterLayer = setPolygonFilterLayer;
exports.setSelectedFeature = setSelectedFeature;
exports.setTimeFilterSyncTimelineMode = setTimeFilterSyncTimelineMode;
exports.showDatasetTable = showDatasetTable;
exports.sortTableColumn = sortTableColumn;
exports.syncTimeFilterWithLayerTimeline = syncTimeFilterWithLayerTimeline;
exports.toggleEditorVisibility = toggleEditorVisibility;
exports.toggleFilterAnimation = toggleFilterAnimation;
exports.toggleFilterFeature = toggleFilterFeature;
exports.toggleLayerAnimation = toggleLayerAnimation;
exports.toggleLayerAnimationControl = toggleLayerAnimationControl;
exports.toggleLayerForMap = toggleLayerForMap;
exports.updateDatasetProps = updateDatasetProps;
exports.updateEffect = updateEffect;
exports.updateFilterAnimationSpeed = updateFilterAnimationSpeed;
exports.updateLayerAnimationSpeed = updateLayerAnimationSpeed;
exports.updateLayerBlending = updateLayerBlending;
exports.updateOverlayBlending = updateOverlayBlending;
exports.updateTableColor = updateTableColor;
exports.updateVisData = updateVisData;
exports.wmsFeatureInfo = wmsFeatureInfo;
var _actionTypes = _interopRequireDefault(require("./action-types"));
var _toolkit = require("@reduxjs/toolkit");
// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

// vis-state-reducer

// TODO - import LoaderObject type from @loaders.gl/core when supported
// TODO - import LoadOptions type from @loaders.gl/core when supported

/**
 * Update layer base config: dataId, label, column, isVisible
 * @param oldLayerId - layer id to be updated
 * @param newLayerConfig - new layer config
 * @param layerIndex - (Optional) Index of the layer to be updated (can be useful in some cases, because
 *                     the layer id might change during update, e.g. when the type of the layer changes)
 * @returns action
 * @public
 */
function applyLayerConfig(oldLayerId, newLayerConfig, layerIndex) {
  return {
    type: _actionTypes["default"].APPLY_LAYER_CONFIG,
    oldLayerId: oldLayerId,
    newLayerConfig: newLayerConfig,
    layerIndex: layerIndex
  };
}
/**
 * Update layer base config: dataId, label, column, isVisible
 * @param oldLayer - layer to be updated
 * @param newConfig - new config to be merged with old config
 * @returns action
 * @public
 */
function layerConfigChange(oldLayer, newConfig) {
  return {
    type: _actionTypes["default"].LAYER_CONFIG_CHANGE,
    oldLayer: oldLayer,
    newConfig: newConfig
  };
}
/**
 * Update layer visibility depends on splitMap single or dual
 * @param layerId - layerId to be updated
 * @param isVisible - whether this layer is visible globally
 * @param splitMapId - id for this splitMap
 * @returns action
 * @public
 */
function layerToggleVisibility(layerId, isVisible, splitMapId) {
  return {
    type: _actionTypes["default"].LAYER_TOGGLE_VISIBILITY,
    layerId: layerId,
    isVisible: isVisible,
    splitMapId: splitMapId
  };
}
/**
 * Update layer text label
 * @param oldLayer - layer to be updated
 * @param idx -`idx` of text label to be updated
 * @param prop - `prop` of text label, e,g, `anchor`, `alignment`, `color`, `size`, `field`, `outlineWidth`, `outlineColor`
 * @param value - new value
 * @returns action
 * @public
 */
function layerTextLabelChange(oldLayer, idx, prop, value) {
  return {
    type: _actionTypes["default"].LAYER_TEXT_LABEL_CHANGE,
    oldLayer: oldLayer,
    idx: idx,
    prop: prop,
    value: value
  };
}
/**
 * Changes value of isValid flag for a layer.
 * The action also updates visibility of the layer based on isValid.
 * @param oldLayer - layer to be updated
 * @param isValid - new value for isValid flag
 * @returns action
 * @public
 */
function layerSetIsValid(oldLayer, isValid) {
  return {
    type: _actionTypes["default"].LAYER_SET_IS_VALID,
    oldLayer: oldLayer,
    isValid: isValid
  };
}
/**
 * Update layer type. Previews layer config will be copied if applicable.
 * @param oldLayer - layer to be updated
 * @param newType - new type
 * @returns action
 * @public
 */
function layerTypeChange(oldLayer, newType) {
  return {
    type: _actionTypes["default"].LAYER_TYPE_CHANGE,
    oldLayer: oldLayer,
    newType: newType
  };
}
/**
 * Update layer visual channel
 * @memberof visStateActions
 * @param oldLayer - layer to be updated
 * @param newConfig - new visual channel config
 * @param channel - channel to be updated
 * @returns action
 * @public
 */
function layerVisualChannelConfigChange(oldLayer, newConfig, channel, newVisConfig) {
  return {
    type: _actionTypes["default"].LAYER_VISUAL_CHANNEL_CHANGE,
    oldLayer: oldLayer,
    newConfig: newConfig,
    channel: channel,
    newVisConfig: newVisConfig
  };
}
/**
 * Update layer `visConfig`
 * @memberof visStateActions
 * @param oldLayer - layer to be updated
 * @param newVisConfig - new visConfig as a key value map: e.g. `{opacity: 0.8}`
 * @returns action
 * @public
 */
function layerVisConfigChange(oldLayer, newVisConfig) {
  return {
    type: _actionTypes["default"].LAYER_VIS_CONFIG_CHANGE,
    oldLayer: oldLayer,
    newVisConfig: newVisConfig
  };
}
/**
 * Set the color palette ui for layer color
 * @memberof visStateActions
 * @param oldLayer - layer to be updated
 * @param prop - which color prop
 * @param newConfig - to be merged
 * @returns action
 * @public
 */
function layerColorUIChange(oldLayer, prop, newConfig) {
  return {
    type: _actionTypes["default"].LAYER_COLOR_UI_CHANGE,
    oldLayer: oldLayer,
    prop: prop,
    newConfig: newConfig
  };
}
/**
 * Update layer blending mode
 * @memberof visStateActions
 * @param mode one of `additive`, `normal` and `subtractive`
 * @returns action
 * @public
 */
function updateLayerBlending(mode) {
  return {
    type: _actionTypes["default"].UPDATE_LAYER_BLENDING,
    mode: mode
  };
}
/**
 * Update overlay blending mode
 * @memberof visStateActions
 * @param mode one of `screen`, `normal` and `darken`
 * @returns action
 * @public
 */
function updateOverlayBlending(mode) {
  return {
    type: _actionTypes["default"].UPDATE_OVERLAY_BLENDING,
    mode: mode
  };
}
/**
 * Update `interactionConfig`
 * @memberof visStateActions
 * @param config - new config as key value map: `{tooltip: {enabled: true}}`
 * @returns action
 * @public
 */
function interactionConfigChange(config) {
  return {
    type: _actionTypes["default"].INTERACTION_CONFIG_CHANGE,
    config: config
  };
}
/**
 * Update filter config
 * @param filterId - id of the filter to be updated
 * @param newFilter - new filter config
 * @returns action
 * @public
 */
function applyFilterConfig(filterId, newFilter) {
  return {
    type: _actionTypes["default"].APPLY_FILTER_CONFIG,
    filterId: filterId,
    newFilter: newFilter
  };
}
/**
 * Update filter property
 * @memberof visStateActions
 * @param idx -`idx` of filter to be updated
 * @param prop - `prop` of filter, e,g, `dataId`, `name`, `value`
 *                or an array e.g. ['idx', 'name']. in that case the value
 *                should also be an array of the corresponding values (by index)
 * @param value - new value
 * @param valueIndex - dataId index
 * @returns action
 * @public
 */
function setFilter(idx, prop, value, valueIndex) {
  return {
    type: _actionTypes["default"].SET_FILTER,
    idx: idx,
    prop: prop,
    value: value,
    valueIndex: valueIndex
  };
}
/**
 * Same as Update filter
 * @memberof visStateActions
 * @param idx -`idx` of filter to be updated
 * @param prop - `prop` of filter, e,g, `dataId`, `name`, `value`
 * @param value - new value
 * @param valueIndex - dataId index
 * @returns action
 * @public
 */
function setFilterAnimationTime(idx, prop, value, valueIndex) {
  return {
    type: _actionTypes["default"].SET_FILTER_ANIMATION_TIME,
    idx: idx,
    prop: prop,
    value: value,
    valueIndex: valueIndex
  };
}
/**
 * Same as Update filter
 * @memberof visStateActions
 * @public
 */
function setFilterAnimationWindow(_ref) {
  var id = _ref.id,
    animationWindow = _ref.animationWindow;
  return {
    type: _actionTypes["default"].SET_FILTER_ANIMATION_WINDOW,
    id: id,
    animationWindow: animationWindow
  };
}
/**
 * Add a new filter
 * @memberof visStateActions
 * @param dataId - dataset `id` this new filter is associated with
 * @param id - `id` for the new filter
 * @returns action
 * @public
 */
function addFilter(dataId, id) {
  return {
    type: _actionTypes["default"].ADD_FILTER,
    dataId: dataId,
    id: id
  };
}
/**
 * Create or updates a filter
 * @memberof visStateActions
 * @param dataId - dataset `id` this new filter is associated with
 * @returns action
 * @public
 */
function createOrUpdateFilter(id, dataId, field, value) {
  return {
    type: _actionTypes["default"].CREATE_OR_UPDATE_FILTER,
    id: id,
    dataId: dataId,
    field: field,
    value: value
  };
}
/**
 * Add a new layer
 * @memberof visStateActions
 * @param config - new layer config
 * @param datasetId - dataset id used for creating an empty layer
 * @returns action
 * @public
 */
function addLayer(config, datasetId) {
  return {
    type: _actionTypes["default"].ADD_LAYER,
    config: config,
    datasetId: datasetId
  };
}
/**
 * Reorder layer, order is an array of layer indexes, index 0 will be the one at the bottom
 * @memberof visStateActions
 * @param order an array of layer indexes
 * @returns action
 * @public
 * @example
 *
 * bring `layers[1]` below `layers[0]`, the sequence layers will be rendered is `layers[1].id`, `layers[0].id`, `layers[2].id`, `layers[3].id`.
 * `layers[1]` will be at the bottom, `layers[13]` will be at the top.
 * this.props.dispatch(reorderLayer([`layers[1].id`, `layers[0].id`, `layers[2].id`, `layers[3].id`]));
 */
function reorderLayer(order) {
  return {
    type: _actionTypes["default"].REORDER_LAYER,
    order: order
  };
}
/**
 * Remove a filter from `visState.filters`, once a filter is removed, data will be re-filtered and layer will be updated
 * @memberof visStateActions
 * @param idx idx of filter to be removed
 * @returns action
 * @public
 */
function removeFilter(idx) {
  return {
    type: _actionTypes["default"].REMOVE_FILTER,
    idx: idx
  };
}
/**
 * Remove a layer
 * @memberof visStateActions
 * @param id idx of layer to be removed
 * @returns action
 * @public
 */
function removeLayer(id) {
  return {
    type: _actionTypes["default"].REMOVE_LAYER,
    id: id
  };
}
/**
 * Duplicate a layer
 * @memberof visStateActions
 * @param id id of layer to be duplicated
 * @returns action
 * @public
 */
function duplicateLayer(id) {
  return {
    type: _actionTypes["default"].DUPLICATE_LAYER,
    id: id
  };
}
/**
 * Add a new effect
 * @memberof visStateActions
 * @param config - new effect config
 * @returns action
 * @public
 */
function addEffect(config) {
  return {
    type: _actionTypes["default"].ADD_EFFECT,
    config: config
  };
}
/**
 * Reorder effects
 * @memberof visStateActions
 * @param order an array of effect ids
 * @returns action
 * @public
 */
function reorderEffect(order) {
  return {
    type: _actionTypes["default"].REORDER_EFFECT,
    order: order
  };
}
/**
 * Remove an effect
 * @memberof visStateActions
 * @param id idx of the effect to be removed
 * @returns action
 * @public
 */
function removeEffect(id) {
  return {
    type: _actionTypes["default"].REMOVE_EFFECT,
    id: id
  };
}
/**
 * Update an effect
 * @memberof visStateActions
 * @param props idx of the effect to be updated with specified props
 * @returns action
 * @public
 */
function updateEffect(id, props) {
  return {
    type: _actionTypes["default"].UPDATE_EFFECT,
    id: id,
    props: props
  };
}
/**
 * Remove a dataset and all layers, filters, tooltip configs that based on it
 * @memberof visStateActions
 * @param dataId dataset id
 * @returns action
 * @public
 */
function removeDataset(dataId) {
  return {
    type: _actionTypes["default"].REMOVE_DATASET,
    dataId: dataId
  };
}
/**
 * Display dataset table in a modal
 * @memberof visStateActions
 * @param dataId dataset id to show in table
 * @returns action
 * @public
 */
function showDatasetTable(dataId) {
  return {
    type: _actionTypes["default"].SHOW_DATASET_TABLE,
    dataId: dataId
  };
}
/**
 * Update dataset color to custom by means of color picker
 * @memberof visStateActions
 * @param dataId dataset `id` this custom color is associated with
 * @param newColor custom color in RGBformat
 * @returns action
 * @public
 */
function updateTableColor(dataId, newColor) {
  return {
    type: _actionTypes["default"].UPDATE_TABLE_COLOR,
    dataId: dataId,
    newColor: newColor
  };
}
/**
 * Sort dataset column, for table display
 * @memberof visStateActions
 * @param dataId
 * @param column
 * @param mode
 * @returns action
 * @public
 */
function sortTableColumn(dataId, column, mode) {
  return {
    type: _actionTypes["default"].SORT_TABLE_COLUMN,
    dataId: dataId,
    column: column,
    mode: mode
  };
}
/**
 * Pin dataset column, for table display
 * @param dataId
 * @param column
 * @returns action
 * @public
 */
function pinTableColumn(dataId, column) {
  return {
    type: _actionTypes["default"].PIN_TABLE_COLUMN,
    dataId: dataId,
    column: column
  };
}
/**
 * Copy column, for table display
 * @param dataId
 * @param column
 * @returns action
 * @public
 */
function copyTableColumn(dataId, column) {
  return {
    type: _actionTypes["default"].COPY_TABLE_COLUMN,
    dataId: dataId,
    column: column
  };
}
/**
 * Set column display format
 * @param dataId
 * @param formats
 * @returns action
 * @public
 */
function setColumnDisplayFormat(dataId, formats) {
  return {
    type: _actionTypes["default"].SET_COLUMN_DISPLAY_FORMAT,
    dataId: dataId,
    formats: formats
  };
}
// * @param dataset.info -info of a dataset
// * @param dataset.info.id - id of this dataset. If config is defined, `id` should matches the `dataId` in config.
// * @param dataset.info.label - A display name of this dataset
// * @param dataset.data - ***required** The data object, in a tabular format with 2 properties `fields` and `rows`
// * @param dataset.data.fields - ***required** Array of fields,
// * @param dataset.data.fields.name - ***required** Name of the field,
// * @param dataset.data.rows - ***required** Array of rows, in a tabular format with `fields` and `rows`
/**
 * Add new dataset to `visState`, with option to load a map config along with the datasets
 * @memberof visStateActions
 * @param datasets - ***required** datasets can be a dataset or an array of datasets
 * Each dataset object needs to have `info` and `data` property.
 * @param {object} options
 * @param options.centerMap `default: true` if `centerMap` is set to `true` kepler.gl will
 * place the map view within the data points boundaries
 * @param options.readOnly `default: false` if `readOnly` is set to `true`
 * the left setting panel will be hidden
 * @param config this object will contain the full kepler.gl instance configuration {mapState, mapStyle, visState}
 * @returns action
 * @public
 */
function updateVisData(datasets, options, config) {
  return {
    type: _actionTypes["default"].UPDATE_VIS_DATA,
    datasets: datasets,
    options: options,
    config: config
  };
}
/**
 * Rename an existing dataset in `visState`
 * @memberof visStateActions
 * @param dataId - ***required** Id of the dataset to update
 * @param label - ***required** New name for the dataset
 * @returns action
 * @public
 */
function renameDataset(dataId, label) {
  return {
    type: _actionTypes["default"].RENAME_DATASET,
    dataId: dataId,
    label: label
  };
}
/**
 * Update an existing dataset props in `visState`
 * @param dataId - ***required** Id of the dataset to update
 * @param props - ***required** New props to update
 * @returns action
 */
function updateDatasetProps(dataId, props) {
  return {
    type: _actionTypes["default"].UPDATE_DATASET_PROPS,
    dataId: dataId,
    props: props
  };
}
/**
 * Start and end filter animation
 * @memberof visStateActions
 * @param {Number} idx of filter
 * @returns action
 * @public
 */
function toggleFilterAnimation(idx) {
  return {
    type: _actionTypes["default"].TOGGLE_FILTER_ANIMATION,
    idx: idx
  };
}
/**
 * Change filter animation speed
 * @memberof visStateActions
 * @param idx -  `idx` of filter
 * @param speed - `speed` to change it to. `speed` is a multiplier
 * @returns action
 * @public
 */
function updateFilterAnimationSpeed(idx, speed) {
  return {
    type: _actionTypes["default"].UPDATE_FILTER_ANIMATION_SPEED,
    idx: idx,
    speed: speed
  };
}
/**
 * Set animation config: works with both layer animation and filter animation
 * @param config
 * @returns action
 */
function setAnimationConfig(config) {
  return {
    type: _actionTypes["default"].SET_ANIMATION_CONFIG,
    config: config
  };
}
/**
 * Reset animation
 * @memberof visStateActions
 * @param value -  Current value of the slider
 * @returns action
 * @public
 */
function setLayerAnimationTime(value) {
  return {
    type: _actionTypes["default"].SET_LAYER_ANIMATION_TIME,
    value: value
  };
}
/**
 * update trip layer animation speed
 * @memberof visStateActions
 * @param speed - `speed` to change it to. `speed` is a multiplier
 * @returns action
 * @public
 */
function updateLayerAnimationSpeed(speed) {
  return {
    type: _actionTypes["default"].UPDATE_LAYER_ANIMATION_SPEED,
    speed: speed
  };
}
/**
 * start end end layer animation
 * @memberof visStateActions
 * @returns action
 * @public
 */
function toggleLayerAnimation() {
  return {
    type: _actionTypes["default"].TOGGLE_LAYER_ANIMATION
  };
}
/**
 * hide and show layer animation control
 * @memberof visStateActions
 * @returns action
 * @public
 */
function toggleLayerAnimationControl() {
  return {
    type: _actionTypes["default"].TOGGLE_LAYER_ANIMATION_CONTROL
  };
}
/**
 * Show larger time filter at bottom for time playback (apply to time filter only)
 * @memberof visStateActions
 * @param idx - index of filter to enlarge
 * @param view - type of filter view
 * @returns action
 * @public
 */
function setFilterView(idx, view) {
  return {
    type: _actionTypes["default"].SET_FILTER_VIEW,
    idx: idx,
    view: view
  };
}
/**
 * Show/hide filter feature on map
 * @memberof visStateActions
 * @param idx - index of filter feature to show/hide
 * @return action
 */
function toggleFilterFeature(idx) {
  return {
    type: _actionTypes["default"].TOGGLE_FILTER_FEATURE,
    idx: idx
  };
}
/**
 * Trigger layer hover event with hovered object
 * @memberof visStateActions
 * @param info - Object hovered, returned by deck.gl.
 * @param mapIndex - Optional property for limiting the display of the `<MapPopover>` to the `<MapContainer>` the user is interacting with.
 * @returns action
 * @public
 */
function onLayerHover(info, mapIndex) {
  return {
    type: _actionTypes["default"].LAYER_HOVER,
    info: info,
    mapIndex: mapIndex
  };
}
/**
 * Trigger layer click event with clicked object
 * @memberof visStateActions
 * @param info - Object clicked, returned by deck.gl
 * @returns action
 * @public
 */
function onLayerClick(info) {
  return {
    type: _actionTypes["default"].LAYER_CLICK,
    info: info
  };
}
/**
 * Trigger map click event, unselect clicked object
 * @memberof visStateActions
 * @returns action
 * @public
 */
function onMapClick() {
  return {
    type: _actionTypes["default"].MAP_CLICK
  };
}
/**
 * Trigger map mouse moveevent, payload would be
 * React-map-gl MapLayerMouseEvent
 * https://visgl.github.io/react-map-gl/docs/api-reference/types#maplayermouseevent
 *
 * @memberof visStateActions
 * @param evt - MapLayerMouseEvent
 * @returns action
 * @public
 */
function onMouseMove(evt) {
  return {
    type: _actionTypes["default"].MOUSE_MOVE,
    evt: evt
  };
}
/**
 * Toggle visibility of a layer in a split map
 * @memberof visStateActions
 * @param mapIndex - index of the split map
 * @param layerId - id of the layer
 * @returns action
 * @public
 */
function toggleLayerForMap(mapIndex, layerId) {
  return {
    type: _actionTypes["default"].TOGGLE_LAYER_FOR_MAP,
    mapIndex: mapIndex,
    layerId: layerId
  };
}
/**
 * Set the property of a filter plot
 * @memberof visStateActions
 * @param idx
 * @param newProp key value mapping of new prop `{yAxis: 'histogram'}`
 * @param valueIndex dataId index
 * @returns action
 * @public
 */
function setFilterPlot(idx, newProp, valueIndex) {
  return {
    type: _actionTypes["default"].SET_FILTER_PLOT,
    idx: idx,
    newProp: newProp,
    valueIndex: valueIndex
  };
}
/**
 * Set the property of a filter plot
 * @memberof visStateActions
 * @param info
 * @returns action
 * @public
 */
function setMapInfo(info) {
  return {
    type: _actionTypes["default"].SET_MAP_INFO,
    info: info
  };
}
/**
 * Trigger file loading dispatch `addDataToMap` if succeed, or `loadFilesErr` if failed
 * @memberof visStateActions
 * @param files array of fileblob
 * @returns action
 * @public
 */
function loadFiles(files, onFinish) {
  return {
    type: _actionTypes["default"].LOAD_FILES,
    files: files,
    onFinish: onFinish
  };
}

/**
 * Called with next file to load
 * @memberof visStateActions
 * @returns action
 * @public
 */
function loadNextFile() {
  return {
    type: _actionTypes["default"].LOAD_NEXT_FILE
  };
}
/**
 * called when all files are processed and loaded
 * @memberof visStateActions
 * @param result
 * @returns action
 */
function loadFilesSuccess(result) {
  return {
    type: _actionTypes["default"].LOAD_FILES_SUCCESS,
    result: result
  };
}
/**
 * called when successfully loaded one file, ready to move on to the next one
 * @memberof visStateActions
 * @param result
 * @returns action
 */
function loadFileStepSuccess(_ref2) {
  var fileName = _ref2.fileName,
    fileCache = _ref2.fileCache;
  return {
    type: _actionTypes["default"].LOAD_FILE_STEP_SUCCESS,
    fileName: fileName,
    fileCache: fileCache
  };
}
/**
 * Trigger loading file error
 * @memberof visStateActions
 * @param  error
 * @returns action
 * @public
 */

function loadFilesErr(fileName, error) {
  return {
    type: _actionTypes["default"].LOAD_FILES_ERR,
    fileName: fileName,
    error: error
  };
}
/**
 * Store features to state
 * @memberof visStateActions
 * @param features
 * @returns action
 */
function setFeatures(features) {
  return {
    type: _actionTypes["default"].SET_FEATURES,
    features: features
  };
}
/**
 * It will apply the provide feature as filter to the given layer.
 * If the given feature is already applied as filter to the layer, it will remove the layer from the filter
 * @memberof visStateActions
 * @param layer
 * @param feature
 * @returns action
 */
function setPolygonFilterLayer(layer, feature) {
  return {
    type: _actionTypes["default"].SET_POLYGON_FILTER_LAYER,
    layer: layer,
    feature: feature
  };
}
/**
 * Set the current feature to be edited/deleted,
 * and the context of how the feature was selected.
 * @memberof visStateActions
 * @param feature
 * @param selectionContext
 * @returns action
 */
function setSelectedFeature(feature, selectionContext) {
  return {
    type: _actionTypes["default"].SET_SELECTED_FEATURE,
    feature: feature,
    selectionContext: selectionContext
  };
}
/**
 * Delete the given feature
 * @memberof visStateActions
 * @param feature
 * @returns action
 */
function deleteFeature(feature) {
  return {
    type: _actionTypes["default"].DELETE_FEATURE,
    feature: feature
  };
}
/** Set the map mode
 * @memberof visStateActions
 * @param mode one of EDITOR_MODES
 * @returns action
 * @public
 * @example
 * import {setMapMode} from '@kepler.gl/actions';
 * import {EDITOR_MODES} from '@kepler.gl/constants';
 *
 * this.props.dispatch(setMapMode(EDITOR_MODES.DRAW_POLYGON));
 */
function setEditorMode(mode) {
  return {
    type: _actionTypes["default"].SET_EDITOR_MODE,
    mode: mode
  };
}
/**
 * Trigger CPU filter of selected dataset
 * @memberof visStateActions
 * @param dataId - single dataId or an array of dataIds
 * @returns action
 * @public
 */
function applyCPUFilter(dataId) {
  return {
    type: _actionTypes["default"].APPLY_CPU_FILTER,
    dataId: dataId
  };
}
/**
 * Toggle editor layer visibility
 * @memberof visStateActions
 * @return action
 */
function toggleEditorVisibility() {
  return {
    type: _actionTypes["default"].TOGGLE_EDITOR_VISIBILITY
  };
}
/**
 * Process the next file batch
 * @memberof visStateActions
 * @param payload - batch payload
 * @return action
 */
function nextFileBatch(payload) {
  return {
    type: _actionTypes["default"].NEXT_FILE_BATCH,
    payload: payload
  };
}
/**
 * Process the file content
 * @memberof visStateActions
 * @param payload - the file content
 * @return action
 */
function processFileContent(payload) {
  return {
    type: _actionTypes["default"].PROCESS_FILE_CONTENT,
    payload: payload
  };
}
/**
 * Set layer animation time format and timezone
 * @memberof visStateActions
 * @param config - {timeFormat: string, timezone: string}
 * @return action
 */
function setLayerAnimationTimeConfig(config) {
  return {
    type: _actionTypes["default"].SET_LAYER_ANIMATION_TIME_CONFIG,
    config: config
  };
}
/**
 * Set Filter animation time format and timezone
 * @memberof visStateActions
 * @param idx
 * @param config
 * @return action
 */
function setFilterAnimationTimeConfig(idx, config) {
  return {
    type: _actionTypes["default"].SET_FILTER_ANIMATION_TIME_CONFIG,
    idx: idx,
    config: config
  };
}
/**
 * deck.gl layer gpu filter callback
 * @memberof visStateActions
 * @param layer
 * @param event
 * @return action
 */
function layerFilteredItemsChange(layer, event) {
  return {
    type: _actionTypes["default"].LAYER_FILTERED_ITEMS_CHANGE,
    layer: layer,
    event: event
  };
}
/**
 * WMS layer feature info callback
 * @memberof visStateActions
 * @param layer
 * @param featureInfo
 * @param coordinate
 * @return action
 */
function wmsFeatureInfo(layer, featureInfo, coordinate) {
  return {
    type: _actionTypes["default"].WMS_FEATURE_INFO,
    layer: layer,
    featureInfo: featureInfo,
    coordinate: coordinate
  };
}
/**
 * Sync time filter with layer timeline
 * @memberof visStateActions
 * @param idx
 * @param enable
 * @return action
 */
function syncTimeFilterWithLayerTimeline(idx, enable) {
  return {
    type: _actionTypes["default"].SYNC_TIME_FILTER_WITH_LAYER_TIMELINE,
    idx: idx,
    enable: enable
  };
}
/**
 * Set time filter sync timeline mode
 * @memberof visStateActions
 * @param id
 * @param mode
 * @return action
 */
function setTimeFilterSyncTimelineMode(_ref3) {
  var id = _ref3.id,
    mode = _ref3.mode;
  return {
    type: _actionTypes["default"].SYNC_TIME_FILTER_TIMELINE_MODE,
    id: id,
    mode: mode
  };
}
/**
 * Called when a new dataset is created successfully via async table methods
 * @memberof visStateActions
 * @param payload
 * @param payload.results - results of promises.allSettlted
 * @returns
 */
var createNewDatasetSuccess = exports.createNewDatasetSuccess = (0, _toolkit.createAction)(_actionTypes["default"].CREATE_NEW_DATASET_SUCCESS);
/**
 * Change of number of active loading items, used to render loading indicator.
 * @memberof visStateActions
 * @param payload
 * @param payload.change Change of number of active loading actions.
 * @public
 */
var setLoadingIndicator = exports.setLoadingIndicator = (0, _toolkit.createAction)(_actionTypes["default"].SET_LOADING_INDICATOR);

/**
 * This declaration is needed to group actions in docs
 */
/**
 * Actions handled mostly by `visState` reducer.
 * They manage how data is processed, filtered and displayed on the map by operates on layers,
 * filters and interaction settings.
 *
 * @public
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
var visStateActions = null;
/* eslint-enable @typescript-eslint/no-unused-vars */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfYWN0aW9uVHlwZXMiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIl90b29sa2l0IiwiYXBwbHlMYXllckNvbmZpZyIsIm9sZExheWVySWQiLCJuZXdMYXllckNvbmZpZyIsImxheWVySW5kZXgiLCJ0eXBlIiwiQWN0aW9uVHlwZXMiLCJBUFBMWV9MQVlFUl9DT05GSUciLCJsYXllckNvbmZpZ0NoYW5nZSIsIm9sZExheWVyIiwibmV3Q29uZmlnIiwiTEFZRVJfQ09ORklHX0NIQU5HRSIsImxheWVyVG9nZ2xlVmlzaWJpbGl0eSIsImxheWVySWQiLCJpc1Zpc2libGUiLCJzcGxpdE1hcElkIiwiTEFZRVJfVE9HR0xFX1ZJU0lCSUxJVFkiLCJsYXllclRleHRMYWJlbENoYW5nZSIsImlkeCIsInByb3AiLCJ2YWx1ZSIsIkxBWUVSX1RFWFRfTEFCRUxfQ0hBTkdFIiwibGF5ZXJTZXRJc1ZhbGlkIiwiaXNWYWxpZCIsIkxBWUVSX1NFVF9JU19WQUxJRCIsImxheWVyVHlwZUNoYW5nZSIsIm5ld1R5cGUiLCJMQVlFUl9UWVBFX0NIQU5HRSIsImxheWVyVmlzdWFsQ2hhbm5lbENvbmZpZ0NoYW5nZSIsImNoYW5uZWwiLCJuZXdWaXNDb25maWciLCJMQVlFUl9WSVNVQUxfQ0hBTk5FTF9DSEFOR0UiLCJsYXllclZpc0NvbmZpZ0NoYW5nZSIsIkxBWUVSX1ZJU19DT05GSUdfQ0hBTkdFIiwibGF5ZXJDb2xvclVJQ2hhbmdlIiwiTEFZRVJfQ09MT1JfVUlfQ0hBTkdFIiwidXBkYXRlTGF5ZXJCbGVuZGluZyIsIm1vZGUiLCJVUERBVEVfTEFZRVJfQkxFTkRJTkciLCJ1cGRhdGVPdmVybGF5QmxlbmRpbmciLCJVUERBVEVfT1ZFUkxBWV9CTEVORElORyIsImludGVyYWN0aW9uQ29uZmlnQ2hhbmdlIiwiY29uZmlnIiwiSU5URVJBQ1RJT05fQ09ORklHX0NIQU5HRSIsImFwcGx5RmlsdGVyQ29uZmlnIiwiZmlsdGVySWQiLCJuZXdGaWx0ZXIiLCJBUFBMWV9GSUxURVJfQ09ORklHIiwic2V0RmlsdGVyIiwidmFsdWVJbmRleCIsIlNFVF9GSUxURVIiLCJzZXRGaWx0ZXJBbmltYXRpb25UaW1lIiwiU0VUX0ZJTFRFUl9BTklNQVRJT05fVElNRSIsInNldEZpbHRlckFuaW1hdGlvbldpbmRvdyIsIl9yZWYiLCJpZCIsImFuaW1hdGlvbldpbmRvdyIsIlNFVF9GSUxURVJfQU5JTUFUSU9OX1dJTkRPVyIsImFkZEZpbHRlciIsImRhdGFJZCIsIkFERF9GSUxURVIiLCJjcmVhdGVPclVwZGF0ZUZpbHRlciIsImZpZWxkIiwiQ1JFQVRFX09SX1VQREFURV9GSUxURVIiLCJhZGRMYXllciIsImRhdGFzZXRJZCIsIkFERF9MQVlFUiIsInJlb3JkZXJMYXllciIsIm9yZGVyIiwiUkVPUkRFUl9MQVlFUiIsInJlbW92ZUZpbHRlciIsIlJFTU9WRV9GSUxURVIiLCJyZW1vdmVMYXllciIsIlJFTU9WRV9MQVlFUiIsImR1cGxpY2F0ZUxheWVyIiwiRFVQTElDQVRFX0xBWUVSIiwiYWRkRWZmZWN0IiwiQUREX0VGRkVDVCIsInJlb3JkZXJFZmZlY3QiLCJSRU9SREVSX0VGRkVDVCIsInJlbW92ZUVmZmVjdCIsIlJFTU9WRV9FRkZFQ1QiLCJ1cGRhdGVFZmZlY3QiLCJwcm9wcyIsIlVQREFURV9FRkZFQ1QiLCJyZW1vdmVEYXRhc2V0IiwiUkVNT1ZFX0RBVEFTRVQiLCJzaG93RGF0YXNldFRhYmxlIiwiU0hPV19EQVRBU0VUX1RBQkxFIiwidXBkYXRlVGFibGVDb2xvciIsIm5ld0NvbG9yIiwiVVBEQVRFX1RBQkxFX0NPTE9SIiwic29ydFRhYmxlQ29sdW1uIiwiY29sdW1uIiwiU09SVF9UQUJMRV9DT0xVTU4iLCJwaW5UYWJsZUNvbHVtbiIsIlBJTl9UQUJMRV9DT0xVTU4iLCJjb3B5VGFibGVDb2x1bW4iLCJDT1BZX1RBQkxFX0NPTFVNTiIsInNldENvbHVtbkRpc3BsYXlGb3JtYXQiLCJmb3JtYXRzIiwiU0VUX0NPTFVNTl9ESVNQTEFZX0ZPUk1BVCIsInVwZGF0ZVZpc0RhdGEiLCJkYXRhc2V0cyIsIm9wdGlvbnMiLCJVUERBVEVfVklTX0RBVEEiLCJyZW5hbWVEYXRhc2V0IiwibGFiZWwiLCJSRU5BTUVfREFUQVNFVCIsInVwZGF0ZURhdGFzZXRQcm9wcyIsIlVQREFURV9EQVRBU0VUX1BST1BTIiwidG9nZ2xlRmlsdGVyQW5pbWF0aW9uIiwiVE9HR0xFX0ZJTFRFUl9BTklNQVRJT04iLCJ1cGRhdGVGaWx0ZXJBbmltYXRpb25TcGVlZCIsInNwZWVkIiwiVVBEQVRFX0ZJTFRFUl9BTklNQVRJT05fU1BFRUQiLCJzZXRBbmltYXRpb25Db25maWciLCJTRVRfQU5JTUFUSU9OX0NPTkZJRyIsInNldExheWVyQW5pbWF0aW9uVGltZSIsIlNFVF9MQVlFUl9BTklNQVRJT05fVElNRSIsInVwZGF0ZUxheWVyQW5pbWF0aW9uU3BlZWQiLCJVUERBVEVfTEFZRVJfQU5JTUFUSU9OX1NQRUVEIiwidG9nZ2xlTGF5ZXJBbmltYXRpb24iLCJUT0dHTEVfTEFZRVJfQU5JTUFUSU9OIiwidG9nZ2xlTGF5ZXJBbmltYXRpb25Db250cm9sIiwiVE9HR0xFX0xBWUVSX0FOSU1BVElPTl9DT05UUk9MIiwic2V0RmlsdGVyVmlldyIsInZpZXciLCJTRVRfRklMVEVSX1ZJRVciLCJ0b2dnbGVGaWx0ZXJGZWF0dXJlIiwiVE9HR0xFX0ZJTFRFUl9GRUFUVVJFIiwib25MYXllckhvdmVyIiwiaW5mbyIsIm1hcEluZGV4IiwiTEFZRVJfSE9WRVIiLCJvbkxheWVyQ2xpY2siLCJMQVlFUl9DTElDSyIsIm9uTWFwQ2xpY2siLCJNQVBfQ0xJQ0siLCJvbk1vdXNlTW92ZSIsImV2dCIsIk1PVVNFX01PVkUiLCJ0b2dnbGVMYXllckZvck1hcCIsIlRPR0dMRV9MQVlFUl9GT1JfTUFQIiwic2V0RmlsdGVyUGxvdCIsIm5ld1Byb3AiLCJTRVRfRklMVEVSX1BMT1QiLCJzZXRNYXBJbmZvIiwiU0VUX01BUF9JTkZPIiwibG9hZEZpbGVzIiwiZmlsZXMiLCJvbkZpbmlzaCIsIkxPQURfRklMRVMiLCJsb2FkTmV4dEZpbGUiLCJMT0FEX05FWFRfRklMRSIsImxvYWRGaWxlc1N1Y2Nlc3MiLCJyZXN1bHQiLCJMT0FEX0ZJTEVTX1NVQ0NFU1MiLCJsb2FkRmlsZVN0ZXBTdWNjZXNzIiwiX3JlZjIiLCJmaWxlTmFtZSIsImZpbGVDYWNoZSIsIkxPQURfRklMRV9TVEVQX1NVQ0NFU1MiLCJsb2FkRmlsZXNFcnIiLCJlcnJvciIsIkxPQURfRklMRVNfRVJSIiwic2V0RmVhdHVyZXMiLCJmZWF0dXJlcyIsIlNFVF9GRUFUVVJFUyIsInNldFBvbHlnb25GaWx0ZXJMYXllciIsImxheWVyIiwiZmVhdHVyZSIsIlNFVF9QT0xZR09OX0ZJTFRFUl9MQVlFUiIsInNldFNlbGVjdGVkRmVhdHVyZSIsInNlbGVjdGlvbkNvbnRleHQiLCJTRVRfU0VMRUNURURfRkVBVFVSRSIsImRlbGV0ZUZlYXR1cmUiLCJERUxFVEVfRkVBVFVSRSIsInNldEVkaXRvck1vZGUiLCJTRVRfRURJVE9SX01PREUiLCJhcHBseUNQVUZpbHRlciIsIkFQUExZX0NQVV9GSUxURVIiLCJ0b2dnbGVFZGl0b3JWaXNpYmlsaXR5IiwiVE9HR0xFX0VESVRPUl9WSVNJQklMSVRZIiwibmV4dEZpbGVCYXRjaCIsInBheWxvYWQiLCJORVhUX0ZJTEVfQkFUQ0giLCJwcm9jZXNzRmlsZUNvbnRlbnQiLCJQUk9DRVNTX0ZJTEVfQ09OVEVOVCIsInNldExheWVyQW5pbWF0aW9uVGltZUNvbmZpZyIsIlNFVF9MQVlFUl9BTklNQVRJT05fVElNRV9DT05GSUciLCJzZXRGaWx0ZXJBbmltYXRpb25UaW1lQ29uZmlnIiwiU0VUX0ZJTFRFUl9BTklNQVRJT05fVElNRV9DT05GSUciLCJsYXllckZpbHRlcmVkSXRlbXNDaGFuZ2UiLCJldmVudCIsIkxBWUVSX0ZJTFRFUkVEX0lURU1TX0NIQU5HRSIsIndtc0ZlYXR1cmVJbmZvIiwiZmVhdHVyZUluZm8iLCJjb29yZGluYXRlIiwiV01TX0ZFQVRVUkVfSU5GTyIsInN5bmNUaW1lRmlsdGVyV2l0aExheWVyVGltZWxpbmUiLCJlbmFibGUiLCJTWU5DX1RJTUVfRklMVEVSX1dJVEhfTEFZRVJfVElNRUxJTkUiLCJzZXRUaW1lRmlsdGVyU3luY1RpbWVsaW5lTW9kZSIsIl9yZWYzIiwiU1lOQ19USU1FX0ZJTFRFUl9USU1FTElORV9NT0RFIiwiY3JlYXRlTmV3RGF0YXNldFN1Y2Nlc3MiLCJleHBvcnRzIiwiY3JlYXRlQWN0aW9uIiwiQ1JFQVRFX05FV19EQVRBU0VUX1NVQ0NFU1MiLCJzZXRMb2FkaW5nSW5kaWNhdG9yIiwiU0VUX0xPQURJTkdfSU5ESUNBVE9SIiwidmlzU3RhdGVBY3Rpb25zIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvc3JjL3Zpcy1zdGF0ZS1hY3Rpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbi8vIHZpcy1zdGF0ZS1yZWR1Y2VyXG5pbXBvcnQge1BpY2tJbmZvfSBmcm9tICdAZGVjay5nbC9jb3JlL2xpYi9kZWNrJztcbmltcG9ydCB7ZGVmYXVsdCBhcyBBY3Rpb25UeXBlc30gZnJvbSAnLi9hY3Rpb24tdHlwZXMnO1xuaW1wb3J0IHtGaWxlQ2FjaGVJdGVtfSBmcm9tICdAa2VwbGVyLmdsL3Byb2Nlc3NvcnMnO1xuaW1wb3J0IHtMYXllciwgTGF5ZXJCYXNlQ29uZmlnfSBmcm9tICdAa2VwbGVyLmdsL2xheWVycyc7XG5pbXBvcnQge0tlcGxlclRhYmxlfSBmcm9tICdAa2VwbGVyLmdsL3RhYmxlJztcbmltcG9ydCB7XG4gIEFkZERhdGFUb01hcFBheWxvYWQsXG4gIFZhbHVlT2YsXG4gIE1lcmdlLFxuICBSR0JDb2xvcixcbiAgTmVzdGVkUGFydGlhbCxcbiAgTGF5ZXJWaXNDb25maWcsXG4gIENvbG9yVUksXG4gIEZlYXR1cmUsXG4gIEZlYXR1cmVTZWxlY3Rpb25Db250ZXh0LFxuICBJbnRlcmFjdGlvbkNvbmZpZyxcbiAgRmlsdGVyLFxuICBQYXJzZWRDb25maWcsXG4gIFBhcnNlZExheWVyLFxuICBFZmZlY3RQcm9wc1BhcnRpYWwsXG4gIFN5bmNUaW1lbGluZU1vZGUsXG4gIEFuaW1hdGlvbkNvbmZpZyxcbiAgRmlsdGVyQW5pbWF0aW9uQ29uZmlnXG59IGZyb20gJ0BrZXBsZXIuZ2wvdHlwZXMnO1xuaW1wb3J0IHtjcmVhdGVBY3Rpb259IGZyb20gJ0ByZWR1eGpzL3Rvb2xraXQnO1xuXG4vLyBUT0RPIC0gaW1wb3J0IExvYWRlck9iamVjdCB0eXBlIGZyb20gQGxvYWRlcnMuZ2wvY29yZSB3aGVuIHN1cHBvcnRlZFxuLy8gVE9ETyAtIGltcG9ydCBMb2FkT3B0aW9ucyB0eXBlIGZyb20gQGxvYWRlcnMuZ2wvY29yZSB3aGVuIHN1cHBvcnRlZFxuXG5leHBvcnQgdHlwZSBBcHBseUxheWVyQ29uZmlnVXBkYXRlckFjdGlvbiA9IHtcbiAgb2xkTGF5ZXJJZDogc3RyaW5nO1xuICBuZXdMYXllckNvbmZpZzogUGFyc2VkTGF5ZXI7XG4gIGxheWVySW5kZXg/OiBudW1iZXI7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBsYXllciBiYXNlIGNvbmZpZzogZGF0YUlkLCBsYWJlbCwgY29sdW1uLCBpc1Zpc2libGVcbiAqIEBwYXJhbSBvbGRMYXllcklkIC0gbGF5ZXIgaWQgdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIG5ld0xheWVyQ29uZmlnIC0gbmV3IGxheWVyIGNvbmZpZ1xuICogQHBhcmFtIGxheWVySW5kZXggLSAoT3B0aW9uYWwpIEluZGV4IG9mIHRoZSBsYXllciB0byBiZSB1cGRhdGVkIChjYW4gYmUgdXNlZnVsIGluIHNvbWUgY2FzZXMsIGJlY2F1c2VcbiAqICAgICAgICAgICAgICAgICAgICAgdGhlIGxheWVyIGlkIG1pZ2h0IGNoYW5nZSBkdXJpbmcgdXBkYXRlLCBlLmcuIHdoZW4gdGhlIHR5cGUgb2YgdGhlIGxheWVyIGNoYW5nZXMpXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5TGF5ZXJDb25maWcoXG4gIG9sZExheWVySWQ6IHN0cmluZyxcbiAgbmV3TGF5ZXJDb25maWc6IFBhcnNlZExheWVyLFxuICBsYXllckluZGV4PzogbnVtYmVyXG4pOiBNZXJnZTxBcHBseUxheWVyQ29uZmlnVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5BUFBMWV9MQVlFUl9DT05GSUd9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuQVBQTFlfTEFZRVJfQ09ORklHLFxuICAgIG9sZExheWVySWQsXG4gICAgbmV3TGF5ZXJDb25maWcsXG4gICAgbGF5ZXJJbmRleFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBMYXllckNvbmZpZ0NoYW5nZVVwZGF0ZXJBY3Rpb24gPSB7XG4gIG9sZExheWVyOiBMYXllcjtcbiAgbmV3Q29uZmlnOiBQYXJ0aWFsPExheWVyWydjb25maWcnXT47XG59O1xuLyoqXG4gKiBVcGRhdGUgbGF5ZXIgYmFzZSBjb25maWc6IGRhdGFJZCwgbGFiZWwsIGNvbHVtbiwgaXNWaXNpYmxlXG4gKiBAcGFyYW0gb2xkTGF5ZXIgLSBsYXllciB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gbmV3Q29uZmlnIC0gbmV3IGNvbmZpZyB0byBiZSBtZXJnZWQgd2l0aCBvbGQgY29uZmlnXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxheWVyQ29uZmlnQ2hhbmdlKFxuICBvbGRMYXllcjogTGF5ZXIsXG4gIG5ld0NvbmZpZzogUGFydGlhbDxMYXllckJhc2VDb25maWc+XG4pOiBNZXJnZTxMYXllckNvbmZpZ0NoYW5nZVVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTEFZRVJfQ09ORklHX0NIQU5HRX0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9DT05GSUdfQ0hBTkdFLFxuICAgIG9sZExheWVyLFxuICAgIG5ld0NvbmZpZ1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBMYXllclRvZ2dsZVZpc2liaWxpdHlVcGRhdGVyQWN0aW9uID0ge1xuICBsYXllcklkOiBzdHJpbmc7XG4gIGlzVmlzaWJsZTogYm9vbGVhbjtcbiAgc3BsaXRNYXBJZD86IHN0cmluZztcbn07XG5cbi8qKlxuICogVXBkYXRlIGxheWVyIHZpc2liaWxpdHkgZGVwZW5kcyBvbiBzcGxpdE1hcCBzaW5nbGUgb3IgZHVhbFxuICogQHBhcmFtIGxheWVySWQgLSBsYXllcklkIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBpc1Zpc2libGUgLSB3aGV0aGVyIHRoaXMgbGF5ZXIgaXMgdmlzaWJsZSBnbG9iYWxseVxuICogQHBhcmFtIHNwbGl0TWFwSWQgLSBpZCBmb3IgdGhpcyBzcGxpdE1hcFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYXllclRvZ2dsZVZpc2liaWxpdHkoXG4gIGxheWVySWQ6IHN0cmluZyxcbiAgaXNWaXNpYmxlOiBib29sZWFuLFxuICBzcGxpdE1hcElkPzogc3RyaW5nXG4pOiBNZXJnZTxMYXllclRvZ2dsZVZpc2liaWxpdHlVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLkxBWUVSX1RPR0dMRV9WSVNJQklMSVRZfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX1RPR0dMRV9WSVNJQklMSVRZLFxuICAgIGxheWVySWQsXG4gICAgaXNWaXNpYmxlLFxuICAgIHNwbGl0TWFwSWRcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgTGF5ZXJUZXh0TGFiZWxDaGFuZ2VVcGRhdGVyQWN0aW9uID0ge1xuICBvbGRMYXllcjogTGF5ZXI7XG4gIGlkeDogbnVtYmVyIHwgJ2FsbCc7XG4gIHByb3A6IHN0cmluZztcbiAgdmFsdWU6IGFueTtcbn07XG5cbi8qKlxuICogVXBkYXRlIGxheWVyIHRleHQgbGFiZWxcbiAqIEBwYXJhbSBvbGRMYXllciAtIGxheWVyIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBpZHggLWBpZHhgIG9mIHRleHQgbGFiZWwgdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIHByb3AgLSBgcHJvcGAgb2YgdGV4dCBsYWJlbCwgZSxnLCBgYW5jaG9yYCwgYGFsaWdubWVudGAsIGBjb2xvcmAsIGBzaXplYCwgYGZpZWxkYCwgYG91dGxpbmVXaWR0aGAsIGBvdXRsaW5lQ29sb3JgXG4gKiBAcGFyYW0gdmFsdWUgLSBuZXcgdmFsdWVcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJUZXh0TGFiZWxDaGFuZ2UoXG4gIG9sZExheWVyOiBMYXllcixcbiAgaWR4OiBudW1iZXIgfCAnYWxsJyxcbiAgcHJvcDogc3RyaW5nLFxuICB2YWx1ZTogYW55XG4pOiBNZXJnZTxMYXllclRleHRMYWJlbENoYW5nZVVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTEFZRVJfVEVYVF9MQUJFTF9DSEFOR0V9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTEFZRVJfVEVYVF9MQUJFTF9DSEFOR0UsXG4gICAgb2xkTGF5ZXIsXG4gICAgaWR4LFxuICAgIHByb3AsXG4gICAgdmFsdWVcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgTGF5ZXJTZXRJc1ZhbGlkVXBkYXRlckFjdGlvbiA9IHtcbiAgb2xkTGF5ZXI6IExheWVyO1xuICBpc1ZhbGlkOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBDaGFuZ2VzIHZhbHVlIG9mIGlzVmFsaWQgZmxhZyBmb3IgYSBsYXllci5cbiAqIFRoZSBhY3Rpb24gYWxzbyB1cGRhdGVzIHZpc2liaWxpdHkgb2YgdGhlIGxheWVyIGJhc2VkIG9uIGlzVmFsaWQuXG4gKiBAcGFyYW0gb2xkTGF5ZXIgLSBsYXllciB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gaXNWYWxpZCAtIG5ldyB2YWx1ZSBmb3IgaXNWYWxpZCBmbGFnXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxheWVyU2V0SXNWYWxpZChcbiAgb2xkTGF5ZXI6IExheWVyLFxuICBpc1ZhbGlkOiBib29sZWFuXG4pOiBNZXJnZTxMYXllclNldElzVmFsaWRVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLkxBWUVSX1NFVF9JU19WQUxJRH0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9TRVRfSVNfVkFMSUQsXG4gICAgb2xkTGF5ZXIsXG4gICAgaXNWYWxpZFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBMYXllclR5cGVDaGFuZ2VVcGRhdGVyQWN0aW9uID0ge1xuICBvbGRMYXllcjogTGF5ZXI7XG4gIG5ld1R5cGU6IHN0cmluZztcbn07XG4vKipcbiAqIFVwZGF0ZSBsYXllciB0eXBlLiBQcmV2aWV3cyBsYXllciBjb25maWcgd2lsbCBiZSBjb3BpZWQgaWYgYXBwbGljYWJsZS5cbiAqIEBwYXJhbSBvbGRMYXllciAtIGxheWVyIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBuZXdUeXBlIC0gbmV3IHR5cGVcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJUeXBlQ2hhbmdlKFxuICBvbGRMYXllcjogTGF5ZXIsXG4gIG5ld1R5cGU6IHN0cmluZ1xuKTogTWVyZ2U8TGF5ZXJUeXBlQ2hhbmdlVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5MQVlFUl9UWVBFX0NIQU5HRX0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9UWVBFX0NIQU5HRSxcbiAgICBvbGRMYXllcixcbiAgICBuZXdUeXBlXG4gIH07XG59XG5leHBvcnQgdHlwZSBMYXllclZpc3VhbENoYW5uZWxDb25maWdDaGFuZ2VVcGRhdGVyQWN0aW9uID0ge1xuICBvbGRMYXllcjogTGF5ZXI7XG4gIG5ld0NvbmZpZzogUGFydGlhbDxMYXllclsnY29uZmlnJ10+O1xuICBjaGFubmVsOiBzdHJpbmc7XG4gIG5ld1Zpc0NvbmZpZz86IFBhcnRpYWw8TGF5ZXJWaXNDb25maWc+O1xufTtcbi8qKlxuICogVXBkYXRlIGxheWVyIHZpc3VhbCBjaGFubmVsXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gb2xkTGF5ZXIgLSBsYXllciB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gbmV3Q29uZmlnIC0gbmV3IHZpc3VhbCBjaGFubmVsIGNvbmZpZ1xuICogQHBhcmFtIGNoYW5uZWwgLSBjaGFubmVsIHRvIGJlIHVwZGF0ZWRcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlKFxuICBvbGRMYXllcjogTGF5ZXIsXG4gIG5ld0NvbmZpZzogUGFydGlhbDxMYXllckJhc2VDb25maWc+LFxuICBjaGFubmVsOiBzdHJpbmcsXG4gIG5ld1Zpc0NvbmZpZz86IFBhcnRpYWw8TGF5ZXJWaXNDb25maWc+XG4pOiBNZXJnZTxcbiAgTGF5ZXJWaXN1YWxDaGFubmVsQ29uZmlnQ2hhbmdlVXBkYXRlckFjdGlvbixcbiAge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5MQVlFUl9WSVNVQUxfQ0hBTk5FTF9DSEFOR0V9XG4+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MQVlFUl9WSVNVQUxfQ0hBTk5FTF9DSEFOR0UsXG4gICAgb2xkTGF5ZXIsXG4gICAgbmV3Q29uZmlnLFxuICAgIGNoYW5uZWwsXG4gICAgbmV3VmlzQ29uZmlnXG4gIH07XG59XG5leHBvcnQgdHlwZSBMYXllclZpc0NvbmZpZ0NoYW5nZVVwZGF0ZXJBY3Rpb24gPSB7XG4gIG9sZExheWVyOiBMYXllcjtcbiAgbmV3VmlzQ29uZmlnOiBQYXJ0aWFsPExheWVyVmlzQ29uZmlnPjtcbn07XG4vKipcbiAqIFVwZGF0ZSBsYXllciBgdmlzQ29uZmlnYFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIG9sZExheWVyIC0gbGF5ZXIgdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIG5ld1Zpc0NvbmZpZyAtIG5ldyB2aXNDb25maWcgYXMgYSBrZXkgdmFsdWUgbWFwOiBlLmcuIGB7b3BhY2l0eTogMC44fWBcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJWaXNDb25maWdDaGFuZ2UoXG4gIG9sZExheWVyOiBMYXllcixcbiAgbmV3VmlzQ29uZmlnOiBQYXJ0aWFsPExheWVyVmlzQ29uZmlnPlxuKTogTWVyZ2U8TGF5ZXJWaXNDb25maWdDaGFuZ2VVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLkxBWUVSX1ZJU19DT05GSUdfQ0hBTkdFfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX1ZJU19DT05GSUdfQ0hBTkdFLFxuICAgIG9sZExheWVyLFxuICAgIG5ld1Zpc0NvbmZpZ1xuICB9O1xufVxuZXhwb3J0IHR5cGUgTGF5ZXJDb2xvclVJQ2hhbmdlVXBkYXRlckFjdGlvbiA9IHtcbiAgb2xkTGF5ZXI6IExheWVyO1xuICBwcm9wOiBzdHJpbmc7XG4gIG5ld0NvbmZpZzogTmVzdGVkUGFydGlhbDxDb2xvclVJPjtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjb2xvciBwYWxldHRlIHVpIGZvciBsYXllciBjb2xvclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIG9sZExheWVyIC0gbGF5ZXIgdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIHByb3AgLSB3aGljaCBjb2xvciBwcm9wXG4gKiBAcGFyYW0gbmV3Q29uZmlnIC0gdG8gYmUgbWVyZ2VkXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxheWVyQ29sb3JVSUNoYW5nZShcbiAgb2xkTGF5ZXI6IExheWVyLFxuICBwcm9wOiBzdHJpbmcsXG4gIG5ld0NvbmZpZzogTmVzdGVkUGFydGlhbDxDb2xvclVJPlxuKTogTWVyZ2U8TGF5ZXJDb2xvclVJQ2hhbmdlVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5MQVlFUl9DT0xPUl9VSV9DSEFOR0V9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTEFZRVJfQ09MT1JfVUlfQ0hBTkdFLFxuICAgIG9sZExheWVyLFxuICAgIHByb3AsXG4gICAgbmV3Q29uZmlnXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFVwZGF0ZUxheWVyQmxlbmRpbmdVcGRhdGVyQWN0aW9uID0ge1xuICBtb2RlOiAnYWRkaXRpdmUnIHwgJ25vcm1hbCcgfCAnc3VidHJhY3RpdmUnO1xufTtcbi8qKlxuICogVXBkYXRlIGxheWVyIGJsZW5kaW5nIG1vZGVcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBtb2RlIG9uZSBvZiBgYWRkaXRpdmVgLCBgbm9ybWFsYCBhbmQgYHN1YnRyYWN0aXZlYFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVMYXllckJsZW5kaW5nKFxuICBtb2RlOiAnYWRkaXRpdmUnIHwgJ25vcm1hbCcgfCAnc3VidHJhY3RpdmUnXG4pOiBNZXJnZTxVcGRhdGVMYXllckJsZW5kaW5nVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5VUERBVEVfTEFZRVJfQkxFTkRJTkd9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX0xBWUVSX0JMRU5ESU5HLFxuICAgIG1vZGVcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVXBkYXRlT3ZlcmxheUJsZW5kaW5nVXBkYXRlckFjdGlvbiA9IHtcbiAgbW9kZTogJ3NjcmVlbicgfCAnbm9ybWFsJyB8ICdkYXJrZW4nO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgb3ZlcmxheSBibGVuZGluZyBtb2RlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gbW9kZSBvbmUgb2YgYHNjcmVlbmAsIGBub3JtYWxgIGFuZCBgZGFya2VuYFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVPdmVybGF5QmxlbmRpbmcoXG4gIG1vZGU6ICdzY3JlZW4nIHwgJ25vcm1hbCcgfCAnZGFya2VuJ1xuKTogTWVyZ2U8VXBkYXRlT3ZlcmxheUJsZW5kaW5nVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5VUERBVEVfT1ZFUkxBWV9CTEVORElOR30+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5VUERBVEVfT1ZFUkxBWV9CTEVORElORyxcbiAgICBtb2RlXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIEludGVyYWN0aW9uQ29uZmlnQ2hhbmdlVXBkYXRlckFjdGlvbiA9IHtcbiAgY29uZmlnOiBWYWx1ZU9mPEludGVyYWN0aW9uQ29uZmlnPjtcbn07XG4vKipcbiAqIFVwZGF0ZSBgaW50ZXJhY3Rpb25Db25maWdgXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gY29uZmlnIC0gbmV3IGNvbmZpZyBhcyBrZXkgdmFsdWUgbWFwOiBge3Rvb2x0aXA6IHtlbmFibGVkOiB0cnVlfX1gXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludGVyYWN0aW9uQ29uZmlnQ2hhbmdlKFxuICBjb25maWc6IFZhbHVlT2Y8SW50ZXJhY3Rpb25Db25maWc+XG4pOiBNZXJnZTxcbiAgSW50ZXJhY3Rpb25Db25maWdDaGFuZ2VVcGRhdGVyQWN0aW9uLFxuICB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLklOVEVSQUNUSU9OX0NPTkZJR19DSEFOR0V9XG4+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5JTlRFUkFDVElPTl9DT05GSUdfQ0hBTkdFLFxuICAgIGNvbmZpZ1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBBcHBseUZpbHRlckNvbmZpZ1VwZGF0ZXJBY3Rpb24gPSB7XG4gIGZpbHRlcklkOiBzdHJpbmc7XG4gIG5ld0ZpbHRlcjogRmlsdGVyO1xufTtcblxuLyoqXG4gKiBVcGRhdGUgZmlsdGVyIGNvbmZpZ1xuICogQHBhcmFtIGZpbHRlcklkIC0gaWQgb2YgdGhlIGZpbHRlciB0byBiZSB1cGRhdGVkXG4gKiBAcGFyYW0gbmV3RmlsdGVyIC0gbmV3IGZpbHRlciBjb25maWdcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlGaWx0ZXJDb25maWcoXG4gIGZpbHRlcklkOiBzdHJpbmcsXG4gIG5ld0ZpbHRlcjogRmlsdGVyXG4pOiBNZXJnZTxBcHBseUZpbHRlckNvbmZpZ1VwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuQVBQTFlfRklMVEVSX0NPTkZJR30+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5BUFBMWV9GSUxURVJfQ09ORklHLFxuICAgIGZpbHRlcklkLFxuICAgIG5ld0ZpbHRlclxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBTZXRGaWx0ZXJVcGRhdGVyQWN0aW9uID0ge1xuICBpZHg6IG51bWJlcjtcbiAgcHJvcDogc3RyaW5nIHwgc3RyaW5nW107XG4gIHZhbHVlOiBhbnk7XG4gIHZhbHVlSW5kZXg/OiBudW1iZXI7XG59O1xuLyoqXG4gKiBVcGRhdGUgZmlsdGVyIHByb3BlcnR5XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWR4IC1gaWR4YCBvZiBmaWx0ZXIgdG8gYmUgdXBkYXRlZFxuICogQHBhcmFtIHByb3AgLSBgcHJvcGAgb2YgZmlsdGVyLCBlLGcsIGBkYXRhSWRgLCBgbmFtZWAsIGB2YWx1ZWBcbiAqICAgICAgICAgICAgICAgIG9yIGFuIGFycmF5IGUuZy4gWydpZHgnLCAnbmFtZSddLiBpbiB0aGF0IGNhc2UgdGhlIHZhbHVlXG4gKiAgICAgICAgICAgICAgICBzaG91bGQgYWxzbyBiZSBhbiBhcnJheSBvZiB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMgKGJ5IGluZGV4KVxuICogQHBhcmFtIHZhbHVlIC0gbmV3IHZhbHVlXG4gKiBAcGFyYW0gdmFsdWVJbmRleCAtIGRhdGFJZCBpbmRleFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGaWx0ZXIoXG4gIGlkeDogbnVtYmVyLFxuICBwcm9wOiBzdHJpbmcgfCBzdHJpbmdbXSxcbiAgdmFsdWU6IGFueSxcbiAgdmFsdWVJbmRleD86IG51bWJlclxuKTogTWVyZ2U8U2V0RmlsdGVyVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5TRVRfRklMVEVSfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNFVF9GSUxURVIsXG4gICAgaWR4LFxuICAgIHByb3AsXG4gICAgdmFsdWUsXG4gICAgdmFsdWVJbmRleFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBTZXRGaWx0ZXJBbmltYXRpb25UaW1lVXBkYXRlckFjdGlvbiA9IHtcbiAgaWR4OiBudW1iZXI7XG4gIHByb3A6IHN0cmluZztcbiAgdmFsdWU6IGFueTtcbiAgdmFsdWVJbmRleD86IG51bWJlcjtcbn07XG4vKipcbiAqIFNhbWUgYXMgVXBkYXRlIGZpbHRlclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGlkeCAtYGlkeGAgb2YgZmlsdGVyIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBwcm9wIC0gYHByb3BgIG9mIGZpbHRlciwgZSxnLCBgZGF0YUlkYCwgYG5hbWVgLCBgdmFsdWVgXG4gKiBAcGFyYW0gdmFsdWUgLSBuZXcgdmFsdWVcbiAqIEBwYXJhbSB2YWx1ZUluZGV4IC0gZGF0YUlkIGluZGV4XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEZpbHRlckFuaW1hdGlvblRpbWUoXG4gIGlkeDogbnVtYmVyLFxuICBwcm9wOiBzdHJpbmcsXG4gIHZhbHVlOiBhbnksXG4gIHZhbHVlSW5kZXg/OiBudW1iZXJcbik6IE1lcmdlPFxuICBTZXRGaWx0ZXJBbmltYXRpb25UaW1lVXBkYXRlckFjdGlvbixcbiAge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5TRVRfRklMVEVSX0FOSU1BVElPTl9USU1FfVxuPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0ZJTFRFUl9BTklNQVRJT05fVElNRSxcbiAgICBpZHgsXG4gICAgcHJvcCxcbiAgICB2YWx1ZSxcbiAgICB2YWx1ZUluZGV4XG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFNldEZpbHRlckFuaW1hdGlvbldpbmRvd1VwZGF0ZXJBY3Rpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGFuaW1hdGlvbldpbmRvdzogc3RyaW5nO1xufTtcbi8qKlxuICogU2FtZSBhcyBVcGRhdGUgZmlsdGVyXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGaWx0ZXJBbmltYXRpb25XaW5kb3coe1xuICBpZCxcbiAgYW5pbWF0aW9uV2luZG93XG59OiBTZXRGaWx0ZXJBbmltYXRpb25XaW5kb3dVcGRhdGVyQWN0aW9uKTogTWVyZ2U8XG4gIFNldEZpbHRlckFuaW1hdGlvbldpbmRvd1VwZGF0ZXJBY3Rpb24sXG4gIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuU0VUX0ZJTFRFUl9BTklNQVRJT05fV0lORE9XfVxuPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0ZJTFRFUl9BTklNQVRJT05fV0lORE9XLFxuICAgIGlkLFxuICAgIGFuaW1hdGlvbldpbmRvd1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBBZGRGaWx0ZXJVcGRhdGVyQWN0aW9uID0ge1xuICBkYXRhSWQ/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IG51bGw7XG4gIGlkPzogc3RyaW5nO1xufTtcbi8qKlxuICogQWRkIGEgbmV3IGZpbHRlclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGRhdGFJZCAtIGRhdGFzZXQgYGlkYCB0aGlzIG5ldyBmaWx0ZXIgaXMgYXNzb2NpYXRlZCB3aXRoXG4gKiBAcGFyYW0gaWQgLSBgaWRgIGZvciB0aGUgbmV3IGZpbHRlclxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRGaWx0ZXIoXG4gIGRhdGFJZDogc3RyaW5nIHwgbnVsbCxcbiAgaWQ/OiBzdHJpbmdcbik6IE1lcmdlPEFkZEZpbHRlclVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuQUREX0ZJTFRFUn0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5BRERfRklMVEVSLFxuICAgIGRhdGFJZCxcbiAgICBpZFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBDcmVhdGVPclVwZGF0ZUZpbHRlclVwZGF0ZXJBY3Rpb24gPSB7XG4gIGlkPzogc3RyaW5nO1xuICBkYXRhSWQ/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgZmllbGQ/OiBzdHJpbmcgfCBzdHJpbmdbXTtcbiAgdmFsdWU/OiBhbnk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBvciB1cGRhdGVzIGEgZmlsdGVyXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZGF0YUlkIC0gZGF0YXNldCBgaWRgIHRoaXMgbmV3IGZpbHRlciBpcyBhc3NvY2lhdGVkIHdpdGhcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3JVcGRhdGVGaWx0ZXIoXG4gIGlkPzogc3RyaW5nLFxuICBkYXRhSWQ/OiBzdHJpbmcgfCBzdHJpbmdbXSxcbiAgZmllbGQ/OiBzdHJpbmcgfCBzdHJpbmdbXSxcbiAgdmFsdWU/OiBhbnlcbik6IE1lcmdlPENyZWF0ZU9yVXBkYXRlRmlsdGVyVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5DUkVBVEVfT1JfVVBEQVRFX0ZJTFRFUn0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5DUkVBVEVfT1JfVVBEQVRFX0ZJTFRFUixcbiAgICBpZCxcbiAgICBkYXRhSWQsXG4gICAgZmllbGQsXG4gICAgdmFsdWVcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgQWRkTGF5ZXJVcGRhdGVyQWN0aW9uID0ge1xuICBjb25maWc/OiBvYmplY3Q7XG4gIGRhdGFzZXRJZD86IHN0cmluZztcbn07XG4vKipcbiAqIEFkZCBhIG5ldyBsYXllclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGNvbmZpZyAtIG5ldyBsYXllciBjb25maWdcbiAqIEBwYXJhbSBkYXRhc2V0SWQgLSBkYXRhc2V0IGlkIHVzZWQgZm9yIGNyZWF0aW5nIGFuIGVtcHR5IGxheWVyXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZExheWVyKFxuICBjb25maWc/OiBvYmplY3QsXG4gIGRhdGFzZXRJZD86IHN0cmluZ1xuKTogTWVyZ2U8QWRkTGF5ZXJVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLkFERF9MQVlFUn0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5BRERfTEFZRVIsXG4gICAgY29uZmlnLFxuICAgIGRhdGFzZXRJZFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBSZW9yZGVyTGF5ZXJVcGRhdGVyQWN0aW9uID0ge1xuICBvcmRlcjogc3RyaW5nW107XG59O1xuLyoqXG4gKiBSZW9yZGVyIGxheWVyLCBvcmRlciBpcyBhbiBhcnJheSBvZiBsYXllciBpbmRleGVzLCBpbmRleCAwIHdpbGwgYmUgdGhlIG9uZSBhdCB0aGUgYm90dG9tXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gb3JkZXIgYW4gYXJyYXkgb2YgbGF5ZXIgaW5kZXhlc1xuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICpcbiAqIGJyaW5nIGBsYXllcnNbMV1gIGJlbG93IGBsYXllcnNbMF1gLCB0aGUgc2VxdWVuY2UgbGF5ZXJzIHdpbGwgYmUgcmVuZGVyZWQgaXMgYGxheWVyc1sxXS5pZGAsIGBsYXllcnNbMF0uaWRgLCBgbGF5ZXJzWzJdLmlkYCwgYGxheWVyc1szXS5pZGAuXG4gKiBgbGF5ZXJzWzFdYCB3aWxsIGJlIGF0IHRoZSBib3R0b20sIGBsYXllcnNbMTNdYCB3aWxsIGJlIGF0IHRoZSB0b3AuXG4gKiB0aGlzLnByb3BzLmRpc3BhdGNoKHJlb3JkZXJMYXllcihbYGxheWVyc1sxXS5pZGAsIGBsYXllcnNbMF0uaWRgLCBgbGF5ZXJzWzJdLmlkYCwgYGxheWVyc1szXS5pZGBdKSk7XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW9yZGVyTGF5ZXIoXG4gIG9yZGVyOiBzdHJpbmdbXVxuKTogTWVyZ2U8UmVvcmRlckxheWVyVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5SRU9SREVSX0xBWUVSfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFT1JERVJfTEFZRVIsXG4gICAgb3JkZXJcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgUmVtb3ZlRmlsdGVyVXBkYXRlckFjdGlvbiA9IHtcbiAgaWR4OiBudW1iZXI7XG59O1xuLyoqXG4gKiBSZW1vdmUgYSBmaWx0ZXIgZnJvbSBgdmlzU3RhdGUuZmlsdGVyc2AsIG9uY2UgYSBmaWx0ZXIgaXMgcmVtb3ZlZCwgZGF0YSB3aWxsIGJlIHJlLWZpbHRlcmVkIGFuZCBsYXllciB3aWxsIGJlIHVwZGF0ZWRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBpZHggaWR4IG9mIGZpbHRlciB0byBiZSByZW1vdmVkXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUZpbHRlcihcbiAgaWR4OiBudW1iZXJcbik6IE1lcmdlPFJlbW92ZUZpbHRlclVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuUkVNT1ZFX0ZJTFRFUn0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRU1PVkVfRklMVEVSLFxuICAgIGlkeFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBSZW1vdmVMYXllclVwZGF0ZXJBY3Rpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG59O1xuLyoqXG4gKiBSZW1vdmUgYSBsYXllclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGlkIGlkeCBvZiBsYXllciB0byBiZSByZW1vdmVkXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUxheWVyKFxuICBpZDogc3RyaW5nXG4pOiBNZXJnZTxSZW1vdmVMYXllclVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuUkVNT1ZFX0xBWUVSfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlJFTU9WRV9MQVlFUixcbiAgICBpZFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBEdXBsaWNhdGVMYXllclVwZGF0ZXJBY3Rpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG59O1xuLyoqXG4gKiBEdXBsaWNhdGUgYSBsYXllclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGlkIGlkIG9mIGxheWVyIHRvIGJlIGR1cGxpY2F0ZWRcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZHVwbGljYXRlTGF5ZXIoXG4gIGlkOiBzdHJpbmdcbik6IE1lcmdlPER1cGxpY2F0ZUxheWVyVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5EVVBMSUNBVEVfTEFZRVJ9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuRFVQTElDQVRFX0xBWUVSLFxuICAgIGlkXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIEFkZEVmZmVjdFVwZGF0ZXJBY3Rpb24gPSB7XG4gIGNvbmZpZzogRWZmZWN0UHJvcHNQYXJ0aWFsO1xufTtcblxuLyoqXG4gKiBBZGQgYSBuZXcgZWZmZWN0XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gY29uZmlnIC0gbmV3IGVmZmVjdCBjb25maWdcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRWZmZWN0KFxuICBjb25maWc6IEVmZmVjdFByb3BzUGFydGlhbFxuKTogTWVyZ2U8QWRkRWZmZWN0VXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5BRERfRUZGRUNUfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkFERF9FRkZFQ1QsXG4gICAgY29uZmlnXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFJlb3JkZXJFZmZlY3RVcGRhdGVyQWN0aW9uID0ge1xuICBvcmRlcjogc3RyaW5nW107XG59O1xuXG4vKipcbiAqIFJlb3JkZXIgZWZmZWN0c1xuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIG9yZGVyIGFuIGFycmF5IG9mIGVmZmVjdCBpZHNcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVvcmRlckVmZmVjdChcbiAgb3JkZXI6IHN0cmluZ1tdXG4pOiBNZXJnZTxSZW9yZGVyRWZmZWN0VXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5SRU9SREVSX0VGRkVDVH0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRU9SREVSX0VGRkVDVCxcbiAgICBvcmRlclxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBSZW1vdmVFZmZlY3RVcGRhdGVyQWN0aW9uID0ge1xuICBpZDogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gZWZmZWN0XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWQgaWR4IG9mIHRoZSBlZmZlY3QgdG8gYmUgcmVtb3ZlZFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVFZmZlY3QoXG4gIGlkOiBzdHJpbmdcbik6IE1lcmdlPFJlbW92ZUVmZmVjdFVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuUkVNT1ZFX0VGRkVDVH0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5SRU1PVkVfRUZGRUNULFxuICAgIGlkXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFVwZGF0ZUVmZmVjdFVwZGF0ZXJBY3Rpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIHByb3BzOiBFZmZlY3RQcm9wc1BhcnRpYWw7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBlZmZlY3RcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBwcm9wcyBpZHggb2YgdGhlIGVmZmVjdCB0byBiZSB1cGRhdGVkIHdpdGggc3BlY2lmaWVkIHByb3BzXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUVmZmVjdChcbiAgaWQ6IHN0cmluZyxcbiAgcHJvcHM6IEVmZmVjdFByb3BzUGFydGlhbFxuKTogTWVyZ2U8VXBkYXRlRWZmZWN0VXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5VUERBVEVfRUZGRUNUfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlVQREFURV9FRkZFQ1QsXG4gICAgaWQsXG4gICAgcHJvcHNcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgUmVtb3ZlRGF0YXNldFVwZGF0ZXJBY3Rpb24gPSB7XG4gIGRhdGFJZDogc3RyaW5nO1xufTtcbi8qKlxuICogUmVtb3ZlIGEgZGF0YXNldCBhbmQgYWxsIGxheWVycywgZmlsdGVycywgdG9vbHRpcCBjb25maWdzIHRoYXQgYmFzZWQgb24gaXRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBkYXRhSWQgZGF0YXNldCBpZFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVEYXRhc2V0KFxuICBkYXRhSWQ6IHN0cmluZ1xuKTogTWVyZ2U8UmVtb3ZlRGF0YXNldFVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuUkVNT1ZFX0RBVEFTRVR9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuUkVNT1ZFX0RBVEFTRVQsXG4gICAgZGF0YUlkXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFNob3dEYXRhc2V0VGFibGVVcGRhdGVyQWN0aW9uID0ge1xuICBkYXRhSWQ6IHN0cmluZztcbn07XG4vKipcbiAqIERpc3BsYXkgZGF0YXNldCB0YWJsZSBpbiBhIG1vZGFsXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZGF0YUlkIGRhdGFzZXQgaWQgdG8gc2hvdyBpbiB0YWJsZVxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93RGF0YXNldFRhYmxlKFxuICBkYXRhSWQ6IHN0cmluZ1xuKTogTWVyZ2U8U2hvd0RhdGFzZXRUYWJsZVVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuU0hPV19EQVRBU0VUX1RBQkxFfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNIT1dfREFUQVNFVF9UQUJMRSxcbiAgICBkYXRhSWRcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVXBkYXRlRGF0YXNldENvbG9yVXBkYXRlciA9IHtcbiAgZGF0YUlkOiBzdHJpbmc7XG4gIG5ld0NvbG9yOiBSR0JDb2xvcjtcbn07XG4vKipcbiAqIFVwZGF0ZSBkYXRhc2V0IGNvbG9yIHRvIGN1c3RvbSBieSBtZWFucyBvZiBjb2xvciBwaWNrZXJcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBkYXRhSWQgZGF0YXNldCBgaWRgIHRoaXMgY3VzdG9tIGNvbG9yIGlzIGFzc29jaWF0ZWQgd2l0aFxuICogQHBhcmFtIG5ld0NvbG9yIGN1c3RvbSBjb2xvciBpbiBSR0Jmb3JtYXRcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlVGFibGVDb2xvcihcbiAgZGF0YUlkOiBzdHJpbmcsXG4gIG5ld0NvbG9yOiBSR0JDb2xvclxuKTogTWVyZ2U8VXBkYXRlRGF0YXNldENvbG9yVXBkYXRlciwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5VUERBVEVfVEFCTEVfQ09MT1J9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVVBEQVRFX1RBQkxFX0NPTE9SLFxuICAgIGRhdGFJZCxcbiAgICBuZXdDb2xvclxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBTb3J0VGFibGVDb2x1bW5VcGRhdGVyQWN0aW9uID0ge1xuICBkYXRhSWQ6IHN0cmluZztcbiAgY29sdW1uOiBzdHJpbmc7XG4gIG1vZGU/OiBzdHJpbmc7XG59O1xuLyoqXG4gKiBTb3J0IGRhdGFzZXQgY29sdW1uLCBmb3IgdGFibGUgZGlzcGxheVxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGRhdGFJZFxuICogQHBhcmFtIGNvbHVtblxuICogQHBhcmFtIG1vZGVcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gc29ydFRhYmxlQ29sdW1uKFxuICBkYXRhSWQ6IHN0cmluZyxcbiAgY29sdW1uOiBzdHJpbmcsXG4gIG1vZGU/OiBzdHJpbmdcbik6IE1lcmdlPFNvcnRUYWJsZUNvbHVtblVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuU09SVF9UQUJMRV9DT0xVTU59PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU09SVF9UQUJMRV9DT0xVTU4sXG4gICAgZGF0YUlkLFxuICAgIGNvbHVtbixcbiAgICBtb2RlXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFBpblRhYmxlQ29sdW1uVXBkYXRlckFjdGlvbiA9IHtcbiAgZGF0YUlkOiBzdHJpbmc7XG4gIGNvbHVtbjogc3RyaW5nO1xufTtcbi8qKlxuICogUGluIGRhdGFzZXQgY29sdW1uLCBmb3IgdGFibGUgZGlzcGxheVxuICogQHBhcmFtIGRhdGFJZFxuICogQHBhcmFtIGNvbHVtblxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaW5UYWJsZUNvbHVtbihcbiAgZGF0YUlkOiBzdHJpbmcsXG4gIGNvbHVtbjogc3RyaW5nXG4pOiBNZXJnZTxQaW5UYWJsZUNvbHVtblVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuUElOX1RBQkxFX0NPTFVNTn0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5QSU5fVEFCTEVfQ09MVU1OLFxuICAgIGRhdGFJZCxcbiAgICBjb2x1bW5cbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgQ29weVRhYmxlQ29sdW1uVXBkYXRlckFjdGlvbiA9IHtcbiAgZGF0YUlkOiBzdHJpbmc7XG4gIGNvbHVtbjogc3RyaW5nO1xufTtcbi8qKlxuICogQ29weSBjb2x1bW4sIGZvciB0YWJsZSBkaXNwbGF5XG4gKiBAcGFyYW0gZGF0YUlkXG4gKiBAcGFyYW0gY29sdW1uXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHlUYWJsZUNvbHVtbihcbiAgZGF0YUlkOiBzdHJpbmcsXG4gIGNvbHVtbjogc3RyaW5nXG4pOiBNZXJnZTxDb3B5VGFibGVDb2x1bW5VcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLkNPUFlfVEFCTEVfQ09MVU1OfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkNPUFlfVEFCTEVfQ09MVU1OLFxuICAgIGRhdGFJZCxcbiAgICBjb2x1bW5cbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgU2V0Q29sdW1uRGlzcGxheUZvcm1hdFVwZGF0ZXJBY3Rpb24gPSB7XG4gIGRhdGFJZDogc3RyaW5nO1xuICBmb3JtYXRzOiB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xuICB9O1xufTtcblxuLyoqXG4gKiBTZXQgY29sdW1uIGRpc3BsYXkgZm9ybWF0XG4gKiBAcGFyYW0gZGF0YUlkXG4gKiBAcGFyYW0gZm9ybWF0c1xuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRDb2x1bW5EaXNwbGF5Rm9ybWF0KFxuICBkYXRhSWQ6IFNldENvbHVtbkRpc3BsYXlGb3JtYXRVcGRhdGVyQWN0aW9uWydkYXRhSWQnXSxcbiAgZm9ybWF0czogU2V0Q29sdW1uRGlzcGxheUZvcm1hdFVwZGF0ZXJBY3Rpb25bJ2Zvcm1hdHMnXVxuKTogTWVyZ2U8XG4gIFNldENvbHVtbkRpc3BsYXlGb3JtYXRVcGRhdGVyQWN0aW9uLFxuICB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlNFVF9DT0xVTU5fRElTUExBWV9GT1JNQVR9XG4+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfQ09MVU1OX0RJU1BMQVlfRk9STUFULFxuICAgIGRhdGFJZCxcbiAgICBmb3JtYXRzXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIEFkZERhdGFUb01hcFVwZGF0ZXJPcHRpb25zID0ge1xuICBjZW50ZXJNYXA/OiBib29sZWFuO1xuICByZWFkT25seT86IGJvb2xlYW47XG4gIGtlZXBFeGlzdGluZ0NvbmZpZz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBVcGRhdGVWaXNEYXRhVXBkYXRlckFjdGlvbiA9IHtcbiAgZGF0YXNldHM6IEFkZERhdGFUb01hcFBheWxvYWRbJ2RhdGFzZXRzJ107XG4gIG9wdGlvbnM6IEFkZERhdGFUb01hcFBheWxvYWRbJ29wdGlvbnMnXTtcbiAgY29uZmlnPzogUGFyc2VkQ29uZmlnO1xufTtcbi8vICogQHBhcmFtIGRhdGFzZXQuaW5mbyAtaW5mbyBvZiBhIGRhdGFzZXRcbi8vICogQHBhcmFtIGRhdGFzZXQuaW5mby5pZCAtIGlkIG9mIHRoaXMgZGF0YXNldC4gSWYgY29uZmlnIGlzIGRlZmluZWQsIGBpZGAgc2hvdWxkIG1hdGNoZXMgdGhlIGBkYXRhSWRgIGluIGNvbmZpZy5cbi8vICogQHBhcmFtIGRhdGFzZXQuaW5mby5sYWJlbCAtIEEgZGlzcGxheSBuYW1lIG9mIHRoaXMgZGF0YXNldFxuLy8gKiBAcGFyYW0gZGF0YXNldC5kYXRhIC0gKioqcmVxdWlyZWQqKiBUaGUgZGF0YSBvYmplY3QsIGluIGEgdGFidWxhciBmb3JtYXQgd2l0aCAyIHByb3BlcnRpZXMgYGZpZWxkc2AgYW5kIGByb3dzYFxuLy8gKiBAcGFyYW0gZGF0YXNldC5kYXRhLmZpZWxkcyAtICoqKnJlcXVpcmVkKiogQXJyYXkgb2YgZmllbGRzLFxuLy8gKiBAcGFyYW0gZGF0YXNldC5kYXRhLmZpZWxkcy5uYW1lIC0gKioqcmVxdWlyZWQqKiBOYW1lIG9mIHRoZSBmaWVsZCxcbi8vICogQHBhcmFtIGRhdGFzZXQuZGF0YS5yb3dzIC0gKioqcmVxdWlyZWQqKiBBcnJheSBvZiByb3dzLCBpbiBhIHRhYnVsYXIgZm9ybWF0IHdpdGggYGZpZWxkc2AgYW5kIGByb3dzYFxuLyoqXG4gKiBBZGQgbmV3IGRhdGFzZXQgdG8gYHZpc1N0YXRlYCwgd2l0aCBvcHRpb24gdG8gbG9hZCBhIG1hcCBjb25maWcgYWxvbmcgd2l0aCB0aGUgZGF0YXNldHNcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBkYXRhc2V0cyAtICoqKnJlcXVpcmVkKiogZGF0YXNldHMgY2FuIGJlIGEgZGF0YXNldCBvciBhbiBhcnJheSBvZiBkYXRhc2V0c1xuICogRWFjaCBkYXRhc2V0IG9iamVjdCBuZWVkcyB0byBoYXZlIGBpbmZvYCBhbmQgYGRhdGFgIHByb3BlcnR5LlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSBvcHRpb25zLmNlbnRlck1hcCBgZGVmYXVsdDogdHJ1ZWAgaWYgYGNlbnRlck1hcGAgaXMgc2V0IHRvIGB0cnVlYCBrZXBsZXIuZ2wgd2lsbFxuICogcGxhY2UgdGhlIG1hcCB2aWV3IHdpdGhpbiB0aGUgZGF0YSBwb2ludHMgYm91bmRhcmllc1xuICogQHBhcmFtIG9wdGlvbnMucmVhZE9ubHkgYGRlZmF1bHQ6IGZhbHNlYCBpZiBgcmVhZE9ubHlgIGlzIHNldCB0byBgdHJ1ZWBcbiAqIHRoZSBsZWZ0IHNldHRpbmcgcGFuZWwgd2lsbCBiZSBoaWRkZW5cbiAqIEBwYXJhbSBjb25maWcgdGhpcyBvYmplY3Qgd2lsbCBjb250YWluIHRoZSBmdWxsIGtlcGxlci5nbCBpbnN0YW5jZSBjb25maWd1cmF0aW9uIHttYXBTdGF0ZSwgbWFwU3R5bGUsIHZpc1N0YXRlfVxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVWaXNEYXRhKFxuICBkYXRhc2V0czogQWRkRGF0YVRvTWFwUGF5bG9hZFsnZGF0YXNldHMnXSxcbiAgb3B0aW9uczogQWRkRGF0YVRvTWFwUGF5bG9hZFsnb3B0aW9ucyddLFxuICBjb25maWc/OiBQYXJzZWRDb25maWdcbik6IE1lcmdlPFVwZGF0ZVZpc0RhdGFVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlVQREFURV9WSVNfREFUQX0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5VUERBVEVfVklTX0RBVEEsXG4gICAgZGF0YXNldHMsXG4gICAgb3B0aW9ucyxcbiAgICBjb25maWdcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgUmVuYW1lRGF0YXNldFVwZGF0ZXJBY3Rpb24gPSB7XG4gIGRhdGFJZDogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xufTtcbi8qKlxuICogUmVuYW1lIGFuIGV4aXN0aW5nIGRhdGFzZXQgaW4gYHZpc1N0YXRlYFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGRhdGFJZCAtICoqKnJlcXVpcmVkKiogSWQgb2YgdGhlIGRhdGFzZXQgdG8gdXBkYXRlXG4gKiBAcGFyYW0gbGFiZWwgLSAqKipyZXF1aXJlZCoqIE5ldyBuYW1lIGZvciB0aGUgZGF0YXNldFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5hbWVEYXRhc2V0KFxuICBkYXRhSWQ6IHN0cmluZyxcbiAgbGFiZWw6IHN0cmluZ1xuKTogTWVyZ2U8UmVuYW1lRGF0YXNldFVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuUkVOQU1FX0RBVEFTRVR9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuUkVOQU1FX0RBVEFTRVQsXG4gICAgZGF0YUlkLFxuICAgIGxhYmVsXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFVwZGF0ZURhdGFzZXRQcm9wc1VwZGF0ZXJBY3Rpb24gPSB7XG4gIGRhdGFJZDogc3RyaW5nO1xuICBwcm9wczoge1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGNvbG9yPzogUkdCQ29sb3I7XG4gICAgbWV0YWRhdGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgfTtcbn07XG4vKipcbiAqIFVwZGF0ZSBhbiBleGlzdGluZyBkYXRhc2V0IHByb3BzIGluIGB2aXNTdGF0ZWBcbiAqIEBwYXJhbSBkYXRhSWQgLSAqKipyZXF1aXJlZCoqIElkIG9mIHRoZSBkYXRhc2V0IHRvIHVwZGF0ZVxuICogQHBhcmFtIHByb3BzIC0gKioqcmVxdWlyZWQqKiBOZXcgcHJvcHMgdG8gdXBkYXRlXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZURhdGFzZXRQcm9wcyhcbiAgZGF0YUlkOiBzdHJpbmcsXG4gIHByb3BzOiB7XG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgY29sb3I/OiBSR0JDb2xvcjtcbiAgICBtZXRhZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICB9XG4pOiBNZXJnZTxVcGRhdGVEYXRhc2V0UHJvcHNVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlVQREFURV9EQVRBU0VUX1BST1BTfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlVQREFURV9EQVRBU0VUX1BST1BTLFxuICAgIGRhdGFJZCxcbiAgICBwcm9wc1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBUb2dnbGVGaWx0ZXJBbmltYXRpb25VcGRhdGVyQWN0aW9uID0ge1xuICBpZHg6IG51bWJlcjtcbn07XG4vKipcbiAqIFN0YXJ0IGFuZCBlbmQgZmlsdGVyIGFuaW1hdGlvblxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIHtOdW1iZXJ9IGlkeCBvZiBmaWx0ZXJcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlRmlsdGVyQW5pbWF0aW9uKFxuICBpZHg6IG51bWJlclxuKTogTWVyZ2U8VG9nZ2xlRmlsdGVyQW5pbWF0aW9uVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5UT0dHTEVfRklMVEVSX0FOSU1BVElPTn0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5UT0dHTEVfRklMVEVSX0FOSU1BVElPTixcbiAgICBpZHhcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVXBkYXRlRmlsdGVyQW5pbWF0aW9uU3BlZWRVcGRhdGVyQWN0aW9uID0ge1xuICBpZHg6IG51bWJlcjtcbiAgc3BlZWQ6IG51bWJlcjtcbn07XG4vKipcbiAqIENoYW5nZSBmaWx0ZXIgYW5pbWF0aW9uIHNwZWVkXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWR4IC0gIGBpZHhgIG9mIGZpbHRlclxuICogQHBhcmFtIHNwZWVkIC0gYHNwZWVkYCB0byBjaGFuZ2UgaXQgdG8uIGBzcGVlZGAgaXMgYSBtdWx0aXBsaWVyXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZUZpbHRlckFuaW1hdGlvblNwZWVkKFxuICBpZHg6IG51bWJlcixcbiAgc3BlZWQ6IG51bWJlclxuKTogTWVyZ2U8XG4gIFVwZGF0ZUZpbHRlckFuaW1hdGlvblNwZWVkVXBkYXRlckFjdGlvbixcbiAge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5VUERBVEVfRklMVEVSX0FOSU1BVElPTl9TUEVFRH1cbj4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlVQREFURV9GSUxURVJfQU5JTUFUSU9OX1NQRUVELFxuICAgIGlkeCxcbiAgICBzcGVlZFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBTZXRBbmltYXRpb25Db25maWdVcGRhdGVyQWN0aW9uID0ge1xuICBjb25maWc6IEFuaW1hdGlvbkNvbmZpZyB8IEZpbHRlckFuaW1hdGlvbkNvbmZpZztcbn07XG4vKipcbiAqIFNldCBhbmltYXRpb24gY29uZmlnOiB3b3JrcyB3aXRoIGJvdGggbGF5ZXIgYW5pbWF0aW9uIGFuZCBmaWx0ZXIgYW5pbWF0aW9uXG4gKiBAcGFyYW0gY29uZmlnXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEFuaW1hdGlvbkNvbmZpZyhcbiAgY29uZmlnOiBBbmltYXRpb25Db25maWcgfCBGaWx0ZXJBbmltYXRpb25Db25maWdcbik6IE1lcmdlPFNldEFuaW1hdGlvbkNvbmZpZ1VwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuU0VUX0FOSU1BVElPTl9DT05GSUd9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0FOSU1BVElPTl9DT05GSUcsXG4gICAgY29uZmlnXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFNldExheWVyQW5pbWF0aW9uVGltZVVwZGF0ZXJBY3Rpb24gPSB7XG4gIHZhbHVlOiBudW1iZXIgfCBudWxsO1xufTtcbi8qKlxuICogUmVzZXQgYW5pbWF0aW9uXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gdmFsdWUgLSAgQ3VycmVudCB2YWx1ZSBvZiB0aGUgc2xpZGVyXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldExheWVyQW5pbWF0aW9uVGltZShcbiAgdmFsdWU6IG51bWJlclxuKTogTWVyZ2U8U2V0TGF5ZXJBbmltYXRpb25UaW1lVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5TRVRfTEFZRVJfQU5JTUFUSU9OX1RJTUV9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0xBWUVSX0FOSU1BVElPTl9USU1FLFxuICAgIHZhbHVlXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFVwZGF0ZUxheWVyQW5pbWF0aW9uU3BlZWRVcGRhdGVyQWN0aW9uID0ge1xuICBzcGVlZDogbnVtYmVyO1xufTtcbi8qKlxuICogdXBkYXRlIHRyaXAgbGF5ZXIgYW5pbWF0aW9uIHNwZWVkXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gc3BlZWQgLSBgc3BlZWRgIHRvIGNoYW5nZSBpdCB0by4gYHNwZWVkYCBpcyBhIG11bHRpcGxpZXJcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTGF5ZXJBbmltYXRpb25TcGVlZChcbiAgc3BlZWQ6IG51bWJlclxuKTogTWVyZ2U8XG4gIFVwZGF0ZUxheWVyQW5pbWF0aW9uU3BlZWRVcGRhdGVyQWN0aW9uLFxuICB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlVQREFURV9MQVlFUl9BTklNQVRJT05fU1BFRUR9XG4+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5VUERBVEVfTEFZRVJfQU5JTUFUSU9OX1NQRUVELFxuICAgIHNwZWVkXG4gIH07XG59XG5leHBvcnQgdHlwZSBUb2dnbGVMYXllckFuaW1hdGlvblVwZGF0ZXJBY3Rpb24gPSB2b2lkO1xuLyoqXG4gKiBzdGFydCBlbmQgZW5kIGxheWVyIGFuaW1hdGlvblxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVMYXllckFuaW1hdGlvbigpOiBNZXJnZTxcbiAgVG9nZ2xlTGF5ZXJBbmltYXRpb25VcGRhdGVyQWN0aW9uLFxuICB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlRPR0dMRV9MQVlFUl9BTklNQVRJT059XG4+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5UT0dHTEVfTEFZRVJfQU5JTUFUSU9OXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFRvZ2dsZUxheWVyQW5pbWF0aW9uQ29udHJvbFVwZGF0ZXJBY3Rpb24gPSB2b2lkO1xuLyoqXG4gKiBoaWRlIGFuZCBzaG93IGxheWVyIGFuaW1hdGlvbiBjb250cm9sXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUxheWVyQW5pbWF0aW9uQ29udHJvbCgpOiBNZXJnZTxcbiAgVG9nZ2xlTGF5ZXJBbmltYXRpb25Db250cm9sVXBkYXRlckFjdGlvbixcbiAge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5UT0dHTEVfTEFZRVJfQU5JTUFUSU9OX0NPTlRST0x9XG4+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5UT0dHTEVfTEFZRVJfQU5JTUFUSU9OX0NPTlRST0xcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgU2V0RmlsdGVyVmlld1VwZGF0ZXJBY3Rpb24gPSB7XG4gIGlkeDogbnVtYmVyO1xuICB2aWV3OiBGaWx0ZXJbJ3ZpZXcnXTtcbn07XG4vKipcbiAqIFNob3cgbGFyZ2VyIHRpbWUgZmlsdGVyIGF0IGJvdHRvbSBmb3IgdGltZSBwbGF5YmFjayAoYXBwbHkgdG8gdGltZSBmaWx0ZXIgb25seSlcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBpZHggLSBpbmRleCBvZiBmaWx0ZXIgdG8gZW5sYXJnZVxuICogQHBhcmFtIHZpZXcgLSB0eXBlIG9mIGZpbHRlciB2aWV3XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEZpbHRlclZpZXcoXG4gIGlkeDogbnVtYmVyLFxuICB2aWV3OiBGaWx0ZXJbJ3ZpZXcnXVxuKTogTWVyZ2U8U2V0RmlsdGVyVmlld1VwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuU0VUX0ZJTFRFUl9WSUVXfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNFVF9GSUxURVJfVklFVyxcbiAgICBpZHgsXG4gICAgdmlld1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBUb2dnbGVGaWx0ZXJGZWF0dXJlVXBkYXRlckFjdGlvbiA9IHtcbiAgaWR4OiBudW1iZXI7XG59O1xuLyoqXG4gKiBTaG93L2hpZGUgZmlsdGVyIGZlYXR1cmUgb24gbWFwXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaWR4IC0gaW5kZXggb2YgZmlsdGVyIGZlYXR1cmUgdG8gc2hvdy9oaWRlXG4gKiBAcmV0dXJuIGFjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlRmlsdGVyRmVhdHVyZShcbiAgaWR4OiBudW1iZXJcbik6IE1lcmdlPFRvZ2dsZUZpbHRlckZlYXR1cmVVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlRPR0dMRV9GSUxURVJfRkVBVFVSRX0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5UT0dHTEVfRklMVEVSX0ZFQVRVUkUsXG4gICAgaWR4XG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIE9uTGF5ZXJIb3ZlclVwZGF0ZXJBY3Rpb24gPSB7XG4gIGluZm86IFBpY2tJbmZvPGFueT4gfCBudWxsO1xuICBtYXBJbmRleD86IG51bWJlcjtcbn07XG4vKipcbiAqIFRyaWdnZXIgbGF5ZXIgaG92ZXIgZXZlbnQgd2l0aCBob3ZlcmVkIG9iamVjdFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGluZm8gLSBPYmplY3QgaG92ZXJlZCwgcmV0dXJuZWQgYnkgZGVjay5nbC5cbiAqIEBwYXJhbSBtYXBJbmRleCAtIE9wdGlvbmFsIHByb3BlcnR5IGZvciBsaW1pdGluZyB0aGUgZGlzcGxheSBvZiB0aGUgYDxNYXBQb3BvdmVyPmAgdG8gdGhlIGA8TWFwQ29udGFpbmVyPmAgdGhlIHVzZXIgaXMgaW50ZXJhY3Rpbmcgd2l0aC5cbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gb25MYXllckhvdmVyKFxuICBpbmZvOiBQaWNrSW5mbzxhbnk+IHwgbnVsbCxcbiAgbWFwSW5kZXg/OiBudW1iZXJcbik6IE1lcmdlPE9uTGF5ZXJIb3ZlclVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTEFZRVJfSE9WRVJ9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTEFZRVJfSE9WRVIsXG4gICAgaW5mbyxcbiAgICBtYXBJbmRleFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBPbkxheWVyQ2xpY2tVcGRhdGVyQWN0aW9uID0ge1xuICBpbmZvOiBQaWNrSW5mbzxhbnk+IHwgbnVsbDtcbn07XG4vKipcbiAqIFRyaWdnZXIgbGF5ZXIgY2xpY2sgZXZlbnQgd2l0aCBjbGlja2VkIG9iamVjdFxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGluZm8gLSBPYmplY3QgY2xpY2tlZCwgcmV0dXJuZWQgYnkgZGVjay5nbFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvbkxheWVyQ2xpY2soXG4gIGluZm86IFBpY2tJbmZvPGFueT4gfCBudWxsXG4pOiBNZXJnZTxPbkxheWVyQ2xpY2tVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLkxBWUVSX0NMSUNLfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX0NMSUNLLFxuICAgIGluZm9cbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgT25NYXBDbGlja1VwZGF0ZXJBY3Rpb24gPSB2b2lkO1xuLyoqXG4gKiBUcmlnZ2VyIG1hcCBjbGljayBldmVudCwgdW5zZWxlY3QgY2xpY2tlZCBvYmplY3RcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gb25NYXBDbGljaygpOiBNZXJnZTxPbk1hcENsaWNrVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5NQVBfQ0xJQ0t9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTUFQX0NMSUNLXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIE9uTW91c2VNb3ZlVXBkYXRlckFjdGlvbiA9IHtcbiAgZXZ0O1xufTtcbi8qKlxuICogVHJpZ2dlciBtYXAgbW91c2UgbW92ZWV2ZW50LCBwYXlsb2FkIHdvdWxkIGJlXG4gKiBSZWFjdC1tYXAtZ2wgTWFwTGF5ZXJNb3VzZUV2ZW50XG4gKiBodHRwczovL3Zpc2dsLmdpdGh1Yi5pby9yZWFjdC1tYXAtZ2wvZG9jcy9hcGktcmVmZXJlbmNlL3R5cGVzI21hcGxheWVybW91c2VldmVudFxuICpcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBldnQgLSBNYXBMYXllck1vdXNlRXZlbnRcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gb25Nb3VzZU1vdmUoXG4gIGV2dFxuKTogTWVyZ2U8T25Nb3VzZU1vdmVVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLk1PVVNFX01PVkV9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTU9VU0VfTU9WRSxcbiAgICBldnRcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVG9nZ2xlTGF5ZXJGb3JNYXBVcGRhdGVyQWN0aW9uID0ge1xuICBtYXBJbmRleDogbnVtYmVyO1xuICBsYXllcklkOiBzdHJpbmc7XG59O1xuLyoqXG4gKiBUb2dnbGUgdmlzaWJpbGl0eSBvZiBhIGxheWVyIGluIGEgc3BsaXQgbWFwXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gbWFwSW5kZXggLSBpbmRleCBvZiB0aGUgc3BsaXQgbWFwXG4gKiBAcGFyYW0gbGF5ZXJJZCAtIGlkIG9mIHRoZSBsYXllclxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVMYXllckZvck1hcChcbiAgbWFwSW5kZXg6IG51bWJlcixcbiAgbGF5ZXJJZDogc3RyaW5nXG4pOiBNZXJnZTxUb2dnbGVMYXllckZvck1hcFVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuVE9HR0xFX0xBWUVSX0ZPUl9NQVB9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuVE9HR0xFX0xBWUVSX0ZPUl9NQVAsXG4gICAgbWFwSW5kZXgsXG4gICAgbGF5ZXJJZFxuICB9O1xufVxuXG50eXBlIEZpbHRlclBsb3ROZXdQcm9wID0ge1xuICB5QXhpcz86IG51bGwgfCBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICBwbG90VHlwZT86IHt0eXBlOiBzdHJpbmd9O1xufTtcbmV4cG9ydCB0eXBlIFNldEZpbHRlclBsb3RVcGRhdGVyQWN0aW9uID0ge1xuICBpZHg6IG51bWJlcjtcbiAgbmV3UHJvcDogRmlsdGVyUGxvdE5ld1Byb3A7XG4gIHZhbHVlSW5kZXg/OiBudW1iZXI7XG59O1xuLyoqXG4gKiBTZXQgdGhlIHByb3BlcnR5IG9mIGEgZmlsdGVyIHBsb3RcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBpZHhcbiAqIEBwYXJhbSBuZXdQcm9wIGtleSB2YWx1ZSBtYXBwaW5nIG9mIG5ldyBwcm9wIGB7eUF4aXM6ICdoaXN0b2dyYW0nfWBcbiAqIEBwYXJhbSB2YWx1ZUluZGV4IGRhdGFJZCBpbmRleFxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGaWx0ZXJQbG90KFxuICBpZHg6IG51bWJlcixcbiAgbmV3UHJvcDogRmlsdGVyUGxvdE5ld1Byb3AsXG4gIHZhbHVlSW5kZXg/OiBudW1iZXJcbik6IE1lcmdlPFNldEZpbHRlclBsb3RVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlNFVF9GSUxURVJfUExPVH0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfRklMVEVSX1BMT1QsXG4gICAgaWR4LFxuICAgIG5ld1Byb3AsXG4gICAgdmFsdWVJbmRleFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBTZXRNYXBJbmZvVXBkYXRlckFjdGlvbiA9IHtcbiAgaW5mbzogYW55O1xufTtcbi8qKlxuICogU2V0IHRoZSBwcm9wZXJ0eSBvZiBhIGZpbHRlciBwbG90XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gaW5mb1xuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXBJbmZvKFxuICBpbmZvOiBhbnlcbik6IE1lcmdlPFNldE1hcEluZm9VcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlNFVF9NQVBfSU5GT30+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfTUFQX0lORk8sXG4gICAgaW5mb1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBMb2FkRmlsZXNVcGRhdGVyQWN0aW9uID0ge1xuICBmaWxlczogRmlsZVtdO1xuICBvbkZpbmlzaD8ocmVzdWx0OiBhbnkpOiBhbnk7XG59O1xuLyoqXG4gKiBUcmlnZ2VyIGZpbGUgbG9hZGluZyBkaXNwYXRjaCBgYWRkRGF0YVRvTWFwYCBpZiBzdWNjZWVkLCBvciBgbG9hZEZpbGVzRXJyYCBpZiBmYWlsZWRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBmaWxlcyBhcnJheSBvZiBmaWxlYmxvYlxuICogQHJldHVybnMgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRmlsZXMoXG4gIGZpbGVzOiBGaWxlW10sXG4gIG9uRmluaXNoPzogKHJlc3VsdDogYW55KSA9PiBhbnlcbik6IE1lcmdlPExvYWRGaWxlc1VwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTE9BRF9GSUxFU30+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MT0FEX0ZJTEVTLFxuICAgIGZpbGVzLFxuICAgIG9uRmluaXNoXG4gIH07XG59XG5cbi8qKlxuICogQ2FsbGVkIHdpdGggbmV4dCBmaWxlIHRvIGxvYWRcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZE5leHRGaWxlKCk6IHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTE9BRF9ORVhUX0ZJTEV9IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MT0FEX05FWFRfRklMRVxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBsb2FkRmlsZXNTdWNjZXNzVXBkYXRlckFjdGlvbiA9IHtcbiAgcmVzdWx0OiBGaWxlQ2FjaGVJdGVtW107XG59O1xuLyoqXG4gKiBjYWxsZWQgd2hlbiBhbGwgZmlsZXMgYXJlIHByb2Nlc3NlZCBhbmQgbG9hZGVkXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gcmVzdWx0XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlc1N1Y2Nlc3MoXG4gIHJlc3VsdDogRmlsZUNhY2hlSXRlbVtdXG4pOiBNZXJnZTxsb2FkRmlsZXNTdWNjZXNzVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5MT0FEX0ZJTEVTX1NVQ0NFU1N9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTE9BRF9GSUxFU19TVUNDRVNTLFxuICAgIHJlc3VsdFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBMb2FkRmlsZVN0ZXBTdWNjZXNzQWN0aW9uID0ge1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICBmaWxlQ2FjaGU6IEZpbGVDYWNoZUl0ZW1bXTtcbn07XG4vKipcbiAqIGNhbGxlZCB3aGVuIHN1Y2Nlc3NmdWxseSBsb2FkZWQgb25lIGZpbGUsIHJlYWR5IHRvIG1vdmUgb24gdG8gdGhlIG5leHQgb25lXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gcmVzdWx0XG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRGaWxlU3RlcFN1Y2Nlc3Moe1xuICBmaWxlTmFtZSxcbiAgZmlsZUNhY2hlXG59OiB7XG4gIGZpbGVOYW1lOiBzdHJpbmc7XG4gIGZpbGVDYWNoZTogRmlsZUNhY2hlSXRlbVtdO1xufSk6IE1lcmdlPExvYWRGaWxlU3RlcFN1Y2Nlc3NBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTE9BRF9GSUxFX1NURVBfU1VDQ0VTU30+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5MT0FEX0ZJTEVfU1RFUF9TVUNDRVNTLFxuICAgIGZpbGVOYW1lLFxuICAgIGZpbGVDYWNoZVxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBMb2FkRmlsZXNFcnJVcGRhdGVyQWN0aW9uID0ge1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICBlcnJvcjogYW55O1xufTtcbi8qKlxuICogVHJpZ2dlciBsb2FkaW5nIGZpbGUgZXJyb3JcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSAgZXJyb3JcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRmlsZXNFcnIoXG4gIGZpbGVOYW1lOiBzdHJpbmcsXG4gIGVycm9yOiBhbnlcbik6IE1lcmdlPExvYWRGaWxlc0VyclVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTE9BRF9GSUxFU19FUlJ9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTE9BRF9GSUxFU19FUlIsXG4gICAgZmlsZU5hbWUsXG4gICAgZXJyb3JcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgU2V0RmVhdHVyZXNVcGRhdGVyQWN0aW9uID0ge1xuICBmZWF0dXJlczogRmVhdHVyZVtdO1xufTtcbi8qKlxuICogU3RvcmUgZmVhdHVyZXMgdG8gc3RhdGVcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBmZWF0dXJlc1xuICogQHJldHVybnMgYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGZWF0dXJlcyhcbiAgZmVhdHVyZXM6IEZlYXR1cmVbXVxuKTogTWVyZ2U8U2V0RmVhdHVyZXNVcGRhdGVyQWN0aW9uLCB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlNFVF9GRUFUVVJFU30+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TRVRfRkVBVFVSRVMsXG4gICAgZmVhdHVyZXNcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgU2V0UG9seWdvbkZpbHRlckxheWVyVXBkYXRlckFjdGlvbiA9IHtcbiAgbGF5ZXI6IExheWVyO1xuICBmZWF0dXJlOiBGZWF0dXJlO1xufTtcbi8qKlxuICogSXQgd2lsbCBhcHBseSB0aGUgcHJvdmlkZSBmZWF0dXJlIGFzIGZpbHRlciB0byB0aGUgZ2l2ZW4gbGF5ZXIuXG4gKiBJZiB0aGUgZ2l2ZW4gZmVhdHVyZSBpcyBhbHJlYWR5IGFwcGxpZWQgYXMgZmlsdGVyIHRvIHRoZSBsYXllciwgaXQgd2lsbCByZW1vdmUgdGhlIGxheWVyIGZyb20gdGhlIGZpbHRlclxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGxheWVyXG4gKiBAcGFyYW0gZmVhdHVyZVxuICogQHJldHVybnMgYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRQb2x5Z29uRmlsdGVyTGF5ZXIoXG4gIGxheWVyOiBMYXllcixcbiAgZmVhdHVyZTogRmVhdHVyZVxuKTogTWVyZ2U8U2V0UG9seWdvbkZpbHRlckxheWVyVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5TRVRfUE9MWUdPTl9GSUxURVJfTEFZRVJ9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX1BPTFlHT05fRklMVEVSX0xBWUVSLFxuICAgIGxheWVyLFxuICAgIGZlYXR1cmVcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgU2V0U2VsZWN0ZWRGZWF0dXJlVXBkYXRlckFjdGlvbiA9IHtcbiAgZmVhdHVyZTogRmVhdHVyZSB8IG51bGw7XG4gIHNlbGVjdGlvbkNvbnRleHQ/OiBGZWF0dXJlU2VsZWN0aW9uQ29udGV4dDtcbn07XG5cbi8qKlxuICogU2V0IHRoZSBjdXJyZW50IGZlYXR1cmUgdG8gYmUgZWRpdGVkL2RlbGV0ZWQsXG4gKiBhbmQgdGhlIGNvbnRleHQgb2YgaG93IHRoZSBmZWF0dXJlIHdhcyBzZWxlY3RlZC5cbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBmZWF0dXJlXG4gKiBAcGFyYW0gc2VsZWN0aW9uQ29udGV4dFxuICogQHJldHVybnMgYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZEZlYXR1cmUoXG4gIGZlYXR1cmU6IEZlYXR1cmUgfCBudWxsLFxuICBzZWxlY3Rpb25Db250ZXh0PzogRmVhdHVyZVNlbGVjdGlvbkNvbnRleHRcbik6IE1lcmdlPFNldFNlbGVjdGVkRmVhdHVyZVVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuU0VUX1NFTEVDVEVEX0ZFQVRVUkV9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX1NFTEVDVEVEX0ZFQVRVUkUsXG4gICAgZmVhdHVyZSxcbiAgICBzZWxlY3Rpb25Db250ZXh0XG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIERlbGV0ZUZlYXR1cmVVcGRhdGVyQWN0aW9uID0ge1xuICBmZWF0dXJlOiBGZWF0dXJlO1xufTtcbi8qKlxuICogRGVsZXRlIHRoZSBnaXZlbiBmZWF0dXJlXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZmVhdHVyZVxuICogQHJldHVybnMgYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVGZWF0dXJlKFxuICBmZWF0dXJlOiBGZWF0dXJlXG4pOiBNZXJnZTxEZWxldGVGZWF0dXJlVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5ERUxFVEVfRkVBVFVSRX0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5ERUxFVEVfRkVBVFVSRSxcbiAgICBmZWF0dXJlXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFNldEVkaXRvck1vZGVVcGRhdGVyQWN0aW9uID0ge1xuICBtb2RlOiBzdHJpbmc7XG59O1xuLyoqIFNldCB0aGUgbWFwIG1vZGVcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBtb2RlIG9uZSBvZiBFRElUT1JfTU9ERVNcbiAqIEByZXR1cm5zIGFjdGlvblxuICogQHB1YmxpY1xuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7c2V0TWFwTW9kZX0gZnJvbSAnQGtlcGxlci5nbC9hY3Rpb25zJztcbiAqIGltcG9ydCB7RURJVE9SX01PREVTfSBmcm9tICdAa2VwbGVyLmdsL2NvbnN0YW50cyc7XG4gKlxuICogdGhpcy5wcm9wcy5kaXNwYXRjaChzZXRNYXBNb2RlKEVESVRPUl9NT0RFUy5EUkFXX1BPTFlHT04pKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEVkaXRvck1vZGUoXG4gIG1vZGU6IHN0cmluZ1xuKTogTWVyZ2U8U2V0RWRpdG9yTW9kZVVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuU0VUX0VESVRPUl9NT0RFfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNFVF9FRElUT1JfTU9ERSxcbiAgICBtb2RlXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIEFwcGx5Q1BVRmlsdGVyVXBkYXRlckFjdGlvbiA9IHtcbiAgZGF0YUlkOiBzdHJpbmcgfCBzdHJpbmdbXTtcbn07XG4vKipcbiAqIFRyaWdnZXIgQ1BVIGZpbHRlciBvZiBzZWxlY3RlZCBkYXRhc2V0XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gZGF0YUlkIC0gc2luZ2xlIGRhdGFJZCBvciBhbiBhcnJheSBvZiBkYXRhSWRzXG4gKiBAcmV0dXJucyBhY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5Q1BVRmlsdGVyKFxuICBkYXRhSWQ6IHN0cmluZyB8IHN0cmluZ1tdXG4pOiBNZXJnZTxBcHBseUNQVUZpbHRlclVwZGF0ZXJBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuQVBQTFlfQ1BVX0ZJTFRFUn0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5BUFBMWV9DUFVfRklMVEVSLFxuICAgIGRhdGFJZFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBUb2dnbGVFZGl0b3JWaXNpYmlsaXR5VXBkYXRlckFjdGlvbiA9IHZvaWQ7XG4vKipcbiAqIFRvZ2dsZSBlZGl0b3IgbGF5ZXIgdmlzaWJpbGl0eVxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHJldHVybiBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUVkaXRvclZpc2liaWxpdHkoKTogTWVyZ2U8XG4gIFRvZ2dsZUVkaXRvclZpc2liaWxpdHlVcGRhdGVyQWN0aW9uLFxuICB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlRPR0dMRV9FRElUT1JfVklTSUJJTElUWX1cbj4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlRPR0dMRV9FRElUT1JfVklTSUJJTElUWVxuICB9O1xufVxuXG50eXBlIEZpbGVDb250ZW50ID0ge1xuICBmaWxlTmFtZTogc3RyaW5nO1xuICBoZWFkZXI6IHN0cmluZ1tdO1xuICBkYXRhOiBhbnk7XG59O1xuZXhwb3J0IHR5cGUgTmV4dEZpbGVCYXRjaFVwZGF0ZXJBY3Rpb24gPSB7XG4gIHBheWxvYWQ6IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuICAgIGdlbjogQXN5bmNHZW5lcmF0b3I8RmlsZUNvbnRlbnQ+O1xuICAgIGZpbGVOYW1lOiBzdHJpbmc7XG4gICAgcHJvZ3Jlc3M/OiBhbnk7XG4gICAgYWNjdW11bGF0ZWQ/OiBhbnk7XG4gICAgb25GaW5pc2g6IChyZXN1bHQ6IGFueSkgPT4gYW55O1xuICB9O1xufTtcbi8qKlxuICogUHJvY2VzcyB0aGUgbmV4dCBmaWxlIGJhdGNoXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gcGF5bG9hZCAtIGJhdGNoIHBheWxvYWRcbiAqIEByZXR1cm4gYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZXh0RmlsZUJhdGNoKFxuICBwYXlsb2FkOiBOZXh0RmlsZUJhdGNoVXBkYXRlckFjdGlvblsncGF5bG9hZCddXG4pOiBNZXJnZTxOZXh0RmlsZUJhdGNoVXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5ORVhUX0ZJTEVfQkFUQ0h9PiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuTkVYVF9GSUxFX0JBVENILFxuICAgIHBheWxvYWRcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgUHJvY2Vzc0ZpbGVDb250ZW50VXBkYXRlckFjdGlvbiA9IHtcbiAgcGF5bG9hZDoge1xuICAgIGNvbnRlbnQ6IEZpbGVDb250ZW50O1xuICAgIGZpbGVDYWNoZTogRmlsZUNhY2hlSXRlbVtdO1xuICB9O1xufTtcbi8qKlxuICogUHJvY2VzcyB0aGUgZmlsZSBjb250ZW50XG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gcGF5bG9hZCAtIHRoZSBmaWxlIGNvbnRlbnRcbiAqIEByZXR1cm4gYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRmlsZUNvbnRlbnQoXG4gIHBheWxvYWQ6IFByb2Nlc3NGaWxlQ29udGVudFVwZGF0ZXJBY3Rpb25bJ3BheWxvYWQnXVxuKTogTWVyZ2U8UHJvY2Vzc0ZpbGVDb250ZW50VXBkYXRlckFjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5QUk9DRVNTX0ZJTEVfQ09OVEVOVH0+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5QUk9DRVNTX0ZJTEVfQ09OVEVOVCxcbiAgICBwYXlsb2FkXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIFNldExheWVyQW5pbWF0aW9uVGltZUNvbmZpZ0FjdGlvbiA9IHtcbiAgY29uZmlnOiB7XG4gICAgdGltZXpvbmU/OiBzdHJpbmc7XG4gICAgdGltZUZvcm1hdD86IHN0cmluZztcbiAgfTtcbn07XG4vKipcbiAqIFNldCBsYXllciBhbmltYXRpb24gdGltZSBmb3JtYXQgYW5kIHRpbWV6b25lXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gY29uZmlnIC0ge3RpbWVGb3JtYXQ6IHN0cmluZywgdGltZXpvbmU6IHN0cmluZ31cbiAqIEByZXR1cm4gYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRMYXllckFuaW1hdGlvblRpbWVDb25maWcoXG4gIGNvbmZpZzogU2V0TGF5ZXJBbmltYXRpb25UaW1lQ29uZmlnQWN0aW9uWydjb25maWcnXVxuKTogTWVyZ2U8XG4gIFNldExheWVyQW5pbWF0aW9uVGltZUNvbmZpZ0FjdGlvbixcbiAge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5TRVRfTEFZRVJfQU5JTUFUSU9OX1RJTUVfQ09ORklHfVxuPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogQWN0aW9uVHlwZXMuU0VUX0xBWUVSX0FOSU1BVElPTl9USU1FX0NPTkZJRyxcbiAgICBjb25maWdcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgU2V0RmlsdGVyQW5pbWF0aW9uVGltZUNvbmZpZ0FjdGlvbiA9IHtcbiAgaWR4OiBudW1iZXI7XG4gIGNvbmZpZzoge1xuICAgIHRpbWV6b25lPzogc3RyaW5nO1xuICAgIHRpbWVGb3JtYXQ/OiBzdHJpbmc7XG4gIH07XG59O1xuLyoqXG4gKiBTZXQgRmlsdGVyIGFuaW1hdGlvbiB0aW1lIGZvcm1hdCBhbmQgdGltZXpvbmVcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBpZHhcbiAqIEBwYXJhbSBjb25maWdcbiAqIEByZXR1cm4gYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRGaWx0ZXJBbmltYXRpb25UaW1lQ29uZmlnKFxuICBpZHg6IFNldEZpbHRlckFuaW1hdGlvblRpbWVDb25maWdBY3Rpb25bJ2lkeCddLFxuICBjb25maWc6IFNldEZpbHRlckFuaW1hdGlvblRpbWVDb25maWdBY3Rpb25bJ2NvbmZpZyddXG4pOiBNZXJnZTxcbiAgU2V0RmlsdGVyQW5pbWF0aW9uVGltZUNvbmZpZ0FjdGlvbixcbiAge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5TRVRfRklMVEVSX0FOSU1BVElPTl9USU1FX0NPTkZJR31cbj4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNFVF9GSUxURVJfQU5JTUFUSU9OX1RJTUVfQ09ORklHLFxuICAgIGlkeCxcbiAgICBjb25maWdcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgTGF5ZXJGaWx0ZXJlZEl0ZW1zQ2hhbmdlQWN0aW9uID0ge1xuICBldmVudDoge1xuICAgIGlkOiBzdHJpbmc7XG4gICAgY291bnQ6IG51bWJlcjtcbiAgfTtcbiAgbGF5ZXI6IExheWVyO1xufTtcblxuLyoqXG4gKiBkZWNrLmdsIGxheWVyIGdwdSBmaWx0ZXIgY2FsbGJhY2tcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBsYXllclxuICogQHBhcmFtIGV2ZW50XG4gKiBAcmV0dXJuIGFjdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5ZXJGaWx0ZXJlZEl0ZW1zQ2hhbmdlKFxuICBsYXllcjogTGF5ZXJGaWx0ZXJlZEl0ZW1zQ2hhbmdlQWN0aW9uWydsYXllciddLFxuICBldmVudDogTGF5ZXJGaWx0ZXJlZEl0ZW1zQ2hhbmdlQWN0aW9uWydldmVudCddXG4pOiBNZXJnZTxMYXllckZpbHRlcmVkSXRlbXNDaGFuZ2VBY3Rpb24sIHt0eXBlOiB0eXBlb2YgQWN0aW9uVHlwZXMuTEFZRVJfRklMVEVSRURfSVRFTVNfQ0hBTkdFfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLkxBWUVSX0ZJTFRFUkVEX0lURU1TX0NIQU5HRSxcbiAgICBsYXllcixcbiAgICBldmVudFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBXTVNGZWF0dXJlSW5mb0FjdGlvbiA9IHtcbiAgbGF5ZXI6IExheWVyO1xuICBmZWF0dXJlSW5mbzogQXJyYXk8e25hbWU6IHN0cmluZzsgdmFsdWU6IHN0cmluZ30+IHwgc3RyaW5nIHwgbnVsbDtcbiAgY29vcmRpbmF0ZT86IFtudW1iZXIsIG51bWJlcl0gfCBudWxsO1xufTtcblxuLyoqXG4gKiBXTVMgbGF5ZXIgZmVhdHVyZSBpbmZvIGNhbGxiYWNrXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gbGF5ZXJcbiAqIEBwYXJhbSBmZWF0dXJlSW5mb1xuICogQHBhcmFtIGNvb3JkaW5hdGVcbiAqIEByZXR1cm4gYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3bXNGZWF0dXJlSW5mbyhcbiAgbGF5ZXI6IFdNU0ZlYXR1cmVJbmZvQWN0aW9uWydsYXllciddLFxuICBmZWF0dXJlSW5mbzogV01TRmVhdHVyZUluZm9BY3Rpb25bJ2ZlYXR1cmVJbmZvJ10sXG4gIGNvb3JkaW5hdGU/OiBXTVNGZWF0dXJlSW5mb0FjdGlvblsnY29vcmRpbmF0ZSddXG4pOiBNZXJnZTxXTVNGZWF0dXJlSW5mb0FjdGlvbiwge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5XTVNfRkVBVFVSRV9JTkZPfT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLldNU19GRUFUVVJFX0lORk8sXG4gICAgbGF5ZXIsXG4gICAgZmVhdHVyZUluZm8sXG4gICAgY29vcmRpbmF0ZVxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBTeW5jVGltZUZpbHRlcldpdGhMYXllclRpbWVsaW5lQWN0aW9uID0ge1xuICBpZHg6IG51bWJlcjtcbiAgZW5hYmxlOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBTeW5jIHRpbWUgZmlsdGVyIHdpdGggbGF5ZXIgdGltZWxpbmVcbiAqIEBtZW1iZXJvZiB2aXNTdGF0ZUFjdGlvbnNcbiAqIEBwYXJhbSBpZHhcbiAqIEBwYXJhbSBlbmFibGVcbiAqIEByZXR1cm4gYWN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzeW5jVGltZUZpbHRlcldpdGhMYXllclRpbWVsaW5lKFxuICBpZHg6IFN5bmNUaW1lRmlsdGVyV2l0aExheWVyVGltZWxpbmVBY3Rpb25bJ2lkeCddLFxuICBlbmFibGU6IFN5bmNUaW1lRmlsdGVyV2l0aExheWVyVGltZWxpbmVBY3Rpb25bJ2VuYWJsZSddXG4pOiBNZXJnZTxcbiAgU3luY1RpbWVGaWx0ZXJXaXRoTGF5ZXJUaW1lbGluZUFjdGlvbixcbiAge3R5cGU6IHR5cGVvZiBBY3Rpb25UeXBlcy5TWU5DX1RJTUVfRklMVEVSX1dJVEhfTEFZRVJfVElNRUxJTkV9XG4+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBBY3Rpb25UeXBlcy5TWU5DX1RJTUVfRklMVEVSX1dJVEhfTEFZRVJfVElNRUxJTkUsXG4gICAgaWR4LFxuICAgIGVuYWJsZVxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBzZXRUaW1lRmlsdGVyU3luY1RpbWVsaW5lTW9kZUFjdGlvbiA9IHtcbiAgaWQ6IHN0cmluZztcbiAgbW9kZTogU3luY1RpbWVsaW5lTW9kZTtcbn07XG5cbi8qKlxuICogU2V0IHRpbWUgZmlsdGVyIHN5bmMgdGltZWxpbmUgbW9kZVxuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIGlkXG4gKiBAcGFyYW0gbW9kZVxuICogQHJldHVybiBhY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRpbWVGaWx0ZXJTeW5jVGltZWxpbmVNb2RlKHtcbiAgaWQsXG4gIG1vZGVcbn06IHNldFRpbWVGaWx0ZXJTeW5jVGltZWxpbmVNb2RlQWN0aW9uKTogTWVyZ2U8XG4gIHNldFRpbWVGaWx0ZXJTeW5jVGltZWxpbmVNb2RlQWN0aW9uLFxuICB7dHlwZTogdHlwZW9mIEFjdGlvblR5cGVzLlNZTkNfVElNRV9GSUxURVJfVElNRUxJTkVfTU9ERX1cbj4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLlNZTkNfVElNRV9GSUxURVJfVElNRUxJTkVfTU9ERSxcbiAgICBpZCxcbiAgICBtb2RlXG4gIH07XG59XG5cbmV4cG9ydCB0eXBlIENyZWF0ZU5ld0RhdGFzZXRTdWNjZXNzUGF5bG9hZCA9IHtcbiAgcmVzdWx0czogKFByb21pc2VGdWxmaWxsZWRSZXN1bHQ8S2VwbGVyVGFibGU+IHwgUHJvbWlzZVJlamVjdGVkUmVzdWx0KVtdO1xuICBhZGRUb01hcE9wdGlvbnM6IEFkZERhdGFUb01hcFBheWxvYWRbJ29wdGlvbnMnXTtcbn07XG5cbi8qKlxuICogQ2FsbGVkIHdoZW4gYSBuZXcgZGF0YXNldCBpcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseSB2aWEgYXN5bmMgdGFibGUgbWV0aG9kc1xuICogQG1lbWJlcm9mIHZpc1N0YXRlQWN0aW9uc1xuICogQHBhcmFtIHBheWxvYWRcbiAqIEBwYXJhbSBwYXlsb2FkLnJlc3VsdHMgLSByZXN1bHRzIG9mIHByb21pc2VzLmFsbFNldHRsdGVkXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgY29uc3QgY3JlYXRlTmV3RGF0YXNldFN1Y2Nlc3MgPSBjcmVhdGVBY3Rpb248Q3JlYXRlTmV3RGF0YXNldFN1Y2Nlc3NQYXlsb2FkPihcbiAgQWN0aW9uVHlwZXMuQ1JFQVRFX05FV19EQVRBU0VUX1NVQ0NFU1Ncbik7XG5cbmV4cG9ydCB0eXBlIFNldExvYWRpbmdJbmRpY2F0b3JQYXlsb2FkID0ge1xuICBjaGFuZ2U6IG51bWJlcjtcbn07XG5cbi8qKlxuICogQ2hhbmdlIG9mIG51bWJlciBvZiBhY3RpdmUgbG9hZGluZyBpdGVtcywgdXNlZCB0byByZW5kZXIgbG9hZGluZyBpbmRpY2F0b3IuXG4gKiBAbWVtYmVyb2YgdmlzU3RhdGVBY3Rpb25zXG4gKiBAcGFyYW0gcGF5bG9hZFxuICogQHBhcmFtIHBheWxvYWQuY2hhbmdlIENoYW5nZSBvZiBudW1iZXIgb2YgYWN0aXZlIGxvYWRpbmcgYWN0aW9ucy5cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IHNldExvYWRpbmdJbmRpY2F0b3IgPSBjcmVhdGVBY3Rpb248U2V0TG9hZGluZ0luZGljYXRvclBheWxvYWQ+KFxuICBBY3Rpb25UeXBlcy5TRVRfTE9BRElOR19JTkRJQ0FUT1Jcbik7XG5cbi8qKlxuICogVGhpcyBkZWNsYXJhdGlvbiBpcyBuZWVkZWQgdG8gZ3JvdXAgYWN0aW9ucyBpbiBkb2NzXG4gKi9cbi8qKlxuICogQWN0aW9ucyBoYW5kbGVkIG1vc3RseSBieSBgdmlzU3RhdGVgIHJlZHVjZXIuXG4gKiBUaGV5IG1hbmFnZSBob3cgZGF0YSBpcyBwcm9jZXNzZWQsIGZpbHRlcmVkIGFuZCBkaXNwbGF5ZWQgb24gdGhlIG1hcCBieSBvcGVyYXRlcyBvbiBsYXllcnMsXG4gKiBmaWx0ZXJzIGFuZCBpbnRlcmFjdGlvbiBzZXR0aW5ncy5cbiAqXG4gKiBAcHVibGljXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyAqL1xuLy8gQHRzLWlnbm9yZVxuY29uc3QgdmlzU3RhdGVBY3Rpb25zID0gbnVsbDtcbi8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzICovXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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