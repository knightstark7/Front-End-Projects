import { createStore } from './core.js'
import reducer from './reducer.js'
import withLogger from './logger.js'

const { attach, connect, dispatch } = createStore(withLogger(reducer)) //destructuring dừng ngoặc nhọn đối với object để lấy ra từng phần tử trong createStore

window.dispatch = dispatch

export {
    attach, 
    connect
}
