const Flags = require('../flags')
const Utils = require('../utils')

Taken = {
    ballPrev: undefined,

    setHear(input) {
        //console.log("taken hear"+input)
        this.hear = input
    },
    // setSee(input, team, side) {
    setSee(agentState) {
        const {time, flags, gameObjects, position, team, side} = agentState

        //console.log(see.b_labels)
        this.see = agentState

        this.pos = {
            x: position.x,
            y: position.y
        }

        this.time = time
        this.team_name = team
        this.side = side

        const ball = gameObjects.find(object => object.name === "b")

        if (ball !== undefined) {

            if (this.ballPrev === undefined) {
                this.ballPrev = ball
            } else {
                this.ballPrev = this.ball
            }

            this.ball = ball

        } else {
            this.ball = undefined
        }

        const players = gameObjects.filter(object => object.name.startsWith("p"))

        if (players.length > 0) {
            let my_team = []
            let enemy_team = []
            //console.log(see.p_labels)
            players.forEach(function (player) {
                if(player.name.includes(team))
                    my_team.push(player)
                else
                    enemy_team.push(player)
            })
            this.teamOwn = enemy_team
            this.team = my_team
            //console.log(my_team)
            //console.log(enemy_team)
        }


        const enemySide = side === "l" ? "r" : "l"

        const ownGoalFlag = `g${side}`
        const enemyGoalFlag = `g${enemySide}`

        this.goalOwn = {
            x: Flags[ownGoalFlag].x,
            y: Flags[ownGoalFlag].y,
            f:ownGoalFlag,
        }
        const index = flags.findIndex(function(flag) {
            return flag.name === ownGoalFlag
        });
        if(index !==-1){
            this.goalOwn.dist = flags[index].d
            this.goalOwn.angle = flags[index].angle
        }

        this.goal = {
            x: Flags[enemyGoalFlag].x,
            y: Flags[enemyGoalFlag].y,
            f:enemyGoalFlag,
        }
        const index_enemy = flags.findIndex(function(flag) {
            return flag.name === enemyGoalFlag
        });
        if(index_enemy !==-1){
            this.goal.dist = flags[index_enemy].d
            this.goal.angle = flags[index_enemy].angle
        }

        //console.log(this.goal)
        return this
    }
}

module.exports = Taken
