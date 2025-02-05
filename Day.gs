// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

const oneDay = 24 * 3600 * 1000;

async function getYesterday() {
  return new Date((new Date()).getTime() - oneDay);
}

async function promptDay() {
  // https://developers.google.com/apps-script/reference/base/ui.html?hl=ko#promptprompt,-buttons
  // Display a dialog box with a message, input field, and "Yes" and "No" buttons.
  // The user can also close the dialog by clicking the close button in its title
  // bar.
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('출석을 확인할 날짜 (1-31): ', ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (response.getSelectedButton() !== ui.Button.YES) {
    return;
  }
  const dayNo = Number(response.getResponseText());
  if (! dayNo) {
    ui.alert(`비정상적인 날짜입니다: ${response.getResponseText()}`);
    return;
  }
  const today = new Date();

  let day;
  const lastDayLastMonth = new Date(today.getTime() - today.getUTCDate() * oneDay);
  const dayDiff = today.getUTCDate() - dayNo;
  if (dayDiff == 0) {
    day = today;
  } else if (dayDiff > 0) {
    day = new Date(today.getTime());
    day.setUTCDate(dayNo);
  } else if (lastDayLastMonth.getUTCDate() < dayNo) {
    ui.alert(`비정상적인 날짜입니다: ${lastDayLastMonth.getUTCDate()} < ${response.getResponseText()}`);
    return;
  } else {
    day = new Date(lastDayLastMonth);
    day.setUTCDate(dayNo);
  }
  return day;
}