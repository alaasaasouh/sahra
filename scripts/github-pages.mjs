import {execFileSync} from 'node:child_process';
const owner='alaasaasouh';const repo='sahra';const mode=process.argv[2]||'inspect';
const credential=execFileSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',stdio:['pipe','pipe','pipe'],env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}});
const fields=Object.fromEntries(credential.trim().split(/\r?\n/).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)]}));
if(!fields.password)throw Error('GitHub authentication is unavailable.');
const base=`https://api.github.com/repos/${owner}/${repo}`;
async function request(route='',method='GET',body){const response=await fetch(base+route,{method,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${fields.password}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'Sahra-Pages-Setup'},...(body?{body:JSON.stringify(body)}:{})});const data=await response.json().catch(()=>({}));return {status:response.status,ok:response.ok,data}}
const metadata=await request();if(!metadata.ok)throw Error(`Repository lookup failed (${metadata.status}).`);
let pages=await request('/pages');
if(mode==='enable'){
 const result=await request('/pages',pages.status===404?'POST':'PUT',{build_type:'workflow'});
 if(!result.ok)throw Error(`Pages setup failed (${result.status}): ${result.data.message||'Unknown error'}`);
 pages=await request('/pages');
}
const runs=await request('/actions/workflows/pages.yml/runs?per_page=3');
console.log(JSON.stringify({repository:metadata.data.html_url,visibility:metadata.data.visibility,default_branch:metadata.data.default_branch,pages:{status:pages.status,enabled:pages.ok,url:pages.data.html_url,build_type:pages.data.build_type,source:pages.data.source},workflow_runs:runs.ok?runs.data.workflow_runs.map(run=>({id:run.id,status:run.status,conclusion:run.conclusion,url:run.html_url,head_sha:run.head_sha})):[],workflow_status:runs.status},null,2));
