// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

async function updateHistoryYesterday() {
  const day = await getYesterday();
  if (! day) {
    return;
  }
  await updateHistory(day);
}

async function updateHistoryPromptDay() {
  const day = await promptDay();
  if (! day) {
    return;
  }
  await updateHistory(day);
}

async function updateHistory(yesterday) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // test sheet id 990701901
  // prod sheet id 1030832484
  const sheet = spreadsheet.getSheetById(990701901);

  const yesterdayCell = sheet.getRange('F5:5')
      .createTextFinder(yesterday.getUTCDate())
      .findNext();
  if (yesterdayCell === null) {
    return;
  }
  yesterday.setUTCHours(0, 0, 0, 0);
  const today = new Date(yesterday.getTime() + oneDay);
  
  // 어제의 문제를 최근에 풀었더라도 어제 안 풀었으면 결석이다.
  const todayTimestamp = today.getTime() / 1000;
  const yesterdayTimestamp = yesterday.getTime() / 1000;
  Logger.log({yesterday: yesterday.toUTCString(), today: today.toUTCString(), yesterdayTimestamp: yesterdayTimestamp.toString(), todayTimestamp: todayTimestamp.toString()});

  // 어제의 문제는 어제 자동으로 입력됐다.
  const yesterdayQuestion = sheet.getRange(4, yesterdayCell.getColumn());
  const title = yesterdayQuestion.getValue();
  if (! title) {
    return;
  }

  // 변경 대상 번호는 6행부터 1번이다. 오름차순인지는 확인하지 않는다. 연속하지 않을 수도 있다.
  const rowStart = 6;
  const targets = sheet.getRange(`B${rowStart}:B`)
      .createTextFinder('^\\d+$')
      .useRegularExpression(true)
      .findAll()
      .map(range => range.getRow());
  if (targets.length == 0) {
    return;
  }

  const leetCodeIds = sheet.getRange(rowStart, 4, targets[targets.length - 1] - rowStart + 1)
      .getValues()
      .map(x => x[0]);

  const previousHistories = sheet.getRange(rowStart, yesterdayCell.getColumn() - 1, leetCodeIds.length)
      .getValues()
      .map(x => x[0]);

  const emptyStyle = SpreadsheetApp.newTextStyle()
      .setUnderline(false)
      .build();
  sheet.getRange(rowStart, yesterdayCell.getColumn(), leetCodeIds.length)
      .setTextStyle(emptyStyle)
      .setFontColor('black')
      .clearContent();
  
  // UrlFetchApp.fetch 실패 시 재시도를 위한 Queue (Exception: Address unavailable)
  const queue = targets.filter(x => {
        const y = x - rowStart;
        return leetCodeIds[y] && leetCodeIds[y] != 'Not Found';
      }).map(x => {
        const y = x - rowStart;
        const leetCodeId = leetCodeIds[y];
        const streak = (+ previousHistories[y] || 0) + 1;

        // 최댓값이 20개라 하루에 더 많이 푸는 사람이 있다면 마지막 20개 전에 포함되지 않는 경우 재제출해야 한다.
        const variables = {
          username: leetCodeId,
          limit: 20,
        };
        const payload = {
          query: leetCodeQueries.recentAcSubmissions,
          variables: variables,
        };
        const options = {
          contentType: 'application/json',
          payload: JSON.stringify(payload),
        }
        return [x, streak, leetCodeId, options];
      });
  let i = 0;
  while (i != queue.length) {
    const queueLength = queue.length;
    for (; i != queueLength; i++) {
      const [x, streak, leetCodeId, options] = queue[i];
      let response;
      try {
        response = UrlFetchApp.fetch(`${leetCodeUrl}/graphql`, options);
        const data = JSON.parse(response.getContentText());

        const submission = data.data
            .recentAcSubmissionList
            .find(x => x?.title == title && x?.timestamp >= yesterdayTimestamp && x?.timestamp < todayTimestamp);
        if (! submission) {
          Logger.log({leetCodeId: leetCodeId, x: x, submission: submission});
          continue;
        }
        const linkUrl = `${yesterdayQuestion.getRichTextValue().getLinkUrl()}submissions/${submission.id}/`;
        const richTextValue = SpreadsheetApp.newRichTextValue()
            .setText(streak)
            .setLinkUrl(linkUrl)
            .build();
        sheet.getRange(x, yesterdayCell.getColumn())
            .setRichTextValue(richTextValue);
        Logger.log({leetCodeId: leetCodeId, x: x, y: yesterdayCell.getColumn(), text: richTextValue.getText(), linkUrl: richTextValue.getLinkUrl()});
      } catch (e) {
        queue.push(queue[i]);
        sheet.getRange(x, yesterdayCell.getColumn())
            .setValue(0);
        Logger.log(e);
      } finally {
        Logger.log(leetCodeId);
        Logger.log(response?.getAllHeaders());
        Logger.log(response?.getContentText());
      }
    }
  }

  // 어제가 말일이면 0일에도 복사해 놓는다.
  if (today.getUTCDate() == 1) {
    const initialHistoryRange = sheet.getRange(rowStart, yesterdayCell.getColumn() - yesterday.getUTCDate());
    sheet.getRange(rowStart, yesterdayCell.getColumn(), leetCodeIds.length)
        .copyTo(initialHistoryRange);
  }
}
