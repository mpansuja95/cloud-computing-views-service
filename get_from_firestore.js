const admin = require('firebase-admin');

// Replace 'path/to/your/serviceAccountKey.json' with the actual path to your service account key JSON file
const serviceAccount = require('./deductive-cider-407703-879c8524d343.json');

// Replace 'your-project-id' with your actual Firebase project ID
const projectId = 'deductive-cider-407703';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${projectId}.firebaseio.com`,
});

// Helper function to get commits from Firestore
async function getCommitsFromFirestore() {
  try{
    // Assuming you have a 'commits' collection in Firestore
    const commitsSnapshot = await admin.firestore().collection('commits').get();

    // Extract commit data from the snapshot
    const commits = [];
    commitsSnapshot.forEach(doc => {
    commits.push(doc.data());
  });

  return commits;
  } catch (error) {
    console.error('Error fetching commits from Firebase:', error.message);
    throw error;
  }
  
}

// Function to fetch issues from Firestore
async function getIssuesFromFirestore() {
  try {
    // Assuming you have a 'closed_issues' collection in Firestore
    const issueSnapshot = await admin.firestore().collection('closed_issues').get();

    // Extract issue data from the snapshot
    const issues = [];
    issueSnapshot.forEach(doc => {
      issues.push(doc.data());
    });

    return issues;
  } catch (error) {
    console.error('Error fetching issues from Firebase:', error.message);
    throw error;
  }
}

// Function to fetch pull requests from Firestore
async function getPullsFromFirestore() {
  try {
    // Assuming you have a 'pull_requests' collection in Firestore
    const pullSnapshot = await admin.firestore().collection('pull_requests').get();

    // Extract pull request data from the snapshot
    const pulls = [];
    pullSnapshot.forEach(doc => {
      pulls.push(doc.data());
    });

    return pulls;
  } catch (error) {
    console.error('Error fetching pulls from Firebase:', error.message);
    throw error;
  }
}

// Export both functions using a single module.exports object
module.exports = { getCommitsFromFirestore, getIssuesFromFirestore, getPullsFromFirestore };
