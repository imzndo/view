//{onclick}  混淆  =>  {onclick:window.onclick}
//A1 A2 A3 B C D -->  X Y A3 B D C A2
//不要去remove当前焦点的 Node !!

export type NodeLifeCycleFunc<P> = (v: NodeLifeCycle<P>) => void

export type NodeLifeCycle<P> = {
    props: P
    children: NodeData[]
    nodeRefresh: () => Node | null
    nodeDestroy: () => void
    childrenRefresh: () => void
    childrenDestroy: () => void
}

export type NodeData = {
    props: any
    children: NodeData[]
    func: NodeLifeCycleFunc<any>
    //key
}

// const emptyObject: any = {}
const emptyArray: any[] = []
const emptyFunc = () => null

export const node = <P>(func: NodeLifeCycleFunc<P>) => (props: P) => (children: NodeData[] = emptyArray) => (<NodeData>{ func, props, children })

export const nodeF = <P>(func: NodeLifeCycleFunc<P>) => (props: P) => (<NodeData>{ func, props, children: emptyArray })


//ReactCSStransitionGroup
//nodeRefresh change   view ?  viewList !

export const view = () => {
    let lifeCycle: NodeLifeCycle<any> | null
    let node: Node | null
    let func: NodeLifeCycleFunc<any> | null

    return (data?: NodeData) => {
        let nowFunc = data ? data.func : null

        //destroy
        if (func !== nowFunc) {
            if (lifeCycle != null) {
                lifeCycle.childrenDestroy()
                lifeCycle.nodeDestroy()
                lifeCycle = null
            }
            node = null
            func = nowFunc
        }

        if (func != null && data != null) {
            //init
            if (lifeCycle == null) {
                lifeCycle = {
                    props: data.props,
                    children: data.children,
                    nodeRefresh: emptyFunc,
                    childrenRefresh: emptyFunc,
                    nodeDestroy: emptyFunc,
                    childrenDestroy: emptyFunc
                }
                func(lifeCycle)
                node = lifeCycle.nodeRefresh()
                lifeCycle.childrenRefresh()
            }

            //refresh
            if (lifeCycle.props !== data.props) {
                lifeCycle.props = data.props
                node = lifeCycle.nodeRefresh()
            }
            if (lifeCycle.children !== data.children) {
                lifeCycle.children = data.children
                lifeCycle.childrenRefresh()
            }

        }
        return node
    }
}

export type NodeOpCmd = {
    removeAll(): void
    add(n: Node, index?: number): void
    remove(n: Node): void
}


//临时实现!!!
export const viewList = (nodeOpCmd: NodeOpCmd) => {

    let oldArr = [] as {
        nodeData: NodeData
        vf: (data?: NodeData | undefined) => Node | null
    }[]

    return (arr: NodeData[] = emptyArray) => {
        nodeOpCmd.removeAll()

        let old = oldArr
        oldArr = []

        //create new
        arr.forEach((v, i) => {
            let index = old.findIndex(item => item.nodeData.func === v.func)
            let vf = index == -1 ? view() : old[index].vf
            let node = vf(v)

            if (node != null) {
                nodeOpCmd.add(node)
            }
            if (index != -1) {
                old.splice(index, 1)
            }
            oldArr.push({
                nodeData: v,
                vf: vf
            })
        })

        //destroy
        old.forEach(v => v.vf())

    }
}