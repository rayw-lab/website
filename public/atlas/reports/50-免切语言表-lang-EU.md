# 逐国免切语言表 · lang-EU（计入线追加版）

读取日期：2026-10-13。分配范围为本路清单中的欧洲国家；本次只更新本路三个交付文件。事实来源沿用逐国研究及本次补读官方原表，读取边界留在CSV中。

## 本次口径

地图按已证实计入的语言数上色：单语为主（1种）、双语（2种）、三语（3种）、四语及以上（≥4种）。`xunfei_tier` 原值完整保留，仅是能力档位信息，不进入本次汇总判断。同一语言的标准语与口语变体按所属语言去重；德语与Swiss German、阿拉伯语宏语言与Darija都不重复计数；Bokmål/Nynorsk是书面标准，不算两种语言。Bosnian/Croatian/Serbian/Montenegrin保留原普查与国家卡的语言名称，不因相互可通就合并。

`counts_for_mianqie=是` 严格使用磊哥新定的四条规则：全国官方使用比例达到5%；至少一个一级行政区为最大语言；权威材料明确全国通行语；原已处于tendency的语言有混说原始研究。每行均写出采用的规则、指标、年份、范围与多选定义。常用/家庭使用优先，未取到这类全国原表才回退到会说或母语。

家庭使用定义按原问卷保留。西班牙采用“偶尔、经常、总是”家庭使用之和；瑞士为每周至少一次；卢森堡为家中/亲属与学校/工作通常使用子题并集；爱尔兰的每日使用含教育系统。这些是不同调查口径，不能互换，也不能统一称为每天在车内使用。只有能力数据的行明确标为“会说”，不将其写成日用率。

官方身份始终显示。`否` 既可能是已有指标未达线，也可能是未取得符合规则的证据；后一种有“未找到全国性使用数据”或具体范围缺口，不等同没有使用人口。只靠比例入tendency却未达新线的行已降到background；达到线的社群/外籍语言按相同规则计入。统计达线不会自行新增混说实证。

混说表新增`cs_type`，与`evidence_level`互相独立。“有线索”可以有明确句内类型；“有实证”也可能只记录交替而未说明句内/句间。“多种”在finding明确具体类型。专名、固定借词、词内形态混合按材料粒度区分；仅词形混合不能直接写成稳定借词。此次没有足够依据将任何组合独占归为专名插入。

双言列“是”表示本表已核到显著口语/标准语差异及功能分工；“否”表示现有已读证据未确认这项特征，不是语言学上排除所有双言现象。瑞士德语和塞浦路斯希腊语标“是”。语音节奏/口音差异、两种书面标准、两种独立语言并存均不自动等于双言。双言关系不增加混说组合数。

## 国家汇总

下表〔不计入〕保留卡片上官方语言的显示。未计入的官方语言按所属语言去重：若英语汇总行已计入，Maltese English独立变体数据缺口不会把“英语”列成未计入。实证数为组合表中“有实证”的行数，0只表示本表没有已定位的实证组合。

