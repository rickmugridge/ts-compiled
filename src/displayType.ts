import {TParam, TType, TTypeKind} from "./TType";

export const displayType = (type: TType): string => {
    switch (type.kind) {
        case TTypeKind.String:
            return 'string'
        case TTypeKind.Number:
            return 'number'
        case TTypeKind.Boolean:
            return 'boolean'
        case TTypeKind.Enum:
            return type.name
        case TTypeKind.BuiltInClass:
            return type.typeName
        case TTypeKind.UserClass: {
            if (type.generics.length > 0) {
                return `${type.name}<${type.generics.map(displayType).join(', ')}>`
            }
            return type.name;
        }
        case TTypeKind.GenericArgument: {
            if (type.generics.length > 0) {
                return `${displayType(type.type)}<${type.generics.map(displayType).join(', ')}>`;
            }
            return displayType(type.type);
        }
        case TTypeKind.Array:
            return displayType(type.elementType) + '[]';
        case TTypeKind.Tuple:
            return '[' + type.elements.map(displayType) + ']';
        case TTypeKind.Union:
            return type.elements.map(displayType).join(' | ')
        case TTypeKind.Intersection:
            return type.elements.map(displayType).join(' & ')
        case TTypeKind.Arrow:
            return `(${type.parameters.map(displayParam).join(', ')}) => ${displayType(type.resultType)}`
        case TTypeKind.Void:
            return 'void'
        case TTypeKind.Unknown:
            return 'unknown'
    }
}

const displayParam = (param: TParam) => param.name + ": " + displayType(param.type)

