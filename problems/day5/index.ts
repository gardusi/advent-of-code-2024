import { readFileSync } from "fs";

const content = readFileSync('./problems/day5/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n')

const rules: [number, number][] = []
const orders: number[][] = []

let readRules = true
for (const line of content) {
    if (line === '') {
        readRules = false
        continue
    }
    if (readRules) {
        const [prev, next] = line.split('|').map(Number)
        rules.push([prev, next])
    } else {
        orders.push(line.split(',').map(Number))
    }
}

type CheckOrderFail<T> = (order: number[], i: number, j: number) => T

const checkOrder = <T>(order: number[], success: T, fail: CheckOrderFail<T>): T => {
    for (let i = 0; i < order.length; i++) {
        const relatedRules = rules.filter(([prev, _]) => prev === order[i])
        for (const [_, next] of relatedRules) {
            for (let j = 0; j < i; j++) {
                if (order[j] === next) {
                    return fail(order, i, j)
                }
            }
        }
    }
    return success
}

const isOrderValid = (order: number[]) => checkOrder(order, true, () => false)

const fixOrder = (order: number[]): number[] => checkOrder(order, order, (order, i, j) => {
    [order[i], order[j]] = [order[j], order[i]]
    return fixOrder(order)
})

let middlePageSum = 0
const incorrectOrders = []
for (const order of orders) {
    if (isOrderValid(order)) {
        const middlePage = order[Math.floor(order.length / 2)]
        middlePageSum += middlePage
    } else {
        incorrectOrders.push(order)
    }
}

console.log('Correct middle page sum:', middlePageSum)

middlePageSum = 0
for (const order of incorrectOrders) {
    const fixedOrder = fixOrder(order)
    const middlePage = order[Math.floor(fixedOrder.length / 2)]
    middlePageSum += middlePage
}

console.log('Incorrect middle page sum:', middlePageSum)
