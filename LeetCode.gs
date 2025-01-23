// Compare and open pull request here: https://github.com/yhkee0404/leetcode-daily-google-sheets-apps-script

const leetCodeUrl = 'https://leetcode.com';

const leetCodeQueries = {
  questionOfToday: `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        link
        question {
          title
        }
      }
    }
  `,
  recentAcSubmissions: `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        timestamp
      }
    }
  `,
}