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

    processServerMessage(msg, flags, gameObjects) {
        if (msg === "play_on") {
            let current_action = this.actions[this.action_number]
            this.createCommandToServer(current_action, flags, gameObjects)
        } else if (msg.includes("goal_")) {
            this.action_number = 0
        }
    }

    createCommandToServer(action, flags, gameObjects) {
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
                    this.command = {cmd: "turn", value: "90"}
                } else {
                    if (flag.d < 3) {
                        this.action_number += 1
                    } else {
                        this.command = {cmd: "dash", value: "100"}
                    }
                }
                break
            case "kick":
                if (!goal) {
                    console.info("Can't kick because don't have goal!")
                    return
                }
                let ball = flags.find(obj => obj.name.includes(target))
                let gate = flags.find(obj => obj.name.includes(gameObjects))
                if (!ball) {
                    this.command = {cmd: "turn", value: "90"}
                } else {
                    if (ball.d < 0.5) {
                        if (!gate) {
                            this.command = {cmd: "kick", value: "10 45"}
                        } else {
                            this.command = {cmd: "kick", value: "100 0"}
                        }
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
