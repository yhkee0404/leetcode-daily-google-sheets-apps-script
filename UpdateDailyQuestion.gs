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
  
  const dateDay = date.split('-').pop();
  const dateCell = sheet.getRange('E6:5').createTextFinder(dateDay).matchEntireCell(true).findNext();

  const richTextValue = SpreadsheetApp.newRichTextValue().setText(title).setLinkUrl(leetCodeUrl + link).build();
  sheet.getRange(4, dateCell.getColumn()).setRichTextValue(richTextValue);
}