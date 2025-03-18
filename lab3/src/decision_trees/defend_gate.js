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
            center: {
                name: "fc",
                position: {
                    x: Flags["fc"].x,
                    y: Flags["fc"].y
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
        return "isPositionDefined"
    },

    isPositionDefined: function() {
        console.info("isPositionDefined")
        if (IterationState.agent.position && IterationState.agent.angle) {
            return "isBallVisible"
        } else {
            return "seek"
        }
    },

    isBallVisible: function() {
        console.info("isBallVisible")
        if (IterationState.ball) {
            return "isBallSafe"
        } else {
            return "seek"
        }
    },

    isBallSafe: function() {
        console.info("isBallSafe")
        if (IterationState.ball.x < 20) {
            return "canGoBack"
        } else {
            return "calculateBallPosition"
        }
    },

    canGoBack: function() {
        console.info("canGoBack")
        if (IterationState.agent.position.x < 40) {
            console.info("goBack")
            return "goBack"
        } else {
            console.info("stay")
            return "stay"
        }
    },

    stay: {
        terminate: true,
        getCommand: function() {
            return ["stay"]
        },
        getResult: function() {
        } 
    },

    goBack: {
        terminate: true,
        getCommand: function() {
            return ["dash", -100]
        },
        getResult: function() {
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

        return "isBallNear"
    },

    isBallNear: function() {
        console.info("isBallNear")
        if (IterationState.ball.d < 1) {
            return "calculateCenterPosition"
        } else {
            return "isBallAhead"
        }
    },

    calculateCenterPosition: function() {
        console.info("calculateCenterPosition")
        const position = IterationState.agent.position
        const angle = IterationState.agent.angle

        const destination = IterationState.center.position

        const beta = Utils.calculateRelativeAngle(position, destination)
        const direction = Utils.getAnglesDifference(beta, angle) 
        const distance = Utils.distance(position, destination)

        IterationState.center = {
            ...IterationState.center,
            direction: direction,
            distance: distance,
        }

        return "kickInCenter"
    },

    kickInCenter: {
        terminate: true,
        getCommand: () => {
            return ["kick", 100, IterationState.center.direction]
        },
        getResult: () => {
        }
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
            return ["dash", 100]
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
        } 
    },
}
