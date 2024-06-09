/**
 * CSVを操作するクラス。
 * CsvDataContainer
 * 
 * CsvDataContainer(String csvData, String | undefined primaryKey)
 * csvDataをCSVデータと解釈し、パースしてObjectに変換します。
 * 
 * クラスのフィールド
 * #primaryKey: 主キー
 * #csvObj: CSVデータ
 * 
 * ================================
 * private method
 * ================================
 * #convertCsvToObj(String csvData): Array[{record1}, {record2}, ...]
 * #convertObjToCsv(Array[{record1}, {record2}, ...]): String
 * 
 * ================================
 * public method
 * ================================
 * addRecord(Object record): void
 * 
 * --------------------------------
 * deleteRecordByPrimaryKey(String primaryKey): void
 * deleteRecordByRecordIndex(Number recordIndex): void
 * 
 * deleteMultipleRecordsByPrimaryKey(String primaryKey...): void
 * deleteMultipleRecordsByRecordIndex(Number recordIndex...): void
 * 
 * --------------------------------
 * searchDuplicatePrimaryKey(): Array[String]
 * searchDuplicateValueByFieldName(String fieldName): Array[String]
 * searchDuplicateValue(String fieldName, String value): Array[String]
 * 
 * --------------------------------
 * checkDuplicatePrimaryKey(): Boolean
 * checkDuplicateValueByFieldName(String fieldName): Boolean
 * checkDuplicateValue(String fieldName, String value): Boolean
 * 
 * --------------------------------
 * 正規表現を使用して判定する。
 * checkIllegalValueByFieldName(String fieldName, String legalValue): Boolean
 * checkIllegalValue(String fieldName, String value, String legalValue): Boolean
 * 
 * --------------------------------
 * getRecordCount(): Number
 * getFieldCount(): Number
 * 
 * --------------------------------
 * getCsvObj(): Object
 * getCsvData(): String
 * 
 * ------------------------------
 * getRecordByPrimaryKey(String primaryKey): Object
 * getRecordByRecordIndex(Number recordIndex): Object
 * getValueByFieldName(String fieldName): Array[String]
 * 
 * getMultipleRecordsByPrimaryKey(String primaryKey...): Array[{Object}, {Object}, ...]
 * getMultipleRecordsByRecordIndex(Number recordIndex...): Array[{Object}, {Object}, ...]
 * getMultipleValuesByFieldName(String fieldName...): Array[Array[String], Array[String], ...]
 * 
 * --------------------------------
 * getValueByRecordIndex(String fieldName, Number recordIndex): String
 * getValueByPrimaryKey(String fieldName, String primaryKey): String
 * 
 * --------------------------------
 * setValueByRecordIndex(String fieldName, Number recordIndex, String value): void
 * setValueByPrimaryKey(String fieldName, String primaryKey, String value): void
 * 
 * --------------------------------
 * setPrimaryKey(String primaryKey): void
 */
/**
 * レコードを参照するメソッドは一つのメソッドではなく主キーとレコード番号に分かれている。
 * もし一つのメソッドで実装しようとすると引数で主キーorレコード番号を判断することになるが、それを判断するために条件分岐の実装が必要である。
 * もしそう実装した場合、膨大な量のレコード参照を行う際毎回条件分岐が走ることになり、パフォーマンスに支障が出る。
 */

export class CsvDataContainer {
  /**
   * @type {String}
   */
  #primaryKey;
  /**
   * @type {Object}
   */
  #csvObj;

  /**
   * CSVデータを操作するクラス。
   * @param {String} csvData CSVデータ
   * @param {String | undefined} primaryKey 主キー
   */
  constructor(csvData, primaryKey) {
    this.#primaryKey = primaryKey;
    this.#csvObj = this.#convertCsvToObj(csvData);
  }

  /**
   * CSVをObjectに変換する
   * @param {String} csvData
   * @returns {Array[{record1}, {record2}, ...]} csvObj
   */
  #convertCsvToObj(csvData) {
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

