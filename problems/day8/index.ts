import { readFileSync } from "fs"

type Location = [number, number]

type Transmissions = {
    [code: string]: Location[]
}

type BoundDetection = (field: string[][]) => (location: Location) => boolean
type Calculation = (location: Location, difference: Location) => Location
type Pattern = (field: string[][], left: Location, right: Location) => Location[]

const input = readFileSync('./problems/day8/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => line.split(''))

const printMatrix = (matrix: string[][]) => {
    console.log(matrix.map(line => line.join('')).join('\n'))
}

const copyMatrix = (matrix: string[][]) => {
    return matrix.map(line => line.slice())
}

const countSignals = (matrix: string[][]) => matrix.flat().filter(cell => cell === '#').length

const getDifference: Calculation = (left, right) => {
    const [y1, x1] = left
    const [y2, x2] = right

    return [y1 - y2, x1 - x2]
}

const getLeftAntipode: Calculation = ([y, x], [dy, dx]) => [y + dy, x + dx]
const getRightAntipode: Calculation = ([y, x], [dy, dx]) => [y - dy, x - dx]

const bounded: BoundDetection =
    (field) => ([y, x]) => y >= 0 && y < field.length && x >= 0 && x < field[0].length

const getAntipodes: Pattern = (field, left, right) => {
    const difference = getDifference(left, right)
    const leftAntipode = getLeftAntipode(left, difference)
    const rightAntipode = getRightAntipode(right, difference)

    const antipodes: Location[] = [leftAntipode, rightAntipode]
    return antipodes.filter(bounded(field))
}

const getPropagations: Pattern = (field, left, right) => {
    const isBounded = bounded(field)
    const propagations: Location[] = []

    propagations.push(left)
    propagations.push(right)

    let leftPropagation = left
    let rightPivot = right
    do {
        const difference = getDifference(leftPropagation, rightPivot)
        const propagation = getLeftAntipode(leftPropagation, difference)
        if (!isBounded(propagation)) {
            break
        }
        propagations.push(propagation);
        rightPivot = leftPropagation
        leftPropagation = propagation
    } while (true)

    let rightPropagation = right
    let leftPivot = left
    do {
        const difference = getDifference(leftPivot, rightPropagation)
        const propagation = getRightAntipode(rightPropagation, difference)
        if (!isBounded(propagation)) {
            break
        }
        propagations.push(propagation)
        leftPivot = rightPropagation
        rightPropagation = propagation
    } while (true)

    return propagations
}

const run = (field: string[][], pattern: Pattern) => {
    const antennas: Transmissions = {}
    for (let y = 0; y < field.length; y++) {
        for (let x = 0; x < field[0].length; x++) {
            const cell = field[y][x]
            if (cell === '.') continue
            antennas[cell] = antennas[cell] || []
            antennas[cell].push([y, x])
        }
    }

    const signals = copyMatrix(field)
    for (const locations of Object.values(antennas)) {
        for (let i = 0; i < locations.length; i++) {
            for (let j = i + 1; j < locations.length; j++) {
                const antipodes = pattern(field, locations[i], locations[j])
                for (const [y, x] of antipodes) {
                    signals[y][x] = '#'
                }
            }
        }
    }
    return signals
}

printMatrix(input)

const antipodes = run(input, getAntipodes)
console.log('Antipodes count:', countSignals(antipodes))

const propagations = run(input, getPropagations)
console.log('Propagations count:', countSignals(propagations))
