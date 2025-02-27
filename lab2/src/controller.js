class Controller {
    constructor() {
        this.actions = [
            {act: "flag", fl: "frb"},
            {act: "flag", fl: "gl"},
            {act: "flag", fl: "fc"},
            {act: "kick", fl: "b", goal: "gr"}
        ]
        this.action_number = 0
        this.command = undefined
    }

    processServerMessage(msg, flags) {
        if (msg === "play_on") {
            let current_action = this.actions[this.action_number]
            this.createCommandToServer(current_action, flags)
        } else if (msg.includes("goal_")) {
            this.action_number = 0
        }
    }

    createCommandToServer(action, flags) {
        // move, kick and turn
        let length = Object.keys(action).length
        let act = action["act"]
        let target = action["fl"]
        if (length >= 3) {
            let goal = action["goal"]
        }

        switch (act) {
            case "flag":
                let flag = flags.find(obj => obj.name.includes(target));
                if (!flag) {
                    this.command = "turn"
                } else {
                    if (flag.d < 3) {
                        this.command = "say" // чтобы остановиться (?)
                    } else {
                        this.command = "move"
                    }
                }
                break
            case "kick":
                this.command = "kick"
                break
            default:
                this.command = "turn"
                break
        }
    }

    getServerCommand() {
        return this.command
    }
}

module.exports = Controller // Экспорт контроллера
