let DTRun = require('./decision_trees/run.js')
let DTKick = require('./decision_trees/kick.js')
let DTFollow = require('./decision_trees/follow.js')
let DTDefinePosition = require('./decision_trees/define_position.js')
let DTDefendGate = require('./decision_trees/defend_gate.js')
let DTSendPass = require('./decision_trees/send_pass.js')

module.exports = {
    run: {
        execute: (agentState, actionParameters) => {
            DTRun.init(agentState, actionParameters)
            let currentNode = DTRun.getRoot()

            while (!DTRun[currentNode].terminate) {
                currentNode = DTRun[currentNode]()
            }

            return DTRun[currentNode]
        },
        terminate: () => {
            DTRun.terminate()
        }
    },
    kick: {
        execute: (agentState, actionParameters) => {
            DTKick.init(agentState, actionParameters)
            let currentNode = DTKick.getRoot()

            while (!DTKick[currentNode].terminate) {
                currentNode = DTKick[currentNode]()
            }

            return DTKick[currentNode]
        },
        terminate: () => {
            DTKick.terminate()
        }
    },
    follow: {
        execute: (agentState, actionParameters) => {
            DTFollow.init(agentState, actionParameters)
            let currentNode = DTFollow.getRoot()

            while (!DTFollow[currentNode].terminate) {
                currentNode = DTFollow[currentNode]()
            }

            return DTFollow[currentNode]
        },
        terminate: () => {
            DTFollow.terminate()
        }
    },
    definePosition: {
        execute: (agentState, actionParameters) => {
            DTDefinePosition.init(agentState, actionParameters)
            let currentNode = DTDefinePosition.getRoot()

            while (!DTDefinePosition[currentNode].terminate) {
                currentNode = DTDefinePosition[currentNode]()
            }

            return DTDefinePosition[currentNode]
        },
        terminate: () => {
            DTDefinePosition.terminate()
        }
    },
    defendGate: {
        execute: (agentState, actionParameters) => {
            DTDefendGate.init(agentState, actionParameters)
            let currentNode = DTDefendGate.getRoot()

            while (!DTDefendGate[currentNode].terminate) {
                currentNode = DTDefendGate[currentNode]()
            }

            return DTDefendGate[currentNode]
        },
        terminate: () => {
            DTDefendGate.terminate()
        }
    },
    sendPass: {
        execute: (agentState, actionParameters) => {
            DTSendPass.init(agentState, actionParameters)
            let currentNode = DTSendPass.getRoot()

            while (!DTSendPass[currentNode].terminate) {
                currentNode = DTSendPass[currentNode]()
            }

            return DTSendPass[currentNode]
        },
        terminate: () => {
            DTSendPass.terminate()
        }
    }
}
