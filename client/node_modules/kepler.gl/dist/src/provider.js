"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.KEPLER_FORMAT = exports.FILE_CONFLICT_MSG = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _upload = _interopRequireDefault(require("./upload"));
// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

var NAME = 'cloud-provider';
var DISPLAY_NAME = 'Cloud Provider';
var THUMBNAIL = {
  width: 300,
  height: 200
};
var ICON = _upload["default"];
var KEPLER_FORMAT = exports.KEPLER_FORMAT = 'keplergl';
var FILE_CONFLICT_MSG = exports.FILE_CONFLICT_MSG = 'file_conflict';

/**
 * The default provider class
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.displayName
 * @param {React.Component} props.icon - React element
 * @param {object} props.thumbnail - thumbnail size object
 * @param {number} props.thumbnail.width - thumbnail width in pixels
 * @param {number} props.thumbnail.height - thumbnail height in pixels
 * @public
 * @example
 *
 * const myProvider = new Provider({
 *  name: 'foo',
 *  displayName: 'Foo Storage'
 *  icon: Icon,
 *  thumbnail: {width: 300, height: 200}
 * })
 */
var Provider = exports["default"] = /*#__PURE__*/function () {
  function Provider(props) {
    (0, _classCallCheck2["default"])(this, Provider);
    (0, _defineProperty2["default"])(this, "name", void 0);
    (0, _defineProperty2["default"])(this, "displayName", void 0);
    (0, _defineProperty2["default"])(this, "storageMessage", void 0);
    (0, _defineProperty2["default"])(this, "icon", void 0);
    (0, _defineProperty2["default"])(this, "thumbnail", void 0);
    (0, _defineProperty2["default"])(this, "isNew", false);
    this.name = props.name || NAME;
    this.displayName = props.displayName || DISPLAY_NAME;
    this.storageMessage = props.storageMessage;
    this.icon = props.icon || ICON;
    this.thumbnail = props.thumbnail || THUMBNAIL;
  }

  /**
   * Whether this provider support upload map to a private storage. If truthy, user will be displayed with the storage save icon on the top right of the side bar.
   * @returns
   * @public
   */
  return (0, _createClass2["default"])(Provider, [{
    key: "hasPrivateStorage",
    value: function hasPrivateStorage() {
      return true;
    }

    /**
     * Whether this provider support share map via a public url, if truthy, user will be displayed with a share map via url under the export map option on the top right of the side bar
     * @returns
     * @public
     */
  }, {
    key: "hasSharingUrl",
    value: function hasSharingUrl() {
      return false;
    }

    /**
     * This method is called after user share a map, to display the share url.
     * @param fullUrl - Whether to return the full url with domain, or just the location
     * @returns shareUrl
     * @public
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, {
    key: "getShareUrl",
    value: function getShareUrl() {
      var fullUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return '';
    }

    /**
     * This method is called by kepler.gl demo app to pushes a new location to history, becoming the current location.
     * @returns mapUrl
     * @public
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }, {
    key: "getMapUrl",
    value: function getMapUrl(loadParams) {
      return '';
    }

    /**
     * This method is called to determine whether user already logged in to this provider
     * @public
     * @returns {Promise<string>} return the access token if a user already logged in
     */
  }, {
    key: "getAccessToken",
    value: (function () {
      var _getAccessToken = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", Promise.reject('You must implement getAccessToken'));
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function getAccessToken() {
        return _getAccessToken.apply(this, arguments);
      }
      return getAccessToken;
    }()
    /**
     * This method is called to get the user name of the current user. It will be displayed in the cloud provider tile.
     * @public
     * @deprecated please use getUser
     * @returns true if a user already logged in
     */
    )
  }, {
    key: "getUserName",
    value: function getUserName() {
      return '';
    }

    /**
     * return a Promise with the user object
     */
  }, {
    key: "getUser",
    value: (function () {
      var _getUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", Promise.reject('You must implement getUser'));
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function getUser() {
        return _getUser.apply(this, arguments);
      }
      return getUser;
    }()
    /**
     * This return a standard error that will trigger the overwrite map modal
     */
    )
  }, {
    key: "getFileConflictError",
    value: function getFileConflictError() {
      return new Error(FILE_CONFLICT_MSG);
    }

    /**
     * This method will be called when user click the login button in the cloud provider tile.
     * Upon login success and return the user Object {name, email, abbreviated}
     * @public
     */
  }, {
    key: "login",
    value: (function () {
      var _login = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", Promise.reject(new Error('you must implement the `login` method')));
            case 1:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      function login() {
        return _login.apply(this, arguments);
      }
      return login;
    }()
    /**
     * This method will be called when user click the logout button under the cloud provider tile.
     * Upon login success
     * @public
     */
    )
  }, {
    key: "logout",
    value: (function () {
      var _logout = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", Promise.reject(new Error('you must implement the `logout` method')));
            case 1:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      function logout() {
        return _logout.apply(this, arguments);
      }
      return logout;
    }()
    /**
     * This method will be called to upload map for saving and sharing. Kepler.gl will package map data, config, title, description and thumbnail for upload to storage.
     * With the option to overwrite already saved map, and upload as private or public map.
     *
     * @param {Object} param
     * @param {Object} param.mapData - the map object
     * @param {Object} param.mapData.map - {datasets. config, info: {title, description}}
     * @param {Blob} param.mapData.thumbnail - A thumbnail of current map. thumbnail size can be defined by provider by this.thumbnail
     * @param {object} [param.options]
     * @param {boolean} [param.options.overwrite] - whether user choose to overwrite already saved map under the same name
     * @param {boolean} [param.options.isPublic] - whether user wish to share the map with others. if isPublic is truthy, kepler will call this.getShareUrl() to display an URL they can share with others
     * @public
     */
    )
  }, {
    key: "uploadMap",
    value: (function () {
      var _uploadMap = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(_ref) {
        var mapData, _ref$options, options;
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              mapData = _ref.mapData, _ref$options = _ref.options, options = _ref$options === void 0 ? {} : _ref$options;
              return _context5.abrupt("return", Promise.reject('You must implement uploadMap'));
            case 2:
            case "end":
              return _context5.stop();
          }
        }, _callee5);
      }));
      function uploadMap(_x) {
        return _uploadMap.apply(this, arguments);
      }
      return uploadMap;
    }()
    /**
     * This method is called to get a list of maps saved by the current logged in user.
     * @returns visualizations an array of Viz objects
     * @public
     * @example
     *  async listMaps() {
     *    return [
     *      {
     *        id: 'a',
     *        title: 'My map',
     *        description: 'My first kepler map',
     *        imageUrl: 'http://',
     *        updatedAt: 1582677787000,
     *        privateMap: false,
     *        loadParams: {}
     *      }
     *    ];
     *  }
     */
    )
  }, {
    key: "listMaps",
    value: (function () {
      var _listMaps = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", []);
            case 1:
            case "end":
              return _context6.stop();
          }
        }, _callee6);
      }));
      function listMaps() {
        return _listMaps.apply(this, arguments);
      }
      return listMaps;
    }()
    /**
     * This method will be called when user select a map to load from the storage map viewer
     * @param {*} loadParams - the loadParams property of each visualization object
     * @returns mapResponse - the map object containing dataset config info and format option
     * @public
     * @example
     * async downloadMap(loadParams) {
     *  const mockResponse = {
     *    map: {
     *      datasets: [],
     *      config: {},
     *      info: {
     *        app: 'kepler.gl',
     *        created_at: ''
     *        title: 'test map',
     *        description: 'Hello this is my test dropbox map'
     *      }
     *    },
     *    // pass csv here if your provider currently only support save / load file as csv
     *    format: 'keplergl'
     *  };
     *
     *  return downloadMap;
     * }
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    )
  }, {
    key: "downloadMap",
    value: (function () {
      var _downloadMap = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(loadParams) {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", Promise.reject('You must implement downloadMap'));
            case 1:
            case "end":
              return _context7.stop();
          }
        }, _callee7);
      }));
      function downloadMap(_x2) {
        return _downloadMap.apply(this, arguments);
      }
      return downloadMap;
    }()
    /**
     * @return {string} return the storage location url for the current provider
     * @public
     */
    )
  }, {
    key: "getManagementUrl",
    value: function getManagementUrl() {
      throw new Error('You must implement getManagementUrl');
    }

    /**
     * @typedef {Object} Viz
     * @property {string} id - An unique id
     * @property {string} title - The title of the map
     * @property {string} description - The description of the map
     * @property {string} imageUrl - The imageUrl of the map
     * @property {number} updatedAt - An epoch timestamp in milliseconds
     * @property {boolean} privateMap - Optional, whether if this map is private to the user, or can be accessed by others via URL
     * @property {*} loadParams - A property to be passed to `downloadMap`
     * @public
     */

    /**
     * The returned object of `downloadMap`. The response object should contain: datasets: [], config: {}, and info: {}
     * each dataset object should be {info: {id, label}, data: {...}}
     * to inform how kepler should process your data object, pass in `format`
     * @typedef {Object} MapResponse
     * @property {Object} map
     * @property {Array<Object>} map.datasets
     * @property {Object} map.config
     * @property {Object} map.info
     * @property {string} format - one of 'csv': csv file string, 'geojson': geojson object, 'row': row object, 'keplergl': datasets array saved using KeplerGlSchema.save
     * @public
     */
  }]);
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfdXBsb2FkIiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsInJlcXVpcmUiLCJOQU1FIiwiRElTUExBWV9OQU1FIiwiVEhVTUJOQUlMIiwid2lkdGgiLCJoZWlnaHQiLCJJQ09OIiwiVXBsb2FkIiwiS0VQTEVSX0ZPUk1BVCIsImV4cG9ydHMiLCJGSUxFX0NPTkZMSUNUX01TRyIsIlByb3ZpZGVyIiwicHJvcHMiLCJfY2xhc3NDYWxsQ2hlY2syIiwiX2RlZmluZVByb3BlcnR5MiIsIm5hbWUiLCJkaXNwbGF5TmFtZSIsInN0b3JhZ2VNZXNzYWdlIiwiaWNvbiIsInRodW1ibmFpbCIsIl9jcmVhdGVDbGFzczIiLCJrZXkiLCJ2YWx1ZSIsImhhc1ByaXZhdGVTdG9yYWdlIiwiaGFzU2hhcmluZ1VybCIsImdldFNoYXJlVXJsIiwiZnVsbFVybCIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsImdldE1hcFVybCIsImxvYWRQYXJhbXMiLCJfZ2V0QWNjZXNzVG9rZW4iLCJfYXN5bmNUb0dlbmVyYXRvcjIiLCJfcmVnZW5lcmF0b3IiLCJtYXJrIiwiX2NhbGxlZSIsIndyYXAiLCJfY2FsbGVlJCIsIl9jb250ZXh0IiwicHJldiIsIm5leHQiLCJhYnJ1cHQiLCJQcm9taXNlIiwicmVqZWN0Iiwic3RvcCIsImdldEFjY2Vzc1Rva2VuIiwiYXBwbHkiLCJnZXRVc2VyTmFtZSIsIl9nZXRVc2VyIiwiX2NhbGxlZTIiLCJfY2FsbGVlMiQiLCJfY29udGV4dDIiLCJnZXRVc2VyIiwiZ2V0RmlsZUNvbmZsaWN0RXJyb3IiLCJFcnJvciIsIl9sb2dpbiIsIl9jYWxsZWUzIiwiX2NhbGxlZTMkIiwiX2NvbnRleHQzIiwibG9naW4iLCJfbG9nb3V0IiwiX2NhbGxlZTQiLCJfY2FsbGVlNCQiLCJfY29udGV4dDQiLCJsb2dvdXQiLCJfdXBsb2FkTWFwIiwiX2NhbGxlZTUiLCJfcmVmIiwibWFwRGF0YSIsIl9yZWYkb3B0aW9ucyIsIm9wdGlvbnMiLCJfY2FsbGVlNSQiLCJfY29udGV4dDUiLCJ1cGxvYWRNYXAiLCJfeCIsIl9saXN0TWFwcyIsIl9jYWxsZWU2IiwiX2NhbGxlZTYkIiwiX2NvbnRleHQ2IiwibGlzdE1hcHMiLCJfZG93bmxvYWRNYXAiLCJfY2FsbGVlNyIsIl9jYWxsZWU3JCIsIl9jb250ZXh0NyIsImRvd25sb2FkTWFwIiwiX3gyIiwiZ2V0TWFuYWdlbWVudFVybCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbG91ZC1wcm92aWRlcnMvc3JjL3Byb3ZpZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBNSVRcbi8vIENvcHlyaWdodCBjb250cmlidXRvcnMgdG8gdGhlIGtlcGxlci5nbCBwcm9qZWN0XG5cbmltcG9ydCBVcGxvYWQgZnJvbSAnLi91cGxvYWQnO1xuaW1wb3J0IHtNYXBEYXRhLCBFeHBvcnRGaWxlT3B0aW9ucywgTWlsbGlzZWNvbmQsIFNhdmVkTWFwfSBmcm9tICdAa2VwbGVyLmdsL3R5cGVzJztcbmltcG9ydCB7Q29tcG9uZW50VHlwZX0gZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgdHlwZSBNYXBJdGVtTG9hZFBhcmFtcyA9IHtcbiAgaWQ6IHN0cmluZztcbiAgcGF0aDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgTWFwTGlzdEl0ZW0gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIGxvYWRQYXJhbXM6IGFueTtcbiAgaW1hZ2VVcmw/OiBzdHJpbmc7XG4gIHVwZGF0ZWRBdD86IE1pbGxpc2Vjb25kO1xuICBwcml2YXRlTWFwPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIENsb3VkVXNlciA9IHtcbiAgbmFtZTogc3RyaW5nO1xuICBlbWFpbDogc3RyaW5nO1xuICB0aHVtYm5haWw/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUaHVtYm5haWwgPSB7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgUHJvdmlkZXJQcm9wcyA9IHtcbiAgbmFtZT86IHN0cmluZztcbiAgZGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gIHN0b3JhZ2VNZXNzYWdlPzogc3RyaW5nO1xuICBpY29uPzogQ29tcG9uZW50VHlwZTxJY29uUHJvcHM+O1xuICB0aHVtYm5haWw/OiBUaHVtYm5haWw7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEljb25Qcm9wcyB7XG4gIGhlaWdodD86IHN0cmluZztcbiAgd2lkdGg/OiBzdHJpbmc7XG59XG5cbmNvbnN0IE5BTUUgPSAnY2xvdWQtcHJvdmlkZXInO1xuY29uc3QgRElTUExBWV9OQU1FID0gJ0Nsb3VkIFByb3ZpZGVyJztcbmNvbnN0IFRIVU1CTkFJTCA9IHt3aWR0aDogMzAwLCBoZWlnaHQ6IDIwMH07XG5jb25zdCBJQ09OID0gVXBsb2FkO1xuZXhwb3J0IGNvbnN0IEtFUExFUl9GT1JNQVQgPSAna2VwbGVyZ2wnO1xuZXhwb3J0IGNvbnN0IEZJTEVfQ09ORkxJQ1RfTVNHID0gJ2ZpbGVfY29uZmxpY3QnO1xuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHByb3ZpZGVyIGNsYXNzXG4gKiBAcGFyYW0ge29iamVjdH0gcHJvcHNcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wcy5uYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcHMuZGlzcGxheU5hbWVcbiAqIEBwYXJhbSB7UmVhY3QuQ29tcG9uZW50fSBwcm9wcy5pY29uIC0gUmVhY3QgZWxlbWVudFxuICogQHBhcmFtIHtvYmplY3R9IHByb3BzLnRodW1ibmFpbCAtIHRodW1ibmFpbCBzaXplIG9iamVjdFxuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLnRodW1ibmFpbC53aWR0aCAtIHRodW1ibmFpbCB3aWR0aCBpbiBwaXhlbHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy50aHVtYm5haWwuaGVpZ2h0IC0gdGh1bWJuYWlsIGhlaWdodCBpbiBwaXhlbHNcbiAqIEBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKlxuICogY29uc3QgbXlQcm92aWRlciA9IG5ldyBQcm92aWRlcih7XG4gKiAgbmFtZTogJ2ZvbycsXG4gKiAgZGlzcGxheU5hbWU6ICdGb28gU3RvcmFnZSdcbiAqICBpY29uOiBJY29uLFxuICogIHRodW1ibmFpbDoge3dpZHRoOiAzMDAsIGhlaWdodDogMjAwfVxuICogfSlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdmlkZXIge1xuICBuYW1lOiBzdHJpbmc7XG4gIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG4gIHN0b3JhZ2VNZXNzYWdlPzogc3RyaW5nO1xuICBpY29uOiBDb21wb25lbnRUeXBlPEljb25Qcm9wcz47XG4gIHRodW1ibmFpbDogVGh1bWJuYWlsO1xuICBpc05ldyA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm92aWRlclByb3BzKSB7XG4gICAgdGhpcy5uYW1lID0gcHJvcHMubmFtZSB8fCBOQU1FO1xuICAgIHRoaXMuZGlzcGxheU5hbWUgPSBwcm9wcy5kaXNwbGF5TmFtZSB8fCBESVNQTEFZX05BTUU7XG4gICAgdGhpcy5zdG9yYWdlTWVzc2FnZSA9IHByb3BzLnN0b3JhZ2VNZXNzYWdlO1xuICAgIHRoaXMuaWNvbiA9IHByb3BzLmljb24gfHwgSUNPTjtcbiAgICB0aGlzLnRodW1ibmFpbCA9IHByb3BzLnRodW1ibmFpbCB8fCBUSFVNQk5BSUw7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIHByb3ZpZGVyIHN1cHBvcnQgdXBsb2FkIG1hcCB0byBhIHByaXZhdGUgc3RvcmFnZS4gSWYgdHJ1dGh5LCB1c2VyIHdpbGwgYmUgZGlzcGxheWVkIHdpdGggdGhlIHN0b3JhZ2Ugc2F2ZSBpY29uIG9uIHRoZSB0b3AgcmlnaHQgb2YgdGhlIHNpZGUgYmFyLlxuICAgKiBAcmV0dXJuc1xuICAgKiBAcHVibGljXG4gICAqL1xuICBoYXNQcml2YXRlU3RvcmFnZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoaXMgcHJvdmlkZXIgc3VwcG9ydCBzaGFyZSBtYXAgdmlhIGEgcHVibGljIHVybCwgaWYgdHJ1dGh5LCB1c2VyIHdpbGwgYmUgZGlzcGxheWVkIHdpdGggYSBzaGFyZSBtYXAgdmlhIHVybCB1bmRlciB0aGUgZXhwb3J0IG1hcCBvcHRpb24gb24gdGhlIHRvcCByaWdodCBvZiB0aGUgc2lkZSBiYXJcbiAgICogQHJldHVybnNcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgaGFzU2hhcmluZ1VybCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGFmdGVyIHVzZXIgc2hhcmUgYSBtYXAsIHRvIGRpc3BsYXkgdGhlIHNoYXJlIHVybC5cbiAgICogQHBhcmFtIGZ1bGxVcmwgLSBXaGV0aGVyIHRvIHJldHVybiB0aGUgZnVsbCB1cmwgd2l0aCBkb21haW4sIG9yIGp1c3QgdGhlIGxvY2F0aW9uXG4gICAqIEByZXR1cm5zIHNoYXJlVXJsXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgZ2V0U2hhcmVVcmwoZnVsbFVybCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGJ5IGtlcGxlci5nbCBkZW1vIGFwcCB0byBwdXNoZXMgYSBuZXcgbG9jYXRpb24gdG8gaGlzdG9yeSwgYmVjb21pbmcgdGhlIGN1cnJlbnQgbG9jYXRpb24uXG4gICAqIEByZXR1cm5zIG1hcFVybFxuICAgKiBAcHVibGljXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gIGdldE1hcFVybChsb2FkUGFyYW1zOiBNYXBJdGVtTG9hZFBhcmFtcyk6IHN0cmluZyB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB0byBkZXRlcm1pbmUgd2hldGhlciB1c2VyIGFscmVhZHkgbG9nZ2VkIGluIHRvIHRoaXMgcHJvdmlkZXJcbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSByZXR1cm4gdGhlIGFjY2VzcyB0b2tlbiBpZiBhIHVzZXIgYWxyZWFkeSBsb2dnZWQgaW5cbiAgICovXG4gIGFzeW5jIGdldEFjY2Vzc1Rva2VuKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnWW91IG11c3QgaW1wbGVtZW50IGdldEFjY2Vzc1Rva2VuJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHRvIGdldCB0aGUgdXNlciBuYW1lIG9mIHRoZSBjdXJyZW50IHVzZXIuIEl0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBjbG91ZCBwcm92aWRlciB0aWxlLlxuICAgKiBAcHVibGljXG4gICAqIEBkZXByZWNhdGVkIHBsZWFzZSB1c2UgZ2V0VXNlclxuICAgKiBAcmV0dXJucyB0cnVlIGlmIGEgdXNlciBhbHJlYWR5IGxvZ2dlZCBpblxuICAgKi9cbiAgZ2V0VXNlck5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvKipcbiAgICogcmV0dXJuIGEgUHJvbWlzZSB3aXRoIHRoZSB1c2VyIG9iamVjdFxuICAgKi9cbiAgYXN5bmMgZ2V0VXNlcigpOiBQcm9taXNlPENsb3VkVXNlciB8IG51bGw+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoJ1lvdSBtdXN0IGltcGxlbWVudCBnZXRVc2VyJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyByZXR1cm4gYSBzdGFuZGFyZCBlcnJvciB0aGF0IHdpbGwgdHJpZ2dlciB0aGUgb3ZlcndyaXRlIG1hcCBtb2RhbFxuICAgKi9cbiAgZ2V0RmlsZUNvbmZsaWN0RXJyb3IoKSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihGSUxFX0NPTkZMSUNUX01TRyk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgd2hlbiB1c2VyIGNsaWNrIHRoZSBsb2dpbiBidXR0b24gaW4gdGhlIGNsb3VkIHByb3ZpZGVyIHRpbGUuXG4gICAqIFVwb24gbG9naW4gc3VjY2VzcyBhbmQgcmV0dXJuIHRoZSB1c2VyIE9iamVjdCB7bmFtZSwgZW1haWwsIGFiYnJldmlhdGVkfVxuICAgKiBAcHVibGljXG4gICAqL1xuICBhc3luYyBsb2dpbigpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCd5b3UgbXVzdCBpbXBsZW1lbnQgdGhlIGBsb2dpbmAgbWV0aG9kJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIHdpbGwgYmUgY2FsbGVkIHdoZW4gdXNlciBjbGljayB0aGUgbG9nb3V0IGJ1dHRvbiB1bmRlciB0aGUgY2xvdWQgcHJvdmlkZXIgdGlsZS5cbiAgICogVXBvbiBsb2dpbiBzdWNjZXNzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFzeW5jIGxvZ291dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCd5b3UgbXVzdCBpbXBsZW1lbnQgdGhlIGBsb2dvdXRgIG1ldGhvZCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCB3aWxsIGJlIGNhbGxlZCB0byB1cGxvYWQgbWFwIGZvciBzYXZpbmcgYW5kIHNoYXJpbmcuIEtlcGxlci5nbCB3aWxsIHBhY2thZ2UgbWFwIGRhdGEsIGNvbmZpZywgdGl0bGUsIGRlc2NyaXB0aW9uIGFuZCB0aHVtYm5haWwgZm9yIHVwbG9hZCB0byBzdG9yYWdlLlxuICAgKiBXaXRoIHRoZSBvcHRpb24gdG8gb3ZlcndyaXRlIGFscmVhZHkgc2F2ZWQgbWFwLCBhbmQgdXBsb2FkIGFzIHByaXZhdGUgb3IgcHVibGljIG1hcC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbS5tYXBEYXRhIC0gdGhlIG1hcCBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtLm1hcERhdGEubWFwIC0ge2RhdGFzZXRzLiBjb25maWcsIGluZm86IHt0aXRsZSwgZGVzY3JpcHRpb259fVxuICAgKiBAcGFyYW0ge0Jsb2J9IHBhcmFtLm1hcERhdGEudGh1bWJuYWlsIC0gQSB0aHVtYm5haWwgb2YgY3VycmVudCBtYXAuIHRodW1ibmFpbCBzaXplIGNhbiBiZSBkZWZpbmVkIGJ5IHByb3ZpZGVyIGJ5IHRoaXMudGh1bWJuYWlsXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW0ub3B0aW9uc11cbiAgICogQHBhcmFtIHtib29sZWFufSBbcGFyYW0ub3B0aW9ucy5vdmVyd3JpdGVdIC0gd2hldGhlciB1c2VyIGNob29zZSB0byBvdmVyd3JpdGUgYWxyZWFkeSBzYXZlZCBtYXAgdW5kZXIgdGhlIHNhbWUgbmFtZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtwYXJhbS5vcHRpb25zLmlzUHVibGljXSAtIHdoZXRoZXIgdXNlciB3aXNoIHRvIHNoYXJlIHRoZSBtYXAgd2l0aCBvdGhlcnMuIGlmIGlzUHVibGljIGlzIHRydXRoeSwga2VwbGVyIHdpbGwgY2FsbCB0aGlzLmdldFNoYXJlVXJsKCkgdG8gZGlzcGxheSBhbiBVUkwgdGhleSBjYW4gc2hhcmUgd2l0aCBvdGhlcnNcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgYXN5bmMgdXBsb2FkTWFwKHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgbWFwRGF0YSxcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgb3B0aW9ucyA9IHt9XG4gIH06IHtcbiAgICBtYXBEYXRhOiBNYXBEYXRhO1xuICAgIG9wdGlvbnM6IEV4cG9ydEZpbGVPcHRpb25zO1xuICB9KTogUHJvbWlzZTxNYXBMaXN0SXRlbT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnWW91IG11c3QgaW1wbGVtZW50IHVwbG9hZE1hcCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB0byBnZXQgYSBsaXN0IG9mIG1hcHMgc2F2ZWQgYnkgdGhlIGN1cnJlbnQgbG9nZ2VkIGluIHVzZXIuXG4gICAqIEByZXR1cm5zIHZpc3VhbGl6YXRpb25zIGFuIGFycmF5IG9mIFZpeiBvYmplY3RzXG4gICAqIEBwdWJsaWNcbiAgICogQGV4YW1wbGVcbiAgICogIGFzeW5jIGxpc3RNYXBzKCkge1xuICAgKiAgICByZXR1cm4gW1xuICAgKiAgICAgIHtcbiAgICogICAgICAgIGlkOiAnYScsXG4gICAqICAgICAgICB0aXRsZTogJ015IG1hcCcsXG4gICAqICAgICAgICBkZXNjcmlwdGlvbjogJ015IGZpcnN0IGtlcGxlciBtYXAnLFxuICAgKiAgICAgICAgaW1hZ2VVcmw6ICdodHRwOi8vJyxcbiAgICogICAgICAgIHVwZGF0ZWRBdDogMTU4MjY3Nzc4NzAwMCxcbiAgICogICAgICAgIHByaXZhdGVNYXA6IGZhbHNlLFxuICAgKiAgICAgICAgbG9hZFBhcmFtczoge31cbiAgICogICAgICB9XG4gICAqICAgIF07XG4gICAqICB9XG4gICAqL1xuICBhc3luYyBsaXN0TWFwcygpOiBQcm9taXNlPE1hcExpc3RJdGVtW10+IHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgd2hlbiB1c2VyIHNlbGVjdCBhIG1hcCB0byBsb2FkIGZyb20gdGhlIHN0b3JhZ2UgbWFwIHZpZXdlclxuICAgKiBAcGFyYW0geyp9IGxvYWRQYXJhbXMgLSB0aGUgbG9hZFBhcmFtcyBwcm9wZXJ0eSBvZiBlYWNoIHZpc3VhbGl6YXRpb24gb2JqZWN0XG4gICAqIEByZXR1cm5zIG1hcFJlc3BvbnNlIC0gdGhlIG1hcCBvYmplY3QgY29udGFpbmluZyBkYXRhc2V0IGNvbmZpZyBpbmZvIGFuZCBmb3JtYXQgb3B0aW9uXG4gICAqIEBwdWJsaWNcbiAgICogQGV4YW1wbGVcbiAgICogYXN5bmMgZG93bmxvYWRNYXAobG9hZFBhcmFtcykge1xuICAgKiAgY29uc3QgbW9ja1Jlc3BvbnNlID0ge1xuICAgKiAgICBtYXA6IHtcbiAgICogICAgICBkYXRhc2V0czogW10sXG4gICAqICAgICAgY29uZmlnOiB7fSxcbiAgICogICAgICBpbmZvOiB7XG4gICAqICAgICAgICBhcHA6ICdrZXBsZXIuZ2wnLFxuICAgKiAgICAgICAgY3JlYXRlZF9hdDogJydcbiAgICogICAgICAgIHRpdGxlOiAndGVzdCBtYXAnLFxuICAgKiAgICAgICAgZGVzY3JpcHRpb246ICdIZWxsbyB0aGlzIGlzIG15IHRlc3QgZHJvcGJveCBtYXAnXG4gICAqICAgICAgfVxuICAgKiAgICB9LFxuICAgKiAgICAvLyBwYXNzIGNzdiBoZXJlIGlmIHlvdXIgcHJvdmlkZXIgY3VycmVudGx5IG9ubHkgc3VwcG9ydCBzYXZlIC8gbG9hZCBmaWxlIGFzIGNzdlxuICAgKiAgICBmb3JtYXQ6ICdrZXBsZXJnbCdcbiAgICogIH07XG4gICAqXG4gICAqICByZXR1cm4gZG93bmxvYWRNYXA7XG4gICAqIH1cbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgYXN5bmMgZG93bmxvYWRNYXAobG9hZFBhcmFtcyk6IFByb21pc2U8e21hcDogU2F2ZWRNYXA7IGZvcm1hdDogc3RyaW5nfT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnWW91IG11c3QgaW1wbGVtZW50IGRvd25sb2FkTWFwJyk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSByZXR1cm4gdGhlIHN0b3JhZ2UgbG9jYXRpb24gdXJsIGZvciB0aGUgY3VycmVudCBwcm92aWRlclxuICAgKiBAcHVibGljXG4gICAqL1xuICBnZXRNYW5hZ2VtZW50VXJsKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBpbXBsZW1lbnQgZ2V0TWFuYWdlbWVudFVybCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFZpelxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gaWQgLSBBbiB1bmlxdWUgaWRcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IHRpdGxlIC0gVGhlIHRpdGxlIG9mIHRoZSBtYXBcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IGRlc2NyaXB0aW9uIC0gVGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBtYXBcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IGltYWdlVXJsIC0gVGhlIGltYWdlVXJsIG9mIHRoZSBtYXBcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IHVwZGF0ZWRBdCAtIEFuIGVwb2NoIHRpbWVzdGFtcCBpbiBtaWxsaXNlY29uZHNcbiAgICogQHByb3BlcnR5IHtib29sZWFufSBwcml2YXRlTWFwIC0gT3B0aW9uYWwsIHdoZXRoZXIgaWYgdGhpcyBtYXAgaXMgcHJpdmF0ZSB0byB0aGUgdXNlciwgb3IgY2FuIGJlIGFjY2Vzc2VkIGJ5IG90aGVycyB2aWEgVVJMXG4gICAqIEBwcm9wZXJ0eSB7Kn0gbG9hZFBhcmFtcyAtIEEgcHJvcGVydHkgdG8gYmUgcGFzc2VkIHRvIGBkb3dubG9hZE1hcGBcbiAgICogQHB1YmxpY1xuICAgKi9cblxuICAvKipcbiAgICogVGhlIHJldHVybmVkIG9iamVjdCBvZiBgZG93bmxvYWRNYXBgLiBUaGUgcmVzcG9uc2Ugb2JqZWN0IHNob3VsZCBjb250YWluOiBkYXRhc2V0czogW10sIGNvbmZpZzoge30sIGFuZCBpbmZvOiB7fVxuICAgKiBlYWNoIGRhdGFzZXQgb2JqZWN0IHNob3VsZCBiZSB7aW5mbzoge2lkLCBsYWJlbH0sIGRhdGE6IHsuLi59fVxuICAgKiB0byBpbmZvcm0gaG93IGtlcGxlciBzaG91bGQgcHJvY2VzcyB5b3VyIGRhdGEgb2JqZWN0LCBwYXNzIGluIGBmb3JtYXRgXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IE1hcFJlc3BvbnNlXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBtYXBcbiAgICogQHByb3BlcnR5IHtBcnJheTxPYmplY3Q+fSBtYXAuZGF0YXNldHNcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IG1hcC5jb25maWdcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IG1hcC5pbmZvXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBmb3JtYXQgLSBvbmUgb2YgJ2Nzdic6IGNzdiBmaWxlIHN0cmluZywgJ2dlb2pzb24nOiBnZW9qc29uIG9iamVjdCwgJ3Jvdyc6IHJvdyBvYmplY3QsICdrZXBsZXJnbCc6IGRhdGFzZXRzIGFycmF5IHNhdmVkIHVzaW5nIEtlcGxlckdsU2NoZW1hLnNhdmVcbiAgICogQHB1YmxpY1xuICAgKi9cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBR0EsSUFBQUEsT0FBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBO0FBSEE7QUFDQTs7QUE2Q0EsSUFBTUMsSUFBSSxHQUFHLGdCQUFnQjtBQUM3QixJQUFNQyxZQUFZLEdBQUcsZ0JBQWdCO0FBQ3JDLElBQU1DLFNBQVMsR0FBRztFQUFDQyxLQUFLLEVBQUUsR0FBRztFQUFFQyxNQUFNLEVBQUU7QUFBRyxDQUFDO0FBQzNDLElBQU1DLElBQUksR0FBR0Msa0JBQU07QUFDWixJQUFNQyxhQUFhLEdBQUFDLE9BQUEsQ0FBQUQsYUFBQSxHQUFHLFVBQVU7QUFDaEMsSUFBTUUsaUJBQWlCLEdBQUFELE9BQUEsQ0FBQUMsaUJBQUEsR0FBRyxlQUFlOztBQUVoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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