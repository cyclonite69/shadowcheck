"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapBoundary = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _utils = require("@openassistant/utils");
var _zod = require("zod");
// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

function isMapBoundaryContext(context) {
  return (0, _typeof2["default"])(context) === 'object' && context !== null && 'getMapBoundary' in context;
}
var mapBoundary = exports.mapBoundary = (0, _utils.extendedTool)({
  description: 'Get the boundary of the map. Northwest and Southeast coordinates in [longitude, latitude] format.',
  parameters: _zod.z.object({}),
  execute: function () {
    var _execute = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(args, options) {
      var getMapBoundary, boundary;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            if (!(!(options !== null && options !== void 0 && options.context) || !isMapBoundaryContext(options.context))) {
              _context.next = 3;
              break;
            }
            throw new Error('context getMapBoundary() not implemented.');
          case 3:
            getMapBoundary = options.context.getMapBoundary;
            boundary = getMapBoundary();
            return _context.abrupt("return", {
              llmResult: {
                success: true,
                boundary: boundary
              }
            });
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", {
              llmResult: {
                success: false,
                error: _context.t0 instanceof Error ? _context.t0.message : 'Unknown error',
                instruction: 'Please ask the user to make sure the kepler.gl app has been intialized successfully to get the map boundary.'
              }
            });
          case 11:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 8]]);
    }));
    function execute(_x, _x2) {
      return _execute.apply(this, arguments);
    }
    return execute;
  }(),
  context: {
    getMapBoundary: function getMapBoundary() {
      throw new Error('getMapBoundary() not implemented.');
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfdXRpbHMiLCJyZXF1aXJlIiwiX3pvZCIsImlzTWFwQm91bmRhcnlDb250ZXh0IiwiY29udGV4dCIsIl90eXBlb2YyIiwibWFwQm91bmRhcnkiLCJleHBvcnRzIiwiZXh0ZW5kZWRUb29sIiwiZGVzY3JpcHRpb24iLCJwYXJhbWV0ZXJzIiwieiIsIm9iamVjdCIsImV4ZWN1dGUiLCJfZXhlY3V0ZSIsIl9hc3luY1RvR2VuZXJhdG9yMiIsIl9yZWdlbmVyYXRvciIsIm1hcmsiLCJfY2FsbGVlIiwiYXJncyIsIm9wdGlvbnMiLCJnZXRNYXBCb3VuZGFyeSIsImJvdW5kYXJ5Iiwid3JhcCIsIl9jYWxsZWUkIiwiX2NvbnRleHQiLCJwcmV2IiwibmV4dCIsIkVycm9yIiwiYWJydXB0IiwibGxtUmVzdWx0Iiwic3VjY2VzcyIsInQwIiwiZXJyb3IiLCJtZXNzYWdlIiwiaW5zdHJ1Y3Rpb24iLCJzdG9wIiwiX3giLCJfeDIiLCJhcHBseSIsImFyZ3VtZW50cyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9haS1hc3Npc3RhbnQvc3JjL3Rvb2xzL2tlcGxlci10b29scy9ib3VuZGFyeS10b29sLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4vLyBDb3B5cmlnaHQgY29udHJpYnV0b3JzIHRvIHRoZSBrZXBsZXIuZ2wgcHJvamVjdFxuXG5pbXBvcnQge2V4dGVuZGVkVG9vbH0gZnJvbSAnQG9wZW5hc3Npc3RhbnQvdXRpbHMnO1xuaW1wb3J0IHt6fSBmcm9tICd6b2QnO1xuXG50eXBlIE1hcEJvdW5kYXJ5Q29udGV4dCA9IHtcbiAgZ2V0TWFwQm91bmRhcnk6ICgpID0+IHtcbiAgICBudzogW251bWJlciwgbnVtYmVyXTtcbiAgICBzZTogW251bWJlciwgbnVtYmVyXTtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIGlzTWFwQm91bmRhcnlDb250ZXh0KGNvbnRleHQ6IHVua25vd24pOiBjb250ZXh0IGlzIE1hcEJvdW5kYXJ5Q29udGV4dCB7XG4gIHJldHVybiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcgJiYgY29udGV4dCAhPT0gbnVsbCAmJiAnZ2V0TWFwQm91bmRhcnknIGluIGNvbnRleHQ7XG59XG5cbmV4cG9ydCBjb25zdCBtYXBCb3VuZGFyeSA9IGV4dGVuZGVkVG9vbCh7XG4gIGRlc2NyaXB0aW9uOlxuICAgICdHZXQgdGhlIGJvdW5kYXJ5IG9mIHRoZSBtYXAuIE5vcnRod2VzdCBhbmQgU291dGhlYXN0IGNvb3JkaW5hdGVzIGluIFtsb25naXR1ZGUsIGxhdGl0dWRlXSBmb3JtYXQuJyxcbiAgcGFyYW1ldGVyczogei5vYmplY3Qoe30pLFxuICBleGVjdXRlOiBhc3luYyAoYXJncywgb3B0aW9ucykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIW9wdGlvbnM/LmNvbnRleHQgfHwgIWlzTWFwQm91bmRhcnlDb250ZXh0KG9wdGlvbnMuY29udGV4dCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb250ZXh0IGdldE1hcEJvdW5kYXJ5KCkgbm90IGltcGxlbWVudGVkLicpO1xuICAgICAgfVxuICAgICAgY29uc3Qge2dldE1hcEJvdW5kYXJ5fSA9IG9wdGlvbnMuY29udGV4dDtcbiAgICAgIGNvbnN0IGJvdW5kYXJ5ID0gZ2V0TWFwQm91bmRhcnkoKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxsbVJlc3VsdDoge1xuICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgYm91bmRhcnlcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGxtUmVzdWx0OiB7XG4gICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InLFxuICAgICAgICAgIGluc3RydWN0aW9uOlxuICAgICAgICAgICAgJ1BsZWFzZSBhc2sgdGhlIHVzZXIgdG8gbWFrZSBzdXJlIHRoZSBrZXBsZXIuZ2wgYXBwIGhhcyBiZWVuIGludGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5IHRvIGdldCB0aGUgbWFwIGJvdW5kYXJ5LidcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIGNvbnRleHQ6IHtcbiAgICBnZXRNYXBCb3VuZGFyeTogKCkgPT4ge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRNYXBCb3VuZGFyeSgpIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgICB9XG4gIH1cbn0pO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBR0EsSUFBQUEsTUFBQSxHQUFBQyxPQUFBO0FBQ0EsSUFBQUMsSUFBQSxHQUFBRCxPQUFBO0FBSkE7QUFDQTs7QUFZQSxTQUFTRSxvQkFBb0JBLENBQUNDLE9BQWdCLEVBQWlDO0VBQzdFLE9BQU8sSUFBQUMsUUFBQSxhQUFPRCxPQUFPLE1BQUssUUFBUSxJQUFJQSxPQUFPLEtBQUssSUFBSSxJQUFJLGdCQUFnQixJQUFJQSxPQUFPO0FBQ3ZGO0FBRU8sSUFBTUUsV0FBVyxHQUFBQyxPQUFBLENBQUFELFdBQUEsR0FBRyxJQUFBRSxtQkFBWSxFQUFDO0VBQ3RDQyxXQUFXLEVBQ1QsbUdBQW1HO0VBQ3JHQyxVQUFVLEVBQUVDLE1BQUMsQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3hCQyxPQUFPO0lBQUEsSUFBQUMsUUFBQSxPQUFBQyxrQkFBQSwyQkFBQUMsWUFBQSxZQUFBQyxJQUFBLENBQUUsU0FBQUMsUUFBT0MsSUFBSSxFQUFFQyxPQUFPO01BQUEsSUFBQUMsY0FBQSxFQUFBQyxRQUFBO01BQUEsT0FBQU4sWUFBQSxZQUFBTyxJQUFBLFVBQUFDLFNBQUFDLFFBQUE7UUFBQSxrQkFBQUEsUUFBQSxDQUFBQyxJQUFBLEdBQUFELFFBQUEsQ0FBQUUsSUFBQTtVQUFBO1lBQUFGLFFBQUEsQ0FBQUMsSUFBQTtZQUFBLE1BRXJCLEVBQUNOLE9BQU8sYUFBUEEsT0FBTyxlQUFQQSxPQUFPLENBQUVoQixPQUFPLEtBQUksQ0FBQ0Qsb0JBQW9CLENBQUNpQixPQUFPLENBQUNoQixPQUFPLENBQUM7Y0FBQXFCLFFBQUEsQ0FBQUUsSUFBQTtjQUFBO1lBQUE7WUFBQSxNQUN2RCxJQUFJQyxLQUFLLENBQUMsMkNBQTJDLENBQUM7VUFBQTtZQUV2RFAsY0FBYyxHQUFJRCxPQUFPLENBQUNoQixPQUFPLENBQWpDaUIsY0FBYztZQUNmQyxRQUFRLEdBQUdELGNBQWMsQ0FBQyxDQUFDO1lBQUEsT0FBQUksUUFBQSxDQUFBSSxNQUFBLFdBQzFCO2NBQ0xDLFNBQVMsRUFBRTtnQkFDVEMsT0FBTyxFQUFFLElBQUk7Z0JBQ2JULFFBQVEsRUFBUkE7Y0FDRjtZQUNGLENBQUM7VUFBQTtZQUFBRyxRQUFBLENBQUFDLElBQUE7WUFBQUQsUUFBQSxDQUFBTyxFQUFBLEdBQUFQLFFBQUE7WUFBQSxPQUFBQSxRQUFBLENBQUFJLE1BQUEsV0FFTTtjQUNMQyxTQUFTLEVBQUU7Z0JBQ1RDLE9BQU8sRUFBRSxLQUFLO2dCQUNkRSxLQUFLLEVBQUVSLFFBQUEsQ0FBQU8sRUFBQSxZQUFpQkosS0FBSyxHQUFHSCxRQUFBLENBQUFPLEVBQUEsQ0FBTUUsT0FBTyxHQUFHLGVBQWU7Z0JBQy9EQyxXQUFXLEVBQ1Q7Y0FDSjtZQUNGLENBQUM7VUFBQTtVQUFBO1lBQUEsT0FBQVYsUUFBQSxDQUFBVyxJQUFBO1FBQUE7TUFBQSxHQUFBbEIsT0FBQTtJQUFBLENBRUo7SUFBQSxTQXZCREwsT0FBT0EsQ0FBQXdCLEVBQUEsRUFBQUMsR0FBQTtNQUFBLE9BQUF4QixRQUFBLENBQUF5QixLQUFBLE9BQUFDLFNBQUE7SUFBQTtJQUFBLE9BQVAzQixPQUFPO0VBQUEsR0F1Qk47RUFDRFQsT0FBTyxFQUFFO0lBQ1BpQixjQUFjLEVBQUUsU0FBaEJBLGNBQWNBLENBQUEsRUFBUTtNQUNwQixNQUFNLElBQUlPLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQztJQUN0RDtFQUNGO0FBQ0YsQ0FBQyxDQUFDIiwiaWdub3JlTGlzdCI6W119