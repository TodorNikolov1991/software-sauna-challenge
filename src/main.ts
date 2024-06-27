import { SaunaMap, getMapFromMultilineString } from "./SaunaMap"

function main() {
    const input = `
  @---A---+
          |
  x-B-+   C
      |   |
      +---+
      `
    console.log(input)

    const map = new SaunaMap(getMapFromMultilineString(input))
    const { letters, path } = map.walk()

    console.log('Letters: ', letters)
    console.log('Path: ', path)
}

main()