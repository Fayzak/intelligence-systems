const ActionProcessor = require("../action_processor")

class GoalieController {

    constructor() {
        this.currentAction = "waitStart"
        this.queue = []
    }

    processResult([command, ...delay]) {
        this.queue = this.queue.concat(delay)
        return command
    }

    getCommand(agentState) {

        console.info("GOALIE", this.currentAction)

        if (this.queue.length > 0) {
            return this.queue.shift()
        }

        switch (this.currentAction) {
            case "waitStart": {

                return this.processResult(ActionProcessor.seekBall(agentState))
            }

            case "takePosition": {

                const gateName = `g${agentState.side}`
                const position = agentState.flags.find(flag => flag.name === gateName)

                if (position !== undefined && position.distance < 10) {
                    this.currentAction = "defend"
                    return ["stay"]
                }

                return this.processResult(ActionProcessor.run(agentState, gateName))
            }

            case "defend": {

                const gateName = `g${agentState.side}`
                const position = agentState.flags.find(flag => flag.name === gateName)
                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined && Math.abs(position.x - ball.x) < 30) {
                    this.currentAction = "kick"
                    return ["turn", ball.angle]
                }

                return this.processResult(ActionProcessor.seekBall(agentState))
            }
            case "catch": {
                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined && ball.distance <= 2) {
                    this.currentAction = "kick"
                    return ["catch", ball.angle]
                }

                return this.processResult(ActionProcessor.catch(agentState))
            }
            case "kick": {

                const gateName = `g${agentState.side}`
                const position = agentState.flags.find(flag => flag.name === gateName)
                const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

                if (ball !== undefined && Math.abs(position.x - ball.x) >= 30) {
                    this.currentAction = "takePosition"
                    return ["turn", position.angle]
                }

                return this.processResult(ActionProcessor.kick(agentState, "fc", 100))
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
        }
    }
}

module.exports = GoalieController
