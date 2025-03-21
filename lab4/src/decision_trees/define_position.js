const Flags = require('../flags')
const Utils = require('../utils')

let State = {}
let IterationState = {}

module.exports = {
    init: function(agentState, actionParameters) {
        IterationState = {
            players: agentState.gameObjects.filter(gameObject => gameObject.name.startsWith(`p"${agentState.teamName}"`))
        }
    },

    terminate: function() {
        State = {}
    },

    getRoot: function() {
        return "isPlayersVisible"
    },

    isPlayersVisible: function() {
        // console.info("isLeaderVisible")
        if (IterationState.players.length > 0) {
            return "defineLeader"
        } else {
            return "becomeLeader"
        }
    },

    becomeLeader: {
        terminate: true,
        getCommand: function() {
            return ["stay"]
        },
        getResult: function() {
            return {
                isLeader: true,
                leaderName: null,
                side: null
            }
        }
    },

    defineLeader: {
        terminate: true,
        getCommand: function() {
            return ["stay"]
        },
        getResult: function() {
            const closestPlayerIndex = IterationState.players.reduce((closestPlayerIndex, player, index) => {
                if (player.d < IterationState.players[closestPlayerIndex].d) {
                    return index
                }

                return closestPlayerIndex
            }, 0)

            const leader = IterationState.players[closestPlayerIndex]


            return {
                isLeader: false,
                leaderName: leader.name,
                side: leader.angle > 0 ? "l" : "r"
            }
        }
    }
}
