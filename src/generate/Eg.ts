export interface Logger<T> {
    ttt: T
    i: number
    color: Colour
    date: Date
    buffer: ArrayBuffer
    flags: boolean[]
    tuple: [number, string]
    eg: Eg<string>
    genericIdentifier: Eg<MockHandler>
    union: string | number
    intersection: number & string
    fun: (a: number) => string
    gun: (a: number) => number

    info(s: T): void

    error(s: string): void
}

export enum Colour {
    red = 'red',
    green = 'green'
}

class Eg<T> {}

interface MockHandler {

}