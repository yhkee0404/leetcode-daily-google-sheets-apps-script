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