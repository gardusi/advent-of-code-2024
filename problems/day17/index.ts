import { readFileSync } from "fs"

// Registers and pointers

type Register = {
    A: number,
    B: number,
    C: number,
    out: number[]
}

const register: Register = {
    A: 0,
    B: 0,
    C: 0,
    out: [],
}

let program: number[]
let pointer = 0

// Operands

const literal = () => {
    const operand = program[pointer]
    pointer++
    return operand
}

const combo = () => {
    const operand = program[pointer]
    pointer++

    if (operand >= 7) {
        throw new Error('Invalid combo operand')
    }

    return {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: register.A,
        5: register.B,
        6: register.C,
    }[operand]!
}

// Instructions

const instruction = () => {
    const opcode = program[pointer]
    pointer++

    if (opcode !== 3 && pointer === program.length) {
        return () => {}
    }

    return {
        0: adv,
        1: bxl,
        2: bst,
        3: jnz,
        4: bxc,
        5: out,
        6: bdv,
        7: cdv,
    }[opcode]!
}

const adv = () => {
    const numerator = register.A
    const denominator = combo()
    register.A = numerator >> denominator
}

const bxl = () => {
    const left = register.B
    const right = literal()
    register.B = left ^ right
}

const bst = () => {
    const value = combo()
    register.B = value % 8
}

const jnz = () => {
    const value = register.A
    if (value === 0) return

    const jump = literal()
    pointer = jump
}

const bxc = () => {
    const left = register.B
    const right = register.C
    literal() // Legacy read
    register.B = left ^ right
}

const out = () => {
    const value = combo()
    register.out.push(value % 8)
}

const bdv = () => {
    const numerator = register.A
    const denominator = combo()
    register.B = numerator >> denominator
}

const cdv = () => {
    const numerator = register.A
    const denominator = combo()
    register.C = numerator >> denominator
}

// Read program

const [rawRegisterBlock, rawProgram] = readFileSync('./problems/day17/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n\n')

const rawRegisters = rawRegisterBlock.split('\n')
register.A = rawRegisters[0].match(/\d+/ig)!.map(Number)[0]
register.B = rawRegisters[1].match(/\d+/ig)!.map(Number)[0]
register.C = rawRegisters[2].match(/\d+/ig)!.map(Number)[0]

program = rawProgram.match(/\d+/ig)!.map(Number)

while (pointer < program.length) {
    instruction()()
}

console.log(register.out.join(','))