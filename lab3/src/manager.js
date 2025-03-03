// Example from book

class Manager {
    getAction(dt, p) {
        this.p = p
        function execute(dt, title) {
            const action = dt[title]
            if (typeof action.exec == "function") {
                action.exec(Manager, dt.state)
                return execute(dt, action.next)
            }
            if (typeof action.condition == "function") {
                const cond = action.condition(Manager, dt.state)
                if (cond)
                    return execute(dt, action.trueCond)
                return execute(dt, action.falseCond)
            }
            if (typeof action.command == "function") {
                return action.command(Manager, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }
        return execute(dt, "root")
    }
}