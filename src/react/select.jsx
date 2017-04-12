/**
 * MUI React select module
 * @module react/select
 */

'use strict'

import React from 'react'

import * as formlib from '../js/lib/forms'
import * as jqLite from '../js/lib/jqLite'
import * as util from '../js/lib/util'
import { controlledMessage } from './_helpers'
import Option from './option'

const PropTypes = React.PropTypes

const HAS_TOUCHSTART = (typeof document !== 'undefined' &&
'ontouchstart' in document.documentElement)

/**
 * Select constructor
 * @class
 */
class Select extends React.Component {
  constructor (props) {
    super(props)

    // warn if value defined but onChange is not
    if (props.readOnly === false &&
      props.value !== undefined &&
      props.onChange === null) {
      util.raiseError(controlledMessage, true)
    }

    const {required, value, children} = props

    this.state.value = value
    if (value === undefined && required && children.length > 0) {

      this.state.value = children[0].props.value
    }

    // bind callback function
    let cb = util.callback

    this.onInnerChangeCB = cb(this, 'onInnerChange')
    this.onInnerMouseDownCB = cb(this, 'onInnerMouseDown')

    this.onOuterClickCB = cb(this, 'onOuterClick')
    this.onOuterKeyDownCB = cb(this, 'onOuterKeyDown')

    this.hideMenuCB = cb(this, 'hideMenu')
    this.onMenuChangeCB = cb(this, 'onMenuChange')
  }

  state = {
    showMenu: false,
  }

  static propTypes = {
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
    emptyOption: PropTypes.element,
  }

  static defaultProps = {
    className: '',
    name: '',
    readOnly: false,
    useDefault: HAS_TOUCHSTART,
    onChange: null,
    onClick: null,
    onKeyDown: null,
    emptyOption: <Option value="" label=""/>,
  }

  componentDidMount () {
    // disable MUI CSS/JS
    this.refs.selectEl._muiSelect = true
  }

  componentWillReceiveProps (nextProps) {
    this.setState({value: nextProps.value})
  }

  componentWillUnmount () {
    // ensure that doc event listners have been removed
    jqLite.off(window, 'resize', this.hideMenuCB)
    jqLite.off(document, 'click', this.hideMenuCB)
  }

  onInnerChange (ev) {
    let value = ev.target.value

    // update state
    this.setState({value})
  }

  onInnerMouseDown (ev) {
    // only left clicks & check flag
    if (ev.button !== 0 || this.props.useDefault) return

    // prevent built-in menu from opening
    ev.preventDefault()
  }

  onOuterClick (ev) {
    // only left clicks, return if <select> is disabled
    if (ev.button !== 0 || this.refs.selectEl.disabled) return

    // execute callback
    const fn = this.props.onClick
    fn && fn(ev)

    // exit if preventDefault() was called
    if (ev.defaultPrevented || this.props.useDefault) return

    // focus wrapper
    this.refs.wrapperEl.focus()

    // open custom menu
    this.showMenu()
  }

  onOuterKeyDown (ev) {
    // execute callback
    const fn = this.props.onKeyDown
    fn && fn(ev)

    // exit if preventDevault() was called or useDefault is true
    if (ev.defaultPrevented || this.props.useDefault) return

    if (this.state.showMenu === false) {
      let keyCode = ev.keyCode

      // spacebar, down, up
      if (keyCode === 32 || keyCode === 38 || keyCode === 40) {
        // prevent default browser action
        ev.preventDefault()

        // open custom menu
        this.showMenu()
      }
    }
  }

  showMenu (ev) {
    // check useDefault flag
    if (this.props.useDefault) return

    // add event listeners
    jqLite.on(window, 'resize', this.hideMenuCB)
    jqLite.on(document, 'click', this.hideMenuCB)

    // re-draw
    this.setState({showMenu: true})
  }

  hideMenu (ev) {
    const target = ev.target

    if (this.refs.menu
      && target.offsetParent == this.refs.menu.refs.wrapperEl
      && target.hasAttribute('disabled')) {
      return
    }
    // remove event listeners
    jqLite.off(window, 'resize', this.hideMenuCB)
    jqLite.off(document, 'click', this.hideMenuCB)

    // re-draw
    this.setState({showMenu: false})

    // refocus
    this.refs.wrapperEl.focus()
  }

  onMenuChange (value) {
    if (this.props.readOnly) return

    // update inner <select> and dispatch 'change' event
    this.refs.selectEl.value = value
    util.dispatchEvent(this.refs.selectEl, 'change')
  }

