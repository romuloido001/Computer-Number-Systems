GRADE 7 ICT – SECTION A
COMPUTER NUMBER SYSTEMS SUMMATIVE TEST
GITHUB PAGES + GOOGLE SHEETS BACKEND
============================================================

PACKAGE CONTENTS
----------------
1. index.html  - Student test website (25 multiple-choice questions).
2. Code.gs     - Google Apps Script backend and teacher dashboard.
3. README.txt  - Setup and publishing instructions.

IMPORTANT
---------
This package is not ready for public student use until setup is complete
and the teacher's Apps Script Web App URL is pasted into index.html.
Do not publish the placeholder API URL. The answer key is stored in Code.gs,
not in the public GitHub HTML file.

PART A — CREATE THE GOOGLE SHEETS BACKEND
-----------------------------------------
1. Sign in to the Google account that will own the assessment records.
2. Visit https://script.google.com/ and click New project.
3. Open Code.gs, remove its sample code, and paste the complete contents of
   the Code.gs file from this ZIP.
4. Save the project. Name it: Grade 7 ICT Section A Assessment Backend.
5. Select the function setupAssessment and click Run.
6. Review and authorize the Google Sheets permissions requested.
7. Open the Apps Script execution log and copy the spreadsheet URL printed
   after the label ASSESSMENT SPREADSHEET.
8. Open the spreadsheet. It contains:
   - Responses: one row per accepted submission, including the 25 answers.
   - Teacher Dashboard: total submissions, class average, pass count,
     below-75% count, and ranking by score.
Keep this spreadsheet private to the teacher/school.

PART B — DEPLOY THE APPS SCRIPT WEB APP
---------------------------------------
1. In Apps Script, click Deploy > New deployment.
2. Click the gear icon and choose Web app.
3. Description: Grade 7 ICT Assessment API.
4. Execute as: Me.
5. Who has access: Anyone. This is needed so students can submit from GitHub.
6. Click Deploy and complete any authorization prompt.
7. Copy the Web app URL ending in /exec.

PRIVACY / SECURITY
------------------
The web app endpoint must be publicly reachable for students. The answer key
stays in the server-side Apps Script project. Keep the spreadsheet private and
do not share Apps Script editor access with students. A public endpoint can
receive unwanted requests; monitor the Responses sheet and disable/redeploy
the web app if it is abused.

PART C — CONNECT THE STUDENT WEBSITE
------------------------------------
1. Open index.html in a text editor.
2. Find this JavaScript line:
   const API_URL="PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
3. Replace the placeholder text inside the quotes with the /exec URL from Part B.
   Keep the quotation marks.
4. Save index.html.
5. Upload index.html to the root of your GitHub repository.
6. Wait for GitHub Pages to finish publishing.

PART D — TEST BEFORE SHARING WITH LEARNERS
------------------------------------------
1. Open the published test and use a test learner name, e.g. TEST LEARNER 001.
2. Complete and submit all 25 questions.
3. Confirm the result page shows a score and says it was saved.
4. Open the private spreadsheet > Responses and confirm a row was added.
5. Open Teacher Dashboard and confirm the totals and ranking updated.
6. Try submitting again with the same name and section. It should be rejected.
7. Remove test records before the actual assessment (see reset instructions).

ONE SUBMISSION PER LEARNER
--------------------------
The system prevents another accepted submission with the same normalized
learner name + section. This is name-based duplicate protection, not identity
verification. Two learners with identical names in the same section will be
treated as duplicates. If that may happen, ask learners to add a unique
classroom code after their name (example: Juan Dela Cruz - 07A015).

TEACHER DASHBOARD AND EXPORT
----------------------------
The private Google spreadsheet is the teacher dashboard and data store.
Responses include timestamp, learner name, section, score, percentage,
performance remark, and selected option for each question. The Dashboard tab
summarizes the class and ranks submissions by score. In Google Sheets, use
File > Download to export as Microsoft Excel (.xlsx) or CSV.

RESETTING FOR A NEW CLASS / ADMINISTRATION
------------------------------------------
In Apps Script, select clearAssessmentResponses and click Run. Confirm the
prompt. This permanently deletes all response rows and rebuilds the dashboard.
Only the teacher should run this function. Alternatively, delete test rows
manually in the private Responses sheet.

STUDENT EXPERIENCE
------------------
- Learners enter their name and section.
- They answer all 25 multiple-choice questions.
- The backend checks the answers and stores one accepted submission.
- Learners see score, percentage, performance remark, and answer review.
- Learners can download their individual result as a TXT file.
- Student answers are not stored in browser local storage.

TROUBLESHOOTING
---------------
- "Teacher must configure..." means the API_URL placeholder is still present.
- If no confirmation appears, check the /exec URL, deployment access (Anyone),
  and that the latest deployment uses the current Code.gs version.
- After editing Code.gs, use Deploy > Manage deployments > Edit > New version
  > Deploy so the live web app uses your latest backend code.
- If you change the deployment URL, update API_URL in index.html too.
- If a name/section is rejected, check whether that learner already submitted.

ASSESSMENT COVERAGE
-------------------
The 25 questions retain the original topics: decimal, binary, octal,
hexadecimal, number-system bases and digits, decimal/binary conversion,
decimal/octal conversion, binary/octal conversion, and hexadecimal concepts.

Prepared for Grade 7 ICT – Section A.
