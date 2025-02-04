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

function embedDiscordMessage(nickname, date, streak, color = 5814783) {
  return {
    title: "[Auto-Sent by Timer] LeetCode Daily Challenge Completed! 🎉",
    description: "테스트해보실 분은 출석부의 명단 시트에 리트코드 아이디를 적어 주세요.",
    color: color,
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