  render () {
    let menuElem
    const {value} = this.state

    if (this.state.showMenu) {
      menuElem = (
        <Menu
          ref="menu"
          optionEls={this.refs.selectEl.children}
          wrapperEl={this.refs.wrapperEl}
          onChange={this.onMenuChangeCB}
          onClose={this.hideMenuCB}
        />
      )
    }

    // set tab index so user can focus wrapper element
    let tabIndexWrapper = '-1',
      tabIndexInner = '0'

    if (this.props.useDefault === false) {
      tabIndexWrapper = '0'
      tabIndexInner = '-1'
    }

    const {
      children, className, style, label, defaultValue, readOnly,
      useDefault, name, required, floatingLabel, invalid, ...reactProps
    } = this.props

    let cls = {}
    let input_cls = {}
    cls['mui-select ' + className] = true
    cls['mui-select--float-label'] = floatingLabel

    const isNotEmpty = Boolean((value || '').toString())

    input_cls['mui--is-empty'] = !isNotEmpty
    input_cls['mui--is-not-empty'] = isNotEmpty
    input_cls['mui--is-invalid'] = invalid

    return (
      <div
        { ...reactProps }
        ref="wrapperEl"
        tabIndex={tabIndexWrapper}
        style={style}
        className={util.classNames(cls)}
        onClick={this.onOuterClickCB}
        onKeyDown={this.onOuterKeyDownCB}
      >
        <select
          ref="selectEl"
          name={name}
          tabIndex={tabIndexInner}
          value={value}
          defaultValue={defaultValue}
          readOnly={readOnly}
          onChange={this.onInnerChangeCB}
          required={required}
          onMouseDown={this.onInnerMouseDownCB}
          className={util.classNames(input_cls)}
        >   {required ? null : this.props.emptyOption}
          {children}
        </select>
        <label>{label}</label>
        {menuElem}
      </div>
    )
  }
}

/**
 * Menu constructor
 * @class
 */
class Menu extends React.Component {
  constructor (props) {
    super(props)

    this.onKeyDownCB = util.callback(this, 'onKeyDown')
  }

  state = {
    origIndex: null,
    currentIndex: null,
  }
  static propTypes = {
    optionEls: PropTypes.arrayOf(PropTypes.element),
    wrapperEl: PropTypes.element,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
  }
  static defaultProps = {
    optionEls: [],
    wrapperEl: null,
    onChange: null,
    onClose: null,
  }

  componentWillMount () {
    const {optionEls} = this.props
    let selectedPos = 0

    // get current selected position
    for (let i = optionEls.length - 1; i > -1; i--) {
      if (optionEls[i].selected) {
        selectedPos = i
      }
    }
    this.setState({origIndex: selectedPos, currentIndex: selectedPos})
  }

  componentDidMount () {
    // prevent scrolling
    util.enableScrollLock()

    // set position
    let props = formlib.getMenuPositionalCSS(
      this.props.wrapperEl,
      this.props.optionEls.length,
      this.state.currentIndex,
    )

    let el = this.refs.wrapperEl
    jqLite.css(el, props)
    jqLite.scrollTop(el, props.scrollTop)

    // attach keydown handler
    jqLite.on(document, 'keydown', this.onKeyDownCB)
  }

  componentWillUnmount () {
    // remove scroll lock
    util.disableScrollLock(true)

    // remove keydown handler
    jqLite.off(document, 'keydown', this.onKeyDownCB)
  }

  onClick (pos, ev) {
    // don't allow events to bubble
    ev.stopPropagation()
    this.selectAndDestroy(pos)
  }

  onKeyDown (ev) {
    let keyCode = ev.keyCode

    // tab
    if (keyCode === 9) return this.destroy()

    // escape | up | down | enter
    if (keyCode === 27 || keyCode === 40 || keyCode === 38 || keyCode === 13) {
      ev.preventDefault()
    }

    if (keyCode === 27) this.destroy()
    else if (keyCode === 40) this.increment()
    else if (keyCode === 38) this.decrement()
    else if (keyCode === 13) this.selectAndDestroy()
  }

  increment () {
    if (this.state.currentIndex === this.props.optionEls.length - 1) {
      return
    }
    this.setState({currentIndex: this.state.currentIndex + 1})
  }

  decrement () {
    if (this.state.currentIndex === 0) {
      return
    }
    this.setState({currentIndex: this.state.currentIndex - 1})
  }

  selectAndDestroy (pos) {
    pos = (pos === undefined) ? this.state.currentIndex : pos

    const optEl = this.props.optionEls[pos]
    if (optEl.disabled) {
      return
    }

    // handle onChange
    if (pos !== this.state.origIndex) {
      this.props.onChange(optEl.value)
    }

    // close menu
    this.destroy()
  }

  destroy () {
    this.props.onClose()
  }

  render () {
    const {optionEls} = this.props
    const {currentIndex} = this.state

    let menuItems = []
    let cls

    // define menu items
    for (let i = 0; i < optionEls.length; i++) {
      const optEl = optionEls[i]
      const extraProps = {
        onClick: this.onClick.bind(this, i),
      }
      cls = ''

      if (i === currentIndex) {
        cls = 'mui--is-selected '
      }
      if (optEl.disabled) {
        cls += 'mui--is-disabled'
        extraProps.disabled = true
        extraProps.onClick = (ev) => {
          ev.preventDefault()
          ev.stopPropagation()
          console.debug('DISABLED')
        }
      }

      // add custom css class from <Option> component
      cls += optEl.className

      menuItems.push(
        <div
          key={i}
          className={cls}
          {...extraProps}
        >
          {optEl.textContent}
        </div>,
      )
    }

    return <div ref="wrapperEl" className="mui-select__menu">{menuItems}</div>
  }
}

/** Define module API */
export default Select
