// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('수동 동기화')
    .addItem('오늘의 문제 다시 부르기', 'updateDailyQuestion')
    .addItem('지정일 출석 다시 부르기', 'updateHistoryPromptDay')
    .addItem('지정일 인증 다시 보내기', 'sendDiscordPromptDay')
    .addToUi();
}
