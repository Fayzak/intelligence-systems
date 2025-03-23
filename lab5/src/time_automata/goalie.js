const TA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: {d: null, position: null}, // Переменные
        timers: {t: 0}, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее Действие
        local: {seeGoal: false}, // Внутренние переменные Для методов
    },
    nodes: { /* УЗЛЫ автомата, в каждом узле: имя и узлы, на которые есть переходы */
        start: {n: "start", e: ["close", "near", "far"]},
        close: {n: "close", e: ["catch"]},
        catch: {n: "catch", e: ["kick"]},
        kick: {n: "kick", e: ["start"]},
        far: {n: "far", e: ["start"]},
        near: {n: "near", e: ["intercept", "start"]},
        intercept: {n: "intercept", e: ["start"]},
    },
    edges: {/* Ребра автомата
             * (имя каждого ребра указывает
             * узел—источник И узел—приемник)
             */
        start_takePosition:
            [],
        start_close:
            [{guard: [{s: "lt", l: {v: "d"}, r: 2}]}],
        /* Список guard описывает перечень условий, проверяемых
        * Для перехода по ребру. Знак lt — меньше, lte — меньше
        * либо равно. B качестве параметров принимаются числа или
        * значения переменных "v" или таймеров "t" */
        start_near: [{
            guard: [{s: "lt", l: {v: "d"}, r: 20},
                {s: "lte", l: 2, r: {v: "d"}}]
        }],
        start_far:
            [{guard: [{s: "lte", l: 20, r: {v: "d"}}]}],

        close_catch: [{synch: "catch!"}],
        /* Событие синхронизации synch вызывает на выполнение
        * соответствующую функцию */
        catch_kick:
            [{synch: "kick!"}],
        kick_start:
            [{
                synch: "goBack!",
                assign: [{n: "t", v: 0, type: "timer"}]
            }],
        /* Список assign перечисляет присваивания для переменных
        * "variable" и таймеров "timer" */
        far_start:
            [{
                guard: [{s: "lt", l: 10, r: {t: "t"}}],
                synch: "seekBall!",
                assign: [{n: "t", v: 0, type: "timer"}]
            }, {
                guard: [{s: "lte", l: {t: "t"}, r: 10}],
                synch: "ok!"
            }],
        near_start:
            [{
                synch: "empty!",
                assign: [{n: "t", v: 0, type: "timer"}]
            }],
        near_intercept:
            [{synch: "canIntercept?"}],
        /* Событие синхронизации synch может вызывать
        * соответствующую function для проверки возможности перехода
        * по ребру (заканчивается на знак "?") */
        intercept_start: [{
            synch: "runToBall!",
            assign: [{n: "t", v: 0, type: "timer"}]
        }]
    },
    actions: {
        init(taken, state) { // ИНициализация игрока
            state.local.goalie = true
            state.local.catch = 0
        },
        beforeAction(taken, state) {
            // Действие перед каждым вычислением
            // console.log(taken.goalOwn)
            if (taken.ball) {
                state.variables.d = taken.ball.d
            } else {
                state.variables.d = 100
            }
            //else if (taken.goalOwn.d) state.variables.d = taken.goalOwn.d
            // else {
            //     console.log()
            //     return this.goBack(taken, state)
            // }

        },
        seekBall(taken, state) { // Поиск мяча
            if (!taken.ball) {
                return ["turn", 60]
            }
            
            if (taken.ball.angle > 10) {
                return ["turn", taken.ball.angle]
            }

            state.next = true

            return ["turn", 0]

        },
        catch(taken, state) { // Ловим мяч
            if (!taken.ball) {
                state.next = true
                return ["turn", 0]
            }
            let angle = taken.ball.angle
            let d = taken.ball.d
            state.next = false
            if (d > 0.5) {
                if (state.local.goalie) {
                    if (state.local.catch < 3) {
                        state.local.catch++
                        return ["catch", angle]
                        // return {n: "catch", v: angle}
                    } else {
                        state.local.catch = 0
                    }
                }
                if (Math.abs(angle) > 15) {
                    return ["turn", angle]
                    // return {n: "turn", v: angle}
                }
                return ["dash", 70]
                // return {n: "dash", v: 20}
            }
            state.next = true
            return ["turn", 0]
        },
        kick(taken, state) { // ПИнаем мяч
            state.next = true
            if (!taken.ball) {
                return ["turn", 0]
            }

            let d = taken.ball.d

            if (d > 0.5) {
                return ["turn", 0]
            }

            let goal = taken.goal
            let player = taken.teamOwn ? taken.teamOwn[0] : null
            let target

            if (goal && player) {
                target = goal.d < player.d ? goal : player
            } else if (goal) {
                target = goal
            } else if (player) {
                target = player
            }

            if (target) {

                return ["kick", 40, target.angle]
                // return {n: "kick", v: `${target.d * 2 + 40} ${target.angle}`}
            }
            
            return ["kick", 5, 45]
            // return {n: "kick", v: "10 45"}
        },
        goBack(taken, state) { // Возврат к воротам
            console.log(taken.goalOwn)
            state.next = false
            let goalOwn = taken.positionOwn
            if (!goalOwn.d) {
                return ["turn", 60]
            }
            if (Math.abs(goalOwn.angle) > 10) {
                return ["turn", goalOwn.angle]
                // return {n: "turn", v: goalOwn.angle}
            }
            if (goalOwn.d < 2) {
                state.next = true
                return ["turn", 0]
                // return {n: "turn", v: 180}
            }
            return ["dash", 100]
            // return {n: "dash", v: goalOwn.d * 2 + 20}
        },
        lookAround: function (taken, state) { // Осматриваемся
            state.next = false
            state.synch = "lookAround!"
            //return {n: "turn", v: 90}
            if (!state.local.look)
                state.local.look = "left"
            switch (state.local.look) {
                case "left":
                    state.local.look = "center";
                    return ["turn", -60]
                    // return {n: "turn", v: -60}
                case "center":
                    state.local.look = "right";
                    return ["turn", 60]
                    // return {n: "turn", v: 60}
                case "right":
                    state.local.look = "back";
                    return ["turn", 60]
                    // return {n: "turn", v: 60}
                case "back":
                    state.local.look = "left"
                    state.next = true
                    state.synch = undefined
                    return ["turn", -60]
                    // return {n: "turn", v: -60}
                default:
                    state.next = true
            }
        },
        canIntercept(taken, state) { //МОжем Добежать первыми
            //console.log("first")
            let ball = taken.ball
            let ballPrev = taken.ballPrev
            state.next = true
            if (!ball) {
                return false
            }
            if (!ballPrev) {
                return true
            }
            if (ball.d <= ballPrev.d + 0.5) {
                return true
            }
            return false
        },
        runToBall(taken, state) { // Бежим к мячу
            state.next = false
            let ball = taken.ball
            if (!ball) {
                return this.goBack(taken, state)
            }
            if (ball.d <= 2) {
                state.next = true
                return ["turn", 0]
            }
            if (Math.abs(ball.angle) > 10) {
                return ["turn", ball.angle]
                // return {n: "turn", v: ball.angle}
            }
            if (ball.d < 2) {
                state.next = true
                return ["turn", 0]
            }
            return ["dash", 70]
            // return {n: "dash", v: 110}
        },
        ok(taken, state) { // HquPo Делать не надо
            console.log("ok")
            state.next = true;
            return ["turn", 0]
            // return {n: "turn", v: 0}
        },
        empty(taken, state) {
            state.next = true
            return ["turn", 0]
        } //ПУстое действие
    }
}
module.exports = TA
