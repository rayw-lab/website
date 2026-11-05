// 成本粗估页 / 使用说明页之间（含快捷入口改查询参数）的跳转不做跨文档 View Transition：
// 同一个工具换场景没有可 morph 的对应元素，Chrome 会中止过渡并把 rejection 当 pageerror 抛出。
// 旧页 pageswap 时跳过；新页 pagereveal 时兜住被中止过渡的 promise。须 is:inline 放在 <head>。
export const VT_GUARD = `(function(){var tool=${JSON.stringify('/lab/cost-estimator/')};
addEventListener('pageswap',function(e){var vt=e.viewTransition,to=e.activation&&e.activation.entry&&e.activation.entry.url;if(vt&&to&&new URL(to).pathname.indexOf(tool)>=0){vt.skipTransition();}});
addEventListener('pagereveal',function(e){var vt=e.viewTransition;if(vt){vt.ready.catch(function(){});vt.finished.catch(function(){});vt.updateCallbackDone&&vt.updateCallbackDone.catch(function(){});}});})();`;
