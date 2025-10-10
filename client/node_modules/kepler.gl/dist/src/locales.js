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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMT0NBTEVTIiwiZXhwb3J0cyIsImVuIiwiZmkiLCJwdCIsImVzIiwiY2EiLCJqYSIsImNuIiwicnUiLCJMT0NBTEVfQ09ERVMiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwiYWNjIiwia2V5IiwiX29iamVjdFNwcmVhZCIsIl9kZWZpbmVQcm9wZXJ0eTIiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvbG9jYWxpemF0aW9uL3NyYy9sb2NhbGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmV4cG9ydCBjb25zdCBMT0NBTEVTID0ge1xuICBlbjogJ0VuZ2xpc2gnLFxuICBmaTogJ1N1b21pJyxcbiAgcHQ6ICdQb3J0dWd1w6pzJyxcbiAgZXM6ICdFc3Bhw7FvbCcsXG4gIGNhOiAnQ2F0YWzDoCcsXG4gIGphOiAn5pel5pys6KqeJyxcbiAgY246ICfnroDkvZPkuK3mlocnLFxuICBydTogJ9Cg0YPRgdGB0LrQuNC5J1xufTtcblxuLyoqXG4gKiBMb2NhbGl6YXRpb24gY2FuIGJlIHBhc3NlZCB0byBgS2VwbGVyR2xgIHZpYSB1aVN0YXRlIGBsb2NhbGVgLlxuICogQXZhaWxhYmxlIGxhbmd1YWdlcyBhcmUgYGVuYCBhbmQgYGZpYC4gRGVmYXVsdCBsYW5ndWFnZSBpcyBgZW5gXG4gKiBAY29uc3RhbnRcbiAqIEBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogaW1wb3J0IHtjb21iaW5lUmVkdWNlcnN9IGZyb20gJ3JlZHV4JztcbiAqIGltcG9ydCB7TE9DQUxFX0NPREVTfSBmcm9tICdAa2VwbGVyLmdsL2xvY2FsaXphdGlvbic7XG4gKlxuICogY29uc3QgY3VzdG9taXplZEtlcGxlckdsUmVkdWNlciA9IGtlcGxlckdsUmVkdWNlclxuICogICAuaW5pdGlhbFN0YXRlKHtcbiAqICAgICB1aVN0YXRlOiB7XG4gKiAgICAgICAvLyB1c2UgRmlubmlzaCBsb2NhbGVcbiAqICAgICAgIGxvY2FsZTogTE9DQUxFX0NPREVTLmZpXG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBgYGBcbiAqL1xuXG5leHBvcnQgdHlwZSBMb2NhbGVDb2Rlc1R5cGUgPSB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZztcbn07XG5cbmV4cG9ydCBjb25zdCBMT0NBTEVfQ09ERVM6IExvY2FsZUNvZGVzVHlwZSA9IE9iamVjdC5rZXlzKExPQ0FMRVMpLnJlZHVjZShcbiAgKGFjYywga2V5KSA9PiAoey4uLmFjYywgW2tleV06IGtleX0pLFxuICB7fVxuKTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7O0FBRU8sSUFBTUEsT0FBTyxHQUFBQyxPQUFBLENBQUFELE9BQUEsR0FBRztFQUNyQkUsRUFBRSxFQUFFLFNBQVM7RUFDYkMsRUFBRSxFQUFFLE9BQU87RUFDWEMsRUFBRSxFQUFFLFdBQVc7RUFDZkMsRUFBRSxFQUFFLFNBQVM7RUFDYkMsRUFBRSxFQUFFLFFBQVE7RUFDWkMsRUFBRSxFQUFFLEtBQUs7RUFDVEMsRUFBRSxFQUFFLE1BQU07RUFDVkMsRUFBRSxFQUFFO0FBQ04sQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQU1PLElBQU1DLFlBQTZCLEdBQUFULE9BQUEsQ0FBQVMsWUFBQSxHQUFHQyxNQUFNLENBQUNDLElBQUksQ0FBQ1osT0FBTyxDQUFDLENBQUNhLE1BQU0sQ0FDdEUsVUFBQ0MsR0FBRyxFQUFFQyxHQUFHO0VBQUEsT0FBQUMsYUFBQSxDQUFBQSxhQUFBLEtBQVVGLEdBQUcsV0FBQUcsZ0JBQUEsaUJBQUdGLEdBQUcsRUFBR0EsR0FBRztBQUFBLENBQUUsRUFDcEMsQ0FBQyxDQUNILENBQUMiLCJpZ25vcmVMaXN0IjpbXX0=