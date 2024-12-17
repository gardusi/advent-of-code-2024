import { readFileSync } from 'fs'

const START = 'S'
const END = 'E'

type Coords = { i: number, j: number }
type Location = Coords & { w: number }

type Node = Location

const topographicMap = readFileSync('./problems/day16/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => line.split(''))

const printVisited = (visited: boolean[][]) => {
    console.log(visited.map(row => row.map(cell => cell ? 'X' : ' ').join('')).join('\n'))
}

const readMap = <T>(map: T[][], { i, j }: Coords) => map[i][j]

const setMap = <T>(map: T[][], { i, j }: Coords, value: T) => {
    map[i][j] = value
}

const isSame = (a: Coords, b?: Coords) => b && a.i === b.i && a.j === b.j

const addWeight = (a: Coords, b?: Coords) => (!b || (a.i !== b.i && a.j !== b.j)) ? 1001 : 1

const cornerCase = (map: string[][], { i, j }: Coords) => readMap(map, { i, j }) === 'x' ? 1000 : 0 

const emptyMap = <T>(mI: number, mJ: number, value: T) =>
        Array.from({ length: mI }, () => Array.from({ length: mJ }, () => value))

const copyMap = <T>(map: T[][]) => map.map(row => row.slice())

const isValidVisited = (map: string[][], destination: Coords) => {
    const next = readMap(map, destination)
    return next === '.' || next === 'x' || next === 'E'
}

const isValidMoviment = (map: string[][], visited: boolean[][], destination: Coords, previous?: Coords) =>
    !isSame(destination, previous) && !readMap(visited, destination) && isValidVisited(map, destination)

const getMovements = (map: string[][], visited: boolean[][], { i, j, w }: Location, previous?: Location) => {
    const directions = [
        { i: i - 1, j },
        { i: i + 1, j },
        { i, j: j - 1 },
        { i, j: j + 1 }
    ].filter((direction) => isValidMoviment(map, visited, direction, previous))

    return directions.map((dir) => ({ ...dir, w: w + addWeight(dir, previous) - cornerCase(map, dir) }))
}

const reachTrailtails = (map: string[][], visited: boolean[][], nodes: Node[][], trailtails: Location[], current: Location, previous: Location | undefined, copy: boolean) => {
    setMap(visited, current, true)

    if (readMap(nodes, current).w > current.w) {
        setMap(nodes, current, { ...previous, w: current.w })
    }

    const movements = getMovements(map, visited, current, previous)
    
    for (const movement of movements) {
        if (readMap(map, movement) === END) {
            setMap(visited, movement, true)

            if (readMap(nodes, movement).w > movement.w) {
                setMap(nodes, movement, { ...previous, w: movement.w })
            }

            console.log(readMap(nodes, movement))
            
            printVisited(visited)
            trailtails.push(movement)
            continue
        }
        reachTrailtails(map, copy ? copyMap(visited) : visited, nodes, trailtails, movement, current, copy)
    }

    return trailtails
}

const getTrailheads = (map: string[][]) => {
    const trailheads: Location[] = []
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const cell = readMap(map, { i, j })
            if (cell === START) {
                trailheads.push({ i, j, w: 0 })
            }
        }
    }
    return trailheads
}

const departFromTrailheads = (map: string[][], copy: boolean) => {
    const trailheads: Location[] = getTrailheads(map)
    const trailtails: Location[][] = []
    for (const current of trailheads) {
        const visited = emptyMap(map.length, map[0].length, false)
        const nodes = emptyMap<Node>(map.length, map[0].length, { i: -1, j: -1, w: Infinity })
        setMap(nodes, current, { i: -1, j: -1, w: 0 })

        trailtails.push(reachTrailtails(map, visited, nodes, [], current, undefined, copy))

        if (!copy) {
            printVisited(visited)
        }
    }
    return trailtails
}

const cheapestTailtrailCosts = departFromTrailheads(topographicMap, true)
    .map((trailtails) => trailtails.reduce((cw, { w }) => w < cw ? w : cw, Infinity))

for (const cost of cheapestTailtrailCosts) {
    console.log('Cheapest tailtrail cost:', cost)
}
