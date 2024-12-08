import { readFileSync } from "fs";

type Coords = [number, number]

type Direction = '^' | '>' | 'v' | '<'

type Guard = {
    position: Coords
    direction: Direction
}

const originalGrid = readFileSync('./problems/day6/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => line.split(''))

const mX = originalGrid.length
const mY = originalGrid[0].length

let originalGuard: Guard = {
    position: [0, 0],
    direction: '^'
}

for (let i = 0; i < mX; i++) {
    for (let j = 0; j < mY; j++) {
        if (originalGrid[i][j] === originalGuard.direction) {
            originalGuard.position = [i, j]
        }
    }
}

const ahead = ({ position, direction }: Guard) => {
    const [x, y] = position
    switch (direction) {
        case '^':
            return [x - 1, y]
        case '>':
            return [x, y + 1]
        case 'v':
            return [x + 1, y]
        case '<':
            return [x, y - 1]
    }
}

const turn = ({ direction }: Guard) => {
    const rotation: Record<Direction, Direction> = {
        '^': '>',
        '>': 'v',
        'v': '<',
        '<': '^',
    }
    return rotation[direction]
}

const move = (guard: Guard, grid: string[][]) => {
    const [nx, ny] = ahead(guard)

    if (nx < 0 || nx >= mX || ny < 0 || ny >= mY) {
        return false
    }

    switch (grid[nx][ny]) {
        case '#':
            guard.direction = turn(guard)
            return true
        default:
            guard.position = [nx, ny]
            return true
    }
}

const copyMatrix = <T>(grid: T[][]) => {
    return [...grid.map(row => [...row])]
}

const previousPath = Array.from({ length: mX }, () => Array.from({ length: mY }, () => false))
const infiniteLoopMatrix = Array.from({ length: mX }, () => Array.from({ length: mY }, () => false))

const main = async (copy: boolean, grid: string[][], guard: Guard) => {
    let steps = 0
    do {
        if (copy) {
            previousPath[guard.position[0]][guard.position[1]] = true
        }
        if (steps > 10000) {
            return { steps: Infinity }
        }
        steps++
        if (!copy) {
            continue
        }
        const gridCopy = copyMatrix(grid)
        const [ox, oy] = ahead(guard)
        if (ox < 0 || ox >= mX || oy < 0 || oy >= mY) {
            continue
        }
        if (previousPath[ox][oy]) {
            continue
        }
        gridCopy[ox][oy] = '#'

        console.log('Creating new simulation for step', steps)
        const simulation = await main(false, gridCopy, { ...guard })

        if (simulation.steps > 10000) {
            console.log('Infinite loop detected')
            infiniteLoopMatrix[ox][oy] = true
        }          
    } while (move(guard, grid))

    return { steps }
}

main(true, originalGrid, originalGuard).then(({ steps }) => {
    console.log('Infinite loops detected:', infiniteLoopMatrix.flat().filter(Boolean).length)
    console.log('Algorithm steps:', steps)
})
