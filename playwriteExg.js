const playwright = require('playwright');

/*
BitMonky Doge Key Pair Server
*/

const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('/antnode/keys/privkey.pem'),
  cert: fs.readFileSync('/antnode/keys/fullchain.pem')
};

var server = https.createServer(options, (req, res) => {

  res.writeHead(200);
  if (req.url == '/keyGEN'){
    // Generate a new key pair and convert them to hex-strings
      if (err){
        console.log('WOOPS',err);
      }
      else {
        console.log('ok');
      }
      res.end('{"result":false,"msg":"not a key server"}\n');
  }
  else {
    if (req.url.indexOf('/netREQ/msg=') == 0){
      var msg = req.url.replace('/netREQ/msg=','');
      console.log('rawmsg:',msg);
      msg = msg.replace(/\+/g,' ');
      msg = decodeURI(msg);
      msg = msg.replace(/%3A/g,':');
      msg = msg.replace(/%2C/g,',');
      msg = msg.replace(/%3F/g,'?');
      msg = msg.replace(/%2F/g,'/');
      msg = msg.replace(/%3B/g,';');
      msg = msg.replace(/%3D/g,'=');
      console.log(msg);
      var j = null;
      try {j = JSON.parse(msg);}
      catch {j = JSON.parse('{"result":"json parse error:"}');}
      console.log('mkyReq',j);

      if (j.action == 'prox'){
        proxGetData(j,res);
      }
      else if (j.action == 'dredgeVid'){
        dredgeYT(j,res);
      }
      else if (j.action == 'fetchDoc'){
        fetchDoc(j,res);
      }
      else if (j.action == 'fetchWScrShot'){
	fetchWScrShot(j,res);
      }
      else {
        retEr("dredgeYTAPI: Command Not Found.",res);
      }
    }
    else {
      res.end('Wellcome To The BitMonky DredgeTV Server\nUse end point /netREQ\n');
    }
  }
 });
const port = 13385;
server.listen(port);
console.log('Server mkyProx.2 running at admin.bitmonky.com:'+port);

function  retEr(msg,res){
  res.end('{"result":false,"erMsg":"'+msg+'"}\n');
}
function proxGetData(j,res){
  const https = require('https')
  const options = {
    hostname: j.domain,
    port: 443,
    path: '/'+j.path,
    method: 'GET'
  };
  console.log('https://'+options.hostname+options.path);
  const req = https.request(options, reply => {
    var  doc = null
    reply.on('data', d => {
      doc = doc + d;
    });
    reply.on ('end',d =>{
      const  rsp = {
        result: true,
        txt: doc
      };
      res.end(JSON.stringify(rsp));
    })
  });

  req.on('error', error => {
    res.end('{"result":false}');
  })

  req.end();

}

