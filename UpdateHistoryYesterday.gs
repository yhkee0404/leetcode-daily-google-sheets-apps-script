// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

async function updateHistoryYesterday() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // test sheet id 990701901
  // prod sheet id 1030832484
  const sheet = spreadsheet.getSheetById(990701901);

  const date = new Date();

  const yesterdayCell = sheet.getRange('F5:5').createTextFinder(date.getUTCDate() - 1).findNext();
  if (yesterdayCell === null) {
    return;
  }
  // 어제의 문제를 최근에 풀었더라도 어제 안 풀었으면 결석이다.
  date.setUTCHours(0, 0, 0, 0);
  const yesterday = date.getTime() / 1000 - 24 * 3600;

  // 어제의 문제는 어제 자동으로 입력됐다.
  const yesterdayQuestion = sheet.getRange(4, yesterdayCell.getColumn());
  const title = yesterdayQuestion.getValue();
  if (! title) {
    return;
  }
  /*
  Deprecated: 디스코드 닉네임 대신 리트코드 아이디 사용

  // 명단 순서가 상관없는 이유는 순서 없는 해시맵을 사용하기 때문이다.
  const userSheet = spreadsheet.getSheetByName('명단');
  const userSheetDiscordNames = userSheet.getRange('D5:D').getValues()
  const leetCodeIds = userSheet.getRange('G5:G').getValues();
  const discordNameToleetCodeId = {}
  for (let i = Math.min(userSheetDiscordNames.length, leetCodeIds.length) - 1; i >= 0; i--) {
    if (userSheetDiscordNames[i][0] && leetCodeIds[i][0]) {
      discordNameToleetCodeId[userSheetDiscordNames[i][0]] = leetCodeIds[i][0];
    }
  }
  if (Object.keys(discordNameToleetCodeId).length == 0) {
    return;
  }
  */

  // 변경 대상 번호는 6행부터 1번이다. 오름차순인지는 확인하지 않는다. 연속하지 않을 수도 있다.
  const rowStart = 6;
  const targets = sheet.getRange(`B${rowStart}:B`).createTextFinder('^\\d+$').useRegularExpression(true).findAll()
      .map(range => range.getRow());
  
  const leetCodeIds = sheet.getRange(`D${rowStart}:D`).getValues();
  
  const previousHistories = sheet.getRange(rowStart, yesterdayCell.getColumn() - 1, leetCodeIds.length).getValues();
  
  const promises = []
  for (let i = 0, j = 0, row = rowStart; i != leetCodeIds.length && j != targets.length; i++, row++) {
    if (row != targets[j]) {
      continue;
    }
    j++;
    const leetCodeId = leetCodeIds[i][0];
    if (! leetCodeId || leetCodeId == 'Not Found') {
      continue;
    }
    const streak = (+ previousHistories[i][0] || 0) + 1;
    promises.push(new Promise(resolve => {
      // 하루에 15개보다 많이 푸는 사람이 있다면 더 크게 조절해야 한다.
      const variables = {
        username: leetCodeId,
        limit: 15,
      };
      const payload = {
        query: leetCodeQueries.recentAcSubmissions,
        variables: variables,
      }
      const options = {
        contentType: 'application/json',
        payload: JSON.stringify(payload),
      }
      const response = UrlFetchApp.fetch(`${leetCodeUrl}/graphql`, options);
      const data = JSON.parse(response.getContentText());

      const submission = data.data.recentAcSubmissionList.find(x => x.title == title);
      if (!! submission && submission.timestamp >= yesterday) {
        const linkUrl = `${yesterdayQuestion.getRichTextValue().getLinkUrl()}submissions/${submission.id}/`;
        const richTextValue = SpreadsheetApp.newRichTextValue().setText(streak).setLinkUrl(linkUrl).build();
        sheet.getRange(row, yesterdayCell.getColumn()).setRichTextValue(richTextValue);
      }
      resolve();
    }));
  }
  await Promise.all(promises);
}