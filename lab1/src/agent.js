const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')
// Подключение модуля ввода из командной строки

const FLAGS = {
    ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
    ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
    ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
    ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
    ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
    ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
    fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
    fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
    fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
    fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
    fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
    flt30: {x: -57.5, y: 30}, flt20: {x: -57.5, y: 20},
    flt10: {x: -57.5, y: 10}, fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: -10}, flb20: {x: -57.5, y: -20},
    flb30: {x: -57.5, y: -30}, frt30: {x: 57.5, y: 30},
    frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
    frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
    fglt: {x: -52.5, y: 7.01}, fglb: {x: -52.5, y: -7.01},
    gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y: -20.15}, fgrt: {x: 52.5, y: 7.01},
    fgrb: {x: 52.5, y: -7.01}, fprt: {x: 36, y: 20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y: -20.15},
    flt: {x: -52.5, y: 34}, fct: {x: 0, y: 34},
    frt: {x: 52.5, y: 34}, flb: {x: -52.5, y: -34},
    fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
    distance(p1, p2) {
        return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
    },
}

class Agent {

    constructor() {
        this.position = "l" // По умолчанию ~ левая половина поля
        this.run = false // Игра начата
        this.act = null // Действия
        this.r1 = readline.createInterface({ // Чтение консоли
            input: process.stdin,
            output: process.stdout
        })
        this.r1.on('line', (input) => { // Обработка строки из консоли
            if (this.run) { // Если игра начата
                // Движения вперед, вправо, влево, удар по мячу
                if ("w" == input) {
                    this.act = {n: "dash", v: 100}
                }
                if ("d" == input) {
                    this.act = {n: "turn", v: 20}
                }
                if ("a" == input) {
                    this.act = {n: "turn", v: -20}
                }
                if("s" == input) {
                    this.act = {n: "kick", v: 100}
                }
            }
        })
        this.coords = {x: 0, y: 0}
        this.angle = 0;
    }

    msgGot(msg) { // Получение сообщения
        let data = msg.toString('utf8') // Приведение с строке
        this.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды к строке
    }

    setSocket(socket) { // Настройка сокета
        this.socket = socket
    }

    socketSend(cmd, value) { // Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    setAngle(v) {
        this.angle = v
    }

    processMsg(msg) { // Обработка сообщения
        let data = Msg.parseMsg(msg) // Разбора сообщения
        if (!data) throw new Error("Parse error\n" + msg)
        // Первое (hear) - начало игры
        if (data.cmd == "hear") this.run = true
        if (data.cmd == "init") this.initAgent(data.p) // Иницализация
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }

    initAgent(p) {
        if(p[0] == "r") this.position = "r" // Правая половина поля
        if(p[1]) this.id = p[1] // id игрока
    }

    actOnHear(p) {
        const message = p[2]
        if (message === "play_on") {
            this.socketSend("turn", `${this.angle}`)
        }
    }

    getPossiblePositions(flag1, flag2) {

        console.debug("Flag 1: ", flag1)
        console.debug("Flag 2: ", flag2)

        const d1 = flag1.d
        const d2 = flag2.d

        const x1 = flag1.x
        const x2 = flag2.x

        const y1 = flag1.y
        const y2 = flag2.y

        if (x1 == x2) {
            console.debug("x1 == x2")

            const y = (d1 ** 2 - d2 ** 2 + x2 ** 2 - x1 ** 2 + y2 ** 2 - y1 ** 2) / (2 * (y2 - y1))

            let s = d1 ** 2 - (y - y1) ** 2

            if (s < 0) {
                s = 0
            }

            return [
                {
                    x: x1 + Math.sqrt(s),
                    y: y
                },
                {
                    x: x1 - Math.sqrt(s),
                    y: y
                }
            ]

        } else if (y1 == y2) {
            console.debug("y1 == y2")

            const x = (d1 ** 2 - d2 ** 2 + x2 ** 2 - x1 ** 2 + y2 ** 2 - y1 ** 2) / (2 * (x2 - x1))

            let s = d1 ** 2 - (x - x1) ** 2

            if (s < 0) {
                s = 0
            }

            return [
                {
                    x: x,
                    y: y1 + Math.sqrt(s),
                },
                {
                    x: x,
                    y: y1 - Math.sqrt(s),
                }
            ]

        }

        console.debug("x1 != x2 and y1 != y2")

        const alpha = (y1 - y2) / (x2 - x1)
        const beta = (d1 ** 2 - d2 ** 2 + x2 ** 2 - x1 ** 2 + y2 ** 2 - y1 ** 2) / (2 * (x2 - x1))

        const a = alpha ** 2 + 1
        const b = 2 * (alpha * (beta - x1) - y1)
        const c = beta ** 2 - 2 * beta * x1 + x1 ** 2 + y1 ** 2 - d1 ** 2

        let D = b ** 2 - 4 * a * c

        if (D < 0) {
            D = 0
        }

        console.debug("alpha: ", alpha)
        console.debug("beta: ", beta)
        console.debug("a: ", a)
        console.debug("b: ", b)
        console.debug("c: ", c)
        console.debug("D: ", D)

        const possible_y1 = (-b + Math.sqrt(D)) / (2 * a)
        const possible_y2 = (-b - Math.sqrt(D)) / (2 * a)

        return [
            {
                x: alpha * possible_y1 + beta,
                y: possible_y1
            },
            {
                x: alpha * possible_y2 + beta,
                y: possible_y2
            }
        ]
    }

