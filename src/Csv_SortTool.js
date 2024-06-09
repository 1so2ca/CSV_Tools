// ツール概要
// 2つのCSVで、フィールドの順番を一致させるよう並び替えます。

// 定義
// CSV1: 並び順の元となるCSVファイル
// CSV2: CSV1のフィールド順番を元に並び替えたいCSVファイル
// 無名フィールド: フィールド名が無いフィールド(フィールド名が0byteのフィールドということ)

// 使い方
// それぞれのCSV読み込みボタンを押下し、CSVファイルを読み込ませます。
// 「並び替え実行」ボタンを押すと並び替えられたCSVがお使いのPCにダウンロードされます。

// ダウンロードされるCSV
// (CSV2ファイル名)_Sorted_YYYYMMDDhhmmss.csv
// (CSV2ファイル名)_WarnField_YYYYMMDDhhmmss.csv

// ユースケース
// CSV1のフィールド項目がCSV2より多い
// 動作します。出力結果ではそれは無名フィールドとして表現されます。
// CSV2のフィールド項目がCSV1より多い
// 動作します。出力結果ではそれは最後尾に順不同で並び替えれれます。
// CSV1に無名フィールドが存在する
// 動作します。出力結果ではそれは要素の無い無名フィールドとして表現されます。
// CSV2に無名フィールドが存在する
// 動作します。出力結果ではそれは要素ごと削除されます。
// 単一のファイル内で重複するフィールドが存在する
// 動作しません。コンソールに重複フィールドが出力されるのみとなります。

// その他注意点
// フィールドの名称はCSV1, 2で完全一致していないと期待通りに動作しません。
// 単一のファイルでフィールドの名称に重複があってはいけません。
// ただし、例外として無名フィールドに関してはフィールド名の重複があっても動作します。
// CSV1に存在するもののCSV2に存在しないフィールドは、当ツールでは無名フィールドを挿入することで対処します。
// YYYYMMDDhhmmss_warnField.csvファイル内で、CSV1のどのフィールドが空白フィールドとして表現されたかが確認できます。
// CSV2に存在するもののCSV1に存在しないフィールドは、最後尾に順不同で入れ替えられます。
// YYYYMMDDhhmmss_warnField.csvファイル内で、CSV2のどのフィールドがCSV1に存在しなかったか確認できます。

// 理念
// CSV1にのみ存在するフィールドを無名フィールドとして表現する理由は、無名フィールド以外の順番を守るためです。
// CSV1のフィールド名を代入せず無名フィールドとして表現する理由はフィールドがCSV2に存在しなかったということを明確にするためです。

