const ActionProcessor = require("../action_processor")
const Utils = require("../utils")

class FeederController {

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

        console.info("FEEDER", this.currentAction, this.positionName, this.lineName)

        if (this.queue.length > 0) {
            return this.queue.shift()
        }

        switch (this.currentAction) {
            case "waitStart": {
                const flagName = `${this.positionName}${agentState.side}${this.lineName}`

                return this.processResult(ActionProcessor.seekFlag(agentState, flagName))
            }

            case "takePosition": {

                const flagName = `${this.positionName}${agentState.side}${this.lineName}`
                const position = agentState.flags.find(flag => flag.name === flagName)

                if (position !== undefined && position.distance < 10) {
                    this.currentAction = "wait"
                    return ["stay"]
                }

                return this.processResult(ActionProcessor.run(agentState, flagName))
            }

            case "wait": {

                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined &&
                    (ball.x < -20 && agentState.side === "l" || ball.x > 20 && agentState.side === "r")) {
                    this.currentAction = "kick"
                    return ["stay"]
                }

                return this.processResult(ActionProcessor.seekBall(agentState))
            }

            case "kick": {
                const enemySide = agentState.side === "l" ? "r" : "l"
                const gateName = `g${enemySide}`

                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined &&
                    (ball.x > 0 && agentState.side === "l" || ball.x < 0 && agentState.side === "r")) {
                    this.currentAction = "takePosition"
                    return ["stay"]
                }

                return this.processResult(ActionProcessor.kick(agentState, gateName, 100))
            }
        }

        return ["stay"]
    }

    onHear(agentState, tick, sender, message) {

        if (message.includes("goal")) {
            this.currentAction = "waitStart"
        }

        if (sender == "referee") {
            switch (this.currentAction) {
                case "waitStart":
                    if (message === "play_on") {
                        this.currentAction = "takePosition"
                    }
                    break

                case "wait":
                    if (message === `go_p\"${agentState.teamName}\"${agentState.id}`) {
                        this.queue.push(["say", "busy"])
                        this.currentAction = "kick"
                    }
                    break
            }
        }

    }
}

module.exports = FeederController
