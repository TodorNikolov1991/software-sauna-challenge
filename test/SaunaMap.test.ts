import { describe, test, expect } from '@jest/globals'
import { presetTests } from './TestData'
import {
    CROSSROAD_CHAR,
    Direction,
    EMPTY_SPACE,
    END_CHAR,
    HORIZONTAL_CHAR,
    START_CHAR,
    SaunaMap,
    VERTICAL_CHAR,
    getMapFromMultilineString,
    getSidewaysDirections,
    isNextItemValidForDirection,
} from '../src/SaunaMap'

describe('SaunaMap', () => {

    describe('Full Tests', () => {
        for (const presetTest of presetTests) {
            test(presetTest.testName, () => {
                const map = new SaunaMap(getMapFromMultilineString(presetTest.input))
                if (presetTest.expectError) {
                    expect(() => map.walk()).toThrow()
                } else {
                    const { letters, path } = map.walk()
                    if (presetTest.expectError) {
                        throw new Error('Expected error but got none')
                    }
                    expect(letters).toEqual(presetTest.expectedLetters)
                    expect(path).toEqual(presetTest.expectedPath)
                }
            })
        }
    })

    describe('Unit tests', () => {
        const defaultMap = presetTests[0].input
        const allDirections = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT]
        const horizontalDirections = [Direction.LEFT, Direction.RIGHT]
        const verticalDirections = [Direction.UP, Direction.DOWN]

        describe('getItemAt', () => {
            test('Existing item', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                expect(map.getItemAt({ x: 2, y: 3 })).toBe(END_CHAR)
            })

            test('Existing item 2', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                expect(map.getItemAt({ x: 10, y: 3 })).toBe('C')
            })

            test('Existing Empty space', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                expect(map.getItemAt({ x: 8, y: 2 })).toBe(EMPTY_SPACE)
            })

            test('Not existing Empty space', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                expect(map.getItemAt({ x: 15, y: 22 })).toBe(EMPTY_SPACE)
            })

            test('Negative coordinates', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                expect(map.getItemAt({ x: -15, y: -22 })).toBe(EMPTY_SPACE)
            })
        })

        describe('getStart', () => {
            test('existing start', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                const result = map.getStart()
                expect(result.x).toEqual(2)
                expect(result.y).toEqual(1)
            })

            test('No start', () => {
                const map = new SaunaMap(getMapFromMultilineString(`---x---`))
                expect(() => map.getStart()).toThrow()
            })

            test('Multiple starts', () => {
                const map = new SaunaMap(getMapFromMultilineString(`@---x---@`))
                expect(() => map.getStart()).toThrow()
            })
        })

        describe('getNextItem', () => {

            test('UP Valid', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                const testPosition = { x: 10, y: 2 }
                const result = map.getNextItem(testPosition, Direction.UP)
                expect(result.valid).toBe(true)
                expect(result.item).toBe(CROSSROAD_CHAR)
                expect(result.position).toEqual({ x: testPosition.x, y: testPosition.y - 1 })
            })

            test('DOWN Valid', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                const testPosition = { x: 10, y: 2 }
                const result = map.getNextItem(testPosition, Direction.DOWN)
                expect(result.valid).toBe(true)
                expect(result.item).toBe('C')
                expect(result.position).toEqual({ x: testPosition.x, y: testPosition.y + 1 })
            })

            test('LEFT Valid', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                const testPosition = { x: 5, y: 3 }
                const result = map.getNextItem(testPosition, Direction.LEFT)
                expect(result.valid).toBe(true)
                expect(result.item).toBe('B')
                expect(result.position).toEqual({ x: testPosition.x - 1, y: testPosition.y })
            })

            test('RIGHT Valid', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                const testPosition = { x: 5, y: 3 }
                const result = map.getNextItem(testPosition, Direction.RIGHT)
                expect(result.valid).toBe(true)
                expect(result.item).toBe(CROSSROAD_CHAR)
                expect(result.position).toEqual({ x: testPosition.x + 1, y: testPosition.y })
            })

            test('RIGHT Invalid', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                const testPosition = { x: 6, y: 3 }
                const result = map.getNextItem(testPosition, Direction.RIGHT)
                expect(result.valid).toBe(false)
                expect(result.item).toBe(EMPTY_SPACE)
                expect(result.position).toEqual({ x: testPosition.x + 1, y: testPosition.y })
            })

            test('RIGHT Invalid', () => {
                const map = new SaunaMap(getMapFromMultilineString(defaultMap))
                const testPosition = { x: 5, y: 4 }
                const result = map.getNextItem(testPosition, Direction.RIGHT)
                expect(result.valid).toBe(false)
                expect(result.item).toBe(VERTICAL_CHAR)
                expect(result.position).toEqual({ x: testPosition.x + 1, y: testPosition.y })
            })
        })

        describe('nextStep', () => {
            test('Step Off Start', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
 | 
 @
                    `))

                const result = map.nextStep(map.getStart(), Direction.UNKNOWN, START_CHAR)
                expect(result.item).toBe(VERTICAL_CHAR)
                expect(result.position.x).toEqual(1)
                expect(result.position.y).toEqual(1)
            })

            test('Step Off Start Multiple exits', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
 | 
 @-
                    `))

                expect(() => map.nextStep(map.getStart(), Direction.UNKNOWN, START_CHAR)).toThrow()
            })

            test('Continue dash', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
---
                    `))

                const result = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(result.item).toBe(HORIZONTAL_CHAR)
                expect(result.position.x).toEqual(1)
                expect(result.position.y).toEqual(1)
            })

            test('Letter Continue', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-A-
                    `))

                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe('A')
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                const step2 = map.nextStep(step1.position, step1.direction, step1.item)
                expect(step2.item).toBe(HORIZONTAL_CHAR)
                expect(step2.position.x).toEqual(2)
                expect(step2.position.y).toEqual(1)
            })

            test('Letter Continue with option', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-A-
 | 
                    `))

                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe('A')
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                const step2 = map.nextStep(step1.position, step1.direction, step1.item)
                expect(step2.item).toBe(HORIZONTAL_CHAR)
                expect(step2.position.x).toEqual(2)
                expect(step2.position.y).toEqual(1)
            })

            test('Letter Turn', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-A
 | 
                    `))

                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe('A')
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                const step2 = map.nextStep(step1.position, step1.direction, step1.item)
                expect(step2.item).toBe(VERTICAL_CHAR)
                expect(step2.position.x).toEqual(1)
                expect(step2.position.y).toEqual(2)
            })

            test('Change direction continue', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-+-
                `))
                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe(CROSSROAD_CHAR)
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                expect(() => map.nextStep(step1.position, step1.direction, step1.item)).toThrow()
            })

            test('Change direction', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-+
 |
                `))

                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe(CROSSROAD_CHAR)
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                const step2 = map.nextStep(step1.position, step1.direction, step1.item)
                expect(step2.item).toBe(VERTICAL_CHAR)
                expect(step2.position.x).toEqual(1)
                expect(step2.position.y).toEqual(2)
            })

            test('Tight Loop', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-A+
 ++
                `))

                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe('A')
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                const step2 = map.nextStep(step1.position, step1.direction, step1.item)
                expect(step2.item).toBe(CROSSROAD_CHAR)
                expect(step2.position.x).toEqual(2)
                expect(step2.position.y).toEqual(1)

                const step3 = map.nextStep(step2.position, step2.direction, step2.item)
                expect(step3.item).toBe(CROSSROAD_CHAR)
                expect(step3.position.x).toEqual(2)
                expect(step3.position.y).toEqual(2)

                const step4 = map.nextStep(step3.position, step3.direction, step3.item)
                expect(step4.item).toBe(CROSSROAD_CHAR)
                expect(step4.position.x).toEqual(1)
                expect(step4.position.y).toEqual(2)

                const step5 = map.nextStep(step4.position, step4.direction, step4.item)
                expect(step5.item).toBe('A')
                expect(step5.position.x).toEqual(1)
                expect(step5.position.y).toEqual(1)
            })

            test('Double Crossroad', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-||-
 ||
                `))

                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe(VERTICAL_CHAR)
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                expect(() => map.nextStep(step1.position, step1.direction, step1.item)).toThrow()
            })

            test('Single Crossroad', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
-|-
 |
                `))

                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.RIGHT, HORIZONTAL_CHAR)
                expect(step1.item).toBe(VERTICAL_CHAR)
                expect(step1.position.x).toEqual(1)
                expect(step1.position.y).toEqual(1)

                const step2 = map.nextStep(step1.position, step1.direction, step1.item)
                expect(step2.item).toBe(HORIZONTAL_CHAR)
                expect(step2.position.x).toEqual(2)
                expect(step2.position.y).toEqual(1)
            })

            test('Vertical Char', () => {
                const map = new SaunaMap(getMapFromMultilineString(`
|-
|
                `))
                const step1 = map.nextStep({ x: 0, y: 1 }, Direction.DOWN, VERTICAL_CHAR)
                expect(step1.item).toBe(VERTICAL_CHAR)
                expect(step1.position.x).toEqual(0)
                expect(step1.position.y).toEqual(2)
            })
        })

        describe('isNextItemValidForDirection', () => {
            test('Letter', () => {
                allDirections.forEach(direction => {
                    expect(isNextItemValidForDirection('A', direction)).toBe(true)
                })
            })

            test('Crossroad', () => {
                allDirections.forEach(direction => {
                    expect(isNextItemValidForDirection(CROSSROAD_CHAR, direction)).toBe(true)
                })
            })

            test('End char', () => {
                allDirections.forEach(direction => {
                    expect(isNextItemValidForDirection(END_CHAR, direction)).toBe(true)
                })
            })

            test('Horizontal Char, hor direction', () => {
                horizontalDirections.forEach(direction => {
                    expect(isNextItemValidForDirection(HORIZONTAL_CHAR, direction)).toBe(true)
                })
            })

            test('Horizontal Char, ver direction', () => {
                verticalDirections.forEach(direction => {
                    expect(isNextItemValidForDirection(HORIZONTAL_CHAR, direction)).toBe(false)
                })
            })

            test('Vertical Char, ver direction', () => {
                verticalDirections.forEach(direction => {
                    expect(isNextItemValidForDirection(VERTICAL_CHAR, direction)).toBe(true)
                })
            })

            test('Vertical Char, hor direction', () => {
                horizontalDirections.forEach(direction => {
                    expect(isNextItemValidForDirection(VERTICAL_CHAR, direction)).toBe(false)
                })
            })
        })

        describe('getSidewaysDirections', () => {
            test('UP', () => {
                const result = getSidewaysDirections(Direction.UP)
                expect(result).toEqual(horizontalDirections)
            })

            test('RIGHT', () => {
                const result = getSidewaysDirections(Direction.RIGHT)
                expect(result).toEqual(verticalDirections)
            })

            test('DOWN', () => {
                const result = getSidewaysDirections(Direction.DOWN)
                expect(result).toEqual(horizontalDirections)
            })

            test('LEFT', () => {
                const result = getSidewaysDirections(Direction.LEFT)
                expect(result).toEqual(verticalDirections)
            })

            test('UNKNOWN', () => {
                const result = getSidewaysDirections(Direction.UNKNOWN)
                expect(result).toEqual(allDirections)
            })
        })
    })
})