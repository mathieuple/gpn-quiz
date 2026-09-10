import {isSupabaseConfigured} from '../config/supabase-config.js';
import {getSupabaseClient} from './supabase-client.js';
import {normalizeLeaderboardProfile,setLocalDisplayName} from './leaderboard-state.js';

const offline=()=>typeof navigator!=='undefined'&&navigator.onLine===false;
const rowFrom=data=>Array.isArray(data)?data[0]:data;

export class LeaderboardService {
  constructor({getUser,saveUser,clientProvider=getSupabaseClient,isOnline=()=>!offline(),now=()=>Date.now()}={}) {
    this.getUser=getUser;this.saveUser=saveUser;this.clientProvider=clientProvider;this.isOnline=isOnline;this.now=now;
    this.syncPromise=null;this.needsResync=false;this.observedBestCombo=getUser?.().bestCombo||0;this.lastError=null;
    this.onlineHandler=()=>this.sync().catch(()=>{});
  }
  get configured(){return isSupabaseConfigured()||this.clientProvider!==getSupabaseClient;}
  setDisplayName(value){const result=setLocalDisplayName(this.getUser(),value,this.now());if(result.valid)this.saveUser();return result;}
  adoptUser(){this.observedBestCombo=this.getUser()?.bestCombo||0;}
  start(){if(typeof window!=='undefined')window.addEventListener('online',this.onlineHandler);this.sync().catch(()=>{});}
  noteBestCombo(){const user=this.getUser(),best=Math.max(0,user.bestCombo||0);if(best<=this.observedBestCombo)return false;this.observedBestCombo=best;user.profile={...normalizeLeaderboardProfile(user.profile,best),leaderboardSyncPending:true};this.saveUser();if(this.syncPromise)this.needsResync=true;else if(this.isOnline())this.sync().catch(()=>{});return true;}
  async ensureIdentity(client){const current=await client.auth.getSession();if(current.error)throw current.error;if(current.data?.session?.user)return current.data.session.user;const created=await client.auth.signInAnonymously();if(created.error)throw created.error;if(!created.data?.user)throw new Error('Identité anonyme indisponible.');return created.data.user;}
  async sync(){
    if(this.syncPromise)return this.syncPromise;
    this.syncPromise=this.performSync().finally(()=>{this.syncPromise=null;if(this.needsResync&&this.isOnline()){this.needsResync=false;queueMicrotask(()=>this.sync().catch(()=>{}));}});
    return this.syncPromise;
  }
  async performSync(){
    const user=this.getUser(),profile=normalizeLeaderboardProfile(user.profile,user.bestCombo);user.profile=profile;
    if(!profile.displayName)return {status:'missing-profile'};
    if(!this.configured){profile.leaderboardSyncPending=true;this.saveUser();return {status:'unconfigured'};}
    if(!this.isOnline()){profile.leaderboardSyncPending=true;this.saveUser();return {status:'offline'};}
    try{
      const client=await this.clientProvider(),identity=await this.ensureIdentity(client);
      const updatedAt=profile.displayNameUpdatedAt||this.now();
      const response=await client.rpc('sync_leaderboard_entry',{p_display_name:profile.displayName,p_best_combo:Math.max(0,user.bestCombo||0),p_display_name_updated_at:new Date(updatedAt).toISOString()});
      if(response.error)throw response.error;
      const row=rowFrom(response.data);if(!row)throw new Error('Réponse de synchronisation vide.');
      const remoteBest=Math.max(0,Number(row.best_combo)||0),resolvedBest=Math.max(user.bestCombo||0,remoteBest);
      if(resolvedBest>user.bestCombo){user.bestCombo=resolvedBest;user.statsUpdatedAt=Math.max(user.statsUpdatedAt||0,this.now());user.updatedAt=Math.max(user.updatedAt||0,this.now());}
      const currentProfile=normalizeLeaderboardProfile(user.profile,resolvedBest),remoteNameDate=Date.parse(row.display_name_updated_at||'')||0;
      if(remoteNameDate>currentProfile.displayNameUpdatedAt&&row.display_name){currentProfile.displayName=row.display_name;currentProfile.displayNameUpdatedAt=remoteNameDate;}
      currentProfile.leaderboardUserId=identity.id;currentProfile.lastSyncedBestCombo=remoteBest;
      currentProfile.leaderboardSyncPending=resolvedBest>remoteBest||currentProfile.displayNameUpdatedAt>remoteNameDate||currentProfile.displayName!==row.display_name;
      if(currentProfile.leaderboardSyncPending)this.needsResync=true;
      user.profile=currentProfile;
      this.observedBestCombo=Math.max(this.observedBestCombo,resolvedBest);this.lastError=null;this.saveUser();
      return {status:'synced',row};
    }catch(error){profile.leaderboardSyncPending=true;this.lastError=error;this.saveUser();return {status:'error',error};}
  }
  async load(limit){
    const sync=await this.sync();
    if(!this.configured)return {status:'unconfigured',rows:[],position:null};
    if(!this.isOnline())return {status:'offline',rows:[],position:null};
    if(sync.status==='error')return {status:'error',rows:[],position:null};
    try{
      const client=await this.clientProvider();
      const [ranking,position]=await Promise.all([
        client.from('leaderboard_entries').select('user_id,display_name,best_combo,best_combo_at').order('best_combo',{ascending:false}).order('best_combo_at',{ascending:true,nullsFirst:false}).limit(limit),
        client.rpc('get_my_leaderboard_position')
      ]);
      if(ranking.error)throw ranking.error;if(position.error)throw position.error;
      this.lastError=null;return {status:'ready',rows:ranking.data||[],position:Number(position.data)||null};
    }catch(error){this.lastError=error;return {status:'error',rows:[],position:null,error};}
  }
}
