---
title: "全球主机厂地图：奥地利、比利时、卢森堡、瑞士、爱尔兰、丹麦、芬兰、挪威、瑞典的语言、口音与 POI 名称研究"
date: 2026-10-13
type: report
status: draft
domain: 多语种
---

# 全球主机厂地图：奥地利、比利时、卢森堡、瑞士、爱尔兰、丹麦、芬兰、挪威、瑞典的语言、口音与 POI 名称研究

> 检索日期：2026-10-13（UTC+8）。范围是地图中的语言识别、显示和检索文案事实，不是车内对话策略、研发优先级或“人群都会怎样说”的推断。本文把**语言法律地位、群体/地域分布、实际混说（code-switching）、借词、口音/方言、地名别名**分开；同一国家有多种法定语言，绝不等同于所有居民或所有场景都混说。
>
> 读取标记：**全文已读**=已读取论文/报告正文的可访问部分；**正文选段已读**=只读取检索可定位的原文段或方法/结果页；**摘要已读**=只支撑摘要明示的样本、结论和范围；**索引/馆藏记录已读**=只证实书目、题目与可获得性，不据此补造发现。官方原文另按其具体条款标注。CS=语码转换；“句内”=同一语法句内的插入或交替（intrasentential），**不是**“同一话轮”；“句间”=相邻完整句之间的转换（intersentential，即便同一说话者仍在同一话轮）；“话轮间”=说话者 A/B 的相邻话轮改变语言。单词已经被词典化、音系化或接受本地受格/复数等形态时，可能是**借词/形态整合**，不能自动标为实时 CS。

## 跨国可直接进入地图合同的结论

1. **显示与检索分离。**每个 POI 保存 `official_local_name`（地点所在行政区的官方内名）、`official_parallel_name[]`（同一对象的法定并列名）、`recognized_exonym[]`（外名）、`historic/marketing_alias[]` 与来源字段。不要把英文/中文译名伪装成“当地并称”，也不要把转写当本地读音。
2. **发音与文字不要互相推导。**本批检到的研究足以说明瑞士德语、爱尔兰英语、挪威/瑞典/芬兰的地域变体非常真实，却没有给出每一个 POI 的真人读法录音；POI TTS/ASR 应只接入运营方录音、国家地名语音库或经过母语审听的发音资产。
3. **“可遇到混说”必须有条件字段。**地图提示可用“在特定双语社群、边境/首都、教育或数字媒介语境可观察到 X↔Y 切换”，不可写“该国人普遍夹英语/另一官方语”。混说研究往往来自学生、小规模访谈、特定社媒或任务实验。
4. **地图文案不编造双语例句。**以下研究的例子和统计只作为触发/识别风险依据；没有逐条获准、可定位的口语语料时，不生成貌似“真人会说”的 POI 读法或句子。

---

## 1. 奥地利（Austria）

### 法律、地域与实际语言生态

