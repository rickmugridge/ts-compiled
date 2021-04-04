import * as ts from "typescript";
import {getCompiledType, mapGenericParameters} from "./getCompiledType";
import {TParam, TType, TTypeKind} from "./TType";
import {Compiled, CompiledField, CompiledInterface, CompiledMethod, CompiledType} from "./Compiled";

export const getCompiled = (fileName: string,
                            elementaryInterfaces: string[] = [],
                            elementaryClasses: any = {},
                            enums: any = {}): Compiled[] => {
    const elementaryClassSet: Set<string> = new Set(Object.keys(elementaryClasses))
    elementaryInterfaces.forEach(ei => elementaryClassSet.add(ei))
    const enumMap: Map<string, string[]> = new Map() // enumName -> enumElementName[]. Eg 'Colour' -> ['Colour.red', 'Colour.green']
    Object.keys(enums).forEach(key => enumMap.set(key, Object.keys(enums[key]).map(name => `${key}.${name}`)))
    var cmd = ts.parseCommandLine([fileName]);
    let program = ts.createProgram(cmd.fileNames, cmd.options);
    const sourceFile = program.getSourceFile(fileName)!;
    return mapNodes(sourceFile, elementaryClassSet, enumMap);
}

const mapNodes = (sourceFile: ts.SourceFile,
                  elementaryClassSet: Set<string>,
                  enumMap: Map<string, string[]>): Compiled[] => {
    const decompiledArray: Compiled[] = []
    ts.forEachChild(sourceFile, (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && isExported(node)) {
            getCompiledClass(node, decompiledArray, elementaryClassSet, enumMap);
        } else if (ts.isInterfaceDeclaration(node)) {
            const anInterface = getCompiledInterface(node, elementaryClassSet, enumMap);
            decompiledArray.push(anInterface)
        } else if (ts.isVariableStatement(node) && isExported(node)) {
            getCompiledFunction(node, decompiledArray, elementaryClassSet, enumMap);
        }
    })
    return decompiledArray
};

const getCompiledClass = (node: ts.ClassDeclaration,
                          decompiledArray: Compiled[],
                          elementaryClassSet: Set<string>,
                          enumMap: Map<string, string[]>) => {
    const name = getName(node.name)
    const genericParameters = mapGenericParameters(node.typeParameters)
    node.members.forEach(member => {
        if (ts.isConstructorDeclaration(member)) {
            decompiledArray.push({
                type: CompiledType.ClassType, name,
                genericParameters,
                parameters: getParameters(member.parameters, elementaryClassSet, enumMap),
                fields: [],
                methods: []
            })
        }
    })
};

const getCompiledInterface = (node: ts.InterfaceDeclaration,
                              elementaryClassSet: Set<string>,
                              enumMap: Map<string, string[]>): CompiledInterface => {
    const name = getName(node.name)
    const genericParameters = mapGenericParameters(node.typeParameters)
    const methods: CompiledMethod[] = []
    const fields: CompiledField[] = []
    node.members.forEach(member => {
        if (ts.isMethodSignature(member)) {
            methods.push({
                name: getName(member.name),
                genericParameters: mapGenericParameters(member.typeParameters),
                parameters: getParameters(member.parameters, elementaryClassSet, enumMap),
                resultType: getCompiledType(member.type, elementaryClassSet, enumMap)
            })
        } else if (ts.isPropertySignature(member)) {
            fields.push({
                name: getName(member.name),
                resultType: getCompiledType(member.type, elementaryClassSet, enumMap)
            })
        }
    })
    return {type: CompiledType.InterfaceType, name, genericParameters, fields, methods};
};

const getCompiledFunction = (node: ts.VariableStatement,
                             decompiledArray: Compiled[],
                             elementaryClassSet: Set<string>,
                             enumMap: Map<string, string[]>) => {
    const variableDeclarations = node.declarationList.declarations;
    if (Array.isArray(variableDeclarations) && variableDeclarations.length > 0) {
        const initializer = variableDeclarations[0].initializer
        if (ts.isArrowFunction(initializer)) {
            const name = (variableDeclarations[0].name).escapedText!.toString()!
            decompiledArray.push({
                type: CompiledType.FunctionType, name, genericParameters: [],
                parameters: getParameters(initializer.parameters, elementaryClassSet, enumMap),
                resultType: {kind: TTypeKind.Unknown}
            })
        }
    }
};

const isExported = (node: ts.Node): boolean => (node.flags & ts.ModifierFlags.Export) !== 0

export const getName = (name?: ts.PropertyName | ts.EntityName | ts.BindingPattern): string => {
    if (!name)
        return '<undefinedName>'
    if (ts.isIdentifier(name) || ts.isPrivateIdentifier(name))
        return name.escapedText.toString()
    if (ts.isStringLiteralLike(name))
        return `'${name.text}'`
    if (ts.isNumericLiteral(name))
        return name.text
    return '<ComputedPropertyName>'
}

const getParameters = (parameters: ts.NodeArray<ts.ParameterDeclaration> | undefined,
                       elementaryClassSet: Set<string>,
                       enumMap: Map<string, string[]>): TParam[] =>
    Array.from((parameters || []).map(p => ({
        name: p.name.escapedText,
        type: getParameterType(p, elementaryClassSet, enumMap)
    })))

const getParameterType = (param: ts.ParameterDeclaration,
                          elementaryClassSet: Set<string>,
                          enumMap: Map<string, string[]>): TType => {
    if (!param.type) {
        return {kind: TTypeKind.Unknown}
    }
    return getCompiledType(param.type, elementaryClassSet, enumMap)
}
