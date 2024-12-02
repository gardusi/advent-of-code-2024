import { readFileSync } from 'fs';

const content = readFileSync('./problems/day2/input.txt', 'utf8')

const reports = content
    .split('\n')
    .map((report) => report.trim().split(/\s+/).map(Number))

const isSafe = (report: number[]) => {
    let [pivot, ...elements] = report
    let dir = pivot > report[1] ? 'descending' : 'ascending'

    for (const element of elements) {
        if (dir === 'descending' && (pivot <= element || pivot - element > 3)) {
            return false
        }
        if (dir === 'ascending' && (pivot >= element || pivot - element < -3)) {
            return false
        }
        pivot = element
    }
    return true
}

let fullySafeCount = 0
let anySafeCount = 0

for (const report of reports) {
    // Natural safe
    if (report.length <= 1) {
        fullySafeCount++
        anySafeCount++
        continue
    }
    if (isSafe(report)) {
        fullySafeCount++
        anySafeCount++
        continue
    }
    for (let i = 0; i < report.length; i++) {
        if (isSafe([...report.slice(0, i), ...report.slice(i + 1)])) {
            anySafeCount++
            break
        }
    }
}

console.log('Report count:', reports.length)
console.log('Fully safe count:', fullySafeCount)
console.log('Any safe count:', anySafeCount)
