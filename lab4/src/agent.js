const Msg = require('./msg')
const Flags = require('./flags')
const Utils = require('./utils')

const readline = require('readline')

class Agent {

    constructor() {


        readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }).on('line', (input) => {
            if ("w" == input) {
                this.dash(100)
            }
            if ("d" == input) {
                this.turn(20)
            }
            if ("a" == input) {
                this.turn(-20)
            }
            if("s" == input) {
                this.kick(100, 0)
            }
        })

        this.socket = null

        this.side = null
        this.id = null

        this.teamName = null

        this.assumedPosition = null
        this.assumedAngle = 0

        this.controller = null

        this.gameState = "before_kick_off" 

        this.isPassed = false
        this.isSaidGo = false
        this.isHearedGo = false

        this.agentHearedState = undefined
    }

    socketSend(command, value) {
        this.socket.sendMessage(`(${command} ${value})`)
    }

    move(x, y) {
        this.socketSend("move", `${x} ${y}`)
        this.setPosition({x, y})
    }

    dash(power) {
        this.socketSend("dash", `${power}`)
    }

    turn(angle) {
        this.socketSend("turn", `${angle}`)
        this.setAngle((this.assumedAngle + angle) % 180)
    }

    kick(power, angle) {
        this.socketSend("kick", `${power} ${angle}`)
    }

    say(message) {
        this.socketSend("say", `${message}`)
    }

    setSocket(socket) {
        this.socket = socket
    }

    setSide(side) {
        this.side = side
    }

    setId(id) {
        this.id = id
    }

    setTeamName(teamName) {
        this.teamName = teamName
    }

    setPosition(position) {
        this.assumedPosition = position
    }

    setAngle(angle) {
        this.assumedAngle = angle
    }

    setController(controller) {
        this.controller = controller
    }

    recieveMessage(message) {

        const data = Msg.parseMsg(message.toString('utf8'))

        if (!data) {
            throw new Error("Parse error\n" + msg)
        } 

        const {cmd: command, p: parameters} = data

        switch (command) {
            case "init":
                this.onInit(parameters)
                break
            case "hear":
                this.onHear(parameters)
                break
            case "see":
                this.onSee(parameters)
                break
            case "sense_body":
                this.onSenseBody(parameters)
                break
        }

    }

    sendMessage(command, value) {
        this.socket.sendMessage(`(${cmd} ${value})`)
    }

    onInit(parameters) {
        const [side, id] = parameters

        this.setSide(side)
        this.setId(id)
    }

    onHear(parameters) {
        console.info("HEAR", parameters)
        const [tick, sender, message] = parameters
        
        if (message == '"go"' && sender != 'self') {
            this.isHearedGo = true
        } else if (message.includes("goal")) {
            this.isPassed = false
            this.isSaidGo = false
            this.isHearedGo = false
            this.agentHearedState = undefined
            this.controller.onHear(tick, sender, message)
        }
    }

    getFlags(p) {
        return p.filter(flag => {
            return typeof flag === "object" && flag.cmd.p.join("") in Flags
        }).map(flag => {

            const flagName = flag.cmd.p.join("")

            return {
                name: flagName,
                d: flag.p[0],
                angle: flag.p[1],
                ...Flags[flagName]
            }

        })
    }

    getGameObjects(p) {
        return p.filter(gameObject => {
            return typeof gameObject === "object" && !(gameObject.cmd.p.join("") in Flags)
        }).map(gameObject => {

            const gameObjectName = gameObject.cmd.p.join("")

            return {
                name: gameObjectName,
                d: gameObject.p[0],
                angle: gameObject.p[1]
            }
        })
    }

    processEnvironment(parameters) {

        let flags = this.getFlags(parameters)
        let gameObjects = this.getGameObjects(parameters)

        Utils.shuffle(flags)

        // console.debug("Flags: ", flags)
        // console.debug("Game objects: ", gameObjects)

        const position = Utils.calculatePosition(flags);

        if (!position) {
            // console.warn("Position not found")
        } else {
            // console.debug("Position found: ", position)
        }

        const relativePosition = position ? position : this.assumedPosition

        for (let i = 0; i < gameObjects.length; i++) {
            const objectPosition = Utils.calculateObjectPosition(gameObjects[i], relativePosition, flags)

            gameObjects[i] = {
                ...gameObjects[i],
                ...objectPosition
            }

            // console.debug("Object: ", gameObjects[i])
        }

        const angle = Utils.calculateAngle(relativePosition, flags)

        return [position, angle, flags, gameObjects]

    }

    onSee(parameters) {
        const [position, angle, flags, gameObjects] = this.processEnvironment(parameters)

        if (position) {
            this.setPosition(position)
        }

        if (angle) {
            this.setAngle(angle)
        }

        // console.info("SEE", position, angle, gameObjects)

        let agentState = {
            teamName: this.teamName,
            id: this.id,
            position,
            angle,
            flags,
            gameObjects,
            isPassed: this.isPassed,
            isSaidGo: this.isSaidGo,
        }

        if (this.isHearedGo) {
            this.agentHearedState = {
                teamName: this.teamName,
                id: this.id,
                position,
                angle,
                flags,
                gameObjects,
                isHearedGo: this.isHearedGo
            }
            agentState = this.agentHearedState
        }

        const [command, ...commandParameters] = this.controller.getCommand(agentState)

        switch (command) {
            case "move":
                this.move(...commandParameters)
                break
            case "dash":
                this.dash(...commandParameters)
                break
            case "turn":
                this.turn(...commandParameters)
                break
            case "kick":
                if (this.isSaidGo) {
                    this.isPassed = true
                }
                this.kick(...commandParameters)
                break
            case "say":
                this.isSaidGo = true
                this.say(...commandParameters)
                break
            case "stay":
                break
        }

    }

    onSenseBody(parameters) {
        // console.debug("SENSE_BODY", parameters)
    }
}

module.exports = Agent
