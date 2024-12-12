import { readFileSync } from 'fs'

type Location = { i: number, j: number }

type Region = {
    path: boolean[][]
    perimeter: number
    area: number
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
            regions.push({ path, perimeter, area })
        }
    }
    console.log('Regions found:', regions.length)
    return regions
}

const regions = mapAllRegions(input)

const fenceCost = regions.reduce((total, { area, perimeter }) => total + area * perimeter, 0)

console.log('Total fence cost:', fenceCost)
