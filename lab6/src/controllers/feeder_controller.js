const ActionProcessor = require("../action_processor")
const Utils = require("../utils")

class FeederController {

    constructor(line) {
        this.line = line
        this.currentAction = "waitStart"
        this.queue = []
    }

    processResult([command, ...delay]) {
        this.queue = this.queue.concat(delay)
        return command
    }

    getCommand(agentState) {

        console.info("FEEDER", this.currentAction, this.line)

        if (this.queue.length > 0) {
            return this.queue.shift()
        }

        switch (this.currentAction) {
            case "waitStart": {

                return this.processResult(ActionProcessor.seekBall(agentState))
            }

            case "takePosition": {

                const positionName = `fp${agentState.side}${this.line}`
                const position = agentState.flags.find(flag => flag.name === positionName)

                if (position !== undefined && position.distance < 20) {
                    this.currentAction = "wait"
                    return ["stay"]
                }

                return this.processResult(ActionProcessor.run(agentState, positionName))
            }

            case "wait": {

                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined &&
                    (ball.x < 10 && agentState.side === "l" || ball.x > -10 && agentState.side === "r")) {
                    this.currentAction = "lead"
                    return ["stay"]
                }

                return this.processResult(ActionProcessor.seekBall(agentState))
            }

            case "lead": {

                const enemySide = agentState.side === "l" ? "r" : "l"
                const positionName = `fp${enemySide}${this.line}`

                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")
                const teammates = agentState.gameObjects.filter(gameObject => gameObject.name.startsWith("p") &&
                                                                             gameObject.name.includes(agentState.teamName))
                if (ball !== undefined) {
                    if (ball.distance > 30) {
                        this.currentAction = "takePosition"
                        return ["stay"]
                    }
                    
                    const nearTeammates = teammates.filter(gameObject => Utils.distance(gameObject, ball) < ball.distance)
                    if (nearTeammates.length > 0) {
                        this.currentAction = "takePosition"
                        return ["stay"]
                    }
                }

                if (agentState.position.x > 10 && agentState.side === "l" ||
                    agentState.position.x < -10 && agentState.side === "r") {
                    this.currentAction = "pass"
                }

                return this.processResult(ActionProcessor.kick(agentState, positionName, -1))
            }

            case "pass": {
                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")
                const target = agentState.gameObjects.find(gameObject => gameObject.name.startsWith("p") &&
                                                                         gameObject.name.includes(agentState.teamName))

                if (target === undefined) {
                    this.currentAction = "kick"
                    return ["stay"]
                }

                const targetName = target.name.replaceAll("\"", "")

                if (ball === undefined) {
                    return this.processResult(ActionProcessor.seekBall(agentState))
                }

                if (ball.distance > 1) {
                    if (ball.angle > 10) {
                        return ["turn", ball.angle]
                    }
                    return ["dash", 80]
                }

                this.currentAction = "takePosition"
                this.queue.push(["say", `go_${targetName}`])
                this.queue.push(["say", `go_${targetName}`])
                this.queue.push(["say", `go_${targetName}`])

                return ["kick", 40, target.angle - 10]
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

                return this.processResult(ActionProcessor.kick(agentState, gateName))
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
