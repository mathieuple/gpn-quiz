const INVISIBLE=/[\u200B-\u200D\u2060\uFEFF]/g;

export function cleanDisplayName(value) {
  return String(value??'').replace(INVISIBLE,'').trim();
}

export function validateDisplayName(value) {
  const displayName=cleanDisplayName(value),length=Array.from(displayName).length;
  if(length<2)return {valid:false,displayName,error:'Choisis un pseudo d’au moins 2 caractères.'};
  if(length>30)return {valid:false,displayName,error:'Choisis un pseudo de 30 caractères maximum.'};
  return {valid:true,displayName,error:''};
}

export const hasValidLeaderboardProfile=user=>validateDisplayName(user?.profile?.displayName).valid;

export function normalizeLeaderboardProfile(profile={},bestCombo=0) {
  const checked=validateDisplayName(profile?.displayName),displayName=checked.valid?checked.displayName:'';
  const lastSyncedBestCombo=Number.isFinite(profile?.lastSyncedBestCombo)?Math.max(0,Math.floor(profile.lastSyncedBestCombo)):0;
  return {
    displayName,
    leaderboardUserId:typeof profile?.leaderboardUserId==='string'&&/^[0-9a-f-]{36}$/i.test(profile.leaderboardUserId)?profile.leaderboardUserId:null,
    leaderboardSyncPending:Boolean(displayName&&(profile?.leaderboardSyncPending!==false||bestCombo>lastSyncedBestCombo)),
    displayNameUpdatedAt:Number.isFinite(profile?.displayNameUpdatedAt)?Math.max(0,Math.floor(profile.displayNameUpdatedAt)):0,
    lastSyncedBestCombo
  };
}

export function setLocalDisplayName(user,value,updatedAt=Date.now()) {
  const result=validateDisplayName(value);
  if(!result.valid)return result;
  user.profile={...normalizeLeaderboardProfile(user.profile,user.bestCombo),displayName:result.displayName,displayNameUpdatedAt:updatedAt,leaderboardSyncPending:true};
  user.updatedAt=Math.max(user.updatedAt||0,updatedAt);
  return result;
}

export function sortLeaderboard(rows) {
  return [...rows].sort((a,b)=>(b.best_combo-a.best_combo)||String(a.best_combo_at||'9999').localeCompare(String(b.best_combo_at||'9999'))||String(a.user_id).localeCompare(String(b.user_id)));
}

export const limitLeaderboard=(rows,limit)=>sortLeaderboard(rows).slice(0,Math.max(0,limit));
