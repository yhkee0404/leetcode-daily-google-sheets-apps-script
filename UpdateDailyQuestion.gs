// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

async function updateDailyQuestion() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // test sheet id 990701901
  // prod sheet id 1030832484
  const sheet = spreadsheet.getSheetById(990701901);

  const payload = {
    query: leetCodeQueries.questionOfToday,
  }

  const options = {
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  }

  const response = UrlFetchApp.fetch(`${leetCodeUrl}/graphql`, options);
  const data = JSON.parse(response.getContentText());
  const {date, link, question: {title}} = data.data.activeDailyCodingChallengeQuestion;
  
  const dateDay = Number(date.split('-').pop());
  const dateCell = sheet.getRange('E5:5').createTextFinder(dateDay).matchEntireCell(true).findNext();

  const questionCell = sheet.getRange(4, dateCell.getColumn());
  // 기존 값이 있는 경우 한 행 위에 백업한 뒤 덮어쓴다.
  if (questionCell.getValue()) {
    sheet.getRange(3, dateCell.getColumn()).setRichTextValue(questionCell.getRichTextValue());
  }
  const richTextValue = SpreadsheetApp.newRichTextValue().setText(title).setLinkUrl(leetCodeUrl + link).build();
  questionCell.setRichTextValue(richTextValue);

  // 오늘이 말일이면 0일에도 복사해 놓는다.
  const today = new Date(date);
  const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000);
  if (tomorrow.getUTCDate() == 1) {
    sheet.getRange(4, dateCell.getColumn() - dateDay).setRichTextValue(richTextValue);
  }
}