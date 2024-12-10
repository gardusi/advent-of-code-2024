import { readFileSync } from 'fs'

type Location = { i: number, j: number }

const topographicMap = readFileSync('./problems/day10/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => line.split(''))

console.log(topographicMap)

const readMap = <T>(map: T[][], { i, j }: Location) => map[i][j]

const setMap = <T>(map: T[][], { i, j }: Location, value: T) => {
    map[i][j] = value
}

const emptyMap = (mI: number, mJ: number) =>
        Array.from({ length: mI }, () => Array.from({ length: mJ }, () => false))

const isBounded = ({ i, j }: Location, mI: number, mJ: number) => i >= 0 && i < mI && j >= 0 && j < mJ

const isSmoothSlope = (map: string[][], origin: Location, destination: Location) => {
    const next = readMap(map, destination)
    if (next === '.') {
        return false
    }
    const current = readMap(map, origin)
    return Number(current) - Number(next) === 1
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

const reachTrailtails = (map: string[][], path: boolean[][], trailtails: Location[], current: Location) => {
    const movements = getMovements(map, path, current)
    
    for (const movement of movements) {
        setMap(path, movement, true)
        if (readMap(map, movement) === '9') {
            trailtails.push(movement)
            continue
        }
        reachTrailtails(map, path, trailtails, movement)
    }

    return path
}

const getTrailheads = (map: string[][]) => {
    const trailheads: Location[] = []
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            const cell = readMap(map, { i, j })
            if (cell === '0') {
                trailheads.push({ i, j })
            }
        }
    }
    return trailheads
}

const departFromTrailheads = (map: string[][]) => {
    const trailheads: Location[] = getTrailheads(map)
    const trailtails: Location[] = []
    for (const { i, j } of trailheads) {
        const path = emptyMap(map.length, map[i].length)
        reachTrailtails(map, path, trailtails, { i, j })
    }
    return trailtails
}

const trailtails = departFromTrailheads(topographicMap)

console.log(trailtails)
