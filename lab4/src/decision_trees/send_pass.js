const Flags = require('../flags')
const Utils = require('../utils')

let State = {}
let IterationState = {}

module.exports = {
    init: function(agentState, actionParameters) {
        IterationState = {
            scorer: {
                name: actionParameters.target,
                visible: agentState.gameObjects.find(gameObject => gameObject.name === actionParameters.target)
            },
            side: actionParameters.side,
            ball: agentState.gameObjects.find(gameObject => gameObject.name === "b"),
            agent: {
                position: agentState.position,
                angle: agentState.angle
            },
            isPassed: agentState.isPassed,
            isSaidGo: agentState.isSaidGo,
        }
    },

    terminate: function() {
        State = {}
    },

    getRoot: function() {
        if (IterationState.isSaidGo && IterationState.isPassed) {
            return "actionWithScorer"
        } else {
            return "isBallVisible"
        }
    },

    isBallVisible: function() {
        // console.info("isBallVisible")
        if (IterationState.ball) {
            return "isBallNear"
        } else {
            return "seek"
        }
    },

    isBallNear: function() {
        // console.info("isBallNear")
        if (IterationState.ball.d < 1) {
            return "isPositionDefined"
        } else {
            return "isBallPositionDefined"
        }
    },

    isPositionDefined: function() {
        // console.info("isPositionDefined")
        if (IterationState.agent.position && IterationState.agent.angle) {
            return "isScorerVisible"
        } else {
            return "seek"
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
        // console.info("isBallPositionDefined")
        if (IterationState.agent.position && IterationState.agent.angle && IterationState.ball.x && IterationState.ball.y) {
            return "calculateBallPosition"
        } else {
            return "setVisibleBallPosition"
        }
    },

    calculateBallPosition: function() {
        // console.info("calculateBallPosition")
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
        // console.info("setVisibleBallPosition")
        IterationState.ball = {
            ...IterationState.ball,
            direction: IterationState.ball.angle,
            distance: IterationState.ball.d,
        }

        return "isBallAhead"
    },

    isBallAhead: function() {
        // console.info("isBallAhead")
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
    },

    isScorerVisible: function() {
        // console.info("isScorerVisible")
        setTimeout(() => {}, 10000) // Ждем немного чтобы забивающий подошел ?
        if (IterationState.scorer.visible) {
            return "isScorerTooFar"
        } else {
            return "dribbleBall"
        }
    },

    isScorerTooFar: function() {
        // console.info(IterationState.agent.position)
        // console.info("isScorerTooFar")
        if (IterationState.scorer.visible.d > 20) {
            return "isScorerFarAhead"
        } else {
            return "isScorerTooClose"
        }
    },

    isScorerTooClose: function() {
        // console.info("isScorerTooClose")
        if (IterationState.scorer.visible.d < 15) {
            return "actionWithScorer"
        } else {
            return "isScorerCloseAhead"
        }
    },

    isScorerCloseAhead: function() {
        // console.info("isScorerCloseAhead")
        if (Math.abs(Math.abs(IterationState.scorer.visible.angle) - 30) < 10) {
            return "actionWithScorer"
        } else {
            return "isOnTheLeft"
        }
    },

    isOnTheLeft: function() {
        // console.info("isOnTheLeft")
        if (IterationState.side === "l") {
            return "keepToTheLeft"
        } else {
            return "keepToTheRight"
        }
    },

    isScorerFarAhead: function() {
        // console.info("isScorerFarAhead")
        if (Math.abs(IterationState.scorer.visible.angle) < 10) {
            return "dribbleBall"
        } else {
            return "turnToScorer"
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

    dashSlightly: {
        terminate: true,
        getCommand: () => {
            return ["dash", 20]
        },
        getResult: () => {
        } 
    },

    dashNormally: {
        terminate: true,
        getCommand: () => {
            return ["dash", 70]
        },
        getResult: () => {
        } 
    },

    dribbleBall: {
        terminate: true,
        getCommand: () => {
            let angle = (IterationState.agent.position.x > 0) ? 45 : -45;
            return ["kick", 1, angle]
        },
        getResult: () => {
        } 
    },

    actionWithScorer: function() {
        if (IterationState.isPassed && IterationState.isSaidGo) {
            return "waitGollAfterPass"
        }
        if (IterationState.isSaidGo) {
            return "passToScorer"
        }
        return "sayGoToScorer"
    },

    waitGollAfterPass: {
        terminate: true,
        getCommand: () => {
            return ["stay"]
        },
        getResult: () => {
        }
    },

    sayGoToScorer: {
        terminate: true,
        getCommand: () => {
            IterationState.isSaidGo = true
            return ["say", "go"]
        },
        getResult: () => {
        }
    },

    passToScorer: {
        terminate: true,
        getCommand: () => {
            IterationState.isPassed = true
            return ["kick", 70, IterationState.scorer.visible.angle]
        },
        getResult: () => {
        }
    },

    turnToScorer: {
        terminate: true,
        getCommand: () => {
            return ["turn", IterationState.scorer.visible.angle]
        },
        getResult: () => {
        }
    },

    keepToTheRight: {
        terminate: true,
        getCommand: () => {
            return ["turn", IterationState.scorer.visible.angle + 30]
        },
        getResult: () => {
        } 
    },

    keepToTheLeft: {
        terminate: true,
        getCommand: () => {
            return ["turn", IterationState.scorer.visible.angle - 30]
        },
        getResult: () => {
        } 
    }
}
