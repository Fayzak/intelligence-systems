const Flags = require('./flags')
const Utils = require('./utils')
const DTProcessor = require('./dt_processor.js')

const TAManager = require('./time_automata/manager')
// const UniversalDT = require('./decision_trees')
// const Manager = require('./manager')

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

StateMachine = {
    currentAction: "definePosition",

    getAction: () => {
        return this[this.currentAction].action
    },

    definePosition: {
        action: {action: "define_position"},
        onResult: (result) => {

        }
    }
}

class Controller {
    // constructor(actions) {
    //     this.actions = actions
    //     // this.actions = [
    //     //     // {action: "run", target: "frt"},
    //     //     // {action: "run", target: "frb"},
    //     //     // {action: "run", target: "flb"},
    //     //     // {action: "run", target: "flt"},
    //     //     // {action: "run", target: "fc"},
    //     //     {action: "kick", target: "gr"}
    //     // ]
    //     this.prevActions = actions
    //
    //     this.currentActionIndex = 0
    // }

    constructor(ta) {
        this.ta = ta
    }

    defineLeaderActions(agentState) {
        if (agentState.isHearedGo) {
            this.actions = [
                {action: "kick", target: "gr"}
            ]
            this.currentActionIndex = 0
        } else {
            this.actions = this.prevActions
        }
    }

    getCommand(agentState) {

        const action = TAManager.getAction(agentState, this.ta)

        console.info("ACION", action)

        return [action.n, action.v]

        // this.defineLeaderActions(agentState)
        //
        // const {action: action, ...actionParameters} = this.actions[this.currentActionIndex]
        //
        // let result = null
        //
        // switch (action) {
        //     case "run":
        //
        //         result = DTProcessor.run.execute(agentState, actionParameters)
        //
        //         const targetDistance = result.getResult()
        //
        //         if (targetDistance && targetDistance <= 3) {
        //             this.nextAction()
        //         }
        //
        //         return result.getCommand()
        //
        //     case "kick":
        //
        //         result = DTProcessor.kick.execute(agentState, actionParameters)
        //
        //         return result.getCommand()
        //
        //     case "follow":
        //
        //         result = DTProcessor.follow.execute(agentState, actionParameters)
        //
        //         return result.getCommand()
        //
        //     case "define_position":
        //
        //         result = DTProcessor.definePosition.execute(agentState, actionParameters)
        //
        //         const {isLeader, leaderName, side} = result.getResult()
        //         // console.info(isLeader, leaderName, side)
        //
        //         if (isLeader) {
        //             this.actions = [
        //                 // {action: "run", target: "frt"},
        //                 // {action: "run", target: "flb"},
        //                 // {action: "run", target: "flt"},
        //                 {action: "run", target: "fc"},
        //                 {action: "run", target: "fplc"},
        //                 // {action: "kick", target: "gr"}
        //             ]
        //         } else {
        //             this.actions = [
        //                 {action: "send_pass", target: leaderName, side: side}
        //             ]
        //         }
        //         this.prevActions = this.actions
        //
        //         break
        //
        //     case "defend_gate":
        //
        //         result = DTProcessor.defendGate.execute(agentState, actionParameters)
        //         // console.info(result.getCommand())
        //
        //         return result.getCommand()
        //     
        //     case "send_pass":
        //
        //         result = DTProcessor.sendPass.execute(agentState, actionParameters)
        //         console.info(`SEND_PASS - ${result.getCommand()}`)
        //
        //         return result.getCommand()
        // }

        return ["stay"]
    }

    nextAction() {
        this.currentActionIndex = (this.currentActionIndex + 1) % this.actions.length
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
