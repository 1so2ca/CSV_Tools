// ## なにこれ
// - ２つのCSVの相違点をチェックするツール

// ## 前提
// - ２つのCSVのフィールドの「名称」: 完全一致していないといけない
// - ２つのCSVのフィールドの「順番」: 一致していなくても良い
// - ２つのCSVのフィールドの「総数」: 一致していなくても良い 
// - ２つのCSVのレコードの「総数」: 一致していなくても良い 
// - ２つのCSVのレコードの「順番」: 一致していなくても良い
// - ２つのCSVのレコードの「主キー」: すべてのレコードに必ず存在していないといけない、存在していない場合はエラー。
// - ２つのCSVのレコードの「主キーの値」: 完全一致していないといけない

// - 主キーフィールドの数: 一つでないといけない。(将来的に２つ以上のフィールドを組み合わせてそれを主キーとして設定できるようにするかも？)
// - 主キーの値: 同じファイルで重複があっても動作はする。
// 	- ただし、重複している主キーと紐付いたレコードに対しては相違点のチェックを行わず、「この主キーのレコードが重複していた」という出力のみを返すものとする
// 		- つまり、正しく相違点をチェックするためには同じファイルで主キーの重複があってはならない。
// - フィールドの値: 同じファイルで重複があった場合動作しない
// 	- 「このフィールドが重複している」という出力結果のみを返す。

// - CSVの1行目のみをフィールドとして扱い、2行目以降はすべてレコードとして扱う。
// - CSVの1列目を主キーとして扱う。
// ## 使い方
// kintoneにコードファイルをJSファイルとして読み込む
// レコード一覧画面上部に「CSV1読み込み」「CSV2読み込み」ボタンが出てくるのでそれを押し、比較したいCSVを読み込ませる。
// divとコンソールに相違点が出力され、相違点CSVダウンロードボタンが表示される。

// ## オプション
// - 相違点があったレコードのみ抽出して出力することもできる

// ## 注意点
// - 当ツールのレコードの順番はCSV1に合わせるものとする
// 	- 

// ## 出力結果サンプル
// ### CSV1
// csv_1.csv

// | PK  | FA    | FB   | FC   | FX   |
// | --- | ----- | ---- | ---- | ---- |
// | 1   | FA1   | FB1  | FC1  |      |
// | 2   | FA2   |      | FC2  | FX2  |
// | 3   | FA3   | FB3  |      | FX3  |
// | 10  | FA10  | FB10 | FC10 | FX10 |
// | 10  | FA100 | FB10 | FC10 | FX10 |
// | 11  | FA11  | FB11 | FC11 | FX11 |
// | 20  | FA20  | FB20 | FC20 | FX20 |
// | 30  | FA30  | FB30 | FC30 | FX30 |
// | 30  | FA300 | FB30 | FC30 | FX30 |

// ### CSV2
// csv_2.csv

// | PK  | FC  | FA    | FB    | FY   |
// | --- | --- | ----- | ----- | ---- |
// | 2   |     | FA2   | ABC   | FY2  |
// | 1   |     | FA1   | FB1   | FY1  |
// | 3   | FC2 | FA3   | FB333 | FY3  |
// | 10  |     | FA100 | FB10  | FY10 |
// | 11  |     | FA11  | FB11  | FY11 |
// | 11  |     | FA11  | FB11  | FY11 |
// | 21  |     | FA21  | FB21  | FY21 |
// | 31  |     | FA31  | FB31  | FY31 |
// | 31  |     | FA31  | FB31  | FY31 |

// ### 出力 
// #### 202401230123_diff.csv

// | PK  | FA  | FB         | FC    |
// | --- | --- | ---------- | ----- |
// | 1   |     |            | FC1<> |
// | 2   |     | <>ABC      |       |
// | 3   |     | FB3<>FB333 |       |

// #### 20240123012345_WarnField.txt
// 以下のフィールドはcsv_1.csvにのみ存在したため、相違点チェックを行いませんでした。
// FX 
//
// 以下のフィールドはcsv_2.csvにのみ存在したため、相違点チェックを行いませんでした。
// FY

