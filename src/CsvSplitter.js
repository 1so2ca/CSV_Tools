//--------------------------------
//CsvSplitter.js
//--------------------------------

(() => {
    'use strict'
    /**
     * @enum {String}
     */
    const SPACE_ID = Object.freeze({
        TARGET_ELEMENT_BUTTON: 'spTargetElement',
        TARGET_FIELD_BUTTON: 'spTargetField',
        SPLIT_BUTTON: 'spSplitButton',
    });

    /**
     * @enum {String}
     */
    const FIELD_CODE = Object.freeze({
        TARGET_ELEMENT_TABLE: '指定要素テーブル',
        TARGET_ELEMENT: '指定要素',
        TARGET_ELEMENT_OTHERNAME: '指定要素別名',
        TARGET_FIELD_TABLE: '探索フィールドテーブル', 
        TARGET_FIELD: '探索フィールド',
        TARGET_ELEMENT_TYPE_COUNT: 'ファイルに存在していい指定要素種類数',
        CHECKBOX_ENABLE_TARGET_SPLIT: '指定要素で分割機能を利用する',

        RECORD_MAX: 'ファイルにおけるレコードの最大数',
        CHECKBOX_ENABLE_RECORD_SPLIT: 'レコード数で分割機能を利用する',
    });

    /**
     * @enum {Number}
     */
    const READCSV_TYPE = Object.freeze({
        TARGET_ELEMENT: 0,
        BASE: 1,
    });

    const TARGET_ELEMENT_FIELD = Object.freeze({
        TARGET_ELEMENT: 0,
        TARGET_ELEMENT_OTHERNAME: 1,
        TARGET_ELEMENT_TYPE_COUNT: 2,
    });

    kintone.events.on('app.record.index.show', (event) => {
        const div = document.createElement('div');
        div.innerText = 'ツールを使用するにはレコード詳細画面もしくはレコード追加画面にアクセスしてください。';
        kintone.app.getHeaderMenuSpaceElement().appendChild(div);
    });

    const events = [
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.detail.show',
    ];

    let originalCsvDatas = [];
    let originalCsvNames = [];

    kintone.events.on(events, (event) => {
        const targetElementButton = createButton('spTargetElement', '指定要素', () => pressedButtonReadCSV(READCSV_TYPE.TARGET_ELEMENT));
        kintone.app.record.getSpaceElement(SPACE_ID.TARGET_ELEMENT_BUTTON).appendChild(targetElementButton);
        
        const readCsvButton = createButton('spReadCsvButton', 'CSV読み込み', () => pressedButtonReadCSV(READCSV_TYPE.BASE));
        kintone.app.record.getSpaceElement(SPACE_ID.SPLIT_BUTTON).appendChild(readCsvButton);

        const splitButton = createButton('spSplitButton', 'CSV分割', pressedButtonSplitCsv);
        kintone.app.record.getSpaceElement(SPACE_ID.SPLIT_BUTTON).appendChild(splitButton);

    });

    /**
     * ボタンを生成する
     * @param {String} id 
     * @param {String} text 
     * @param {Function} onclick 
     * @returns {HTMLButtonElement} button
     */
    function createButton(id, text, onclick) {
        const button = document.createElement('button');
        button.id = id;
        button.innerText = text;
        button.onclick = onclick;
        return button;
    }

    /**
     * CSV読み込みボタンが押された時の処理
     * @param {Number} readCsvType 
     */
    function pressedButtonReadCSV(readCsvType){
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.onchange = function () {
            const file = fileInput.files[0];
            originalCsvNames[readCsvType] = file.name;
            
            const reader = new FileReader();
            reader.onload = function () {
                originalCsvDatas[readCsvType] = reader.result;
                console.log(`${originalCsvNames[readCsvType]}を読み込みました。`);
            };
            reader.readAsText(file);
        };
        fileInput.click();
    }

    /**
     * CSV分割ボタンが押された時の処理
     */
    function pressedButtonSplitCsv(){
        const csvDatas = structuredClone(originalCsvDatas);
        const csvNames = structuredClone(originalCsvNames);
        const record = kintone.app.record.get();
        checkRequiredField(record, csvDatas);
        const baseCsvObj = csvToObject(csvDatas[READCSV_TYPE.BASE]);

        if(record['record'][FIELD_CODE.CHECKBOX_ENABLE_TARGET_SPLIT]['value'].length === 1){
            const targetElementCsvObj = csvToObject(csvDatas[READCSV_TYPE.TARGET_ELEMENT]);
            splitCsvByTargetElement(csvDatas, csvNames);
        }
        
        if(record['record'][FIELD_CODE.CHECKBOX_ENABLE_RECORD_SPLIT]['value'].length === 1){
            const recordMax = record['record'][FIELD_CODE.RECORD_MAX]['value'];
            splitCsvByRecordCount(csvDatas, csvNames);
        }
        
    }

    /**
     * 必須フィールド入力されているかチェック
     * @param {Object} record {record: {FIELD_CODE: {value: any}}}
     * @param {Array} csvDatas [String...]
     * @returns {Boolean}
     */
    function checkRequiredField(record, csvDatas){
        if(record['record'][FIELD_CODE.CHECKBOX_ENABLE_TARGET_SPLIT]['value'].length === 1){
            if(record['record'][FIELD_CODE.TARGET_ELEMENT_TABLE]['value'].length === 1
            && record['record'][FIELD_CODE.TARGET_ELEMENT_TABLE]['value'][0]['value'][FIELD_CODE.TARGET_ELEMENT]['value'] === undefined
            && csvDatas[READCSV_TYPE.TARGET_ELEMENT] === undefined){
                const text = `${FIELD_CODE.TARGET_ELEMENT}フィールドに値を入力するか、CSVを読み込んでください。`;
                alert(text);
                throw new Error(text);
            }
            
            return;
        }
        if(record['record'][FIELD_CODE.CHECKBOX_ENABLE_RECORD_SPLIT]['value'].length === 1){
            if(record['record'][FIELD_CODE.RECORD_MAX]['value'] === undefined
            && csvDatas[READCSV_TYPE.BASE] === undefined){
                const text = `${FIELD_CODE.RECORD_MAX}フィールドに値を入力するか、CSVを読み込んでください。`;
                alert(text);
                throw new Error(text);
            }
        }
        return true;
    }

    /**
     * CSVをObjectに変換する
     * @param {String} csv 
     * @returns {Object} csvObject {0: [String...], 1: [String...], ...}
     */
    function csvToObject(csv){
        const csvObject = {};
        const csvArray = csv.split('\n');
        for(let i=0; i<csvArray.length; i++){
            csvObject[i] = csvArray[i].split(',');
        }
        return csvObject;
    }

    /**
     * CSVObjectのフィールドを切り出し、一つのArrayに代入する
     * @param {Object} csvObj {0: [String...], 1: [String...], ...}
     * @param {Number} fieldNumber (省略可)
     * @returns {Array} csvArray [String...] 
     */
    function csvObjToArray(csvObj, fieldNumber = undefined){
        if(fieldNumber !== undefined){
            return Object.values(csvObj).reduce((acc, current) => {
                acc.push(current[fieldNumber]);
                return acc;
            })
        }

        return Object.values(csvObj).reduce((acc, current) => {
            acc.push(...current);
            return acc;
        })
    }

    /**
     * ファイルに存在していい指定要素種類数を超えないようにCSVを分割する
     * @param {Object} baseCsv {0: [String...], 1: [String...], ...}
     * @param {Object} targetCsv {0: [TARGET_ELEMENT, TARGET_ELEMENT_OTHERNAME, TARGET_ELEMENT_TYPE_COUNT], ...}
     * @returns {Array} splitCsv [csvObj...]
     */
    function splitCsvByTargetElement(baseCsv, targetCsv){
        const filteredCsv = filterTargetElement(baseCsv, targetCsv);

    }

    /**
     * baseCsvに存在する要素からtargetCsvに存在する要素のみを抽出する
     * @param {Object} baseCsv {0: [String...], 1: [String...], ...}
     * @param {Object} targetCsv {0: [TARGET_ELEMENT, TARGET_ELEMENT_OTHERNAME, TARGET_ELEMENT_TYPE_COUNT], ...}
     * @returns {Object} {0: [String...], 1: [String...], ...}
     */
    function filterTargetElement(baseCsv, targetCsv){

        // [targetElement1, targetElement2, ...]
        const targetElements = csvObjToArray(targetCsv, 0);

        //レコードの要素を指定要素のみに絞り込む
        const filteredBaseCsv = {};
        for(let i=0; i<baseCsv.length; i++){
            const record = baseCsv[i];
            const filteredRecord = record.filter((currentValue) => {
                return targetElements.includes(currentValue);
            });
            filteredBaseCsv[i] = filteredRecord;
        }

        return filteredBaseCsv;
    }

    /**
     * 
     * @param {Object} filteredBaseCsv {0: [String...], 1: [String...], ...}
     * @param {Object} targetCsv {0: [TARGET_ELEMENT, TARGET_ELEMENT_OTHERNAME, TARGET_ELEMENT_TYPE_COUNT], ...}
     */
    function countTargetElementByCsv(filteredBaseCsv, targetCsv){
        //countを0で初期化
        for(const targetElementData of Object.values(targetCsv)){
            targetElementData[TARGET_ELEMENT_FIELD.TARGET_ELEMENT_TYPE_COUNT] = 0;
        }

        //指定要素の数を数える
        for(const record of Object.values(filteredBaseCsv)){
            
        }
    }
})();