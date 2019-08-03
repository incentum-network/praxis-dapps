import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import 'resize-observer-polyfill/dist/ResizeObserver.global'
import App from './App'
import { isMobileDevice } from './utils'
import * as serviceWorker from './serviceWorker'
// tslint:disable-next-line:no-var-requires
require('react-web-vector-icons/fonts')

if (!isMobileDevice) {
   const root = document.getElementById('root')
   root !== null && root.setAttribute('style', 'overflow: auto;')
}

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
