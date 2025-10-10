"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LOCALE_CODES = exports.LOCALES = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

var LOCALES = exports.LOCALES = {
  en: 'English',
  fi: 'Suomi',
  pt: 'Português',
  es: 'Español',
  ca: 'Català',
  ja: '日本語',
  cn: '简体中文',
  ru: 'Русский'
};

/**
 * Localization can be passed to `KeplerGl` via uiState `locale`.
 * Available languages are `en` and `fi`. Default language is `en`
 * @constant
 * @public
 * @example
 * ```js
 * import {combineReducers} from 'redux';
 * import {LOCALE_CODES} from '@kepler.gl/localization';
 *
 * const customizedKeplerGlReducer = keplerGlReducer
 *   .initialState({
 *     uiState: {
 *       // use Finnish locale
 *       locale: LOCALE_CODES.fi
 *     }
 *   });
 *
 * ```
 */

var LOCALE_CODES = exports.LOCALE_CODES = Object.keys(LOCALES).reduce(function (acc, key) {
  return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, key, key));
}, {});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMT0NBTEVTIiwiZXhwb3J0cyIsImVuIiwiZmkiLCJwdCIsImVzIiwiY2EiLCJqYSIsImNuIiwicnUiLCJMT0NBTEVfQ09ERVMiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwiYWNjIiwia2V5IiwiX29iamVjdFNwcmVhZCIsIl9kZWZpbmVQcm9wZXJ0eTIiXSwic291cmNlcyI6WyIuLi9zcmMvbG9jYWxlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4vLyBDb3B5cmlnaHQgY29udHJpYnV0b3JzIHRvIHRoZSBrZXBsZXIuZ2wgcHJvamVjdFxuXG5leHBvcnQgY29uc3QgTE9DQUxFUyA9IHtcbiAgZW46ICdFbmdsaXNoJyxcbiAgZmk6ICdTdW9taScsXG4gIHB0OiAnUG9ydHVndcOqcycsXG4gIGVzOiAnRXNwYcOxb2wnLFxuICBjYTogJ0NhdGFsw6AnLFxuICBqYTogJ+aXpeacrOiqnicsXG4gIGNuOiAn566A5L2T5Lit5paHJyxcbiAgcnU6ICfQoNGD0YHRgdC60LjQuSdcbn07XG5cbi8qKlxuICogTG9jYWxpemF0aW9uIGNhbiBiZSBwYXNzZWQgdG8gYEtlcGxlckdsYCB2aWEgdWlTdGF0ZSBgbG9jYWxlYC5cbiAqIEF2YWlsYWJsZSBsYW5ndWFnZXMgYXJlIGBlbmAgYW5kIGBmaWAuIERlZmF1bHQgbGFuZ3VhZ2UgaXMgYGVuYFxuICogQGNvbnN0YW50XG4gKiBAcHVibGljXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIGltcG9ydCB7Y29tYmluZVJlZHVjZXJzfSBmcm9tICdyZWR1eCc7XG4gKiBpbXBvcnQge0xPQ0FMRV9DT0RFU30gZnJvbSAnQGtlcGxlci5nbC9sb2NhbGl6YXRpb24nO1xuICpcbiAqIGNvbnN0IGN1c3RvbWl6ZWRLZXBsZXJHbFJlZHVjZXIgPSBrZXBsZXJHbFJlZHVjZXJcbiAqICAgLmluaXRpYWxTdGF0ZSh7XG4gKiAgICAgdWlTdGF0ZToge1xuICogICAgICAgLy8gdXNlIEZpbm5pc2ggbG9jYWxlXG4gKiAgICAgICBsb2NhbGU6IExPQ0FMRV9DT0RFUy5maVxuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogYGBgXG4gKi9cblxuZXhwb3J0IHR5cGUgTG9jYWxlQ29kZXNUeXBlID0ge1xuICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgY29uc3QgTE9DQUxFX0NPREVTOiBMb2NhbGVDb2Rlc1R5cGUgPSBPYmplY3Qua2V5cyhMT0NBTEVTKS5yZWR1Y2UoXG4gIChhY2MsIGtleSkgPT4gKHsuLi5hY2MsIFtrZXldOiBrZXl9KSxcbiAge31cbik7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBOztBQUVPLElBQU1BLE9BQU8sR0FBQUMsT0FBQSxDQUFBRCxPQUFBLEdBQUc7RUFDckJFLEVBQUUsRUFBRSxTQUFTO0VBQ2JDLEVBQUUsRUFBRSxPQUFPO0VBQ1hDLEVBQUUsRUFBRSxXQUFXO0VBQ2ZDLEVBQUUsRUFBRSxTQUFTO0VBQ2JDLEVBQUUsRUFBRSxRQUFRO0VBQ1pDLEVBQUUsRUFBRSxLQUFLO0VBQ1RDLEVBQUUsRUFBRSxNQUFNO0VBQ1ZDLEVBQUUsRUFBRTtBQUNOLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFNTyxJQUFNQyxZQUE2QixHQUFBVCxPQUFBLENBQUFTLFlBQUEsR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUNaLE9BQU8sQ0FBQyxDQUFDYSxNQUFNLENBQ3RFLFVBQUNDLEdBQUcsRUFBRUMsR0FBRztFQUFBLE9BQUFDLGFBQUEsQ0FBQUEsYUFBQSxLQUFVRixHQUFHLFdBQUFHLGdCQUFBLGlCQUFHRixHQUFHLEVBQUdBLEdBQUc7QUFBQSxDQUFFLEVBQ3BDLENBQUMsQ0FDSCxDQUFDIiwiaWdub3JlTGlzdCI6W119