const ActionProcessor = require("../action_processor")
const Utils = require("../utils")

class CrazyController {

    constructor() {
        this.following = null
        this.currentAction = "waitStart"
        this.queue = []
    }

    processResult([command, ...delay]) {
        this.queue = this.queue.concat(delay)
        return command
    }

    getCommand(agentState) {

        console.info("CRAZY", this.currentAction)

        if (this.queue.length > 0) {
            return this.queue.shift()
        }

        switch (this.currentAction) {
            case "waitStart": {

                return this.processResult(ActionProcessor.seekBall(agentState, this.positionName))
            }

            case "attack": {
                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")
                const teammates = agentState.gameObjects.filter(gameObject => gameObject.name.startsWith("p") &&
                                                                             gameObject.name.includes(agentState.teamName))

                if (ball !== undefined) {
                    const nearTeammates = teammates.filter(gameObject => Utils.distance(gameObject, ball) < 10)
                    if (nearTeammates.length > 0) {
                        this.following = nearTeammates[0].name
                        this.currentAction = "following"
                        return ["stay"]
                    }
                }

                const enemySide = agentState.side === "l" ? "r" : "l"
                const gateName = `g${enemySide}`

                return this.processResult(ActionProcessor.kick(agentState, gateName, -1))
            }

            case "following": {

                if (this.following === null) {
                    this.currentAction = "attack"
                    return ["stay"]
                }

                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball === undefined) {
                    this.currentAction = "attack"
                    this.following = null
                    return ["stay"]
                }

                return this.processResult(ActionProcessor.follow(agentState, this.following))
            }

        }

        return ["stay"]
    }

    onHear(agentState, tick, sender, message) {

        if (message.includes("goal")) {
            this.currentAction = "waitStart"
        }

        if (message.includes(`kick_off_${agentState.side}`)) {
            this.currentAction = "attack"
        }

        switch (this.currentAction) {
            case "waitStart":
                if (message === "play_on") {
                    this.queue.push(["say", "busy"])
                    this.currentAction = "attack"
                }
                break
        }
    }
}

module.exports = CrazyController
