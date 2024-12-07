import { readFileSync } from "fs";

type Coords = [number, number]

type Direction = '^' | '>' | 'v' | '<'

type Guard = {
    position: Coords
    direction: Direction
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
    direction: '^'
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

const entireColumn = (path: Tile[][], y: number) => {
    return path.map(column => column[y])
}

const entireRow = (path: Tile[][], x: number) => {
    return path[x]
}

const alignedWithPreviousPath = (guard: Guard, tile: Tile) => {
    const rotation: Record<Direction, Direction[]> = {
        '<': ['^'],
        '^': ['>'],
        '>': ['v'],
        'v': ['<'],
    }

    return rotation[guard.direction]
        .some((direction) => tile.directions.includes(direction))
}

const canLoop = (guard: Guard, path: Tile[][]) => {
    if (guard.direction === '<' || guard.direction === '>') {
        const column = entireColumn(path, guard.position[1]).filter(tile => tile.directions.length > 0)

        // console.log(column.map(tile => tile.directions))

        return column.some((tile) => alignedWithPreviousPath(guard, tile))
    }
    const row = entireRow(path, guard.position[0]).filter(tile => tile.directions.length > 0)

    // console.log(row.map(tile => tile.directions))

    return row.some((tile) => alignedWithPreviousPath(guard, tile))
}

const move = (guard: Guard, grid: string[][], path: Tile[][]) => {
    const [nx, ny] = ahead(guard)

    if (nx < 0 || nx >= mX || ny < 0 || ny >= mY) {
        return false
    }

    switch (grid[nx][ny]) {
        case '#':
            // path[guard.position[0]][guard.position[1]].directions.push(guard.direction)
            guard.direction = turn(guard)
            path[guard.position[0]][guard.position[1]].directions.push(guard.direction)

            if (canLoop(guard, path)) {
                const [ox, oy] = ahead(guard)
                path[ox][oy].obstacle += 1
            }
            
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
            console.log(path.map((row) => row.map((tile) => tile.directions.length === 1 ? tile.directions[0] : tile.directions.length > 1 ? '*' : '.').join('')).join('\n'))

            console.log('')
            console.log('-'.repeat(mY))
            console.log('')

            console.log(path.map((row, i) => row.map((tile, j) => guard.position[0] === i && guard.position[1] === j ? guard.direction : tile.obstacle > 0 ? 'O' : tile.directions.length > 0 ? 'X' : '.').join('')).join('\n'))
            console.log('Count:', count)
            await new Promise(resolve => process.stdin.once('data', resolve))
            
            // await new Promise(resolve => setTimeout(resolve, 1))
            // console.clear()
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

main(false)