| 国家 | 官方语言 | 倾向语种 | 其他 | 上色类别 | 有实证的混说组合数 | 未计入的官方语言 | 口语与标准语差异大（双言） |
|---|---|---|---|---|---:|---|---|
| 英国 `GBR` | 威尔士语（地区：威尔士）〔不计入〕；苏格兰盖尔语（地区：苏格兰）〔不计入〕；苏格兰语（地区：苏格兰）〔不计入〕；爱尔兰语（地区：北爱尔兰）〔不计入〕 | 英语；波兰语 | 罗马尼亚语；旁遮普语；乌尔都语；苏格兰语〔Ulster Scots〕 | 双语（2种） | 2 | 威尔士语；爱尔兰语；苏格兰盖尔语；苏格兰语 | 否 |
| 西班牙 `ESP` | 西班牙语；加泰罗尼亚语（地区：加泰罗尼亚、巴利阿里、瓦伦西亚（Valencian名称））；巴斯克语（地区：巴斯克自治区、纳瓦拉巴斯克语区）〔不计入〕；加利西亚语（地区：加利西亚）；奥克语〔Aranese〕（地区：加泰罗尼亚；口语重点Aran）〔不计入〕 | 英语；阿拉伯语〔Darija〕 | null（本表未另列） | 四语及以上（≥4种） | 5 | 奥克语；巴斯克语 | 否 |
| 意大利 `ITA` | 意大利语；德语（地区：南蒂罗尔/博尔扎诺及依法有区域权限的机关）〔不计入〕；法语（地区：Aosta Valley；所读地方章程明确平等）；拉登语（地区：南蒂罗尔拉登语地区及指定公共服务）〔不计入〕；德语〔南蒂罗尔Bavarian（巴伐利亚德语）〕（地区：南蒂罗尔研究社群）〔不计入〕 | 阿拉伯语〔Darija〕；英语 | 斯洛文尼亚语；弗留利语；撒丁语 | 四语及以上（≥4种） | 2 | 德语；拉登语 | 否 |
| 法国 `FRA` | 法语（法国；本表社会研究限本土） | 德语〔Alsatian（阿尔萨斯阿勒曼尼德语）〕；阿拉伯语〔Maghrebi Arabic（原研究未细分各方言）〕；英语 | 布列塔尼语；奥克语；科西嘉语 | 四语及以上（≥4种） | 2 | null（无） | 否 |
| 德国 `DEU` | 德语 | 土耳其语；英语 | 俄语；阿拉伯语；波兰语 | 三语（3种） | 2 | null（无） | 否 |
| 荷兰 `NLD` | 荷兰语（荷兰欧洲本土；Bonaire等另列）；西弗里斯语（地区：Fryslân） | 下萨克森语；林堡语；土耳其语；英语 | null（本表未另列） | 四语及以上（≥4种） | 2 | null（无） | 否 |
| 波兰 `POL` | 波兰语 | 英语 | 西里西亚语；德语；卡舒比语；俄语；乌克兰语 | 双语（2种） | 1 | null（无） | 否 |
| 葡萄牙 `PRT` | 葡萄牙语 | 英语 | 米兰德斯语 | 双语（2种） | 0 | null（无） | 否 |
| 奥地利 `AUT` | 德语；克罗地亚语（地区：布尔根兰等法律列举机关）〔不计入〕；斯洛文尼亚语（地区：克恩滕/施泰尔马克等法律列举机关）〔不计入〕；匈牙利语（地区：布尔根兰等法律列举机关）〔不计入〕 | 英语 | null（本表未另列） | 双语（2种） | 0 | 克罗地亚语；匈牙利语；斯洛文尼亚语 | 否 |
| 比利时 `BEL` | 荷兰语（全国联邦制度；地区：佛兰德/布鲁塞尔）；法语（全国联邦制度；地区：瓦隆/布鲁塞尔）；德语（全国联邦制度；地区：东部德语共同体） | 英语 | null（本表未另列） | 四语及以上（≥4种） | 0 | null（无） | 否 |
| 卢森堡 `LUX` | 卢森堡语；法语；德语 | 葡萄牙语；意大利语；英语 | null（本表未另列） | 四语及以上（≥4种） | 0 | null（无） | 否 |
| 瑞士 `CHE` | 德语（全国联邦；德语区）；法语（全国联邦；法语区）；意大利语（全国联邦；Ticino/Graubünden部分）；罗曼什语（全国国家语言身份；地区：Graubünden及限定联邦往来）〔不计入〕；德语〔Swiss German（瑞士德语阿勒曼尼方言群）〕（瑞士德语区） | 英语 | 葡萄牙语；阿尔巴尼亚语 | 四语及以上（≥4种） | 0 | 罗曼什语 | 是 |
| 爱尔兰 `IRL` | 爱尔兰语（全国；Gaeltacht活语言社群另看）；英语 | null（本表未另列） | 波兰语 | 双语（2种） | 1 | null（无） | 否 |
| 丹麦 `DNK` | 丹麦语（丹麦欧洲本土（法罗/格陵兰另列）） | 英语；德语 | 土耳其语 | 三语（3种） | 0 | null（无） | 否 |
| 芬兰 `FIN` | 芬兰语；瑞典语（全国国家语言身份；瑞典语海岸/双语行政区及Åland） | 英语 | 北萨米语；伊纳里萨米语；斯科尔特萨米语 | 三语（3种） | 1 | null（无） | 否 |
| 挪威 `NOR` | 挪威语；北萨米语（地区：萨米语行政管理区；North/Lule/South对应地方适用范围）〔不计入〕；吕勒萨米语（地区：萨米语行政管理区；North/Lule/South对应地方适用范围）〔不计入〕；南萨米语（地区：萨米语行政管理区；North/Lule/South对应地方适用范围）〔不计入〕 | 英语 | 克文语；罗姆语 | 双语（2种） | 0 | 北萨米语；南萨米语；吕勒萨米语 | 否 |
| 瑞典 `SWE` | 瑞典语 | 英语；芬兰语 | 托尔讷河谷芬兰语；意第绪语；罗姆语；北萨米语 | 三语（3种） | 2 | null（无） | 否 |
| 保加利亚 `BGR` | 保加利亚语 | 英语；土耳其语 | 罗姆语 | 三语（3种） | 1 | null（无） | 否 |
| 克罗地亚 `HRV` | 克罗地亚语；意大利语（地区：Istria；Grožnjan等地方单位）；塞尔维亚语（地区：Borovo、Erdut、Trpinja等指定地方单位；具体现行清单待核）〔不计入〕；捷克语（地区：Končanica等依法指定地方单位）〔不计入〕；匈牙利语（地区：Kneževi Vinogradi等依法指定地方单位）〔不计入〕；斯洛伐克语（地区：Punitovci等依法指定地方单位）〔不计入〕 | 英语；德语 | null（本表未另列） | 四语及以上（≥4种） | 0 | 匈牙利语；塞尔维亚语；捷克语；斯洛伐克语 | 否 |
| 塞浦路斯 `CYP` | 希腊语（塞浦路斯共和国；实际服务范围随行政区）；土耳其语（塞浦路斯共和国法律层；实际政治控制区不由此合并）〔不计入〕；希腊语〔Cypriot Greek（塞浦路斯希腊语）〕（塞浦路斯Greek-Cypriot社群）〔不计入〕；土耳其语〔Cypriot Turkish〕（塞浦路斯土耳其语社群）〔不计入〕 | 英语 | null（本表未另列） | 双语（2种） | 0 | 土耳其语 | 是 |
| 捷克 `CZE` | 捷克语（全国行政程序） | 英语；斯洛伐克语 | null（本表未另列） | 三语（3种） | 0 | null（无） | 否 |
| 爱沙尼亚 `EST` | 爱沙尼亚语 | 俄语；英语 | null（本表未另列） | 三语（3种） | 1 | null（无） | 否 |
| 希腊 `GRC` | 希腊语 | 英语 | null（本表未另列） | 双语（2种） | 1 | null（无） | 否 |
| 匈牙利 `HUN` | 匈牙利语 | 英语；德语 | 罗姆语 | 三语（3种） | 0 | null（无） | 否 |
| 拉脱维亚 `LVA` | 拉脱维亚语 | 俄语；英语 | 拉特加莱语；利沃尼亚语 | 三语（3种） | 0 | null（无） | 否 |
| 立陶宛 `LTU` | 立陶宛语 | 英语；俄语；波兰语 | null（本表未另列） | 四语及以上（≥4种） | 2 | null（无） | 否 |
| 马耳他 `MLT` | 马耳他语；英语；英语〔Maltese English〕（马耳他本地英语使用者）〔不计入〕 | 意大利语 | null（本表未另列） | 三语（3种） | 0 | null（无） | 否 |
| 罗马尼亚 `ROU` | 罗马尼亚语 | 英语；匈牙利语 | 罗姆语 | 三语（3种） | 1 | null（无） | 否 |
| 塞尔维亚 `SRB` | 塞尔维亚语；匈牙利语（地区：AP Vojvodina省机关；地方另按具体制度）〔不计入〕；斯洛伐克语（地区：AP Vojvodina省机关；地方另按具体制度）〔不计入〕；克罗地亚语（地区：AP Vojvodina省机关；地方另按具体制度）〔不计入〕；罗马尼亚语（地区：AP Vojvodina省机关；地方另按具体制度）〔不计入〕；潘诺尼亚鲁塞尼亚语（地区：AP Vojvodina省机关；地方另按具体制度）〔不计入〕；波斯尼亚语（地区：指定地方单位；现行逐市镇清单待核）〔不计入〕；阿尔巴尼亚语（地区：指定地方单位；现行逐市镇清单待核）〔不计入〕；保加利亚语（地区：指定地方单位；现行逐市镇清单待核）〔不计入〕 | 英语 | 罗姆语 | 双语（2种） | 1 | 保加利亚语；克罗地亚语；匈牙利语；斯洛伐克语；波斯尼亚语；潘诺尼亚鲁塞尼亚语；罗马尼亚语；阿尔巴尼亚语 | 否 |
| 斯洛伐克 `SVK` | 斯洛伐克语 | 英语；匈牙利语 | null（本表未另列） | 三语（3种） | 1 | null（无） | 否 |
| 斯洛文尼亚 `SVN` | 斯洛文尼亚语；意大利语（地区：意大利民族社群混居市镇）〔不计入〕；匈牙利语（地区：匈牙利民族社群混居市镇）〔不计入〕 | 英语 | 德语 | 双语（2种） | 1 | 匈牙利语；意大利语 | 否 |
| 阿尔巴尼亚 `ALB` | 阿尔巴尼亚语 | 英语；希腊语 | null（本表未另列） | 三语（3种） | 0 | null（无） | 否 |
| 波黑 `BIH` | 波斯尼亚语；克罗地亚语；塞尔维亚语 | 英语 | null（本表未另列） | 四语及以上（≥4种） | 1 | null（无） | 否 |
| 北马其顿 `MKD` | 马其顿语；阿尔巴尼亚语 | 土耳其语；罗姆语；英语 | 塞尔维亚语；波斯尼亚语 | 四语及以上（≥4种） | 1 | null（无） | 否 |
| 黑山 `MNE` | 黑山语；塞尔维亚语；波斯尼亚语；阿尔巴尼亚语；克罗地亚语〔不计入〕 | null（本表未另列） | 俄语；英语 | 四语及以上（≥4种） | 0 | 克罗地亚语 | 否 |

