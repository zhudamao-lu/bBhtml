"use strict";

const COLORLIGHT = "#eeeeee";
const COLORBOLD = "#ffffff";
const FONTSIZE = "12px";
const filNodeColumns = {"address":"所有者", "workerbalance": "worker余额", "balance":"账户总余额", "qualityadjpower":"有效算力", "availableBalance": "可用余额", "pledge": "扇区抵押", "vestingFunds": "存储服务锁仓", "singlet": "单T"};

var key = sessionStorage.getItem("Bb_key");
var account = sessionStorage.getItem("Bb_account");
var name = sessionStorage.getItem("Bb_name");

var xmlhttpInit
var xmlhttpCurves; 
var sse;

var curve = {lowcaseB: [], capitalB: [], filDrawns: [], cfToF: []};

function checkSignIn(e) {
	if (e.target.readyState == 4 && e.target.status == 200) {
		let response = JSON.parse(e.target.responseText);
	//	console.log(response);

		// api request
		if(successed(response)) {
			xmlhttpInit.open("GET", networking + "?account=" + account + "&key=" + key);
			xmlhttpInit.send();
			xmlhttpInit.onreadystatechange = initData;

			xmlhttpCurves.open("GET", networking + "curves?account=" + account + "&key=" + key);
			xmlhttpCurves.send();
			xmlhttpCurves.onreadystatechange = getCurves;

			sseProcess();
		}
	}
}

function successed(response) {
	if(!response.success){
		if(response.message == "not auth") {
			sessionStorage.clear();
			window.location.href = "/signin.html";
			return false;
		}
		return false;
	}

	return true;
}

// api response
function initData(e) {
	if (e.target.readyState == 4 && e.target.status == 200) {
		let response = JSON.parse(e.target.responseText);
	//	console.log(response);

		if(!successed(response)) {
			console.log(response.message);
			return;
		}

		(function(response) {
			let dom = document.getElementById("apy_rate");
			if(!response.success) {
				dom.innerText = response.message;
				return;
			}
			dom.innerText = response.data.apyrate.toFixed(2) + "%";
		})(response);

		(function(response) {
			let dom = document.getElementById("cfil_to_fil");
			if(!response.success) {
				dom.innerText = response.message;
				return;
			}
			dom.innerText = response.data.cfiltofil.toFixed(2) + ":1";
		})(response);

		(function(response) {
			let dom = document.getElementById("lowcase_b");
			if(!response.success) {
				dom.innerText = response.message;
				return;
			}
			dom.innerText = response.data.lowcaseb.toFixed(4);
		})(response);

		(function(response) {
			let dom = document.getElementById("capital_b");
			if(!response.success) {
				dom.innerText = response.message;
				return;
			}
			console.log(response.data.capitalb);
			dom.innerText = response.data.capitalb.toFixed(4);
		})(response);

		(function(response) {
			let dom = document.getElementById("drawn_fil");
			if(!response.success) {
				dom.innerText = response.message;
				return;
			}
			dom.innerText = response.data.drawnfil.toFixed(4);
		})(response);

		(function(response) {
			let dom = document.querySelector("#lockedFilNode>ul");
			if(!response.success) {
				dom.innerText = response.message;
				return;
			}
			renderFilNodes(dom, response.data.filnodes);
		})(response);

		syncOver();
	}
}

