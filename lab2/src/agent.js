const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')
// Подключение модуля ввода из командной строки
const Controller = require('./controller')

const FLAGS = {
    ftl50: {x: -50, y: -39}, ftl40: {x: -40, y: -39},
    ftl30: {x: -30, y: -39}, ftl20: {x: -20, y: -39},
    ftl10: {x: -10, y: -39}, ft0: {x: 0, y: -39},
    ftr10: {x: 10, y: -39}, ftr20: {x: 20, y: -39},
    ftr30: {x: 30, y: -39}, ftr40: {x: 40, y: -39},
    ftr50: {x: 50, y: -39}, fbl50: {x: -50, y: 39},
    fbl40: {x: -40, y: 39}, fbl30: {x: -30, y: 39},
    fbl20: {x: -20, y: 39}, fbl10: {x: -10, y: 39},
    fb0: {x: 0, y: 39}, fbr10: {x: 10, y: 39},
    fbr20: {x: 20, y: 39}, fbr30: {x: 30, y: 39},
    fbr40: {x: 40, y: 39}, fbr50: {x: 50, y: 39},
    flt30: {x: -57.5, y: -30}, flt20: {x: -57.5, y: -20},
    flt10: {x: -57.5, y: -10}, fl0: {x: -57.5, y: 0},
    flb10: {x: -57.5, y: 10}, flb20: {x: -57.5, y: 20},
    flb30: {x: -57.5, y: 30}, frt30: {x: 57.5, y: -30},
    frt20: {x: 57.5, y: -20}, frt10: {x: 57.5, y: -10},
    fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: 10},
    frb20: {x: 57.5, y: 20}, frb30: {x: 57.5, y: 30},
    fglt: {x: -52.5, y: -7.01}, fglb: {x: -52.5, y: 7.01},
    gl: {x: -52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
    fplt: {x: -36, y: -20.15}, fplc: {x: -36, y: 0},
    fplb: {x: -36, y: 20.15}, fgrt: {x: 52.5, y: -7.01},
    fgrb: {x: 52.5, y: 7.01}, fprt: {x: 36, y: -20.15},
    fprc: {x: 36, y: 0}, fprb: {x: 36, y: 20.15},
    flt: {x: -52.5, y: -34}, fct: {x: 0, y: -34},
    frt: {x: 52.5, y: -34}, flb: {x: -52.5, y: 34},
    fcb: {x: 0, y: 34}, frb: {x: 52.5, y: 34},
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

        this.position = {x: 0, y: 0}
        this.angle = 0;

        this.flags = undefined
        this.controller = new Controller()
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
        if (data.cmd == "hear" && !this.run) {
            this.run = true
        }
        if (data.cmd == "init") {
            this.initAgent(data.p) // Иницализация
        }
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }

    initAgent(p) {
        if(p[0] == "r") this.position = "r" // Правая половина поля
        if(p[1]) this.id = p[1] // id игрока
    }

    actOnHear(p) {
        const message = p[2]
        this.controller.processServerMessage(message, this.flags)
        let command = this.controller.getServerCommand()
        console.log(command)
    }

    actOnSee(p) {
        const flags = this.getFlags(p)
        this.flags = flags
        this.shuffle(flags)

        const gameObjects = this.getGameObjects(p)

        console.debug("Flags: ", flags)
        console.debug("Game objects: ", gameObjects)

        const start = new Date().getTime()
        const position = this.calculatePosition(flags);
        const end = new Date().getTime()

        console.debug("Time: ", end - start)

        if (!position) {
            console.warn("Position not found")
        } else {
            console.debug("Position found: ", position)
            this.position = position
        }

        for (let gameObject of gameObjects) {
            const objectPosition = this.calculateObjectPosition(gameObject, this.position, flags)
            gameObject = {
                ...gameObject,
                ...objectPosition
            }

            console.debug("Object: ", gameObject)
        }
    }

    getIntersections(circle1, circle2) {

        console.debug("Circle 1: ", circle1)
        console.debug("Circle 2: ", circle2)

        const { x: x1, y: y1, d: d1 } = circle1
        const { x: x2, y: y2, d: d2 } = circle2

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

        }

        if (y1 == y2) {
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

        const possibleY1 = (-b + Math.sqrt(D)) / (2 * a)
        const possibleY2 = (-b - Math.sqrt(D)) / (2 * a)

        return [
            {
                x: alpha * possibleY1 + beta,
                y: possibleY1
            },
            {
                x: alpha * possibleY2 + beta,
                y: possibleY2
            }
        ]
    }

    isOnField(p) {
        return p.x >= -57.5 && p.x <= 57.5 && p.y >= -39 && p.y <= 39
    }

    calculateMSE(flags, predictedPosition) {
        return flags.reduce((acc, flag) => {
            return acc + (flag.d - FLAGS.distance(flag, predictedPosition)) ** 2
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

    checkIfOnOneLine(flags) {

        const { x: x1, y: y1 } = flags[0]
        const { x: x2, y: y2 } = flags[1]

        const onOneLine = (flag) => {
            
            if (x1 == x2) {
                return flag.x == x1
            }

            if (y1 == y2) {
                return flag.y == y1
            }

            const value = (flag.x - x1) / (x2 - x1) - (flag.y - y1) / (y2 - y1)

            return Math.abs(value) <= 0.001
        }

        return flags.every(onOneLine)

    }

    averagiatePosition(position, flags) {

        for (const flag of flags) {

            const { x: x, y: y, d: d } = flag

            const { x: xPrev, y: yPrev } = position
            const dPrev = FLAGS.distance(flag, position)

            const dNew = (d + dPrev) / 2

            const cos_alpha = (x - xPrev) / dPrev 
            const sin_alpha = (y - yPrev) / dPrev 
            
            position = {
                x: xPrev + (dPrev - dNew) * cos_alpha,
                y: yPrev + (dPrev - dNew) * sin_alpha
            }
        }

        return position
    }
    
    calculatePosition(flags) {

        if (flags.length < 2) {
            console.warn("Not enough flags to calculate position")
            return null
        }

        const possiblePositions = this.getIntersections(flags[0], flags[1])

        console.debug("Possible positions: ", possiblePositions)

        if (flags.length == 2 || this.checkIfOnOneLine(flags)) {
            console.debug("On one line or not enough flags", this.checkIfOnOneLine(flags))
            const filtered = possiblePositions.filter(this.isOnField)
            console.debug("Filtered positions: ", filtered)

            if (filtered.length != 1) {
                console.warn("Can't determine position")
                return null
            }

            return filtered[0]
        }

        const metrics = possiblePositions.map(position => this.calculateMSE(flags, position))
        const { x: x, y: y } = this.averagiatePosition(possiblePositions[metrics.indexOf(Math.min(...metrics))], flags)
        return {
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2))
        } 
        
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
                name: flag_name,
                d: flag.p[0],
                angle: flag.p[1],
                ...FLAGS[flag_name]
            }

        })
    }

    getGameObjects(p) {
        return p.filter(gameObject => {
            return typeof gameObject === "object" && !(gameObject.cmd.p.join("") in FLAGS)
        }).map(gameObject => {
            const name = gameObject.cmd.p.join("")
            return {
                name: name,
                d: gameObject.p[0],
                angle: gameObject.p[1]
            }
        })
    }

    radian(degrees) {
        return degrees * (Math.PI / 180)
    }

    calculateObjectPosition(gameObject, position, flags) {

        // TODO: process possible errors

        let resultX = 0
        let resultY = 0

        for (const flag of flags) {

            const { x: x, y: y, angle: alpha } = flag
            const { d: d, angle: beta } = gameObject
            const { x: xCurrent, y: yCurrent } = position

            const l = FLAGS.distance(position, flag)
            const gamma = this.radian(beta - alpha)

            const xNew = xCurrent + d / l * ((x - xCurrent) * Math.cos(gamma) - (y - yCurrent) * Math.sin(gamma))
            const yNew = yCurrent + d / l * ((x - xCurrent) * Math.sin(gamma) + (y - yCurrent) * Math.cos(gamma))

            resultX += xNew
            resultY += yNew

        }

        return {
            x: Number((resultX / flags.length).toFixed(2)),
            y: Number((resultY / flags.length).toFixed(2))
        }

    }

    analyzeEnv(msg, cmd, p) {
    
        switch (cmd) {
            case "see":
                this.actOnSee(p)
                break;
            case "hear":
                this.actOnHear(p)
                break;
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
