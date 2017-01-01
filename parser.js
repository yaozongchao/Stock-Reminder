
function DataParser(config){
	this.config = config; 
	this.stocks = {};
	this.consumedList = [];
	this.updateTimer = 0;
	this.weight = null;
	
	/*
	 * {callback:, interval:, data: };
	 */
	this.begin = function() {
		var This = this;
		if (This.config.interval > 0) {
			This.timer = setInterval(function(){
				This.updateTimer = This.updateTimer + 1;
				This.consumeList(This.config.callback);								
			}, This.config.interval * 1000);
			return;
		}
		
		this.consumeList(This.config.callback);
	}

	DataParser.prototype.setConfig = function (config) { 
		this.config = config; 
	} 
	
	this.consumeList = function(callback) {
		var This = this;
		var list = This.config.getConfigList();
		var idx = This.consumedList.length;

		if (idx >= list.length) { // all parsed 
			// delay the call
			This.parseInfo(function(){
				This.consumedList = [];
				if (callback) {
					callback('finished');
				}
			}); // pass function as callback
			return;
		}
		var id = list[idx];
		if(id.charAt(0) == "6")
		{
			this.consumedList.push("sh"+id);
		}
		else if (id.charAt(0) == "0")
		{
			this.consumedList.push("sz"+id);
		};
		This.consumeList(callback);
	}
	
	this.parseInfo = function(callback) {
		var This = this;
		var stockUrlBase = "http://hq.sinajs.cn/list=";
     	var stockDataUrl = stockUrlBase + this.consumedList.join(",");
     	// alert(stockDataUrl);

		$.get(stockDataUrl, function(data){
			// var ev = $(data);
			This.parseStockData(data);
			if (callback) { 
				callback();
			}
		})
		.error(function() {
			if (callback) {
				callback();
			}
			console.log("error parsing");
		});		  
	}

	this.parseSingleStock = function(str) {
	  	var stock = {};
	  	var codeDataStrings = str.split('="');
	  	var codeTmp = codeDataStrings[0].split("_")[2];
	  	stock.code = codeTmp.substring(2);
	  	var dataStrings = codeDataStrings[1].split(",");
	  	if(dataStrings.length < 4)stock.name = stock.code;
	  	else {
	    	stock.name = dataStrings[0];
	    	stock.open = parseFloat(dataStrings[1]).toFixed(2);
	    	stock.high = parseFloat(dataStrings[4]).toFixed(2);
	    	stock.low = parseFloat(dataStrings[5]).toFixed(2);
	    	stock.volumn = parseFloat(dataStrings[8]).toFixed(0);
	    	stock.current = parseFloat(dataStrings[3]).toFixed(2);
	    	stock.yesterday = parseFloat(dataStrings[2]).toFixed(2);
	    	stock.diff = (stock.current - stock.yesterday).toFixed(2);
	    	stock.percentage = (stock.diff / stock.yesterday * 100).toFixed(2);
	    	stock.timestamp = dataStrings[30] + "<br>" + dataStrings[31];
	  	}
	  return stock;
	}

	this.parseStockData = function(str) {
		var This = this;
		var stocksTmp = str.split(";");
		This.stocks = [];
		for(var i = 0;i < stocksTmp.length - 1;i++) {
			var stock = This.parseSingleStock(stocksTmp[i]);
	    	This.stocks.push(stock)
	  	}
	  	// alert("This.stocks.length" + This.stocks.length);
	}
	
	this.getStockName = function(id, callback) {
		var This = this;
		var stockUrlBase = "http://hq.sinajs.cn/list=";
		var finalId = null;
		if(id.charAt(0) == "6")
		{
			finalId = "sh"+id;
		}
		else if (id.charAt(0) == "0")
		{
			finalId = "sz"+id;
		}
		else
		{
			alert("请正确输入股票代码");
			return;
		}
     	var stockDataUrl = stockUrlBase + finalId;

		$.get(stockDataUrl, function(data){
			var entry = This.parseSingleStock(data);
			if (callback) { 
				callback(entry);
			}
		})
		.error(function() {
			if (callback) {
				callback('error');
			}
			console.log("error parsing");
		});		  
	}
}