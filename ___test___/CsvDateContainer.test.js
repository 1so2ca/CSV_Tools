import { CsvDataContainer } from "../src/CsvDataContainer";

describe("CsvDataContainer", () => {
    let csvDataContainer;
    beforeEach(() => {
        const csv = createDummyCsv();
        csvDataContainer = new CsvDataContainer(csv);
        
    });

    test("formatRecordBased", () => {
        const record = csvDataContainer.formatRecordBased();
    });
});

function createDummyCsv() {
    return `id,name,age,birthday
    1,John,20,1990-01-01
    2,Jane,21,1991-02-02
    3,Doe,22,1992-03-03`;
}
