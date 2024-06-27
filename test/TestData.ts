export type TestDefinition = {
    testName: string,
    input: string,
    expectError: boolean,
    expectedErrorString?: string,
    expectedLetters?: string,
    expectedPath?: string
}

export const presetTests: TestDefinition[] = [
    {
        testName: 'Basic example',
        input: `
  @---A---+
          |
  x-B-+   C
      |   |
      +---+
        `,
        expectError: false,
        expectedLetters: 'ACB',
        expectedPath: '@---A---+|C|+---+|+-B-x',
    },
    {
        testName: 'Go straight',
        input: `
  @
  | +-C--+
  A |    |
  +---B--+
    |      x
    |      |
    +---D--+
        `,
        expectError: false,
        expectedLetters: 'ABCD',
        expectedPath: '@|A+---B--+|+--C-+|-||+---D--+|x',
    },
    {
        testName: 'Letters on turns',
        input: `
  @---A---+
          |
  x-B-+   |
      |   |
      +---C
        `,
        expectError: false,
        expectedLetters: 'ACB',
        expectedPath: '@---A---+|||C---+|+-B-x',
    },
    {
        testName: 'Do not collect letters twice',
        input: `
     +-O-N-+
     |     |
     |   +-I-+
 @-G-O-+ | | |
     | | +-+ E
     +-+     S
             |
             x
        `,
        expectError: false,
        expectedLetters: 'GOONIES',
        expectedPath: '@-G-O-+|+-+|O||+-O-N-+|I|+-+|+-I-+|ES|x',
    },
    {
        testName: 'Keep direction',
        input: `
 +-L-+
 |  +A-+
@B+ ++ H
 ++    x
        `,
        expectError: false,
        expectedLetters: 'BLAH',
        expectedPath: '@B+++B|+-L-+A+++A-+Hx',
    },
    {
        testName: 'Ignore after end',
        input: `
  @-A--+
       |
       +-B--x-C--D
        `,
        expectError: false,
        expectedLetters: 'AB',
        expectedPath: '@-A--+|+-B--x',
    },
    {
        testName: 'Missing start character',
        input: `
@-A--+|+-B--x
        `,
        expectError: true,
        expectedErrorString: 'Start character not found'
    },
    {
        testName: 'Multiple starts 1',
        input: `
   @--A-@-+
          |
  x-B-+   C
      |   |
      +---+
        `,
        expectError: true,
        expectedErrorString: 'Multiple start characters found'
    },
    {
        testName: 'Multiple starts 2',
        input: `
   @--A---+
          |
          C
          x
      @-B-+
        `,
        expectError: true,
        expectedErrorString: 'Multiple start characters found'
    },
    {
        testName: 'Multiple starts 3',
        input: `
   @--A--x

  x-B-+
      |
      @
        `,
        expectError: true,
        expectedErrorString: 'Multiple start characters found'
    },
    {
        testName: 'Fork in path',
        input: `
        x-B
          |
   @--A---+
          |
     x+   C
      |   |
      +---+
        `,
        expectError: true,
        expectedErrorString: 'Fork in path'
    },
    {
        testName: 'Broken path',
        input: `
   @--A-+
        |
         
        B-x
        `,
        expectError: true,
        expectedErrorString: 'Broken path',
    },
    {
        testName: 'Multiple starting paths',
        input: `
  x-B-@-A-x
        `,
        expectError: true,
        expectedErrorString: ''
    },
    {
        testName: 'Fake turn',
        input: `
  @-A-+-B-x
        `,
        expectError: true,
        expectedErrorString: ''
    },
]