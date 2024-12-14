import { readFileSync } from "fs";

type Machine = {
    buttonA: bigint[]
    buttonB: bigint[]
    prize: bigint[]
}

const input = readFileSync('./problems/day13/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n\n')
    .map((machine) => machine.split('\n'))

const getMachines = (input: string[][], part: 1 | 2) =>
    input.map((machine) => ({
        buttonA: machine[0].match(/\d+/ig)!.map(BigInt),
        buttonB: machine[1].match(/\d+/ig)!.map(BigInt),
        prize: machine[2].match(/\d+/ig)!.map((v) => BigInt(v) + (part === 1 ? 0n : 10000000000000n)),
    }))

const computePossibility = ({ buttonA, buttonB, prize }: Machine) => {
    //  [ xa   xb ][ a ] = [ x ]
    //  [ ya   yb ][ b ] = [ y ]
    //
    //  [ a ] =  1 [ yb  -xb ][ x ]
    //  [ b ] =  D [ -ya  xa ][ y ]
    //
    //  [ a ] = 1 [ x*yb - y*xb ]
    //  [ b ] = D [ y*xa - x*ya ]

    const [xa, ya] = buttonA
    const [xb, yb] = buttonB
    const [x, y] = prize

    const det = Number(xa*yb - xb*ya);
    const [a, b] = [x*yb - y*xb, y*xa - x*ya].map((v) => Number(v) / det)
    if (a % 1 === 0 && b % 1 === 0) {
        return [a, b]
    }
    return [0, 0]
}

let totalSpent = 0
for (const machine of getMachines(input, 2)) {
    const [a, b] = computePossibility(machine)
    if (a && b) {
        totalSpent += a * 3 + b
    }
}

console.log('Minimum total spent:', totalSpent)