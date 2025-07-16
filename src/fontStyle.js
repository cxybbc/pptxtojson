import {getTextByPathList} from "./utils";
import {getShadow} from "./shadow";
import {getFillType, getSolidFill} from "./fill";

export function getFontType(node, type, warpObj) {
	let typeface = getTextByPathList(node, ["a:rPr", "a:latin", "attrs", "typeface"]);

	if (!typeface) {
		const fontSchemeNode = getTextByPathList(warpObj["themeContent"], ["a:theme", "a:themeElements", "a:fontScheme"]);

		if (type === "title" || type === "subTitle" || type === "ctrTitle") {
			typeface = getTextByPathList(fontSchemeNode, ["a:majorFont", "a:latin", "attrs", "typeface"]);
		} else if (type === "body") {
			typeface = getTextByPathList(fontSchemeNode, ["a:minorFont", "a:latin", "attrs", "typeface"]);
		} else {
			typeface = getTextByPathList(fontSchemeNode, ["a:minorFont", "a:latin", "attrs", "typeface"]);
		}
	}

	return typeface || "";
}

export function getFontColor(node, pNode, lstStyle, pFontStyle, lvl, warpObj) {
	const rPrNode = getTextByPathList(node, ["a:rPr"]);
	let filTyp, color;
	if (rPrNode) {
		filTyp = getFillType(rPrNode);
		if (filTyp === "SOLID_FILL") {
			const solidFillNode = rPrNode["a:solidFill"];
			color = getSolidFill(solidFillNode, undefined, undefined, warpObj);
		}
	}
	if (!color && getTextByPathList(lstStyle, ["a:lvl" + lvl + "pPr", "a:defRPr"])) {
		const lstStyledefRPr = getTextByPathList(lstStyle, ["a:lvl" + lvl + "pPr", "a:defRPr"]);
		filTyp = getFillType(lstStyledefRPr);
		if (filTyp === "SOLID_FILL") {
			const solidFillNode = lstStyledefRPr["a:solidFill"];
			color = getSolidFill(solidFillNode, undefined, undefined, warpObj);
		}
	}
	if (!color) {
		const sPstyle = getTextByPathList(pNode, ["p:style", "a:fontRef"]);
		if (sPstyle) color = getSolidFill(sPstyle, undefined, undefined, warpObj);
		if (!color && pFontStyle) color = getSolidFill(pFontStyle, undefined, undefined, warpObj);
	}
	return color || "";
}

