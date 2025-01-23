// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('수동 동기화')
    .addItem('오늘의 문제 다시 부르기', 'updateDailyQuestion')
    .addItem('어제 출석 다시 확인하기', 'updateHistoryYesterday')
    .addItem('어제 출석 다시 전송하기', 'sendDiscordYesterday')
    .addToUi();
}
