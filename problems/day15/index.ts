import { readFileSync } from "fs"

type Direction = '^' | '>' | 'v' | '<'
type Location = { i: number, j: number }

const [rawBoard, rawMoves] = readFileSync('./problems/day15/input.txt', 'utf8')
    .replaceAll('\r', '')
    .split('\n\n')

const board = rawBoard.split('\n')
    .map((row) => row
        // .replaceAll('#', '##')
        // .replaceAll('O', '[]')
        // .replaceAll('.', '..')
        // .replaceAll('@', '@.')
        .split('')
    )
const moves = rawMoves.split('')

// ------- PRINTING -------

const printBoard = (board: string[][]) => {
    console.log(board.map(row => row.map(cell => cell).join('')).join('\n'))
}

const printCoords = (board: string[][]) => {
    let sum = 0
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (['O', '['].includes(readBoard(board, { i, j }))) {
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

const getRobot = (board: string[][]): Location => {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (readBoard(board, { i, j }) === '@') {
                return { i, j }
            }
        }
    }
    throw new Error('Could not find a robot, you probably copied the input incorrectly.')
}

const canMoveUp = (board: string[][], subrobot: Location): boolean => {
    const { i, j } = subrobot
    const block = readBoard(board, { i: i - 1, j })
    if (block === '#') {
        return false
    }
    if (block === '.') {
        return true
    }
    if (block === 'O') {
        return canMoveUp(board, { i: i - 1, j })
    }
    const nJ = block === '[' ? j + 1 : j - 1
    return canMoveUp(board, { i: i - 1, j }) && canMoveUp(board, { i: i - 1, j: nJ })
}

const canMoveDown = (board: string[][], subrobot: Location): boolean => {
    const { i, j } = subrobot
    const block = readBoard(board, { i: i + 1, j })
    if (block === '#') {
        return false
    }
    if (block === '.') {
        return true
    }
    if (block === 'O') {
        return canMoveDown(board, { i: i + 1, j })
    }
    const nJ = block === '[' ? j + 1 : j - 1
    return canMoveDown(board, { i: i + 1, j }) && canMoveDown(board, { i: i + 1, j: nJ })
}

const swapAbove = ({ i, j }: Location) => {
    [board[i + 1][j], board[i][j]] = [board[i][j], board[i + 1][j]]
}

const swapBelow = ({ i, j }: Location) => {
    [board[i - 1][j], board[i][j]] = [board[i][j], board[i - 1][j]]
}

const doMoveUp = (board: string[][], subrobot: Location) => {
    const { i, j } = subrobot
    const block = readBoard(board, { i: i - 1, j })
    if (block === '.') {
        swapAbove({ i: i - 1, j })
        return
    }
    doMoveUp(board, { i: i - 1, j })
    if (block !== 'O') {
        const nJ = block === '[' ? j + 1 : j - 1
        doMoveUp(board, { i: i - 1, j: nJ })
    }
    swapAbove({ i: i - 1, j })
}


const doMoveDown = (board: string[][], subrobot: Location) => {
    const { i, j } = subrobot
    const block = readBoard(board, { i: i + 1, j })
    if (block === '.') {
        swapBelow({ i: i + 1, j })
        return
    }
    doMoveDown(board, { i: i + 1, j })
    if (block !== 'O') {
        const nJ = block === '[' ? j + 1 : j - 1
        doMoveDown(board, { i: i + 1, j: nJ })
    }
    swapBelow({ i: i + 1, j })
}

const moveLeft = (board: string[][], robot: Location) => {
    const start = robot.j
    const i = robot.i

    let pushCount = 1
    for (let j = start - 1; j >= 0; j--) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return false
        }
        if (block === '.') {
            break
        }
        pushCount++
    }

    const [number] = board[i].splice(start - pushCount, 1)
    board[i].splice(start, 0, number)
    robot.j = start - 1
    return true
}

const moveRight = (board: string[][], robot: Location) => {
    const start = robot.j
    const i = robot.i

    let pushCount = 1
    for (let j = start + 1; j < board[i].length; j++) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return false
        }
        if (block === '.') {
            break
        }
        pushCount++
    }

    const [number] = board[i].splice(start + pushCount, 1)
    board[i].splice(start, 0, number)
    robot.j = start + 1
    return true
}

const moveUp = (board: string[][], robot: Location) => {
    const start = robot.i
    const j = robot.j

    for (let i = start - 1; i >= 0; i--) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return false
        }
        if (block === '.') {
            break
        }
        if (!canMoveUp(board, robot)) {
            return false
        }
    }

    doMoveUp(board, robot)

    robot.i = start - 1
    return true
}

const moveDown = (board: string[][], robot: Location) => {
    const start = robot.i
    const j = robot.j

    let pushCount = 1
    for (let i = start + 1; i < board.length; i++) {
        const block = readBoard(board, { i, j })
        if (block === '#') {
            return false
        }
        if (block === '.') {
            break
        }
        if (!canMoveDown(board, robot)) {
            return false
        }
        pushCount++
    }

    doMoveDown(board, robot)

    robot.i = start + 1
    return true
}

const makeMovement = (board: string[][], robot: Location, direction: Direction) => {
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
