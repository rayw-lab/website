import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:1440,height:900} });
await p.goto('http://127.0.0.1:4612/website/world/about-pavilion/?from=city&poi=about-pavilion', { waitUntil:'networkidle' });
await p.screenshot({ path:'/tmp/ah-hall-arrival.png' });
const banner = await p.evaluate(()=>{const e=document.querySelector('[data-hall-chrome],[data-arrival],.hall-chrome'); return e? {hidden:e.hidden, text:e.innerText.slice(0,200)} : 'no-chrome-el'});
console.log(JSON.stringify(banner));
await p.goto('http://127.0.0.1:4612/website/world/about-pavilion/', { waitUntil:'networkidle' });
await p.screenshot({ path:'/tmp/ah-hall-plain.png' });
await b.close();
