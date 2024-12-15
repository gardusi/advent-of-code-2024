import { readFileSync } from "fs";

type Robot = {
    start: bigint[]
    speed: bigint[]
}

const input = readFileSync('./problems/day14/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map((robot) => robot.split(' '))

const getRobots = (input: string[][]) =>
    input.map((robot) => ({
        start: robot[0].match(/-?\d+/ig)!.map(BigInt),
        speed: robot[1].match(/-?\d+/ig)!.map(BigInt),
    }))

const loop = (component: bigint, bound: bigint) => {
    if (component < 0) {
        return (bound - 1n) + (component + 1n) % bound
    }
    return component % bound
}

const computePosition = ({ start, speed }: Robot, seconds: bigint, bounds: [bigint, bigint]) => {
    const [ix, iy] = start
    const [vx, vy] = speed
    const [mx, my] = bounds

    const fx = loop(ix + vx * seconds, mx)
    const fy = loop(iy + vy * seconds, my)

    return [fx, fy]
}

const WIDE = 101n
const TALL = 103n

const printResult = (positions: [bigint, bigint][]) => {
    const matrix = Array.from({ length: Number(TALL) }, () => Array.from({ length: Number(WIDE) }, () => '.'))

    for (const [x, y] of positions) {
        const current = matrix[Number(y)][Number(x)]
        matrix[Number(y)][Number(x)] = current === '.' ? '1' : (String(Number(current) + 1))
    }

    console.log(matrix.map(row => row.map(cell => cell).join('')).join('\n'))
}

const hx = (WIDE - 1n) / 2n
const hy = (TALL - 1n) / 2n

const quadrants = [0, 0, 0, 0]
const positions: [bigint, bigint][] = []
for (const robot of getRobots(input)) {
    const [x, y] = computePosition(robot, 100n, [WIDE, TALL])
    positions.push([x, y])

    if (x > hx && y < hy) {
        quadrants[0]++
    }
    if (x < hx && y > hy) {
        quadrants[1]++
    }
    if (x < hx && y < hy) {
        quadrants[2]++
    }
    if (x > hx && y > hy) {
        quadrants[3]++
    }
}

const safetyFactor = quadrants[0] * quadrants[1] * quadrants[2] * quadrants[3]
console.log('Quadrants:', quadrants)
console.log('Safety factor:', safetyFactor)

printResult(positions)

// 71631250
// 89164800
