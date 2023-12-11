const express = require('express');
const moment = require('moment');
const { getCommitsFromFirestore, getIssuesFromFirestore, getPullsFromFirestore } = require('./get_from_firestore');

const app = express();
const port = 8090;

// Middleware to parse JSON
app.use(express.json());

// Endpoint to retrieve commits frequency before a certain target date
app.get('/commit-frequency', async (req, res) => {
    const targetDate = req.query.targetDate; // Add a query parameter for the target date

  try {
    // Get commits from Firestore
    const commits = await getCommitsFromFirestore();
    console.log("I got data from firesore and length is ", commits.length);

    // Filter commits before the target date
    const commitsOnOrBeforeTargetDate = commits.filter(commit =>
    new Date(commit.commit.author.date) >= new Date(targetDate)
    );
    console.log("I filtered out commits after ",targetDate," and length is", commitsOnOrBeforeTargetDate.length)

    // Prepare the dictionary of commit counts by author
    const commitCounts = countCommitsByAuthor(commitsOnOrBeforeTargetDate);
    console.log("I got the commit counts by author");

    res.json({ commitCounts });
  } catch (error) {
    console.error('Error retrieving commits:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to retrieve mean issue resolve time for each developer
app.get('/issue-resolution', async (req, res) => {
  const targetDate = req.query.targetDate; // Add a query parameter for the target date

  try {
    // Fetch issues from Firebase
    const issues = await getIssuesFromFirestore();
    console.log("Fetched issues from Firebase");

    // Filter closed issues after the target date
    const closedIssuesAfterTargetDate = issues.filter(issue =>
      issue.state === 'closed' &&
      issue.closed_at &&
      moment(Date(issue.closed_at)) > moment(targetDate)
    );

    // Calculate resolve time for each developer
    const resolveTimesByDeveloper = calculateResolveTimesByDeveloper(closedIssuesAfterTargetDate);

    // Calculate mean resolve time for each developer
    const meanResolveTimes = calculateMeanResolveTimes(resolveTimesByDeveloper);

    res.json({ meanResolveTimes });
  } catch (error) {
    console.error('Error retrieving issues:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to retrieve mean resolve time for each developer
app.get('/pull-request-reviews', async (req, res) => {
  const targetDate = req.query.targetDate; // Add a query parameter for the target date

  try {
    // Fetch pulls from Firebase
    const pulls = await getPullsFromFirestore();
    console.log("Fetched pulls from Firebase");

    // Filter pulls after the target date
    const pullsAfterTargetDate = pulls.filter(pull =>
      pull.created_at &&
      moment(Date(pull.created_at)) > moment(targetDate)
    );

    // Calculate average requested reviews for each developer
    const requestedReviewsByDeveloper = calculateAverageRequestedReviewsByDeveloper(pullsAfterTargetDate);

    res.json({ requestedReviewsByDeveloper });
  } catch (error) {
    console.error('Error retrieving pulls:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// **commits-frequency Helper** Helper function to count commits by author 
function countCommitsByAuthor(commits) {
    const commitCounts = {};
  
    commits.forEach(commit => {
      const authorName = commit.commit.author.name;
  
      // If the author name is not in the dictionary, initialize count to 1, otherwise increment the count
      commitCounts[authorName] = (commitCounts[authorName] || 0) + 1;
    });
  
    return commitCounts;
  }

// **issue-resolution Helper**  Function to calculate resolve time for each developer
function calculateResolveTimesByDeveloper(closedIssues) {
  const resolveTimesByDeveloper = {};

  closedIssues.forEach(issue => {

    // Parse created_at and closed_at strings and convert them to Date objects
    const createdAtDate = new Date(issue.created_at);
    const closedAtDate = new Date(issue.closed_at);

    const developer = issue.user.login;
    const resolveTime = moment(closedAtDate).diff(moment(createdAtDate), 'days');

    if (!resolveTimesByDeveloper[developer]) {
      resolveTimesByDeveloper[developer] = [];
    }

    resolveTimesByDeveloper[developer].push(resolveTime);
  });

  return resolveTimesByDeveloper;
}

// **issue-resolution Helper** Function to calculate mean resolve time for each developer
function calculateMeanResolveTimes(resolveTimesByDeveloper) {
  const meanResolveTimes = {};

  for (const developer in resolveTimesByDeveloper) {
    const resolveTimes = resolveTimesByDeveloper[developer];
    const meanResolveTime = calculateMean(resolveTimes);
    meanResolveTimes[developer] = meanResolveTime;
  }

  return meanResolveTimes;
}

// **pull-request-reviews Helper** Function to calculate average requested reviews per pull request for each developer
function calculateAverageRequestedReviewsByDeveloper(pulls) {
  const reviewsPerPullByDeveloper = {};

  pulls.forEach(pull => {
    const developer = pull.user.login;
    const requestedReviews = pull.requested_reviewers ? pull.requested_reviewers.length : 0;

    if (!reviewsPerPullByDeveloper[developer]) {
      reviewsPerPullByDeveloper[developer] = [];
    }

    reviewsPerPullByDeveloper[developer].push(requestedReviews);
  });

  // Calculate average for each developer
  for (const developer in reviewsPerPullByDeveloper) {
    const reviewsPerPull = reviewsPerPullByDeveloper[developer];
    const averageReviewsPerPull = calculateMean(reviewsPerPull);
    reviewsPerPullByDeveloper[developer] = averageReviewsPerPull;
  }

  return reviewsPerPullByDeveloper;
}

//  Helper function to calculate the mean of an array of numbers
function calculateMean(numbers) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}
  
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
