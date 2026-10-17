import yaml,glob,random,re,openpyxl
from openpyxl.styles import Font,PatternFill,Alignment
from openpyxl.utils import get_column_letter as CL
import os
O=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','')
L=lambda p: yaml.safe_load(open(p,encoding='utf-8'))
items={}; 
for u in range(1,11):
    for i in L(f'{O}lgs-pilot/content/unit_{u:02d}_items.yaml')['items']: items[i['id']]=i
UT={u:L(f'{O}lgs-pilot/content/unit_{u:02d}_items.yaml')['unit_title'] for u in range(1,11)}
HT='#LGS #LGS2027 #LGSİngilizce #8sınıf #İngilizceKelime #HocaNova'
posts=[]
def add(t,u,hook,body,second,visual,src):
    posts.append(dict(tur=t,unite=u,konu=UT.get(u,'Genel') if u else 'Genel',hook=hook,metin=body,ikinci=second,gorsel=visual,hashtag=HT+(f' #{UT[u].replace(" ","")}' if u else ''),kaynak=src))
# 1 TUZAK
seen=set()
for u in range(1,11):
    k=L(f'{O}lgs-kaynak/units/unit_{u:02d}_kaynak.yaml')
    for t in k.get('traps',[]):
        if t.get('kind') not in ('sahte_dost','cok_anlamli','turkce_etkisi','benzer_yazilis','dilbilgisi'): continue
        key=t['about'].lower()
        if key in seen: continue
        seen.add(key)
        add('TUZAK',u,f"⚠️ {t['about']} — çoğu öğrenci burada yanılıyor!",t['trap_tr'],'✅ '+t['tip_tr'],'Kırmızı ❌ / yeşil ✅ iki satırlık kart; Hoca Nova köşede','kaynak.traps')
    # 2 HAP
    for m in k.get('mini_lessons',[]):
        lab={'hafiza_kancasi':'🧠 Hafıza kancası','tuzak':'⚠️ Tuzak','lgs_taktigi':'🎯 LGS taktiği','kelime_ailesi':'🌳 Kelime ailesi','ilginc_bilgi':'💡 İlginç bilgi','mini_dilbilgisi':'✏️ 30 saniyede dilbilgisi'}[m['type']]
        add('HAP',u,lab,m['text_tr'],'Kaydet, sınavdan önce bir daha bak 📌','Tek kart, büyük başlık + 2–3 satır','kaynak.mini_lessons')
# 3 ÇIKMIŞ
for i in items.values():
    e=i.get('exam')
    if not e or e.get('teog_lgs_total',0)<2: continue
    lgs=e.get('lgs',0)
    add('ÇIKMIŞ',i['unit'],f"📌 Sınavda {e['teog_lgs_total']} kez çıktı{f' (LGS: {lgs})' if lgs else ''}!",f"{i['display']} = {i['meaning_tr']}",('⚠️ '+i['trap_note']) if i.get('trap_note') else 'Bunu bilmeden sınava girme!','Kelime büyük, altında Türkçesi; köşede "LGS’de çıktı" rozeti','items.exam')
# 4 SORU (ek ders alıştırmaları)
rnd=random.Random(7)
for f in sorted(glob.glob(f'{O}lgs-pilot/content/exam_course/sd_*.yaml')):
    d=L(f)
    for q in d['practice'][:3]:
        opts=q['options'][:]; idx=list(range(len(opts))); rnd.shuffle(idx)
        letters='ABCD'; shown='\n'.join(f"{letters[n]}) {opts[i]}" for n,i in enumerate(idx)); ans=letters[idx.index(0)]
        ctx=(q.get('context','')+'\n\n') if q.get('context') else ''
        u=d['units'][0] if len(d.get('units') or [])==1 else None
        add('SORU',u,'⏱️ 30 saniyede LGS sorusu — cevabını yorumlara yaz!',re.sub(r'</?u>','_',ctx+q['prompt']+'\n'+shown),f"✅ Cevap: {ans}) {opts[0]}\n{q['explain_tr']}",'1. slayt soru, 2. slayt çözüm (karusel) ya da ertesi gün hikâye','exam_course.'+q['id'])
