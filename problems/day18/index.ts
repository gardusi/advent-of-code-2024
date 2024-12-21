import { readFileSync } from 'fs'

const GRID_SIZE = 71
const BYTES = 1024
const START = 'S'
const END = 'E'

type Coords = { i: number, j: number }
type Location = Coords & { w: number }

type Node = Location

const bytes = readFileSync('./problems/day18/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => line.match(/\d+/ig)!.map(Number))

const printVisited = (visited: boolean[][]) => {
    console.log(visited.map(row => row.map(cell => cell ? 'X' : ' ').join('')).join('\n'))
}

const printMatrix = (matrix: string[][]) => {
    console.log(matrix.map(line => line.join('')).join('\n'))
}

const readMap = <T>(map: T[][], { i, j }: Coords) => map[i][j]

const setMap = <T>(map: T[][], { i, j }: Coords, value: T) => {
    map[i][j] = value
}

// const addWeight = (a: Coords, b?: Coords) => (!b || (a.i !== b.i && a.j !== b.j)) ? 1001 : 1

// const cornerCase = (map: string[][], { i, j }: Coords) => readMap(map, { i, j }) === 'x' ? 1000 : 0 

const emptyMap = <T>(mI: number, mJ: number, value: T) =>
        Array.from({ length: mI }, () => Array.from({ length: mJ }, () => value))

const copyMap = <T>(map: T[][]) => map.map(row => row.slice())

const isBounded = ({ i, j }: Coords, mI: number, mJ: number) => i >= 0 && i < mI && j >= 0 && j < mJ

const isValidMoviment = (map: string[][], destination: Coords) => {
    if (!isBounded(destination, GRID_SIZE, GRID_SIZE)) {
        return false
    }

    const next = readMap(map, destination)
    return next === '.' || next === 'x' || next === 'E'
}

const getMovements = (map: string[][], nodes: Node[][], current: Location) => {
    const { i, j } = current

    const directions = [
        { i: i - 1, j },
        { i: i + 1, j },
        { i, j: j - 1 },
        { i, j: j + 1 }
    ].filter((direction) => isValidMoviment(map, direction))

    return directions.map((direction) => {
        const { w } = readMap(nodes, direction)

        return { ...direction, w: Math.min(current.w + 1, w + 1) }
    })
}

const getTrailhead = (map: string[][]) => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const cell = readMap(map, { i, j })
            if (cell === START) {
                return { i, j, w: 0 }
            }
        }
    }
    throw new Error('No trailhead found')
}

const depart = (map: string[][]) => {
    const trailhead: Location = getTrailhead(map)
    const pathGroup: Location[] = []

    const visited = emptyMap(map.length, map[0].length, false)
    const nodes = emptyMap<Node>(map.length, map[0].length, { i: -1, j: -1, w: Infinity })
    setMap(nodes, trailhead, { i: -1, j: -1, w: 0 })

    const trailtails: Location[] = []
    let cheapest = { i: -1, j: -1, w: Infinity }
    let current = trailhead
    do {
        if (readMap(map, current) === END) {
            trailtails.push(current)
        }

        setMap(visited, current, true)

        const movements = getMovements(map, nodes, current)
        for (const movement of movements) {
            const node = readMap(nodes, movement)
            if (node.w > movement.w) {
                setMap(nodes, movement, { ...current, w: movement.w })
            }
        }

        cheapest = { i: -1, j: -1, w: Infinity }
        for (let i = 0; i < visited.length; i++) {
            for (let j = 0; j < visited[i].length; j++) {
                const node = readMap(nodes, { i, j })
                // const movements = getMovements(map, visited, nodes, { i, j, w: node.w })
                if (!readMap(visited, { i, j }) && node.w < cheapest.w) {
                    cheapest = { i, j, w: node.w }
                }
            }
        }
        current = cheapest
    } while (cheapest.w < Infinity)

    // printVisited(visited)
    return trailtails
}

const runRoutine = (bytesFalling: number) => {
    const byteFallingMap = emptyMap(GRID_SIZE, GRID_SIZE, '.')
    setMap(byteFallingMap, { i: 0, j: 0 }, START)
    setMap(byteFallingMap, { i: GRID_SIZE - 1, j: GRID_SIZE - 1 }, END)
    for (let n = 0; n < bytesFalling; n++) {
        const [i, j] = bytes[n]
        setMap(byteFallingMap, { i, j }, '#')
    }
    
    return depart(byteFallingMap).reduce((cw, { w }) => w < cw ? w : cw, Infinity)
}

let routeTime = runRoutine(BYTES)
console.log('Quickest route:', routeTime)

let bytesFalling = BYTES
while (bytesFalling <= bytes.length) {
    bytesFalling++
    const result = runRoutine(bytesFalling)
    if (result === Infinity) {
        break
    }
    routeTime = result   
}

console.log('Killer byte:', bytes[bytesFalling - 1])