export function getFontSize(node, slideLayoutSpNode, type, slideMasterTextStyles) {
	let fontSize;

	if (getTextByPathList(node, ["a:rPr", "attrs", "sz"])) fontSize = getTextByPathList(node, ["a:rPr", "attrs", "sz"]) / 100;

	if (isNaN(fontSize) || !fontSize) {
		const sz = getTextByPathList(slideLayoutSpNode, ["p:txBody", "a:lstStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		fontSize = parseInt(sz) / 100;
	}

	if (isNaN(fontSize) || !fontSize) {
		let sz;
		if (type === "title" || type === "subTitle" || type === "ctrTitle") {
			sz = getTextByPathList(slideMasterTextStyles, ["p:titleStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		} else if (type === "body") {
			sz = getTextByPathList(slideMasterTextStyles, ["p:bodyStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		} else if (type === "dt" || type === "sldNum") {
			sz = "1200";
		} else if (!type) {
			sz = getTextByPathList(slideMasterTextStyles, ["p:otherStyle", "a:lvl1pPr", "a:defRPr", "attrs", "sz"]);
		}
		if (sz) fontSize = parseInt(sz) / 100;
	}

	const baseline = getTextByPathList(node, ["a:rPr", "attrs", "baseline"]);
	if (baseline && !isNaN(fontSize)) fontSize -= 10;

	fontSize = isNaN(fontSize) || !fontSize ? 18 : fontSize;

	return fontSize + "pt";
}

export function getFontBold(node) {
	return getTextByPathList(node, ["a:rPr", "attrs", "b"]) === "1" ? "bold" : "";
}

export function getFontItalic(node) {
	return getTextByPathList(node, ["a:rPr", "attrs", "i"]) === "1" ? "italic" : "";
}

export function getFontDecoration(node) {
	return getTextByPathList(node, ["a:rPr", "attrs", "u"]) === "sng" ? "underline" : "";
}

export function getFontDecorationLine(node) {
	return getTextByPathList(node, ["a:rPr", "attrs", "strike"]) === "sngStrike" ? "line-through" : "";
}

export function getFontSpace(node) {
	const spc = getTextByPathList(node, ["a:rPr", "attrs", "spc"]);
	return spc ? parseInt(spc) / 100 + "pt" : "";
}

export function getFontSubscript(node) {
	const baseline = getTextByPathList(node, ["a:rPr", "attrs", "baseline"]);
	if (!baseline) return "";
	return parseInt(baseline) > 0 ? "super" : "sub";
}

export function getFontShadow(node, warpObj) {
	const txtShadow = getTextByPathList(node, ["a:rPr", "a:effectLst", "a:outerShdw"]);
	if (txtShadow) {
		const shadow = getShadow(txtShadow, warpObj);
		if (shadow) {
			const {h, v, blur, color} = shadow;
			if (!isNaN(v) && !isNaN(h)) {
				return h + "pt " + v + "pt " + (blur ? blur + "pt" : "") + " " + color;
			}
		}
	}
	return "";
}

export function getFontHighlight(node, warpObj) {
	const rPrNode = getTextByPathList(node, ["a:rPr"]);
	if (!rPrNode) return "";

	const highlightNode = rPrNode["a:highlight"];
	if (!highlightNode) return "";

	// 处理高亮背景色，与 getSolidFill 函数类似
	let color = "";
	let clrNode;

	if (highlightNode["a:srgbClr"]) {
		clrNode = highlightNode["a:srgbClr"];
		color = getTextByPathList(clrNode, ["attrs", "val"]);
	} else if (highlightNode["a:schemeClr"]) {
		clrNode = highlightNode["a:schemeClr"];
		const schemeClr = "a:" + getTextByPathList(clrNode, ["attrs", "val"]);
		color = getSchemeColorFromTheme(schemeClr, warpObj) || "";
	} else if (highlightNode["a:scrgbClr"]) {
		clrNode = highlightNode["a:scrgbClr"];
		const defBultColorVals = clrNode["attrs"];
		const red = defBultColorVals["r"].indexOf("%") !== -1 ? defBultColorVals["r"].split("%").shift() : defBultColorVals["r"];
		const green = defBultColorVals["g"].indexOf("%") !== -1 ? defBultColorVals["g"].split("%").shift() : defBultColorVals["g"];
		const blue = defBultColorVals["b"].indexOf("%") !== -1 ? defBultColorVals["b"].split("%").shift() : defBultColorVals["b"];
		color = toHex(255 * (Number(red) / 100)) + toHex(255 * (Number(green) / 100)) + toHex(255 * (Number(blue) / 100));
	} else if (highlightNode["a:prstClr"]) {
		clrNode = highlightNode["a:prstClr"];
		const prstClr = getTextByPathList(clrNode, ["attrs", "val"]);
		color = getColorName2Hex(prstClr);
	} else if (highlightNode["a:hslClr"]) {
		clrNode = highlightNode["a:hslClr"];
		const defBultColorVals = clrNode["attrs"];
		const hue = Number(defBultColorVals["hue"]) / 100000;
		const sat = Number(defBultColorVals["sat"].indexOf("%") !== -1 ? defBultColorVals["sat"].split("%").shift() : defBultColorVals["sat"]) / 100;
		const lum = Number(defBultColorVals["lum"].indexOf("%") !== -1 ? defBultColorVals["lum"].split("%").shift() : defBultColorVals["lum"]) / 100;
		const hsl2rgb = hslToRgb(hue, sat, lum);
		color = toHex(hsl2rgb.r) + toHex(hsl2rgb.g) + toHex(hsl2rgb.b);
	} else if (highlightNode["a:sysClr"]) {
		clrNode = highlightNode["a:sysClr"];
		const sysClr = getTextByPathList(clrNode, ["attrs", "lastClr"]);
		if (sysClr) color = sysClr;
	}

	if (color && color.indexOf("#") === -1) color = "#" + color;

	return color;
}
