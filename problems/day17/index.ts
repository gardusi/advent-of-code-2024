import { readFileSync } from "fs"

// Registers and pointers

type Register = {
    A: bigint,
    B: bigint,
    C: bigint,
    out: number[]
}

type Halt = {
    enabled: boolean
    triggered: boolean
    program: number[]
}

const register: Register = {
    A: 0n,
    B: 0n,
    C: 0n,
    out: [],
}

let program: number[] = []
let pointer = 0

// Halting

const halt: Halt = {
    enabled: false,
    triggered: false,
    program: []
}

const haltRequired = () => {
    if (!halt.enabled) {
        return false
    }
    if (halt.program.length >= register.out.length) {
        return false
    }
    return true
}

// Operands

const literal = () => {
    const operand = program[pointer]
    pointer++
    return BigInt(operand)
}

const combo = () => {
    const operand = program[pointer]
    pointer++

    if (operand >= 7) {
        throw new Error('Invalid combo operand')
    }

    return {
        0: 0n,
        1: 1n,
        2: 2n,
        3: 3n,
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
    register.B = value % 8n
}

const jnz = () => {
    const value = register.A
    if (value === 0n) return

    const jump = literal()
    pointer = Number(jump)
}

const bxc = () => {
    const left = register.B
    const right = register.C
    literal() // Legacy read
    register.B = left ^ right
}

const out = () => {
    const value = combo()
    register.out.push(Number(value % 8n))
    if (haltRequired()) halt.triggered = true
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

const readNumbers = (input: string) => input.match(/\d+/ig)!.map(Number)

const readProgramFile = () => {
    const [rawRegisterBlock, rawProgram] = readFileSync('./problems/day17/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n\n')

    const [[A], [B], [C]] = rawRegisterBlock.split('\n').map(readNumbers)
    register.A = BigInt(A)
    register.B = BigInt(B)
    register.C = BigInt(C)

    program = readNumbers(rawProgram)
    return program
}

const runProgram = () => {
    while (pointer < program.length && !halt.triggered) {
        instruction()()
    }
    
    return register.out
}

const compareInstruction = (initialRegisterA: bigint, copyPointer: number, reference: number[]): bigint => {
    if (copyPointer < 0) return initialRegisterA

    const bumpedRegisterA = initialRegisterA << 3n
    for (let increment = 0n; increment < 8n; increment++) {
        register.A = bumpedRegisterA + increment
        register.B = 0n
        register.C = 0n
        register.out = []
        pointer = 0
        halt.triggered = false

        const result = runProgram()
        if (result[0] === reference[copyPointer]) {
            const updatedRegisterA = compareInstruction(bumpedRegisterA + increment, copyPointer - 1, reference)
            if (updatedRegisterA !== -1n) return updatedRegisterA
        }
    }

    return -1n
}

const lookForSelfCopy = (reference: number[]) => {
    halt.enabled = true
    halt.program = reference
    
    return compareInstruction(0n, reference.length - 1, reference)
}

const rawProgram = readProgramFile()

console.log('Original program output:', runProgram().join(','))
console.log('Self copy program register A', lookForSelfCopy(rawProgram))