    isOnField(p) {
        return p.x >= -54 && p.x <= 54 && p.y >= -32 && p.y <= 32
    }

    calculateMSE(flags, predicted_position) {
        return flags.reduce((acc, flag) => {
            return acc + (flag.d - FLAGS.distance(flag, predicted_position)) ** 2
        }, 0) / flags.length
    }

    shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    }
    
    calculatePosition(flags) {

        if (flags.length < 2) {
            console.info("Not enough flags to calculate position")
            return null
        }

        this.shuffle(flags)

        let possible_positions = []

        for (let i = 0; i < flags.length - 1; i++) {
            possible_positions.push(...this.getPossiblePositions(flags[i], flags[i + 1]))
        }

        // let possible_positions = this.getPossiblePositions(flags[0], flags[1])
        console.debug("Possible positions: ", possible_positions)

        const metrics = possible_positions.map(position => {
            const metric = this.calculateMSE(flags, position)
            return metric
        })

        console.debug("Calculated metrics: ", metrics)

        const min_index = metrics.indexOf(Math.min(...metrics))

        return possible_positions[min_index]

    }

    getFlags(p) {
        /*
         * parese p structure to extract all visible flags
         */

        return p.filter(flag => {
            // INFO: remove all non-flag objects
            return typeof flag === "object" && flag.cmd.p.join("") in FLAGS
        }).map(flag => {
            // INFO: parse flag info

            const flag_name = flag.cmd.p.join("")

            return {
                d: flag.p[0],
                angle: flag.p[1],
                ...FLAGS[flag_name]
            }

        })
    }

    getGameObjects(p) {
        return p.filter(game_object => {
            return typeof game_object === "object" && !(game_object.cmd.p.join("") in FLAGS)
        }).map(game_object => {
            const name = game_object.cmd.p.join("")
            return {
                name: name,
                d: game_object.p[0],
                angle: game_object.p[1]
            }
        })
    }

    analyzeEnv(msg, cmd, p) {
        if (cmd === "see") {

            const flags = this.getFlags(p)

            const gameObjects = this.getGameObjects(p)

            console.debug("Flags: ", flags)
            console.debug("Game objects: ", gameObjects)

            const start = new Date().getTime()
            const position = this.calculatePosition(flags);
            const end = new Date().getTime()

            console.debug("Time: ", end - start)

            if (!position) {
                console.debug("Position not found")
            } else {
                console.debug("Position found: ", position)
                this.coords = position
            }
        }
    } // Анализ сообщения

    sendCmd() {
        if (this.run) { // Игра начата
            if (this.act) { // Есть команда от игрока
                if (this.act.n == "kick") // Пнуть мяч
                    this.socketSend(this.act.n, this.act.v + " 0")
                else // Движение и поворот
                    this.socketSend(this.act.n, this.act.v)
            }
            this.act = null // Сброс команды
        }
    }
}
module.exports = Agent // Экспорт игрока
