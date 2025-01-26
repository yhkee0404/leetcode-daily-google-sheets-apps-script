(async (discordName, webhookUrl)=>{
  if (! discordName) {
    window.alert('Discord 닉네임을 입력해야 합니다.');
    return;
  }
  if (! webhookUrl) {
    window.alert('Discord Webhook 주소를 입력해야 합니다.');
    return;
  }

  const leetcodeUrl = 'https://leetcode.com/';
  const leetCodeQueries = {
    qdChallengeQuestion: `
      query qdChallengeQuestion($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
              challengeQuestionsV2 {
                  date
                  streakCount
                  type
                  status
              }
          }
      }
    `,
  };

  let item;
  try {
    const words = window.location.pathname.split('/');
    if (words.indexOf('submissions') == -1 || ! Number(words[words.length - 2])) {
      throw new Error(`Submissions 목록의 Accepted를 클릭해서 제출 상세 페이지로 이동해 주세요.\n현재 페이지: ${window.location}`);
    }
    let titleSlug;
    if (window.__NEXT_DATA__) {
      const nextDataQuery = window.__NEXT_DATA__.query;
      if (nextDataQuery) {
        titleSlug = nextDataQuery.slug;
      }
    }
    if (! titleSlug && window.pageData) {
      const editCodeUrl = window.pageData.editCodeUrl;
      if (editCodeUrl) {
        titleSlug = editCodeUrl.split('/')[2];
      }
    }
    if (! titleSlug && words.indexOf('problems') != -1) {
      titleSlug = words[2];
    }
    if (! titleSlug) {
      throw new Error(`문제 이름을 알 수 없습니다: ${window.location}`);
    }
    const payload = {
      query: leetCodeQueries.qdChallengeQuestion,
      variables: {
        titleSlug: titleSlug,
      }
    };
    const response = await fetch(`${leetcodeUrl}graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (! response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    item = json.data.question.challengeQuestionsV2.filter(x => x.type == 'DAILY' && x.status == 'FINISHED')
        .reduce((a, b) => a.streakCount > b.streakCount ? a : b, {streakCount: -1});
    if (item.streakCount < 0) {
      throw new Error('도전 달성한 이력이 없습니다.');
    }
  } catch (error) {
    window.alert(`Streak 확인 실패: ${error.message}`);
    return;
  }
  
  /*
  김도율 님: https://github.com/doxxx-playground/LeetStreak/blob/519fe02e038694cf82cfc5df4d89ef562f717225/popup.js#L62-L86

  MIT License

  Copyright (c) 2025 LeetStreak

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */
  function embedDiscordMessage(nickname, date, streak) {
    return {
      title: "[Bookmark] LeetCode Daily Challenge Completed! 🎉",
      description: "모바일 또는 크롬 외 브라우저의 [북마크 인증](https://discord.com/channels/1191440569671614554/1327186963681247252/1332780701237514302)입니다. 지난 문제 재인증을 지원합니다.",
      color: 5814783,
      fields: [
        { name: "Nickname", value: nickname, inline: true },
        { name: "Date", value: date, inline: true },
        {
          name: "Current Streak",
          value: streak,
          inline: true,
        },
      ],
    }
  };
  try {
    const embeds = [embedDiscordMessage(discordName, `[${item.date}](${window.location.href})`, `${item.streakCount + 1} days`)];
    const payload = {
      username: "LeetStreak",
      embeds: embeds,
    };
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (! response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
  } catch (error) {
    window.alert(`Discord 전송 실패: ${error.message}`);
    return;
  }
  window.alert('Discord 전송에 성공했습니다.');
})();