const Flags = require('../flags')
const Utils = require('../utils')

let State = {}
let IterationState = {}

module.exports = {
    init: function(agentState, actionParameters) {
        IterationState = {
            target: {
                name: actionParameters.target,
                position: {
                    x: Flags[actionParameters.target].x,
                    y: Flags[actionParameters.target].y
                },
                visible: agentState.flags.find(flag => flag.name === actionParameters.target)
            },
            agent: {
                position: agentState.position,
                angle: agentState.angle
            }
        }
    },

    terminate: function() {
        State = {}
    },

    getRoot: function() {
        return "isPositionDefined"
    },

    isPositionDefined: function() {
        // console.info("isPositionDefined")
        if (IterationState.agent.position && IterationState.agent.angle) {
            return "calculateTargetPosition"
        } else {
            return "isFlagVisible"
        }
    },

    calculateTargetPosition: function() {
        // console.info("calculateTargetPosition")
        const position = IterationState.agent.position
        const angle = IterationState.agent.angle

        const destination = IterationState.target.position

        const beta = Utils.calculateRelativeAngle(position, destination)
        const direction = Utils.getAnglesDifference(beta, angle) 
        const distance = Utils.distance(position, destination)

        IterationState.target = {
            ...IterationState.target,
            direction: direction,
            distance: distance,
        }

        return "isTargetAhead"
    },

    isTargetAhead: function() {
        // console.info("isTargetAhead")
        if (Math.abs(IterationState.target.direction) < 10) {
            return "dashToTarget"
        } else {
            return "turnToTagret"
        }
    },

    dashToTarget: {
        terminate: true,
        getCommand: () => {
            return ["dash", 70]
        },
        getResult: () => {
            return IterationState.target.distance
        } 
    },

    turnToTagret: {
        terminate: true,
        getCommand: function() {
            return ["turn", IterationState.target.direction]
        },
        getResult: function() {
            return IterationState.target.distance
        } 
    },

    isFlagVisible: function() {
        // console.info("isFlagVisible")
        if (IterationState.target.visible) {
            return "setVisibleFlagPosition"
        } else {
            return "seekTarget"
        }
    },

    setVisibleFlagPosition: function() {
        // console.info("setVisibleFlagPosition")
        IterationState.target = {
            ...IterationState.target,
            direction: IterationState.target.visible.angle,
            distance: IterationState.target.visible.d,
        }

        return "isTargetAhead"
    },

    seekTarget: {
        terminate: true,
        getCommand: function() {
            return ["turn", 90]
        },
        getResult: function() {
            return IterationState.target.distance
        } 
    },
}
