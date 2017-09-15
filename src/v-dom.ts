
import { node, nodeF, NodeData, NodeLifeCycle, viewList } from './v'

//text
export const t = nodeF<TemplateStringsArray | string | number>(
    v => {
        const node = document.createTextNode('')
        v.nodeRefresh = () => {
            node.textContent = v.props.toString()
            return node
        }
    }
)

export const createNodeOpCmd = (node: Node) => ({
    add: (n: Node, index?: number) => {
        if (index == null || index == node.childNodes.length) {
            node.appendChild(n)
        } else {
            node.insertBefore(n, node.childNodes[index + 1])
        }
    },
    remove: (n: Node) => {
        node.removeChild(n)
    },
    removeAll: () => {
        while (node.childNodes.length > 0) {
            node.removeChild(node.childNodes[0])
        }
    }
})

export type Style = string | Partial<CSSStyleDeclaration> | null

export const diffStyle = (el: HTMLElement | SVGElement, oldStyle: Style, newStyle: Style) => {
    if (typeof newStyle == 'string') {
        //el.style.cssText
        el.setAttribute('style', newStyle)
    } else if (newStyle == null) {
        //el.style.cssText
        el.removeAttribute('style')
    } else {
        //el.style.cssText
        el.removeAttribute('style')
        for (const k in newStyle) {
            if (newStyle[k] != null) {
                el.style[k] = newStyle[k]
            }
        }
    }
}

export const diffDataSet = (el: HTMLElement | SVGElement, oldDataset: { [name: string]: string } | null, newDataset: { [name: string]: string } | null) => {

}

const diffNodeProps = (node: HTMLElement | SVGElement, oldProps: any, newProps: any) => {
    for (let key in newProps) {

        const value = newProps[key]

        if (key == 'class') key = 'className'
        if (key == 'for') key = 'htmlFor'

        if (key.slice(0, 2) == 'on') {
            //diff event
            node[key] = (e: any) => value(e, node)
        } else if (key == 'style') {
            diffStyle(node, null, value)
        } else if (key == 'dataset') {
            diffDataSet(node, null, value)
        } else {
            //diff attributes
            node[key] = value
        }
    }
}

const __ = (nodeFunc: () => HTMLElement | SVGElement) => (v: NodeLifeCycle<any>) => {
    const node = nodeFunc()

    const vl = viewList(createNodeOpCmd(node))

    v.nodeRefresh = () => {
        diffNodeProps(node, {}, v.props)//<--------------
        return node
    }

    v.childrenRefresh = () => vl(v.children)
    v.childrenDestroy = vl
}

export const h: {
    //
    br: (p: { style?: Style, class?: string }) => NodeData
    hr: (p: { style?: Style, class?: string }) => NodeData
    input: (p: { style?: Style, class?: string }) => NodeData
    //
    body: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    div: (p: { innerHTML?: string, style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    canvas: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    iframe: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    label: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    section: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    header: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    h1: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    h2: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    h3: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    h4: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    h5: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    h6: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    footer: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    span: (p: { innerHTML?: string, style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    ul: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    li: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    button: (p: { onclick?: () => void, style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    a: (p: { href?: string, style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    p: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    strong: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    select: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    option: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
} = {} as any

export const s: {
    svg: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
    polygon: (p: { style?: Style, class?: string }) => (c?: NodeData[]) => NodeData
} = {} as any

'br|input|img|hr'
    .split('|')
    .forEach(v =>
        h[v] = nodeF(__(() => document.createElement(v)))
    )

'body|div|canvas|iframe|label|section|header|h1|h2|h3|h4|h5|h6|footer|span|ul|li|button|a|p|strong|select|option'
    .split('|')
    .forEach(v =>
        h[v] = node(__(() => document.createElement(v)))
    )

'svg|polygon'
    .split('|')
    .forEach(v =>
        s[v] = node(__(() => document.createElementNS('http://www.w3.org/2000/svg', v)))
    )