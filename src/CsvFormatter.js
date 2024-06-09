//CSVフォーマットツール

(function () {
    //evalを使用するため厳格モードでの実行を行わない。危険。真似しないこと。
    //当コードにはバッドプラクティスが多数含まれている。:P
    //"use strict"

    /**
     * @enum {String}
     */
    const HTMLPARAMS = Object.freeze({
        ID_CSV1_BUTTON: 'csvButton',
        ID_FORMAT_BUTTON: 'csvFormatButton',
        TEXT_CSV1_BUTTON: 'CSV読み込み',
        TEXT_FORMAT_BUTTON: 'CSV整形実行',
    });

    /**
     * @enum {String}
     */
    const SPACE_ID = Object.freeze({
        FORMAT_TOOL: 'spCsvFormatter',
        
    });

    const FIELD_CODE = Object.freeze({
        FIELD_NAME: 'フィールド名',
        FORMAT_RULE: '整形ルール',
        FORMAT_TABLE: '整形ルールテーブル',

    });

    kintone.events.on('app.record.index.show', function (event) {
        const div = document.createElement('div');
        div.innerText = 'ツールを使用するにはレコード詳細画面もしくはレコード追加画面にアクセスしてください。';
        kintone.app.getHeaderMenuSpaceElement().appendChild(div);
    });

    /**
     * pressedButtonReadCSV, pressedButtonSortCSV以外で使用しないこと。
     * @type {Array} [String...]
     */
    let originalCsvDatas = [];
    let originalCsvNames = [];

    const events = [
        'app.record.create.show',
        'app.record.edit.show',
        'app.record.detail.show',
    ]

    //kintoneのレコード一覧画面にボタンを追加する
    kintone.events.on(events, function (event) {

        //CSV1読み込みボタン
        const csv1Button = createButton(HTMLPARAMS.ID_CSV1_BUTTON, HTMLPARAMS.TEXT_CSV1_BUTTON, () => pressedButtonReadCSV(0));
        kintone.app.record.getSpaceElement(SPACE_ID.FORMAT_TOOL).appendChild(csv1Button);

        //CSV差分チェックボタン
        const csvDiffButton = createButton(HTMLPARAMS.ID_FORMAT_BUTTON, HTMLPARAMS.TEXT_FORMAT_BUTTON, pressedButtonFormatCSV);
        kintone.app.record.getSpaceElement(SPACE_ID.FORMAT_TOOL).appendChild(csvDiffButton);

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

    /**
     * CSV読み込みボタンが押された時の処理
     * @param {Number} csvNum 
     */
    function pressedButtonReadCSV(csvNum) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.onchange = function () {
            const file = fileInput.files[0];
            originalCsvNames[csvNum] = file.name;
            
            const reader = new FileReader();
            reader.onload = function () {
                originalCsvDatas[csvNum] = reader.result;
                console.log(`${originalCsvNames[csvNum]}を読み込みました。`);
            };
            reader.readAsText(file);
        };
        fileInput.click();
        
    }

    /**
     * CSVフォーマットボタンが押された時の処理
     */
    function pressedButtonFormatCSV(){
        //CSVデータのディープコピーを生成
        const csvDatasCopy = structuredClone(originalCsvDatas);
        csvFormatTool(csvDatasCopy);
    }

    /**
     * csvのフォーマットを行う。
     * @param {Array} csvDatas [String...] 
     * @returns {Object} diffResult {diffCsv: String, warnField: [String...], warnRecord: [String...]}
     */
    function csvFormatTool(csvDatas){
        if(csvDatas.length !== 1){
            alert('CSVファイルを読み込んでください');
            return;
        }
        
        console.log(`${originalCsvNames[0]}の整形を開始します。`);
        const baseCsv = csvDatas[0];
        const targetCsvs = csvDatas.slice(1);
        const formatResult = formatCsv(baseCsv, targetCsvs[0]);
        console.log(`${originalCsvNames[0]}の整形が完了しました。整形済みCSVファイルをダウンロードします。`);
        resultDownload(formatResult);
    }

    /**
     * ユーザーに結果をダウンロードさせる。
     * @param {Object} formatResult {formattedCsv: Object}
     */
    function resultDownload(formatResult){
        const diffCsvBlob = new Blob([formatResult.formattedCsv], {type: 'text/csv'});
        const diffCsvUrl = URL.createObjectURL(diffCsvBlob);
        const timestamp = createNowTimestamp();

        downloadFile(diffCsvUrl, `${originalCsvNames[0]}_formatted_${timestamp}.csv`);
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
    
    function downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    //----------------------------------------
    //フォーマット処理

    /**
     * csvファイルを指定のルールに従ってフォーマットする。
     * @param {String} targetCsv
     * @returns {Object} {formattedCsv: Object}
     */
    function formatCsv(targetCsv){
        const targetCsvObj = csvToObject(targetCsv);
        //extractDuplicateField(targetCsvObj, 0);

        const resultCsvObj = executeFormat(targetCsvObj);
        const resultCsv = objectToCsv(resultCsvObj);

        const formatResult = {
            formattedCsv: resultCsv,
        };
        
        return formatResult;
    }

    /**
     * フォーマットルールに従ってフォーマットを実行する。
     * バッドプラクティスを多数含む。
     * @param {Object} targetCsvObj {Number: [String...]} 
     * @returns {Object} {Number: [String...]}
     */
    function executeFormat(targetCsvObj){
        const ruleParams = kintone.app.record.get()['record'][FIELD_CODE.FORMAT_TABLE]['value'];
        for(const rule of ruleParams){
            const fieldName = rule['value'][FIELD_CODE.FIELD_NAME]['value'];
            const formatRule = rule['value'][FIELD_CODE.FORMAT_RULE]['value'];
            
            for(let i=0; i<Object.keys(targetCsvObj).length; i++){
                if(targetCsvObj[i][0] !== fieldName)continue;
                const column = targetCsvObj[i].slice(1);
                const formattedColumn = column.map((value, index, array) => {
                    return eval(formatRule);
                });

                //整形後のフィールドで置き換え
                targetCsvObj[i] = [fieldName, ...formattedColumn];
                console.log(`${fieldName}の整形が完了しました。`)
            }
        }
        return targetCsvObj;
    }

    /**
     * CSVをObjectに変換する。keyはフィールドの順番を示す。
     * @param {String} csvStr 
     * @returns {Object} csvObj {Number: [String...]}
     */
    function csvToObject(csvStr) {
        /**
         * 以下の形となる。
         * csvObj{
         *  0: [フィールド名, レコード1, レコード2, ...],
         *  1: [フィールド名, レコード1, レコード2, ...],
         *  ...
         * }
         */
        // CSVを行ごとに分割
        const csvArray = csvStr.split('\n').map(row => row.split(','));
    
        // 2次元配列を転置
        const transposed = csvArray[0].map((_, i) => csvArray.map(row => row[i]));
    
        // 転置した配列をオブジェクトに変換
        const csvObj = Object.fromEntries(transposed.entries());
        
        return csvObj;
    }

    /**
     * ObjectをCSVに変換する。
     * @param {Object} csvObj 
     * @returns {String} csvStr
     */
    function objectToCsv(csvObj) {
        let csvContent = [];
        
        for (let key in csvObj) {
            let row = csvObj[key];
            csvContent.push(row);
        }
        const transposed = csvContent[0].map((_, i) => csvContent.map(row => row[i]));
        const csvStr = transposed.map(row => row.join(",")).join("\n");
    
        return csvStr;
    }

    /**
     * 重複フィールドを抽出する。重複フィールドがある場合はErrorをthrowする。
     * @param {Object | Array} csv {Number: [field, record...]} | [field...]
     * @param {Number} csvNum Errorメッセージに使用するための引数
     */
    function extractDuplicateField(csv, csvNum){
        //引数がObjectの場合は整形しやすいようにArrayに変換する
        const fields = [];
        if(csv instanceof Object){
            for(const column of Object.entries(csv)){
                fields.push(column[0]);
            }
        }
        else if(csv instanceof Array){
            fields = csv;
        }
        
        //重複フィールドの抽出のためにSetを使用する
        //Setに追加する際に重複があった場合は追加されないため、重複フィールドを間接的に抽出できる。
        const duplecateFields = [];
        const dummySet = new Set();
        for(const field of fields){
            const setSize = dummySet.size;
            dummySet.add(field);
            if(setSize === dummySet.size){
                duplecateFields.push(field);
            }
        }

        if(duplecateFields.length > 0){
            console.error(`${originalCsvNames[csvNum]}: 重複フィールドが存在します。`, duplecateFields);
            throw new duplecateFieldsError(`重複フィールドを削除してください。`);
        }
    }

    /**
     * 重複フィールドが存在する場合にthrowするError
     */
    class duplecateFieldsError extends Error{
        constructor(message){
            super(message);
            this.name = 'duplecateFieldsError';
        }
    }
})();