(function () {
    "use strict"

    /**
     * @enum {String}
     */
    const HTMLPARAMS = Object.freeze({
        ID_CSV1_BUTTON: 'csv1Button',
        ID_CSV2_BUTTON: 'csv2Button',
        ID_SORT_BUTTON: 'csvDiffButton',
        TEXT_CSV1_BUTTON: 'CSV1読み込み',
        TEXT_CSV2_BUTTON: 'CSV2読み込み',
        TEXT_SORT_BUTTON: 'CSV2ソート実行',
    });

    /**
     * @enum {String}
     */
    const SPACE_ID = Object.freeze({
        SORT_TOOL: 'spCsvSortTool',
        
    });

    /**
     * @enum {String | Number}
     */
    const SORTPARAMS = Object.freeze({
        
    });

    kintone.events.on('app.record.index.show', function (event) {
        const div = document.createElement('div');
        div.innerText = 'ツールを使用するには右側の+ボタンを押下し、レコード一覧画面に移動してください';
        kintone.app.getHeaderMenuSpaceElement().appendChild(div);
    });

    /**
     * pressedButtonReadCSV, pressedButtonSortCSV以外で使用しないこと。
     * @type {Array} [String...]
     */
    let originalCsvDatas = [];
    let originalCsvNames = [];

    //kintoneのレコード一覧画面にボタンを追加する
    kintone.events.on('app.record.create.show', function (event) {

        //CSV1読み込みボタン
        const csv1Button = createButton(HTMLPARAMS.ID_CSV1_BUTTON, HTMLPARAMS.TEXT_CSV1_BUTTON, () => pressedButtonReadCSV(0));
        kintone.app.record.getSpaceElement('spCsvSortTool').appendChild(csv1Button);

        //CSV2読み込みボタン
        const csv2Button = createButton(HTMLPARAMS.ID_CSV2_BUTTON, HTMLPARAMS.TEXT_CSV2_BUTTON, () => pressedButtonReadCSV(1));
        kintone.app.record.getSpaceElement('spCsvSortTool').appendChild(csv2Button);

        //CSV差分チェックボタン
        const csvDiffButton = createButton(HTMLPARAMS.ID_SORT_BUTTON, HTMLPARAMS.TEXT_SORT_BUTTON, pressedButtonSortCSV);
        kintone.app.record.getSpaceElement('spCsvSortTool').appendChild(csvDiffButton);

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
            };
            reader.readAsText(file);
        };
        fileInput.click();
    }

    /**
     * CSVソートボタンが押された時の処理
     */
    function pressedButtonSortCSV(){
        //CSVデータのディープコピーを生成
        const csvDatasCopy = structuredClone(originalCsvDatas);
        csvSortTool(csvDatasCopy);
    }

    /**
     * csvのソートを行い、ソート結果をダウンロードする。
     * @param {Array} csvDatas [String...] 
     * @returns {Object} diffResult {diffCsv: String, warnField: [String...], warnRecord: [String...]}
     */
    function csvSortTool(csvDatas){
        if(csvDatas.length !== 2){
            alert('CSVファイルを2つ読み込んでください');
            return;
        }
    
        const baseCsv = csvDatas[0];
        const targetCsvs = csvDatas.slice(1);
        const diffResult = sortCsv(baseCsv, targetCsvs[0]);
        downloadResult(diffResult);
        
    }

    /**
     * ユーザーに結果をダウンロードさせる。
     * @param {Object} diffResult {diffCsv: String, warnField: [String...], warnRecord: [String...]}
     */
    function downloadResult(diffResult){
        const diffCsvBlob = new Blob([diffResult.diffCsv], {type: 'text/csv'});
        const warnFieldBlob = new Blob([diffResult.warnField.join('\n')], {type: 'text/plain'});
    
        const diffCsvUrl = URL.createObjectURL(diffCsvBlob);
        const warnFieldUrl = URL.createObjectURL(warnFieldBlob);
    
        const timestamp = createNowTimestamp();

        //downloadFile(diffCsvUrl, `diffCsv_${timestamp}.csv`);
        //downloadFile(warnFieldUrl, `warnField_${timestamp}.txt`);
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
    //ソート処理

    /**
     * csvファイルの差分をチェックする
     * @param {String} baseCsv 
     * @param {String} targetCsv
     * @returns 
     */
    function sortCsv(baseCsv, targetCsv){
        const baseCsvFields = extractFieldFromCsv(baseCsv);
        const targetCsvObj = csvToObject(targetCsv);

        //フィールドの操作を行う。
        extractDuplicateField(baseCsvFields, 0);
        extractDuplicateField(targetCsvObj, 1);
        sortFieldsByBaseCsv(, targetCsvObj);

        const diffResult = {
            diffCsv: '',
            warnField: [],
            warnRecord: [],
        };
        return diffResult;
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
         * CopilotChatすご～い。おれにはつくれん。
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
     * CSVからフィールドを抽出する
     * @param {String} csv 
     * @returns {Array} fields [field...]
     */
    function extractFieldFromCsv(csv){
        const csvArray = csv.split('\n');
        const fields = csvArray[0].split(',');
        return fields;
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
            for(const column of csv){
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

    /**
     * フィールドの並べ替えを行う。基準となるCSVのフィールド順に合わせる。
     * @param {Object} baseCsvObj {Number: [String...]}
     * @param {Object} targetCsvObj {Number: [String...]}
     * @returns {Object} targetCsvObj {Number: [String...]}
     */
    function sortFieldsByBaseCsv(baseCsvObj, targetCsvObj){
        const baseFields = baseCsvObj[0];
        const targetFields = targetCsvObj[0]; 
        switchRowColumn(targetCsvObj);
    }

    /**
     * csvObjのrowとcolumnを入れ替える。
     * @param {Object} csvObj {Number: [String...]}
     * @returns {Object} csvObj {Number: [String...]}
     */
    function switchRowColumn(csvObj){
        console.log(csvObj);
        const newCsvObj = {};
        //空配列を生成
        for(let i=0; i<csvObj[0].length; i++){
            newCsvObj[i] = [];
        }

        for(let i=0; i<csvObj[0].length; i++){
            for(let j=0; j<Object.keys(csvObj).length; j++){
                newCsvObj[i].push(csvObj[j][i]);
            }
        }


        console.log(newCsvObj);
        return newCsvObj;
    }

    /**
     * 主キーが重複しているレコードを抽出する
     */
    function extractDuplicateRecord(){
        //TODO
    }
})();