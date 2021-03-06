var babelHelpers = require('./babel-helpers.js');
/**
 * MUI React select module
 * @module react/select
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = babelHelpers.interopRequireDefault(_react);

var _forms = require('../js/lib/forms');

var formlib = babelHelpers.interopRequireWildcard(_forms);

var _jqLite = require('../js/lib/jqLite');

var jqLite = babelHelpers.interopRequireWildcard(_jqLite);

var _util = require('../js/lib/util');

var util = babelHelpers.interopRequireWildcard(_util);

var _helpers = require('./_helpers');

var _option = require('./option');

var _option2 = babelHelpers.interopRequireDefault(_option);

var PropTypes = _react2.default.PropTypes;

var HAS_TOUCHSTART = typeof document !== 'undefined' && 'ontouchstart' in document.documentElement;

/**
 * Select constructor
 * @class
 */

var Select = function (_React$Component) {
  babelHelpers.inherits(Select, _React$Component);

  function Select(props) {
    babelHelpers.classCallCheck(this, Select);

    // warn if value defined but onChange is not
    var _this = babelHelpers.possibleConstructorReturn(this, (Select.__proto__ || Object.getPrototypeOf(Select)).call(this, props));

    _this.state = {
      showMenu: false
    };
    if (props.readOnly === false && props.value !== undefined && props.onChange === null) {
      util.raiseError(_helpers.controlledMessage, true);
    }

    var required = props.required,
        value = props.value,
        children = props.children;


    _this.state.value = value;
    if (value === undefined && required && children.length > 0) {

      _this.state.value = children[0].props.value;
    }

    // bind callback function
    var cb = util.callback;

    _this.onInnerChangeCB = cb(_this, 'onInnerChange');
    _this.onInnerMouseDownCB = cb(_this, 'onInnerMouseDown');

    _this.onOuterClickCB = cb(_this, 'onOuterClick');
    _this.onOuterKeyDownCB = cb(_this, 'onOuterKeyDown');

    _this.hideMenuCB = cb(_this, 'hideMenu');
    _this.onMenuChangeCB = cb(_this, 'onMenuChange');
    return _this;
  }

  babelHelpers.createClass(Select, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // disable MUI CSS/JS
      this.refs.selectEl._muiSelect = true;
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (typeof nextProps.value !== 'undefined') {
        this.setState({ value: nextProps.value });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // ensure that doc event listners have been removed
      jqLite.off(window, 'resize', this.hideMenuCB);
      jqLite.off(document, 'click', this.hideMenuCB);
    }
  }, {
    key: 'onInnerChange',
    value: function onInnerChange(ev) {
      var value = ev.target.value;

      // update state
      this.setState({ value: value });
    }
  }, {
    key: 'onInnerMouseDown',
    value: function onInnerMouseDown(ev) {
      // only left clicks & check flag
      if (ev.button !== 0 || this.props.useDefault) return;

      // prevent built-in menu from opening
      ev.preventDefault();
    }
  }, {
    key: 'onOuterClick',
    value: function onOuterClick(ev) {
      // only left clicks, return if <select> is disabled
      if (ev.button !== 0 || this.refs.selectEl.disabled) return;

      // execute callback
      var fn = this.props.onClick;
      fn && fn(ev);

      // exit if preventDefault() was called
      if (ev.defaultPrevented || this.props.useDefault) return;

      // focus wrapper
      this.refs.wrapperEl.focus();

      // open custom menu
      this.showMenu();
    }
  }, {
    key: 'onOuterKeyDown',
    value: function onOuterKeyDown(ev) {
      // execute callback
      var fn = this.props.onKeyDown;
      fn && fn(ev);

      // exit if preventDevault() was called or useDefault is true
      if (ev.defaultPrevented || this.props.useDefault) return;

      if (this.state.showMenu === false) {
        var keyCode = ev.keyCode;

        // spacebar, down, up
        if (keyCode === 32 || keyCode === 38 || keyCode === 40) {
          // prevent default browser action
          ev.preventDefault();

          // open custom menu
          this.showMenu();
        }
      }
    }
  }, {
    key: 'showMenu',
    value: function showMenu(ev) {
      // check useDefault flag
      if (this.props.useDefault) return;

      // add event listeners
      jqLite.on(window, 'resize', this.hideMenuCB);
      jqLite.on(document, 'click', this.hideMenuCB);

      // re-draw
      this.setState({ showMenu: true });
    }
  }, {
    key: 'hideMenu',
    value: function hideMenu(ev) {
      var target = ev.target;

      if (this.refs.menu && target.offsetParent === this.refs.menu.refs.wrapperEl && target.hasAttribute('disabled')) {
        return;
      }
      // remove event listeners
      jqLite.off(window, 'resize', this.hideMenuCB);
      jqLite.off(document, 'click', this.hideMenuCB);

      // re-draw
      this.setState({ showMenu: false });

      // refocus
      this.refs.wrapperEl.focus();
    }
  }, {
    key: 'onMenuChange',
    value: function onMenuChange(value) {
      if (this.props.readOnly) return;

      // update inner <select> and dispatch 'change' event
      this.refs.selectEl.value = value;
      util.dispatchEvent(this.refs.selectEl, 'change');
    }
  }, {
    key: 'render',
    value: function render() {
      var menuElem = void 0;
      var value = this.state.value;


      if (this.state.showMenu) {
        menuElem = _react2.default.createElement(Menu, {
          ref: 'menu',
          optionEls: this.refs.selectEl.children,
          wrapperEl: this.refs.wrapperEl,
          onChange: this.onMenuChangeCB,
          onClose: this.hideMenuCB
        });
      }

      // set tab index so user can focus wrapper element
      var tabIndexWrapper = '-1',
          tabIndexInner = '0';

      if (this.props.useDefault === false) {
        tabIndexWrapper = '0';
        tabIndexInner = '-1';
      }

      var _props = this.props,
          children = _props.children,
          className = _props.className,
          style = _props.style,
          label = _props.label,
          defaultValue = _props.defaultValue,
          readOnly = _props.readOnly,
          useDefault = _props.useDefault,
          name = _props.name,
          required = _props.required,
          floatingLabel = _props.floatingLabel,
          invalid = _props.invalid,
          reactProps = babelHelpers.objectWithoutProperties(_props, ['children', 'className', 'style', 'label', 'defaultValue', 'readOnly', 'useDefault', 'name', 'required', 'floatingLabel', 'invalid']);


      var cls = {};
      var input_cls = {};
      cls['mui-select ' + className] = true;
      cls['mui-select--float-label'] = floatingLabel;

      var emptyOption = required ? null : this.props.emptyOption;

      var isNotEmpty = Boolean((value || '').toString());

      input_cls['mui--is-empty'] = !isNotEmpty;
      input_cls['mui--is-not-empty'] = isNotEmpty || !emptyOption;
      input_cls['mui--is-invalid'] = invalid;

      return _react2.default.createElement(
        'div',
        babelHelpers.extends({}, reactProps, {
          ref: 'wrapperEl',
          tabIndex: tabIndexWrapper,
          style: style,
          className: util.classNames(cls),
          onClick: this.onOuterClickCB,
          onKeyDown: this.onOuterKeyDownCB
        }),
        _react2.default.createElement(
          'select',
          {
            ref: 'selectEl',
            name: name,
            tabIndex: tabIndexInner,
            value: value,
            defaultValue: defaultValue,
            readOnly: readOnly,
            onChange: this.onInnerChangeCB,
            required: required,
            onMouseDown: this.onInnerMouseDownCB,
            className: util.classNames(input_cls)
          },
          '   ',
          required ? null : this.props.emptyOption,
          children
        ),
        _react2.default.createElement(
          'label',
          null,
          label
        ),
        menuElem
      );
    }
  }]);
  return Select;
}(_react2.default.Component);

