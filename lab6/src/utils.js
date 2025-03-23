module.exports = {
    distance(p1, p2) {
        return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
    },
    getIntersections(circle1, circle2) {

        // console.debug("Circle 1: ", circle1)
        // console.debug("Circle 2: ", circle2)

        const { x: x1, y: y1, d: d1 } = circle1
        const { x: x2, y: y2, d: d2 } = circle2

        if (x1 == x2) {
            // console.debug("x1 == x2")

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
            // console.debug("y1 == y2")

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

        // console.debug("x1 != x2 and y1 != y2")

        const alpha = (y1 - y2) / (x2 - x1)
        const beta = (d1 ** 2 - d2 ** 2 + x2 ** 2 - x1 ** 2 + y2 ** 2 - y1 ** 2) / (2 * (x2 - x1))

        const a = alpha ** 2 + 1
        const b = 2 * (alpha * (beta - x1) - y1)
        const c = beta ** 2 - 2 * beta * x1 + x1 ** 2 + y1 ** 2 - d1 ** 2

        let D = b ** 2 - 4 * a * c

        if (D < 0) {
            D = 0
        }

        // console.debug("alpha: ", alpha)
        // console.debug("beta: ", beta)
        // console.debug("a: ", a)
        // console.debug("b: ", b)
        // console.debug("c: ", c)
        // console.debug("D: ", D)

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
    },

    isOnField(p) {
        return p.x >= -57.5 && p.x <= 57.5 && p.y >= -39 && p.y <= 39
    },

    calculateMSE(flags, predictedPosition) {
        return flags.reduce((acc, flag) => {
            return acc + (flag.d - this.distance(flag, predictedPosition)) ** 2
        }, 0) / flags.length
    },

    shuffle(array) {
        let currentIndex = array.length;

        while (currentIndex != 0) {

            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    },

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

    },

    averagiatePosition(position, flags) {

        for (const flag of flags) {

            const { x: x, y: y, d: d } = flag

            const { x: xPrev, y: yPrev } = position
            const dPrev = this.distance(flag, position)

            const dNew = (d + dPrev) / 2

            const cos_alpha = (x - xPrev) / dPrev 
            const sin_alpha = (y - yPrev) / dPrev 
            
            position = {
                x: xPrev + (dPrev - dNew) * cos_alpha,
                y: yPrev + (dPrev - dNew) * sin_alpha
            }
        }

        return position
    },
    
    calculatePosition(flags) {

        if (flags.length < 2) {
            // console.warn("Not enough flags to calculate position")
            return null
        }

        const possiblePositions = this.getIntersections(flags[0], flags[1])

        // console.debug("Possible positions: ", possiblePositions)

        if (flags.length == 2 || this.checkIfOnOneLine(flags)) {
            // console.debug("On one line or not enough flags", this.checkIfOnOneLine(flags))
            const filtered = possiblePositions.filter(this.isOnField)
            // console.debug("Filtered positions: ", filtered)

            if (filtered.length != 1) {
                // console.warn("Can't determine position")
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
        
    },

    calculateAngle(position, flags) {

        // TODO: process possible errors
        if (flags.length < 1) {
            // console.warn("Not enough flags to calculate angle")
            return null
        }

        const angles = flags.map(flag => {
            const { x: x, y: y, angle: alpha } = flag
            const { x: xCurrent, y: yCurrent } = position

            const beta = this.degrees(Math.atan2(y - yCurrent, x - xCurrent))

            return (alpha - beta + 360) % 360
        })

        let angle = angles[0]

        for (let i = 1; i < angles.length; i++) {
            if (Math.abs(angles[i] - angles[i - 1]) > 180) {
                if (angles[i] > angles[i - 1]) {
                    angles[i] -= 360
                } else {
                    angles[i] += 360
                }
            }
            angle += angles[i]
        }

        angle = angle / flags.length

        if (angle > 180) {
            angle -= 360
        }
        
        return Number((angle).toFixed(0))
    },

    calculateRelativeAngle(center, edge) {

        const { x: x, y: y } = edge
        const { x: x1, y: y1 } = center

        let angle = -this.degrees(Math.atan2(y - y1, x - x1))

        return Number(angle.toFixed(0))
    },

    getAnglesDifference(angle1, angle2) {

        let angle = angle2 - angle1 

        if (angle > 180) {
            angle -= 360
        } else if (angle < -180) {
            angle += 360
        }

        return angle

    },

    radian(degrees) {
        return degrees * (Math.PI / 180)
    },

    degrees(radians) {
        return radians * (180 / Math.PI)
    },

    calculateObjectPosition(gameObject, position, flags) {

        // TODO: process possible errors
        // if (flags.length < 1) {
        //     // console.warn("Not enough flags to calculate angle")
        //     return null
        // }

        let resultX = 0
        let resultY = 0

        for (const flag of flags) {

            const { x: x, y: y, angle: alpha } = flag
            const { d: d, angle: beta } = gameObject
            const { x: xCurrent, y: yCurrent } = position

            const l = this.distance(position, flag)
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
    },
    kick(taken){
        let side = taken.side;
        let flags, plus;
        if (side == "l"){
            flags = ["fgrt", "gr", "fgrb"];
            plus = [5, 0, -5];
        } else {
            flags = ['fglt', 'gl', 'fglb'];
            plus = [-5, 0, 5];
        }
        for (let i = 0; i < 3; i++){
            let flag = flags[i];
            if (taken.state.all_flags[flag]){
                return {n: "kick", v: "100 " + (taken.state.all_flags[flag].angle + plus[i])};
            }
        }

        let random_flag = taken.state.all_flags[Object.keys(taken.state.all_flags)[0]];
        if (side == "l"){
            if (random_flag.y > 0){
                return {n: "kick", v: "10 -45"};
            } else {
                return {n: "kick", v: "10 45"};
            }
        } else {
            if (random_flag.y < 0){
                return {n: "kick", v: "10 -45"};
            } else {
                return {n: "kick", v: "10 45"};
            }            
        }

    },
    forward(taken){
        if (!taken.state.pos){
            return null;
        }
        let sign = (taken.side == 'l') ? 1 : -1;
        let dist = 10;
        let pos = taken.state.pos;
        destination = {'x': pos.x + sign*dist, 'y': pos.y};
        let can = this.canPass(pos, destination, taken.state.enemyTeam.concat(taken.state.players), 5);
        if (can){
            return {n: "kick", v: "25 0"};
        }

        destination = {'x': pos.x + sign * Math.sqrt(3) / 2 * dist, 'y': pos.y + sign * dist / 2};
        can = canPass(pos, destination, taken.state.enemyTeam.concat(taken.state.players), 5);
        if (can){
            return {n: "kick", v: "25 -30"};
        }

        destination = {'x': pos.x + sign * Math.sqrt(3) / 2 * dist, 'y': pos.y + -sign * dist / 2};
        can = canPass(pos, destination, taken.state.enemyTeam.concat(taken.state.players), 5);
        if (can){
            return {n: "kick", v: "25 30"};
        }
        return null;        
    },
    seeDir(taken){
        if (!taken.state.pos){
            return true;
        }
        let side = taken.side;
        let sign = (side == 'l') ? 1 : -1;
        let keys = Object.keys(taken.state.all_flags);
        for (const key of keys){
            let flag = taken.state.all_flags[key];
            if (Math.abs(flag.x) < 50){
                continue;
            }
            let dir = (flag.x > taken.state.pos.x) ? 1 : -1;
            if (dir == sign){
                return true;
            }
        }
        return false;
    },
    canPass(pos, player, enemies, danger){
        if (Math.abs(player.x) > 46){
            return false;
        }
        let poses = [];
        let coeffs = [0.1, 0.5, 0.7, 1.];
        for (const c of coeffs){
            poses.push([pos.x + c * (player.x - pos.x), pos.y + c * (player.y - pos.y)])
        }

        for (const position of poses){
            for (const enemy of enemies){
                if (!enemy.x){
                    continue;
                }
                if (Math.pow(Math.pow(enemy.x - position.x, 2) + Math.pow(enemy.y - position.y, 2), 0.5) < danger){
                    return false;
                }
            }
        }
        return true;
    },
    pass(taken){
        let side = taken.side;
        let sign = (side == 'l') ? 1 : -1;
        let dir = this.seeDir(taken);
        if (!taken.state.pos){
            return;
        }
        for (const player of taken.state['myTeam']){
            if (!player.x){
                continue;
            }
            let num = Math.random();
            let stake;
            if (dir){
                stake = taken.fw_p;
            } else {
                stake = taken.back_p;
            }

            if (stake < num){
                continue;
            }


            let can = this.canPass(taken.state.pos, player, taken.state['enemyTeam'], 5);
            if (!can){
                continue;
            }
            can = this.canPass(taken.state.pos, player, taken.state['players'], 5);
            if (!can){
                continue;
            }
            console.log(taken.state.pos.x, player.x);
            return {n: "kick", v: 2 * player.dist + 10 + " " + player.angle};
        }
        return null;
    },
    turn(side, angle){
        return {n: 'turn', v: side * angle};
    },
    teamTaken(taken){
        if (!taken.state.ball || !taken.state.pos){
            return false;
        }
        if (!taken.state['myTeam']){
            return false;
        }
        let ball = taken.state.ball;
        let pos = taken.state.pos;
        let mydist = Math.pow(pos.x - ball.x, 2) + Math.pow(pos.y - ball.y, 2);
        for (const player of taken.state['myTeam']){
            if (!player.x){
                continue;
            }
            let dist = Math.pow(player.x - ball.x, 2) + Math.pow(player.y - ball.y, 2);
            if (dist < 81 && dist < mydist){
                return true;
            }
        }
        return false;
    },
    avoidCollision(taken){
        let avoidance = null;
        for (const name of ['myTeam', 'enemyTeam', 'players']){
            for (const player of taken.state[name]){
                if (player.dist < 0.5){
                    return [{n: 'turn', v: -player.angle}, {n: 'dash', v: 60}];
                }
            }
        }
        return null;
    },
    takeBall(dist, angle){
        if (Math.abs(angle) > 7){
            return {n: "turn", v: angle};
        }
        if (dist < 2){
            return {n: "dash", v: 50};
        } 
        return {n: "dash", v: 100};
    },
    returnInZone(y, bottom, top, direction, taken){
        if (y <= bottom && y >= top){
            return null;
        }
        let keys = Object.keys(taken.state.all_flags);
        for (const key of keys) {
            let flag = taken.state.all_flags[key];
            if (flag.y <= bottom && flag.y >= top){
                if (Math.abs(flag.angle) > 5){
                    return [{n: "turn", v: flag.angle}, {n: "dash", v: 80}];    
                }
                return {n: "dash", v: 80};
            }
        }
        return {n: "turn", v: 45};
    },
    inZone(y, bottom, top, direction){
        if (y <= bottom && y >= top){
            return true;
        }
        return false;
    },
    getSpeed(x, direction, center, taken){
        return 100;
    },
    go2ball(x, y, bottom, top, center, ball_angle, direction, taken){
        let speed = this.getSpeed(x, direction, center, taken);
        if (Math.abs(ball_angle) > 7){
            return {n: "turn", v: ball_angle};
        }
        return {n: "dash", v: speed};
    },
    squares_diff(x1, x2){
        return x1 * x1 - x2 * x2
    },
    find_parameter(param, data){
        for (const obj of data){
            if (typeof obj === 'number'){
                continue;
            }
            if (obj['cmd'] === param){
                return obj['p'];
            }
        }        
    },
    get_unit_vector(direction, directionOfSpeed){
        if (directionOfSpeed === null){
            return null;
        }
        let angle = directionOfSpeed -  direction;
        angle = angle * Math.PI / 180;
        return [Math.cos(angle), -Math.sin(angle)];
    },
    solveby3(d1, d2, d3, x1, y1, x2, y2, x3, y3) {
        if ((y1 - y2) === (y1 - y3)){
            [d1, d2] = [d2, d1];
            [x1, x2] = [x2, x1];
            [y1, y2] = [y2, y1];
        }

        let alpha1 = (y1 - y2) / (x2 - x1);
        let beta1 = (y2 * y2 - y1 * y1 + x2 * x2 - x1 * x1 + d1 * d1 - d2 * d2) / (2 * (x2 - x1));
        let alpha2 = (y1 - y3) / (x3 - x1);
        let beta2 = (y3 * y3 - y1 * y1 + x3 * x3 - x1 * x1 + d1 * d1 - d3 * d3) / (2 * (x3 - x1));
        let delta_beta = beta1 - beta2;
        let delta_alpha = alpha2 - alpha1;
        let X = alpha1 * (delta_beta / delta_alpha) + beta1;
        let Y = delta_beta / delta_alpha;

        return [X, Y];
    },

    get_similarity(coord, x1, y1, x2, y2, e1, e2){
    	let vector1 = [x1 - coord[0], y1 - coord[1]];
    	let vector2 = [x2 - coord[0], y2 - coord[1]];
    	let result = (e1[0] * vector1[0] + e1[1] * vector1[1]);
        if (e2){
            result += e2[0] * vector2[0] + e2[1] * vector2[1];
        } 
        return result;
    },

    get_best(coord1, coord2, x1, y1, x2, y2, e1, e2){
    	let sim1 = this.get_similarity(coord1, x1, y1, x2, y2, e1, e2);
    	let sim2 = this.get_similarity(coord2, x1, y1, x2, y2, e1, e2);

    	if (sim1 > sim2){
    		return coord1;
    	} 
    	return coord2;
    },

    solveby2(d1, d2, x1, y1, x2, y2, e1, e2, x_bound, y_bound){
        let x, y, x_, y_;
        let possible_poses = [];
        let in_field = [];
        let result = [];
        if (x1 == x2){
            y = (this.squares_diff(y2, y1) + this.squares_diff(d1, d2)) / (2 * (y2 - y1));
            diff = Math.pow(this.squares_diff(d1, y-y1), 0.5);
            x = x1 + diff;
            x_ = x - 2 * diff;
            
            possible_poses.push([x, y]);
            possible_poses.push([x_, y]);
        } else if (y1 == y2){
            x = (this.squares_diff(x2, x1) + this.squares_diff(d1, d2)) / (2 * (x2 - x1));
            diff = Math.pow(this.squares_diff(d1, x-x1), 0.5);
            y = y1 + diff;
            y_ = y - 2 * diff;
            
            possible_poses.push([x, y]);
            possible_poses.push([x, y_]);
        } else {
	        let alpha = (y1 - y2) / (x2 - x1);
	        let beta = (this.squares_diff(y2, y1) + this.squares_diff(x2, x1) + this.squares_diff(d1, d2)) / (2 * (x2 - x1));

	        let a = alpha * alpha + 1;
	        let b = -2 * (alpha * (x1 - beta) + y1);
	        let c = Math.pow(x1 - beta, 2) + this.squares_diff(y1, d1);
	  
	        let discriminant = Math.pow(b*b - 4 * a * c, 0.5);
	        
	        y = (-b + discriminant) / (2 * a);
			x = y * alpha + beta;
			possible_poses.push([x, y]);

	        y_ = y - discriminant / a;
	        x_ = y_ * alpha + beta;
	        possible_poses.push([x_, y_]) 
        }
        for (const coord of possible_poses){
        	if ((Math.abs(coord[0]) <= x_bound) && (Math.abs(coord[1]) <= y_bound)){
        		in_field.push(coord);
        	}
        }
        if (in_field.length === 2 && e1){
        	result = this.get_best(in_field[0], in_field[1], x1, y1, x2, y2, e1, e2);
        } else {
        	result = in_field[0];
        }
        return result;
    },

    get_object_coords(d1, da, x, y, x1, y1, a1, aa, eo){
        let d_a1 = d1 * d1 + da * da - 2 * d1 * da * Math.cos(Math.abs(a1 - aa) * Math.PI / 180);
        d_a1 = Math.pow(d_a1, 0.5);
        if (!eo){
            eo = null;
        } else  {
            eo = [eo[0] * -1, eo[1] * -1];
        }
        
        return this.solveby2(da, d_a1, x, y, x1, y1, eo, null, 57.5, 39);
    },

    find_different_x_y(flags, flag){
        for (const f of flags){
            if ((f[0] !== flag[0]) && (f[1] !== flag[1])){
                return f;
            }
        }
        return null;
    },
    checkSame3Y(flags) {
        return flags[0][1] === flags[1][1]
            && flags[2][1] === flags[1][1]
            && flags[0][1] === flags[2][1];
    },


    see_object(obj_name, see_data){
        for (const obj of see_data){
            if (typeof obj === 'number'){
                continue;
            }
            let cur_obj_name = obj['cmd']['p'].join('');
            if (cur_obj_name === obj_name || (obj_name === 'p' && cur_obj_name.includes(obj_name)) && !cur_obj_name.includes("f") && !cur_obj_name.includes("B")){
                return obj['p'];
            }
        }
        return null;
    },


    get_flags_and_objects_2(data){
        let flags = [];
        let objects = [];
        let sortedFlags = {};
        let cur;
        let res = [];
        for (const obj of data){
            if (typeof obj === 'number'){
                continue;
            }
            obj_name = obj['cmd']['p'].join('');

            if (obj['p'].length === 1){
                continue;
            }

            if (!Flags[obj_name] && obj_name == "b"){
                objects.push([obj['p'][0], obj['p'][1]]);
                continue;
            }

            cur = [Flags[obj_name]['x'], Flags[obj_name]['y'], obj['p'][0], obj['p'][1]];
            if (res.length < 3){
                if (!sortedFlags[cur[0]]) {
                    sortedFlags[cur[0]] = [];
                    sortedFlags[cur[0]].push(cur);
                } else {
                    sortedFlags[cur[0]].push(cur);
                }

                if (Object.keys(sortedFlags).length === 3) {
                    for (let [key, value] of Object.entries(sortedFlags)) {
                        res.push(value[0]);
                        if (res.length === 3) {
                            break;
                        }
                    }
                }
            }
            if (flags.length < 2){
                flags.push(cur);
            }
        }
        if (res.length === 3 && !checkSame3Y(res)){
            return [res, objects];
        } else {
            return [flags, objects]; 
        }
    },
}
