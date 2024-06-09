(function () {
    "use strict"

    let csvDatas = [];

    //kintoneのレコード一覧画面にボタンを追加する
    kintone.events.on('app.record.index.show', function (event) {
        //CSV1読み込みボタン
        const csv1Button = document.createElement('button');
        csv1Button.id = 'csv1Button';
        csv1Button.innerText = 'CSV1読み込み';
        csv1Button.onclick = function () {
            pressedButtonReadCSV(0);
        };
        kintone.app.getHeaderMenuSpaceElement().appendChild(csv1Button);

        //CSV2読み込みボタン
        const csv2Button = document.createElement('button');
        csv2Button.id = 'csv2Button';
        csv2Button.innerText = 'CSV2読み込み';
        csv2Button.onclick = function () {
            pressedButtonReadCSV(1);
        };
        kintone.app.getHeaderMenuSpaceElement().appendChild(csv2Button);

        //CSV差分チェックボタン
        const csvDiffButton = document.createElement('button');
        csvDiffButton.id = 'csvDiffButton';
        csvDiffButton.innerText = 'CSV差分チェック';
        csvDiffButton.onclick = function () {
            pressedButtonDiffCSV();
        };
        kintone.app.getHeaderMenuSpaceElement().appendChild(csvDiffButton);
    });

    /**
     * CSV読み込みボタンが押された際の処理
     * @param {Number} csvNum 
     */
    function pressedButtonReadCSV(csvNum) {
        
    }

})();