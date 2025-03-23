require('./logging.js')('info')

const Controller = require('./controller')
// const DecisionTree = require('./deсision_trees')
// const run_nodes = require('./run_decision_tree.js')

const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

const low_ctrl = require("./hierarchical_controller/field_player_low");
const high_ctrl = require("./hierarchical_controller/field_player_high");

const goalie_low = require("./hierarchical_controller/ctrl_low");
const goalie_middle = require("./hierarchical_controller/ctrl_middle");
const goalie_high = require("./hierarchical_controller/ctrl_high");

function createAgent(team, goalkeeper, controllers, bottom, top, center, start_x, start_y){
    let agent = new Agent(team, goalkeeper);
    agent.bottom = bottom;
    agent.top = top;
    agent.center = center;
    agent.controllers = controllers;
    agent.start_x = start_x;
    agent.start_y = start_y;
    return agent;
}

const teamName = "Traktor" // Имя команды
const enemyTeamName = "Really"

(async () => {
    let A_team = [
        [-45, -25, -35, -40, -30],
        [-20, 0, -35, -40, -10],
        [0, 20, -35, -40, 10],
        [25, 45, 35, -40, 30],

        [-40, -20, -25, -25, -25],
        [0, 20, -25, -25, 0],
        [20, 40, -25, -25, 25],

        [-20, 20, 0, -10, 0],
        [-40, 0, -10, -10, -20],
        [0, 40, -10, -10, 20],
    ]

    let B_team = [
        [-40, -20, -35, -40, 30],
        [-20, 0, -35, -40, 10],
        [0, 20, -35, -40, -10],
        [20, 40, 35, -40, -30],

        [-40, -20, -25, -25, 30],
        [-20, 0, -25, -25, 10],
        [0, 20, -25, -25, -10],
        [20, 40, -25, -25, -30],


        [-40, 0, -10, -10, 20],
        [0, 40, -10, -10, -20],
    ]
    let players = [];
    
    
    for (const pl of A_team){
        players.push(createAgent(teamName, false, [low_ctrl, high_ctrl], 
            pl[1], pl[0], pl[2], pl[3], pl[4]))
    }
    
    
    for (const pl of B_team){
        players.push(createAgent(enemyTeamName, false, [low_ctrl, high_ctrl], 
            pl[1], pl[0], pl[2], pl[3], pl[4]))
    }
    

    
    let goalkeeper_A = new Agent(teamName, true);
    goalkeeper_A.start_x = -50;
    goalkeeper_A.start_y = 0;
    let goalkeeper_B = new Agent(enemyTeamName, true);
    goalkeeper_B.start_x = -50;
    goalkeeper_B.start_y = 0;

    goalkeeper_A.taken.action = "return";
    goalkeeper_A.taken.turnData = "ft0";
    goalkeeper_A.taken.wait = 0;

    goalkeeper_B.taken.action = "return";
    goalkeeper_B.taken.turnData = "ft0";
    goalkeeper_B.taken.wait = 0;


    goalkeeper_A.controllers = [goalie_low, goalie_middle, goalie_high];
    goalkeeper_B.controllers = [goalie_low, goalie_middle, goalie_high];

    await Socket(goalkeeper_A, teamName, VERSION, true);
    await goalkeeper_A.socketSend('move', `${goalkeeper_A.start_x} ${goalkeeper_A.start_y}`);

    await Socket(goalkeeper_B, goalkeeper_B.teamName, VERSION, true);
    await goalkeeper_B.socketSend('move', `${goalkeeper_B.start_x} ${goalkeeper_B.start_y}`);


    for (const player of players){
        await Socket(player, player.teamName, VERSION);
        //console.log("move ", player.start_x, player.start_y);
        await player.socketSend('move', `${player.start_x} ${player.start_y}`);

    }
})();

// let enemyAgent = new Agent()

// Функция для разбора именованных параметров
// function parseArgs(args) {
//     const result = {}
//     args.slice(2).forEach(arg => {
//         if (arg.startsWith('--')) {
//             const [key, value] = arg.slice(2).split('=')
//             result[key] = value !== undefined ? value : true
//         }
//     })
//     return result
// }

// // Получаем именованные параметры
// const args = parseArgs(process.argv)

// const enemy_x = 15
// const enemy_y = -10

// const x = args.x === undefined ? -15 : args.x
// const y = args.y === undefined ? -10 : args.y
// const angle = args.angle === undefined ? 45 : args.angle

// let agent = new Agent() // Создание экземпляра агента
// agent.setController(new Controller([
//     {action: "define_position"}
// ]))
// agent.setTeamName(teamName)
// require('./socket')(agent, teamName, VERSION) //Настройка сокета
// agent.move(x, y)

// let agent2 = new Agent() // Создание экземпляра агента
// agent2.setController(new Controller([
//     {action: "define_position"}
// ]))
// agent2.setTeamName(teamName)
// require('./socket')(agent2, teamName, VERSION) //Настройка сокета
// agent2.move(x - 10, y + 2)

// let agent3 = new Agent() // Создание экземпляра агента
// agent3.setController(new Controller([
//     {action: "define_position"}
// ]))
// agent3.setTeamName(teamName)
// require('./socket')(agent3, teamName, VERSION) //Настройка сокета
// agent3.move(x - 10, y - 2)

// let agent4 = new Agent() // Создание экземпляра агента
// agent4.setController(new Controller([
//     {action: "defend_gate", target: "gr"}
// ]))
// agent4.setTeamName("enemy")
// require('./socket')(agent4, "enemy", VERSION, true) //Настройка сокета
// agent4.move(x - 40, 0)

// setTimeout(() => undefined, 1000)
//
// let agent1 = new Agent(teamName) // Создание экземпляра агента
// agent1.setController(new Controller())
// require('./socket')(agent1, teamName, VERSION) //Настройка сокета
// agent1.move(x-5, y+2)
//
// setTimeout(() => undefined, 1000)
//
// let agent2 = new Agent() // Создание экземпляра агента
// agent2.setController(new Controller())
// require('./socket')(agent2, teamName, VERSION) //Настройка сокета
// agent2.move(x-5, y-2)
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
