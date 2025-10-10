"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapTo = exports.unwrap = exports.isForwardAction = exports.getActionForwardAddress = exports.forwardTo = exports._updateProperty = exports._actionFor = exports.FORWARD = exports.ADDRESS_PREFIX = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _curry = _interopRequireDefault(require("lodash/curry"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

var FORWARD = exports.FORWARD = '@redux-forward/FORWARD';
var ADDRESS_PREFIX = exports.ADDRESS_PREFIX = '@@KG_';
var getActionForwardAddress = exports.getActionForwardAddress = function getActionForwardAddress(id) {
  return "".concat(ADDRESS_PREFIX).concat(id.toUpperCase());
};

/**
 * Wrap an action into a forward action that only modify the state of a specific
 * kepler.gl instance. kepler.gl reducer will look for signatures in the action to
 * determine whether it needs to be forwarded to a specific instance reducer.
 *
 * wrapTo can be curried. You can create a curried action wrapper by only supply the `id` argument
 *
 * A forward action looks like this
 * ```js
 *  {
 *    type: "@@kepler.gl/LAYER_CONFIG_CHANGE",
 *    payload: {
 *      type: '@@kepler.gl/LAYER_CONFIG_CHANGE',
 *      payload: {},
 *      meta: {
 *       // id of instance
 *        _id_: id
 *       // other meta
 *      }
 *    },
 *    meta: {
 *      _forward_: '@redux-forward/FORWARD',
 *      _addr_: '@@KG_id'
 *    }
 *  };
 * ```
 *
 * @memberof forwardActions
 * @param {string} id - The id to forward to
 * @param {Object} action - the action object {type: string, payload: *}
 * @returns {{type: string, payload: {type: string, payload: *, meta: {_id_: string}, meta: {_forward_: string, _addr_: string}}}}
 * @public
 * @example
 *
 * import {wrapTo, togglePerspective} from '@kepler.gl/actions';
 *
 * // This action will only dispatch to the KeplerGl instance with `id: map_1`
 * this.props.dispatch(wrapTo('map_1', togglePerspective()));
 *
 * // You can also create a curried action for each instance
 * const wrapToMap1 = wrapTo('map_1');
 * this.props.dispatch(wrapToMap1(togglePerspective()));
 */
var wrapTo = exports.wrapTo = (0, _curry["default"])(function (id, action) {
  return {
    // keep original action.type
    type: action.type,
    // actual action
    payload: _objectSpread(_objectSpread({}, action), {}, {
      meta: _objectSpread(_objectSpread({}, action.meta), {}, {
        _id_: id
      })
    }),
    // add forward signature to meta
    meta: _objectSpread(_objectSpread({}, action.meta || {}), {}, {
      _forward_: FORWARD,
      _addr_: getActionForwardAddress(id)
    })
  };
});

/**
 * Whether an action is a forward action
 * @memberof forwardActions
 * @param {Object} action - the action object
 * @returns {boolean} boolean - whether the action is a forward action
 * @public
 */
var isForwardAction = exports.isForwardAction = function isForwardAction(action) {
  return Boolean(action && action.meta && action.meta._forward_ === FORWARD);
};

/**
 * Unwrap an action
 * @memberof forwardActions
 * @param {Object} action - the action object
 * @returns {Object} - unwrapped action
 * @public
 */
var _unwrap = exports.unwrap = function unwrap(action) {
  return isForwardAction(action) ? _unwrap(action.payload) : action;
};

/**
 * Given an id, returns the action for that id.
 * If the action is not a forward action, return the action
 * @memberof forwardActions
 * @param {String} id
 * @param {Object} action
 * @private
 */
var _actionFor = exports._actionFor = function _actionFor(id, action) {
  var _action$meta;
  return isForwardAction(action) ? ((_action$meta = action.meta) === null || _action$meta === void 0 ? void 0 : _action$meta._addr_) === getActionForwardAddress(id) ? action.payload : {} : action;
};

/**
 * Returns an action dispatcher that wraps and forwards the actions to a specific instance
 * @memberof forwardActions
 * @param {string} id - instance id
 * @param {Function} dispatch - action dispatcher
 * @public
 * @example
 *
 * // action and forward dispatcher
 * import {toggleSplitMap, forwardTo} from '@kepler.gl/actions';
 * import {connect} from 'react-redux';
 *
 * const MapContainer = props => (
 *  <div>
 *   <button onClick={() => props.keplerGlDispatch(toggleSplitMap())}/>
 *  </div>
 * )
 *
 * const mapDispatchToProps = (dispatch, props) => ({
 *  dispatch,
 *  keplerGlDispatch: forwardTo(‘foo’, dispatch)
 * });
 *
 * export default connect(
 *  state => state,
 *  mapDispatchToProps
 * )(MapContainer);
 */
