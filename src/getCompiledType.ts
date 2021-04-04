import * as ts from "typescript";
import {SyntaxKind} from "typescript";
import {ofType} from "mismatched/dist/src/ofType";
import {TGenericArgument, TGenericParameter, TParam, TType, TTypeKind} from "./TType";
import {getName} from "./getCompiled";

export const getCompiledType = (type: ts.TypeNode | undefined,
                                elementaryClassSet: Set<string>,
                                enumMap: Map<string, string[]>): TType => {
    if (!type)
        return {kind: TTypeKind.Unknown}
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
            if (ts.isTypeReferenceNode(type))
                return handleTypeReference(type, elementaryClassSet, enumMap)
            return {kind: TTypeKind.Unknown}
        case SyntaxKind.FunctionType:
            if (ts.isFunctionTypeNode(type))
                return {
                    kind: TTypeKind.Arrow,
                    parameters: mapParameters(type.parameters, elementaryClassSet, enumMap),
                    resultType: getCompiledType(type.type, elementaryClassSet, enumMap)
                }
            return {kind: TTypeKind.Unknown}
        case SyntaxKind.UnionType:
            if (ts.isUnionTypeNode(type))
                return {kind: TTypeKind.Union, elements: mapElements(type.types, elementaryClassSet, enumMap)}
            return {kind: TTypeKind.Unknown}
        case SyntaxKind.IntersectionType:
            if (ts.isIntersectionTypeNode(type))
                return {kind: TTypeKind.Intersection, elements: mapElements(type.types, elementaryClassSet, enumMap)}
            return {kind: TTypeKind.Unknown}
        case SyntaxKind.ArrayType:
            if (ts.isArrayTypeNode(type))
                return {
                    kind: TTypeKind.Array,
                    elementType: getCompiledType(type.elementType, elementaryClassSet, enumMap)
                }
            return {kind: TTypeKind.Unknown}
        case SyntaxKind.TupleType:
            if (ts.isTupleTypeNode(type))
                return {kind: TTypeKind.Tuple, elements: mapElements(type.elements, elementaryClassSet, enumMap)}
            return {kind: TTypeKind.Unknown}
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

const handleTypeReference = (type: ts.TypeReferenceNode,
                             elementaryClassSet: Set<string>,
                             enumMap: Map<string, string[]>): TType => {
    const name = getName(type.typeName);
    if (builtInClassSet.has(name) || elementaryClassSet.has(name))
        return {kind: TTypeKind.BuiltInClass, typeName: name}
    const elementNames = enumMap.get(name)
    if (elementNames)
        return {kind: TTypeKind.Enum, name, elementNames}
    return {
        kind: TTypeKind.UserClass,
        name,
        generics: mapGenericArguments(type.typeArguments, elementaryClassSet, enumMap)
    }
}

const mapElements = (elements: ts.NodeArray<ts.TypeNode>,
                     elementaryClassSet: Set<string>,
                     enumMap: Map<string, string[]>): TType[] =>
    elements.filter(e => ofType.isObject(e)).map(e => getCompiledType(e, elementaryClassSet, enumMap))

const mapParameters = (parameters: ts.NodeArray<ts.ParameterDeclaration>,
                       elementaryClassSet: Set<string>,
                       enumMap: Map<string, string[]>): TParam[] =>
    parameters.map(p => ({
        name: getName(p.name),
        type: getCompiledType(p.type, elementaryClassSet, enumMap)
    }))

export const mapGenericArguments = (typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
                                    elementaryClassSet: Set<string>,
                                    enumMap: Map<string, string[]>): TGenericArgument[] => {
    if (!typeArguments)
        return []
    return mapElements(typeArguments, elementaryClassSet, enumMap).map(t =>
        ({kind: TTypeKind.GenericArgument, type: t, generics: []}))
}

export const mapGenericParameters = (typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>): TGenericParameter[] =>
    (typeParameters || []).filter(e => ofType.isObject(e)).map(t => ({name: getName(t.name)}))
