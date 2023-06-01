export default function html([first, ...strings], ...values) {
    return values.reduce(
        (acc, cur) => acc.concat(cur, strings.shift()),
        [first]
    )   
    .filter(x => x && x !== true || x === 0) 
    .join('')
}

export function createStore(reducer) {
    let state = reducer()
    const roots = new Map() //sử dụng khi key là object 

    function render() {
        for(const [root, component] of roots) {
            const output = component()
            root.innerHTML = output
        }
    }

    return {
        attach(component, root) { // từ view vào root
            roots.set(root, component)
            render()
        },
        connect(selector = state => state) { // từ store sang view
            return component => (props, ...args) => 
                component(Object.assign({}, props, selector(state), ...args))
        },
        dispatch(action, ...args) {
            state = reducer(state, action, args)
            render()
        }
    }
}