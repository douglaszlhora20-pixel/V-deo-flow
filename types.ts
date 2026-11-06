export type Product = {
 id:string; name:string; brand?:string; price?:string; commission?:string;
 link?:string; benefits?:string; champion?:boolean; createdAt:string;
};
export type Video = {
 id:string; productId:string; title:string; prompt:string; caption:string;
 hashtags:string; status:'draft'|'ready'|'published'; createdAt:string;
};
export type QueueItem = { id:string; videoId:string; time:string; status:'queued'|'published' };
export type Result = { id:string; videoId:string; views:number; likes:number; sales:number; commission:number };
