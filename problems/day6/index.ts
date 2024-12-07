import { readFileSync } from "fs";

type Coords = [number, number]

type Direction = '^' | '>' | 'v' | '<'

type Rotational = 'clockwise' | 'counterclockwise'

type Guard = {
    position: Coords
    direction: Direction,
    rotational: Rotational
}

type Tile = {
    directions: Direction[],
    corner: string[],
    obstacle: number
}

const grid = readFileSync('./problems/day6/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => line.split(''))

const mX = grid.length
const mY = grid[0].length

let guard: Guard = {
    position: [0, 0],
    direction: '^',
    rotational: 'clockwise'
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

const turn = ({ direction, rotational }: Guard) => {
    switch (direction) {
        case '^':
            return rotational === 'clockwise' ? '>' : '<'
        case '>':
            return rotational === 'clockwise' ? 'v' : '^'
        case 'v':
            return rotational === 'clockwise' ? '<' : '>'
        case '<':
            return rotational === 'clockwise' ? '^' : 'v'
    }
}

const entireColumn = (path: Tile[][], y: number) => {
    return path.map(column => column[y])
}

const entireRow = (path: Tile[][], x: number) => {
    return path[x]
}

const canLoop = (guard: Guard, path: Tile[][]) => {
    const rotation: Record<Direction, Record<Rotational, Direction[]>> = {
        '<': { clockwise: ['^', 'v'], counterclockwise: ['v', '^'] },
        '^': { clockwise: ['>', '<'], counterclockwise: ['<', '>'] },
        '>': { clockwise: ['v', '^'], counterclockwise: ['^', 'v'] },
        'v': { clockwise: ['<', '>'], counterclockwise: ['>', '<'] },
    }
    if (guard.direction === '<' || guard.direction === '>') {
        const column = entireColumn(path, guard.position[1]).filter(tile => tile.directions.length > 0)
        return column.some((tile) => rotation[guard.direction][guard.rotational].some((direction) => tile.directions.includes(direction)))
    }
    const row = entireRow(path, guard.position[0]).filter(tile => tile.directions.length > 0)
    return row.some((tile) => rotation[guard.direction][guard.rotational].some((direction) => tile.directions.includes(direction)))
}

const move = (guard: Guard, grid: string[][], path: Tile[][]) => {
    const [nx, ny] = ahead(guard)

    if (nx < 0 || nx >= mX || ny < 0 || ny >= mY) {
        return false
    }

    switch (grid[nx][ny]) {
        case '#':
            path[guard.position[0]][guard.position[1]].directions.push(guard.direction)
            guard.direction = turn(guard)
            path[guard.position[0]][guard.position[1]].directions.push(guard.direction)
            return true
        default:
            guard.position = [nx, ny]
            if (canLoop(guard, path)) {
                const [ox, oy] = ahead(guard)
                path[ox][oy].obstacle += 1
            }
            path[nx][ny].directions.push(guard.direction)
            return true
    }
}

for (let i = 0; i < mX; i++) {
    for (let j = 0; j < mY; j++) {
        if (grid[i][j] === guard.direction) {
            guard.position = [i, j]
        }
    }
}

const path = Array.from(
    { length: mX }, () => Array.from(
        { length: mY }, () => ({
            directions: [],
            corner: [],
            obstacle: 0
        } as Tile)
    )
)

path[guard.position[0]][guard.position[1]] = {
    directions: ['^'],
    corner: [],
    obstacle: 0
}

const main = async (debug: boolean) => {
    let count = 0;
    do {
        if (debug) {
            console.log(path.map(row => row.map(tile => tile.obstacle > 0 ? 'O' : tile.directions.length > 0 ? 'X' : '.').join('')).join('\n'))
            console.log('Count:', count)
            await new Promise(resolve => process.stdin.once('data', resolve))
            console.clear()
            count++
        }
    } while (move(guard, grid, path))

    let pathCount = 0
    let obstacleCount = 0
    for (let i = 0; i < mX; i++) {
        for (let j = 0; j < mY; j++) {
            pathCount += path[i][j].directions.length > 0 ? 1 : 0
            obstacleCount += path[i][j].obstacle
        }
    }

    console.log('Path taken:', pathCount)
    console.log('Obstacles:', obstacleCount)
}

main(true)
