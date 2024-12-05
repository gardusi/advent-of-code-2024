import { readFileSync } from 'fs';

type Coords = [number, number]

class Sequence {
    private constructor(
        public letters: string[],
        public direction: number,
        public position: number = 0,
    ) {}

    public static template(letters: string[]) {
        return new Sequence(letters, 0, 0)
    }

    public withDirection(direction: number) {
        return new Sequence(this.letters, direction, 1)
    }
}

const content = readFileSync('./problems/day4/input.txt', 'utf8')
    .split('\n')
    .map((line) => line.split(''))

const mX = content.length - 1
const mY = content[0].length - 1

const nextCoords = (coords: Coords, direction: number) => {
    const mapper: Record<number, (coords: Coords) => Coords | null> = {
        0: ([x, y]) => y < mY           ? [x    , y + 1] : null,
        1: ([x, y]) => x < mX && y < mY ? [x + 1, y + 1] : null,
        2: ([x, y]) => x < mX           ? [x + 1, y    ] : null,
        3: ([x, y]) => x < mX && y > 0  ? [x + 1, y - 1] : null,
        4: ([x, y]) => y > 0            ? [x    , y - 1] : null,
        5: ([x, y]) => x > 0  && y > 0  ? [x - 1, y - 1] : null,
        6: ([x, y]) => x > 0            ? [x - 1, y    ] : null,
        7: ([x, y]) => x > 0  && y < mY ? [x - 1, y + 1] : null,
    }
    return mapper[direction](coords)
}

const readXY = ([x, y]: Coords) => content[x][y]

const doesSequenceMatch = (seq: Sequence, coords: Coords) => {
    const newCoords = nextCoords(coords, seq.direction)
    if (!newCoords) {
        return false
    }
    if (readXY(newCoords) === seq.letters[seq.position]) {
        if (seq.position === seq.letters.length - 1) {
            return true
        }
        seq.position++
        return doesSequenceMatch(seq, newCoords)
    }
    return false
}

const xmasTemplate = Sequence.template(['X', 'M', 'A', 'S'])

let xmasCount = 0
for (let x = 0; x < content.length; x++) {
    for (let y = 0; y < content[x].length; y++) {
        if (readXY([x, y]) === xmasTemplate.letters[0]) {
            for (let direction = 0; direction < 8; direction++) {
                if (doesSequenceMatch(xmasTemplate.withDirection(direction), [x, y])) {
                    xmasCount++
                }
            }
        }
    }
}

console.log('XMAS Count:', xmasCount)

// Match AM and AS on opposite directions to form part of a cross
const crossMas = [Sequence.template(['A', 'M']), Sequence.template(['A', 'S'])]

const crossMasMatch = (dir1: number, dir2: number) => (coords: Coords) =>
    doesSequenceMatch(crossMas[0].withDirection(dir1), coords) && doesSequenceMatch(crossMas[1].withDirection(dir2), coords)

// Both parts of the cross with their respective opposite directions
const matchers = [
    [crossMasMatch(1, 5), crossMasMatch(5, 1)],
    [crossMasMatch(3, 7), crossMasMatch(7, 3)],
]

let crossMasCount = 0
for (let x = 0; x < content.length; x++) {
    for (let y = 0; y < content[x].length; y++) {
        if (readXY([x, y]) === crossMas[0].letters[0]) {
            if (matchers.every((matcher) => matcher.some((f) => f([x, y])))) {
                crossMasCount++
            }
        }
    }
}

console.log('X-MAS (Cross MAS) Count:', crossMasCount)
