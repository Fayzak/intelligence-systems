const utils = require("../utils");

const CTRL_HIGH = {
	name: "player_high",
	execute(taken, controllers, bottom, top, direction, center){
		let act;
		if (taken.state.ball.dist <= 0.5){
			if (taken.kick){
				act = utils.pass(taken);
				if (act){
					return act;
				} else {
					return {n: "kick", v: "60 180"}
				}

			}
			// удар
			let side = taken.side;
			if (side == "l"){
				if (taken.state.ball){
					if (taken.state.ball.y >= 27){
						return {n: "kick", v: "5 -60"}
					} else if (taken.state.ball.y <= -27){
						return {n: "kick", v: "5 60"}
					}
				}
			} else {
				if (taken.state.ball){
					if (taken.state.ball.y >= 29){
						return {n: "kick", v: "5 60"}
					} else if (taken.state.ball.y <= -29){
						return {n: "kick", v: "5 -60"}
					}
				}
			}
			

			if (taken.state.pos){
				if (taken.state.pos.x >= 28 && taken.side == 'l' ||
					taken.state.pos.x <= -28 && taken.side == 'r'){
					return utils.kick(taken);

				}
			}
			//...........

			act = utils.pass(taken);
			if (act){
				return act;
			} else {
				if (!utils.seeDir(taken)){
					return {n: "kick", v: "10 45"};
				}
				act = utils.forward(taken);
				if (!act){
					return {n: "kick", v: "10 45"}
				}
				return act;
			}

		}


		if (taken.state.ball.dist >= 5){
			for (const player of taken.state.myTeam){
				if (player.dist < 10){
					return null;
				}
			}
			act = utils.returnInZone(taken.state.pos.y, bottom, top, direction, taken);
			if (act){
				return act;
			}
			let x = taken.state.pos.x;
			let y = taken.state.pos.y;
			return utils.go2ball(x, y, bottom, top, center, taken.state.ball.angle, direction, taken);			
		}

		let teamTake = utils.teamTaken(taken);
		if (!teamTake){
			return utils.takeBall(taken.state.ball.dist, taken.state.ball.angle);	
		} else {
			act = utils.returnInZone(taken.state.pos.y, bottom, top, direction, taken);
			if (act){
				return act;
			}			
		}
		
	}
}

module.exports = CTRL_HIGH;