// #### 20240123012345_WarnRecord.txt 
// 以下の主キーの値がcsv_1.csvにおいて重複したため、該当するレコードに対し相違点チェックを行いませんでした。
// 10
// 30
//
// 以下の主キーの値がcsv_2.csvにおいて重複したため、該当するレコードに対し相違点チェックを行いませんでした。
// 11
// 31
//
// 以下の主キーの値がcsv_1.csvにしか存在しなかったため、該当するレコードに対し相違点チェックを行いませんでした。
// 20
// 30
//
// 以下の主キーの値がcsv_2.csvにしか存在しなかったため、該当するレコードに対し相違点チェックを行いませんでした。
// 21
// 31

// ### 解説
// 以下3つのファイルが自動でダウンロードされる。
// YYYYMMDDhhmmss_diff.csv 
// YYYYMMDDhhmmss_WarnField.txt 
// YYYYMMDDhhmmss_WarnRecord.txt

// #### YYYYMMDDhhmmss_diff.csv 
// どのフィールドのどのレコードにて差があるかを示したcsvファイル。

// - 相違点がある値以外はすべて空欄となる。
// - レコードの順番はCSV1と同一のものとなる。
// - 相違点は"CSV1の値"<>"CSV2の値"という形で出力される。
// - CSV1、CSV2のいずれかにおいて主キーの重複があるレコードは相違点チェックを行わない。
// 	- そのため、主キーの重複がある場合元データとレコードの総数が合わなくなる。
// - CSV1、CSV2のいずれかにおいてフィールド名の重複があるフィールドは相違点チェックを行わない。
// 	- そのため、フィールド名の重複がある場合元データとフィールドの総数が合わなくなる。

// #### YYYYMMDDhhmmss_WarnField.txt 
// フィールドについての注意点を示したファイル。

// 一方のファイルにしか存在しないフィールドが存在すること、そしてそのフィールドに対して相違点チェックを行っていないことを注意文として示すファイルとなっている。

// （フィールド名の重複があった場合、そもそもファイル単位で相違点チェックを行わずにエラーを吐くためフィールド名の重複についてはここでは記述されない）

// #### YYYYMMDDhhmmss_WarnRecord.txt 
// レコードについての注意点を示したファイル。

// 以下の状態のレコードが存在したため、それらに対して相違点チェックを行っていないことを注意文として示すファイルとなっている。
// - 一つのファイルで主キーが重複している
// - 一方のファイルにしか存在しない主キーのレコードが存在する。

//----------------------------------------
//CSV_Diff_CheckTool.js
//----------------------------------------