/**
 * Menu constructor
 * @class
 */


Select.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  name: PropTypes.string,
  defaultValue: PropTypes.string,
  readOnly: PropTypes.bool,
  useDefault: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,

  floatingLabel: PropTypes.bool,
  required: PropTypes.bool,
  emptyOption: PropTypes.element
};
Select.defaultProps = {
  className: '',
  name: '',
  readOnly: false,
  useDefault: HAS_TOUCHSTART,
  onChange: null,
  onClick: null,
  onKeyDown: null,
  emptyOption: _react2.default.createElement(_option2.default, { value: '', label: '' })
};

var Menu = function (_React$Component2) {
  babelHelpers.inherits(Menu, _React$Component2);

  function Menu(props) {
    babelHelpers.classCallCheck(this, Menu);

    var _this2 = babelHelpers.possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).call(this, props));

    _this2.state = {
      origIndex: null,
      currentIndex: null
    };


    _this2.onKeyDownCB = util.callback(_this2, 'onKeyDown');
    return _this2;
  }

  babelHelpers.createClass(Menu, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var optionEls = this.props.optionEls;

      var selectedPos = 0;

      // get current selected position
      for (var i = optionEls.length - 1; i > -1; i--) {
        if (optionEls[i].selected) {
          selectedPos = i;
        }
      }
      this.setState({ origIndex: selectedPos, currentIndex: selectedPos });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // prevent scrolling
      util.enableScrollLock();

      // set position
      var props = formlib.getMenuPositionalCSS(this.props.wrapperEl, this.props.optionEls.length, this.state.currentIndex);

      var el = this.refs.wrapperEl;
      jqLite.css(el, props);
      jqLite.scrollTop(el, props.scrollTop);

      // attach keydown handler
      jqLite.on(document, 'keydown', this.onKeyDownCB);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // remove scroll lock
      util.disableScrollLock(true);

      // remove keydown handler
      jqLite.off(document, 'keydown', this.onKeyDownCB);
    }
  }, {
    key: 'onClick',
    value: function onClick(pos, ev) {
      // don't allow events to bubble
      ev.stopPropagation();
      this.selectAndDestroy(pos, ev);
    }
  }, {
    key: 'onKeyDown',
    value: function onKeyDown(ev) {
      var keyCode = ev.keyCode;

      // tab
      if (keyCode === 9) return this.destroy();

      // escape | up | down | enter
      if (keyCode === 27 || keyCode === 40 || keyCode === 38 || keyCode === 13) {
        ev.preventDefault();
      }

      if (keyCode === 27) this.destroy();else if (keyCode === 40) this.increment();else if (keyCode === 38) this.decrement();else if (keyCode === 13) this.selectAndDestroy();
    }
  }, {
    key: 'increment',
    value: function increment() {
      if (this.state.currentIndex === this.props.optionEls.length - 1) {
        return;
      }
      this.setState({ currentIndex: this.state.currentIndex + 1 });
    }
  }, {
    key: 'decrement',
    value: function decrement() {
      if (this.state.currentIndex === 0) {
        return;
      }
      this.setState({ currentIndex: this.state.currentIndex - 1 });
    }
  }, {
    key: 'selectAndDestroy',
    value: function selectAndDestroy(pos, ev) {
      pos = pos === undefined ? this.state.currentIndex : pos;

      var optEl = this.props.optionEls[pos];
      if (optEl.disabled) {
        return;
      }

      // handle onChange
      if (pos !== this.state.origIndex) {
        this.props.onChange(optEl.value);
      }

      // close menu
      this.destroy(ev);
    }
  }, {
    key: 'destroy',
    value: function destroy(ev) {
      this.props.onClose(ev);
    }
  }, {
    key: 'render',
    value: function render() {
      var optionEls = this.props.optionEls;
      var currentIndex = this.state.currentIndex;


      var menuItems = [];
      var cls = void 0;

      // define menu items
      for (var i = 0; i < optionEls.length; i++) {
        var optEl = optionEls[i];
        var extraProps = {
          onClick: this.onClick.bind(this, i)
        };
        cls = '';

        if (i === currentIndex) {
          cls = 'mui--is-selected ';
        }
        if (optEl.disabled) {
          cls += 'mui--is-disabled';
          extraProps.disabled = true;
          extraProps.onClick = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            console.debug('DISABLED');
          };
        }

        // add custom css class from <Option> component
        cls += optEl.className;

        menuItems.push(_react2.default.createElement(
          'div',
          babelHelpers.extends({
            key: i,
            className: cls
          }, extraProps),
          optEl.textContent
        ));
      }

      return _react2.default.createElement(
        'div',
        { ref: 'wrapperEl', className: 'mui-select__menu' },
        menuItems
      );
    }
  }]);
  return Menu;
}(_react2.default.Component);

/** Define module API */


Menu.propTypes = {
  optionEls: PropTypes.arrayOf(PropTypes.element),
  wrapperEl: PropTypes.element,
  onChange: PropTypes.func,
  onClose: PropTypes.func
};
Menu.defaultProps = {
  optionEls: [],
  wrapperEl: null,
  onChange: null,
  onClose: null
};
exports.default = Select;
module.exports = exports['default'];