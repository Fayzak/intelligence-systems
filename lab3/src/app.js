require('./logging.js')('info')

const Controller = require('./controller')
const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

const teamName = "Traktor" // Имя команды

let enemyTeamName = "Really"
// let enemyAgent = new Agent()

// Функция для разбора именованных параметров
function parseArgs(args) {
    const result = {}
    args.slice(2).forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=')
            result[key] = value !== undefined ? value : true
        }
    })
    return result
}

// Получаем именованные параметры
const args = parseArgs(process.argv)

const enemy_x = 15
const enemy_y = -10

const x = args.x === undefined ? -15 : args.x
const y = args.y === undefined ? -10 : args.y
const angle = args.angle === undefined ? 45 : args.angle

let agent = new Agent() // Создание экземпляра агента
agent.setController(new Controller())
require('./socket')(agent, teamName, VERSION) //Настройка сокета
agent.move(x, y)

setTimeout(() => undefined, 1000)

let agent1 = new Agent() // Создание экземпляра агента
agent1.setController(new Controller())
require('./socket')(agent1, teamName, VERSION) //Настройка сокета
agent1.move(x+5, y+5)

setTimeout(() => undefined, 1000)

let agent2 = new Agent() // Создание экземпляра агента
agent2.setController(new Controller())
require('./socket')(agent2, teamName, VERSION) //Настройка сокета
agent2.move(x-5, y-5)
// let agent1 = new Agent() // Создание экземпляра агента
// require('./socket')(agent1, teamName, VERSION) //Настройка сокета
// agent1.socketSend("move", `${-10} ${-10}`) // Размещение игрока на поле
// let agent2 = new Agent() // Создание экземпляра агента
// require('./socket')(agent2, teamName, VERSION) //Настройка сокета
// agent2.socketSend("move", `${-10} ${-5}`) // Размещение игрока на поле
// let agent3 = new Agent() // Создание экземпляра агента
// require('./socket')(agent3, teamName, VERSION) //Настройка сокета
// agent3.socketSend("move", `${-10} ${0}`) // Размещение игрока на поле
// let agent4 = new Agent() // Создание экземпляра агента
// require('./socket')(agent4, teamName, VERSION) //Настройка сокета
// agent4.socketSend("move", `${-10} ${5}`) // Размещение игрока на поле
// let agent5 = new Agent() // Создание экземпляра агента
// require('./socket')(agent5, teamName, VERSION) //Настройка сокета
// agent5.socketSend("move", `${-10} ${10}`) // Размещение игрока на поле

// require('./socket')(enemyAgent, enemyTeamName, VERSION)
// enemyAgent.socketSend("move", `${-enemy_x} ${-enemy_y}`)

// setTimeout(() => {
//
//
// }, 1000)
