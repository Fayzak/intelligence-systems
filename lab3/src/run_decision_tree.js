const Flags = require('./flags')
const Utils = require('./utils')

module.exports = {
    root: {
        type: "action",
        execute: (agentState, treeState) => {

            const targetFlagName = treeState.actions[treeState.currentActionIndex].goal
            const targetFlag = Flags[targetFlagName]
            
            treeState.target = {
                name: targetFlagName,
                x: targetFlag.x,
                y: targetFlag.y
            }

            return ["navigate", "isPositionDefined"]
        }
    },

    nextAction: {
        type: "action",
        execute: (agentState, treeState) => {
            treeState.currentActionIndex = (treeState.currentActionIndex + 1) % treeState.actions.length

            return ["navigate", "root"]
        }
    },

    isPositionDefined: {
        type: "condition",
        onTrue: "calculateTargetPosition",
        onFalse: "isFlagVisible",
        execute: (agentState, treeState) => {
            return agentState.position && agentState.angle
        }
    },

    calculateTargetPosition: {
        type: "action",
        execute: (agentState, treeState) => {

            const position = agentState.position
            const angle = agentState.angle

            const destination = treeState.target

            const beta = Utils.calculateRelativeAngle(position, destination)
            const direction = Utils.getAnglesDifference(beta, angle) 
            const distance = Utils.distance(position, destination)

            treeState.target = {
                ...treeState.target,
                direction: direction,
                distance: distance,
            }

            return ["navigate", "isRunComplited"]
        }
    },

    isRunComplited: {
        type: "condition",
        onTrue: "nextAction",
        onFalse: "isTargetAhead",
        execute: (agentState, treeState) => {
            const distance = treeState.target.distance

            return distance < 3
        }
    },

    isTargetAhead: {
        type: "condition",
        onTrue: "dashToTarget",
        onFalse: "turnToTagret",
        execute: (agentState, treeState) => {
            return Math.abs(treeState.target.direction) < 10
        }
    },

    dashToTarget: {
        type: "action",
        execute: (agentState, treeState) => {
            return ["terminate", ["dash", 100]]
        }
    },

    turnToTagret: {
        type: "action",
        execute: (agentState, treeState) => {
            return ["terminate", ["turn", treeState.target.direction]]
        }
    },

    isFlagVisible: {
        type: "condition",
        onTrue: "setVisibleFlagPosition",
        onFalse: "seekTarget",
        execute: (agentState, treeState) => {
            return agentState.flags.find(flag => flag.name === treeState.target.name) !== undefined
        }
    },

    setVisibleFlagPosition: {
        type: "action",
        execute: (agentState, treeState) => {
            const visibleFlag = agentState.flags.find(flag => flag.name === treeState.target.name)

            treeState.target = {
                ...treeState.goal,
                direction: visibleFlag.angle,
                distance: visibleFlag.d,
            }

            return ["navigate", "isRunComplited"]
        }
    },

    seekTarget: {
        type: "action",
        execute: (agentState, treeState) => {
            return ["terminate", ["turn", 90]]
        }
    },
}
