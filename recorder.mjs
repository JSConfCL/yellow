import fs from 'fs'
import puppeteer from 'puppeteer'

import { getStream, launch, wss } from 'puppeteer-stream'

const file = fs.createWriteStream('./test.webm')

;(async () => {
	// Launch the browser and open a new blank page
	const browser = await launch({
		executablePath: puppeteer.executablePath(),
		// args: ['--use-fake-ui-for-media-stream'],
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	})
	const page = await browser.newPage()

	// Navigate the page to a URL
	await page.goto('http://localhost:8787/bigoteam/room?skip_permission_check')

	// Set screen size
	await page.setViewport({ width: 1080, height: 1024 })

	// Type into search box
	await page.type('#username', 'bigoteam recorder')
	await page.waitForSelector('button[type="submit"]')
	await page.click('button[type="submit"]')
	const stream = await getStream(page, { audio: true, video: false })
	console.log('recording')

	stream.pipe(file)

	// await page.waitForSelector('#join-button')
	// await page.click("#join-button")
	setTimeout(async () => {
		await stream.destroy()
		file.close()
		console.log('finished')
		;(await wss).close()
		await browser.close()
	}, 30000)
})()
