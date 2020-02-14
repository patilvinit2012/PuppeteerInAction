const puppeteer = require('puppeteer');

const config = {
	getIncognito: true,//performance + isolation between pages
	isHeadless: false// browser GUI
};

(async () => {
	let movieUrl = `https://www.imdb.com/title/tt1853728/?ref_=tt_sims_tti`;

	let browser = await puppeteer.launch({headless: config.isHeadless});

	let page = await getPage(browser);

	await page.goto(movieUrl, { waitUntil: 'networkidle2'});


	let data = await page.evaluate(() => {
		let title = document.querySelector('div.title_wrapper > h1').innerText;
		let ratingValue = document.querySelector('span[itemprop="ratingValue"]').innerText;
		let ratingCount = document.querySelector('span[itemprop="ratingCount"]').innerText;

		return {
			title,
			ratingValue,
			ratingCount
		}
	})

	console.log(data);
	await browser.close();
})();

async function getPage(browser){

	if(config.getIncognito){

		let context = await browser.createIncognitoBrowserContext();
		return await context.newPage();
	}else{

		return await browser.newPage();
	}
};