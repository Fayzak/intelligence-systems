const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

let teamName = "Traktor" // Имя команды
let agent = new Agent(); // Создание экземпляра агента

require('./socket')(agent, teamName, VERSION) //Настройка сокета
agent.socketSend("move", `-15 0`) // Размещение игрока на поле
