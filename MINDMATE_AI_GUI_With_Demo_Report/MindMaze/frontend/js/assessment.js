"use strict";
// The C++ server calculates scores; the browser stores the user's history.
const $ = id => document.getElementById(id);
const QUESTIONS = [
"How would you describe your mood today?",
"How calm and emotionally peaceful do you feel today?",
"How much stress or pressure are you experiencing today?",
"How worried or anxious are you feeling today?",
"How well did you sleep last night?",
"How energetic and refreshed do you feel today?",
"How well can you concentrate on your studies or daily tasks today?",
"How connected and supported do you feel by the people around you today?",
"How capable do you feel of handling today's challenges?",
"Are you having thoughts of hurting yourself or feeling that you would be better off not alive today?"
];
const CATEGORIES=['Mood & peace','Stress & anxiety','Sleep & energy','Focus & coping','Social connection'];
const RECOMMEND=[
{activity:'gratitude-note',text:'Try gratitude journaling or gentle stretching.',verse:'ash-sharh-94-5-6',ref:'Surah Ash-Sharh 94:5–6'},
{activity:'breath-calm',text:'Try slow breathing and writing down worries.',verse:'ar-rad-13-28',ref:"Surah Ar-Ra’d 13:28"},
{activity:'sleep-hygiene',text:'Try a consistent bedtime and a calming rest routine.',verse:'an-naba-78-9',ref:'Surah An-Naba 78:9'},
{activity:'pomodoro-reset',text:'Take a short study break and choose one manageable task.',verse:'al-baqarah-2-286',ref:'Surah Al-Baqarah 2:286'},
{activity:'reach-out',text:'Reach out to a trusted person and consider journaling.',verse:'al-baqarah-2-186',ref:'Surah Al-Baqarah 2:186'}
];
const KEY='mindmate_assessment_v2';
let data={name:'Friend',records:[],completed:[]};
try {const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&Array.isArray(saved.records))data={...data,...saved};}catch(e){}
let activities=[],passages=[],professionals=[],community=[];
let demoMode=false;
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmt=d=>new Date(d+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
function route(){let page=location.hash.slice(1)||'dashboard';if(!$('page-'+page))page='dashboard';document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id==='page-'+page));document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));$('crumb').textContent=page.toUpperCase();document.querySelector('.sidebar').classList.remove('open');if(page==='report')renderReport();scrollTo(0,0)}
function buildQuestions(){const labels=['Very poor','Poor','Okay','Good','Very good'];const amount=['None','A little','Moderate','A lot','Extreme'];$('questions-container').innerHTML=QUESTIONS.map((q,i)=>{
const choices=i===9?[['0','No'],['1','Yes'],['-1','Prefer not to answer']]:[...Array(5)].map((_,n)=>[String(n),(i===2||i===3?amount:labels)[n]]);
return `<div class="question-card"><h3>Q${i+1}. ${escapeHTML(q)}</h3><div class="answer-row">${choices.map(([v,label])=>`<label><input type="radio" name="q${i}" value="${v}"> ${escapeHTML(label)}</label>`).join('')}</div><p class="muted" style="font-size:10px">${i===9?'This safety response is never included in your wellness score.':'Optional: leave unanswered if you prefer.'}</p></div>`}).join('')}
function focusIndex(categories){let best=-1;categories.forEach((v,i)=>{if(v>=0&&(best<0||v>categories[best]))best=i});return best}
function safetyMessage(){return `<div class="risk-note"><b>Your safety comes first.</b><p>If you may act on these thoughts or are in immediate danger, contact local emergency services or go to the nearest emergency department now. Tell a trusted person and ask them to stay with you. This app cannot monitor or respond to emergencies.</p><a class="button button-outline" href="#help">Get help and support →</a></div>`}
function suggestions(r){const i=focusIndex(r.categories);if(i<0)return '<p>No scored answers yet. You can explore Wellness Studio or SUKOON at your own pace.</p>';const s=RECOMMEND[i];return `<p><b>Focus area:</b> ${CATEGORIES[i]} (${r.categories[i]}/100 difficulty)</p><p><b>Wellness Studio:</b> ${s.text} <a href="#activities">Explore activities →</a></p><p><b>SUKOON:</b> ${s.ref} — an optional spiritual reflection. <a href="#sukoon">Explore reflections →</a></p><p class="muted">These are supportive suggestions, not treatment. Consider professional help if challenges persist or affect daily life.</p>`}
async function submitAssessment(e){e.preventDefault();const answers=QUESTIONS.map((_,i)=>{const checked=document.querySelector(`input[name="q${i}"]:checked`);return checked?Number(checked.value):-1});const date=$('assessment-date').value;if(!date)return;
try{const res=await fetch('/api/assessment',{method:'POST',headers:{'Content-Type':'text/plain'},body:answers.join(',')});if(!res.ok)throw Error('Server could not process assessment');const result=await res.json();const record={date,answers,score:result.score,categories:result.categories,safety:result.safety};data.records.push(record);save();renderDashboard();$('assessment-status').textContent='Assessment saved in this browser.';$('assessment-result').hidden=false;$('assessment-result').innerHTML=`<h3>Your assessment result</h3><p>${result.score<0?'Not enough answered questions to calculate a score.':`Reported difficulty: <b>${result.score}/100</b> (lower means fewer reported difficulties)`}</p>${result.safety===1?safetyMessage():''}${suggestions(record)}<a class="button button-primary" href="#report">View monthly report →</a>`;$('assessment-result').scrollIntoView({behavior:'smooth'});}catch(err){$('assessment-status').textContent=err.message+' — please run the C++ server.'}}
function renderDashboard(){const last=data.records.at(-1);$('stat-count').textContent=data.records.length;$('stat-score').textContent=last&&last.score>=0?last.score+'/100':'—';$('stat-done').textContent=data.completed.length;$('stat-focus').textContent=last&&focusIndex(last.categories)>=0?CATEGORIES[focusIndex(last.categories)]:'Your pace';$('dashboard-suggestions').innerHTML=last?suggestions(last):'Complete an assessment to see suggestions.';$('recent-assessments').innerHTML=data.records.slice(-3).reverse().map(r=>`<div class="recent-row"><span>${fmt(r.date)}</span><b>${r.score<0?'Unscored':r.score+'/100'}</b></div>`).join('')||'No assessments yet.';$('side-name').textContent=data.name;$('side-avatar').textContent=(data.name||'M')[0].toUpperCase()}
// Demo records are generated in memory and NEVER mixed with personal data.
// Each row is a fictional weekly assessment; Q10 is kept separate from scoring.
function makeDemoRecord(date, answers){
 const difficulty=(value,i)=>value<0?-1:((i===2||i===3)?value:4-value);
 const groups=[[0,1],[2,3],[4,5],[6,8],[7]];
 const categories=groups.map(indices=>{const v=indices.map(i=>difficulty(answers[i],i)).filter(x=>x>=0);return v.length?Math.round(v.reduce((a,b)=>a+b,0)*25/v.length):-1});
 const values=answers.slice(0,9).map((v,i)=>difficulty(v,i)).filter(v=>v>=0);
 return {date,answers,score:values.length?Math.round(values.reduce((a,b)=>a+b,0)*25/values.length):-1,categories,safety:answers[9],demo:true};
}
function demoRecords(){
 const month=$('report-month').value || localDate().slice(0,7);
 return [
 [3,2,3,3,1,1,2,2,2,0],
 [3,3,3,2,2,2,2,2,2,0],
 [3,3,2,2,3,3,3,3,3,0],
 [4,4,1,1,3,4,4,4,4,0]
 ].map((a,i)=>makeDemoRecord(month+'-'+String([3,10,17,24][i]).padStart(2,'0'),a));
}
function lineChart(records){
 const rows=records.filter(r=>r.score>=0);
 if(!rows.length)return '<p>No scored assessments.</p>';
 const points=rows.map((r,i)=>({x:50+(rows.length===1?0:i*520/(rows.length-1)),y:205-r.score*1.65,score:r.score,date:r.date.slice(5)}));
 const grid=[0,25,50,75,100].map(v=>`<line x1="45" y1="${205-v*1.65}" x2="580" y2="${205-v*1.65}" stroke="#d9ded2"/><text x="7" y="${209-v*1.65}" font-size="12" fill="#63705d">${v}</text>`).join('');
 const path=points.map(p=>p.x+','+p.y).join(' ');
 return `<svg viewBox="0 0 610 255" role="img" aria-label="Line graph of self-reported difficulty scores over four weeks" style="width:100%;max-width:750px;height:auto">${grid}<polyline points="${path}" fill="none" stroke="#596b45" stroke-width="3" stroke-linejoin="round"/>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5" fill="#596b45"/><text x="${p.x}" y="${p.y-12}" text-anchor="middle" font-size="13" fill="#30402c">${p.score}</text><text x="${p.x}" y="237" text-anchor="middle" font-size="12" fill="#63705d">${p.date}</text>`).join('')}</svg>`;
}
function donutChart(averages){
 const valid=averages.map(v=>Math.max(0,v));const sum=valid.reduce((a,b)=>a+b,0);
 if(!sum)return '<p>No category difficulty recorded.</p>';
 const colors=['#526847','#a6b88b','#c9a56e','#7d9b9a','#a78eaa'];let running=0;
 const parts=valid.map((v,i)=>{const from=running;running+=v/sum*100;return `${colors[i]} ${from.toFixed(2)}% ${running.toFixed(2)}%`});
 return `<div class="donut-wrap"><div class="donut-chart" role="img" aria-label="Distribution of recorded category difficulty" style="background:conic-gradient(${parts.join(',')})"><span>Category<br>share</span></div><div class="donut-legend">${CATEGORIES.map((c,i)=>`<div><span style="background:${colors[i]}"></span>${escapeHTML(c)}: ${Math.round(valid[i]/sum*100)}%</div>`).join('')}</div></div>`;
}
function renderReport(){
 const month=$('report-month').value;
 const records=(demoMode?demoRecords():data.records.filter(r=>r.date.slice(0,7)===month)).sort((a,b)=>a.date.localeCompare(b.date));
 $('report-mode-note').textContent=demoMode?'SIMULATED DEMO DATA ONLY — fictional four-week example. This report is not about a real person.':'ACTUAL DATA — assessments saved in this browser for the selected month.';
 const root=$('report-content');
 if(!records.length){root.innerHTML='<div class="surface">No assessments saved for this month. Choose Show Demo Month for the evaluation example, or complete your own assessment.</div>';return;}
 const valid=records.filter(r=>r.score>=0),first=valid[0],last=valid[valid.length-1];
 const change=valid.length<2?'More assessments are needed for a comparison.':last.score===first.score?'No change in the first-to-last reported difficulty score.':last.score<first.score?`Reported difficulty decreased by ${first.score-last.score} points from first to last assessment.`:`Reported difficulty increased by ${last.score-first.score} points from first to last assessment.`;
 const avg=CATEGORIES.map((_,i)=>{const v=records.map(r=>r.categories[i]).filter(x=>x>=0);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):-1});
 const best=last?focusIndex(last.categories):-1;
 root.innerHTML=`${demoMode?'<div class="demo-banner"><b>DEMO REPORT · SIMULATED EXAMPLE</b><p>All four weekly assessments are fictional. They demonstrate how a monthly report works; they are not clinical outcomes or actual user records.</p></div>':''}<div class="stats-grid"><article class="stat-card"><small>ASSESSMENTS</small><strong>${records.length}</strong></article><article class="stat-card"><small>FIRST SCORE</small><strong>${first?first.score:'—'}</strong></article><article class="stat-card"><small>LATEST SCORE</small><strong>${last?last.score:'—'}</strong></article><article class="stat-card"><small>UNANSWERED</small><strong>${records.reduce((s,r)=>s+r.answers.filter(x=>x===-1).length,0)}</strong></article></div><div class="report-grid"><article class="surface"><h3>Weekly difficulty trend · line chart</h3><p class="muted">0–100, lower = fewer self-reported difficulties</p>${lineChart(records)}</article><article class="surface"><h3>Category difficulty distribution · doughnut chart</h3><p class="muted">Share of recorded category averages, not share of mental health.</p>${donutChart(avg)}</article></div><article class="surface"><h3>Category averages</h3>${avg.map((v,i)=>`<div class="category-line"><div class="recent-row"><span>${CATEGORIES[i]}</span><b>${v<0?'No answers':v+'/100'}</b></div><div class="category-track"><div class="category-fill" style="width:${Math.max(0,v)}%"></div></div></div>`).join('')}</article><article class="surface"><h3>Monthly progress summary</h3><p>${change}</p><p>${best>=0?'The latest highest difficulty category is '+escapeHTML(CATEGORIES[best])+'.':'No category information available.'}</p><h3>Suggested support</h3>${last?suggestions(last):'Complete more assessments.'}${records.some(r=>r.safety===1)?safetyMessage():''}<h3>Assessment history</h3>${records.map(r=>`<div class="report-row"><b>${fmt(r.date)}</b> · Difficulty ${r.score<0?'unscored':r.score+'/100'} · ${r.answers.filter(x=>x===-1).length} unanswered question(s)</div>`).join('')}<p class="muted">${demoMode?'All records above are simulated. ':''}Educational self-report scoring only. Not a medical assessment or diagnosis. Question 10 is never included in the numerical score.</p></article>`;
}
function renderProfessionals(){
 const term=$('professional-search').value.toLowerCase(),role=$('professional-type').value;
 const filtered=professionals.filter(p=>(role==='all'||p.role===role)&&(p.name+' '+p.institution+' '+p.specialization+' '+p.qualifications).toLowerCase().includes(term));
 $('professional-list').innerHTML=filtered.map(p=>`<article class="activity-card"><span class="tag">USER-SUPPLIED · NOT VERIFIED</span><h3>${escapeHTML(p.name)}</h3><p><b>${escapeHTML(p.role)}</b> · ${escapeHTML(p.specialization)}</p><p><b>Qualifications:</b> ${escapeHTML(p.qualifications)}</p><p><b>Institution:</b> ${escapeHTML(p.institution)}</p><p><b>Original schedule:</b> ${escapeHTML(p.schedule)}</p><p class="muted">Confirm current availability and credentials directly with the institution.</p></article>`).join('')||'<p>No matching profiles.</p>';
}
function renderCommunity(){
 $('social-reflections').innerHTML=community.map(p=>`<article class="sukoon-card"><span class="tag">Instagram · user-shared</span><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.text)}</p><p class="muted">Related: ${escapeHTML(p.related)}</p><a class="button button-outline" href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer">Open Instagram reference ↗</a></article>`).join('');
}
function renderActivities(){const term=$('activity-search').value.toLowerCase(),cat=$('activity-filter').value;const shown=activities.filter(a=>(cat==='all'||a.type===cat)&&(a.title+' '+a.description).toLowerCase().includes(term));$('activity-list').innerHTML=shown.map(a=>`<article class="activity-card"><span class="card-icon">❀</span><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.description)}</p><div class="activity-meta"><span>${escapeHTML(a.type)} · ${a.duration} min</span><button data-activity="${escapeHTML(a.id)}">Explore →</button></div></article>`).join('')||'<p>No matching activities.</p>'}
function activityAction(e){const button=e.target.closest('[data-activity]');if(!button)return;const a=activities.find(x=>x.id===button.dataset.activity);if(!a)return;$('activity-detail').hidden=false;$('activity-detail').innerHTML=`<h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.description)}</p><ol class="steps-list">${(a.steps||[]).map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol><button class="button button-primary" id="mark-done">Mark activity complete</button>`;$('mark-done').onclick=()=>{data.completed.push({id:a.id,date:localDate()});save();renderDashboard();$('mark-done').textContent='Completed ✓';$('mark-done').disabled=true};$('activity-detail').scrollIntoView({behavior:'smooth'})}
function renderSukoon(){const term=$('sukoon-search').value.toLowerCase();$('sukoon-list').innerHTML=passages.filter(x=>(x.surah+' '+x.category+' '+x.reference+' '+x.translation).toLowerCase().includes(term)).map(x=>`<article class="sukoon-card"><span class="tag">${escapeHTML(x.category)}</span><h3>${escapeHTML(x.surah)} · ${escapeHTML(x.reference)}</h3><div class="arabic" lang="ar" dir="rtl">${escapeHTML(x.arabic)}</div><p><b>${escapeHTML(x.translation)}</b></p><p>${escapeHTML(x.explanation)}</p><small class="muted">${escapeHTML(x.translator||'Saheeh International')} · ${escapeHTML(x.reference)}</small></article>`).join('')||'<p>No matching reflections.</p>'}
async function init(){const d=localDate();$('assessment-date').value=d;$('report-month').value=d.slice(0,7);$('profile-name').value=data.name;buildQuestions();try{const [a,n,p,c]=await Promise.all([fetch('/data/activities.json').then(r=>r.json()),fetch('/data/noor.json').then(r=>r.json()),fetch('/data/professionals.json').then(r=>r.json()),fetch('/data/community-reflections.json').then(r=>r.json())]);activities=a.activities||[];passages=n.passages||[];professionals=p.professionals||[];community=c.reflections||[];const roles=[...new Set(professionals.map(x=>x.role))].sort();$('professional-type').innerHTML+=roles.map(x=>`<option value="${escapeHTML(x)}">${escapeHTML(x)}</option>`).join('');const types=[...new Set(activities.map(x=>x.type))].sort();$('activity-filter').innerHTML+=[...types].map(t=>`<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join('')}catch(e){console.error(e)}renderActivities();renderSukoon();renderCommunity();renderProfessionals();renderDashboard();route();window.addEventListener('hashchange',route);$('menu-toggle').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');$('assessment-form').onsubmit=submitAssessment;$('report-month').onchange=renderReport;$('report-demo').onclick=()=>{demoMode=true;renderReport()};$('report-real').onclick=()=>{demoMode=false;renderReport()};$('professional-search').oninput=renderProfessionals;$('professional-type').onchange=renderProfessionals;$('print-report').onclick=()=>window.print();$('activity-search').oninput=renderActivities;$('activity-filter').onchange=renderActivities;$('activity-list').onclick=activityAction;$('sukoon-search').oninput=renderSukoon;$('profile-form').onsubmit=e=>{e.preventDefault();data.name=$('profile-name').value.trim()||'Friend';save();renderDashboard()};$('export-data').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mindmate_backup.json';a.click();URL.revokeObjectURL(url)};$('delete-data').onclick=()=>{if(confirm('Permanently delete your local assessments, activity history and profile?')){localStorage.removeItem(KEY);location.reload()}}}
init();
