const Flags = require('../flags')
const Utils = require('../utils')

let State = {}
let IterationState = {}

module.exports = {
    init: function(agentState, actionParameters) {
        IterationState = {
            gate: {
                name: actionParameters.target,
                position: {
                    x: Flags[actionParameters.target].x,
                    y: Flags[actionParameters.target].y
                },
                visible: agentState.flags.find(flag => flag.name === actionParameters.target)
            },
            ball: agentState.gameObjects.find(gameObject => gameObject.name === "b"),
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
        return "isBallVisible"
    },

    isBallVisible: function() {
        console.info("isBallVisible")
        if (IterationState.ball) {
            return "isBallNear"
        } else {
            return "seek"
        }
    },

    isBallNear: function() {
        console.info("isBallNear")
        if (IterationState.ball.d < 1) {
            return "isPositionDefined"
        } else {
            return "isBallPositionDefined"
        }
    },

    isPositionDefined: function() {
        console.info("isPositionDefined")
        if (IterationState.agent.position && IterationState.agent.angle) {
            return "calculateGatePosition"
        } else {
            return "isGateVisible"
        }
    },

    calculateGatePosition: function() {
        console.info("calculateGatePosition")
        const position = IterationState.agent.position
        const angle = IterationState.agent.angle

        const destination = IterationState.gate.position

        const beta = Utils.calculateRelativeAngle(position, destination)
        const direction = Utils.getAnglesDifference(beta, angle) 
        const distance = Utils.distance(position, destination)

        IterationState.gate = {
            ...IterationState.gate,
            direction: direction,
            distance: distance,
        }

        return "kickInGate"
    },

    kickInGate: {
        terminate: true,
        getCommand: () => {
            return ["kick", 100, IterationState.gate.direction]
        },
        getResult: () => {
        }
    },

    isGateVisible: function() {
        console.info("isGateVisible")
        if (IterationState.gate.visible) {
            return "setVisibleGatePosition"
        } else {
            return "kickBackwards"
        }
    },

    setVisibleGatePosition: function() {
        console.info("setVisibleGatePosition")
        IterationState.gate = {
            ...IterationState.gate,
            direction: IterationState.gate.visible.angle,
            distance: IterationState.gate.visible.d,
        }

        return "kickInGate"
    },

    kickBackwards: {
        terminate: true,
        getCommand: () => {
            return ["kick", 10, 180]
        },
        getResult: () => {
        } 
    },

    seek: {
        terminate: true,
        getCommand: function() {
            return ["turn", 90]
        },
        getResult: function() {
            return IterationState.target.distance
        } 
    },

    isBallPositionDefined() {
        console.info("isBallPositionDefined")
        if (IterationState.agent.position && IterationState.agent.angle && IterationState.ball.x && IterationState.ball.y) {
            return "calculateBallPosition"
        } else {
            return "setVisibleBallPosition"
        }
    },

    calculateBallPosition: function() {
        console.info("calculateBallPosition")
        const position = IterationState.agent.position
        const angle = IterationState.agent.angle

        const destination = IterationState.ball

        const beta = Utils.calculateRelativeAngle(position, destination)
        const direction = Utils.getAnglesDifference(beta, angle) 
        const distance = Utils.distance(position, destination)

        IterationState.ball = {
            ...IterationState.ball,
            direction: direction,
            distance: distance,
        }

        return "isBallAhead"
    },

    setVisibleBallPosition: function() {
        console.info("setVisibleBallPosition")
        IterationState.ball = {
            ...IterationState.ball,
            direction: IterationState.ball.angle,
            distance: IterationState.ball.d,
        }

        return "isBallAhead"
    },

    isBallAhead: function() {
        console.info("isBallAhead")
        if (Math.abs(IterationState.ball.direction) < 10) {
            return "dashToBall"
        } else {
            return "turnToBall"
        }
    },

    turnToBall: {
        terminate: true,
        getCommand: () => {
            return ["turn", IterationState.ball.direction]
        },
        getResult: () => {
        } 
    },

    dashToBall: {
        terminate: true,
        getCommand: () => {
            return ["dash", 70]
        },
        getResult: () => {
        } 
    }
}
