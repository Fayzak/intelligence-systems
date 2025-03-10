const FL = "flag", KI = "kick"

const DT = {
    state: {
        next: 0,
        sequence: [{act: FL, fl: "frt"}, {act: FL, fl: "frb"},
            {act: KI, fl: "b", goal: "gr"}],
        command: null
    },
    root: {
        exec(mgr, state) { 
            state.action = state.sequence[state.next]
            state.command = null
        },
        next: "goalVisible",
    },
    goalVisible: {
        condition: (mgr, state) => mgr.getVisible(state.action.fl),
        trueCond: "rootNext",
        falseCond: "rotate",
    },
    rotate: {
        exec(mgr, state) {
            state.command = ["turn", "90"]
        },
        next: "sendCommand",
    },
    rootNext: {
        condition: (mgr, state) => state.action.act == FL,
        trueCond: "flagSeek",
        falseCond: "ballSeek",
    },
    flagSeek: {
        condition: (mgr, state) => mgr.getDistance(state.action.fl) < 3,
        trueCond: "closeFlag",
        falseCond: "farGoal",
    },
    closeFlag: {
        exec(mgr, state) {
            state.next++
            state.action = state.sequence[state.next]
        },
        next: "rootNext",
    },
    farGoal: {
        condition: (mgr, state) => mgr.getGameObjectAngle(state.action.fl) > 4,
        trueCond: "rotateToGoal",
        falseCond: "runToGoal",
    },
    rotateToGoal: {
        exec(mgr, state) {
            state.command = ["turn", `${mgr.getGameObjectAngle(state.action.fl)}`]
        },
        next: "sendCommand",
    },
    runToGoal: {
        exec(mgr, state) {
            state.command = ["dash", "50"]
        },
        next: "sendCommand",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    ballSeek: {
        condition: (mgr, state) => mgr.getGameObjectDistance(state.action.fl) < 1,
        trueCond: "closeBall",
        falseCond: "farGoal",
    },
    closeBall: {
        condition: (mgr, state) => mgr.getVisible(state.action.goal),
        trueCond: "ballGoalVisible",
        falseCond: "ballGoalInvisible",
    },
    ballGoalVisible: {
        exec(mgr, state) {
            state.command = [KI, "100", `${mgr.getGameObjectAngle(state.action.goal)}`]
        },
        next: "sendCommand",
    },
    ballGoalInvisible: {
        exec(mgr, state) {
            state.command = [KI, "10", "45"]
        },
        next: "sendCommand",
    }
}

const UniversalDT = {
    state: {
        dist: 0,
        angle: 0,
        command: null,
        leader: undefined,
    },
    root: {
        condition: (mgr, state) => mgr.getLeaderVisible(state),
        trueCond: "goToUniversalDT",
        falseCond: "goToDT",
    },
    sendCommand: {
        command: (mgr, state) => state.command
    },
    goToDT: {
        goto() { 
            return DT
        }
    },
    goToUniversalDT: {
        exec(mgr, state) {
            state.leader = mgr.leader
            state.dist = mgr.leader.d
            state.angle = mgr.leader.angle
        },
        next: "startUniversalDT",
    },
    startUniversalDT: {
        condition: (mgr, state) => state.dist < 1 && Math.abs(state.angle) < 40,
        trueCond: "followLeader",
        falseCond: "farDistance",
    },
    followLeader: {
        exec(mgr, state) {
            state.command = ["turn", "30"]
        },
        next: "sendCommand",
    },
    farDistance: {
        condition: (mgr, state) => state.dist > 10,
        trueCond: "nearAngle",
        falseCond: "farAngle",
    },
    nearAngle: {
        condition: (mgr, state) => Math.abs(state.angle) > 5,
        trueCond: "gentlyTurn",
        falseCond: "sharplyDash",
    },
    gentlyTurn: {
        exec(mgr, state) {
            state.command = ["turn", `${state.angle}`]
        },
        next: "sendCommand",
    },
    sharplyDash: {
        exec(mgr, state) {
            state.command = ["dash", "80"]
        },
        next: "sendCommand",
    },
    farAngle: {
        condition: (mgr, state) => Math.abs(state.angle) > 40 || Math.abs(state.angle) < 25,
        trueCond: "sharplyTurn",
        falseCond: "closeLeader",
    },
    sharplyTurn: {
        exec(mgr, state) {
            state.command = ["turn", `${state.angle-30}`]
        },
        next: "sendCommand",
    },
    closeLeader: {
        condition: (mgr, state) => state.dist < 7,
        trueCond: "slowlyDash",
        falseCond: "quicklyDash",
    },
    slowlyDash: {
        exec(mgr, state) {
            state.command = ["dash", "20"]
        },
        next: "sendCommand",
    },
    quicklyDash: {
        exec(mgr, state) {
            state.command = ["dash", "40"]
        },
        next: "sendCommand",
    }
}

module.exports = UniversalDT
