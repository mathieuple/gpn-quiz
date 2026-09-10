function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}

function renderRows(container,rows,userId){
  const list=element('ol','leaderboard-list');
  rows.forEach((row,index)=>{
    const item=element('li','leaderboard-row'+(row.user_id===userId?' is-current':''));
    const rank=element('span','leaderboard-rank',index<3?['🥇','🥈','🥉'][index]:String(index+1));
    const name=element('span','leaderboard-name',row.display_name);
    if(row.user_id===userId)name.append(element('small','leaderboard-you','Toi'));
    item.append(rank,name,element('strong','leaderboard-score','🔥 '+row.best_combo));list.append(item);
  });
  container.replaceChildren(list);
}

function unavailable(container,status){container.replaceChildren(element('p','muted small',status==='unconfigured'?'Classement à connecter dans la configuration.':'Classement temporairement indisponible.'));}

function personalSummary(bestCombo,position){
  const summary=element('div','leaderboard-personal');
  const record=element('div','stat');record.append(element('strong','',`🔥 ${bestCombo}`),element('span','','Ton record'));
  const place=element('div','stat');place.append(element('strong','',position?`#${position}`:'—'),element('span','','Ta position'));
  summary.append(record,place);return summary;
}

export async function renderLeaderboardPreview(container,ctx){
  if(!container)return;container.replaceChildren(element('p','muted small','Chargement du classement…'));
  const result=await ctx.leaderboard.load(3);if(!container.isConnected)return;
  if(result.status!=='ready')return unavailable(container,result.status);
  if(!result.rows.length)return container.replaceChildren(element('p','muted small','Le classement attend ses premiers joueurs.'));
  renderRows(container,result.rows,ctx.user.profile.leaderboardUserId);
}

export async function renderLeaderboardFull(container,ctx){
  if(!container)return;container.replaceChildren(personalSummary(ctx.user.bestCombo,null),element('p','muted small','Chargement du classement…'));
  const result=await ctx.leaderboard.load(20);if(!container.isConnected)return;
  const summary=personalSummary(ctx.user.bestCombo,result.position),rows=element('div');
  if(result.status!=='ready'){unavailable(rows,result.status);container.replaceChildren(summary,rows);return;}
  if(result.rows.length)renderRows(rows,result.rows,ctx.user.profile.leaderboardUserId);else rows.append(element('p','muted small','Le classement attend ses premiers joueurs.'));
  container.replaceChildren(summary,rows);
}