var forwardTo = exports.forwardTo = function forwardTo(id, dispatch) {
  return function (action) {
    return dispatch(wrapTo(id, action));
  };
};

/**
 * Update the state of a kepler.gl instance
 * @memberof forwardActions
 * @param {Object} state
 * @param {string} id
 * @param {Object} nextState
 * @private
 */
var _updateProperty = exports._updateProperty = function _updateProperty(state, id, nextState) {
  return state[id] === nextState ? state : _objectSpread(_objectSpread({}, state), {}, (0, _defineProperty2["default"])({}, id, nextState));
};

/**
 * This declaration is needed to group actions in docs
 */
/**
 * A set of helpers to forward dispatch actions to a specific instance reducer
 * @public
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
var forwardActions = null;
/* eslint-enable @typescript-eslint/no-unused-vars */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfY3VycnkiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIm93bktleXMiLCJlIiwiciIsInQiLCJPYmplY3QiLCJrZXlzIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzIiwibyIsImZpbHRlciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJwdXNoIiwiYXBwbHkiLCJfb2JqZWN0U3ByZWFkIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiZm9yRWFjaCIsIl9kZWZpbmVQcm9wZXJ0eTIiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIiwiZGVmaW5lUHJvcGVydGllcyIsImRlZmluZVByb3BlcnR5IiwiRk9SV0FSRCIsImV4cG9ydHMiLCJBRERSRVNTX1BSRUZJWCIsImdldEFjdGlvbkZvcndhcmRBZGRyZXNzIiwiaWQiLCJjb25jYXQiLCJ0b1VwcGVyQ2FzZSIsIndyYXBUbyIsImN1cnJ5IiwiYWN0aW9uIiwidHlwZSIsInBheWxvYWQiLCJtZXRhIiwiX2lkXyIsIl9mb3J3YXJkXyIsIl9hZGRyXyIsImlzRm9yd2FyZEFjdGlvbiIsIkJvb2xlYW4iLCJ1bndyYXAiLCJfYWN0aW9uRm9yIiwiX2FjdGlvbiRtZXRhIiwiZm9yd2FyZFRvIiwiZGlzcGF0Y2giLCJfdXBkYXRlUHJvcGVydHkiLCJzdGF0ZSIsIm5leHRTdGF0ZSIsImZvcndhcmRBY3Rpb25zIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvc3JjL2FjdGlvbi13cmFwcGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmV4cG9ydCBjb25zdCBGT1JXQVJEID0gJ0ByZWR1eC1mb3J3YXJkL0ZPUldBUkQnO1xuZXhwb3J0IGNvbnN0IEFERFJFU1NfUFJFRklYID0gJ0BAS0dfJztcbmltcG9ydCB7RGlzcGF0Y2h9IGZyb20gJ3JlZHV4JztcbmltcG9ydCB7QWN0aW9uVHlwZXN9IGZyb20gJy4vYWN0aW9uLXR5cGVzJztcblxuaW1wb3J0IGN1cnJ5IGZyb20gJ2xvZGFzaC9jdXJyeSc7XG5cbmludGVyZmFjZSBJS2VwbGVyR2xBY3Rpb24ge1xuICB0eXBlOiAodHlwZW9mIEFjdGlvblR5cGVzKVtrZXlvZiB0eXBlb2YgQWN0aW9uVHlwZXNdO1xuICAvLyBUT0RPOiBDb25zdHJ1Y3QgYSB0eXBlIGRlcGVuZGluZyBvbiB0aGUgcGF5bG9hZFxuICBwYXlsb2FkPzogYW55O1xuICBtZXRhPzoge1xuICAgIF9mb3J3YXJkXz86IHN0cmluZztcbiAgICBfYWRkcl8/OiBzdHJpbmc7XG4gICAgX2lkXz86IHN0cmluZztcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBnZXRBY3Rpb25Gb3J3YXJkQWRkcmVzcyA9IChpZDogc3RyaW5nKSA9PiBgJHtBRERSRVNTX1BSRUZJWH0ke2lkLnRvVXBwZXJDYXNlKCl9YDtcblxuLyoqXG4gKiBXcmFwIGFuIGFjdGlvbiBpbnRvIGEgZm9yd2FyZCBhY3Rpb24gdGhhdCBvbmx5IG1vZGlmeSB0aGUgc3RhdGUgb2YgYSBzcGVjaWZpY1xuICoga2VwbGVyLmdsIGluc3RhbmNlLiBrZXBsZXIuZ2wgcmVkdWNlciB3aWxsIGxvb2sgZm9yIHNpZ25hdHVyZXMgaW4gdGhlIGFjdGlvbiB0b1xuICogZGV0ZXJtaW5lIHdoZXRoZXIgaXQgbmVlZHMgdG8gYmUgZm9yd2FyZGVkIHRvIGEgc3BlY2lmaWMgaW5zdGFuY2UgcmVkdWNlci5cbiAqXG4gKiB3cmFwVG8gY2FuIGJlIGN1cnJpZWQuIFlvdSBjYW4gY3JlYXRlIGEgY3VycmllZCBhY3Rpb24gd3JhcHBlciBieSBvbmx5IHN1cHBseSB0aGUgYGlkYCBhcmd1bWVudFxuICpcbiAqIEEgZm9yd2FyZCBhY3Rpb24gbG9va3MgbGlrZSB0aGlzXG4gKiBgYGBqc1xuICogIHtcbiAqICAgIHR5cGU6IFwiQEBrZXBsZXIuZ2wvTEFZRVJfQ09ORklHX0NIQU5HRVwiLFxuICogICAgcGF5bG9hZDoge1xuICogICAgICB0eXBlOiAnQEBrZXBsZXIuZ2wvTEFZRVJfQ09ORklHX0NIQU5HRScsXG4gKiAgICAgIHBheWxvYWQ6IHt9LFxuICogICAgICBtZXRhOiB7XG4gKiAgICAgICAvLyBpZCBvZiBpbnN0YW5jZVxuICogICAgICAgIF9pZF86IGlkXG4gKiAgICAgICAvLyBvdGhlciBtZXRhXG4gKiAgICAgIH1cbiAqICAgIH0sXG4gKiAgICBtZXRhOiB7XG4gKiAgICAgIF9mb3J3YXJkXzogJ0ByZWR1eC1mb3J3YXJkL0ZPUldBUkQnLFxuICogICAgICBfYWRkcl86ICdAQEtHX2lkJ1xuICogICAgfVxuICogIH07XG4gKiBgYGBcbiAqXG4gKiBAbWVtYmVyb2YgZm9yd2FyZEFjdGlvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIFRoZSBpZCB0byBmb3J3YXJkIHRvXG4gKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIC0gdGhlIGFjdGlvbiBvYmplY3Qge3R5cGU6IHN0cmluZywgcGF5bG9hZDogKn1cbiAqIEByZXR1cm5zIHt7dHlwZTogc3RyaW5nLCBwYXlsb2FkOiB7dHlwZTogc3RyaW5nLCBwYXlsb2FkOiAqLCBtZXRhOiB7X2lkXzogc3RyaW5nfSwgbWV0YToge19mb3J3YXJkXzogc3RyaW5nLCBfYWRkcl86IHN0cmluZ319fX1cbiAqIEBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKlxuICogaW1wb3J0IHt3cmFwVG8sIHRvZ2dsZVBlcnNwZWN0aXZlfSBmcm9tICdAa2VwbGVyLmdsL2FjdGlvbnMnO1xuICpcbiAqIC8vIFRoaXMgYWN0aW9uIHdpbGwgb25seSBkaXNwYXRjaCB0byB0aGUgS2VwbGVyR2wgaW5zdGFuY2Ugd2l0aCBgaWQ6IG1hcF8xYFxuICogdGhpcy5wcm9wcy5kaXNwYXRjaCh3cmFwVG8oJ21hcF8xJywgdG9nZ2xlUGVyc3BlY3RpdmUoKSkpO1xuICpcbiAqIC8vIFlvdSBjYW4gYWxzbyBjcmVhdGUgYSBjdXJyaWVkIGFjdGlvbiBmb3IgZWFjaCBpbnN0YW5jZVxuICogY29uc3Qgd3JhcFRvTWFwMSA9IHdyYXBUbygnbWFwXzEnKTtcbiAqIHRoaXMucHJvcHMuZGlzcGF0Y2god3JhcFRvTWFwMSh0b2dnbGVQZXJzcGVjdGl2ZSgpKSk7XG4gKi9cbmV4cG9ydCBjb25zdCB3cmFwVG8gPSBjdXJyeSgoaWQ6IHN0cmluZywgYWN0aW9uOiBJS2VwbGVyR2xBY3Rpb24pID0+ICh7XG4gIC8vIGtlZXAgb3JpZ2luYWwgYWN0aW9uLnR5cGVcbiAgdHlwZTogYWN0aW9uLnR5cGUsXG5cbiAgLy8gYWN0dWFsIGFjdGlvblxuICBwYXlsb2FkOiB7XG4gICAgLi4uYWN0aW9uLFxuICAgIG1ldGE6IHtcbiAgICAgIC4uLmFjdGlvbi5tZXRhLFxuICAgICAgX2lkXzogaWRcbiAgICB9XG4gIH0sXG5cbiAgLy8gYWRkIGZvcndhcmQgc2lnbmF0dXJlIHRvIG1ldGFcbiAgbWV0YToge1xuICAgIC4uLihhY3Rpb24ubWV0YSB8fCB7fSksXG4gICAgX2ZvcndhcmRfOiBGT1JXQVJELFxuICAgIF9hZGRyXzogZ2V0QWN0aW9uRm9yd2FyZEFkZHJlc3MoaWQpXG4gIH1cbn0pKTtcblxuLyoqXG4gKiBXaGV0aGVyIGFuIGFjdGlvbiBpcyBhIGZvcndhcmQgYWN0aW9uXG4gKiBAbWVtYmVyb2YgZm9yd2FyZEFjdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gLSB0aGUgYWN0aW9uIG9iamVjdFxuICogQHJldHVybnMge2Jvb2xlYW59IGJvb2xlYW4gLSB3aGV0aGVyIHRoZSBhY3Rpb24gaXMgYSBmb3J3YXJkIGFjdGlvblxuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgaXNGb3J3YXJkQWN0aW9uID0gKGFjdGlvbjogSUtlcGxlckdsQWN0aW9uKSA9PiB7XG4gIHJldHVybiBCb29sZWFuKGFjdGlvbiAmJiBhY3Rpb24ubWV0YSAmJiBhY3Rpb24ubWV0YS5fZm9yd2FyZF8gPT09IEZPUldBUkQpO1xufTtcblxuLyoqXG4gKiBVbndyYXAgYW4gYWN0aW9uXG4gKiBAbWVtYmVyb2YgZm9yd2FyZEFjdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gLSB0aGUgYWN0aW9uIG9iamVjdFxuICogQHJldHVybnMge09iamVjdH0gLSB1bndyYXBwZWQgYWN0aW9uXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCB1bndyYXAgPSAoYWN0aW9uOiBJS2VwbGVyR2xBY3Rpb24pID0+XG4gIGlzRm9yd2FyZEFjdGlvbihhY3Rpb24pID8gdW53cmFwKGFjdGlvbi5wYXlsb2FkKSA6IGFjdGlvbjtcblxuLyoqXG4gKiBHaXZlbiBhbiBpZCwgcmV0dXJucyB0aGUgYWN0aW9uIGZvciB0aGF0IGlkLlxuICogSWYgdGhlIGFjdGlvbiBpcyBub3QgYSBmb3J3YXJkIGFjdGlvbiwgcmV0dXJuIHRoZSBhY3Rpb25cbiAqIEBtZW1iZXJvZiBmb3J3YXJkQWN0aW9uc1xuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgX2FjdGlvbkZvciA9IChpZDogc3RyaW5nLCBhY3Rpb246IElLZXBsZXJHbEFjdGlvbikgPT5cbiAgaXNGb3J3YXJkQWN0aW9uKGFjdGlvbilcbiAgICA/IGFjdGlvbi5tZXRhPy5fYWRkcl8gPT09IGdldEFjdGlvbkZvcndhcmRBZGRyZXNzKGlkKVxuICAgICAgPyBhY3Rpb24ucGF5bG9hZFxuICAgICAgOiB7fVxuICAgIDogYWN0aW9uO1xuXG4vKipcbiAqIFJldHVybnMgYW4gYWN0aW9uIGRpc3BhdGNoZXIgdGhhdCB3cmFwcyBhbmQgZm9yd2FyZHMgdGhlIGFjdGlvbnMgdG8gYSBzcGVjaWZpYyBpbnN0YW5jZVxuICogQG1lbWJlcm9mIGZvcndhcmRBY3Rpb25zXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBpbnN0YW5jZSBpZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGlzcGF0Y2ggLSBhY3Rpb24gZGlzcGF0Y2hlclxuICogQHB1YmxpY1xuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBhY3Rpb24gYW5kIGZvcndhcmQgZGlzcGF0Y2hlclxuICogaW1wb3J0IHt0b2dnbGVTcGxpdE1hcCwgZm9yd2FyZFRvfSBmcm9tICdAa2VwbGVyLmdsL2FjdGlvbnMnO1xuICogaW1wb3J0IHtjb25uZWN0fSBmcm9tICdyZWFjdC1yZWR1eCc7XG4gKlxuICogY29uc3QgTWFwQ29udGFpbmVyID0gcHJvcHMgPT4gKFxuICogIDxkaXY+XG4gKiAgIDxidXR0b24gb25DbGljaz17KCkgPT4gcHJvcHMua2VwbGVyR2xEaXNwYXRjaCh0b2dnbGVTcGxpdE1hcCgpKX0vPlxuICogIDwvZGl2PlxuICogKVxuICpcbiAqIGNvbnN0IG1hcERpc3BhdGNoVG9Qcm9wcyA9IChkaXNwYXRjaCwgcHJvcHMpID0+ICh7XG4gKiAgZGlzcGF0Y2gsXG4gKiAga2VwbGVyR2xEaXNwYXRjaDogZm9yd2FyZFRvKOKAmGZvb+KAmSwgZGlzcGF0Y2gpXG4gKiB9KTtcbiAqXG4gKiBleHBvcnQgZGVmYXVsdCBjb25uZWN0KFxuICogIHN0YXRlID0+IHN0YXRlLFxuICogIG1hcERpc3BhdGNoVG9Qcm9wc1xuICogKShNYXBDb250YWluZXIpO1xuICovXG5leHBvcnQgY29uc3QgZm9yd2FyZFRvID1cbiAgKGlkOiBzdHJpbmcsIGRpc3BhdGNoOiBEaXNwYXRjaDxJS2VwbGVyR2xBY3Rpb24+KSA9PiAoYWN0aW9uOiBJS2VwbGVyR2xBY3Rpb24pID0+XG4gICAgZGlzcGF0Y2god3JhcFRvKGlkLCBhY3Rpb24pKTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIHN0YXRlIG9mIGEga2VwbGVyLmdsIGluc3RhbmNlXG4gKiBAbWVtYmVyb2YgZm9yd2FyZEFjdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdGF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gbmV4dFN0YXRlXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgY29uc3QgX3VwZGF0ZVByb3BlcnR5ID0gKHN0YXRlLCBpZDogc3RyaW5nLCBuZXh0U3RhdGUpID0+XG4gIHN0YXRlW2lkXSA9PT0gbmV4dFN0YXRlXG4gICAgPyBzdGF0ZVxuICAgIDoge1xuICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgW2lkXTogbmV4dFN0YXRlXG4gICAgICB9O1xuXG4vKipcbiAqIFRoaXMgZGVjbGFyYXRpb24gaXMgbmVlZGVkIHRvIGdyb3VwIGFjdGlvbnMgaW4gZG9jc1xuICovXG4vKipcbiAqIEEgc2V0IG9mIGhlbHBlcnMgdG8gZm9yd2FyZCBkaXNwYXRjaCBhY3Rpb25zIHRvIGEgc3BlY2lmaWMgaW5zdGFuY2UgcmVkdWNlclxuICogQHB1YmxpY1xuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnMgKi9cbi8vIEB0cy1pZ25vcmVcbmNvbnN0IGZvcndhcmRBY3Rpb25zID0gbnVsbDtcbi8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzICovXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBUUEsSUFBQUEsTUFBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBQWlDLFNBQUFDLFFBQUFDLENBQUEsRUFBQUMsQ0FBQSxRQUFBQyxDQUFBLEdBQUFDLE1BQUEsQ0FBQUMsSUFBQSxDQUFBSixDQUFBLE9BQUFHLE1BQUEsQ0FBQUUscUJBQUEsUUFBQUMsQ0FBQSxHQUFBSCxNQUFBLENBQUFFLHFCQUFBLENBQUFMLENBQUEsR0FBQUMsQ0FBQSxLQUFBSyxDQUFBLEdBQUFBLENBQUEsQ0FBQUMsTUFBQSxXQUFBTixDQUFBLFdBQUFFLE1BQUEsQ0FBQUssd0JBQUEsQ0FBQVIsQ0FBQSxFQUFBQyxDQUFBLEVBQUFRLFVBQUEsT0FBQVAsQ0FBQSxDQUFBUSxJQUFBLENBQUFDLEtBQUEsQ0FBQVQsQ0FBQSxFQUFBSSxDQUFBLFlBQUFKLENBQUE7QUFBQSxTQUFBVSxjQUFBWixDQUFBLGFB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