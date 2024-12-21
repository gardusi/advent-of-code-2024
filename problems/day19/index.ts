import { readFileSync } from "fs";

const [availablePatterns, desiredDesigns] = readFileSync('./problems/day19/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n\n')
    .map((k) => k.split(/, |\n/ig))

const countPossibleDesigns = (availablePatterns: string[], desiredDesigns: string[]) => {
    const regex = new RegExp(`(${availablePatterns.join('|')})*$`)
    
    let count = 0
    for (const desiredDesign of desiredDesigns) {
        const match = desiredDesign.match(regex)
        console.log('Analyzed', desiredDesign, 'and found', match)
        if (match && match[0].length === desiredDesign.length) {
            count++
        }
    }
    console.log('Possible designs:', count)
}

countPossibleDesigns(availablePatterns, desiredDesigns)
