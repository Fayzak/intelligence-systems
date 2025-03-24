module.exports = {
    distance(p1, p2) {
        const result = Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
        return Number(result.toFixed(2))
    },
    getIntersections(circle1, circle2) {

        console.debug("Circle 1: ", circle1)
        console.debug("Circle 2: ", circle2)

        const { x: x1, y: y1, distance: d1 } = circle1
        const { x: x2, y: y2, distance: d2 } = circle2

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
    },

    isOnField(p) {
        return p.x >= -57.5 && p.x <= 57.5 && p.y >= -39 && p.y <= 39
    },

    calculateMSE(flags, predictedPosition) {
        return flags.reduce((acc, flag) => {
            return acc + (flag.distance - this.distance(flag, predictedPosition)) ** 2
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

            const { x: x, y: y, distance: d } = flag

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
        
    },

    calculateAngle(position, flags) {

        // TODO: process possible errors
        if (flags.length < 1) {
            console.warn("Not enough flags to calculate angle")
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
        //     console.warn("Not enough flags to calculate angle")
        //     return null
        // }

        let resultX = 0
        let resultY = 0

        for (const flag of flags) {

            const { x: x, y: y, angle: alpha } = flag
            const { distance: d, angle: beta } = gameObject
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
    }
}
