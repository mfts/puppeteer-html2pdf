const express = require('express');
const asyncHandler = require('express-async-handler')
const puppeteer = require('puppeteer');
const app = express();

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/pdf', asyncHandler(async (req, res) => {

  let url = req.param('url');
  url = (url && url !== 'http://') ? url : 'data:;charset=utf-8,No%20url%20given%21';

  console.log('Requesting:', url);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  let div_selector_to_remove= ".wp-block-embed-youtube";
  await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      for(var i=0; i< elements.length; i++){
          elements[i].parentNode.removeChild(elements[i]);
      }
  }, div_selector_to_remove)

  let div_selector_to_remove2= "#hero-header";
  await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      for(var i=0; i< elements.length; i++){
          elements[i].parentNode.removeChild(elements[i]);
      }
  }, div_selector_to_remove2)
  
  let div_selector_to_remove3= "#jp-relatedposts";
  await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      for(var i=0; i< elements.length; i++){
          elements[i].parentNode.removeChild(elements[i]);
      }
  }, div_selector_to_remove3)

  let div_selector_to_remove4= "#colophon";
  await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      for(var i=0; i< elements.length; i++){
          elements[i].parentNode.removeChild(elements[i]);
      }
  }, div_selector_to_remove4)
  

  var pdfBuffer = await page.pdf({
    printBackground: true,
    margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
    },
    format: 'A4'
  });
  await browser.close();

  console.log('Delivering PDF of', pdfBuffer.length, 'bytes');
  
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition: attachment; filename=file.pdf');
  res.send(new Buffer(pdfBuffer, 'binary'));  
}));


app.listen(PORT, () => {
  console.log('html2pdf: Listening on port %s', PORT);
});