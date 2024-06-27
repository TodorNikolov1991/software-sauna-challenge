export type DenseMap = string[][]
export type Position = { x: number, y: number }
export enum Direction {
    UNKNOWN = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3,
    LEFT = 4,
}

export const START_CHAR = '@'
export const END_CHAR = 'x'
export const CROSSROAD_CHAR = '+'
export const HORIZONTAL_CHAR = '-'
export const VERTICAL_CHAR = '|'
export const EMPTY_SPACE = ' '

export type WalkResult = {
    letters: string,
    path: string,
}

export class SaunaMap {
    map: DenseMap

    constructor(map: DenseMap) {
        this.map = map
    }

    getItemAt(position: Position): string {
        const line = this.map[position.y] || []
        return line[position.x] || EMPTY_SPACE
    }

    getStart(): Position {
        let start: Position | undefined = undefined

        this.map.forEach((line, yIndex) => {
            line?.forEach((char, xIndex) => {
                if (char === START_CHAR) {
                    if (!start) {
                        start = { x: xIndex, y: yIndex }
                    } else {
                        throw new Error('Multiple start points found')
                    }
                }
            })
        })

        if (!start) {
            throw new Error('No start point found')
        }
        return start
    }

    getNextItem(prevPosition: Position, direction: Direction): { position: Position, item: string, valid: boolean } {
        const position = getNextPosition(prevPosition, direction)
        const item = this.getItemAt(position)

        const valid = isNextItemValidForDirection(item, direction)
        return { position, item, valid }
    }

    nextStep(
        previousPosition: Position,
        previousDirection: Direction,
        previousItem: string,
    ): {
        position: Position,
        direction: Direction,
        item: string,
    } {
        const validNextSteps: { position: Position, direction: Direction, item: string }[] = []

        if (previousItem === START_CHAR) {
            for (const direction of getSidewaysDirections(Direction.UNKNOWN)) {
                const { position, item, valid } = this.getNextItem(previousPosition, direction)
                if (valid) {
                    validNextSteps.push({ position, direction, item })
                }
            }
        }

        if (isLetter(previousItem)) {
            const { position, item, valid } = this.getNextItem(previousPosition, previousDirection)
            if (valid) {
                validNextSteps.push({ position, direction: previousDirection, item })
            } else {
                for (const direction of getSidewaysDirections(previousDirection)) {
                    const { position, item, valid } = this.getNextItem(previousPosition, direction)

                    if (valid) {
                        validNextSteps.push({ position, direction, item })
                    }
                }
            }
        }

        if (previousItem === CROSSROAD_CHAR) {
            const { valid } = this.getNextItem(previousPosition, previousDirection)
            if (valid) {
                throw new Error('Fake Turn')
            } else {
                for (const direction of getSidewaysDirections(previousDirection)) {
                    const { position, item, valid } = this.getNextItem(previousPosition, direction)

                    if (valid) {
                        validNextSteps.push({ position, direction, item })
                    }
                }
            }
        }

        if (previousItem === HORIZONTAL_CHAR) {
            const { position, item, valid } = this.getNextItem(previousPosition, previousDirection)
            if (valid || item === VERTICAL_CHAR) {
                validNextSteps.push({ position, direction: previousDirection, item })
            }
        }

        if (previousItem === VERTICAL_CHAR) {
            const { position, item, valid } = this.getNextItem(previousPosition, previousDirection)
            if (valid || item === HORIZONTAL_CHAR) {
                validNextSteps.push({ position, direction: previousDirection, item })
            }
        }

        if (validNextSteps.length === 0) {
            throw new Error('No valid next steps')
        }

        if (validNextSteps.length > 1) {
            throw new Error('Multiple valid next steps')
        }

        return validNextSteps[0]
    }

    walk(): WalkResult {
        const startPosition = this.getStart()

        let done = false
        const stack: { position: Position, direction: Direction, item: string }[] = []
        stack.push({ position: startPosition, direction: Direction.UNKNOWN, item: START_CHAR })

        while (!done) {
            const {
                direction: previousDirection,
                item: previousItem,
                position: previousPosition,
            } = stack[stack.length - 1]

            const nextStep = this.nextStep(previousPosition, previousDirection, previousItem)
            stack.push(nextStep)

            if (nextStep.item === END_CHAR) {
                done = true
            }
        }

        const path = stack.reduce((acc: string, { item }) => acc + item, '')

        const usedLetters: Position[] = []
        let letters = ''
        for (const frame of stack) {
            if (isLetter(frame.item)) {
                const used = usedLetters.some((position) => frame.position.x === position.x && frame.position.y === position.y)
                if (!used) {
                    usedLetters.push(frame.position)
                    letters += frame.item
                }
            }
        }

        return { letters, path }
    }
}

export function getMapFromMultilineString(input: string): DenseMap {
    const chars = input.split('\n').map(line => [...line])
    return chars
}

export function getNextPosition(prevPosition: Position, direction: Direction): Position {
    switch (direction) {
        case Direction.UP:
            return { x: prevPosition.x, y: prevPosition.y - 1 }
        case Direction.RIGHT:
            return { x: prevPosition.x + 1, y: prevPosition.y }
        case Direction.DOWN:
            return { x: prevPosition.x, y: prevPosition.y + 1 }
        case Direction.LEFT:
            return { x: prevPosition.x - 1, y: prevPosition.y }
        default:
            throw new Error('Invalid direction')
    }
}

export function isLetter(char: string): boolean {
    return char >= 'A' && char <= 'Z'
}

export function isNextItemValidForDirection(item: string, direction: Direction): boolean {
    let isValid = false

    if (isLetter(item)) {
        isValid = true
    }

    if (item === CROSSROAD_CHAR) {
        isValid = true
    }

    if (item === HORIZONTAL_CHAR && (direction === Direction.LEFT || direction === Direction.RIGHT)) {
        isValid = true
    }

    if (item === VERTICAL_CHAR && (direction === Direction.UP || direction === Direction.DOWN)) {
        isValid = true
    }

    if (item === END_CHAR) {
        isValid = true
    }

    return isValid
}

export function getSidewaysDirections(direction: Direction): Direction[] {
    switch (direction) {
        case Direction.UP:
        case Direction.DOWN:
            return [Direction.LEFT, Direction.RIGHT]
        case Direction.RIGHT:
        case Direction.LEFT:
            return [Direction.UP, Direction.DOWN]
        case Direction.UNKNOWN:
            return [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT]
    }
}