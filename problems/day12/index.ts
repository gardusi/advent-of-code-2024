import { readFileSync } from 'fs'

type Location = { i: number, j: number }

type Region = {
    path: boolean[][]
    perimeter: number
    area: number
    sides: number
}

type Direction = {
    previous: boolean
    next: boolean
}

const input = readFileSync('./problems/day12/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map((line) => line.split(''))

const printPath = (path: boolean[][], symbol: string = 'X') => {
    console.log('\n' + path.map(row => row.map(cell => cell ? symbol : '.').join('')).filter((line) => line.trim() !== '').join('\n') + '\n')
}

const getArea = <T>(map: T[][]) => map.flat().filter(Boolean).length

const readMap = <T>(map: T[][], { i, j }: Location) => map[i][j]

const setMap = <T>(map: T[][], { i, j }: Location, value: T) => {
    map[i][j] = value
}

const emptyMap = (mI: number, mJ: number) =>
    Array.from({ length: mI }, () => Array.from({ length: mJ }, () => false))

const copyMap = <T>(map: T[][]) => map.map(row => row.slice())

const isBounded = ({ i, j }: Location, mI: number, mJ: number) => i >= 0 && i < mI && j >= 0 && j < mJ

const isSameRegion = (map: string[][], origin: Location, destination: Location) => {
    const next = readMap(map, destination)
    if (next === '.') {
        return false
    }
    const current = readMap(map, origin)
    return next === current
}

const isValidMoviment = (map: string[][], path: boolean[][], origin: Location, destination: Location) =>
    isBounded(destination, map.length, map[origin.i].length) && !readMap(path, destination) && isSameRegion(map, origin, destination)

const getMovements = (map: string[][], path: boolean[][], { i, j }: Location) => {
    return [
        { i: i - 1, j },
        { i: i + 1, j },
        { i, j: j - 1 },
        { i, j: j + 1 }
    ].filter((movement) => isValidMoviment(map, path, { i, j }, movement))
}

const getCurlCount = (map: string[][], path: boolean[][], { i, j }: Location) => {
    const curls = [
        { i: i - 1, j },
        { i: i + 1, j },
        { i, j: j - 1 },
        { i, j: j + 1 }
    ].filter((neighbor) => isBounded(neighbor, map.length, map[i].length) && readMap(path, neighbor))
    return curls.length
}

const mapRegion = (map: string[][], path: boolean[][], current: Location, perimeter: number) => {
    if (readMap(path, current)) {
        return perimeter
    }

    setMap(path, current, true)
    const movements = getMovements(map, path, current)

    const curlCount = getCurlCount(map, path, current)
    perimeter = perimeter - 2 * (curlCount - 2)
    
    for (const movement of movements) {
        perimeter = mapRegion(map, path, movement, perimeter)
    }

    return perimeter
}

const mapAllRegions = (map: string[][]) => {
    const regions: Region[] = []
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (regions.some((region) => readMap(region.path, { i, j }))) {
                continue
            }
            const path = emptyMap(map.length, map[i].length)
            const perimeter = mapRegion(map, path, { i, j }, 0)
            const area = getArea(path)
            regions.push({ path, perimeter, area, sides: NaN })
        }
    }
    console.log('Regions found:', regions.length)
    return regions
}

const countSides = (scan: boolean[]) => scan.join('').split('false').filter(Boolean).length

const getSideCount = (path: boolean[][]) => {
    let sideCount = 0

    for (let i = 0; i < path.length; i++) {
        const up = path[i].map((value, j) => value && (i <= 0 || !readMap(path, { i: i - 1, j })))
        const down = path[i].map((value, j) => value && (i >= path.length - 1 || !readMap(path, { i: i + 1, j })))

        sideCount += countSides(up)
        sideCount += countSides(down)
    }

    for (let j = 0; j < path[0].length; j++) {
        const left = path.map((col, i) => col[j] && (j <= 0 || !readMap(path, { i, j: j - 1 })))
        const right = path.map((col, i) => col[j] && (j >= path[0].length - 1 || !readMap(path, { i, j: j + 1 })))

        sideCount += countSides(left)
        sideCount += countSides(right)
    }

    return sideCount
}

const regions = mapAllRegions(input)
for (const region of regions) {
    region.sides = getSideCount(region.path)
    console.log('Sides:', region.sides)
}

const fenceCost = regions.reduce((totals, { area, perimeter, sides }) => ({
    full: totals.full + area * perimeter,
    discounted: totals.discounted + area * sides,
}), { full: 0, discounted: 0 })

console.log('Total fence cost:', fenceCost)


const readColumn = <T>(map: T[][], j: number) => {
    return map.map((v) => v[j])
}