## 跨国规律与解释边界

英语与当地语言的组合跨多国出现，证据类型差异明显：课堂原始摘要、移民问卷、家庭录音、自然会话、字幕化vlog和社媒手标文本不能当成同一使用率。德国、波兰、斯洛文尼亚的数字文本证据，以及西班牙、意大利、法国的阿语移民社群原始研究，均保留地点/人群/任务范围。原tendency按混说研究计入属于新规则的研究例外；国家颜色不能被读成所有居民都使用这些语言。

区域语言不以全国小份额直接排除。荷兰林堡语用Limburg省家庭最大语言项；西弗里斯语用Fryslân省母语最大项，家庭通常语言项仍是Dutch更高。北马其顿土耳其语和罗姆语分别按一级自治市Plasnica和Shuto Orizari的最大母语项；黑山阿尔巴尼亚语按Ulcinj、Tuzi最大通常语言项。博尔扎诺是意大利次一级省，不能拿其德语语言群体人口比例直接套本任务的“一级行政区”规则；语言群体归属题也不能替代实际语言使用题。

能力调查会影响地图类别，但它不直接证明句内混说。比利时英语、芬兰英语、丹麦德语、捷克斯洛伐克语、马耳他意大利语等使用本次读取的官方会话能力表进入计入集合；指标写明抽样国籍和年龄限制。官方母语/能力表没有可复用的自然转换记录时，组合表证据级别保持原值。

