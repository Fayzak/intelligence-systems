const Flags = require('../flags')
const Utils = require('../utils')

let State = {}
let IterationState = {}

module.exports = {
    init: function(agentState, actionParameters) {
        IterationState = {
            leader: {
                name: actionParameters.target,
                visible: agentState.gameObjects.find(gameObject => gameObject.name === actionParameters.target)
            },
            side: actionParameters.side,
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
        return "isLeaderVisible"
    },

    isLeaderVisible: function() {
        console.info("isLeaderVisible")
        if (IterationState.leader.visible) {
            return "isLeaderTooFar"
        } else {
            return "seek"
        }
    },

    isLeaderTooFar: function() {
        console.info("isLeaderTooFar")
        if (IterationState.leader.visible.d > 12) {
            return "isLeaderFarAhead"
        } else {
            return "isLeaderTooClose"
        }
    },

    isLeaderTooClose: function() {
        console.info("isLeaderTooClose")
        if (IterationState.leader.visible.d < 7) {
            return "dashSlightly"
        } else {
            return "isLeaderCloseAhead"
        }
    },

    isLeaderCloseAhead: function() {
        console.info("isLeaderCloseAhead")
        if (Math.abs(Math.abs(IterationState.leader.visible.angle) - 30) < 10) {
            return "dashNormally"
        } else {
            return "isOnTheLeft"
        }
    },

    isOnTheLeft: function() {
        console.info("isOnTheLeft")
        if (IterationState.side === "l") {
            return "keepToTheLeft"
        } else {
            return "keepToTheRight"
        }
    },

    isLeaderFarAhead: function() {
        console.info("isLeaderFarAhead")
        if (Math.abs(IterationState.leader.visible.angle) < 10) {
            return "dashHarshly"
        } else {
            return "turnToLeader"
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

    dashHarshly: {
        terminate: true,
        getCommand: () => {
            return ["dash", 100]
        },
        getResult: () => {
        } 
    },

    turnToLeader: {
        terminate: true,
        getCommand: () => {
            return ["turn", IterationState.leader.visible.angle]
        },
        getResult: () => {
        }
    },

    keepToTheRight: {
        terminate: true,
        getCommand: () => {
            return ["turn", IterationState.leader.visible.angle + 30]
        },
        getResult: () => {
        } 
    },

    keepToTheLeft: {
        terminate: true,
        getCommand: () => {
            return ["turn", IterationState.leader.visible.angle - 30]
        },
        getResult: () => {
        } 
    }
}
