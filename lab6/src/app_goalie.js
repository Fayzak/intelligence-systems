require('./logging.js')('info')

const Controller = require('./controller')
const GoalieController = require('./controllers/goalie_controller')
const Agent = require('./agent') // Импорт агента

const VERSION = 7 // Версия сервера

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

const x = args.x === undefined ? -30 : Number(args.x)
const y = args.y === undefined ? 0 : Number(args.y)
const teamName = args.teamName === undefined ? "Traktor" : args.teamName

let agent = new Agent() // Создание экземпляра агента
agent.setController(new GoalieController())
agent.setTeamName(teamName)
require('./socket')(agent, teamName, VERSION, true) //Настройка сокета
agent.move(x, y)