## 本次追加证据

以下来源均于2026-10-13读取；数值短摘录、题目定义和具体国家行存于50号CSV。下载PDF、原CSV和解析稿仅存本路草稿目录。

* [欧盟出版局 Special Eurobarometer 540 原始报告](https://op.europa.eu/en/publication-detail/-/publication/1024ff67-8133-11ef-a67d-01aa75ed71a1/language-en)：官方调查，2023年9—10月；已直接下载原PDF并读取D48母语和other language国家表、技术说明。母语为第一/第二母语汇总，排除None/Don’t know；会话为第一、第二、第三其他语言，不能把两项简单相加。调查仅涵盖在本国居住的欧盟成员国国籍、十五岁以上人群。塞浦路斯只覆盖共和国政府控制地区。
* [西班牙INE全国家庭语言表](https://www.ine.es/jaxi/Tabla.htm?L=0&tpx=55482)及其[原始CSV](https://www.ine.es/jaxiPx/files/tpx/es/csv_bdsc/55482.csv)：ECEPOV2021全国一岁以上，家庭频率分项；计入线用人数之和除同表Total，明确为本表计算，未假装原表给了该计算百分比。
* [荷兰CBS家用语言原表](https://longreads.cbs.nl/the-netherlands-in-numbers-2022/what-is-the-most-spoken-language-or-dialect-at-home/)及[Fryslân省Taalatlas2020](https://cuatro.sim-cdn.nl/openfryslan3fa4e5/uploads/taalatlas_2020_nederlands.pdf)：官方统计；后者母语图已目视读取，最大项的指标与家用指标分开。
* [瑞士BFS语言使用调查2019](https://www.swissstats.bfs.admin.ch/data/webviewer/appId/ch.admin.bfs.swissstat/article/issue210113691901-06/package)：官方统计，实际regular use定义保留，多语与德语变体不能相加。
* [爱尔兰CSO使用频率](https://www.cso.ie/en/releasesandpublications/ep/p-cpp8/censusofpopulation2022profile8-theirishlanguageandeducation/irishlanguageandthegaeltacht/)及[全国人口](https://www.cso.ie/en/releasesandpublications/ep/p-cpsr/censusofpopulation2022-summaryresults/)：官方普查，用教育内每日人数与全龄总人口作保守下界计算，不是学校外成人日用率。
* [挪威政府语言政策原PDF](https://www.regjeringen.no/contentassets/6bf0d1fbc91d42139625c0626bfcc2a6/en-gb/pdfs/kud_expression-preparedness.pdf)：官方原文明确全国common language。
* [芬兰官方统计年鉴](https://otos.stat.fi/server/api/core/bitstreams/f814d535-d394-411b-b813-daea6e78ead3/content)、[保加利亚普查发布](https://www.nsi.bg/en/press-release/ethno-cultural-characteristics-of-the-population-as-of-september-7-2021-6833)、[爱沙尼亚普查发布](https://www.stat.ee/en/news/population-census-76-estonias-population-speak-foreign-language)、[立陶宛普查配套调查](https://osp.stat.gov.lt/en/2021-gyventoju-ir-bustu-surasymo-rezultatai/tautybe-gimtoji-kalba-ir-tikyba)：官方统计/官方统计新闻稿，原表与新闻稿级别分别留在source_level。
* [塞尔维亚普查母语发布](https://stat.gov.rs/en-us/vesti/20230616-st/?a=0&s=1104)、[斯洛文尼亚家庭通常语原表](https://stat.si/popis2002/en/rezultati_html/SLO-T-60ENG.htm)、[波黑普查Book2](https://popis.gov.ba/popis2013/doc/Knjiga2/K2_H_E.pdf)、[北马其顿地方母语原表](https://www.stat.gov.mk/publikacii/2022/POPIS_DZS_web_EN.pdf)、[黑山通常语言及地方原表](https://www.monstat.org/uploads/files/popis%202021/saopstenja/SAOPSTENJE_Popis%20stanovnistva%202023%20II_ENG.pdf)：官方统计，地方最大语言采用语言题，不把民族列当语言题。

## 明显缺口

英国各语言统计分属英格兰/威尔士、苏格兰和北爱尔兰，尚无本次可复用的统一全国使用表。威尔士地区会说份额没有直接套成英国全国比例；地方最大语言还缺可比家庭/主要语言原表。仅法律指定的Scots、Gaelic、Irish及若干地方官方少数语，仍保留官方标签和数据缺口。

塞浦路斯土耳其语及Greek/Turkish变体独立份额、马耳他英语变体独立份额未核到；整岛统计不能用共和国控制地区抽样补齐。马耳他NSO下载正文受限，未沿用二手早期主语言百分比；采用已读欧盟原表。斯洛文尼亚家庭使用原表与波黑母语普查较旧，不能称为当前逐年使用趋势。

德国Destatis部分正文403，只取得官方检索摘录；俄/阿/波家用条件分母不能伪装全国份额，因此未满足新线的原统计倾向行改为背景。波兰人口分母由GUS原文检索摘录补读，原PDF网络读取未成功，读取边界在行内注明；非波兰语家庭人数不是互斥份额。官方调查中取整为零的项目只用于判定未达线，绝不解释为无人使用。

若干原始摘要、自报问卷或已读录音研究未清楚说明句内/句间类型，`cs_type=未说明`；“有实证”只保留原有已核材料，不因补字段升级。没有取得该国真人车内语音测试或免切完成率。

## 自核

下列为本次实际运行的命令和回显。CSV行数同时给出物理行数与解析数据行数；覆盖按完整解析的country_id集合计算，不能从截断终端文本推算。空值使用literal `null`；其计数表示事实数据缺口，计入判断及类型字段不留空。

```sh
python3 /Users/wanglei/workspace/_scratch/global-auto-atlas-20261013-01a12f92/round3/work-lang-EU/validate_addon.py
```

```text
50-免切语言表-lang-EU.csv: physical_lines=193; data_rows=192; coverage=35/35
51-混说组合-lang-EU.csv: physical_lines=81; data_rows=80; coverage=35/35
tendency_missing_source_url=0
official_tendency_missing_counts_for_mianqie=0
empty_cells=0
literal_null_usage_share=80; literal_null_count_indicator=49
tiers={"official": 90, "tendency": 59, "background": 43}
counts_for_mianqie={"否": 78, "是": 114}
color_distribution={"单语为主（1种）": 0, "双语（2种）": 10, "三语（3种）": 13, "四语及以上（≥4种）": 12}
cs_type_distribution={"句内混说": 15, "未说明": 56, "多种": 8, "借词整合": 1}
evidence_level_distribution={"有实证": 31, "有线索": 18, "待核": 31}
xunfei_tier_changed=0; official_identity_changed=0; evidence_level_changed=0; max_quote_length=110
PASS
```

```sh
wc -l "/Users/wanglei/workspace/raw/03-Output/调研/2026-10-13-全球主机厂地图产品预研/50-免切语言表-lang-EU.csv" "/Users/wanglei/workspace/raw/03-Output/调研/2026-10-13-全球主机厂地图产品预研/51-混说组合-lang-EU.csv"
```

```text
     193 /Users/wanglei/workspace/raw/03-Output/调研/2026-10-13-全球主机厂地图产品预研/50-免切语言表-lang-EU.csv
      81 /Users/wanglei/workspace/raw/03-Output/调研/2026-10-13-全球主机厂地图产品预研/51-混说组合-lang-EU.csv
     274 total
```


## 上色计数（2026-10-13 主线程最新口径，addon2）

本节是本次追加后的地图上色表，替代前文按 `counts_for_mianqie` 得出的上色结果。国家卡和反查仍读取原有 `counts_for_mianqie`；地图只读取新增 `color_count`。只有全国使用面达到计入线①、一级行政区最大语言②或全国通用语③才计色；第④条混说研究本身不再证明使用面。`xunfei_tier` 不参与本节判断。

本次严格追加两个字段，原有行、列、单元格及原 MD 内容全部保留。对原 `count_basis` 以“混说研究”开头的行逐行重判；其他已有①–③依据按要求沿用。新查证据的 URL、指标年份、来源级别、原文短摘录、读取日期均放在 `color_basis`，因此不能只看原 `source_url` 查本次新增事实。所有本次读取日期为 **2026-10-13**。

优先使用常用/家庭用语；未取得该语种全国常用/家庭题后才采用会话能力或母语。能力题不是每日使用率、也不是混说率；年龄、调查覆盖范围与可多选口径见每行 `color_basis`。原文取整数字的换算和下列国别语种数是本次计算，不是另行公布的统计值。未明确分母或不能细分语种的项目保留 null，不把缺数写成 0。

不同语言按所属语言去重，不按 ISO 变体代码计多次：本表 `language_zh` 已将瑞士德语/德语、Darija/阿语等归在同一所属语言；中文普通话与粤语若有也统一计中文。BCS 各标准语仍按已有的不同语言行计数，未私自合并。法国 Alsatian 行的“是”依据全国**所属德语**的会话能力，只让德语计一次，不证明 Alsatian 变体全国份额或产品覆盖。

| country_id | 国家／地区 | 计入上色的不同语言 | 不同语言数 | 上色档位 |
|---|---|---|---:|---|
| GBR | 英国 | 英语 | 1 | 单语为主 |
| ESP | 西班牙 | 加利西亚语、加泰罗尼亚语、英语、西班牙语 | 4 | 四语及以上 |
| ITA | 意大利 | 意大利语、法语、英语 | 3 | 三语 |
| FRA | 法国 | 德语、法语、英语 | 3 | 三语 |
| DEU | 德国 | 德语 | 1 | 单语为主 |
| NLD | 荷兰 | 下萨克森语、林堡语、英语、荷兰语、西弗里斯语 | 5 | 四语及以上 |
| POL | 波兰 | 波兰语 | 1 | 单语为主 |
| PRT | 葡萄牙 | 英语、葡萄牙语 | 2 | 双语 |
| AUT | 奥地利 | 德语、英语 | 2 | 双语 |
| BEL | 比利时 | 德语、法语、英语、荷兰语 | 4 | 四语及以上 |
| LUX | 卢森堡 | 卢森堡语、德语、意大利语、法语、英语、葡萄牙语 | 6 | 四语及以上 |
| CHE | 瑞士 | 德语、意大利语、法语、英语 | 4 | 四语及以上 |
| IRL | 爱尔兰 | 爱尔兰语、英语 | 2 | 双语 |
| DNK | 丹麦 | 丹麦语、德语、英语 | 3 | 三语 |
| FIN | 芬兰 | 瑞典语、芬兰语、英语 | 3 | 三语 |
| NOR | 挪威 | 挪威语、英语 | 2 | 双语 |
| SWE | 瑞典 | 瑞典语、英语 | 2 | 双语 |
| BGR | 保加利亚 | 保加利亚语、土耳其语、英语 | 3 | 三语 |
| HRV | 克罗地亚 | 克罗地亚语、德语、意大利语、英语 | 4 | 四语及以上 |
| CYP | 塞浦路斯 | 希腊语、英语 | 2 | 双语 |
| CZE | 捷克 | 捷克语、斯洛伐克语、英语 | 3 | 三语 |
| EST | 爱沙尼亚 | 俄语、爱沙尼亚语、英语 | 3 | 三语 |
| GRC | 希腊 | 希腊语、英语 | 2 | 双语 |
| HUN | 匈牙利 | 匈牙利语、德语、英语 | 3 | 三语 |
| LVA | 拉脱维亚 | 俄语、拉脱维亚语 | 2 | 双语 |
| LTU | 立陶宛 | 俄语、波兰语、立陶宛语、英语 | 4 | 四语及以上 |
| MLT | 马耳他 | 意大利语、英语、马耳他语 | 3 | 三语 |
| ROU | 罗马尼亚 | 匈牙利语、罗马尼亚语、英语 | 3 | 三语 |
| SRB | 塞尔维亚 | 塞尔维亚语、英语 | 2 | 双语 |
| SVK | 斯洛伐克 | 匈牙利语、斯洛伐克语、英语 | 3 | 三语 |
| SVN | 斯洛文尼亚 | 斯洛文尼亚语 | 1 | 单语为主 |
| ALB | 阿尔巴尼亚 | 阿尔巴尼亚语 | 1 | 单语为主 |
| BIH | 波黑 | 克罗地亚语、塞尔维亚语、波斯尼亚语 | 3 | 三语 |
| MKD | 北马其顿 | 土耳其语、罗姆语、阿尔巴尼亚语、马其顿语 | 4 | 四语及以上 |
| MNE | 黑山 | 塞尔维亚语、波斯尼亚语、阿尔巴尼亚语、黑山语 | 4 | 四语及以上 |

以上 **35/35** 个分配国家都有上色结果；这是依据现有语言行的证据计数，不表示国家实际只存在这些语言。分布（派生计数）：单语为主 5 国、双语 9 国、三语 12 国、四语及以上 9 国。

原第④条共 **31 行**逐行重判，其中 **16 行**取得独立①使用面依据改为 `color_count=是`，其余 **15 行**仅保留国家卡/反查用途，不参与上色。以下说明最容易误读的边界，逐行完整来源及摘录见 CSV 新列。

- 西班牙英语采用全国 ECEPOV 家庭使用，包括“偶尔使用”；这是语言使用，不能解读为整天用英语或英语混说比例。[INE 家庭语言原表](https://www.ine.es/jaxiPx/files/tpx/es/csv_bdsc/55482.csv)。
- 德国原家庭表里的土耳其语、英语比例以“主要用非德语者”为分母，须结合全国语言组比例换算；波兰英语则用全国家庭使用人数除以同年人口。两国均优先家庭题，不拿外语能力替换。[Destatis 原发布](https://www.destatis.de/DE/Presse/Pressemitteilungen/Zahl-der-Woche/2023/PD23_08_p002.html)、[GUS 家庭语言原表](https://bip.stat.gov.pl/download/gfx/bip/pl/defaultstronaopisowa/692/1/1/ludnosc._stan_i_struktura_demograficzno-spoleczna_w_swietle_wynikow_nsp_2021.pdf)。
- 拉脱维亚“其他家庭语言”合类不能支持英语达线；斯洛文尼亚旧家庭表即使把未明者全部加入可能英语的类别，上界仍未达线。阿尔巴尼亚家庭表未细分英语、希腊语，未回应者保留未知；旧 AES 的“最熟悉外语”条件份额不能直接当全国份额。[拉脱维亚家庭语言](https://stat.gov.lv/en/statistics-themes/education/level-education/press-releases/21052-mother-tongue-and-language-used?themeCode=II)、[SURS 旧家庭语言原表](https://stat.si/popis2002/en/rezultati_html/SLO-T-60ENG.htm)、[INSTAT Census 2023](https://www.instat.gov.al/media/13560/cens-2023.pdf)、[INSTAT AES 2017](https://www.instat.gov.al/media/4028/adult-education-survey-2017.pdf)。
- 塞尔维亚 AES 正文明确“多数受访者使用英语”，采用该官方全国调查的定性量词判断达线；其语言构成图的比例因分母未明确，精确全国英语份额仍为 null。波黑原发布只给全体外语使用比例和英语排序，不足以确认英语达线，保持“否”。[塞尔维亚 AES 原发布](https://publikacije.stat.gov.rs/G2018/PdfE/G20181131.pdf)、[波黑 AES 原发布](https://bhas.gov.ba/data/Publikacije/Saopstenja/2018/EDU_02_2017_Y1_0_HR.pdf)。
- 塞浦路斯 EU 调查只覆盖政府控制区；北部份额不填 0。会话能力题限调查年龄和 EU 公民范围，不当全岛、所有居民或儿童使用份额。[EB540 官方原报告](https://op.europa.eu/o/opportal-service/download-handler?identifier=1024ff67-8133-11ef-a67d-01aa75ed71a1&format=pdf&language=en&productionSystem=cellar&part=)、[出版信息与方法入口](https://op.europa.eu/en/publication-detail/-/publication/1024ff67-8133-11ef-a67d-01aa75ed71a1/language-en)。

本次追加保留了原①–③行的既有口径，因此各国/语种的年份、家庭题与能力题仍有差异；特别是荷兰英语的既有会话能力依据按任务要求沿用，没有用本次为土耳其语查到的家庭题去改写既有列。该差异可从新 `color_basis` 直接辨认。斯洛文尼亚家庭来源较旧；英国波兰语全国统一份额、Darija/Maghrebi 方言独立全国份额、瑞典芬兰语一级区最大语言、波黑英语独立全国份额是明显缺口。“否”说明当前使用面依据不足或优先指标未达线，不表示语言不存在或没有车载需求。

### 上色计数自核

以下对追加前快照和实际输出逐单元格核验。命令与回显为本次实跑；不执行任何 git 写操作。

```sh
python3 "/Users/wanglei/workspace/_scratch/global-auto-atlas-20261013-01a12f92/round3/work-lang-EU/validate_addon2.py"
```

```text
csv_data_rows_before=192; after=192; unchanged=True
csv_physical_lines_before=193; after=193
old_columns=22; new_columns=24; old_cell_changes=0
md_original_prefix_preserved=True
covered_countries=35/35
color_count_blank=0
rule4_rejudged=31; rule4_color_yes=16; rule4_color_no=15
color_count_distribution={"否": 93, "是": 99}
color_category_distribution={"单语为主": 5, "双语": 9, "三语": 12, "四语及以上": 9}
new_research_max_quote_chars=90; max_allowed=200
PASS
```

```sh
wc -l "/Users/wanglei/workspace/_scratch/global-auto-atlas-20261013-01a12f92/round3/work-lang-EU/addon2-before-50-免切语言表-lang-EU.csv" "/Users/wanglei/workspace/raw/03-Output/调研/2026-10-13-全球主机厂地图产品预研/50-免切语言表-lang-EU.csv"
```

```text
     193 /Users/wanglei/workspace/_scratch/global-auto-atlas-20261013-01a12f92/round3/work-lang-EU/addon2-before-50-免切语言表-lang-EU.csv
     193 /Users/wanglei/workspace/raw/03-Output/调研/2026-10-13-全球主机厂地图产品预研/50-免切语言表-lang-EU.csv
     386 total
```
