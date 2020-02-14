const puppeteer = require('puppeteer');

const config = {
	getIncognito: true,//performance + isolation between pages
	isHeadless: false,// browser GUI
	emulate: {
		doEmulate: true,
		deviceName: 'iPhone 8'
	}
};

(async () => {

	console.log("hello");
	let url = `https://www.imdb.com/title/tt1853728/?ref_=tt_sims_tti`;

	let browser = await puppeteer.launch({headless: config.isHeadless});

	let page = await getPage(browser);

	await emulateDevice(page);

	await page.goto(url, { waitUntil: 'networkidle2'});

	let data = await evaluateScrapingLogic(page);

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

async function emulateDevice(page) {
	if(config.emulate.doEmulate){
		await page.emulate(puppeteer.devices[config.emulate.deviceName])
	}
};

async function evaluateScrapingLogic(page) {

	return page.evaluate(config.emulate.doEmulate ? getMobileDeviceSraping : getDesktopSraping );
};

function getDesktopSraping() {
	let title = document.querySelector('div.title_wrapper > h1').innerText;
	let ratingValue = document.querySelector('span[itemprop="ratingValue"]').innerText;
	let ratingCount = document.querySelector('span[itemprop="ratingCount"]').innerText;

	return {
		title,
		ratingValue,
		ratingCount
	}
};

function getMobileDeviceSraping() {

	let title = document.querySelector('.media-body > h1').innerText
	let ratingValue = document.querySelector('#ratings-bar').innerText.split('\n')[0];
	let ratingCount = document.querySelector('#ratings-bar').innerText.split('\n')[1].split(' ')[0];

	return {
		title,
		ratingValue,
		ratingCount
	}
};