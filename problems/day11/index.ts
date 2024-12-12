import { readFileSync } from 'fs'

const input = readFileSync('./problems/day11/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split(' ')

type Stone = {
    label: string
    count: bigint
}

const run = (stones: string[], limit: number, debug: boolean) => {
    let blinks = 0
    while (blinks < limit) {
        let originalLength = stones.length
        for (let i = 0; i < originalLength; i++) {
            const stone = stones[i]
            if (stone === '0') {
                stones[i] = '1'
                continue
            }
            if (stone.length % 2 === 1) {
                stones[i] = String(BigInt(stone) * 2024n)
                continue
            }
            let mid = stone.length / 2
            const leftStone = String(BigInt(stone.slice(0, mid)))
            const rightStone = String(BigInt(stone.slice(mid)))
            
            stones[i] = leftStone
            stones.push(rightStone)
        }
        blinks++

        if (debug) console.log('After', blinks, 'blinks we have', stones.length, 'stones')
    }
    return stones
}

const getUniqueStones = (stones: string[]) => {
    const uniqueStones: Stone[] = []
    for (const stone of stones) {
        const existingStone = uniqueStones.find(s => s.label === stone)
        if (existingStone) {
            existingStone.count++
        } else {
            uniqueStones.push({ label: stone, count: 1n })
        }
    }
    return uniqueStones
}

const putUniqueStones = (uniqueStones: Stone[], stones: Stone[], count?: bigint) => {
    for (const stone of stones) {
        const existingStone = uniqueStones.find(s => s.label === stone.label)
        if (existingStone) {
            existingStone.count += stone.count * (count || 1n)
        } else {
            uniqueStones.push(stone)
        }
    }
}

console.log(input.join(' '))

const CYCLE_1 = 2
const CYCLE_2 = 2
const CYCLE_3 = 2

const stones = run(input, CYCLE_1, true)

const uniqueStones: Stone[] = getUniqueStones(stones)

const originalLength = uniqueStones.length
for (let i = 0; i < originalLength; i++) {
    const moreStones = run([uniqueStones[i].label], CYCLE_2, false)
    const moreUniqueStones = getUniqueStones(moreStones)

    putUniqueStones(uniqueStones, moreUniqueStones)
}

let superLength = uniqueStones.reduce((acc, stone) => acc + stone.count, 0n)

console.log('After', CYCLE_1 + CYCLE_2, 'blinks we have', superLength, 'stones')

const nextOriginalLength = uniqueStones.length
for (let i = 0; i < nextOriginalLength; i++) {
    const stone = uniqueStones[i]
    if (stone.count === 0n) continue

    const count = uniqueStones[i].count
    uniqueStones[i].count = 0n

    const moreStones = run([stone.label], CYCLE_3, false)
    const moreUniqueStones = getUniqueStones(moreStones)

    putUniqueStones(uniqueStones, moreUniqueStones, count)
    console.log(uniqueStones)
}

superLength = uniqueStones.reduce((acc, stone) => acc + stone.count, 0n)

console.log('After', CYCLE_1 + CYCLE_2 + CYCLE_3, 'blinks we have', superLength, 'stones')
