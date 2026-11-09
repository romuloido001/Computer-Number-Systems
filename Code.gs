/**
 * Grade 7 ICT – Section A: Computer Number Systems Summative Test
 * Google Apps Script backend.
 *
 * SETUP:
 * 1. Create a standalone Apps Script project at https://script.google.com/.
 * 2. Paste this file into Code.gs.
 * 3. Run setupAssessment() once and authorize access.
 * 4. Copy the spreadsheet URL from the execution log.
 * 5. Deploy > New deployment > Web app:
 *      Execute as: Me
 *      Who has access: Anyone
 * 6. Copy the /exec URL into index.html as API_URL.
 */

const CONFIG = {
  title: 'Grade 7 ICT – Section A | Number Systems Summative Test',
  spreadsheetProperty: 'ICT_ASSESSMENT_SPREADSHEET_ID',
  sheetResponses: 'Responses',
  sheetDashboard: 'Teacher Dashboard'
};

// Correct option index: A=0, B=1, C=2, D=3.
// The answer key is server-side only; it is not in the public index.html.
const ANSWER_KEY = [
  1,2,0,1,2,1,2,2,0,1,
  2,0,1,1,1,1,1,2,1,2,
  0,0,2,2,1
];

const EXPLANATIONS = [
  'A number system represents numbers using a set of symbols (digits) and a base or radix.',
  'The decimal number system is base 10.',
  'Binary is base 2 and uses only the digits 0 and 1.',
  'Octal is base 8, so its digits run from 0 through 7.',
  'Hexadecimal is base 16 and uses 0–9 and A–F.',
  'Binary uses two states represented by 0 and 1, which suits digital computer circuits.',
  '(1×16)+(0×8)+(1×4)+(1×2)+(0×1)=22.',
  '32 + 16 + 0 + 4 + 0 + 1 = 53.',
  'Repeated division by 2 gives remainders read from bottom to top: 11001.',
  'Repeated division by 2 gives 101010.',
  'Read the remainders from bottom to top.',
  '83 ÷ 8 gives remainders 3, 2, 1; read upward to get 123.',
  '156 ÷ 8 = 19 remainder 4; 19 ÷ 8 = 2 remainder 3; 2 ÷ 8 = 0 remainder 2. Read upward: 234.',
  '(2×64)+(4×8)+(7×1)=128+32+7=167.',
  '(6×64)+(3×8)+(5×1)=384+24+5=413.',
  'Octal place values are powers of 8: 8⁰, 8¹, 8², and so on.',
  'Group binary digits into sets of 3, starting from the right.',
  '101 | 101 becomes 5 | 5, so the answer is 55₈.',
  'Pad on the left: 011 | 001 | 110. These groups are 3, 1, and 6.',
  'Each octal digit is replaced by its 3-bit binary equivalent.',
  '5 becomes 101 and 7 becomes 111; together: 101111.',
  '3 → 011, 2 → 010, 6 → 110. Together: 011010110 (leading zero may be removed).',
  'Hexadecimal symbols continue after 9: A=10, B=11, C=12, D=13, E=14, F=15.',
  '2F₁₆ = (2×16) + 15 = 47₁₀.',
  'One hexadecimal digit represents four binary bits, making long binary values more compact.'
];

function setupAssessment() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(CONFIG.spreadsheetProperty);
  let ss = id ? SpreadsheetApp.openById(id) : null;
  if (!ss) {
    ss = SpreadsheetApp.create(CONFIG.title + ' – Responses');
    props.setProperty(CONFIG.spreadsheetProperty, ss.getId());
  }

  let responseSheet = ss.getSheetByName(CONFIG.sheetResponses);
  if (!responseSheet) responseSheet = ss.insertSheet(CONFIG.sheetResponses);
  responseSheet.clear();
  const headers = ['Timestamp','Learner Name','Section','Score','Percentage',
    'Performance','Correct','Incorrect','Submission Key'];
  for (let i=1;i<=25;i++) headers.push('Q'+i+' Answer');
  responseSheet.getRange(1,1,1,headers.length).setValues([headers]);
  responseSheet.setFrozenRows(1);
  responseSheet.getRange(1,1,1,headers.length)
    .setBackground('#073b83').setFontColor('#ffffff').setFontWeight('bold');
  responseSheet.autoResizeColumns(1,headers.length);

  if (!ss.getSheetByName(CONFIG.sheetDashboard)) ss.insertSheet(CONFIG.sheetDashboard);
  buildDashboard_(ss);
  Logger.log('ASSESSMENT SPREADSHEET: ' + ss.getUrl());
  Logger.log('Deploy as Web app: Execute as Me; Who has access: Anyone.');
  return ss.getUrl();
}

function doGet() {
  return HtmlService.createHtmlOutput(
    '<h2>Grade 7 ICT assessment backend</h2><p>Backend endpoint is active. Students should open the official GitHub Pages test link.</p>'
  );
}

