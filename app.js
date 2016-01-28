var restify = require('restify');
var http = require("http");
var cheerio = require("cheerio");

/* node cachemanager */
var cacheManager = require('cache-manager');
/* storage for the cachemanager */
var fsStore = require('cache-manager-fs');
/* our cache store */
var diskCache = cacheManager.caching(
  {store: fsStore,
    options: {
      ttl: 60*60*100 /* seconds */,
      maxsize: 1000*1000*1000 /* max size in bytes on disk */,
      path:'appscache',
      preventfill:false
    }});

var globalDefineFlavor = "wandoujia";

var server = restify.createServer({
  name: 'app-apis',
  version: '1.0.5'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

function download(url, reqCallback, package) {
  diskCache.get(package, function (err, result) {
        if (err) { return reqCallback(null); }

        /* cached, take it right from cache */
        if (result) {
            console.log("package [" + package + "] load from cache.");
            return reqCallback(result);
        }

        /* not cached, load it and parse the data */
        http.get(url, function(res) {
          var data = "";
          res.on('data', function (chunk) {
            data += chunk;
          });
          res.on("end", function() {
            console.log("package [" + package + "] load from network.");
            $ = cheerio.load(data);
            var parser = getParser(globalDefineFlavor);
            var result = parser($, package);
            diskCache.set(package,result);
            reqCallback(result);
          });
        }).on("error", function() {
          console.log("package [" + package + "] load html error.");
          reqCallback(null);
        });

    });
}

//by package name
var wandoujia = "http://www.wandoujia.com/apps/"
var appchina = "http://www.appchina.com/app/";
var coolapk = "http://coolapk.com/game/";//"http://coolapk.com/apk/";
var myapp = "http://android.myapp.com/myapp/detail.htm?apkName=";
var hiapk = "http://apk.hiapk.com/appinfo/";

// game flavor types
var wandoujiaTypes = ["wandoujia","wdj"];
var appchinaTypes = ["appchina","yyh"];
var myappTypes = ["tencent","tx","yyb","yingyongbao","tengxun"];
var hiapkTypes = ["baidu","bd","anzhuo"];

//by search
var _anzhi = "http://www.anzhi.com/search.php?keyword=weixin";
var _baidu = "http://shouji.baidu.com/s?wd=ai&data_type=app&f=header_all%40input&from=landing";
var _360 = "";

function getParser(flavor){
  switch(flavor){
    case "appchina":
      return appchinaParser;
    break;
    case "wandoujia":
      return wandoujiaParser;
    break;
    case "myapp":
      return myappParser;
    break;
    case "hiapk":
      return hiapkParser;
    break;
  }
}

function getRemoteServer(flavor){
  switch(flavor){
    case "appchina":
      return appchina;
    break;
    case "wandoujia":
      return wandoujia;
    break;
    case "coolapk":
      return coolapk;
    break;
    case "myapp":
      return myapp;
    break;
    case "hiapk":
      return hiapk;
    break;
  }
}

function appchinaParser($,package){
  var category = $(".breadcrumb a").eq(1).text();
  var subCategory = $(".breadcrumb a").eq(2).text();
  var appName = $(".app-msg .app-name").text();
  var appIconUrl = $(".app-msg .Content_Icon").attr("src");
  var appTextIntro = $(".main-info .art-content").text();
  var flavor = "";
  var flavorName = "";
  //分析渠道，通常只有游戏会有渠道
  for(var i = 0;i < appchinaTypes.length; i++){
    if(package.indexOf(appchinaTypes[i]) > 0){
      flavor = "appchina";
      flavorName = "应用汇";
    }
  }
  var result = {
    package:package,
    "category":category,
    "subCategory":subCategory,
    "appName":appName,
    "appIconUrleng":appIconUrl,
    "appTextIntro":appTextIntro,
    "tags":"",
    "flavor":flavor,
    "flavorName":flavorName
  };
  return result;
}

function wandoujiaParser($,package){
  var appTypes = "旅行·购票,理财·红包,视频·春晚,购物·年货,音乐,图像,新闻阅读,生活,实用工具,系统工具,美化手机,效率,办公,聊天社交,电话通讯,交通导航,生活服务,运动健康,教育培训,丽人,母婴";
  var gameTypes = "休闲时间,跑酷竞速,宝石消除,网络游戏,动作射击,扑克棋牌,儿童益智,塔防守卫,体育格斗,角色扮演,经营策略";
  var subCategory = $(".crumb .second span").text();
  var category = "";
  if(gameTypes.indexOf(subCategory) > 0){
    category = "游戏";
  }else{
    category = "软件";
  }
  var appName = $(".detail-top .app-name .title").text().trim();
  if(!appName) return;// app not in wandoujia market, absorb
  var appTag = $(".detail-top .app-info .tagline").text().trim();
  var appIconUrl = $(".detail-top .app-icon img").attr("src");
  var appTextIntro = $(".desc-info .con").text();
  var flavor = "";
  var flavorName = "";
  flavor = "wandoujia";
  flavorName = "豌豆荚";
  var result = {
    package:package,
    "category":category,
    "subCategory":subCategory,
    "appName":appName,
    "appIconUrl":appIconUrl,
    "appTextIntro":appTextIntro,
    "tags":appTag,
    "flavor":flavor,
    "flavorName":flavorName
  };
  return result;
}

function myappParser($,package){
  var appTypes = "视频,音乐,购物,阅读,导航,社交,摄影,新闻,工具,美化,教育,生活,安全,旅游,儿童,理财,系统,健康,娱乐,办公,通讯";
  var gameTypes = "休闲益智,网络游戏,动作冒险,棋牌中心,飞行射击,经营策略,角色扮演,体育竞速";
  var subCategory = $(".det-type-link").text();
  var category = "";
  if(gameTypes.indexOf(subCategory) > 0){
    category = "游戏";
  }else{
    category = "软件";
  }
  var appName = $(".det-main-container .det-name .det-name-int").text();
  var appIconUrl = $(".det-main-container .det-icon img").attr("src");
  var appTextIntro = $(".det-intro-container .det-app-data-info").text();
  var flavor = "";
  var flavorName = "";
  //分析渠道，通常只有游戏会有渠道
  for(var i = 0;i < myappTypes.length; i++){
    if(package.indexOf(myappTypes[i]) > 0){
      flavor = "myapp";
      flavorName = "应用宝";
    }
  }
  var result = {
    package:package,
    "category":category,
    "subCategory":subCategory,
    "appName":appName,
    "appIconUrl":appIconUrl,
    "appTextIntro":appTextIntro,
    "tags":"",
    "flavor":flavor,
    "flavorName":flavorName
  };
  return result;
}

function hiapkParser($,package){
  var subCategory = $(".detail_tip #categoryLink").text();
  var category = $(".detail_tip #categoryParent").text();
  var appName = $(".detail_content .detail_description .detail_title").text().trim();
  var appIconUrl = $(".detail_content .left img").attr("src");
  var appTextIntro = $(".soft_description #softIntroduce").text();
  var flavor = "";
  var flavorName = "";
  //分析渠道，通常只有游戏会有渠道
  for(var i = 0;i < hiapkTypes.length; i++){
    if(package.indexOf(myappTypes[i]) > 0){
      flavor = "hiapk";
      flavorName = "安智市场";
    }
  }
  var result = {
    package:package,
    "category":category,
    "subCategory":subCategory,
    "appName":appName,
    "appIconUrl":appIconUrl,
    "appTextIntro":appTextIntro,
    "tags":"",
    "flavor":flavor,
    "flavorName":flavorName
  };
  return result;
}

/* 将所有其他渠道的都转为豌豆荚渠道的 */
function transformPackage(package){
  return package.replace(/(\.mzw|\.muzhiwan|\.appchina|\.yyh|\.yinyonghui|\.yyb|\.myapp|\.hiapk|\.tencent|\.qq|\.baidu|\.bd|\.mi$)/ig,".wdj");
}

server.get('/app/category/:package', function (req, res, next) {
  console.log(getRemoteServer(globalDefineFlavor) + req.params.package)
  var transformedPackage = transformPackage(req.params.package);
  download(getRemoteServer(globalDefineFlavor) + transformedPackage, function(result) {
    if (result) {
      res.send(result);
      return next();
    }else {
      console.log("get html error for package:" + req.params.package);
      res.send({"result":"error","code":500,"msg":"cannot get html"});
      return next();
    }
  },transformedPackage);
});

server.post('/app/category', function (req, res, next) {
  if(req.params.packages){
    var packages = req.params.packages.split(",");
    var results = [];
    var success = 0;
    var failure = 0;
    console.log("start loading : " + req);
    function loadResult(packages,i){
      (function(packages,i){
        var transformedPackage = transformPackage(packages[i]);
        download(getRemoteServer(globalDefineFlavor) + transformedPackage, function(result) {
          if(result){
            results.push(result);
            success = success + 1;
          }else{
            failure = failure + 1;
          }
          if(success + failure == packages.length){
            res.send(results);
            return next();
          } else {
            j = i + 1;
            loadResult(packages,j);
          }
        },transformedPackage);
      })(packages,i);
    }
    loadResult(packages,0);
  }
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
