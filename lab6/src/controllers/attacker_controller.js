const ActionProcessor = require("../action_processor")

class AttackController {

    constructor(positionName, lineName) {
        this.positionName = positionName
        this.lineName = lineName
        this.currentAction = "waitStart"
        this.queue = []
    }

    processResult([command, ...delay]) {
        this.queue = this.queue.concat(delay)
        return command
    }

    getCommand(agentState) {

        console.info("ATTACKER", this.currentAction, this.positionName, this.lineName)

        if (this.queue.length > 0) {
            return this.queue.shift()
        }

        switch (this.currentAction) {
            case "waitStart": {
                const enemySide = agentState.side === "l" ? "r" : "l"
                const flagName = `${this.positionName}${enemySide}${this.lineName}`

                return this.processResult(ActionProcessor.seekFlag(agentState, flagName))
            }

            case "takePosition": {
                const enemySide = agentState.side === "l" ? "r" : "l"
                const flagName = `${this.positionName}${enemySide}${this.lineName}`

                const position = agentState.flags.find(flag => flag.name === flagName)

                if (position !== undefined && position.distance < 10) {
                    this.currentAction = "wait"
                    return ["say", "ready"]
                }

                return this.processResult(ActionProcessor.run(agentState, flagName))
            }

            case "wait": {

                // if (Math.random() < 0.2) {
                //     return ["say", "ready"]
                // }
                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined && ball.distance < 10) {
                    this.currentAction = "kick"
                    return ["say", "busy"]
                }

                return this.processResult(ActionProcessor.seekBall(agentState))
            }
            case "kick": {
                const enemySide = agentState.side === "l" ? "r" : "l"
                const gateName = `g${enemySide}`

                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined &&
                    (ball.x < 0 && agentState.side === "l" || ball.x > 0 && agentState.side === "r")) {
                    this.currentAction = "takePosition"
                    return ["say", "busy"]
                }

                return this.processResult(ActionProcessor.kick(agentState, gateName, 35))
            }
        }

        return ["stay"]
    }

    onHear(agentState, tick, sender, message) {

        if (message.includes("goal")) {
            this.currentAction = "waitStart"
        }

        switch (this.currentAction) {
            case "waitStart":
                if (message === "play_on") {
                    this.queue.push(["say", "busy"])
                    this.currentAction = "takePosition"
                }
                break

            case "wait":
                if (message.includes(`go_p\"${agentState.teamName}\"${agentState.id}`)) {
                    this.queue.push(["say", "busy"])
                    this.currentAction = "kick"
                }
                break
        }
    }
}

module.exports = AttackController