// api response
function getCurves(e) {
	if (e.target.readyState == 4 && e.target.status == 200) {
		let response = JSON.parse(e.target.responseText);
	//	console.log(response);

		if(!successed(response)) {
			console.log(response.message);
			return;
		}

		curve.lowcaseB = new Polygon(document.querySelectorAll("#curve canvas")[0], 1, {color: "#09c271", r: 4});
		curve.lowcaseB.p = {clear: false, data: response.data.lowcasebs}; 
		curve.lowcaseB.object.zoomControl(curve.lowcaseB, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.lowcaseB.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);

		curve.capitalB = new Polygon(document.querySelectorAll("#curve canvas")[1], 1, {color: "#09c271", r: 4});
		curve.capitalB.p = {clear: false, data: response.data.capitalbs}; 
		curve.capitalB.object.zoomControl(curve.capitalB, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.capitalB.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);

		curve.filDrawns = new Polygon(document.querySelectorAll("#curve canvas")[2], 1, {color: "#09c271", r: 4});
		curve.filDrawns.p = {clear: false, data: response.data.fildrawns}; 
		curve.filDrawns.object.zoomControl(curve.filDrawns, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.filDrawns.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);

		curve.cfToF = new Polygon(document.querySelectorAll("#curve canvas")[3], 12, {color: "#770000", r: 1});
		curve.cfToF.p = {clear: false, data: response.data.cftofs}; 
		curve.cfToF.object.zoomControl(curve.cfToF, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.cfToF.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
	}
}

function responseSignout(e) {
	if (e.target.readyState == 4 && e.target.status == 200) {
		let response = JSON.parse(e.target.responseText);
	//	console.log(response);

		if(!successed(response)) {
			console.log(response.message);
			return;
		}

		sessionStorage.clear();
		window.location.href = "/signin.html";
	}
}

function signout(e) {
	let xmlhttp; 
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("GET", networking + "signout?account=" + account + "&key=" + key);
	xmlhttp.send();
	xmlhttp.onreadystatechange = responseSignout;
}

function main() {
	console.log(key);
	console.log(account);
	if(key == null || account == null) {
		window.location.href = "/signin.html";
		return;
	}

	let accountName = document.querySelector("header #account");
	accountName.value = name;

	let signoutButton = document.querySelector("header #signout");
	signoutButton.onclick = signout

	let dataContainers = document.querySelectorAll(".center>div");
	for(let i = 0; i < dataContainers.length; i++) {
		loading(dataContainers[i]);
	}

	let xmlhttp;
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
		xmlhttpInit = new XMLHttpRequest();
		xmlhttpCurves = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttpInit = new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttpCurves = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.open("POST", networking + "checksignin");
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send("account=" + account + "&key=" + key);
	xmlhttp.onreadystatechange = checkSignIn;
}

function syncOver() {
	let lowcaseb = parseFloat(document.getElementById("lowcase_b").innerText); 
	let capitalb = parseFloat(document.getElementById("capital_b").innerText); 
	document.getElementById("total_put_in").innerText = lowcaseb + capitalb; // 最新总资产

	let lrr = (lowcaseb / (lowcaseb + capitalb) * 100)
	let domLrr = document.getElementById("lrr");
	if(isNaN(lrr)) {
		domLrr.innerText = 0 + "%";
	}
	domLrr.innerText = lrr.toFixed(2) + "%"; // 准备金率

	let domLoss = document.getElementById("loss");
	let k = 1 / (lowcaseb / capitalb * 9);
	console.log("k:", k);
	if(isNaN(k) || k == Infinity) {
		domLoss.innerText = "--";
	} else {
		let loss = 0;
		for(let i = 1; i <= k; i++) {
			loss += Math.pow(1 / 2, i);
		}
		domLoss.innerText = loss.toFixed(2) + "%"; // 当前提现折扣率
	}
}

// sse response
function sseProcess() {
	sse =  new EventSource(networking + "sse");
//	console.log(sse);

	sse.onopen = function(e) {
		console.log("onopen", e);
	}

	sse.onerror = function(e) {
		console.log("onerror", e);
		sse.close()
	}

	sse.onmessage = function(e) {
	//	console.log("onmessage", e);
	}

	// APY%
	sse.addEventListener("apyrate", function(e) {
		let response = JSON.parse(e.data);
	//	console.log(response);

		let dom = document.getElementById("apy_rate");
		if(!response.success) {
			dom.innerText = response.message;
			return;
		}
		dom.innerText = response.data.toFixed(2) + "%";
	})
	
	// CFIL:FIL
	sse.addEventListener("cfiltofil", function(e) {
		let response = JSON.parse(e.data);

		let dom = document.getElementById("cfil_to_fil");
		if(!response.success) {
			dom.innerText = response.message;
			return;
		}
		dom.innerText = response.data.value.toFixed(2) + ":1";

		curve.cfToF.p.data = curve.cfToF.p.data.slice(1)
		curve.cfToF.p.data.push(response.data);
		curve.cfToF.object.ctx.clearRect(0, 0, curve.cfToF.object.dom.width, curve.cfToF.object.dom.height);
		curve.cfToF.object.zoomControl(curve.cfToF, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.cfToF.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
	})
	
	// 流动余额b
	sse.addEventListener("lowcaseb", function(e) {
		let response = JSON.parse(e.data);
	//	console.log(response);

		let dom = document.getElementById("lowcase_b");

		if(!response.success) {
			dom.innerText = response.message;
			return;
		}

		dom.innerText = response.data.value.toFixed(4);

		syncOver();

		curve.lowcaseB.p.data = curve.lowcaseB.p.data.slice(1)
		curve.lowcaseB.p.data.push(response.data);
		curve.lowcaseB.object.ctx.clearRect(0, 0, curve.lowcaseB.object.dom.width, curve.lowcaseB.object.dom.height);
		curve.lowcaseB.object.zoomControl(curve.lowcaseB, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.lowcaseB.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
	})

	// 质押余额
	sse.addEventListener("capitalb", function(e) {
		let response = JSON.parse(e.data);
	//	console.log(response);

		let dom = document.getElementById("capital_b");

		if(!response.success) {
			dom.innerText = response.message;
			return;
		}

		dom.innerText = response.data.value.toFixed(4);

		syncOver();

		curve.capitalB.p.data = curve.capitalB.p.data.slice(1)
		curve.capitalB.p.data.push(response.data);
		curve.capitalB.object.ctx.clearRect(0, 0, curve.capitalB.object.dom.width, curve.capitalB.object.dom.height);
		curve.capitalB.object.zoomControl(curve.capitalB, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.capitalB.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
	})

	// 损耗值
	sse.addEventListener("loss", function(e) {
		let response = JSON.parse(e.data);
	//	console.log(response);

		let dom = document.getElementById("loss");
		if(!response.success) {
			dom.innerText = response.message;
			return;
		}
		dom.innerText = response.data.toFixed(4) + "%";
	})

	// 已提取CFIL
	sse.addEventListener("drawnfil", function(e) {
		let response = JSON.parse(e.data);
	//	console.log(response);

		let dom = document.getElementById("drawn_fil");
		if(!response.success) {
			dom.innerText = response.message;
			return;
		}
		dom.innerText = response.data.value.toFixed(4);

		curve.filDrawns.p.data = curve.filDrawns.p.data.slice(1)
		curve.filDrawns.p.data.push(response.data);
		curve.filDrawns.object.ctx.clearRect(0, 0, curve.filDrawns.object.dom.width, curve.filDrawns.object.dom.height);
		curve.filDrawns.object.zoomControl(curve.filDrawns, COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
		curve.filDrawns.draw(COLORLIGHT, COLORBOLD, FONTSIZE, drawPolygon);
	})
	
	// B锁仓量投资FIL节点
	sse.addEventListener("filnodes", function(e) {
		let response = JSON.parse(e.data);
	//	console.log(response);

		if(!response.success) {
			dom.innerText = response.message;
			return;
		}

		let dom = document.querySelector("#lockedFilNode>ul");
		while(dom.firstChild) {
			dom.removeChild(dom.firstChild);
		}

		let totalBalance = renderFilNodes(dom, response.data);
	})

	// keep alive
	sse.addEventListener("pong", function(e) {
		let response = JSON.parse(e.data);

		if(!response.success) {
			console.log("ping failed");
			return;
		}

		console.log("pong");
	})
}

function renderFilNodes(dom, data) {
	let totalBalance = 0;
	for(let key in data) {
		let li = document.createElement("li");
		let details = document.createElement("details");
		let summary = document.createElement("summary");
		summary.innerText = key;
		details.setAttribute("open", true);
		details.append(summary);
		let aside = document.createElement("aside");
		for(let k in data[key]) {
			let div = document.createElement("div");
			div.classList.add("filNodeValue");
			let h6 = document.createElement("h6");
			h6.innerText = filNodeColumns[k];
			let divInner = document.createElement("div");
			let v = data[key][k];
			let value;
			switch(k) {
				case "address":
					div.title = v;
					value = v;
					divInner.classList.add("address");
					break;
				case "singlet":
					value = v.toFixed(4) + " FIL/T";
					break;
				case "qualityadjpower":
					value = v.toFixed(4) + " BiP";
					break;
				default:
					value = v.toFixed(4) + " FIL";
			}
			divInner.innerText = value;
			div.append(h6);
			div.append(divInner);
			aside.append(div);
		}

		details.append(aside);
		li.append(details);
		dom.append(li);
		let hr = document.createElement("hr");
		dom.append(hr);
	}
}

window.onload = main;
