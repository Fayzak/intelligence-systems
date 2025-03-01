class Controller {
    constructor() {
        this.actions = [
            // {act: "flag", fl: "frb"},
            // {act: "flag", fl: "gl"},
            // {act: "flag", fl: "fc"},
            {act: "kick", fl: "b", goal: "gr"}
        ]
        this.action_number = 0
        this.command = undefined
    }

    processServerMessage(msg, flags, gameObjects, position) {
        // if (msg === "play_on") {
        let current_action = this.actions[this.action_number]
        this.createCommandToServer(current_action, flags, gameObjects, position)
        // } else if (msg.includes("goal_")) {
        //     this.action_number = 0
        // }
    }

    createCommandToServer(action, flags, gameObjects, position) {
        console.info(position)
        let length = Object.keys(action).length
        let act = action["act"]
        let target = action["fl"]
        let goal = undefined
        if (length >= 3) {
            goal = action["goal"]
        }

        switch (act) {
            case "flag":
                let flag = flags.find(obj => obj.name.includes(target))
                if (!flag) {
                    console.info("Can't find flag!")
                    this.command = {cmd: "turn", value: "90"}
                } else {
                    if (flag.d < 3) {
                        console.info("Flag is too close!")
                        this.action_number += 1
                    } else if (Math.abs(flag.angle) > 10) {
                        console.info("Flag is too far!")
                        this.command = {cmd: "turn", value: `${flag.angle}`}
                    } else {
                        console.info("Flag is good!")
                        this.command = {cmd: "dash", value: "100"}
                    }
                }
                break
            case "kick":
                if (!goal) {
                    console.info("Can't kick because don't have goal!")
                    return
                }
                let ball = gameObjects.find(obj => obj.name.includes(target))
                let gate = flags.find(obj => obj.name.includes(goal))
                if (!ball) {
                    this.command = {cmd: "turn", value: "90"}
                } else {
                    if (ball.d < 0.5) {
                        if (!gate) {
                            if (position.x > 0) {
                                this.command = {cmd: "kick", value: "10 45"}
                            } else {
                                this.command = {cmd: "kick", value: "10 -45"}
                            }
                        } else {
                            this.command = {cmd: "kick", value: `100 ${gate.angle}`}
                        }
                    } else if (Math.abs(ball.angle) > 10) {
                        this.command = {cmd: "turn", value: `${ball.angle}`}
                    } else {
                        this.command = {cmd: "dash", value: "100"}
                    }
                }
                break
        }
    }

    getServerCommand() {
        return this.command
    }
}

module.exports = Controller // Экспорт контроллера
