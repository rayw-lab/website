# attempt10 失败归档

- 运行结果：97 通过、2 失败、10 未运行、0 flaky、退出码 1。
- 失败用例：`CITY-E2E-05` 挂载停滞；`WS-E2E-03` 整体超时。
- 原始证据：`full-e2e.attempt10.log`、两例 `trace.zip`、`error-context.md`、截图和视频；环境见 `ENVIRONMENT.json`。
- `full-e2e.attempt9-INVALID-webserver-singleton.log` 是预览服务单例冲突导致的无效轮，只作运行史保留。
- 测试改写的 13 张历史截图在还原前备份到仓外 `/Users/wanglei/studio-data-root/about-hall/attempt10-pre-restore/`，并带 SHA 清单。

## 诊断边界

在 Node 22.23.2、pnpm 10.33.3、单 worker、零重试的受控环境中，两例定向复跑均通过，见 `node22-targeted-r2.log`。因此只能确认 attempt10 的两处产品失败没有稳定复现，不能把原失败改写成通过，也不能仅凭机器负载宣称根因。

诊断过程另发现并坐实一个独立启动缺陷：Astro 7 检测到代理环境后会自动把 `astro preview` 后台化，Playwright 随即报告 `webServer exited early`。`playwright.config.ts` 显式设置 `ASTRO_PREVIEW_BACKGROUND=1`，让受 Playwright 管理的 preview 保持前台。冻结后的 final-r2 在相同 Node 22 口径下 109/109 通过，包含原两例。
