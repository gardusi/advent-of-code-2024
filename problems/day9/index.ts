import { readFileSync } from "fs"

type MemoryNode = {
    next?: MemoryNode
    index: number
}

type MemorySector = {
    next?: MemorySector
    index: number
    size: number
}

type DiskMap<T> = {
    free: { root: T, leaf: T }
    file: { root: T, leaf: T }
}

type DiskInfo = {
    disk: string[]
    nodes: DiskMap<MemoryNode>
    sectors: DiskMap<MemorySector>
}

type DefragResult = {
    disk: string[]
    checksum: number
}

const diskMap = readFileSync('./problems/day9/input.txt', 'utf8')
    .replaceAll('\r', '')
    .match(/(..)|./ig)!
    .map(line => line.split('').map(Number))

const getNodes = (diskMap: number[][], disk: string[], { file, free }: DiskMap<MemoryNode>) => {
    for (let i = 0; i < diskMap.length; i++) {
        const [fileSize, freeSpace] = diskMap[i]
        const index = i.toString()
    
        for (let j = 0; j < fileSize; j++) {
            file.root = { index: disk.length, next: file.root }
            disk.push(index)
        }
    
        for (let j = 0; j < freeSpace; j++) {
            free.leaf.next = { index: disk.length }
            free.leaf = free.leaf.next
            disk.push('.')
        }
    }
    return { file, free }
}

const getSectors = (diskMap: number[][], disk: string[], { file, free }: DiskMap<MemorySector>) => {
    let position = 0
    for (let i = 0; i < diskMap.length; i++) {
        const [fileSize, freeSpace] = diskMap[i]

        file.root = { index: position, next: file.root, size: fileSize }
        position += fileSize

        if (freeSpace) {
            free.leaf.next = { index: position, size: freeSpace }
            free.leaf = free.leaf.next
            position += freeSpace
        }
    }
    return { file, free }
}

const readDisk = (diskMap: number[][]): DiskInfo => {
    const freeChunkNode: MemoryNode = { index: -1 }
    const fileChunkNode: MemoryNode = { index: -1 }
    const freeSectorNode: MemorySector = { index: -1, size: 0 }
    const fileSectorNode: MemorySector = { index: -1, size: 0 }

    const diskInfo: DiskInfo = {
        disk: [],
        nodes: {
            free: { root: freeChunkNode, leaf: freeChunkNode },
            file: { root: fileChunkNode, leaf: fileChunkNode },
        },
        sectors: {
            free: { root: freeSectorNode, leaf: freeSectorNode },
            file: { root: fileSectorNode, leaf: fileSectorNode },
        }
    }
    
    diskInfo.nodes = getNodes(diskMap, diskInfo.disk, diskInfo.nodes)
    diskInfo.sectors = getSectors(diskMap, diskInfo.disk, diskInfo.sectors)
    
    return diskInfo
}

const defragDiskNodes = (disk: string[], nodes: DiskMap<MemoryNode>) => {
    let freeNode = nodes.free.root.next!
    let fileNode = nodes.file.root

    while (fileNode.index !== -1 && fileNode.index > freeNode.index) {
        [disk[freeNode.index], disk[fileNode.index]] = [disk[fileNode.index], disk[freeNode.index]]

        nodes.free.leaf.next = { index: fileNode.index }
        nodes.free.leaf = nodes.free.leaf.next

        fileNode = fileNode.next!
        freeNode = freeNode.next!
    }
}

const swapSectors = (disk: string[], freeIndex: number, fileIndex: number, fileSize: number) => {
    for (let i = 0; i < fileSize; i++) {
        [disk[freeIndex + i], disk[fileIndex + i]] = [disk[fileIndex + i], disk[freeIndex + i]]
    }
}

const redoSectors = (disk: string[]) => {
    const freeSectorNode: MemorySector = { index: -1, size: 0 }
    const fileSectorNode: MemorySector = { index: -1, size: 0 }

    const sectors: DiskMap<MemorySector> = {
        free: { root: freeSectorNode, leaf: freeSectorNode },
        file: { root: fileSectorNode, leaf: fileSectorNode },
    }
    let readingFile = true
    for (let i = 0; i < disk.length; i++) {
        if (disk[i] === '.') {
            if (!readingFile) {
                sectors.free.leaf.size++
            } else {
                readingFile = false
                sectors.free.leaf.next = { index: i, size: 1 }
                sectors.free.leaf = sectors.free.leaf.next
            }
        } else {
            if (readingFile) {
                sectors.file.root.size++
            } else {
                readingFile = true
                sectors.file.root = { index: i, size: 1, next: sectors.file.root }
            }
        }
    }
    return sectors
}

const defragDiskSectors = (disk: string[], sectors: DiskMap<MemorySector>) => {
    let fileNode = sectors.file.root

    while (fileNode.index !== -1) {
        let freeNode = sectors.free.root.next!
        while (fileNode.index > freeNode.index) {
            if (fileNode.size <= freeNode.size) {
                swapSectors(disk, freeNode.index, fileNode.index, fileNode.size)
                sectors = redoSectors(disk)
                break
            }
            freeNode = freeNode.next!
        }
        fileNode = fileNode.next!
    }
}

const defragDisk = (diskInfo: DiskInfo, type: 'nodes' | 'sectors'): DefragResult => {
    const disk = [...diskInfo.disk]
    if (type === 'nodes') {
        defragDiskNodes(disk, diskInfo.nodes)
    } else {
        defragDiskSectors(disk, diskInfo.sectors)
    }
    return { disk, checksum: getDiskChecksum(disk) }
}

const getDiskChecksum = (disk: string[]) => {
    let checksum = 0

    for (let i = 0; i < disk.length; i++) {
        if (disk[i] !== '.') {
            checksum += Number(disk[i]) * i
        }
    }
    return checksum
}

const readResult = readDisk(diskMap)
    
console.log('Fragmented disk:')
console.log(readResult.disk.join(''))

const defragResult = defragDisk(readResult, 'sectors')

console.log('Defragmented disk:')
console.log(defragResult.disk.join(''))

const diskChecksum = getDiskChecksum(defragResult.disk)
console.log('Disk checksum:', diskChecksum)