- 宪法第 8 条规定德语为共和国的国家语言，同时承认本国既有少数族群的语言文化多样性；奥地利手语被承认为独立语言。[RIS《联邦宪法》Art. 8](https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Anlage=&Artikel=8&FassungVom=2024-04-07&Gesetzesnummer=10000138&Paragraf=&Uebergangsrecht=)
- 这不是“只会德语”的法律图景。现行《民族群体法》在其列举的机关/服务机构范围内，允许克罗地亚语、斯洛文尼亚语、匈牙利语与德语并用为官方语言；1955 条约把克恩滕、布尔根兰、施泰尔马克的斯洛文尼亚/克罗地亚少数群体和双语地名牌写得更具体。[§13](https://ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Anlage=&Artikel=&FassungVom=2026-02-10&Gesetzesnummer=10000602&Paragraf=13&Uebergangsrecht=)；[条约 Art. 7](https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Anlage=&Artikel=7&FassungVom=2026-03-15&Gesetzesnummer=10000265&Paragraf=&ShowPrintPreview=True)。适用对象是**指定地区/机关及其使用者**，不是全国双语承诺。
- 地图的德语主显示不能折叠掉奥地利德语（Österreichisches Deutsch）与维也纳、巴伐利亚—奥地利、阿勒曼尼等地方口音/方言连续体；当前收集到的研究只证实在英语授课国际班的多语互动会随“主讲/旁聊”和沟通功能改变，不证明“奥地利人日常都德英夹杂”。

### 混说与口音的原始研究证据

- **Smit（维也纳大学）**，*Classroom discourse in EMI*：维也纳一个高度国际化 English-medium instruction（英语授课）课堂的微观互动研究；馆藏全文摘要已读。结果是英语虽被选为课堂通用语，学生群体的语言选择随 main talk/side talk 和交际功能而变。[University of Vienna 记录](https://ucrisportal.univie.ac.at/en/publications/classroom-discourse-in-emi-on-the-dynamics-of-multilingual-practi/)。**边界：**摘要没有给出 N、自然日常会话比例或“德语↔英语句内率”；只能用于“国际高教场景可能出现多语资源”，不能外推到奥地利道路、家庭或全体驾驶员。
- **Eppler（维也纳大学）**研究的是在英国定居的奥地利德英双语难民社群及其混合码 *Emigranto*，不是当代奥地利本土代表样本。全文开端可读，约 60% 被述及在英奥地利人为二战前难民。[原文](https://archiv-anglistik.univie.ac.at/fileadmin/user_upload/dep_anglist/weitere_Uploads/Views/views942.pdf)。它证明要区分移民社群历史混码与国内语言行为，**不得**拿来标注维也纳/格拉茨的普遍混说。
- **口音边界：**对英语迁入奥地利者的实验研究用“code-switched paradigm”考察 L2 德语对英语 /s,w,l/ 的即时语音影响（University of Graz/ Cardiff 摘要已读），这是受控语音实验，不是奥地利英语口音分布调查。[会议摘要](https://pape2021.upf.edu/wp-content/uploads/ABSTRACTBOOK-HR.pdf)。可说“迁居者的两语语音可能相互影响”；不可据此为 POI 生成“奥地利英语口音”。

### 已核 POI：以运营方主名为准

|真实设施 POI|运营方原始主名与证据|可落地字段|
|---|---|---|
|维也纳国际机场（VIE）|[Vienna International Airport / Vienna Airport](https://viennaairport.com/en/passengers/airport)，机场运营方旅客页|`official_display=Vienna International Airport`；德语本地标签另须由其德语页面/机场地名数据验证，不能由本报告编发音。|
|维也纳中央火车站|[Wien Hauptbahnhof](https://bahnhof.oebb.at/de/wien/wien-hauptbahnhof)，ÖBB 站点页|`official_local_name=Wien Hauptbahnhof`；英语 UI 只可另存译名，不能把 *Vienna Central Station* 回写为运营方本地名。|

原 Wien/Vienna、Klagenfurt/Celovec、Eisenstadt/Željezno/Kismarton 仅保留为**待 Austrian address/toponym authority 对象级复核**的地名候选，已不作为本报告的生产 POI 别名表。

**可用于地图的准确表述：**“奥地利以德语为国家语言；在法律列举的少数族群地区和机关，克罗地亚语、斯洛文尼亚语或匈牙利语可并用。国际高教互动中观察到多语选择，但现有证据不支持把德英混说设为全国默认。”

**缺口：**未取得奥地利国家地名数据库的逐对象下载及任何经许可的 POI 人声；上线前应由 Austrian address/toponym authority 或运营商数据逐 POI 回读。

---

## 2. 比利时（Belgium）

### 法律、地域与实际语言生态

- 联邦官方语言为荷兰语、法语、德语；联邦结构同时有荷语、法语、德语三个语言共同体和佛兰德、布鲁塞尔首都、瓦隆三个大区。[Belgium.be](https://www.belgium.be/en/about_belgium/government/federale_staat)。这说明语言制度与地域/共同体绑定：佛兰德主要荷语、瓦隆主要法语且东部有德语共同体、布鲁塞尔为荷法双语的行政环境；不能用“比利时三语”推成单个用户会三语。
- 对口音，至少要把荷语的弗拉芒/Brabant 等区域变体、比利时法语及东比利时德语社群分层。英语是外语/国际沟通资源，不能当法定共同体语言。

### 混说与口音的原始研究证据

- **Jeanine Treffers-Daller，1992，*French-Dutch Codeswitching in Brussels***：研究的是出生于布鲁塞尔、在当地荷语与法语变体间的**句内**转换。论文摘要/作者上传全文入口已读，报告年长布鲁塞尔人更常转换，年轻一代少得多；受过荷语教育、掌握标准比利时荷语较好者转换更少。[DOI/论文入口](https://doi.org/10.1080/01434632.1992.9994488)。**边界：**当前可核摘要未显示可复算 N；结论是代际和教育关联，不是对 2026 所有布鲁塞尔人、其他城市或车内 POI 读法的频率预测。
- 该研究刻意讨论 intrasentential CS；这和道路上“完整转成另一种服务语言”不同。产品标注应至少区分：`intrasentential_switch`、`intersentential_switch`、`turn_boundary_language_change`、`established_loan/standard_term`；前三者不能只靠词形判定。

### 已核 POI：以运营方/铁路方并列名为准

|真实设施 POI|运营方原始主名与证据|可落地字段|
|---|---|---|
|布鲁塞尔机场|[Brussels Airport](https://www.brusselsairport.be/en/our-airport)；同一运营方荷语企业页使用 *Brussel Airport*|保存运营方页面语言中的 `Brussels Airport` / `Brussel Airport`；不可由此扩写法语或德语同义名。|
|南站|[Bruxelles-Midi / Brussel-Zuid](https://www.belgiantrain.be/en/station-information/brussel-bruxelles/zuid-midi)，SNCB-NMBS 同一对象页明确双名|`official_parallel_name=[Bruxelles-Midi, Brussel-Zuid]`；两者不是两个 POI。|

原 Liège/Luik/Lüttich、Eupen/Néau 未获同一官方对象记录的逐项复核，移出生产候选；需市政/地名服务或运营方站点页再加回。

**可用于地图的准确表述：**“比利时的三种官方语言按共同体与地区组织；布鲁塞尔荷法双语环境存在过可观察的句内转换，但一项经典研究已发现其在较年轻本地人中减少，不能作为全国默认。”

**缺口：**本轮未读取布鲁塞尔官方地名服务/API 的逐 POI 语言字段；“Bruxelles/Brussel”之外的并列名要以官方街道/交通运营者实时数据确认。

---

## 3. 卢森堡（Luxembourg）

### 法律、地域与实际语言生态

- **法律层次必须拆开：**1984《语言制度法》称卢森堡语为国家语言；立法与执行条例以法语起草且法语文本具权威性；行政/司法可使用法语、德语或卢森堡语，行政机关尽可能以申请人使用的三语答复。[Legilux 原法 Art. 1–4](https://legilux.public.lu/eli/etat/leg/loi/1984/02/24/n1/jo)。学术项目常把这三者简述为国家的“三种官方语言”，但地图数据模型应保留上述功能差异；英语在跨国工作/数字媒介中是重要通用语。[卢森堡大学 Infolux](https://infolux.uni.lu/promotionsprojekte/)。这仍不意味着一个人会在每句话混三语。
- 需另列：卢森堡公民母语者、通勤跨境工作者（法国/比利时/德国）、葡语等移民社群、学校/政府/零售等场景。语言选择可能是“按对话对象整段切换/迁就”，不是句内 CS。

### 混说与口音的原始研究证据

- **Anne Franziskus & Julia de Bres（卢森堡大学，2015）**：对卢森堡跨境劳动者作问卷，馆藏记录/论文 PDF 摘要已读。结果：全部参与者具多语履历；被调查工作场所都使用法语，多数参与者日常工作使用不止一种语言，形式包括 accommodation、lingua franca、CS 和 receptive multilingualism；约三分之二报告学过卢森堡语。[大学馆藏](https://orbilu.uni.lu/handle/10993/23620)。**边界：**当前摘要没有可安全引用的总 N；是跨境劳动者样本，不能代表居民、学生、道路服务或每一行业。它尤其提醒我们，不要把“工作日使用多语言”误写成“句内频繁混说”。
- **Jacques Spedener（卢森堡大学，在研）**：以 RTL 新闻平台的书面卢森堡语数字互动为来源，使用访谈/感知研究/NLP 混合方法研究 CS。[项目页](https://infolux.uni.lu/promotionsprojekte/)。状态是**项目说明已读、非已完成的比例证据**，只能作为未来数据源，不能声明其定量结果。
- **口音/地方变体：**大学的 *Schnëssen* 众包项目让参与者翻译德/法句、看图命名并填社会语言学问卷，目的是建设当代口语卢森堡语的变异与变化语料。[项目页](https://www.uni.lu/fhse-en/research-projects/schnessen-crowdsourcing-variation-and-change-in-spoken-luxembourgish/)。它证实需把卢森堡语内部变异当作可测对象；不能从法/德拼写推断某 POI 的本地发音。

### 已核 POI：以运营方主名为准

|真实设施 POI|运营方原始主名与证据|可落地字段|
|---|---|---|
|机场|[Luxembourg Airport](https://www.lux-airport.lu/wp-content/uploads/2025/04/Airport-Rules-and-Regulations-ENG-250425.pdf)，运营方规则第 3 页列名称、IATA `LUX` 与运营主体 lux-Airport|`official_display=Luxembourg Airport`、`iata=LUX`；英语规则不证明 Lëtzebuerg/Luxemburg 是该设施的法定并列名。|
|中央车站|[Luxembourg（Gare de Luxembourg）](https://www.cfl.lu/fr-FR/network/station/Gare-de-Luxembourg)，CFL 站点页|保存页面对象名 `Luxembourg` 与文本中的 `Gare de Luxembourg`；其他语名须由 Geoportail/官方地名表对象级验证。|

原 Lëtzebuerg/Luxembourg/Luxemburg、Esch-Uelzecht/Esch-sur-Alzette/Esch an der Alzette 均降为**待 Geoportail 对象级验证**，不作为生产别名。

**可用于地图的准确表述：**“卢森堡的多语使用与对话对象、通勤工作和制度场景高度相关；跨境劳动者研究显示多语言工作日常和多种适应方式，不能把它简化成全国、句句三语混说。”

**缺口：**本轮未获得 Geoportail 的逐实体语言属性及原始口语录音；要接入官方 Geoportal/地籍或运营商 POI 后才可落地主名优先级。

---

## 4. 瑞士（Switzerland）

### 法律、地域与实际语言生态

- 全国语言为德语、法语、意大利语、罗曼什语；联邦官方语言是德/法/意，罗曼什语在与其使用者往来时为官方语言。[《语言法》Art. 5，2026-01-01 修订有效](https://www.fedlex.admin.ch/eli/cc/2009/821/en)。伯尔尼、弗里堡、瓦莱为法德多语州；格劳宾登有德/罗/意，Biel/Bienne 是法德双语城市。[瑞士外交部说明](https://www.aboutswitzerland.eda.admin.ch/en/multilingualism)。大多数人生活在自己的语言区，官方资料明确说并非人人熟练掌握四语。
- **瑞士德语不是“带口音的标准德语”**：德语区日常使用一组阿勒曼尼方言（Basel、Zürich、Bern 等差异明显），书写通常使用标准德语；法国区有瑞士法语地域口音，意语区有瑞士意大利语与伦巴第相关方言，罗曼什本身有 Sursilvan、Sutsilvan、Surmiran、Puter、Vallader 等变体。[官方语言与方言页](https://www.aboutswitzerland.eda.admin.ch/en/languages-and-dialects)。

### 混说、借词与口音的原始研究证据

- **Schmid et al., 2019，*Language control and lexical access in diglossic speech production***：17 名伯尔尼州本地 Bernese Swiss German 母语者，18–28 岁（均值 22.8），图片命名的颜色提示受控切换实验；全文方法/样本信息已读。[论文页](https://www.sciencedirect.com/science/article/pii/S0749596X19300294)。作者指出社会语言学上 Swiss German 与 Standard German 的同一会话内切换很少、说话者倾向避免混合，但会在课堂→私密讨论、朗读书面语等场景整体换变体。**边界：**这证明双变体控制和实验 switch cost，不能估计自然路况中的切换率。
- **Siebenhaar，2006**，瑞士德语 IRC 房间的量化 CMC 研究：摘要/出版社全文页已读，指出德语区方言横跨社会阶层、标准语主要在规定场合使用，并将线上 CS 放回定量分布分析。[Wiley 记录](https://onlinelibrary.wiley.com/doi/10.1111/j.1467-9841.2006.00289.x)。**边界：**IRC 是历史数字媒介，不能用作语音/POI 读法证据。
- **Cathomas，瑞士 SMS 四语料比较**：26,000 条 SMS，比较瑞士德语、法语、意大利语、罗曼什中的 CS 绝对数量、来源语言、语法性质与可能功能。[Neuchâtel 大学馆藏](https://libra.unine.ch/entities/publication/44bb5bc2-0a43-4dd1-b588-d2ff28e37d16)。这是本批较大书面真实数据，但仍是 SMS；需将单词借入、句内插入、完整句转换分别标注。

### POI 名称

瑞士联邦测绘局的规则很适合直接作产品合同：居民点主用行政程序确定的当地官方内名；语区边界才可并列；不同语区认可外名可列为外名，但它们**不是官方名**；真正双语地名（例如 Biel/Bienne、Domat/Ems）用斜杠整体作为官方名。[swisstopo](https://www.swisstopo.admin.ch/en/swiss-geographic-names)。

已核的设施对象另有两项，不以城市外名替代：运营方 [Flughafen Zürich](https://www.flughafen-zuerich.ch/de/passengers) 的德语主名是 **Flughafen Zürich**（英文页面为 Zurich Airport）；SBB 的对象页为 [Zürich Hauptbahnhof / Zurich main station](https://www.sbb.ch/en/travel-information/stations/find-station/zuerich-hb-station.html?tracking-marketingurl=shopville-zuerich-gare-centrale)。前者可存 `official_local_name=Flughafen Zürich`、后者可存 `official_local_name=Zürich Hauptbahnhof`，英文为 UI 本地化字段而非再造的“平行官方名”。

|对象|内名/官方并列名|外名示例|地图规则|
|---|---|---|---|
|双语城市|Biel/Bienne|—|保留斜杠整体，不拆为两个不同 POI。|
|格劳宾登市镇|Domat/Ems|—|官方双组成名称，不能只显示一半。|
|日内瓦州/城|Genève|Genf（德）、Ginevra（意）、Geneva（英）|法语区内名是 Genève；其它为检索/本地化外名，不能据拼写编语音。|

**可用于地图的准确表述：**“瑞士按语区多语，个人并非默认四语。德语区应将 Swiss German 方言与 Swiss Standard German 分开；自然同会话混用两者较少，场景切换与书面/朗读触发更有证据。”

**缺口：**SMS 研究虽大但非车内口语；四种语区、跨语区服务台与 POI 真实读法仍须分别取得授权口语语料/运营商录音。

---

## 5. 爱尔兰（Ireland）

### 法律、地域与实际语言生态

- 爱尔兰语是第一官方语言、英语是第二官方语言；政府目标包括使 Gaeltacht（盖尔语区）保持为活语言社区，同时扩大全国的使用。官方部门要求标识、录音公告、公众文件等在两种官方语言的服务责任下处理。[gov.ie 官方语言法说明，2025 更新](https://www.gov.ie/en/department-of-climate-energy-and-the-environment/organisation-information/official-languages-act/)。官方 2025 教育页显示 92% 小学以英语授课、8% 提供爱尔兰语教学，且后者包含 Gaeltacht 和区外 gaelscoileanna。[教育部](https://www.gov.ie/en/department-of-education/publications/language-education-through-english-or-through-irish/)。
- 所以须分别建模：英语占优势的全国环境、Gaeltacht 活跃社群、爱尔兰语授课学校、北爱尔兰（本国任务范围外，法律制度另行核对）。**Irish English（爱尔兰英语）与 Irish（爱尔兰语）也不是一层概念**：前者有地域/社会口音和受爱尔兰语历史影响，后者是一种凯尔特语；不能把“爱尔兰英语口音”写成“爱尔兰语口音”。

### 混说、借词与口音的原始研究证据

- **Tina M. Hickey，UCD，2009，*Code-switching and borrowing in Irish***：10 名爱尔兰语母语的 naíonraí（Gaeltacht 爱尔兰语学前班）女负责人，30–50 岁；资料来自对 60 名儿童的观察研究。论文可获取部分/样本段已读。研究量化其言语中的英爱切换，并明确区分 single-word CS 与已借入/音系同化的 loan；报告母语者的句内切换中 discourse markers 很重要，引用一个心脏地带 Gaeltacht 研究中该类标记占 66%。[UCD 原文](https://researchrepository.ucd.ie/bitstreams/d51c76f2-59f6-46d4-a81e-c891b4a1901c/download)。**边界：**10 位教育者不是全体爱尔兰人；“66%”是引用的先前研究结果，不能移作本研究总体或地图频率。
- **NicLeoid，2023，Conamara Gaeltacht 年轻说话者**：论文馆藏摘要/结论已读，量化发现句内 CS 多于句间 CS，但语料中爱尔兰语单语话轮仍占多数。[爱丁堡馆藏](https://era.ed.ac.uk/items/3ca0e450-c55b-494f-aa1e-27b25f91b727)。这正反驳“Gaeltacht 青年都整句英语”的简单叙述；但其地区、年龄和采集期限制极强。
- **数字书面补充，不作语音外推：**DCU 的金标推文语料 1,537 条中，326 条（21.2%）至少有一个被标记为英语的词；论文也给出句内和句间例。全文片段已读。[DCU 论文](https://doras.dcu.ie/21014/1/Teresa_PhDThesis_final.pdf)。推文拼写/标签不是语音，更不能直接给导航读法。

### POI 名称

|对象|爱尔兰语（Gaeilge）|英语|地图规则|
|---|---|---|---|
|首都|Baile Átha Cliath|Dublin|作为双官方语名称字段；不要把带重音的爱尔兰语当作英语的“拼写变体”。|
|凯里 Gaeltacht 城镇|Daingean Uí Chúis|Dingle|国家地名令已明确这两个才是正式形式，替换旧的 An Daingean 争议用法。[Placenames Orders](https://www.logainm.ie/en/resources/orders)。|
|都柏林街名|见本地官方 Irish/English 表|见同左|由地方当局负责正确双语街名，Placenames Branch 提供建议；应接 `logainm.ie` 对象 ID 而非自译。[官方数据库说明](https://www.logainm.ie/en/1380379)。|

**已核实际设施：**[Dublin Airport](https://www.dublinairport.com/at-the-airport) 的运营方页面直接使用该名并提供机场图；[Dublin Heuston](https://www.irishrail.ie/en-ie/station/dublin-heuston) 是 Irish Rail 的站点对象名，且列出站址 *Heuston Station, Dublin 8*。两个对象均应先保存运营方主名；爱尔兰语设施名要由 `logainm.ie` 或运营方双语界面逐对象补入，不从城市名机械翻译。

**可用于地图的准确表述：**“爱尔兰的爱尔兰语—英语双官方服务与 Gaeltacht 社群并存；Gaeltacht 特定青年/教育者语料确有句内英爱转换，但研究样本并不支持将混说或任何单一爱尔兰英语口音设为全国默认。”

**缺口：**需要按县/口音区和 POI 所在 Gaeltacht 范围取权威语音，不能依据地名字母推读音。

---

## 6. 丹麦（Denmark，丹麦本土；法罗/格陵兰另列）

### 法律、地域与实际语言生态

- 丹麦本土事实资料将 Danish 列为语言，English 为主导的第二语言。[丹麦外交部事实页](https://um.dk/rumaenien/en/about-denmark/facts-about-denmark/)。这不是“英语官方化”。丹麦王国内法罗群岛和格陵兰具有广泛自治；格陵兰语是格陵兰自治法下的官方语言，不能误并入“丹麦本土丹英”的默认模型。[外交部王国关系说明](https://um.dk/en/foreign-policy/the-arctic/greenland-and-the-faroe-islands)；[丹麦提交的 ICCPR 报告](https://um.dk/-/media/websites/umdk/danish-site/udenrigspolitik/folkeretten-og-menneskerettigheder/menneskerettigheder/denmarks-sixth-periodic-report-iccpr.ashx)。
- 口音/方言应把 Copenhagen/Zealand、Jutland、Fyn 等丹麦语变体与 “Danish-accented English” 分开，法罗语、格陵兰语也不能只视为丹麦语口音。

### 混说与口音的原始研究证据

- **Lotte Eggert Kiil，哥本哈根大学，2011**：*Danish University Students' Use of Code-Switching During English-Medium Instruction*，两个哥大生命科学英语授课课程的个案。[KU 系列页](https://cip.ku.dk/english/research/cip_series/)。目录和论文文件（[C3 PDF](https://cip.ku.dk/forskning/studier_i_parallelsproglighed/CIP_3_-_Samlet_med_forside_til_web.pdf)，129 页）均已取得；但该 PDF 本轮无法抽出可读文字，未能做正文阅读，故只以**索引/书目已读、文件已取得未读**标注。它是“丹麦大学 EMI 课堂”而不是道路/客服/全国口语；不能从目录或文件页数填入虚构 N/录音时长。
- **学习者而非居民基线的反例：**关于丹麦语初学者的研究分析英语母语交换生与波兰非沉浸大学生怎样用英/德词填词汇空缺。[论文全文入口](https://www.researchgate.net/publication/229685070_Code-switching_as_a_communication_learning_and_social_negotiation_strategy_in_first-year_learners_of_Danish)。它可说明二语学习会诱发切换，**不可**表示丹麦母语者习惯。
- **自然口语材料的精确状态：**Kiil 的条目是 KU 同行评审系列 C3，目录明确标为两门课程的 case study。虽已拿到 129 页 PDF，但本轮文本层提取与本地 OCR 均未产出可读正文，所以它仍不是“全文已读”或“正文选段已读”；不把它写成已核录音小时数/N。相邻的 [Køge Project Conversation 903](https://septentrio.uit.no/index.php/nordlyd/article/view/37) 是丹麦语—土耳其语课堂/青少年会话而非丹英语料；页面超时，只有索引摘要可读。它可提示丹麦本土有自然会话 CS 项目，不能替 Kiil 补造丹英频率。

### POI 名称

|对象|本地丹麦语名|外名/另一个法域名|地图规则|
|---|---|---|---|
|首都|København|Copenhagen（英语外名）|本地 UI 主名 København；英文 UI 可显示 Copenhagen，双向检索。|
|第二大城市|Aarhus|Aarhus（跨语言常同形）|同形不等于同发音；无录音不推 TTS。|
|法罗群岛首府（王国内、非丹麦本土）|Tórshavn|—|单列自治法域/法罗语数据源，不能当 Copenhagen 周边的丹语 POI。|
|格陵兰首府（王国内、非丹麦本土）|Nuuk|Godthåb（历史丹语名）|主显示 Nuuk；历史别名仅作检索且标历史，不与现代官方名等价。|

**已核实际设施：**[Copenhagen Airport](https://www.cph.dk/en) 的运营方英语页用该名、丹麦语铁路方把同一服务节点写为 [Københavns Lufthavn (CPH Airport)](https://www.dsb.dk/trafikinformation/stationer/kobenhavns-lufthavn-kastrup/)；[København H](https://www.dsb.dk/trafikinformation/stationer/kobenhavn-h/) 是 DSB 的站点主名，并说明全名 *Københavns Hovedbanegård*。因此保存 `official_local_name=København H`，Copenhagen/Copenhagen Airport 是英文界面/外名字段；法罗、格陵兰 POI 不共用这条丹麦本土证据。

**可用于地图的准确表述：**“丹麦本土以丹麦语为主，英语是重要第二语言；已检出的混说证据集中在哥本哈根大学 EMI/学习者语境。王国内的法罗群岛和格陵兰必须按各自语言制度和地名权威单列。”

**缺口：**需要丹麦国家地名库、区域口音语料和丹麦本土自然对话研究，才可给 POI 读音/混说概率。

---

## 7. 芬兰（Finland）

### 法律、地域与实际语言生态

- 芬兰语与瑞典语是《Language Act》意义上的国家语言；国家与地方机关按行政区单语/双语地位提供服务，萨米语在机关中的权利另由法律规定，奥兰群岛另有自治语言条款。[Finlex 英译法](https://www.finlex.fi/api/media/statute-foreign-language-translation/688467/mainPdf/main.pdf?timestamp=2003-06-05T21%3A00%3A00.000Z)。故模型应按芬兰语区、瑞典语/双语海岸和都市地区、萨米地区、Åland 分层，而不是“芬兰所有人芬瑞双语”。
- 口音至少区分芬兰语多方言、Finland-Swedish 多地区变体及英语二语口音。研究已展示 Finland Swedish 规范化可覆盖六个地区，说明单一“芬兰瑞典语口音”也过粗。[研究摘要](https://arxiv.org/abs/2012.05318)。

### 混说与口音的原始研究证据

- **Jylkkä et al., 2017（Åbo Akademi / Helsinki）**：网络研究的 Finnish–Swedish early bilinguals；实验 1 N=66（16–41 岁），实验 2 N=111（18–69 岁），研究自报日常 language switching 与执行功能任务的关系。[原文 PDF](https://helda.helsinki.fi/server/api/core/bitstreams/16f56c4d-49da-4b42-8f39-26b03bdbfea1/content)。**边界：**样本是早期双语者且 switch 为自报，研究不是道路自然会话；可证实“存在个体差异的日常切换经验”，不能给全国比例或句内/句间分布。
- **Mirja Saari，2007，赫尔辛基双语青少年**：同行评审章节，研究赫尔辛基青年的 CS。[Helsinki Research Portal](https://researchportal.helsinki.fi/en/publications/code-switching-im-kontext-von-zweisprachigkeit-am-beispiel-von-ju)。馆藏记录已读，但未取到全文样本量/统计，故不声称具体方向。
- **Halmari，赫尔辛基大学语料页**分析 3 名 Finnish–English 双语兄妹 467 封 email（45,340 词），发现书写中 alternational 转换较口语中的 insertional 相对更多且个体差异很大。[原文](https://varieng.helsinki.fi/series/volumes/15/halmari/)。**边界：**研究者样本为迁居美国后仍与芬兰关联的家庭，语言对是芬英；不能替代芬兰国内芬瑞行为。
- **自然会话补充：**[Kolu，JYU 馆藏记录](https://jyu.finna.fi/Record/jyx.123456789_56859)研究 Haparanda、Helsinki、Stockholm 的双语青少年在学校外的非正式对话，探问芬兰语↔瑞典语切换的情境、文化和语用触发；馆藏**摘要/索引已读**（原页 robots 拒绝全文），摘要给出的具体方向是 Stockholm 会话中若以芬兰语为 base language，参与者切换更频繁。它是自然互动而非问卷，但跨三城，不能单独当作“芬兰全国”率。

### POI 名称

|对象|芬兰语|瑞典语|地图规则|
|---|---|---|---|
|首都|Helsinki|Helsingfors|双语法域 POI 建两种官方字段，主显示跟 UI/对象所在地官方规则。|
|西南城市|Turku|Åbo|不要把 Åbo 当历史错拼；它是瑞典语名。|
|奥卢|Oulu|Uleåborg|同样保留可检索官方瑞典语字段。|

**已核实际设施：**[Helsinki Airport](https://www.finavia.fi/en/airports/helsinki-airport?navref=paragraph) 是 Finavia 的机场对象名；[Helsinki（Central railway station）](https://www.vr.fi/en/railway-stations-and-routes/helsinki) 是 VR 的英文站点对象页。这里两页均为英语界面，只能可靠写入 `operator_display_en`；芬兰语/瑞典语正式平行名仍应由 National Land Survey 或运营方本地化 API 返回，不能从英语页扩推。

可用的权威数据接入方向是 Helsinki 与 Turku 大学等建设的芬瑞公共/私域翻译材料库，而不是从网页拼写抓取：FISKMÖ 的目标是收集芬瑞两方向正式翻译材料并建设公开平行语料。[项目页](https://blogs.helsinki.fi/fiskmo-project/)。它是平行翻译文本，不是发音/混说库。

**可用于地图的准确表述：**“芬兰的芬兰语—瑞典语双语权利由行政区决定，另有萨米与奥兰制度；早期双语者确有日常切换经验但个体差异大，不能将芬瑞混说或单一 Finland-Swedish 发音推广到全国。”

**缺口：**需接 National Land Survey 的权威地名/行政语言字段与 POI 音频，不能用并行翻译语料替代。

---

## 8. 挪威（Norway）

### 法律、地域与实际语言生态

- 2021《语言法》目的之一是促进 bokmål 与 nynorsk 平等；挪威语为国家主语言，bokmål 与 nynorsk 是公共机关中平等的两种书面语；萨米语与挪威语具有同等价值并在萨米法第 3 章规定范围内平等，Kven、Romani、Romani chib 受保护。[政府说明](https://www.regjeringen.no/no/dokumenter/spraklova/id2872424/)；[法案条文说明](https://www.regjeringen.no/no/dokumenter/prop.-108-l-20192020/id2701451/?ch=21)。这首先是**书面标准/行政权利**，不等于全国口语只在两种“bokmål/nynorsk 口音”之间切。
- 挪威语地方方言在日常语音中非常关键；萨米语也有 North/Lule/South 等，行政区内法律地位有边界。[萨米法英文版](https://www.regjeringen.no/en/documents/the-sami-act-/id449701/)。因此“Norwegian-accented English”必须按母语地区、方言、年龄/迁居史建标签。

### 混说与口音的原始研究证据

- **Camilla Bergstøl，NTNU，2017**：7 位挪威参与者分 18 岁、30 岁、40–50 岁三年龄组的 Norwegian–English CS 研究，馆藏摘要已读。三组均见引述/mimicry、对文化借项和固定表达的距离/怀疑等功能；30 岁组总转换和复杂转换最多。[NTNU Open](https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/2482834?locale-attribute=en)。**边界：**N=7、硕士论文且年龄组很小；不能导出“30 岁挪威人最爱夹英语”的产品规则。
- **社媒补充：**NTNU 对 TikTok 英挪 CS 的分析发现许多英语名词接受挪威语屈折，英语复数 -s 只出现在单音节名词；切换既可能填补词汇缺口，也可能发生在已有挪威语等价词时。[馆藏记录](https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/3075817?show=full)。这说明 `English_token + Norwegian_inflection` 需先判为可能融入式借入/形态整合，而不是自动即时 CS；同样不应外推至口语导航。
- **自然口语补充：**[Walla，UiT 2017](https://munin.uit.no/handle/10037/13620)使用一名在挪威北部长大的挪英双语儿童 Hedda 在 2;3–3;3 岁与两种语言母语者交谈的语料，研究其 code mixing、主导语言与话语策略；馆藏摘要已读，正文 PDF 可取但本轮未做逐页统计摘录。它是纵向自然互动，却是单儿童家庭获得研究，不能代表成人服务或全国。
- **非英语但重要的自然变体切换基线：**Gumperz 的 Hemnesberget 田野研究由奥斯陆大学社会学所支持，与 Jan-Petter Blom 合作；研究对象是北挪威社区的言语行为。[原始论文记录](https://anthrosource.onlinelibrary.wiley.com/doi/10.1525/aa.1964.66.suppl_3.02a00100)。后续 Mæhlum 1996 对其“Ranamål 方言↔Bokmål”描写提出方法论反驳。[论文摘要](https://www.sciencedirect.com/science/article/pii/0378216695000275)。它证明方言/标准语切换不应和英挪混说混成同一机制。

### POI 名称

挪威测绘局（Kartverket）列出了挪威语、萨米语、Kven 语并列的县市名称，是地图别名的首选权威来源。[官方名称表](https://www.kartverket.no/til-lands/stadnamn/samiske-og-kvenske-fylkes-og-kommunenamn)。

|对象|挪威语|萨米语/克文语并列名|地图规则|
|---|---|---|---|
|Troms 郡|Troms|Romsa（北萨米）/ Tromssa（克文）|作为官方地名字段，不把三者说成挪威语不同口音。|
|Trondheim 市|Trondheim|Tråante（南萨米）|双向检索；显示规则取官方 feature 的语言属性。|
|Trøndelag 郡|Trøndelag|Trööndelage（南萨米）|同上，保留变音符。|

**已核实际设施：**[Oslo Airport](https://www.avinor.no/en/airport/oslo/) 是 Avinor 运营对象；[Oslo S](https://www.banenor.no/reise-og-trafikk/stasjoner/-o-/oslo-s/) 是 Bane NOR 的站名（英文页明确解释为 Oslo central station）。保存 `official_local_name=Oslo S` 而非把说明性英语 *Oslo Central Station* 覆盖为本地正式名。

**可用于地图的准确表述：**“挪威语的 bokmål/nynorsk 是平等书面标准，口语方言与萨米语权利是另一个层次；小样本和社媒研究均发现英挪转换及英语词的挪威语形态整合，不能设置为全国默认。”

**缺口：**缺少跨区域大样本自然车内/服务对话和逐 POI 人声；须从 Kartverket 的 SSR 数据获得对象级语言名，不手工维护总表。

---

## 9. 瑞典（Sweden）

### 法律、地域与实际语言生态

- 2009《语言法》将瑞典语定为社会共同主语言，法院和行政机关语言为瑞典语；芬兰语、意第绪语、Meänkieli、Romany Chib、萨米语是国家少数语言，公共部门有保护和促进责任。[法律英文版 §5–10](https://www.government.se/contentassets/16ba706f40854a87b910941caf3891d1/language-act-in-english.pdf)。这不把英语纳入法定官方/少数语言，也不代表每个瑞典语使用者会说少数语言。
- 口音/变体应至少分瑞典语地域方言、瑞典芬兰语/Meänkieli、各萨米语、移民多族裔青年语与 L2 英语；不要把它们压成一个“瑞典口音”。官方语言政策明确同时支持本国语、少数语和外语学习。[政府政策页](https://www.government.se/government-policy/culture/objectives/)。

### 混说、借词与口音的原始研究证据

- **Rosenberg，Lund University，2014**：两个瑞典网络讨论区（游戏、吉他）各约 16,400 词，合计发现 1,093 个 Swedish–English CS；单词级 1,059、较长字符串/分句 34；英语词中名词最多，英语词根动词更常接受瑞典语屈折（61.3% vs 普通名词 22.7%）。[大学全文摘要](https://www.lunduniversity.lu.se/publication/4253187)。这是很清楚的**书面句内插入**证据，也提示需区分“本地形态整合的借入”与真正替换；但论坛语言、2013 采样，不能预测口语或全体用户。
- **Grunditz，Lund，2025**：3,753 条瑞典 YouTube 短视频评论，按功能分 6 类；英语 CS 最常用于强调性表达，较少用于澄清。[大学记录](https://www.lunduniversity.lu.se/publication/9215105)。**边界：**本科论文、平台文本；可作为年轻数字书面语的信号，非全国语音结论。
- **自然口语补充：**一项瑞典学前教育研究将教师与儿童在游戏、用餐、教学、读绘本等正常活动中多次录像，跨度六个月；其英语材料分析显示儿童在游戏中用英语借词/表达，共同玩耍框架里 *backfire* 这类较少见词更像 CS 而非固定借词。[研究正文摘要](https://www.degruyterbrill.com/document/doi/10.1515/multi-2022-0062/html)。本轮为**摘要/可检索正文选段已读**，未取得可复算儿童数/小时数；它是自然口语但仅学前组，不能替代青年/成人瑞典英语。
- 这些研究均不等于“英语借词=实时切换”。名字、游戏术语与已融入瑞典语的词还须词典/语料判定；地图只能据此保留 `possible_English_insertion` 的离线识别研究标签，不能做用户画像。

### POI 名称

瑞典语与萨米/芬兰/Meänkieli 并列地名不能由英文地图反推。瑞典语言与民俗研究所（Isof）明确展示北部多语区地名经常同时有萨米语、瑞典语、也可能芬兰语或 Meänkieli；一些瑞典名是萨米名的瑞典化或翻译。[Isof](https://www.isof.se/namn/pa-gang/nyheter/nyheter-namn/2026-03-20-samiska-ortnamn-i-webbutstallning)。

|对象|瑞典语|萨米语/Meänkieli 相关名|地图规则|
|---|---|---|---|
|Kiruna|Kiruna|Giron（北萨米）；Kieruna/相关山名体系见 Isof|不要把 Giron 当音译；用国家地名对象确认语言标签。|
|Jokkmokk|Jokkmokk|Jåhkåmåhkke（Lule Sami）；Dálvvadis 为同一聚居地的 Lule Sami 平行名|并列名与词源/历史名分字段。|
|北部多语道路 POI|以当地官方瑞典语主名为准|按县市/地名机关登记的萨米、Meänkieli、芬兰语名|若无权威对象字段，不凭双语路牌照片批量生成别名。|

**已核实际设施：**[Stockholm Arlanda Airport](https://www.swedavia.se/arlanda) 是 Swedavia 运营的机场对象名；[Stockholms Centralstation](https://www.jernhusen.se/hitta-din-station/stockholms-centralstation/trafik-och-biljetter/) 是 Jernhusen 站点页标题和地址对象。英语为产品显示语言时可按 UI 加译名，但运营方瑞典语主名必须留存。

**可用于地图的准确表述：**“瑞典语是公共部门主语言，五种国家少数语言受保护；瑞典英语混说的实证主要来自论坛/社媒书面语，常见为单词插入并可能发生瑞典语形态整合，不能视作全国口语默认。”

**缺口：**需要 Lantmäteriet/地方交通运营商的逐 POI 多语名称与发音资产；Isof 说明了多语原则但不是完整导航别名库。

---

## 统一落地边界与后续取数清单

- **可立即写入地图资料模型：**以上国家/地区的官方语言和地名多名事实；对瑞士、爱尔兰、挪威、瑞典可直接引用的官方地名管理原则；每个国家的 `source_url`、`retrieved_at=2026-10-13`、`name_type`。
- **只能做受限研究标签：**比利时布鲁塞尔法荷句内转换（代际差异）、爱尔兰 Gaeltacht 英爱切换、瑞士德语—标准德语的双变体控制、丹麦 EMI、芬瑞早期双语、挪威小样本/社媒英挪、瑞典论坛/社媒瑞英。它们都应带 `population`、`setting`、`year`、`mode=spoken/written/elicited` 与 `not_nationally_representative=true`。
- **禁止直接写入：**某 POI 的真人发音、某国“全民口音”、混说概率/默认示例句、把外名误写为官方并列名、把书面语统计外推到车内语音。
- **上线前最短核验路径：**(1) 用各国测绘/Placenames/交通运营方 API 对每个 feature 保存权威对象 ID；(2) 对每一个非主名标 `official_parallel`、`recognized_exonym`、`historic`、`marketing` 四选一；(3) 发音只从许可录音或当地审听产生，并把语言/方言/说话者区域单独标注；(4) 人机评测时按国家内的语言区分层抽样，不能只抽首都英语使用者。

