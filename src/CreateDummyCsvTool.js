//--------------------------------
//CreateDummyCsvTool.js
//--------------------------------

(() => {
    'use strict'
    /**
     * @enum {string} SPACE_ID
     */
    const SPACE_ID = Object.freeze({
        CREATE_CSV_BUTTON: 'createCsvButton',
    });

    /**
     * @enum {string} FIELD_CODE
     */
    const FIELD_CODE = Object.freeze({
        TABLE_FIELD_NAME: 'フィールド名',
        RECORD_COUNT: 'レコード数',
        TABLE: 'フィールド一覧',
        DUMMY_CSV_NAME: 'CSVの名前',
    })

    kintone.events.on('app.record.index.show', (event) => {
        const div = document.createElement('div');
        div.innerText = 'ツールを使用するにはレコード詳細画面もしくはレコード追加画面にアクセスしてください。';
        kintone.app.getHeaderMenuSpaceElement().appendChild(div);
    });

    //kintoneよりデータを取得する
    const events = [
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.detail.show',
    ];

    kintone.events.on(events, (event) => {
        const createCsvButton = createButton('createCsvButton', 'ダミーCSV作成', pressedButtonCreateDummyCsv);
        kintone.app.record.getSpaceElement(SPACE_ID.CREATE_CSV_BUTTON).appendChild(createCsvButton);

    });

    /**
     * ボタンを生成する。
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
    
    function pressedButtonCreateDummyCsv(){
        if(kintone.app.record.get()['record'][FIELD_CODE.RECORD_COUNT]['value'] === undefined){
            alert('レコード数を入力してください。');
            return;
        }
        if(kintone.app.record.get()['record'][FIELD_CODE.TABLE]['value'].length === 1
        && kintone.app.record.get()['record'][FIELD_CODE.TABLE]['value'][0]['value'][FIELD_CODE.TABLE_FIELD_NAME]['value'] === undefined){  
            alert('フィールド一覧にフィールド名を入力してください。');
            return;
        }

        csvData = createDummyCsv();
        downloadCsv(csvData);
    }

    /**
     * ダミーCSVを作成する
     * @returns {Object} csvData
     */
    function createDummyCsv(){
        const recordCountStr = kintone.app.record.get()['record'][FIELD_CODE.RECORD_COUNT]['value'];
        const recordCount = Number(recordCountStr);
        const addFields = getTableValueArray(FIELD_CODE.TABLE);
        return createCsvData(recordCount, addFields);
    }

    /**
     * テーブルの内フィールドの値を取得する
     * @param {String} tableField 
     */
    function getTableValueArray(tableField){
        const tableArray = kintone.app.record.get()['record'][tableField].value;
        const tableValues = [];
        for(const tableArrayValue of tableArray){
            const innerValue = tableArrayValue['value'][FIELD_CODE.TABLE_FIELD_NAME]['value'];
            tableValues.push(innerValue);
        }
        return tableValues;
    }

    /**
     * CSVを生成する
     * @param {Number} recordCount 
     * @param {Array} addFields [String...]
     * @returns 
     */
    function createCsvData(recordCount, addFields){
        const csvData = {
            0: addFields,
        };
        for(let i=1; i<recordCount+1; i++){
            const record = addFields.map((currentValue) => {
                return `${currentValue} : ${i}`;
            })
            csvData[i] = record;
        }
        return csvData;
    }

    /**
     * 生成したCSVをダウンロードする
     * @param {Object} csvObj 
     */
    function downloadCsv(csvObj){
        const csv = convertToCsv(csvObj);
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csv], {type: 'text/csv'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = createNowTimestamp();
        const csvName = kintone.app.record.get()['record'][FIELD_CODE.DUMMY_CSV_NAME]['value'];
        a.download = `${csvName}_${timestamp}.csv`;
        a.href = url;
        a.click();
        a.remove();
    }

    /**
     * タイムスタンプを生成する
     * @returns {String} YYYYMMDDhhmmss
     */    
    function createNowTimestamp(){
        const now = new Date();
        const year = now.getFullYear();
        const month = (`0${now.getMonth() + 1}`).slice(-2);
        const date = (`0${now.getDate()}`).slice(-2);
        const hours = (`0${now.getHours()}`).slice(-2);
        const minutes = (`0${now.getMinutes()}`).slice(-2);
        const seconds = (`0${now.getSeconds()}`).slice(-2);
        return `${year}${month}${date}${hours}${minutes}${seconds}`;
    }

    /**
     * ObjectをCSVに変換する
     * @param {Object} csvObj 
     * @returns {String}
     */
    function convertToCsv(csvObj) {
        let csvContent = [];
        
        const csv = Object.values(csvObj).reduce((acc, value) => {
            const row = value.join(',');
            return acc.concat(row, '\n');
        }, '');

        return csv;
    }
})() 
