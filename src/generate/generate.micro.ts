import {generateBuilder} from "./generateBuilder";

describe("generate", () => {
    it("generateBuilder", () => {
        const fileName = "/Users/rickmugridge/Documents/working/ts-compiled/src/generate/Eg.ts";
        const result = generateBuilder(fileName, ['Logger'], {}, {})
        console.log(result)
    });
});