  /**
   * ObjectをCSVに変換する
   * @param {Array[{record1}, {record2}, ...]} csvObj 
   * @returns {String} CSVデータ
   */
  #convertObjToCsv(csvObj) {
    const headers = Object.keys(csvObj[0]);
    const lines = csvObj.map(record => headers.map(header => record[header]).join(','));
    return `${headers.join(',')}\n${lines.join('\n')}`;
  }

  /**
   * レコードを追加する
   * @param {Object} record
   */
  addRecord(record) {
    if(record[this.#primaryKey] === undefined) {
      throw new Error(`主キー${this.#primaryKey}が設定されていないレコードは追加できません。`);
    }
    this.#csvObj.push(record);
  }

  //getter
  /**
   * レコードの値を取得する(レコード番号で取得)
   * @param {String} fieldName フィールド名
   * @param {Number} recordIndex レコード番号
   * @returns {String} レコードの値
   */
  getValueByRecordIndex(fieldName, recordIndex) {
    return this.#csvObj[recordIndex][fieldName];
  }

  /**
   * レコードの値を取得する(主キーで取得)
   * @param {String} fieldName フィールド名
   * @param {String} primaryKey 主キー
   * @returns {String} レコードの値
   */
  getValueByPrimaryKey(fieldName, primaryKey) {
    return this.#csvObj.find(record => record[this.#primaryKey] === primaryKey)[fieldName];
  }

  /**
   * レコード総数を取得する
   * @returns {Number} レコード総数
   */
  getRecordCount() {
    return this.#csvObj.length;
  }

  /**
   * フィールド総数を取得する
   * @returns {Number} フィールド総数
   */
  getFieldCount() {
    return Object.keys(this.#csvObj[0]).length;
  }

  /**
   * csvObjを取得する
   * @returns {Object} csvObj
   */
  getCsvObj() {
    return this.#csvObj;
  }

  /**
   * CSVデータを取得する
   * @returns {String} CSVデータ
   */
  getCsvData() {
    return this.#convertObjToCsv(this.#csvObj);
  }

  /**
   * レコードを取得する(主キーで取得)
   * @param {String} primaryKey 主キー
   * @returns {Object} レコード
   */
  getRecordByPrimaryKey(primaryKey) {
    return this.#csvObj.find(record => record[this.#primaryKey] === primaryKey);
  }

  /**
   * レコードを取得する(レコード番号で取得)
   * @param {Number} recordIndex レコード番号
   * @returns {Object} レコード
   */
  getRecordByRecordIndex(recordIndex) {
    return this.#csvObj[recordIndex];
  }

  /**
   * フィールドの値を取得する
   * @param {String} fieldName フィールド名
   * @returns {Array[String]} フィールドの値
   */
  getValueByFieldName(fieldName) {
    return this.#csvObj.map(record => record[fieldName]);
  }

  //setter
  /**
   * レコードの値を設定する(レコード番号で設定)
   * @param {String} fieldName フィールド名
   * @param {Number} recordIndex レコード番号
   * @param {String} value レコードの値
   */
  setValueByRecordIndex(fieldName, recordIndex, value) {
    this.#csvObj[recordIndex][fieldName] = value;
  }

  /**
   * レコードの値を設定する(主キーで設定)
   * @param {String} fieldName フィールド名
   * @param {String} primaryKey 主キー
   * @param {String} value レコードの値
   */
  setValueByPrimaryKey(fieldName, primaryKey, value) {
    this.#csvObj.find(record => record[this.#primaryKey] === primaryKey)[fieldName] = value;
  }

  /**
   * 主キーを設定する
   * @param {String} primaryKey 主キー
   */
  setPrimaryKey(primaryKey) {
    this.#primaryKey = primaryKey;
  }

  /**
   * レコードを削除する(主キーで削除)
   * @param {String} primaryKey 主キー
   */
  deleteRecordByPrimaryKey(primaryKey) {
    this.#csvObj = this.#csvObj.filter(record => record[this.#primaryKey] !== primaryKey);
  }

  /**
   * レコードを削除する()
   * @param {Number} recordIndex レコード番号
   */
  deleteRecordByRecordIndex(recordIndex) {
    this.#csvObj.splice(recordIndex, 1);
  }
}


