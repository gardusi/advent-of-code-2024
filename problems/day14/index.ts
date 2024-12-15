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

const computeQuadrants = (seconds: bigint) => {
    const quadrants = [0, 0, 0, 0]
    const positions: [bigint, bigint][] = []
    for (const robot of getRobots(input)) {
        const [x, y] = computePosition(robot, seconds, [WIDE, TALL])
        positions.push([x, y])
    
        if (x < hx && y < hy) quadrants[0]++
        if (x > hx && y < hy) quadrants[1]++
        if (x < hx && y > hy) quadrants[2]++
        if (x > hx && y > hy) quadrants[3]++
    }
    return { quadrants, positions }
}

const result = computeQuadrants(100n);
const [A, B, C, D] = result.quadrants
console.log('Safety factor:', A * B * C * D)

let positions: [bigint, bigint][] = []

// Obtained by looping and checking when every robot is back to their initial position
const cycleTime = 10403n

let promissingCandidate = {
    seconds: 0n,
    factor: 0n
}

let seconds = 1n
while(seconds < cycleTime) {
    const result = computeQuadrants(seconds)
    const [A, B, C, D] = result.quadrants
    positions = result.positions

    const factor = BigInt(A * B * C * D)

    if (promissingCandidate.factor === 0n || factor < promissingCandidate.factor) {
        console.log('Promissing candidate at', seconds, 'below:')
        printResult(positions)

        promissingCandidate = { seconds, factor }
    }
    seconds++
}
