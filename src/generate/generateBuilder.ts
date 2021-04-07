import {fillTemplate} from "./fillTemplate";
import {getCompiled} from "../getCompiled";
import {Compiled, CompiledType} from "../Compiled";
import {displayType} from "../displayType";
import {TParam, TType, TTypeKind} from "../TType";

const headerTemplate = ``

const builderTemplate = `
export class @{className}Builder {
  @{lowerName}: @{className} = {
@{valuePairs}
  }
@{methods}
  to(): @{className} {
     return this.@{lowerName}
  }
}
`

const valuePairTemplate = `
     this.@{fieldName} = @{someValue}
`

const withTemplate = `
  with@{upperFieldName}(@{fieldName}: @{fieldType}): this {
     this.@{lowerClassName}.@{fieldName} = @{fieldName}
     return this
  }`

export const generateBuilder = (fileName: string,
                                elementaryInterfaces: string[] = [],
                                elementaryClasses: any = {},
                                enums: any = {},
                                builderName: string = 'someBuilder'): string => {
    const classDetails = getCompiled(fileName, elementaryInterfaces, elementaryClasses, enums);
    const results: string[] = []
    classDetails.forEach(classDetail => makeBuilder(classDetail, builderName, results))
    if (results.length > 0) {
        return headerTemplate + results.join()
    }
    return ''
}

const makeBuilder = (compiled: Compiled, builderName: string, results: string[]) => {
    switch (compiled.type) {
        case CompiledType.ClassType:
            break
        case CompiledType.InterfaceType:
            let makeBuilder = false
            const lowerName = lowerFirst(compiled.name);
            const valuePairs: string[] = []
            const methods: string[] = []
            compiled.fields.forEach(field => {
                makeBuilder = true
                valuePairs.push(`    ${field.name}: ${displayBuilderValue(field.resultType, field.name, builderName)},`)
                methods.push(fillTemplate(withTemplate, {
                    upperFieldName: upperFirst(field.name),
                    fieldName: field.name,
                    fieldType: displayType(field.resultType),
                    lowerClassName: lowerName
                }))
            })
            if (makeBuilder) {
                results.push(fillTemplate(builderTemplate, {
                    className: compiled.name,
                    lowerName: lowerName,
                    valuePairs: valuePairs.join('\n'),
                    methods: methods.join('\n'),
                }))
            }
            break
        case CompiledType.FunctionType:
            break
    }
}

const displayBuilderValue = (type: TType, fieldName: string, builderName: string): string => {
    switch (type.kind) {
        case TTypeKind.String:
            return `${builderName}.string("${fieldName}")`;
        case TTypeKind.Number:
            return `${builderName}.number()`;
        case TTypeKind.Boolean:
            return `${builderName}.boolean()`;
        case TTypeKind.Enum:
            return `${builderName}.enum(${type.name})`;
        case TTypeKind.BuiltInClass:
            if (type.typeName === 'Date')
                return `${builderName}.date()`;
            return `new ${type.typeName}Builder().to()`;
        case TTypeKind.UserClass: {
            return `new ${type.name}Builder().to()`;
        }
        case TTypeKind.GenericArgument:
            return ``;
        case TTypeKind.Array:
            return `[${displayBuilderValue(type.elementType, fieldName, builderName)}]`;
        case TTypeKind.Tuple:
            return `[${type.elements.map(e => displayBuilderValue(e, fieldName, builderName)).join(', ')}]`;
        case TTypeKind.Union:
            return displayBuilderValue(type.elements[0], fieldName, builderName);
        case TTypeKind.Intersection:
            return displayBuilderValue(type.elements[0], fieldName, builderName);
        case TTypeKind.Arrow:
            const formalParameters = type.parameters.map(displayParam).join(', ');
            const resultParameters = type.parameters.map(p => p.name).join(', ')
            const result = displayBuilderValue(type.resultType, `${fieldName}(${resultParameters})`, builderName);
            return `(${formalParameters}) => ${result}`
        case TTypeKind.Void:
            return ``;
        case TTypeKind.Unknown:
            return ``;
    }
}

const displayParam = (param: TParam) => param.name + ": " + displayType(param.type)

const lowerFirst = (s: string) => s.length > 0 ? s.charAt(0).toLowerCase() + s.substring(1) : ''

const upperFirst = (s: string) => s.length > 0 ? s.charAt(0).toUpperCase() + s.substring(1) : ''
