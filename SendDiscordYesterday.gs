// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

async function sendDiscordYesterday() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // test sheet id 990701901
  // prod sheet id 1030832484
  const sheet = spreadsheet.getSheetById(990701901);
  const userSheet = spreadsheet.getSheetByName('명단');

  const date = new Date();

  const yesterdayCell = sheet.getRange('A5:5').createTextFinder(date.getUTCDate() - 1).findNext();
  if (yesterdayCell === null) {
    return;
  }
  const yesterdayString = (new Date(date - 24 * 3600 * 1000)).toISOString().substring(0, 10);
  
  // 명단 순서가 상관없는 이유는 순서 없는 해시맵을 사용하기 때문이다.
  const leetCodeIdToDiscordName = userSheet.getRange('D5:G').getValues().reduce((obj, [discordName, leetCodeId]) => {
    if (discordName && leetCodeId) {
      obj[leetCodeId] = discordName;
    }
    return obj;
  }, {});
  if (Object.keys(leetCodeIdToDiscordName).length == 0) {
    return;
  }

  // 변경 대상은 번호가 1부터 오름차순 증가하는 연속한 행들만이다.
  const ranges = sheet.getRange('B6:B').createTextFinder('^\\d+$').useRegularExpression(true).findAll();
  let s = 0, e = 0;
  for (let i = 0; i != ranges.length; i++) {
    const range = ranges[i];
    if (e == 0) {
      if (range.getValue() != 1) {
        continue;
      }
      s = range.getRow();
      e = s + 1;
    } else if (range.getRow() != e) {
      break;
    } else {
      e++;
    }
  }

  // https://gist.github.com/tanaikech/82a74e64abcacabd51be8ff92c73691a
  const historyRange = sheet.getRange(s, yesterdayCell.getColumn(), e - s);
  const orgNumberFormats = historyRange.getNumberFormats();
  const histories = historyRange.setNumberFormat("@").getRichTextValues();
  historyRange.setNumberFormats(orgNumberFormats);

  const items = []
  const leetCodeIds = sheet.getRange(s, 4, histories.length).getValues();
  for (let i = s, j = 0; i != e; i++, j++) {
    const history = histories[j][0];
    const streak = history.getText();
    if (! streak) {
      continue;
    }
    const leetCodeId = leetCodeIds[j][0];
    if (! leetCodeId || leetCodeId == 'Not Found') {
      continue;
    }
    const linkUrl = history.getLinkUrl();
    const discordName = leetCodeIdToDiscordName[leetCodeId] || '';
    items.push([discordName, streak, linkUrl]);
  }

  // 김도율 님: https://github.com/doxxx-playground/LeetStreak/blob/519fe02e038694cf82cfc5df4d89ef562f717225/popup.js#L62-L86
  const embeds = items.map(([nickname, streak, linkUrl]) => {
    return {
      title: "[Auto-Sent by Timer] LeetCode Daily Challenge Completed! 🎉",
      description: "테스트해보실 분은 출석부의 명단 시트에 리트코드 아이디를 적어 주세요.",
      color: 5814783,
      fields: [
        { name: "Nickname", value: nickname, inline: true },
        { name: "Date", value: yesterdayString, inline: true },
        {
          name: "Current Streak",
          value: linkUrl ? `[${streak} days](${linkUrl})` : `${streak} days`,
          inline: true,
        },
      ],
    }
  });
  if (embeds.length == 0) {
    return;
  }

  const payload = {
    username: "LeetStreak",
    embeds: embeds,
  }
  const options = {
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  }
  const response = UrlFetchApp.fetch(privateDiscordUrl, options);
}