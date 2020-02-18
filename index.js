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

	console.log("hello"+new Date());
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
	
	const PRODUCT_SELECTOR = 'div[data-asin][data-cel-widget] h2';
	await page.waitForSelector(PRODUCT_SELECTOR);

	const products1 = await page.evaluate(() => {
			var name = Array.from(document.querySelectorAll('div[data-asin][data-cel-widget] h2'))
				.map(p => p.innerText);
			var price = Array.from(document.querySelectorAll('.a-price-whole'))
				.map(p => p.innerText);
				
			var productDiv = Array.from(document.querySelectorAll('.a-price-whole'))
				.map(s => {
					return s.closest('div[data-asin][data-cel-widget]');
					/*return Array.from(s.closest('div[data-asin][data-cel-widget]').querySelectorAll('h2'))
					.map(h2 => h2.innerText);*/
				});
			console.log(productDiv);
			return {
				name: name,
				price: price
			};
		} 
	)
	console.log(products1);
};