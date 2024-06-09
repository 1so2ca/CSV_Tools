/**
 * CSVを操作するクラス。
 * CsvDataContainer
 * 
 * CsvDataContainer(String csvData, Boolean isRecordBased, String | undefined primaryKey)
 * csvDataをCSVデータと解釈し、パースしてObjectに変換します。
 * isRecordBasedは変換形式を表します。
 * isRecordBasedがtrueの場合は以下の形式に変換して格納します。
 * {
 *  0: [FieldName1, FieldName2, FieldName3, ...],
 *  1: [Record1-1, Record1-2, Record1-3, ...],
 *  2: [Record2-1, Record2-2, Record2-3, ...],
 *  3: [Record3-1, Record3-2, Record3-3, ...]
 *  ...
 * }
 * 
 * isRecordBasedがfalseの場合は以下の形式に変換して格納します。
 * {
 *  0: [FieldName1, Record1-1, Record2-1, Record3-1, ...],
 *  1: [FieldName2, Record1-2, Record2-2, Record3-2, ...],
 *  2: [FieldName3, Record1-3, Record2-3, Record3-3, ...],
 *  ...
 * }
 * 
 * クラスのフィールド
 * isRecordBased: 変換形式
 * primaryKey: 主キー
 * csvObj: CSVデータ
 * 
 * メソッド
 * getValueByRecordIndex(String fieldName, Number recordIndex): String
 * getValueByPrimaryKey(String fieldName, String primaryKey): String
 * 
 * setValueByRecordIndex(String fieldName, Number recordIndex, String value): void
 * setValueByPrimaryKey(String fieldName, String primaryKey, String value): void
 * 
 * setPrimaryKey(String primaryKey): void
 * setIsRecordBased(Boolean isRecordBased): void
 * 
 * getRecordCount(): Number
 * getFieldCount(): Number
 * 
 * getCsvData(): String
 * 
 * formatRecordBased(String csvData): void
 * formatFieldBased(String csvData): void
 */

export class CsvDataContainer {
  /**
   * CSVデータを操作するクラス。
   * @param {String} csvData CSVデータ
   * @param {Boolean} isRecordBased 変換形式
   * @param {String} primaryKey 主キー
   */
  constructor(csvData, isRecordBased, primaryKey) {
  }

  /**
   * CSVデータをRecordをベースにした形式に変換します。
   * csvObj{
   *  0: [FieldName1, FieldName2, FieldName3, ...],
   *  1: [Record1-1, Record1-2, Record1-3, ...],
   *  2: [Record2-1, Record2-2, Record2-3, ...],
   *  3: [Record3-1, Record3-2, Record3-3, ...]
   *  ...
   * }
   * @param {String | undefined} csvData CSVデータ
   * @returns {CsvDataContainer} CSVデータをRecordをベースにした形式に変換したクラス
   */
  formatRecordBased(csvData = this.csvObj) {
    class CsvRecordBased extends CsvDataContainer {
      constructor(csvData, primaryKey) {
        super(csvData, true, primaryKey);
        this.csvObj = this.formatRecordBased(csvData);
      }

      formatRecordBased(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
          const data = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header] = data[index];
            return obj;
          }, {});
        });
      }
    }
    return new CsvRecordBased(csvData, primaryKey);
  }

  /**
   * CSVデータをFieldをベースにした形式に変換します。
   * csvObj{
   *  0: [FieldName1, Record1-1, Record2-1, Record3-1, ...],
   *  1: [FieldName2, Record1-2, Record2-2, Record3-2, ...],
   *  2: [FieldName3, Record1-3, Record2-3, Record3-3, ...],
   *  ...
   * }
   * @param {String} csvData CSVデータ
   */
  formatFieldBased(csvData) {
    
  }
}


