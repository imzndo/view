import { nodeF, view } from './v' //框架
import { h, t } from './v-dom' //基本 html svg text 组件

import './index.css'

//无状态组件
const Main = h.div({ class: 'container' })
const redH1 = h.h1({ style: { color: 'red' } })


//状态组件
const BlinkTestView = nodeF<string>(v => {

    let n = 0
    let refresh = view()
    console.log('%cBlinkTestView 创建 props is ' + v.props, 'color:green')

    v.nodeRefresh = () => refresh(
        h.span({
            style: {
                color: ['red', 'orange', 'yellow', 'green'][++n % 4]
            }
        })([
            t(v.props)
        ])
    )

    const timer = setInterval(v.nodeRefresh, 500)

    v.nodeDestroy = () => {
        console.log('%cBlinkTestView 销毁 props is ' + v.props, 'color:red')
        clearInterval(timer)
        refresh()
    }
})

//无状态组件
const Button = nodeF<{ text: string, onClick: () => void }>(v => {
    let refresh = view()

    v.nodeRefresh = () => refresh(
        h.button({ onclick: v.props.onClick })([
            t(v.props.text)
        ])
    )
})


//无状态组件
const page0 = (p: { onClick: () => void }) =>
    Main([
        BlinkTestView('<<<<<页面1>>>>>>>>'),
        Button({ text: '跳到页面2', onClick: p.onClick })
    ])

//无状态组件
const page1 = (p: { onClick: () => void }) =>
    Main([
        h.div({ class: 'aaaaaaa' })([
            redH1([t`11111111111`]),
            redH1([t`11111111111`]),
            redH1([t`11111111111`]),
            BlinkTestView('<<<<<页面2>>>>>>'),
            h.h2({ style: { color: 'green' } })([t`222222222`]),
            h.h3({ style: { color: 'yellow' } })([t`33333333`])
        ]),
        Button({ text: '跳到页面1', onClick: p.onClick })
    ])

//有状态组件
const App = nodeF<null>(v => {
    let state = 0
    const refresh = view()

    const gotoPage = (n: number) => () => {
        state = n
        v.nodeRefresh()
    }

    const pageArr = [
        page0({ onClick: gotoPage(1) }),
        page1({ onClick: gotoPage(0) })
    ]

    v.nodeRefresh = () => refresh(
        h.div({})([
            pageArr[state]
        ])
    )
})

const node = view()(App(null))
if (node) {
    document.body.appendChild(node)
}