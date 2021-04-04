export type TType =
    TString | TNumber | TBoolean
    | TEnum
    | TBuiltInClass | TUserClass
    | TGenericArgument
    | TArray | TTuple
    | TUnion | TIntersection
    | TArrow
    | TVoid | TUnknown

export interface TString {
    kind: TTypeKind.String
}

export interface TNumber {
    kind: TTypeKind.Number
}

export interface TBoolean {
    kind: TTypeKind.Boolean
}

export interface TEnum {
    kind: TTypeKind.Enum
    enumName: string
    defaultValueName: string
}

export interface TBuiltInClass {
    kind: TTypeKind.BuiltInClass
    typeName: string
}

export interface TUserClass {
    kind: TTypeKind.UserClass
    name: string
    generics: TGenericArgument[]
}

export interface TGenericArgument {
    kind: TTypeKind.GenericArgument
    type: TType
    generics: TGenericArgument[]
}

export interface TArray {
    kind: TTypeKind.Array
    elementType: TType
}

export interface TTuple {
    kind: TTypeKind.Tuple
    elements: TType[]
}

export interface TUnion {
    kind: TTypeKind.Union
    elements: TType[]
}

export interface TIntersection {
    kind: TTypeKind.Intersection
    elements: TType[]
}

export interface TArrow {
    kind: TTypeKind.Arrow
    parameters: TParam[]
    resultType: TType
}

export interface TVoid {
    kind: TTypeKind.Void
}

export interface TUnknown {
    kind: TTypeKind.Unknown
}

export enum TTypeKind {
    String = 'String',
    Number = 'Number',
    Boolean = 'Boolean',
    Enum = 'Enum',
    BuiltInClass = 'BuiltInClass',
    UserClass = 'UserClass',
    GenericArgument = 'GenericArgument',
    Array = 'Array',
    Tuple = 'Tuple',
    Union = 'Union',
    Intersection = 'Intersection',
    Arrow = 'Arrow',
    Void = 'Void',
    Unknown = 'Unknown'
}

export interface TParam {
    name: string
    type: TType
}

export interface TGenericParameter {
    name: string
}

