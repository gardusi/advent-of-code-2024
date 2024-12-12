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

const superRun = (uniqueStones: Stone[], limit: number) => {
    const originalLength = uniqueStones.length
    for (let i = 0; i < originalLength; i++) {
        const moreStones = run([uniqueStones[i].label], limit, false)
        const partialUniqueStones = getUniqueStones(moreStones, uniqueStones[i].count)
        
        putUniqueStones(uniqueStones, partialUniqueStones, uniqueStones[i].count)
    }
}

const getUniqueStones = (stones: string[], count: bigint) => {
    const uniqueStones: Stone[] = []
    for (const stone of stones) {
        const existingStone = uniqueStones.find(s => s.label === stone)
        if (existingStone) {
            existingStone.count += count
        } else {
            uniqueStones.push({ label: stone, count })
        }
    }
    return uniqueStones
}

const putUniqueStones = (uniqueStones: Stone[], stones: Stone[], count: bigint) => {
    for (const stone of stones) {
        const i = uniqueStones.findIndex(s => s.label === stone.label)
        if (uniqueStones[i]) {
            uniqueStones[i].count += stone.count
        } else {
            uniqueStones.push(stone)
        }
    }
}

console.log(input.join(' '))

const CYCLE_1 = 25
const CYCLE_2 = 25
const CYCLE_3 = 25

const stones = run(input, CYCLE_1, true)

const uniqueStones: Stone[] = getUniqueStones(stones, 1n)

superRun(uniqueStones, CYCLE_2)
let superLength = uniqueStones.reduce((acc, stone) => acc + stone.count, 0n)

console.log('After', CYCLE_1 + CYCLE_2, 'blinks we have', superLength, 'stones')

superRun(uniqueStones, CYCLE_3)
superLength = uniqueStones.reduce((acc, stone) => acc + stone.count, 0n)

console.log('After', CYCLE_1 + CYCLE_2 + CYCLE_3, 'blinks we have', superLength, 'stones')
