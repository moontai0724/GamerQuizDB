function doPost(data) {
    data = JSON.parse(data.postData.contents)
    // data = { "version": "4.0", "sn": 26508, "question": "%E3%80%8C%E5%A2%83%E7%95%8C%E7%B7%9A%E4%B8%8A%E7%9A%84%E5%9C%B0%E5%B9%B3%E7%B7%9A%E3%80%8D%E4%B8%AD%EF%BC%8C%E8%87%AA%E5%8B%95%E4%BA%BA%E5%BD%A2F%EF%BC%8E%E6%B2%83%E7%88%BE%E8%BE%9B%E5%8E%84%E5%A7%86%E6%98%AF%E4%BB%A5%E4%BB%80%E9%BA%BC%E7%B3%BB%E7%B5%B1%E6%93%8D%E7%B8%B1%E8%BA%AB%E9%AB%94%E7%9A%84%EF%BC%9F", "options": ["%E4%BA%BA%E5%B7%A5%E8%82%8C%E8%82%89", "Wire%20Cylinder", "%E6%96%B9%E8%88%9F%E5%8F%8D%E6%87%89%E7%88%90", "%E9%87%8D%E5%8A%9B%E6%8E%A7%E5%88%B6"], "BoardSN": "60404", "reporter": "moontai0724", "author": "andy090517", "this_answered": 1, "correctness": true }
    if (checkData(data)) {
        var response = getSheetData(data.sn, function (sheet) {
            var sheetName = Math.floor(Number(data.sn) / 5000) * 5 + '000'

            var message = "成功。"
            var index = binary_search(sheet, Number(data.sn))

            var quizData = index > -1 ? sheet[index] : []
            var updated = false

            if (index != -1) {
                if (data.correctness && sheet[index][10] == "") {
                    data.options.forEach(function (value, index) {
                        quizData[index + 6] = data.this_answered == index + 1 ? "Y" : "N"
                    })
                    quizData[10] = data.this_answered // answer
                    updated = true
                }

                if (sheet[index][11] == "") { // update author
                    quizData[11] = data.author
                    updated = true
                }

                if (updated == true) {
                    sheetDB
                        .getSheetByName(sheetName)
                        .getRange('A' + (index + 1) + ':N' + (index + 1))
                        .setValues([quizData])
                    message = "成功更新資料！"
                } else message = "資料已存在，未更新。"
            } else {
                quizData = [
                    data.sn,
                    decodeURIComponent(data.question),
                    decodeURIComponent(data.options[0]),
                    decodeURIComponent(data.options[1]),
                    decodeURIComponent(data.options[2]),
                    decodeURIComponent(data.options[3]),
                    data.this_answered == 1 ? (data.correctness ? 'Y' : 'N') : (data.correctness ? 'N' : ''),
                    data.this_answered == 2 ? (data.correctness ? 'Y' : 'N') : (data.correctness ? 'N' : ''),
                    data.this_answered == 3 ? (data.correctness ? 'Y' : 'N') : (data.correctness ? 'N' : ''),
                    data.this_answered == 4 ? (data.correctness ? 'Y' : 'N') : (data.correctness ? 'N' : ''),
                    data.this_answered,
                    data.author,
                    data.BoardSN
                ]

                var result = sheetDB.getSheetByName(sheetName).appendRow(quizData)
                Logger.log(result)
                message = "成功新增資料！"
                updated = true
            }

            if (updated)
                sheetDB.getSheetByName(sheetName).sort(1)

            return message
        })
        return ContentService.createTextOutput(JSON.stringify({ success: true, data: data, message: response })).setMimeType(ContentService.MimeType.JSON)
    } else
        return ContentService.createTextOutput(JSON.stringify({ success: false, data: data, message: "" })).setMimeType(ContentService.MimeType.JSON)
}

function checkData(data) {
    if (data.version &&
        Number(data.version) > 4.0 &&
        data.sn &&
        data.question
        && data.options && data.options.length == 4 &&
        data.BoardSN &&
        data.author &&
        data.this_answered &&
        (data.correctness == true || data.correctness == false)) {
        return true
    } else {
        return false
    }
}