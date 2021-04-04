# ts-compiled

This maps the typescript compiler AST to a simpler form to ease writing generators.

In particular, it creates a much simpler AST with a focus on declarations and types in a single source file.
The purpose is to make it easy to write various generators. For example, it has been used to generate:
 * A mock setup for a class (see thespian)
 * A builder for an interface (see mismatched)
 * A validator for an interface (see mismatched)

To get the simplified AST for the code in a source file, call `getCompiled()` with the following arguments:
 * Source file name
 * Elementary classes. These are classes that are considered atomic by the 
 * Enums for any enums that are used in the source file

## To Do
 * Improve the type safety of the mapping code, by using suitable `ts.isXXX()` functions.