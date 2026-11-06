import React, {useEffect, useMemo, useState} from 'react';
import {SafeAreaView, View, Text, Pressable, TextInput, ScrollView, StyleSheet, Modal, Alert} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {load, save} from './src/storage';
import {Product, Video, QueueItem, Result} from './src/types';
import {makePrompt, makeCaption} from './src/generator';

const key = {products:'vf_products',videos:'vf_videos',queue:'vf_queue',results:'vf_results',goal:'vf_goal'};

export default function App(){
 const [tab,setTab]=useState('Início');
 const [products,setProducts]=useState<Product[]>([]);
 const [videos,setVideos]=useState<Video[]>([]);
 const [queue,setQueue]=useState<QueueItem[]>([]);
 const [results,setResults]=useState<Result[]>([]);
 const [goal,setGoal]=useState(30);
 const [modal,setModal]=useState<null|'product'|'video'|'result'|'goal'>(null);
 const [productName,setProductName]=useState('');
 const [brand,setBrand]=useState('');
 const [price,setPrice]=useState('');
 const [selectedProduct,setSelectedProduct]=useState('');
 const [videoTitle,setVideoTitle]=useState('');
 const [views,setViews]=useState('');
 const [sales,setSales]=useState('');
 const [commission,setCommission]=useState('');

 useEffect(()=>{(async()=>{
   setProducts(await load(key.products,[]));
   setVideos(await load(key.videos,[]));
   setQueue(await load(key.queue,[]));
   setResults(await load(key.results,[]));
   setGoal(await load(key.goal,30));
 })()},[]);
 useEffect(()=>{save(key.products,products)},[products]);
 useEffect(()=>{save(key.videos,videos)},[videos]);
 useEffect(()=>{save(key.queue,queue)},[queue]);
 useEffect(()=>{save(key.results,results)},[results]);
 useEffect(()=>{save(key.goal,goal)},[goal]);

 const published=videos.filter(v=>v.status==='published').length;
 const ready=videos.filter(v=>v.status==='ready').length;
 const progress=Math.min(100,Math.round(published/Math.max(goal,1)*100));
 const productMap=useMemo(()=>Object.fromEntries(products.map(p=>[p.id,p.name])),[products]);

 function addProduct(){
  if(!productName.trim()) return Alert.alert('Informe o nome do produto');
  setProducts(p=>[{id:Date.now().toString(),name:productName.trim(),brand,price,createdAt:new Date().toISOString()},...p]);
  setProductName('');setBrand('');setPrice('');setModal(null);
 }
 function addVideo(){
  if(!selectedProduct) return Alert.alert('Selecione um produto primeiro');
  const product=productMap[selectedProduct];
  const title=videoTitle.trim()||`Vídeo — ${product}`;
  const id=Date.now().toString();
  setVideos(v=>[{id,productId:selectedProduct,title,prompt:makePrompt(product),caption:makeCaption(product),hashtags:'#Shopee #Achadinhos #Oferta',status:'ready',createdAt:new Date().toISOString()},...v]);
  setQueue(q=>[...q,{id:'q'+id,videoId:id,time:`${9+q.length}:00`,status:'queued'}]);
  setVideoTitle('');setSelectedProduct('');setModal(null);
 }
 function publish(videoId:string){
  setVideos(v=>v.map(x=>x.id===videoId?{...x,status:'published'}:x));
  setQueue(q=>q.map(x=>x.videoId===videoId?{...x,status:'published'}:x));
 }
 function addResult(){
  const video=videos.find(v=>v.status==='published');
  if(!video) return Alert.alert('Publique pelo menos um vídeo antes de registrar resultados.');
  setResults(r=>[{id:Date.now().toString(),videoId:video.id,views:Number(views)||0,likes:0,sales:Number(sales)||0,commission:Number(commission)||0},...r]);
  setViews('');setSales('');setCommission('');setModal(null);
 }

 const Card=({title,sub,onPress}:{title:string;sub:string;onPress?:()=>void})=><Pressable onPress={onPress} style={styles.card}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.sub}>{sub}</Text></Pressable>;
 const Btn=({text,onPress}:{text:string;onPress:()=>void})=><Pressable style={styles.btn} onPress={onPress}><Text style={styles.btnText}>{text}</Text></Pressable>;

 function Home(){
  return <ScrollView contentContainerStyle={styles.content}>
   <Text style={styles.title}>VideoFlow 🚀</Text><Text style={styles.sub}>Produza, organize e publique mais.</Text>
   <View style={styles.hero}><Text style={styles.orange}>META DIÁRIA</Text><Text style={styles.big}>{published} / {goal} vídeos</Text><View style={styles.bar}><View style={[styles.fill,{width:progress+'%'}]}/></View><Text style={styles.sub}>Faltam {Math.max(0,goal-published)} vídeos</Text><Btn text="⚙ Alterar meta" onPress={()=>setModal('goal')}/></View>
   <Text style={styles.section}>⚡ Produção rápida</Text>
   <View style={styles.grid}><Btn text="➕ Produto" onPress={()=>setModal('product')}/><Btn text="🎬 Criar vídeo" onPress={()=>setModal('video')}/><Btn text="📅 Ver fila" onPress={()=>setTab('Fila')}/><Btn text="📊 Resultados" onPress={()=>setTab('Resultados')}/></View>
   <Text style={styles.section}>Próximos vídeos</Text>
   {videos.slice(0,5).map(v=><Card key={v.id} title={v.title} sub={`${productMap[v.productId]||'Produto'} • ${v.status}`}/>)}
  </ScrollView>
 }
 function Products(){
  return <ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>📦 Produtos</Text><Btn text="➕ Novo produto" onPress={()=>setModal('product')}/>
  {products.length===0?<Text style={styles.empty}>Nenhum produto cadastrado.</Text>:products.map(p=><Card key={p.id} title={`${p.champion?'🔥 ':''}${p.name}`} sub={`${p.brand||'Sem marca'} ${p.price?'• R$ '+p.price:''}`}/>)}</ScrollView>
 }
 function Videos(){
  return <ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>🎬 Vídeos</Text><Btn text="✨ Criar vídeo com conteúdo automático" onPress={()=>setModal('video')}/>
  {videos.length===0?<Text style={styles.empty}>Cadastre um produto e crie seu primeiro vídeo.</Text>:videos.map(v=><View key={v.id} style={styles.card}><Text style={styles.cardTitle}>{v.title}</Text><Text style={styles.sub}>{productMap[v.productId]} • {v.status}</Text><Text style={styles.preview}>Prompt: {v.prompt}</Text><Text style={styles.preview}>Legenda: {v.caption}</Text>{v.status!=='published'&&<Btn text="✅ Marcar como publicado" onPress={()=>publish(v.id)}/>}</View>)}</ScrollView>
 }
 function Queue(){
  return <ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>📅 Fila</Text>
  {queue.length===0?<Text style={styles.empty}>Crie vídeos para montar sua fila.</Text>:queue.map(q=>{const v=videos.find(x=>x.id===q.videoId);return <Card key={q.id} title={`${q.time} — ${v?.title||'Vídeo'}`} sub={q.status==='published'?'✅ Publicado':'🟡 Aguardando postagem'} onPress={()=>q.status!=='published'&&publish(q.videoId)}/>})}</ScrollView>
 }
 function Results(){
  const totalViews=results.reduce((a,r)=>a+r.views,0), totalSales=results.reduce((a,r)=>a+r.sales,0), totalCommission=results.reduce((a,r)=>a+r.commission,0);
  return <ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>📊 Resultados</Text><Btn text="➕ Registrar resultado" onPress={()=>setModal('result')}/>
  <Card title={`👀 ${totalViews} visualizações`} sub="Total registrado"/><Card title={`🛒 ${totalSales} vendas`} sub="Total registrado"/><Card title={`💰 R$ ${totalCommission.toFixed(2)}`} sub="Comissão registrada"/>
  <Text style={styles.empty}>Próxima evolução: sincronizar automaticamente com um backend autorizado, quando houver integração disponível.</Text></ScrollView>
 }
 const screen=tab==='Início'?<Home/>:tab==='Produtos'?<Products/>:tab==='Vídeos'?<Videos/>:tab==='Fila'?<Queue/>:<Results/>;

 return <SafeAreaView style={styles.app}><StatusBar style="light"/>{screen}
  <View style={styles.nav}>{['Início','Produtos','Vídeos','Fila','Resultados'].map(t=><Pressable key={t} style={styles.navItem} onPress={()=>setTab(t)}><Text style={[styles.navText,tab===t&&styles.active]}>{t}</Text></Pressable>)}</View>
  <Modal visible={!!modal} transparent animationType="slide"><View style={styles.overlay}><View style={styles.modal}>
   {modal==='product'&&<><Text style={styles.modalTitle}>Novo produto</Text><Input p="Nome do produto" v={productName} s={setProductName}/><Input p="Marca (opcional)" v={brand} s={setBrand}/><Input p="Preço (opcional)" v={price} s={setPrice}/><Btn text="Salvar produto" onPress={addProduct}/></>}
   {modal==='video'&&<><Text style={styles.modalTitle}>Criar vídeo</Text><Text style={styles.sub}>Digite o número do produto:</Text><Input p={products.map((p,i)=>`${i+1}. ${p.name}`).join('\n')||'Cadastre um produto primeiro'} v={selectedProduct} s={(x)=>{const n=Number(x);if(products[n-1])setSelectedProduct(products[n-1].id);}}/><Input p="Título do vídeo (opcional)" v={videoTitle} s={setVideoTitle}/><Btn text="Gerar e salvar conteúdo" onPress={addVideo}/></>}
   {modal==='result'&&<><Text style={styles.modalTitle}>Registrar resultado</Text><Input p="Visualizações" v={views} s={setViews}/><Input p="Vendas" v={sales} s={setSales}/><Input p="Comissão (R$)" v={commission} s={setCommission}/><Btn text="Salvar resultado" onPress={addResult}/></>}
   {modal==='goal'&&<><Text style={styles.modalTitle}>Meta diária</Text><Input p="Quantidade de vídeos" v={String(goal)} s={(x)=>setGoal(Number(x)||0)}/><Btn text="Salvar meta" onPress={()=>setModal(null)}/></>}
   <Pressable onPress={()=>setModal(null)}><Text style={styles.cancel}>Cancelar</Text></Pressable>
  </View></View></Modal>
 </SafeAreaView>
}

