const Flags = require('./flags')
const Utils = require('./utils')

class Manager {
    constructor(position, angle, flags, gameObjects) {
        this.position = position
        this.angle = angle
        this.flags = flags
        this.gameObjects = gameObjects
        this.leader = undefined
    }

    getAction(dt, mgr) {
        function execute(dt, title) {
            const action = dt[title]
            if (typeof action.goto == "function") {
                let goto_dt = action.goto(dt.state)
                return execute(goto_dt, "root")
            }
            if (typeof action.exec == "function") {
                action.exec(mgr, dt.state)
                return execute(dt, action.next)
            }
            if (typeof action.condition == "function") {
                const cond = action.condition(mgr, dt.state)
                if (cond)
                    return execute(dt, action.trueCond)
                return execute(dt, action.falseCond)
            }
            if (typeof action.command == "function") {
                return action.command(mgr, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }
        return execute(dt, "root")
    }

    getAngle(flag) {
        const visibleDestionation = this.flags.find(fl => fl.name === flag)
        const destination = Flags[flag]

        if (!this.position || !this.angle) {

            if (!visibleDestionation) {
                return null
            }

            return visibleDestionation.angle
        }

        if (!destination) return null

        const beta = Utils.calculateRelativeAngle(this.position, destination)
        const direction = Utils.getAnglesDifference(beta, this.angle)

        return direction
    }

    getDistance(flag) {
        const visibleDestionation = this.flags.find(fl => fl.name === flag)
        const destination = Flags[flag]

        if (!this.position || !this.angle) {

            if (!visibleDestionation) {
                return null
            }

            return visibleDestionation.d
        }

        if (!destination) return null

        const distance = Utils.distance(this.position, destination)

        return distance
    }

    getVisible(goal) {
        return this.flags.find(flag => flag.name === goal) || this.gameObjects.find(gameObject => gameObject.name === goal)
    }

    getLeaderVisible() {
        let findedLeader = this.gameObjects.find(gameObject => gameObject.name.includes("p"))
        if (!findedLeader) return false
        this.leader = findedLeader
        return true
    }
}

module.exports = Manager