# 5 TAKTİK + soru kökleri
sd=L(f'{O}lgs-kaynak/exam/sinav_dili.yaml')
for t in sd['tactics']: add('TAKTİK',None,'🎯 Hoca Nova’nın LGS taktiği',t['tr'],'Takip et, her hafta yeni taktik 🔔','Hoca Nova avatarı + konuşma balonu','sinav_dili.tactics')
for s in sd['stems']: add('SORU KÖKÜ',None,f"🔎 Bu soru kökünü gördüğünde ne yapmalısın?",f"“{s['en']}”\n= {s['tr']}",f"Taktik: {s['strategy_tr']}\nTuzak: {s['traps_tr']}",'Soru kökü büyük, altında Türkçe; 2. slaytta taktik','sinav_dili.stems')
for i,p in enumerate(posts,1): p['id']=f'P{i:04d}'
# 30 günlük plan: haftalık ritim
rhythm=['TUZAK','ÇIKMIŞ','SORU','HAP','SORU KÖKÜ','SORU','TAKTİK']
pools={t:[p for p in posts if p['tur']==t] for t in set(p['tur'] for p in posts)}
for t in pools: rnd.shuffle(pools[t])
plan=[]; ptr={t:0 for t in pools}
days=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']
for d in range(60):
    t=rhythm[d%7]
    if ptr[t]>=len(pools[t]): t='HAP'
    p=pools[t][ptr[t]]; ptr[t]+=1
    plan.append((d+1,days[d%7],t,p['id'],p['hook'],p['metin'][:120].replace('\n',' / ')))
# yaz
F='Arial'; HF=Font(name=F,bold=True,color='FFFFFF',size=10); B=Font(name=F,size=10); NAVY=PatternFill('solid',fgColor='1F3A5F')
wb=openpyxl.Workbook(); ws=wb.active; ws.title='ÖZET'
from collections import Counter
c=Counter(p['tur'] for p in posts)
rows=[('Hikayenglish LGS · Sosyal medya post havuzu v1 (taslak)',),('',),('TÜR','ADET','NE İŞE YARAR')]
desc={'TUZAK':'Kaydedilme ve paylaşılma (en viral tür)','HAP':'Kaydet-tekrar et; günlük değer','ÇIKMIŞ':'Güven: "sınavda çıktı" etkisi','SORU':'Etkileşim: yorum ve cevap','TAKTİK':'Koç kimliği (Hoca Nova)','SORU KÖKÜ':'Sınav dili farkındalığı'}
rows+= [(t,c[t],desc[t]) for t in desc]+[('TOPLAM',len(posts),'')]
rows+=[('',),('Haftalık ritim',' → '.join(f'{d}: {t}' for d,t in zip(days,rhythm)),''),('Önerilen biçim','Instagram karusel (1080×1350) + aynı içerik TikTok/Reels için 15–30 sn metin animasyonu',''),('Not','Metinler taslaktır; yayın öncesi göz at. SORU türünde şıklar karıştırıldı, cevap 2. slaytta.','')]
for r,row in enumerate(rows,1):
    for j,v in enumerate(row,1): cc=ws.cell(row=r,column=j,value=v); cc.font=HF if r==3 else B; 
    if r==3:
        for j in range(1,4): ws.cell(row=r,column=j).fill=NAVY
ws.cell(row=1,column=1).font=Font(name=F,bold=True,size=13,color='1F3A5F')
for j,w in enumerate([22,60,50],1): ws.column_dimensions[CL(j)].width=w
H=['id','tur','unite','konu','hook','metin','ikinci','gorsel','hashtag','kaynak']
s=wb.create_sheet('POSTLAR')
for j,h in enumerate(H,1): cc=s.cell(row=1,column=j,value=h.upper()); cc.font=HF; cc.fill=NAVY
for r,p in enumerate(posts,2):
    for j,h in enumerate(H,1): cc=s.cell(row=r,column=j,value=p[h]); cc.font=B; cc.alignment=Alignment(wrap_text=True,vertical='top')
for j,w in enumerate([8,12,7,16,40,60,50,30,30,18],1): s.column_dimensions[CL(j)].width=w
s.freeze_panes='B2'; s.auto_filter.ref=f'A1:J{len(posts)+1}'
pl=wb.create_sheet('PLAN_60_GÜN')
for j,h in enumerate(['GÜN','HAFTA GÜNÜ','TÜR','POST ID','HOOK','METİN (ilk 120)'],1): cc=pl.cell(row=1,column=j,value=h); cc.font=HF; cc.fill=NAVY
for r,row in enumerate(plan,2):
    for j,v in enumerate(row,1): cc=pl.cell(row=r,column=j,value=v); cc.font=B; cc.alignment=Alignment(wrap_text=True,vertical='top')
for j,w in enumerate([6,10,12,9,40,70],1): pl.column_dimensions[CL(j)].width=w
wb.save(f'{O}sosyal_medya/LGS_Sosyal_Medya_Post_Havuzu_v1.xlsx')
yaml.safe_dump({'schema_version':1,'posts':posts},open(f'{O}lgs-kaynak/exam/sosyal_medya_postlar.yaml','w'),allow_unicode=True,sort_keys=False,width=200)
print(c, len(posts))
