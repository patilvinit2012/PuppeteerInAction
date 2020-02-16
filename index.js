const puppeteer = require('puppeteer');

const config = {
	getIncognito: false,//performance + isolation between pages
	isHeadless: false,// browser GUI
	emulate: {
		doEmulate: false,
		deviceName: 'iPhone 8'
	}
};

(async () => {

	console.log("hello");
	let url = `https://www.amazon.in/`;

	let browser = await puppeteer.launch({headless: config.isHeadless, args: ['--start-maximized']});

	let page = await getPage(browser);
	await page.setViewport({width:0, height:0});

	await emulateDevice(page);

	await page.goto(url, { waitUntil: 'load'});

	let data = await evaluateScrapingLogic(page);

	console.log(data);
	//await browser.close();
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

	await page.$eval('#twotabsearchtextbox', el => el.value = 'boat');

	await (await page.$('input[type="submit"]')).press('Enter'); // Enter Key
	
	await page.waitForSelector('div[data-asin][data-cel-widget]');

	const products = await page.evaluate(() => 
		Array.from(document.querySelectorAll('div[data-asin][data-cel-widget] h2'))
			.map(p => p.innerText)
		)

	console.log(products);

};