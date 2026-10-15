---
title: "德国、荷兰、波兰、葡萄牙：社会语言、混说与 POI（地图研究子稿）"
date: 2026-10-13
type: report
status: draft
domain: 多语种
---

# 德国、荷兰、波兰、葡萄牙：社会语言、混说与 POI（地图研究子稿）

> **研究日期**：2026-10-13（Asia/Shanghai）。本稿只覆盖德国、荷兰、波兰、葡萄牙；目标是给“当地语言—混说—口音/变体—地名”地图留下可追溯的事实，不构成车内产品优先级或实现方案。  
> **证据状态标签**：`全文` = 实际打开并读到论文/报告正文；`摘要/索引` = 只读到作者库页面或摘要；`官方页面` = 实际读到机构正文；`名称库` = 官方旅游/地名机构页实际读取。没有说话录音、语料转写或原始研究的地方，绝不把“可能有人这样说”写成用户语料。  
> **三个硬边界**：①“家庭最常用语言”不等于句内混说频率；②“英语借词/名称”不等于英语—当地语码转换；③地域方言或母语口音的证据不能自动推出该地人说英语时有同一口音。年份、媒介、样本和国家覆盖范围均保留在表中。

## 共同读法：什么算混说、什么只是名称

* **句内混说（intra-sentential switching）**：一句/一个话轮内部跨语言；可再分为嵌入、交替、复合词、词内屈折。只有研究明确标注或量化时才可作此断言。
* **轮次/句间切换（inter-sentential/turn switch）**：一句与下一句、或不同发帖/话轮更换语言；不应误报成“同一句混说”。
* **借词、固定语、实体（POI、品牌、人名）**：要单列。Denglisch 语料作者特别把借词、共享词、适应后的实体、混合词区分；例如地名的格尾、拼写或全译会改变标注类别，而不是自动构成一次对话切换。[Osmelak 2023，全文 pp.55–57](https://aclanthology.org/2023.sigtyp-1.pdf)
* **框架语言/嵌入方向（matrix language / embedding direction）**：指哪种语言提供句法框架、哪种语言作为嵌入成分；它不是语法上的“主语”。若研究未检验 matrix language、或只有文本计数，则写“未实证”，不能从国籍或英语熟练度猜测。

---

## 1. 德国（Deutschland）

### 1.1 语言地位与实际家庭语言背景

* 联邦行政程序法 `VwVfG §23(1)` 的明确用语是“**Die Amtssprache ist deutsch**”（行政语言为德语）。这是行政法层面的结论，不应偷换成“宪法给德国设定唯一国家语言”。[德国联邦司法部现行法条，官方页面](https://www.gesetze-im-internet.de/vwvfg/__23.html)
* Destatis（联邦统计局）2021 年微型普查覆盖约 8,230 万私人住户人口：约 **80%** 仅在家说德语，**15%** 在德语之外还说至少一种语言，**5%** 在家不说德语；在“在家主要说非德语”的人中，土耳其语 15%、俄语 13%、阿拉伯语 10%、波兰语 7%、英语 6%。样本是每年约 1% 人口的调查，且统计局特别说明该结果不反映俄乌战争后的迁移变化，也不测语言能力。[Destatis，2023-02-21，官方页面](https://www.destatis.de/DE/Presse/Pressemitteilungen/Zahl-der-Woche/2023/PD23_08_p002.html)
* 2023 年问卷/采集改动使“家中主要语言”同前几年**只能有限比较**；任何地图不得把 2021 的份额同 2023 以后趋势直连。[Destatis 方法说明，官方页面](https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Migration-Integration/Methoden/Erlauterungen/1-mikrozensus-methodischen-effekten-in-der-zeitreihe.html)

这说明土耳其语—德语、英语—德语都值得列为候选组合；但家庭语言统计没有记录“是否在同一句中切换”，也不能据此给全体德国人贴“Denglisch”标签。

### 1.2 已取得的混说实证

| 组合与方向 | 人群、地域、媒介、年份 | 实际发现（不超出原证据） | 读取状态、外推边界 |
|---|---|---|---|
| 德语—英语（书面社媒；方向并非“德国全国口语”） | Osmelak（Saarland University）从德语 subreddits `r/DE`、`r/Deutschland`、`r/Germany`、`r/Berlin` 下载约 1,700 万评论，候选 1 万条；手标 950 条、75,000+ token、4,200 句，其中 1,250 句含句内切换。随后还下载 2,550 万评论，后者含奥地利、瑞士的城市/地区板块。 | 论文对 English、German、共享词、借词、命名实体、词内复合和德语屈折的英语词分别标注；明确承认“Berlin”这类实体、全译词（`United Kingdom–Vereiniges Königreich`）与真正 CS 必须分开。句内 CS 有实物证据，但不能由此估计德国人口比例，也不能将后半批跨国数据当德国数据。 | `全文`：方法 pp.57–58、标注 pp.55–57。来源：[ACL Anthology PDF](https://aclanthology.org/2023.sigtyp-1.pdf)。 |
| 德语—英语（儿童自然会话；德语主环境） | 两名在德国成长的同时习得德英双语儿童，各有一位英语母语、德语母语家长；研究纳入 Silvie 的 37,995 个儿童话语、193,993 个照护者话语，录音年龄约 2;4–3;10，平均每周约 2.5 小时。 | 研究目标是以纵向语料分析混合话语的“building blocks”；家庭有 OPOL（one parent one language）安排，但全家同场也会混用。它证明此类家庭会出现句内/构式层的混合，**不是**成人驾驶或全国英语使用的证据。 | `全文`（开放论文的 Corpus Study 段落）。[PMC 文章](https://pmc.ncbi.nlm.nih.gov/articles/PMC8353255/)。 |
| 土耳其语—德语（口语语料，**2017 ACL**） | **Özlem Çetinoğlu（2017）**，题名 *A Code-Switching Corpus of Turkish-German Conversations*；5 小时录音、3,614 句。对双语者会话作“贴近语音”与正字两层转写，并标句间、句内、词内切换点。 | 这是可用于 ASR/NLP 的确凿口语 CS 资源，且明确含三种切换位置；该文是 W17-0804，**不是 TuGeBiC**。论文未给出足以建立德国地区比例的代表性抽样，不能由它推出区域日常频率或框架语言分布。 | `全文`（ACL 原始 PDF 已读摘要与方法）。[Çetinoğlu 2017，ACL PDF](https://aclanthology.org/W17-0804.pdf)。 |
| 土耳其语—德语（口语语料，**2022 TuGeBiC**） | **Jeanine Treffers-Daller & Özlem Çetinoğlu（2022）**，*TuGeBiC: A Turkish German Bilingual Code-Switching Corpus*。1993–95 年在德国/土耳其录下的自发会话：12 男、24 女、18–50 岁（多数二十出头），包括土耳其两所大学本科生、德国一所大学硕士生、亲友；2022 年重新分词、规范化并将人名/地名匿名化，作 token 级自动语言识别。 | 作者报告语料两种语言大致均衡；公开库列 116,688 token、10,141 单语句、4,510 双语句和 8,180 个 CS 点。这与 2017 ACL 的独立论文/版本必须分开引用；原始音频已不存、参与者元数据不公开，不能作为德国全国或某城市的口语比例。 | `全文`（arXiv 原始 PDF 的摘要、采集、转写/匿名化段已读）。[TuGeBiC 原始 PDF](https://arxiv.org/pdf/2205.00868)，[作者库说明](https://github.com/ozlemcek/TuGeBiC)。 |

**德国可复用解读。** 德语—英语应优先按“共享词/借词/POI/真正切换”四类处理，特别警惕英语词根接德语屈折、城市名带格尾这类词内或实体适应。土耳其语—德语是有自然口语语料支持的组合；英语—德语的现有强量化证据在社媒和少量双语儿童，而非全国成人连续语音。上述研究均未在本轮实证“谁稳定担当**框架语言/嵌入方向**”的全国分布，因此地图字段填 `matrix_language: unknown` 更诚实。

### 1.3 变体、口音与英语二语口音

* 德国本土德语本来就不能按“一国一音”建模。马尔堡 Deutscher Sprachatlas 的 REDE 新采集中，有德国联邦共和国 **150 个地点**、三代人（高中毕业生/中年警员/年长 NORMs）、2008–2012 年采集，包含标准德语、最基础方言、阅读、访谈、会话和紧急电话材料；页面列出可用录音 1,462 条（2016 计）。[REDE 音频语料目录，全文官方研究中心页](https://www.regionalsprache.de/en/contents-audio-corpora.aspx)
* **可读的英语 L2 韵律原始研究（窄样本）**：Puga、Fuchs、Setter、Mok（2017）以德国大学英语专业的 20 名德语 L1 学习者（20–28 岁、均为高阶；其中 10 人自评 near-native、9 人 advanced）和 25 名 British English 学生对照，做 523 词叙事中的 28 个项目、五种核调的强制选择任务。学习者在陈述句和 yes/no 问题上接近对照，但在 open/closed tag questions 与讽刺的调型选择显著较差；它测的是**语调感知/选择**，不是全国生产口音。[原始全文，方法与结果](https://ling.cuhk.edu.hk/people/peggy/Puga17_interspeech.pdf)
* **明确的英语 L2 实际录音产出研究**：Kautzsch（2010，University of Regensburg）在 2009 年夏录下 **40 名**科隆与雷根斯堡大学英语专业德语 L1 学生朗读英语、德语词表：Bavaria/非 Bavaria 各 20 人，初阶（大学一、二年级）/高阶（三年级及以上）各 20 人；总计 1,320 个元音 token。研究以 Praat 在元音中心测量并归一化 F1/F2，检验 `BEAD/BID`、`BOOED/FOOD/FOOT`、`BED/BAD` 等英德元音区域。可采用的产出特征是：高前元音中英德 `/iː/` 落在同一 F1/F2 范围，显示正迁移；`BID` 的部分高阶学生出现更前移 token；整体上高后元音不再一致迁移，而中低前元音的负迁移随英母语接触、尤其正式教学而减少。[Kautzsch 2010，原始全文，样本/任务 pp.67–70、结果 pp.71 起](https://czasopisma.uni.lodz.pl/research/article/download/8282/8189/21360)
* 因而不能写“德国英语口音 X”。上述研究可将“德语 L1 的高阶大学学习者，在特定英语语调任务中对 tag-question/讽刺调型较弱”列为受试者—任务绑定的特征；它没有德国联邦州、年龄和熟练度的代表性交叉抽样。说德语时的地域、代际与风格变异已被大规模采样，英语输出仍需逐说话人采样。
* Kautzsch 的材料是**受控词表、受监控发音**，且非 Bavaria 组并不等于单一地区；论文也明说其样本不足以直接比较 Bavaria 与 North Rhine-Westphalia。因此可把上述 F1/F2 规律用作德语 L1 学习者的候选音段特征，不能外推为德国全民、自然对话或车内语音的固定口音规则。
* 教材层面的研究发现德国英语教材音频出现 RP、General American、Australian 的部分特征，但并不一致；那是教材输入分析，不是德国人的口音调查。[Paderborn University repository，摘要/索引](https://digital.ub.uni-paderborn.de/hs/content/titleinfo/7830570)

### 1.4 POI：可写名称，不能臆造本地说法或读音

| 地点概念 | 当地正式/原名 | 英语常见外名或别名 | 可证的词形/名称事实 | 发音与“真实混说”状态 |
|---|---|---|---|---|
| 科隆 | `Köln` | `Cologne` | 欧盟委员会英语写作手册明确在英语使用 `Cologne`；德国国家旅游局同时用 `Köln`。 | 没有为本稿取得现场口语或 IPA；不要把 *Kölle* 写成通用用户说法。 |
| 慕尼黑 | `München` | `Munich` | 同一欧盟手册明确英语可用 `Munich`；德国旅游页使用 `München`。 | 仅名称映射，未取得发音证据。 |
| 纽伦堡 | `Nürnberg` | `Nuremberg` | 德国国家旅游局德/英页面分别实际显示两种形式。 | 仅名称映射，未取得发音/混说语料。 |
| 柏林 | `Berlin` | `Berlin` | 同形端名；BKG 的 GN-DE 是德国官方地名服务。 | 同形不表示英德语音相同，也不构成 CS。 |
| 慕尼黑机场（设施） | `Flughafen München` | `Munich Airport` | 运营方德语页面使用 `Flughafen München`，英语站点使用 `Munich Airport`。 | 未取得现场广播、乘客口语或权威 IPA；仅作正式名称/别名对。 |
| 科隆大教堂（地标） | `Kölner Dom` | `Cologne Cathedral` | 大教堂官方德/英页面分别使用这两种名称。 | 未取得实说读音或混说话轮；不得从英译名推断德语话轮中的替换。 |

名称依据：[BKG GN-DE 官方地名服务](https://stagn.bkg.bund.de/was-wir-machen/projekte/gn-de-geographische-namen-deutschland-/-web-gazetteer-service-gn-de)、[欧盟英语风格国家名册（明确 Cologne/Munich/Nuremberg）](https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_country_compendium_en.pdf)、[Germany Travel 德语城市页](https://www.germany.travel/de/inspiring-germany/staedteziele-bahn.html)、[Nuremberg 英语页](https://www.germany.travel/en/cities-culture/nuremberg.html)、[Munich Airport 官方英语站](https://www.munich-airport.com/)、[Kölner Dom 官方英语站](https://www.koelner-dom.de/en)。这里的英名是文本/导航候选；**没有“在德语话轮中实际会如何改叫”的实证**。

---

## 2. 荷兰（Nederland）

### 2.1 语言背景：全国统计已经显示强烈地域差异

CBS 的 2019 Social Cohesion and Well-being 调查（15 岁及以上、7,500+ 人、111 个预设语言/方言、共报出 149 种）显示：约 3/4 在家主要说荷兰语；2% 主要说弗里斯语、5% 下萨克森语、3% 以上林堡语，5% 以上主要说方言，8% 以上主要说其他语言（含英语、波兰语、土耳其语等）。省际差异非常大：Fryslân 为荷兰语 50.2%、弗里斯语 39.6%；Limburg 为荷兰语 46.0%、林堡语 47.9%；Noord-Holland 与 Zuid-Holland 的“其他语言”分别 11.1% 与 12.3%。[CBS，官方全文](https://longreads.cbs.nl/nederland-in-cijfers-2022/wat-spreken-mensen-thuis-vooral/)

这支持将荷兰语、弗里斯语、下萨克森语、林堡语及移民语言作**地域候选层**；它仍不是句内混说计数。荷兰政府教育页同时确认英语为全国小学必修科目，而 Frisian 在 Friesland 省为必修科目。[Government.nl，官方页](https://www.government.nl/themes/education/primary-education/subjects-and-attainment-targets-in-primary-education)

### 2.2 已取得的混说实证

| 组合与方向 | 人群、地域、媒介、年份/样本 | 实际发现 | 读取状态、外推边界 |
|---|---|---|---|
| 弗里斯语—荷兰语（自然口语） | FAME! 来自 Omrop Fryslân 广播的音频与转写；Braggaar & van der Goot 从已带切换标注的语料随机抽 **150 个含至少一个转换点**的话语，三轮各 50。 | 是自然、非标准口语的弗语—荷语 CS；论文说明转换经常与荷兰语影响有关。该篇主要做依存树库，150 条是标注子样而非“人群频率”。 | `全文`：arXiv 页面正文。[Braggaar & van der Goot 2021](https://arxiv.org/abs/2102.11152)。 |
| 土耳其语—荷兰语（青少年自然会话与调查） | Eversteijn 2011，50 名土耳其背景、11–19 岁、从小学一年级起在荷兰受教育的青年；其中 4 人进入自然谈话个案录音。 | 调查与会话同时看语言选择、熟练度、社交网络。研究作者总结：父母常用荷兰语加强权威/训导；青少年可将荷兰语用作较间接、缓和的请求或反抗资源。其结论是该抽样社群的互动功能，不能推广给所有“荷兰移民”或荷兰语—英语。 | `全文`：方法 p.52（50 人、条件）、自然语料 p.186，解释 p.161。 [Tilburg University 博士论文 PDF](https://pure.uvt.nl/ws/portalfiles/portal/1287033/proefschrift_nadja_eversteijn-kluijtmans_140111.pdf)。 |
| 土耳其语—荷兰语（大型线上论坛） | Doğruöz & Diab 2014，2005-06 至 2012-10 抓取的论坛：4,519,869 posts、14,923 users、113,517 threads、29 subforums。 | 同一 thread 可跨 post 切换；荷语和土语占主导，英语固定表达与阿拉伯语祷词均不足 1%。因此“跨轮切换”和“句内切换”在研究中被明确拆开；不能把固定英语问候直接等同于荷土 CS。 | `全文`（PDF 搜索结果正文实际读取；原 URL 为 Twente 研究库）。[PDF](https://ris.utwente.nl/ws/portalfiles/portal/5455750/W14-3905.pdf)。 |
| 荷兰语—英语（荷兰 L1 学习者在英语 L2 产出中） | Bongaerts 1994，45 名荷兰英语学习者、三种英语熟练层级、140,000 word 口语 L2 语料。 | 有 **771 次**非意向性、词级切回荷兰语；数量与英语熟练度有关。这是“说英语时从 L2 回到荷兰 L1”的方向，非荷兰街头荷语话语中主动插英语，更不能替代自然双语社群证据。 | `摘要/索引`，作者/出版社摘要给出样本与结论，未取得全文正文。[John Benjamins 条目](https://benjamins.com/catalog/ttwia.48.03bon)。 |

**荷兰可复用解读。** 不能用“荷兰人英语好”代替混说证据。真正可落的口语组合是 Fryslân 的 Frisian—Dutch，以及有明确样本边界的 Turkish—Dutch；英语证据要注明是 L2 失误/回切、实验还是自然社媒。上表没有任何一项给出全国一套稳定的 matrix-language 概率，故不填“荷兰语永远为主框架”。

### 2.3 变体、口音与英语二语口音

* CBS 的省级家庭语言差异和 `Fryslân/Limburg` 高比例已足够否定“一国一口音”。荷兰标准语区域口音研究也以 Randstad、North、South 等区带建样本，而不是把所有人归一个荷兰音。[Grondelaers et al. 2019，摘要/索引](https://journals.sagepub.com/doi/abs/10.1177/0261927X18810730)
* 对英语，Nejjari 等的 matched-guise 实验有 **392** 名荷兰听者，对 Dutch-accented English、标准英音、美国音在 lecture/audio tour/job pitch 中评价；荷兰口音影响地位评价，但没有降低理解度、亲和力或活力。[论文摘要，全文页面](https://dujal.nl/article/view/9365)
* **Wagner et al.（2024 online / 2025 正式刊载）已读全文**：研究用 Speech Accent Archive 的英语 `Stella` 段落朗读和三位训练者一致的窄式 IPA，比较 Netherlands 出生的荷兰语 L1 **n=16**、Belgium 出生的荷兰语 L1 n=25、美国 n=121、英国 n=22，共 219 个声段项目。它测得荷兰组在英语牙擦音 `/θ, ð/` 的非目标实现、`/æ/` 的实现（荷兰语音系无此音位，结果却不是单一替代规则）以及末位 dark-l 上均与英母语组有差异；结果还按词位、语音环境、词频/借词状态建模。比如荷兰组常以 dental stop/`[t,s]` 处理 `/θ/`，但 `/æ/` 的偏离不支持“人人固定换成同一个荷兰元音”。[作者公开原始 PDF，方法 pp.318–319、结果 pp.324–328](https://pure.mpg.de/rest/items/item_3625590_4/component/file_3655762/content)
* 这是一项**16 人、受控朗读**的 segmental（音段）研究，能回答“哪些项目在该样本中可测”，不能画出荷兰各省、年龄或英语熟练度的分布图。它实际比较 Netherlands Dutch 与 Belgian Dutch，正说明不能把二者及各说话人的结果压为一个 “Dutch accent”。语言学习史、地区、年龄、媒介暴露和熟练度仍应作为个体字段。

### 2.4 POI

| 地点概念 | 本地名称 | 英语/国际名、别名 | 可证事实与使用边界 |
|---|---|---|---|
| 阿姆斯特丹 | `Amsterdam` | `Amsterdam` | 同形名称；可作 POI 同义词，不等于同音。 |
| 海牙 | `Den Haag` | `The Hague`；正式名 `’s-Gravenhage` | CBS 地域表同时列出 `’s-Gravenhage (gemeente)` 与 `Den Haag`；荷兰旅游局英语页使用 The Hague，并称 `’s-Gravenhage` 为 formal name。 |
| 鹿特丹 | `Rotterdam` | `Rotterdam` | 同形；官方旅游页以 Rotterdam 作为四大城市之一。 |
| 弗里斯兰省 | `Fryslân`（弗里斯语）/ `Friesland`（荷兰语） | `Friesland` | 这里有两种当地制度化名称候选，不能把它们写成荷英混说。 |
| 史基浦机场（设施） | `Luchthaven Schiphol` / `Amsterdam Airport Schiphol` | `Amsterdam Airport Schiphol` | 机场运营方荷语规则页使用 `Luchthaven Schiphol`，英语规则页把同一运营方称为 Amsterdam Airport Schiphol；未取得终端广播、真实旅客对话或权威 IPA，不能把双语挂牌说成口语混说。 |
| 海牙中央车站（设施） | `Den Haag Centraal` | `The Hague Central` | 荷兰铁路 NS 的英文运行信息实际使用 The Hague Central，与荷语端名 Den Haag Centraal 对应；仅名称/导航候选，未取得发音或代码转换语料。 |

名称依据：[CBS 行政地域表](https://www.cbs.nl/nl-nl/cijfers/detail/85385NED)、[Holland.com The Hague 页](https://www.holland.com/global/tourism/discover-the-netherlands/visit-the-cities/the-hague)、[Holland.com 交通页](https://www.holland.com/global/tourism/getting-around/information/travelling-to-the-netherlands/getting-to-the-netherlands)、[Schiphol 荷语规则页](https://www.schiphol.nl/nl/privacy-en-cookies/schipholregels/)、[Schiphol 英语规则页](https://www.schiphol.nl/en/privacy-and-cookies/schiphol-regulations/)、[NS 英语运行信息](https://www.ns.nl/en/travel-information/current-situation-on-the-tracks/disruption?id=6052684)。**未取得这些地名/设施名在实际荷兰/弗里斯语连续口语中的读音或改名切换语料**；只供 NLU/地名候选，不可生成“本地人会这样说”的例句。

---

## 3. 波兰（Polska）

### 3.1 语言地位、普查与地域语言

* 波兰宪法第 27 条规定波兰语为共和国官方语言，并明确该条不损害国际协议产生的少数族裔权利。[波兰参议院英文宪法文本，官方 PDF](https://www.senat.gov.pl/gfx/senat/userfiles/_public/k10/kancelaria/wydawnictwa/pdf/konstytucja_rp_miniatura_w._ang.pdf)
* 2005 年少数民族与区域语言法的英文官方译本明示：**Kashubian（卡舒比语）**是区域语言；少数/区域语言在法定条件下可作地方辅助语言。[Gov.pl 法律与英译下载页](https://www.gov.pl/web/mniejszosci-narodowe-i-etniczne/ustawa-o-mniejszosciach-narodowych-i-etnicznych-oraz-o-jezyku-regionalnym)
* GUS 2021 全国普查：38,036,118 人中 36,256,834（**95.32%**）报告仅在家用波兰语；使用非波兰语的 1,746,903（4.6%），其中 1,611,784（4.2%）与波兰语交替使用。常见非波兰家庭语言包括英语 737,276、Silesian 467,145、德语 216,342、卡舒比语 89,198、俄语 63,271、乌克兰语 55,104。问卷容许列出最多两种非波兰语，故各语言列不应相加，也不是 CS token 计数。[GUS 2021 总结报告第 7.2 节，官方 PDF](https://stat.gov.pl/files/gfx/portalinformacyjny/pl/defaultaktualnosci/6536/6/2/1/ludnosc._stan_i_struktura_demograficzno-spoleczna_w_swietle_wynikow_nsp_2021_2_2.pdf)

### 3.2 已取得的混说实证

| 组合与方向 | 人群、场景、时间、样本 | 实际发现 | 读取状态、外推边界 |
|---|---|---|---|
| 波兰语—英语（波兰 Facebook 用户的书面语） | Daria Pańka：2014–2019 公开 FB posts/comments，60,000 words、824 posts、2,272 comments、90 用户（45 public、45 private；30 男/60 女）；英语是其外语。 | 370 次 CS（专名不计）：句内 **82% / 303**，句间 11% / 41，tag 7% / 26。句内项常见 IT/社媒/美容等语域，IT+社媒占句内转换 60%。作者按同化程度与出现频率先区分借词和 CS。 | `全文`：方法 pp.8–9、结果 p.9–16。只有书面、非随机、作者社交圈样本；作者明言一半私密资料无法获得社会人口信息，不能推出年龄、地区、驾驶场景或全国频率。[开放 PDF](https://journals.us.edu.pl/index.php/TAPSLA/article/download/7791/8983/21509)。 |
| 波兰语—英语（幼儿园课堂、L1 环境） | Wysocka-Narewska 2021 pilot：波兰公立幼儿园 **5 名教师**问卷，涉及 **4 组**单语背景幼儿。 | 报告课堂日常可观察到英语片段切换；是“早龄、外语教学/L1课堂”的教师问卷，并非录音语料，也不是一般成人会话。 | `摘要/索引`（大学资料库摘要已读，全文未逐页读取）。[University of Rzeszów repository](https://repozytorium.ur.edu.pl/items/5b32d061-097b-45a1-b6b3-109ee2629a9d)。 |
| 波兰语—英语（青年借词） | Krawiec 2007，针对 young Poles 的 2007-03 调查并引用参与者语句。 | 是英语词汇借入和青年社会语境的证据，研究主体是 **lexical borrowing**；不能把列出的英语词等同于句内 CS，也未给出可复核的大样本数字。 | `摘要/索引`。[期刊条目](https://czasopisma.uwm.edu.pl/index.php/an/article/view/1293)。 |

**波兰可复用解读。** 英语是普查中最大的一项非波兰家庭语言，但这和网上书面混说是两件事。可以肯定“公开 Facebook 文本中有大量波英句内/句间/tag 三类现象，且研究将借词剔开”，不能肯定“波兰年轻人平时都这样说”。研究未以 matrix-language 模型量化**框架语言/嵌入方向**；大多数样本例子是波兰句法中插英语片段，但此描述只适用于该 60k-word Facebook 语料。

### 3.3 变体、口音与英语二语口音

* **可读的英语 L2 音段原始研究（窄样本）**：Rojczyk（2010）对 University of Silesia 英语专业 **43 名三年级学生**（31 女/12 男，已有 120 小时显式英语语音训练）录制 Polish 与 English 的 `/bVt/` 词，量取元音中点 F1/F2，检验英语 `/ɪ/` 和 `/e/` 的新类别形成。其结论是 `/ɪ/` 的类别形成相对有效，而英语 `/e/` 几乎被并入波兰语 `/ɛ/`；这是一项声学元音空间测量，不是对“所有波兰英语”的听感概括。[Rojczyk 2010，原始 PDF](https://cejsh.icm.edu.pl/cejsh/element/bwmeta1.element.hdl_11089_9571/c/v10015-010-0008-3.pdf)
* 可获得的另一条地区性线索是 Robert Lew 的研究问题：波兰语**地区性**连读浊化同化差异是否会影响学习者英语中的同一现象；资料库只给摘要，未读到样本数、城市和结果表，不能写成已证实的地区音值。[Adam Mickiewicz University repository，`摘要/索引`](https://repozytorium.amu.edu.pl/items/b172a03b-6992-43a6-8e85-f8c052a02936)
* 因而地图可写“43 名波兰 L1 学习者的受控元音任务中，英语 `/e/` 与波兰 `/ɛ/` 接近、而 `/ɪ/` 更分离”，但仍不能用“波兰英语口音”单值化；该研究没有将地区、年龄、教育、媒介暴露和熟练度做全国代表性交叉。

### 3.4 POI

波兰国家地名标准化委员会在联合国地名文件中明确：英语城市外名只有 `Warszawa → Warsaw`，而 `Kraków → Cracow` 可与 `Kraków` 交替；`Gdańsk` 不推荐 `Danzig/Gdansk`，`Wrocław` 不推荐 `Breslau/Wroclaw`。[UNGEGN / 波兰官方提交文件，全文](https://unstats.un.org/unsd/ungegn/sessions/3rd_session_2023/documents/GEGN.2_2023_69_CRP69.pdf) 这比用无来源旧外名更安全。

| POI | 当地名 | 英语可用/历史或不推荐形式 | 地图可用表述 |
|---|---|---|---|
| 华沙 | `Warszawa` | `Warsaw` | 可做双向同义词；`Warsaw` 是该官方文件承认的英文外名。 |
| 克拉科夫 | `Kraków` | `Cracow` / `Kraków` | 两者都可见，优先保留带重音的当地名并别名匹配 Cracow。 |
| 格但斯克 | `Gdańsk` | 历史 `Danzig`；无重音 `Gdansk` 不推荐 | 识别可作历史/容错别名，展示名宜 `Gdańsk`，避免把 `Danzig` 当现代中性当地叫法。 |
| 弗罗茨瓦夫 | `Wrocław` | 历史 `Breslau`；`Wroclaw` 不推荐 | 同上：展示当地名，历史名仅设有标签的检索别名。 |
| 华沙肖邦机场（设施） | `Lotnisko Chopina` | `Warsaw Chopin Airport` / `Chopin Airport` | 机场官方的波/英入口分别以当地名和英语运营名标示；作为设施双向候选，保留 `Chopin Airport` 的较短英文变体。 |
| 克拉科夫-巴利采若望保禄二世国际机场（设施） | `Międzynarodowy Port Lotniczy im. Jana Pawła II Kraków-Balice` | `John Paul II International Airport Kraków-Balice` | 同一机场官方波/英页面的公司全称分别出现两种形式；显示名可另保留短名 `Kraków Airport`。 |

波兰旅游局英语首页和铁路页确实使用 Warsaw、Krakow、Gdansk、Wroclaw 等无变音符便利拼写，[Poland Travel 首页](https://www.poland.travel/en/)、[其时刻页](https://www.poland.travel/en/timetables/)；这证明国际旅游文案的拼写惯例与地名委员会的规范建议可能不同。设施名依据：[Warsaw Chopin Airport 官方英语入口](https://www.lotnisko-chopina.pl/en/)、[Kraków Airport 波语公司页](https://krakowairport.pl/pl/firma/kontakt-lotnisko)、[英语公司页](https://krakowairport.pl/en/company/contact-airport)。**未取得这些 POI 的波兰语实际发音或混说话轮，因此不提供拼音、音译或自造示例。**

---

## 4. 葡萄牙（Portugal）

### 4.1 法律地位与统计缺口

* 葡萄牙宪法第 11 条第 3 款为“**A língua oficial é o Português**”（官方语言为葡萄牙语）。[Diário da República 宪法修正公布文本，官方 PDF](https://files.dre.pt/gratuitos/1s/2001/12/286a00.pdf)
* Mirandese 由 `Lei n.º 7/99` 第 2 条承认为葡萄牙的文化与语言遗产；近年官方文化部门还以此条为依据建立促进结构。它在 Miranda do Douro 一带具有明确的保护/教育与身份地位，但不应把法律宣传中的“第二官方语言”口号简化为“全国并列行政语言”。[葡萄牙文化部，2025-03-19](https://culturaportugal.gov.pt/pt/saber/2025/03/criada-estrutura-de-missao-para-a-promocao-da-lingua-mirandesa/)，[Mirandese 教育权实施文件](https://files.dre.pt/1s/1999/07/167b00/44874487.pdf)
* 本轮实际查到 INE 的 Censos 2021 多语种填写 FAQ，但**没有取得**与德国/荷兰/波兰等价的官方“家庭最常用语言”全国结果变量。因此不以移民国籍、英语教育或旅游资料冒充语言使用普查。[INE Censos FAQ，官方页面](https://webinq.ine.pt/Faqs?id=QsHhr3fbAj1IWu9o5xudDgeRQt71gqdfnBd870gQ33vdMs7oGqdRENaGTj2ymSssmL1Z5BKc_9_v1VkdmvjvR3X2aPOvRgjHomEXpBGEBZLTmtLUxjlSTKuoLgD8ZYZ5FfHcps-KBqAId0h56n2fJ2M9GJYzkm2JVlztsnxS5Z45GELFBzGq5ceTPazgeI90gm0YgOkvCstXMJPZ_oon8njY0z5nP2VY16xpsgHVwgE)

### 4.2 已取得的混说实证

| 组合与方向 | 人群、地点、媒介、年份/样本 | 实际发现 | 读取状态、外推边界 |
|---|---|---|---|
| 葡萄牙语—英语（马德拉年轻葡语者的问卷） | Madeira；论文称 100 人获发 Google Forms，结果图表的 18–30 岁样本为 **83**（文中未把“发出 100”与“有效 83”完全对齐）；招募经 WhatsApp/Instagram/Facebook/Messenger，记录性别、教育、英语自评与接触。 | 78 人称每日接触英语；联系来源 media 35%、social media 33%、classes 19%、work 13%（可多选）。93% 称消息会用英语词；79 说与朋友用、72 在线；81% 称会说/写完整英语句。对“英语开头、后接葡语”的测试句，76% 评为自然；作者结论是“葡语开始→英语→回葡语”较易被接受。 | `全文`：方法 pp.14–17、结果 pp.20–25、结论 p.40。它测的是自报与对**研究者编制测试句**的可接受度，并没有录制自然会话；不能把测试句当真实车主话语，也不能推广到葡萄牙大陆、老年人或全部马德拉居民。[Universidade da Madeira 开放论文 PDF](https://digituma.uma.pt/server/api/core/bitstreams/4eb2f10f-134b-4d86-b09e-e495d933f8fb/content)。 |
| 葡萄牙语—英语（英语课堂同伴互动） | Amorim 2016，葡萄牙高校/课堂英语小组口语活动。 | 发现学习者在同伴互动中以 CS 处理交流功能与语言能力缺口，且受访学生有正反两种态度。没有可安全复核的 N、地区或逐句标注统计，因此只留作“课堂有该现象”的窄证据。 | `摘要/索引`。[Universidade do Porto 期刊页](https://ojs.letras.up.pt/index.php/EL/article/view/2727)。 |
| Mirandese—葡萄牙语 | Miranda do Douro 的地方博物馆官方页面并列同一说明的葡语与 Mirandese 文本，页面说明知识/生活传统在当地语言中传承。 | 证明两种书面展示、地方文化和地名语境共存；**不是**语码转换频率、自然口语或框架语言/嵌入方向的数据。 | `官方页面`。[Museu da Terra de Miranda](https://www.museuterrademiranda.gov.pt/exposicao/cozinha-mirandesa/)。 |

**葡萄牙可复用解读。** 有可读全文的英葡“混说”实证，但它是 Madeira、在线招募的 18–30 岁自报/判断任务，不能替代连续录音。**框架语言/嵌入方向**仅有受访者可接受度模式，不是自然会话中稳定 matrix-language 的实证；全国层面的家庭语言基线本轮也未取得。对于 Mirandese，能确定的是受保护的地方语言地位和双语书面可见性，不是“全国双语”或“必然混说”。

### 4.3 变体、口音与英语二语口音

* European Portuguese 本身并非单一口音。AMPER-POR 的学术研究实际比较葡萄牙大陆 **三个方言区**的韵律变异。[论文条目](https://revistas.pucsp.br/index.php/intercambio/article/view/8249)；这是葡语变体资料，不是英语 L2 语音结论。
* **可读的英语 L2 声学/感知原始研究（窄样本）**：Rato、Rauber、Soares、Lucas（2014）招募 Minho/Braga 及邻近地区的 **18 名**葡萄牙欧洲葡语 L1 大学生（8 女/10 男，B1；6–10 岁开始学英语、从未住过英语国家）。生产任务为读 `CVC. Say CVC now`，包含 `beat/bit/bet/bat` 等 432 条录音，测元音声学空间；感知任务为四名 California 英语母语者的 168 个自然 CVC 刺激。结果：学习者对 `/i–ɪ/` 的辨认较准但产出仍重叠；`/æ/` 相对 `/ɛ/` 更高、更后且大量重叠，感知中 `/æ/` 多被识别成 `/ɛ/`。[Rato et al. 2014，原始全文](https://scielo.pt/scielo.php?pid=S0807-89672014000100006&script=sci_arttext)
* 这足以把“Minho 的 B1 大学生在受控英语前元音任务中有哪些可测困难”写清，却不支持 Lisbon/北部/Alentejo/Madeira/Azores、年龄与熟练度的全国“Portugal English”地图，更不能把马德拉问卷的代码选择迁移为语音特征。

### 4.4 POI

| POI | 当地名 | 英语/国际文本形式 | 来源可证事实与边界 |
|---|---|---|---|
| 里斯本 | `Lisboa` | `Lisbon` | 葡萄牙国家旅游局英文交通页使用 Lisbon，葡语页使用 Lisboa。两者可为别名候选。 |
| 波尔图 | `Porto` | `Oporto` | 同一官方英文交通页并列使用 `Oporto`（机场/航线）和 `Porto Santo`；`Oporto` 可作为英语旅游别名，不应假定葡语会话也用它。 |
| 丰沙尔 | `Funchal` | `Funchal` | 官方英文 Madeira 指南明确称 Funchal 为首府；同形候选。 |
| 米兰达-杜罗 | `Miranda do Douro` | `Miranda do Douro` | Mirandese 受保护核心地区，官方文化与博物馆页直接定位该市；同形不代表葡语/米兰达语同音。 |
| 翁贝托·德尔加多机场（设施） | `Aeroporto Humberto Delgado (Lisboa)` | `Humberto Delgado Airport (Lisbon)` / `Lisbon Airport – Humberto Delgado` | ANA 官方双语噪声行动计划直接并列本地名、英语名及 AHD 缩写。 |
| 贝伦塔（地标） | `Torre de Belém` | `Belém Tower` | 葡萄牙国家旅游局英文城市资料将二者并列为同一景点。 |
| 热罗尼莫斯修道院（地标） | `Mosteiro dos Jerónimos` | `Jerónimos Monastery` | 同一国家旅游局资料给出葡语/英语并列的景点名称。 |

名称依据：[Visit Portugal 英文实用信息页](https://www.visitportugal.com/en/sobre-portugal/info-util)、[国家旅游局 Madeira 英文资料](https://www.visitportugal.com/sites/default/files/EscolhaPortugal-EN.pdf)、[Miranda 地方博物馆官方页](https://www.museuterrademiranda.gov.pt/exposicao/cozinha-mirandesa/)、[ANA 双语机场噪声行动计划](https://www.ana.pt/sites/default/files/2026-03/RNT_AHD24_29.pdf)、[Visit Portugal 城市景点图](https://www.visitportugal.com/system/files_force/LisboaCityBreaks_EN_0.pdf?download=1)。**未取得上述地名/设施在当地葡语、Mirandese 或英葡混说口语里的发音证据；不写 IPA、不创作对话。**

---

## 四国可直接用于“语言地图”的克制表述

| 国家 | 可写的、证据充分的地图句 | 必须附带的限制 |
|---|---|---|
| 德国 | “德语为联邦行政语言；2021 微型普查中 80% 私人住户人口仅在家用德语。德英、土德混说均有研究资源，德英强量化例为书面社媒。” | 微型普查不是 CS 计数；Denglisch 社媒的一部分含奥瑞数据；未证实全国成人/车内口语的框架语言/嵌入方向。 |
| 荷兰 | “荷兰家庭语言按省份显著不同；Fryslân 的 Frisian—Dutch 有自然广播语料，Turkish—Dutch 有青少年谈话和大论坛证据。” | 高英语能力不等于日常荷英混说；英语 L2 回切研究不能代替自然荷英会话；不存在可安全写成单一全国英语口音的证据。 |
| 波兰 | “波兰语为官方语言；2021 普查显示家中非波兰语常与波兰语并用。公开 Facebook 60k-word 语料实证波英句内、句间和 tag 转换。” | 普查不是混说；Facebook 非随机书面样本，作者缺部分人口属性；英语/波兰语名称、借词要和 CS 分离。 |
| 葡萄牙 | “葡语是官方语言；Mirandese 有特定地域的法律保护。Madeira 18–30 岁在线问卷显示英葡表达使用与可接受度，但不是自然录音。” | 未取得全国家庭语言普查变量；问卷测试句不是真实用户语料；已有 Minho 窄样本前元音研究，仍未取得地区分层的英语 L2 口音研究。 |

## 待补的关键缺口（不以猜测填平）

1. **德国**：带城市、年龄、英语水平和自然连续语音的德英 CS 调查；Puga et al. 已给高阶大学生的英语语调感知实证，但还缺德语区域出身对英语 L2 音系的交叉实测。
2. **荷兰**：近年的荷英自然会话语料（区分移民社群、大学/工作与旅游场景）；Frisian/Dutch 音频的许可和转写覆盖量需按计划单独核取。
3. **波兰**：有代表性的离线/车载自然口语波英语料；Facebook 研究缺失的地区、年龄、英语熟练度字段；已有 43 人受控元音研究，仍缺英文 L2 的地区—年龄—熟练度声学研究。
4. **葡萄牙**：INE 或学术大样本的家庭语言分布；大陆、群岛分开的英葡自然口语；已有 Minho 18 人受控前元音研究，仍缺葡语区域变体如何具体影响英语 L2 发音的比较声学研究。
5. **所有国家的 POI**：正式/英文/历史名称已可建候选词表；每个国家仍需要“真实语音采样或权威 IPA/发音库”后，才可写成读音或把某个名称说成真实混说中的惯用形式。