function Input({p,v,s}:{p:string;v:string;s:(x:string)=>void}){return <TextInput multiline placeholder={p} placeholderTextColor="#888" value={v} onChangeText={s} style={styles.input}/>}

const styles=StyleSheet.create({
 app:{flex:1,backgroundColor:'#111'},content:{padding:20,paddingBottom:100},title:{fontSize:29,fontWeight:'900',color:'#fff'},sub:{color:'#aaa',marginTop:4},orange:{color:'#ff9500',fontWeight:'900'},big:{color:'#fff',fontSize:28,fontWeight:'900',marginVertical:8},
 hero:{backgroundColor:'#222',padding:18,borderRadius:18,marginTop:18},bar:{height:10,backgroundColor:'#444',borderRadius:10,overflow:'hidden',marginBottom:8},fill:{height:10,backgroundColor:'#ff9500'},
 section:{color:'#fff',fontSize:18,fontWeight:'800',marginTop:20,marginBottom:10},grid:{flexDirection:'row',flexWrap:'wrap',gap:8},btn:{backgroundColor:'#ff9500',padding:14,borderRadius:12,alignItems:'center',marginTop:10},btnText:{color:'#111',fontWeight:'900'},
 card:{backgroundColor:'#1d1d1d',padding:16,borderRadius:14,marginTop:10},cardTitle:{color:'#fff',fontSize:16,fontWeight:'800'},preview:{color:'#bbb',fontSize:12,marginTop:8},empty:{color:'#888',marginTop:20,lineHeight:21},
 nav:{position:'absolute',bottom:0,left:0,right:0,flexDirection:'row',backgroundColor:'#1a1a1a',paddingVertical:14},navItem:{flex:1,alignItems:'center'},navText:{color:'#777',fontSize:10},active:{color:'#ff9500',fontWeight:'900'},
 overlay:{flex:1,backgroundColor:'rgba(0,0,0,.65)',justifyContent:'flex-end'},modal:{backgroundColor:'#222',padding:20,borderTopLeftRadius:24,borderTopRightRadius:24},modalTitle:{color:'#fff',fontSize:22,fontWeight:'900',marginBottom:12},
 input:{backgroundColor:'#333',color:'#fff',borderRadius:10,padding:13,marginBottom:10,minHeight:48},cancel:{color:'#aaa',textAlign:'center',padding:16}
});
