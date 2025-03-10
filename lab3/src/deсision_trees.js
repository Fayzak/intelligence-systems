class DecisionTree {
    constructor(nodes, actions) {
        this.nodes = nodes
        this.state = {
            actions: actions,
            currentActionIndex: 0,
        }
    }

    execureCondition(condition, agentState, treeState) {
        if (condition.execute(agentState, treeState)) {
            return condition.onTrue
        }
        return condition.onFalse
    }

    getCommand(position, angle, flags, gameObjects) {

        const agentState = {
            position: position,
            angle: angle,
            flags: flags,
            gameObjects: gameObjects,
        }

        let currentNode = this.nodes["root"]

        while (true) {
            console.info(currentNode)

            switch (currentNode.type) {
                case "action":
                    const [command, result] = currentNode.execute(agentState, this.state)
                    switch (command) {
                        case "navigate":
                            currentNode = this.nodes[result]
                            console.info(result)
                            break
                        case "terminate":
                            return result
                    }
                    break
                case "condition":
                    const nextNode = this.execureCondition(currentNode, agentState, this.state)
                    console.info(nextNode)
                    currentNode = this.nodes[nextNode]
                    break
            }
        }
    }
}

module.exports = DecisionTree
