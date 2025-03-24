Searcher = {
    getDirection() {
        const nextDirection = this.directions[this.currentDirectionIndex]

        this.currentDirectionIndex = (this.currentDirectionIndex + 1) % this.directions.length

        return nextDirection
    },

    reset() {
        this.currentDirectionIndex = 0
    },

    directions: [45, 45, -72 - 90, -72, -72, -72, -72],
    currentDirectionIndex: 0
}

module.exports = {
    run: (agentState, targetName) => {
        const target = agentState.flags.find(flag => flag.name === targetName)

        if (target === undefined) {
            return [["turn", Searcher.getDirection()]]
        }
        Searcher.reset()

        if (Math.abs(target.angle) > 10 ) {
            return [["turn", target.angle]]
        }

        return [["dash", 80]]
    },
    kick: (agentState, targetName, nearDistance = 25) => {
        const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

        if (ball === undefined) {
            return [["turn", Searcher.getDirection()]]
        }
        Searcher.reset()

        if (ball.distance > 1) {
            if (Math.abs(ball.angle) > 10) {
                return [["turn", ball.angle]]
            }
            return [["dash", 80]]
        }

        const gate = agentState.flags.find(flag => flag.name === targetName)
        console.info("kick", gate, targetName)

        if (gate === undefined) {
            return [["kick", 10, -180], ["turn", -180]]
        }

        let additional = []

        if (Math.abs(gate.angle) > 10) {
            additional = [["turn", gate.angle]]
        }

        if (gate.distance > nearDistance) {
            return [["kick", 40, gate.angle], ...additional]
        }

        return [["kick", 100, gate.angle], ...additional]
    },
    seekBall: (agentState) => {
        const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

        if (ball === undefined) {
            return [["turn", Searcher.getDirection()]]
        }
        Searcher.reset()

        if (Math.abs(ball.angle) > 10) {
            return [["turn", ball.angle]]
        }

        return [["stay"]]
    },
    seekFlag: (agentState, targetName) => {
        const flag = agentState.flags.find(flag => flag.name === targetName)

        if (flag === undefined) {
            return [["turn", Searcher.getDirection()]]
        }
        Searcher.reset()

        if (Math.abs(flag.angle) > 10) {
            return [["turn", flag.angle]]
        }

        return [["stay"]]
    },
    lead: (agentState, targetName) => {
        const ball = agentState.gameObjects.find(gameObject => gameObject.name === "b")

        if (ball === undefined) {
            return [["turn", Searcher.getDirection()]]
        }
        Searcher.reset()

        if (ball.distance > 1) {
            if (Math.abs(ball.angle) > 10) {
                return [["turn", ball.angle]]
            }
            return [["dash", 80]]
        }

        const gate = agentState.flags.find(flag => flag.name === targetName)

        if (gate === undefined) {
            return [["kick", 10, -180], ["turn", -180]]
        }

        let additional = []

        if (Math.abs(gate.angle) > 10) {
            additional = [["turn", gate.angle]]
        }

        return [["kick", 40, gate.angle], ...additional]
    },
    follow: (agentState, leaderName) => {
        const leader = agentState.gameObjects.find(gameObject => gameObject.name === leaderName)

        if (!leader) {
            return [["turn", Searcher.getDirection()]]
        }

        if (leader.distance > 12) {
            if (Math.abs(leader.angle) > 10) {
                return [["turn", leader.angle]]
            }
            return [["dash", 80]]
        }

        if (leader.distance < 7) {
            return [["dash", 30]]
        }

        if (Math.abs(Math.abs(leader.angle) - 30) > 10) {
            return [["turn", leader.angle - 30]]
        }

        return [["dash", 70]]
    }
}
