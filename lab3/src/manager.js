const Flags = require('./flags')
const Utils = require('./utils')

class Manager {
    constructor(
        teamName, id,
        position, angle, flags, gameObjects
    ) {
        this.teamName = teamName
        this.id = id
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
                return -999
            }

            return visibleDestionation.angle
        }

        if (!destination) return -999

        const beta = Utils.calculateRelativeAngle(this.position, destination)
        const direction = Utils.getAnglesDifference(beta, this.angle)

        return direction
    }

    getGameObjectAngle(gameObject) {
        const destination = this.gameObjects.find(object => object.name === gameObject)

        if (!this.position || !this.angle) {

            if (!destination) {
                return -999
            }

            return destination.angle
        }

        if (!destination) return -999

        const beta = Utils.calculateRelativeAngle(this.position, destination)
        const direction = Utils.getAnglesDifference(beta, this.angle)

        return direction
    }

    getDistance(flag) {
        console.info("DIST", flag)
        const visibleDestionation = this.flags.find(fl => fl.name === flag)
        const destination = Flags[flag]
        console.info("visdist", visibleDestionation)
        console.info("dest", destination)

        if (!this.position || !this.angle) {

            if (!visibleDestionation) {
                return 999
            }

            return visibleDestionation.d
        }

        if (!destination) return 999

        const distance = Utils.distance(this.position, destination)

        return distance
    }

    getGameObjectDistance(gameObject) {
        const destination = this.gameObjects.find(object => object.name === gameObject)

        if (!this.position || !this.angle) {

            if (!destination) {
                return 999
            }

            return destination.d
        }

        if (!destination) return 999

        const distance = Utils.distance(this.position, destination)

        return distance
    }

    getVisible(goal) {
        return this.flags.find(flag => flag.name === goal) || this.gameObjects.find(gameObject => gameObject.name === goal)
    }

    getLeaderVisible(state) {
        let findedLeader = this.gameObjects.find(gameObject => gameObject.name.includes(`p"${this.teamName}"`))
        if (findedLeader !== undefined) {
            if (state.leader !== undefined) {
                if (state.leader.name === `p"${this.teamName}"${this.id}`) {
                    return false
                }
            }
            this.leader = findedLeader
            return true
        }
        return false
    }
}

module.exports = Manager
