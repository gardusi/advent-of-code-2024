import { readFileSync } from "fs"

type Equation = {
    result: number
    numbers: number[]
}

type Operation = (a: number, b: number) => number

type SumNode = {
    sum?: number
    children?: SumNode[]
}

const equations: Equation[] = readFileSync('./problems/day7/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')
    .map(line => {
        const [result, ...numbers] = line.split(' ')
        return {
            result: Number(result.slice(0, -1)),
            numbers: numbers.map(Number)
        }
    })

const part1Operations: Operation[] = [
    (a, b) => a + b, // sum
    (a, b) => a * b, // product
]

const part2Operations: Operation[] = [
    (a, b) => a + b, // sum
    (a, b) => a * b, // product
    (a, b) => Number(`${a}${b}`), // concatenation
]

const splitSum = (sumNode: SumNode, numbers: number[], index: number, sums: number[], operations: Operation[]) => {
    const sum = sumNode.sum || 0
    delete sumNode.sum

    const children = operations.map(operation => ({ sum: operation(sum, numbers[index]) }))
    sumNode.children = children

    if (index < numbers.length - 1) {
        for (const child of sumNode.children) {
            splitSum(child, numbers, index + 1, sums, operations)
        }
        return
    }
    sums.push(...children.map(child => child.sum))
}

const runEquations = (operations: Operation[]) => {
    let totalSum: number = 0
    for (const equation of equations) {
        const sumTree: SumNode = {
            sum: equation.numbers[0]
        }

        const sums: number[] = []
        splitSum(sumTree, equation.numbers, 1, sums, operations)

        if (sums.includes(equation.result)) {
            totalSum += equation.result
        }
    }
    return totalSum
}

console.log('Part 1 Sum', runEquations(part1Operations))
console.log('Part 2 Sum', runEquations(part2Operations))
