const Flags = require('./flags')
const Utils = require('./utils')
const UniversalDT = require('./decision_trees')
const Manager = require('./manager')

Searcher = {
    getDirection() {
        const nextDirection = this.directions[this.currentDirectionIndex]

        this.currentDirectionIndex = (this.currentDirectionIndex + 1) % this.directions.length

        return nextDirection
    },

    reset() {
        this.currentDirectionIndex = 0
    },

    directions: [45, 45, -72 - 90, -72, -72, -72, -72],
    currentDirectionIndex: 0
}

class Controller {
    constructor() {
        this.actions = [
            {action: "run", goal: "frt"},
            {action: "run", goal: "frb"},
            // {action: "run", goal: "flb"},
            // {action: "run", goal: "flt"},
            // {action: "run", goal: "fc"},
            {action: "kick", goal: "gr"}
        ]

        this.currentActionIndex = 0
    }

    getCommand(position, angle, flags, gameObjects) {

        let manager = new Manager(position, angle, flags, gameObjects)
        let act = manager.getAction(UniversalDT, manager)
        console.info(act)

        this.switchIfComplited(position, angle, flags, gameObjects)

        const {action: action, ...actionParameters} = this.actions[this.currentActionIndex]

        switch (action) {
            case "run":

                const visibleDestionation = flags.find(flag => flag.name === actionParameters["goal"])
                const destination = Flags[actionParameters["goal"]]

                return this.run(visibleDestionation, destination, position, angle)

            case "kick":

                const visibleGate = flags.find(flag => flag.name === actionParameters["goal"])
                const gate = Flags[actionParameters["goal"]]
                const ball = gameObjects.find(gameObject => gameObject.name === "b")

                return this.kick(visibleGate, gate, ball, position, angle)

        }

        return ["stay"]
    }

    switchIfComplited(position, angle, flags, gameObjects) {

        const {action: action, ...actionParameters} = this.actions[this.currentActionIndex]

        switch (action) {
            case "run":

                const visibleDestionation = flags.find(flag => flag.name === actionParameters["goal"])
                const destination = Flags[actionParameters["goal"]]

                if (this.checkRunComplited(visibleDestionation, destination, position, angle)) {
                    this.currentActionIndex = (this.currentActionIndex + 1) % this.actions.length
                }

                break
            case "kick":

                break
        }

    }

    getDirectionAndDistance(visibleDestionation, destination, position, angle) {

        if (!position || !angle) {

            if (!visibleDestionation) {
                return [null, null]
            }

            return [visibleDestionation.angle, visibleDestionation.d]
        }

        const beta = Utils.calculateRelativeAngle(position, destination)
        const direction = Utils.getAnglesDifference(beta, angle) 
        const distance = Utils.distance(position, destination)

        return [direction, distance]

    }

    checkRunComplited(visibleDestionation, destination, position, angle) {

        const [direction, distance] = this.getDirectionAndDistance(visibleDestionation, destination, position, angle)

        if (!direction || !distance) {
            return false
        }

        return distance < 3

    }

    run(visibleDestionation, destination, position, angle, flags) {

        const [direction, distance] = this.getDirectionAndDistance(visibleDestionation, destination, position, angle)

        if (!direction || !distance) {
            return ["turn", Searcher.getDirection()]
        }
        Searcher.reset()

        if (Math.abs(direction) > 10 * (1 + 10 / distance)) {
            return ["turn", direction]
        }

        return ["dash", 100]

    }

    kick(visibleGate, gate, ball, position, angle) {

        if (!ball) {
            return ["turn", Searcher.getDirection()]
        }
        Searcher.reset()

        if (ball.d < 1) {
            const [gateDirection, gateDistance] = this.getDirectionAndDistance(visibleGate, gate, position, angle)

            if (!gateDirection || !gateDistance) {
                if (position && position.x > 0) {
                    return ["kick", 10, 45] 
                }
                return ["kick", 10, -45] 
            }

            return ["kick", 100, gateDirection]
        }

        return this.run(ball, ball, position, angle)

    }

    onHear(tick, sender, message) {
        if (message.includes("goal") && this.actions[this.currentActionIndex].action === "kick") {
            this.currentActionIndex = (this.currentActionIndex + 1) % this.actions.length
        }
    }

}

module.exports = Controller
