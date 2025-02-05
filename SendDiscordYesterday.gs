// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

async function sendDiscordYesterday() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // test sheet id 990701901
  // prod sheet id 1030832484
  const sheet = spreadsheet.getSheetById(990701901);
  const userSheet = spreadsheet.getSheetByName('명단');

  const today = new Date();

  const yesterday = new Date(today.getTime() - 24 * 3600 * 1000);
  const yesterdayCell = sheet.getRange('F5:5').createTextFinder(yesterday.getUTCDate()).findNext();
  if (yesterdayCell === null) {
    return;
  }
  const yesterdayString = yesterday.toISOString().substring(0, 10);
  
  // 명단 순서가 상관없는 이유는 순서 없는 해시맵을 사용하기 때문이다.
  const leetCodeIdToDiscordName = userSheet.getRange('D5:G')
      .getValues()
      .reduce((obj, [discordName, leetCodeId]) => {
        if (discordName && leetCodeId) {
          obj[leetCodeId] = discordName;
        }
        return obj;
      }, {});
  if (Object.keys(leetCodeIdToDiscordName).length == 0) {
    return;
  }

  // 변경 대상 번호는 6행부터 1번이다. 오름차순인지는 확인하지 않는다. 연속하지 않을 수도 있다.
  const rowStart = 6;
  const targets = sheet.getRange(`B${rowStart}:B`)
      .createTextFinder('^\\d+$')
      .useRegularExpression(true)
      .findAll()
      .map(range => range.getRow() - rowStart);
  if (targets.length == 0) {
    return;
  }

  // 리트코드 아이디가 없거나 디스코드 닉네임이 없으면 이름이라도 사용한다.
  const names = sheet.getRange(rowStart, 3, targets[targets.length - 1] + 1, 4)
      .getValues()
      .map(x => x[1] && x[1] != 'Not Found' && leetCodeIdToDiscordName[x[1]] || x[0] || '');

  // https://gist.github.com/tanaikech/82a74e64abcacabd51be8ff92c73691a
  const historyRange = sheet.getRange(rowStart, yesterdayCell.getColumn(), names.length);
  const orgNumberFormats = historyRange.getNumberFormats();
  const histories = historyRange.setNumberFormat("@")
      .getRichTextValues()
      .map(x => x[0] && x[0].getText() && x[0]);
  historyRange.setNumberFormats(orgNumberFormats);

  const items = targets.filter(x => histories[x])
      .map((x, i, arr) => {
        const history = histories[x];
        const streak = history.getText();
        const linkUrl = history.getLinkUrl();
        const name = names[x];
        return [
          name,
          linkUrl,
          `${streak} days`,
          `${i + 1} / ${arr.length}`,
          // 'https://leetcode.com/problems/maximum-ascending-subarray-sum/submissions/1530381408/'.split('/')
          // (8) ['https:', '', 'leetcode.com', 'problems', 'maximum-ascending-subarray-sum', 'submissions', '1530381408', '']
          linkUrl && Number(linkUrl.split('/')[6]) || Infinity,
        ];
      });
  if (items.length == 0) {
    return;
  }
  let j = 0, num_valid = 0;
  items.toSorted((a, b) => a.at(-1) - b.at(-1))
      .map((x, i, arr) => {
        const submission = x.at(-1);
        const valid = submission != Infinity;
        const duplicated = i != 0 && valid && arr[i - 1].at(-2) == submission;
        if (! duplicated && valid) {
          num_valid++;
        }
        x.push(duplicated);
        return x;
      }).forEach((x, i, arr) => {
        const linkUrl = x[1];
        const duplicated = x.pop();
        const submission = x.pop();
        
        x[1] = linkUrl ? `[${yesterdayString}](${linkUrl})` : yesterdayString;
        if (duplicated) {
          j++;
        }
        const submission_order = ! linkUrl ? 'Invalid LeetCode ID'
            : submission == Infinity ? 'Tampered Submission Link'
            : `${duplicated || i != arr.length && arr[i + 1].at(-1) ? 'Duplicated ' : ''}${ordinal(i + 1 - j)} out of ${num_valid}`;
        let color = 3450963;
        switch (submission_order[0]) {
          case 'I':
            color = 11513775;
            break;
          case 'T':
            color = 16752918;
            break;
          case 'D':
            color = 16711680;
            break;
          default:
            break;
        }
        x.push(submission_order, color);
      });

  const embeds = items.map((item, i) => embedDiscordMessage(...item));

  const promises = [];
  for (let i = 0, j = 10; i < embeds.length; i = j, j += 10) {
    const payload = {
      username: "LeetStreak",
      embeds: embeds.slice(i, j),
    }
    const options = {
      contentType: 'application/json',
      payload: JSON.stringify(payload),
    }
    promises.push(new Promise(resolve => {
      try {
        UrlFetchApp.fetch(privateDiscordUrl, options);
      } finally {
        resolve();
      }
    }));
  }
  await Promise.all(promises);
}

function ordinal(n, suffixes = ["th", "st", "nd", "rd"]) {
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}