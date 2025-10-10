"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _document = _interopRequireDefault(require("global/document"));
// SPDX-License-Identifier: MIT
// Copyright contributors to the kepler.gl project

function nope() {
  return;
}
var MouseEventHandler = exports["default"] = /*#__PURE__*/function () {
  // Set correct type

  function MouseEventHandler(_ref) {
    var _this = this;
    var _ref$vertical = _ref.vertical,
      vertical = _ref$vertical === void 0 ? false : _ref$vertical,
      _ref$valueListener = _ref.valueListener,
      valueListener = _ref$valueListener === void 0 ? nope : _ref$valueListener,
      _ref$toggleMouseOver = _ref.toggleMouseOver,
      toggleMouseOver = _ref$toggleMouseOver === void 0 ? nope : _ref$toggleMouseOver,
      track = _ref.track,
      _ref$setAnchor = _ref.setAnchor,
      setAnchor = _ref$setAnchor === void 0 ? null : _ref$setAnchor;
    (0, _classCallCheck2["default"])(this, MouseEventHandler);
    (0, _defineProperty2["default"])(this, "vertical", void 0);
    (0, _defineProperty2["default"])(this, "valueListener", void 0);
    (0, _defineProperty2["default"])(this, "toggleMouseOver", void 0);
    (0, _defineProperty2["default"])(this, "track", void 0);
    // Set correct type
    (0, _defineProperty2["default"])(this, "setAnchor", void 0);
    (0, _defineProperty2["default"])(this, "handleMouseDown", function (e) {
      _document["default"].addEventListener('mouseup', _this.mouseup);
      _document["default"].addEventListener('mousemove', _this.mousemove);
      if (_this.setAnchor) {
        var pos = _this.getMousePos(e);
        _this.setAnchor(_this.getDistanceToTrack(pos));
      }
      _this.toggleMouseOver();
    });
    (0, _defineProperty2["default"])(this, "mouseup", function () {
      _document["default"].removeEventListener('mouseup', _this.mouseup);
      _document["default"].removeEventListener('mousemove', _this.mousemove);
      _this.toggleMouseOver();
    });
    (0, _defineProperty2["default"])(this, "mousemove", function (e) {
      e.preventDefault();
      var pos = _this.getMousePos(e);
      _this.valueListener(_this.getDistanceToTrack(pos));
    });
    (0, _defineProperty2["default"])(this, "handleTouchStart", function (e) {
      // TODO: fix touch event
      _document["default"].addEventListener('touchend', _this.touchend);
      _document["default"].addEventListener('touchmove', _this.touchmove);
      if (_this.setAnchor) {
        var pos = _this.getTouchPosition(e);
        _this.setAnchor(_this.getDistanceToTrack(pos));
      }
      _this.toggleMouseOver();
    });
    (0, _defineProperty2["default"])(this, "touchmove", function (e) {
      // TODO: touch not tested
      var pos = _this.getTouchPosition(e);
      _this.valueListener(_this.getDistanceToTrack(pos));
    });
    (0, _defineProperty2["default"])(this, "touchend", function () {
      _document["default"].removeEventListener('touchend', _this.touchend);
      _document["default"].removeEventListener('touchmove', _this.touchmove);
      _this.toggleMouseOver();
    });
    this.vertical = vertical;
    this.valueListener = valueListener;
    this.toggleMouseOver = toggleMouseOver;
    this.track = track;
    this.setAnchor = setAnchor;
  }
  return (0, _createClass2["default"])(MouseEventHandler, [{
    key: "getMousePos",
    value: function getMousePos(e) {
      return this.vertical ? e.clientY : e.clientX;
    }
  }, {
    key: "getTouchPosition",
    value: function getTouchPosition(e) {
      return this.vertical ? e.touches[0].clientY : e.touches[0].clientX;
    }
  }, {
    key: "getDistanceToTrack",
    value: function getDistanceToTrack(pos) {
      if (!this.track.current) {
        return 0;
      }
      var trackRect = this.track.current.getBoundingClientRect();
      return pos - (this.vertical ? trackRect.bottom : trackRect.left);
    }
  }]);
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZG9jdW1lbnQiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIm5vcGUiLCJNb3VzZUV2ZW50SGFuZGxlciIsImV4cG9ydHMiLCJfcmVmIiwiX3RoaXMiLCJfcmVmJHZlcnRpY2FsIiwidmVydGljYWwiLCJfcmVmJHZhbHVlTGlzdGVuZXIiLCJ2YWx1ZUxpc3RlbmVyIiwiX3JlZiR0b2dnbGVNb3VzZU92ZXIiLCJ0b2dnbGVNb3VzZU92ZXIiLCJ0cmFjayIsIl9yZWYkc2V0QW5jaG9yIiwic2V0QW5jaG9yIiwiX2NsYXNzQ2FsbENoZWNrMiIsIl9kZWZpbmVQcm9wZXJ0eTIiLCJlIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwibW91c2V1cCIsIm1vdXNlbW92ZSIsInBvcyIsImdldE1vdXNlUG9zIiwiZ2V0RGlzdGFuY2VUb1RyYWNrIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInByZXZlbnREZWZhdWx0IiwidG91Y2hlbmQiLCJ0b3VjaG1vdmUiLCJnZXRUb3VjaFBvc2l0aW9uIiwiX2NyZWF0ZUNsYXNzMiIsImtleSIsInZhbHVlIiwiY2xpZW50WSIsImNsaWVudFgiLCJ0b3VjaGVzIiwiY3VycmVudCIsInRyYWNrUmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImJvdHRvbSIsImxlZnQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zcmMvY29tbW9uL3NsaWRlci9tb3VzZS1ldmVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG4vLyBDb3B5cmlnaHQgY29udHJpYnV0b3JzIHRvIHRoZSBrZXBsZXIuZ2wgcHJvamVjdFxuXG5pbXBvcnQgZG9jdW1lbnQgZnJvbSAnZ2xvYmFsL2RvY3VtZW50JztcbmltcG9ydCB7XG4gIFJlZk9iamVjdCxcbiAgVG91Y2hFdmVudCxcbiAgVG91Y2hFdmVudEhhbmRsZXIsXG4gIE1vdXNlRXZlbnRIYW5kbGVyIGFzIFJlYWN0TW91c2VFdmVudEhhbmRsZXIsXG4gIE1vdXNlRXZlbnRcbn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtTdHlsZVJhbmdlU2xpZGVyVHlwZX0gZnJvbSAnLi9zbGlkZXInO1xuXG5mdW5jdGlvbiBub3BlKCkge1xuICByZXR1cm47XG59XG5cbnR5cGUgTW91c2VFdmVudEhhbmRsZXJQcm9wcyA9IHtcbiAgdmVydGljYWw6IGJvb2xlYW47XG4gIHZhbHVlTGlzdGVuZXI6IChkaXN0YW5jZTogbnVtYmVyKSA9PiB2b2lkO1xuICB0b2dnbGVNb3VzZU92ZXI6ICgpID0+IHZvaWQ7XG4gIHRyYWNrOiBSZWZPYmplY3Q8U3R5bGVSYW5nZVNsaWRlclR5cGU+O1xuICBzZXRBbmNob3I/OiBudWxsIHwgKChkaXN0YW5jZTogbnVtYmVyKSA9PiB2b2lkKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdXNlRXZlbnRIYW5kbGVyIHtcbiAgcHJpdmF0ZSB2ZXJ0aWNhbDogYm9vbGVhbjtcbiAgcHJpdmF0ZSB2YWx1ZUxpc3RlbmVyOiAoZGlzdGFuY2U6IG51bWJlcikgPT4gdm9pZDtcbiAgcHJpdmF0ZSB0b2dnbGVNb3VzZU92ZXI6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgdHJhY2s6IFJlZk9iamVjdDxTdHlsZVJhbmdlU2xpZGVyVHlwZT47IC8vIFNldCBjb3JyZWN0IHR5cGVcbiAgcHJpdmF0ZSBzZXRBbmNob3I6IG51bGwgfCAoKGRpc3RhbmNlOiBudW1iZXIpID0+IHZvaWQpOyAvLyBTZXQgY29ycmVjdCB0eXBlXG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIHZlcnRpY2FsID0gZmFsc2UsXG4gICAgdmFsdWVMaXN0ZW5lciA9IG5vcGUsXG4gICAgdG9nZ2xlTW91c2VPdmVyID0gbm9wZSxcbiAgICB0cmFjayxcbiAgICBzZXRBbmNob3IgPSBudWxsXG4gIH06IE1vdXNlRXZlbnRIYW5kbGVyUHJvcHMpIHtcbiAgICB0aGlzLnZlcnRpY2FsID0gdmVydGljYWw7XG4gICAgdGhpcy52YWx1ZUxpc3RlbmVyID0gdmFsdWVMaXN0ZW5lcjtcbiAgICB0aGlzLnRvZ2dsZU1vdXNlT3ZlciA9IHRvZ2dsZU1vdXNlT3ZlcjtcbiAgICB0aGlzLnRyYWNrID0gdHJhY2s7XG4gICAgdGhpcy5zZXRBbmNob3IgPSBzZXRBbmNob3I7XG4gIH1cblxuICBoYW5kbGVNb3VzZURvd246IFJlYWN0TW91c2VFdmVudEhhbmRsZXIgPSAoZTogTW91c2VFdmVudCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm1vdXNldXApO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICBpZiAodGhpcy5zZXRBbmNob3IpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuZ2V0TW91c2VQb3MoZSk7XG4gICAgICB0aGlzLnNldEFuY2hvcih0aGlzLmdldERpc3RhbmNlVG9UcmFjayhwb3MpKTtcbiAgICB9XG4gICAgdGhpcy50b2dnbGVNb3VzZU92ZXIoKTtcbiAgfTtcblxuICBwcml2YXRlIGdldE1vdXNlUG9zKGU6IE1vdXNlRXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJ0aWNhbCA/IGUuY2xpZW50WSA6IGUuY2xpZW50WDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VG91Y2hQb3NpdGlvbihlOiBUb3VjaEV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMudmVydGljYWwgPyBlLnRvdWNoZXNbMF0uY2xpZW50WSA6IGUudG91Y2hlc1swXS5jbGllbnRYO1xuICB9XG5cbiAgcHJpdmF0ZSBtb3VzZXVwID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm1vdXNldXApO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICB0aGlzLnRvZ2dsZU1vdXNlT3ZlcigpO1xuICB9O1xuXG4gIHByaXZhdGUgZ2V0RGlzdGFuY2VUb1RyYWNrKHBvczogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLnRyYWNrLmN1cnJlbnQpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBjb25zdCB0cmFja1JlY3QgPSB0aGlzLnRyYWNrLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIHBvcyAtICh0aGlzLnZlcnRpY2FsID8gdHJhY2tSZWN0LmJvdHRvbSA6IHRyYWNrUmVjdC5sZWZ0KTtcbiAgfVxuXG4gIHByaXZhdGUgbW91c2Vtb3ZlID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRNb3VzZVBvcyhlKTtcbiAgICB0aGlzLnZhbHVlTGlzdGVuZXIodGhpcy5nZXREaXN0YW5jZVRvVHJhY2socG9zKSk7XG4gIH07XG5cbiAgaGFuZGxlVG91Y2hTdGFydDogVG91Y2hFdmVudEhhbmRsZXIgPSAoZTogVG91Y2hFdmVudCkgPT4ge1xuICAgIC8vIFRPRE86IGZpeCB0b3VjaCBldmVudFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy50b3VjaGVuZCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy50b3VjaG1vdmUpO1xuICAgIGlmICh0aGlzLnNldEFuY2hvcikge1xuICAgICAgY29uc3QgcG9zID0gdGhpcy5nZXRUb3VjaFBvc2l0aW9uKGUpO1xuICAgICAgdGhpcy5zZXRBbmNob3IodGhpcy5nZXREaXN0YW5jZVRvVHJhY2socG9zKSk7XG4gICAgfVxuICAgIHRoaXMudG9nZ2xlTW91c2VPdmVyKCk7XG4gIH07XG5cbiAgcHJpdmF0ZSB0b3VjaG1vdmUgPSAoZTogVG91Y2hFdmVudCkgPT4ge1xuICAgIC8vIFRPRE86IHRvdWNoIG5vdCB0ZXN0ZWRcbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldFRvdWNoUG9zaXRpb24oZSk7XG4gICAgdGhpcy52YWx1ZUxpc3RlbmVyKHRoaXMuZ2V0RGlzdGFuY2VUb1RyYWNrKHBvcykpO1xuICB9O1xuXG4gIHByaXZhdGUgdG91Y2hlbmQgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLnRvdWNoZW5kKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLnRvdWNobW92ZSk7XG4gICAgdGhpcy50b2dnbGVNb3VzZU92ZXIoKTtcbiAgfTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUdBLElBQUFBLFNBQUEsR0FBQUMsc0JBQUEsQ0FBQUMsT0FBQTtBQUhBO0FBQ0E7O0FBWUEsU0FBU0MsSUFBSUEsQ0FBQSxFQUFHO0VBQ2Q7QUFDRjtBQUFDLElBVW9CQyxpQkFBaUIsR0FBQUMsT0FBQTtFQUtvQjs7RUFFeEQsU0FBQUQsa0JBQUFFLElBQUEsRUFNMkI7SUFBQSxJQUFBQyxLQUFBO0lBQUEsSUFBQUMsYUFBQSxHQUFBRixJQUFBLENBTHpCRyxRQUFRO01BQVJBLFFBQVEsR0FBQUQsYUFBQSxjQUFHLEtBQUssR0FBQUEsYUFBQTtNQUFBRSxrQkFBQSxHQUFBSixJQUFBLENBQ2hCSyxhQUFhO01BQWJBLGFBQWEsR0FBQUQsa0JBQUEsY0FBR1AsSUFBSSxHQUFBTyxrQkFBQTtNQUFBRSxvQkFBQSxHQUFBTixJQUFBLENBQ3BCTyxlQUFlO01BQWZBLGVBQWUsR0FBQUQsb0JBQUEsY0FBR1QsSUFBSSxHQUFBUyxvQkFBQTtNQUN0QkUsS0FBSyxHQUFBUixJQUFBLENBQUxRLEtBQUs7TUFBQUMsY0FBQSxHQUFBVCxJQUFBLENBQ0xVLFNBQVM7TUFBVEEsU0FBUyxHQUFBRCxjQUFBLGNBQUcsSUFBSSxHQUFBQSxjQUFBO0lBQUEsSUFBQUUsZ0JBQUEsbUJBQUFiLGlCQUFBO0lBQUEsSUFBQWMsZ0JBQUE7SUFBQSxJQUFBQSxnQkFBQTtJQUFBLElBQUFB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