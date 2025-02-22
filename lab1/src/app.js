const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

let teamName = "Traktor" // Имя команды
let agent = new Agent() // Создание экземпляра агента

let enemyTeamName = "Really"
let enemyAgent = new Agent()

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

const x = args.x === undefined ? -15 : args.x
const y = args.y === undefined ? 0 : args.y
const angle = args.angle === undefined ? 45 : args.angle
agent.setAngle(angle)

require('./socket')(agent, teamName, VERSION) //Настройка сокета
agent.socketSend("move", `${x} ${y}`) // Размещение игрока на поле

require('./socket')(enemyAgent, enemyTeamName, VERSION)
enemyAgent.socketSend("move", `-15 0`)
