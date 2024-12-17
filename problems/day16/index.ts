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

const addWeight = (a: Coords, b?: Coords) => (!b || (a.i !== b.i && a.j !== b.j)) ? 1001 : 1

const cornerCase = (map: string[][], { i, j }: Coords) => readMap(map, { i, j }) === 'x' ? 1000 : 0 

const emptyMap = <T>(mI: number, mJ: number, value: T) =>
        Array.from({ length: mI }, () => Array.from({ length: mJ }, () => value))

const copyMap = <T>(map: T[][]) => map.map(row => row.slice())

const isValidMoviment = (map: string[][], destination: Coords) => {
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
        const p1 = readMap(nodes, current)
        const p2 = readMap(nodes, direction)

        const w1 = current.w + addWeight(direction, p1) - cornerCase(map, direction)
        const w2 = p2.w + addWeight(direction, p2) - cornerCase(map, direction)

        return { ...direction, w: Math.min(w1, w2) }
    })
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

const departFromTrailheads = (map: string[][]) => {
    const trailheads: Location[] = getTrailheads(map)
    const trailtailGroups: Location[][] = []
    for (const trailhead of trailheads) {
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
        trailtailGroups.push(trailtails)

        printVisited(visited)
    }
    return trailtailGroups
}

const cheapestTailtrailCosts = departFromTrailheads(topographicMap)
    .map((trailtails) => trailtails.reduce((cw, { w }) => w < cw ? w : cw, Infinity))

for (const cost of cheapestTailtrailCosts) {
    console.log('Cheapest tailtrail cost:', cost)
}
