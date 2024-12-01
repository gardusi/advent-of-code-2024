import { readFileSync } from 'fs';

const content = readFileSync('./problems/day1/input.txt', 'utf8')

const locations = content.split("\n")
    .map((pair) => pair.split(/\s+/).map(Number))

const listA: number[] = []
const listB: number[] = []

locations.forEach(([a, b]) => {
    listA.push(a)
    listB.push(b)
})

listA.sort((i, j) => i - j)
listB.sort((i, j) => i - j)

let distance = 0
for (let i = 0; i < listA.length; i++) {
    console.log(listA[i], listB[i])
    distance += Math.abs(listA[i] - listB[i])
}

console.log('Distance', distance)

let similarity = 0
for (let i = 0; i < listA.length; i++) {
    let count = 0
    for (let j = 0; j < listB.length; j++) {
        count += listA[i] === listB[j] ? 1 : 0
    }
    similarity += listA[i] * count
}

console.log('Similarity', similarity)
