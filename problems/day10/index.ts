import { readFileSync } from 'fs'

const START = '0'
const END = '9'
const DIFF = 1

type Location = { i: number, j: number }

type TailTrail = Location & { l: number }

const topographicMap = readFileSync('./problems/day10/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => line.split(''))

const printPath = (path: boolean[][]) => {
    console.log(path.map(row => row.map(cell => cell ? 'X' : ' ').join('')).join('\n'))
}

const readMap = <T>(map: T[][], { i, j }: Location) => map[i][j]

const setMap = <T>(map: T[][], { i, j }: Location, value: T) => {
    map[i][j] = value
}

const emptyMap = (mI: number, mJ: number) =>
        Array.from({ length: mI }, () => Array.from({ length: mJ }, () => false))

const copyMap = <T>(map: T[][]) => map.map(row => row.slice())

const isBounded = ({ i, j }: Location, mI: number, mJ: number) => i >= 0 && i < mI && j >= 0 && j < mJ

const isSmoothSlope = (map: string[][], origin: Location, destination: Location) => {
    const next = readMap(map, destination)
    if (next === '.') {
        return false
    }
    const current = readMap(map, origin)
    return Number(next) - Number(current) === DIFF
}

const isValidMoviment = (map: string[][], path: boolean[][], origin: Location, destination: Location) =>
    isBounded(destination, map.length, map[origin.i].length) && !readMap(path, destination) && isSmoothSlope(map, origin, destination)

const getMovements = (map: string[][], path: boolean[][], { i, j }: Location) => {
    return [
        { i: i - 1, j },
        { i: i + 1, j },
        { i, j: j - 1 },
        { i, j: j + 1 }
    ].filter((movement) => isValidMoviment(map, path, { i, j }, movement))
}

const reachTrailtails = (map: string[][], path: boolean[][], trailtails: TailTrail[], current: Location, l: number, copy: boolean) => {
    const movements = getMovements(map, path, current)
    
    for (const movement of movements) {
        setMap(path, movement, true)
        if (readMap(map, movement) === END) {
            trailtails.push({ ...movement, l })
            continue
        }
        reachTrailtails(map, copy ? copyMap(path) : path, trailtails, movement, l + 1, copy)
    }

    return trailtails
}

const getTrailheads = (map: string[][]) => {
    const trailheads: Location[] = []
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const cell = readMap(map, { i, j })
            if (cell === START) {
                trailheads.push({ i, j })
            }
        }
    }
    return trailheads
}

const departFromTrailheads = (map: string[][], copy: boolean) => {
    const trailheads: Location[] = getTrailheads(map)
    const trailtails: Location[][] = []
    for (const { i, j } of trailheads) {
        const path = emptyMap(map.length, map[i].length)

        trailtails.push(reachTrailtails(map, path, [], { i, j }, 0, copy))

        if (!copy) {
            printPath(path)
        }
    }
    return trailtails
}

const trailtailScore = departFromTrailheads(topographicMap, false)
    .map((t) => t.length)
    .reduce((a, b) => a + b, 0)

console.log('\nTrailtail Score:', trailtailScore)

const trailtailRating = departFromTrailheads(topographicMap, true)
    .map((t) => t.length)
    .reduce((a, b) => a + b, 0)

console.log('Trailtail Rating:', trailtailRating)

