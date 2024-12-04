import { readFileSync } from 'fs';

const content = readFileSync('./problems/day3/input.txt', 'utf8')

const operations = content.match(/mul\(\d{1,3},\d{1,3}\)|do\(\)|don't\(\)/g)

let disabledOperations = false
const results = operations?.map((operation) => {
    if (operation === 'do()') {
        disabledOperations = false
        return
    }
    if (operation === "don't()") {
        disabledOperations = true
        return
    }
    const operands = operation.slice('mul('.length, -1).split(',').map(Number)
    return {
        result: operands[0] * operands[1],
        disabled: disabledOperations,
    }
})

const sumResults = (a: number, b?: { result?: number }) => a + (b?.result || 0)

const allUncorruptedResults = results?.filter(Boolean).reduce(sumResults, 0)
console.log('Sum of uncorrupted operations:', allUncorruptedResults)

const enabledUncorruptedResults = results?.filter((result) => !result?.disabled).reduce(sumResults, 0)
console.log('Sum of enabled uncorrupted operations:', enabledUncorruptedResults)
