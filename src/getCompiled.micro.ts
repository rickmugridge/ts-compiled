import {generateBuilder} from "./generate/generateBuilder";
import {getCompiled} from "./getCompiled";
import {assertThat} from "mismatched";
import {TTypeKind} from "./TType";
import {CompiledType} from "./Compiled";
import {Colour} from "./generate/Eg";

describe("generate", () => {
    it("getCompiled", () => {
        const fileName = "/Users/rickmugridge/Documents/working/ts-compiled/src/generate/Eg.ts";
        const result = getCompiled(fileName, ['Logger'],
            {}, {Colour})
        // decompiledActual(result, {}, {CompiledType, TTypeKind})
        assertThat(result).is([
                {
                    type: CompiledType.InterfaceType, name: "Logger",
                    genericParameters: [{name: "T"}],
                    fields: [
                        {
                            name: "ttt", resultType: {
                                kind: TTypeKind.UserClass, name: "T",
                                generics: []
                            }
                        }, {name: "i", resultType: {kind: TTypeKind.Number}},
                        {
                            name: "color", resultType: {
                                kind: TTypeKind.Enum, name: "Colour", elementNames: ['Colour.red', 'Colour.green']
                            }
                        }, {
                            name: "date", resultType: {
                                kind: TTypeKind.BuiltInClass,
                                typeName: "Date"
                            }
                        },
                        {
                            name: "buffer", resultType: {
                                kind: TTypeKind.BuiltInClass,
                                typeName: "ArrayBuffer"
                            }
                        },
                        {
                            name: "flags", resultType: {
                                kind: TTypeKind.Array,
                                elementType: {kind: TTypeKind.Boolean}
                            }
                        },
                        {
                            name: "tuple",
                            resultType: {
                                kind: TTypeKind.Tuple, elements: [
                                    {kind: TTypeKind.Number}, {kind: TTypeKind.String}
                                ]
                            }
                        },
                        {
                            name: "eg",
                            resultType: {
                                kind: TTypeKind.UserClass, name: "Eg",
                                generics: [{
                                    kind: TTypeKind.GenericArgument, type: {kind: TTypeKind.String},
                                    generics: []
                                }]
                            }
                        },
                        {
                            name: "genericIdentifier",
                            resultType: {
                                kind: TTypeKind.UserClass, name: "Eg",
                                generics: [
                                    {
                                        kind: TTypeKind.GenericArgument,
                                        type: {
                                            kind: TTypeKind.UserClass, name: "MockHandler",
                                            generics: []
                                        }, generics: []
                                    }
                                ]
                            }
                        },
                        {
                            name: "union",
                            resultType: {
                                kind: TTypeKind.Union, elements: [
                                    {kind: TTypeKind.String}, {kind: TTypeKind.Number}
                                ]
                            }
                        },
                        {
                            name: "intersection",
                            resultType: {
                                kind: TTypeKind.Intersection,
                                elements: [{kind: TTypeKind.Number}, {kind: TTypeKind.String}]
                            }
                        },
                        {
                            name: "fun",
                            resultType: {
                                kind: TTypeKind.Arrow, parameters: [{name: "a", type: {kind: TTypeKind.Number}}],
                                resultType: {kind: TTypeKind.String}
                            }
                        },
                        {
                            name: "gun",
                            resultType: {
                                kind: TTypeKind.Arrow, parameters: [{name: "a", type: {kind: TTypeKind.Number}}],
                                resultType: {kind: TTypeKind.Number}
                            }
                        }
                    ],
                    methods: [
                        {
                            name: "info", genericParameters: [],
                            parameters: [{
                                name: "s", type: {
                                    kind: TTypeKind.UserClass, name: "T",
                                    generics: []
                                }
                            }], resultType: {kind: TTypeKind.Void}
                        },
                        {
                            name: "error", genericParameters: [],
                            parameters: [{name: "s", type: {kind: TTypeKind.String}}],
                            resultType: {kind: TTypeKind.Void}
                        }
                    ]
                },
                {
                    type: CompiledType.InterfaceType, name: "MockHandler", genericParameters: [], fields: [], methods: []
                }
            ]
        )
    });

    it("generateBuilder", () => {
        const fileName = "/Users/rickmugridge/Documents/working/ts-compiled/src/generate/Eg.ts";
        const result = generateBuilder(fileName, [], {}, {Colour})
        assertThat(result).is(`
export class LoggerBuilder {
  logger: Logger = {
    ttt: new TBuilder().to(),
    i: someBuilder.number(),
    color: someBuilder.enum(Colour),
    date: someBuilder.date(),
    buffer: new ArrayBufferBuilder().to(),
    flags: [someBuilder.boolean()],
    tuple: [someBuilder.number(), someBuilder.string("tuple")],
    eg: new EgBuilder().to(),
    genericIdentifier: new EgBuilder().to(),
    union: someBuilder.string("union"),
    intersection: someBuilder.number(),
    fun: (a: number) => someBuilder.string("fun(a)"),
    gun: (a: number) => someBuilder.number(),
  }

  withTtt(ttt: T): this {
     this.logger.ttt = ttt
     return this
  }

  withI(i: number): this {
     this.logger.i = i
     return this
  }

  withColor(color: Colour): this {
     this.logger.color = color
     return this
  }

  withDate(date: Date): this {
     this.logger.date = date
     return this
  }

  withBuffer(buffer: ArrayBuffer): this {
     this.logger.buffer = buffer
     return this
  }

  withFlags(flags: boolean[]): this {
     this.logger.flags = flags
     return this
  }

  withTuple(tuple: [number,string]): this {
     this.logger.tuple = tuple
     return this
  }

  withEg(eg: Eg<string>): this {
     this.logger.eg = eg
     return this
  }

  withGenericIdentifier(genericIdentifier: Eg<MockHandler>): this {
     this.logger.genericIdentifier = genericIdentifier
     return this
  }

  withUnion(union: string | number): this {
     this.logger.union = union
     return this
  }

  withIntersection(intersection: number & string): this {
     this.logger.intersection = intersection
     return this
  }

  withFun(fun: (a: number) => string): this {
     this.logger.fun = fun
     return this
  }

  withGun(gun: (a: number) => number): this {
     this.logger.gun = gun
     return this
  }
  to(): Logger {
     return logger
  }
}
`)
    });
});