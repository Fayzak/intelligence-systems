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

const GoalkeeperDT = {
    state: {
        command: null
    },
    root: {
        exec(mgr, state) {
            state.command = null
        },
        next: "goalVisible",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    goalVisible: {
        condition: (mgr, state) => (!mgr.getVisible("b")) || mgr.getGameObjectDistance("b") > 10,
        trueCond: "farBall",
        falseCond: "closeBall",
    },
    farBall: {
        condition: (mgr, state) => (12 < mgr.getDistance("fprc") < 16) 
                                    && (20 < mgr.getDistance("fprb") < 28)
                                    && (20 < mgr.getDistance("fprt") < 28),
        trueCond: "goBackToGate",
        falseCond: "searchGate",
    },
    goBackToGate: {
        exec(mgr, state) {
            state.command = ["dash", "-20"]
        },
        next: "sendCommand",
    },
    searchGate: {
        condition: (mgr, state) => mgr.getVisible("gr"),
        trueCond: "checkPositionInGate",
        falseCond: "turnToGate",
    },
    checkPositionInGate: {
        condition: (mgr, state) => mgr.getDistance("gr") > 5,
        trueCond: "moveToGate",
        falseCond: "searchBall",
    },
    moveToGate: {
        exec(mgr, state) {
            state.command = ["dash", "100"]
        },
        next: "sendCommand",
    },
    searchBall: {
        condition: (mgr, state) => mgr.getVisible("b"),
        trueCond: "turnToBall",
        falseCond: "keepSearchBall",
    },
    turnToBall: {
        exec(mgr, state) {
            state.command = ["turn", `${mgr.getGameObjectAngle("b")}`]
        },
        next: "sendCommand",
    },
    keepSearchBall: {
        exec(mgr, state) {
            state.command = ["turn", "45"]
        },
        next: "sendCommand",
    },
    turnToGate: {
        exec(mgr, state) {
            state.command = ["turn", "30"]
        },
        next: "sendCommand",
    },
    closeBall: {
        condition: (mgr, state) => mgr.getGameObjectDistance("b") < 2,
        trueCond: "catchBall",
        falseCond: "kickBall",
    },
    catchBall: {
        exec(mgr, state) {
            state.command = ["catch", `${mgr.getGameObjectAngle("b")}`]
        },
        next: "sendCommand",
    },
    kickBall: {
        condition: (mgr, state) => mgr.getVisible("gl") || mgr.getVisible("flt") || mgr.getVisible("flb"),
        trueCond: "kickHard",
        falseCond: "turnToOpponentGate",
    },
    kickHard: {
        exec(mgr, state) {
            state.command = ["kick", "100 0"]
        },
        next: "sendCommand",
    },
    turnToOpponentGate: {
        exec(mgr, state) {
            state.command = ["turn", "30"]
        },
        next: "sendCommand",
    },
}

module.exports = DecisionTree
