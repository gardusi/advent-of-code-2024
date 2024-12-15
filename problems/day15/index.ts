import { readFileSync } from "fs"

type Direction = '^' | '>' | 'v' | '<'
type Location = { i: number, j: number }
type Robot = {
    location: Location
}

const [rawBoard, rawMoves] = readFileSync('./problems/day15/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n\n')

const board = rawBoard.split('\n').map((row) => row.split(''))
const moves = rawMoves.split('')

// ------- PRINTING -------

const printBoard = (board: string[][]) => {
    console.log(board.map(row => row.map(cell => cell).join('')).join('\n'))
}

const printCoords = (board: string[][]) => {
    let sum = 0
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (readBoard(board, { i, j }) === 'O') {
                sum += 100 * i + j
            }
        }
    }
    console.log('Sum of coords:', sum)
}

const getCommand = (key: string): string | undefined => {
    if (key === '\u001B\u005B\u0041') return '^'
    if (key === '\u001B\u005B\u0043') return '>'
    if (key === '\u001B\u005B\u0042') return 'v'
    if (key === '\u001B\u005B\u0044') return '<'
    if (key === '\u000D') return '?'
    if (key === 'c') return 'c'
    if (key === 'n') return 'n'
    if (key === 'q' || key === '\u0003') {
        process.exit(0)
    }
    console.log('arrow keys: move (freely) | enter: move (instruction) | q, ctrl+c: exit')
}

// ----- LOCATE/MOVE ------

const readBoard = <T>(board: T[][], { i, j }: Location) => board[i][j]

const getRobot = (board: string[][]): Robot => {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (readBoard(board, { i, j }) === '@') {
                return { location: { i, j }}
            }
        }
    }
    throw new Error('Could not find a robot, you probably copied the input incorrectly.')
}

const moveLeft = (board: string[][], robot: Robot) => {
    const start = robot.location.j
    const i = robot.location.i

    let pushCount = 1
    for (let j = start - 1; j >= 0; j--) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return
        }
        if (block === '.') {
            break
        }
        pushCount++
    }

    const [number] = board[i].splice(start - pushCount, 1)
    board[i].splice(start, 0, number)
    robot.location = { i, j: start - 1 }
}

const moveRight = (board: string[][], robot: Robot) => {
    const start = robot.location.j
    const i = robot.location.i

    let pushCount = 1
    for (let j = start + 1; j < board[i].length; j++) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return
        }
        if (block === '.') {
            break
        }
        pushCount++
    }

    const [number] = board[i].splice(start + pushCount, 1)
    board[i].splice(start, 0, number)
    robot.location = { i, j: start + 1 }
}

const moveUp = (board: string[][], robot: Robot) => {
    const start = robot.location.i
    const j = robot.location.j

    let pushCount = 1
    for (let i = start - 1; i >= 0; i--) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return
        }
        if (block === '.') {
            break
        }
        pushCount++
    }
    for (let p = pushCount; p > 0; p--) {
        const a = start - p
        const b = start - p + 1
        ;[board[a][j], board[b][j]] = [board[b][j], board[a][j]]
    }
    robot.location = { i: start - 1, j }
}

const moveDown = (board: string[][], robot: Robot) => {
    const start = robot.location.i
    const j = robot.location.j

    let pushCount = 1
    for (let i = start + 1; i < board.length; i++) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return
        }
        if (block === '.') {
            break
        }
        pushCount++
    }
    for (let p = pushCount; p > 0; p--) {
        const a = start + p
        const b = start + p - 1
        ;[board[a][j], board[b][j]] = [board[b][j], board[a][j]]
    }
    robot.location = { i: start + 1, j }
}

const makeMovement = (board: string[][], robot: Robot, direction: Direction) => {
    if (direction === '<') moveLeft(board, robot)
    if (direction === '>') moveRight(board, robot)
    if (direction === '^') moveUp(board, robot)
    if (direction === 'v') moveDown(board, robot)
}

const run = (board: string[][], moves: string[]) => {
    const robot = getRobot(board)

    let index = -1
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (key: string) => {
        console.clear()
        let command = getCommand(key)
        if (command === 'c') {
            printCoords(board)
        } else if (command === 'n') {
            for (let i = 0; i < 100 && index < moves.length - 1; i++) {
                index++
                makeMovement(board, robot, moves[index] as Direction)
            }
        } else if (command === '?' && index < moves.length - 1) {
            index++
            command = moves[index]
            makeMovement(board, robot, command as Direction)
        } else if (command) {
            makeMovement(board, robot, command as Direction)
        }
        printBoard(board)
        console.log('Movement', index + 1, 'out of', moves.length)
        if (command) {
            console.log('Command:', command)
        }
    })
    console.clear()
    printBoard(board)
    console.log('Movement ', index + 1, 'out of', moves.length)
}

run(board, moves)
