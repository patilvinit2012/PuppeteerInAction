const puppeteer = require('puppeteer');
const jQueryPath = require.resolve('jquery');
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
	let url = `https://www.amazon.in`;

	let browser = await puppeteer.launch({headless: config.isHeadless, args: ['--start-maximized']});

	let page = await getPage(browser);
	await page.setViewport({width:0, height:0});

	await emulateDevice(page);

	await page.goto(url, { waitUntil: 'load'});
	//await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
	await page.addScriptTag({path: jQueryPath})

	let data = await evaluateScrapingLogic(page,url);

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

async function evaluateScrapingLogic(page,url) {

	await page.$eval('#twotabsearchtextbox', el => el.value = 'boat');

	await (await page.$('input[type="submit"]')).press('Enter'); // Enter Key
	
	const PRODUCT_SELECTOR = 'div[data-asin][data-cel-widget] h2';
	await page.waitForSelector(PRODUCT_SELECTOR);

	await page.addScriptTag({path: jQueryPath});

	var amazonConfig = {
		url: url,
		includeSponsoredResults: true,
	}
	const products = await page.evaluate((amazonConfig) => {
			
			var searchResult = '[data-asin!=""]';
			var sponsoredResults = '[data-asin]';
			var listSelector = searchResult;

			if(amazonConfig.includeSponsoredResults){
				listSelector += sponsoredResults;
			}
			var selector = `div${listSelector}[data-cel-widget]`;
			console.log(selector);
			var productDiv = $('.a-price-whole').closest(selector);

			const list = [];
			$.each(productDiv,function(i,el){

				var item = new Object();
				item.price = $(el).find('.a-price-whole').text();
				item.productName = $(el).find('h2').text().trim();
				item.rating = $(el).find('.a-icon-alt').text().trim();
				item.link = amazonConfig.url + $(el).find('a').attr('href');
				list.push(item);
				console.log(item);
			})

			return list;
		}, amazonConfig)
	console.log(products);
};