function doPost(e) {
  let requestId = '';
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (!raw) throw new Error('No submission payload was received.');
    const payload = JSON.parse(raw);
    requestId = String(payload.requestId || '');
    const name = cleanText_(payload.name,90);
    const section = cleanText_(payload.section || 'Grade 7 – Section A',60);
    const answers = payload.answers;
    if (!name || !section) throw new Error('Learner name and section are required.');
    if (!Array.isArray(answers) || answers.length !== 25 ||
        answers.some(v => !Number.isInteger(v) || v < 0 || v > 3)) {
      throw new Error('The answer set is incomplete or invalid. Please answer all 25 questions.');
    }

    const ss = getSpreadsheet_();
    const sheet = ss.getSheetByName(CONFIG.sheetResponses);
    if (!sheet) throw new Error('Response sheet is missing. Ask the teacher to run setupAssessment().');
    const key = makeSubmissionKey_(name,section);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        const keys = sheet.getRange(2,9,lastRow-1,1).getValues().flat();
        if (keys.indexOf(key) !== -1) {
          return responsePage_({type:'ICT_TEST_RESULT',requestId,ok:false,duplicate:true,
            message:'A submission already exists for this learner name and section.'});
        }
      }
      let score = 0;
      const review = answers.map((answer,i) => {
        const correct = answer === ANSWER_KEY[i];
        if (correct) score++;
        return {studentAnswer:answer,correctAnswer:ANSWER_KEY[i],
          correct:correct,explanation:EXPLANATIONS[i]};
      });
      const percent = Math.round(score/25*100);
      const remark = performanceRemark_(percent);
      const now = new Date();
      const row = [now,name,section,score,percent,remark,score,25-score,key]
        .concat(answers.map(v => ['A','B','C','D'][v]));
      sheet.appendRow(row);
      buildDashboard_(ss);
      return responsePage_({type:'ICT_TEST_RESULT',requestId,ok:true,score,percent,
        remark,submittedAt:now.toLocaleString(),review});
    } finally {
      lock.releaseLock();
    }
  } catch(err) {
    return responsePage_({type:'ICT_TEST_RESULT',requestId,ok:false,
      message:err && err.message ? err.message : 'The submission could not be processed.'});
  }
}

function responsePage_(data) {
  const json = JSON.stringify(data).replace(/</g,'\\u003c');
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<script>window.top.postMessage(' + json + ',"*");</script>' +
    '<p>Submission response processed.</p></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(CONFIG.spreadsheetProperty);
  if (!id) throw new Error('Backend not initialized. Run setupAssessment() in Apps Script.');
  return SpreadsheetApp.openById(id);
}
function cleanText_(value,maxLength) {
  return String(value == null ? '' : value).replace(/[<>]/g,'').trim().slice(0,maxLength);
}
function makeSubmissionKey_(name,section) {
  return name.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim() + '|' +
    section.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
}
function performanceRemark_(p) {
  if(p>=90)return 'Outstanding';
  if(p>=85)return 'Very Satisfactory';
  if(p>=80)return 'Satisfactory';
  if(p>=75)return 'Fairly Satisfactory';
  return 'Needs Improvement';
}

function buildDashboard_(ss) {
  const response = ss.getSheetByName(CONFIG.sheetResponses);
  const dash = ss.getSheetByName(CONFIG.sheetDashboard) || ss.insertSheet(CONFIG.sheetDashboard);
  const last = response.getLastRow();
  const rows = last>=2 ? response.getRange(2,1,last-1,34).getValues() : [];
  dash.clear();
  dash.getRange('A1:F1').merge().setValue('GRADE 7 ICT – SECTION A | TEACHER DASHBOARD');
  dash.getRange('A1').setBackground('#073b83').setFontColor('#ffffff')
    .setFontSize(16).setFontWeight('bold');
  const avg = rows.length ? rows.reduce((s,r)=>s+Number(r[4]||0),0)/rows.length : 0;
  const passed = rows.filter(r=>Number(r[4])>=75).length;
  const metrics = [['Total Submissions',rows.length],
    ['Class Average',rows.length ? Math.round(avg*10)/10+'%' : '—'],
    ['Learners at 75% or Above',passed],['Learners Below 75%',rows.length-passed]];
  dash.getRange(3,1,metrics.length,2).setValues(metrics);
  dash.getRange('A3:A6').setFontWeight('bold').setBackground('#eaf3ff');
  dash.getRange('B3:B6').setFontWeight('bold');
  dash.getRange('A8:F8').merge().setValue('CLASS RESULTS / RANKING');
  dash.getRange('A8').setBackground('#087c89').setFontColor('#ffffff').setFontWeight('bold');
  dash.getRange(9,1,1,6).setValues([['Rank','Learner Name','Section','Score / 25','Percentage','Performance']])
    .setBackground('#dceef7').setFontWeight('bold');
  const sorted = rows.slice().sort((a,b)=>Number(b[3])-Number(a[3]) ||
    String(a[1]).localeCompare(String(b[1])));
  const rankRows = sorted.map((r,i)=>[i+1,r[1],r[2],r[3],r[4]+'%',r[5]]);
  if(rankRows.length)dash.getRange(10,1,rankRows.length,6).setValues(rankRows);
  dash.setFrozenRows(9);
  dash.autoResizeColumns(1,6);
  dash.getRange('A1:F'+Math.max(10,9+rankRows.length)).setVerticalAlignment('middle');
  dash.getRange('A8:F'+Math.max(9,9+rankRows.length))
    .setBorder(true,true,true,true,true,true,'#d5e1ee',SpreadsheetApp.BorderStyle.SOLID);
  dash.getRange('A1').setNote('Private teacher dashboard. Do not share this spreadsheet publicly.');
}

/** Run only when intentionally clearing records before a new administration. */
function clearAssessmentResponses() {
  const ui = SpreadsheetApp.getUi();
  const answer = ui.alert('Clear all student submissions?',
    'This permanently deletes all rows in the Responses sheet. Continue?',ui.ButtonSet.YES_NO);
  if(answer!==ui.Button.YES)return;
  const ss=getSpreadsheet_(), sheet=ss.getSheetByName(CONFIG.sheetResponses);
  if(sheet.getLastRow()>1)sheet.deleteRows(2,sheet.getLastRow()-1);
  buildDashboard_(ss);
}
