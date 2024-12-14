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

const machines = input.map((machine) => ({
    buttonA: machine[0].match(/\d+/ig)!.map(BigInt),
    buttonB: machine[1].match(/\d+/ig)!.map(BigInt),
    prize: machine[2].match(/\d+/ig)!.map(BigInt),
}))

const computePossibilities = ({ buttonA, buttonB, prize }: Machine) => {
    const possibilities: [bigint, bigint][] = []
    for (let a = 0n; a * buttonA[0] <= prize[0] && a * buttonA[1] <= prize[1]; a++) {
        for (let b = 0n; b * buttonB[0] <= prize[0] && b * buttonB[1] <= prize[1]; b++) {
            const x = a * buttonA[0] + b * buttonB[0]
            const y = a * buttonA[1] + b * buttonB[1]
            
            if (x === prize[0] && y === prize[1]) {
                possibilities.push([a, b])
            }
            if (x > prize[0] || y > prize[1]) {
                break
            }
        }
    }
    return possibilities
}

let totalSpent = 0n
for (const machine of machines) {
    const possibilities = computePossibilities(machine)

    const cheapestPossibility = possibilities.reduce((c, [a, b]) => c === 0n || (a * 3n + b) < c ? a * 3n + b : c, 0n)
    totalSpent += cheapestPossibility
}

console.log('Minimum total spent:', totalSpent)