(function () {
    "use strict"

    /**
     * @enum {String}
     */
    const HTMLPARAMS = Object.freeze({
        ID_CSV1_BUTTON: 'csv1Button',
        ID_CSV2_BUTTON: 'csv2Button',
        ID_DIFF_BUTTON: 'csvDiffButton',
        TEXT_CSV1_BUTTON: 'CSV1読み込み',
        TEXT_CSV2_BUTTON: 'CSV2読み込み',
        TEXT_DIFF_BUTTON: 'CSV差分チェック',

    });

    /**
     * @enum {String | Number}
     */
    const DIFFPARAMS = Object.freeze({
        PRIMARY_KEY_NUMBER: 0,
        OUTPUT_DIFF_DELIMITER: '<>',
        
    });

    //OriginalCsvDatasはpressedButtonReadCSVとpressedButtonReadCSV以外で使用しないこと。
    let OriginalCsvDatas = [];

    //kintoneのレコード一覧画面にボタンを追加する
    kintone.events.on('app.record.index.show', function (event) {
        //CSV1読み込みボタン
        const csv1Button = createButton(HTMLPARAMS.ID_CSV1_BUTTON, HTMLPARAMS.TEXT_CSV1_BUTTON, () => pressedButtonReadCSV(0));
        kintone.app.getHeaderMenuSpaceElement().appendChild(csv1Button);

        //CSV2読み込みボタン
        const csv2Button = createButton(HTMLPARAMS.ID_CSV2_BUTTON, HTMLPARAMS.TEXT_CSV2_BUTTON, () => pressedButtonReadCSV(1));
        kintone.app.getHeaderMenuSpaceElement().appendChild(csv2Button);

        //CSV差分チェックボタン
        const csvDiffButton = createButton(HTMLPARAMS.ID_DIFF_BUTTON, HTMLPARAMS.TEXT_DIFF_BUTTON, pressedButtonDiffCSV);
        kintone.app.getHeaderMenuSpaceElement().appendChild(csvDiffButton);
    });

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
            const reader = new FileReader();
            reader.onload = function () {
                OriginalCsvDatas[csvNum] = reader.result;
            };
            reader.readAsText(file);
        };
        fileInput.click();
    }

    /**
     * CSV差分チェックボタンが押された時の処理
     */
    function pressedButtonDiffCSV(){
        //CSVデータのディープコピーを生成
        const csvDatasCopy = structuredClone(OriginalCsvDatas);
        csvDiffChecker(csvDatasCopy);
    }

    /**
     * csvの差分チェックを行い、その結果をダウンロードする。
     * @param {Array} csvDatas [String...] 
     * @returns {Object} diffResult {diffCsv: String, warnField: [String...], warnRecord: [String...]}
     */
    function csvDiffChecker(csvDatas){
        if(csvDatas.length !== 2){
            alert('CSVファイルを2つ読み込んでください');
            return;
        }
        const baseCsv = csvDatas[0];
        const targetCsvs = csvDatas.slice(1);
        const diffResult = diffCsv(baseCsv, targetCsvs[0]);
        downloadResult(diffResult);
    }

    /**
     * ユーザーに結果をダウンロードさせる。
     * @param {Object} diffResult {diffCsv: String, warnField: [String...], warnRecord: [String...]}
     */
    function downloadResult(diffResult){
        const diffCsvBlob = new Blob([diffResult.diffCsv], {type: 'text/csv'});
        const warnFieldBlob = new Blob([diffResult.warnField.join('\n')], {type: 'text/plain'});
        const warnRecordBlob = new Blob([diffResult.warnRecord.join('\n')], {type: 'text/plain'});
    
        const diffCsvUrl = URL.createObjectURL(diffCsvBlob);
        const warnFieldUrl = URL.createObjectURL(warnFieldBlob);
        const warnRecordUrl = URL.createObjectURL(warnRecordBlob);
    
        const timestamp = createNowTimestamp();

        //downloadFile(diffCsvUrl, `diffCsv_${timestamp}.csv`);
        // downloadFile(warnFieldUrl, `warnField_${timestamp}.txt`);
        // downloadFile(warnRecordUrl, `warnRecord_${timestamp}.txt`);
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
    //差分チェック処理

    /**
     * csvファイルの差分をチェックする
     * @param {String} baseCsv 
     * @param {String} targetCsv
     * @returns 
     */
    function diffCsv(baseCsv, targetCsv){
        //const primaryKeyFieldName = baseCsv.split('\n')[0].split(',')[DIFFPARAMS.PRIMARY_KEY_NUMBER];
        const baseCsvObj = csvToObject(baseCsv);
        const targetCsvObj = csvToObject(targetCsv);

        //フィールドの操作を行う。
        extractDuplicateField(baseCsvObj);
        extractDuplicateField(targetCsvObj);
        sortFieldsByBaseCsv(baseCsvObj, targetCsvObj);

        const diffResult = {
            diffCsv: '',
            warnField: [],
            warnRecord: [],
        };
        return diffResult;
    }

    /**
     * CSVをObjectに変換する。keyはレコードの順番とする。要素は主キーを含めた配列とする。
     * @param {String} csv 
     * @returns {Object} csvObj {Number: [String...]}
     */
    function csvToObject(csv){
        const csvArray = csv.split('\n');
        const csvObj = {};
        let i = 0;
        for(const line of csvArray){
            const lineArray = line.split(',');
            csvObj[i] = lineArray;
            i++;
        }
        return csvObj;
    }

    /**
     * 重複フィールドを抽出する。重複フィールドがある場合はErrorをthrowする。
     * @param {Object} csvObj {Number: [String...]}
     */
    function extractDuplicateField(csvObj){

        //重複フィールドの抽出のためにSetを使用する
        //Setに追加する際に重複があった場合は追加されないため、重複フィールドを間接的に抽出できる。
        const duplecateFields = [];
        const fields = csvObj[0];
        const dummySet = new Set();
        for(const field of fields){
            const dummySetSize = dummySet.size;
            dummySet.add(field);
            if(dummySet.size === dummySetSize){
                duplecateFields.push(field);
            }
        }
        if(duplecateFields.length !== 0){
            console.error('重複フィールド一覧');
            console.error(duplecateFields);
            throw new Error('重複しているフィールドを削除してください。');
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