async function dredgeYT(J,res) {
  const browser = await playwright.chromium.launch({
    headless: true // set this to true
  });
  var presult = false;
  const page = await browser.newPage({ userAgent: J.uAgent });
  await page.setViewportSize({ width: J.width, height: J.height }); // set screen shot dimention
  var hres = await page.goto('https://youtube.com/watch?v='+J.vidID);
  if (hres){
    console.log("Status: ", hres.status());
    if (hres.status() == 200){
      presult = true;
    }
  }
  
  if (presult){
    var html = await page.content();
    console.log('html:'+typeof(html));
    html = html.replace(/'/g,"\"");
    html = html.replace(/\/>/g,">");
    html = html.replace(/ >/g,">");
    html = html.replace(/< /g,"<");
    html = html.replace(/\n/g," ");
    //html  = trim(preg_replace('/\s\s+/', ' ', html));

    //fs.writeFileSync("ytHtml.txt", html);
    var response = hres.status();
    if (html.indexOf('"simpleText":"This video has been removed by the uploader"') > 0){
      response = 304;
    } 	     
    var j  = {
      result   : presult,
      response : response,
      title    : sGetTag('"title":"','",',html),
      chanID   : sGetTag('"channelId":"','"',html),
      pDate    : sGetTag('"publishDate":"','"',html),
      author   : sGetTag('"author":"','",',html),
      channel  : sGetTag('"ownerChannelName":"','",',html),
      desc     : sGetTag('"shortDescription":"','",',html)
    };
 
    res.end(JSON.stringify(j));
  }
  else {
    res.end('{"result":false,"response":'+hres.status()+'}');
  }	
  //await page.screenshot({ path: 'my_screenshot.png' })
  await browser.close()
}
async function fetchDoc(J,res) {
  let domain = (new URL(J.url));
  domain = domain.hostname;
  const browser = await playwright.chromium.launch({
    headless: true // set this to true
  });
  //const page = await browser.newPage({ userAgent: J.uAgent});
  const page = await browser.newPage(
  { userAgent: J.uAgent,
    storageState: {cookies:[{name:"CONSENT",value:"PENDING+999",domain:domain,path:"/"}]}
  });

  await page.setViewportSize({ width: J.width, height: J.height }); 
  await page.setDefaultTimeout(900000);
  var hres = await page.goto(J.url);
  var presult = false;
  if (hres){
    console.log("Status: ", hres.status());
    if (hres.status() == 200){
      presult = true;
    }
  }
  var html = await page.content();

  var j  = {
    result   : presult,
    response : hres.status(),
    html     : html,
    ptext    : removeHtmlTags(html)
  };

  res.end(JSON.stringify(j));

  await browser.close()
}
function getPage(page, url) {
  var res = null;
  return new Promise(async(resolve,reject)=>{
    try {
      res = await page.goto(url, {
        timeout: 300 * 1000,
        waitUntil: 'load',
      });
      resolve(res);
    }
    catch(er){
      console.log("myERROR:",er);
      resolve(res);
    }
  });
}
async function fetchWScrShot(J,res=null) {
  console.log('try fetching :',J.url);
  var j = null;
  try {
    var domain = null;
    domain =  new URL(J.url);

    domain = domain.hostname;
    const browser = await playwright.chromium.launch({
      headless: true
    });
    const page = await browser.newPage(
    { userAgent: J.uAgent,
      storageState: {cookies:[{name:"CONSENT",value:"PENDING+999",domain:domain,path:"/"}]}
    });
    var hres = null;
    var scrshot = null;
    try {
      await page.setDefaultTimeout(900000);
      await page.setViewportSize({ width: 1280, height: 800 }); // set screen shot dimention
      var hres = await getPage(page,J.url);
    }
    catch(er){
      console.log('Failed To Fetch Document',er);
    }
    if (!hres){
      j  = {
        result   : false,
        mFound   : false,
        job      : J,
        response : 999,
        data     : null,
        scrshot  : null,
        title    : null,
        desc     : null,
        ogImg    : null,
        furl     : null
      };
      await browser.close()
      postWork(j,res);
      return;
    }
    else {
      var takeshot = null;
      var scrShot  = null;
      try {
        takeshot = await page.screenshot();
        scrshot = takeshot.toString('base64');
        console.log("scrshot: length: ",scrshot.toString('base64').length);
      }
      catch(er) {console.log('Screen Shot Failed');}

      var presult = false;
      var rstatus = '999';

      console.log("Status: ", hres.status());
      if (hres.status() == 200 ){
        presult = true;
      }
      rstatus = hres.status();

      console.log ('Page ResponseCode: ',rstatus);

      //await page.waitForTimeout(5000);
      var title = null;
      var title = null;
      try {title = await page.title();}
      catch(er){
        console.log('page.title failed');
        title="Title Not Found...";
      }
      console.log('title',title);
      const furl = await page.url();
      console.log('Final URL:',furl);

      const data = await page.evaluate(() => {
        try {
          const metas = document.querySelectorAll("meta");
          const mname     = Array.from(metas).map((v) => v.name);
          const mcontent  = Array.from(metas).map((v) => v.content);
          const mTag = Array.from(metas).map((v) => v.outerHTML);
          const images = document.querySelectorAll("img");
          const urls = Array.from(images).map((v) => v.src);
          const height  = Array.from(images).map((v) => v.height);
          const widths  = Array.from(images).map((v) => v.width);
          const links = document.querySelectorAll("a");
          const linkUrls = Array.from(links).map((v) => v.href);
	  return {urls : urls,h:height,w:widths,mname:mname,mcontent:mcontent,mTag:mTag,links: linkUrls} ;
        }
        catch(er) {
          return {urls : null,h:null,w:null,mname:null,mcontent:null,mTag:null,links:null} ;
        }
      });


      var desc = null;

      var fdata = null;
      if (typeof data !== 'undefined'){
        fdata = data;
        desc = getMetaDesc(data);
        console.log("Description: ",desc);

        if (!title || title==''){
          title = getOgTitle(data);
        }
        //var html = await page.content();
      }
      var metaFound = true;
      if (!title || title == '' || !desc || desc == ''){
        //scrshot = "empty";
        //metaFound  = false;
        console.log("No info: nulling screen shot",scrshot);
      }

      j  = {
        result   : presult,
        mFound   : metaFound,
        job      : J,
        response : rstatus,
        data     : fdata,
        scrshot  : scrshot,
        title    : rawUrlEncode(title),
        desc     : rawUrlEncode(desc),
        ogImg    : rawUrlEncode(getMetaContent(fdata,'og:image')),
        furl     : rawUrlEncode(furl)
      };
      console.log('og:image ->',j.ogImg);
      await browser.close()
      postWork(j,res);
      return;
    }
  }
  catch(er){
    j = {
      result   : false,
      job      : J,
      response : 000
    }
  }
  postWork(j,res);
}
function postWork(j,res){
  res.end(JSON.stringify(j));
}
function getMetaContent(j,str){
  if ( typeof j === 'undefined'){
    return null;
  }
  if (!j){return;}	
  var descIndex = null;
  if (typeof j.mTag === 'undefined'){
    return null;
  }
  j.mTag.forEach((item,index)=>{
    var name = item.toLowerCase();
    if (name.indexOf(str) > 0){
      descIndex = index;
    }
  });
  if (descIndex){
    return j.mcontent[descIndex];
  }
  return null;
}
function getOgTitle(j){
  var descIndex = null;
  if (typeof j.mTag === 'undefined'){
    return "";
  }
  j.mTag.forEach((item,index)=>{
    var name = item.toLowerCase();
    if (name.indexOf('og:title') > 0){
      descIndex = index;
    }
  });
  if (descIndex){
    return j.mcontent[descIndex];
  }
  return "";
}
function getMetaDesc(j){
  console.log("j.mname: ",typeof j.mname);
  var descIndex = null;
  if (typeof j.mname !== 'undefined'){
    j.mname.forEach((item,index)=>{
      var name = item.toLowerCase();
      if (name == 'description'){
         descIndex = index;
      }
    });
    if (descIndex){
      return j.mcontent[descIndex];
    }
  }
  if (typeof j.mTag !== 'undefined'){
    j.mTag.forEach((item,index)=>{
      var name = item.toLowerCase();
      if (name.indexOf('og:description') > 0){
        descIndex = index;
      }
    });
    if (descIndex){
      return j.mcontent[descIndex];
    }
  }
  return "No Description Found...";
}
function rawUrlEncode(str) {
    if (!str){
      return str;
    }
    str = str.replace(/[\"\']/gm, '`');
    str = str.replace(/[{}<>]/gm, '');
    str = str.replace(/[\r\n]/gm, ' ');
    str = addslashes(str);
    console.log(str);
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
function addslashes( str ) {  
    // Escapes single quote, double quotes and backslash characters in a string with backslashes    
    // *     example 1: addslashes("kevin's birthday");  
    // *     returns 1: 'kevin\'s birthday'  
   
    return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");  
} 
function removeHtmlTags(htmlText) {
  // Remove JavaScript code (including inline and external scripts)
  const withoutJavaScript = htmlText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove CSS styles (including inline and external styles)
  const withoutCss = withoutJavaScript.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Replace HTML tags with a single space and then reduce multiple spaces to one space
  return withoutCss.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
}
function sGetTag(s,e,doc){
  spos = doc.indexOf(s);
  console.log('start: ',spos);
  if (spos < 0){
    return null;
  }
  spos = spos + s.length;
  tag = right(doc,spos);

  epos = tag.indexOf(e);

  console.log('End: ',epos);
  if (epos < 0){
    console.log('End Tag Not Found: ',e);
    fs.writeFileSync("erlog.txt", tag);
    return null;
  }
  tag = left(tag,epos);
  if (tag == '' || tag ==  ' '){
   return null;
  }
  return tag;
}
function right(str, chr) {
  return str.slice(chr,str.length);
}
function left(str, chr) {
  return str.slice(0, chr);
}
