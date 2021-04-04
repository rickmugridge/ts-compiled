import {SyntaxKind, TypeNode} from "typescript";
import {ofType} from "mismatched/dist/src/ofType";
import {TGenericArgument, TGenericParameter, TParam, TType, TTypeKind} from "./TType";
import {getName} from "./getCompiled";

export const getCompiledType = (type: TypeNode,
                                elementaryClassSet: Set<string>,
                                enumMap: Map<string, string>): TType => {
    const typeAny = type as any;
    switch (type.kind) {
        case SyntaxKind.StringKeyword:
            return {kind: TTypeKind.String}
        case SyntaxKind.NumberKeyword:
            return {kind: TTypeKind.Number}
        case SyntaxKind.BooleanKeyword:
            return {kind: TTypeKind.Boolean}
        case SyntaxKind.SymbolKeyword:
            return {kind: TTypeKind.BuiltInClass, typeName: 'Symbol'}
        case SyntaxKind.ObjectKeyword:
            return {kind: TTypeKind.UserClass, name: 'object', generics: []}
        case SyntaxKind.AnyKeyword:
            return {kind: TTypeKind.UserClass, name: 'any', generics: []}
        case SyntaxKind.TypeReference:
            return handleTypeReference(typeAny, elementaryClassSet, enumMap)
        case SyntaxKind.FunctionType:
            return {
                kind: TTypeKind.Arrow,
                parameters: mapParameters(typeAny.parameters, elementaryClassSet, enumMap),
                resultType: getCompiledType(typeAny.type, elementaryClassSet, enumMap)
            }
        case SyntaxKind.UnionType:
            return {kind: TTypeKind.Union, elements: mapElements(typeAny.types, elementaryClassSet, enumMap)}
        case SyntaxKind.IntersectionType:
            return {kind: TTypeKind.Intersection, elements: mapElements(typeAny.types, elementaryClassSet, enumMap)}
        case SyntaxKind.ArrayType:
            return {
                kind: TTypeKind.Array,
                elementType: getCompiledType(typeAny.elementType, elementaryClassSet, enumMap)
            }
        case SyntaxKind.TupleType:
            return {kind: TTypeKind.Tuple, elements: mapElements(typeAny.types, elementaryClassSet, enumMap)}
        case SyntaxKind.VoidKeyword:
            return {kind: TTypeKind.Void}
        default:
            return {kind: TTypeKind.Unknown}
    }
}

const builtInClassSet: Set<string> = new Set(
    [
        'Array', 'ArrayBuffer', 'AsynchFunction', 'Atomics',
        'BigInt', 'BigInt64Array', 'BigUint64Array', 'Boolean',
        'DataView', 'Date', 'Error', 'EvalError',
        'FinalizationRegistry', 'Float32Array', 'Float64Array', 'Function', 'Generator', 'GeneratorFunction',
        'InternalError', 'Intl', 'JSON', 'Map', 'Math', 'NaN', 'Number', 'Object',
        'Promise', 'Proxy', 'RangeError', 'ReferenceError', 'Reflect', 'RegExp',
        'Set', 'SharedArrayBuffer', 'String', 'Symbol', 'TypedArray', 'TypeError',
        'UInt16Array', 'UInt32Array', 'UInt8Array', 'UInt8ClampedArray', 'UriError',
        'WeakMap', 'WeakSet', 'WebAssembly'
    ])

const handleTypeReference = (type: any,
                             elementaryClassSet: Set<string>,
                             enumMap: Map<string, string>): TType => {
    const name = getName(type.typeName);
    if (builtInClassSet.has(name) || elementaryClassSet.has(name))
        return {kind: TTypeKind.BuiltInClass, typeName: name}
    const enumValue = enumMap.get(name)
    if (enumValue)
        return {kind: TTypeKind.Enum, enumName: name, defaultValueName: enumValue}
    return {
        kind: TTypeKind.UserClass,
        name,
        generics: mapGenericArguments(type.typeArguments, elementaryClassSet, enumMap)
    }
}

const mapElements = (elements: any[],
                     elementaryClassSet: Set<string>,
                     enumMap: Map<string, string>): TType[] =>
    elements.filter(e => ofType.isObject(e)).map(e => getCompiledType(e, elementaryClassSet, enumMap))

const mapParameters = (parameters: any[],
                       elementaryClassSet: Set<string>,
                       enumMap: Map<string, string>): TParam[] =>
    parameters.map(p => ({
        name: p.name.escapedText,
        type: getCompiledType(p.type, elementaryClassSet, enumMap)
    }))

export const mapGenericArguments = (typeArguments: any[],
                                    elementaryClassSet: Set<string>,
                                    enumMap: Map<string, string>): TGenericArgument[] =>
    mapElements(typeArguments || [], elementaryClassSet, enumMap).map(t =>
        ({kind: TTypeKind.GenericArgument, type: t, generics: []}))

export const mapGenericParameters = (typeParameters?: any[]): TGenericParameter[] =>
    (typeParameters || []).filter(e => ofType.isObject(e)).map(t => ({name: getName(t.name)}))
