import { readFileSync } from 'fs'

const input = readFileSync('./problems/day11/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split(' ')

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

        debug ? console.log(stones.join(' ')) : console.log(`After ${blinks} blinks we have ${stones.length} stones`)
        if (blinks === 25 && stones.length !== 202019) {
            throw new Error('Expected 202019 stones after 25 blinks, got ' + stones.length)
        }
    }
}

console.log(input.join(' '))
run(input, 25, false)
