/*******************************************************/
/* Adapted from codebox/homoglyph https://git.io/JJPMJ */
/*                     MIT License                     */
/*******************************************************/
"use strict";

const removeDiacritics = require("diacritics").remove;

const HOMOGLYPHS = {
	"-": ["\u{2cba}", "\u{fe58}", "\u{2043}", "\u{2212}", "\u{2011}", "\u{2012}", "\u{2796}", "\u{2013}", "\u{02d7}", "\u{06d4}", "\u{2010}"],
	".": ["\u{a4f8}", "\u{06f0}", "\u{2024}", "\u{ff0e}", "\u{0702}", "\u{1d16d}", "\u{10a50}", "\u{0701}", "\u{a60e}", "\u{0660}"],
	"0": ["\u{feeb}", "\u{1d6b6}", "\u{2c9f}", "\u{0c82}", "\u{118d7}", "\u{1d490}", "\u{1d7f6}", "\u{fba6}", "\u{10404}", "\u{1d7d8}", "\u{a4f3}", "\u{0555}", "\u{1d6d0}", "\u{1d77e}", "\u{fbab}", "\u{10ff}", "\u{1d560}", "\u{1d698}", "\u{1d4de}", "\u{0665}", "\u{1d52c}", "\u{0966}", "\u{041e}", "\u{1d40e}", "\u{104c2}", "\u{ff2f}", "\u{1d7bc}", "\u{1d748}", "\u{1d7ce}", "\u{1d4f8}", "\u{1d764}", "\u{0b66}", "\u{1d442}", "\u{1d630}", "\u{0585}", "\u{1d5ae}", "\u{1042c}", "\u{0647}", "\u{1d594}", "\u{0d20}", "\u{118b5}", "\u{1d782}", "\u{104ea}", "\u{0ed0}", "\u{0c66}", "\u{1d6f0}", "\u{3007}", "\u{09e6}", "\u{1d70a}", "\u{1d11}", "\u{1d428}", "\u{0d82}", "\u{1d476}", "\u{1d7b8}", "\u{114d0}", "\u{0d02}", "\u{1d5fc}", "\u{fba7}", "\u{0b20}", "\u{06d5}", "\u{1d45c}", "\u{fbaa}", "\u{10292}", "\u{1d546}", "\u{1d5e2}", "\u{1d67e}", "\u{1d72a}", "\u{ab3d}", "\u{1ee24}", "\u{06be}", "\u{03bf}", "\u{0d66}", "\u{feea}", "\u{10516}", "\u{118c8}", "\u{2134}", "\u{1ee64}", "\u{1d70e}", "\u{ff4f}", "\u{06f5}", "\u{1d616}", "\u{1d0f}", "\u{043e}", "\u{1d57a}", "\u{ff10}", "\u{1d7e2}", "\u{06c1}", "\u{1d4aa}", "\u{0ce6}", "\u{2c9e}", "\u{118e0}", "\u{2d54}", "\u{1040}", "\u{1d512}", "\u{fbac}", "\u{0be6}", "\u{0c02}", "\u{1d744}", "\u{101d}", "\u{1d664}", "\u{0ae6}", "\u{006f}", "\u{039f}", "\u{fbad}", "\u{fba9}", "\u{0a66}", "\u{03c3}", "\u{12d0}", "\u{1d5c8}", "\u{05e1}", "\u{fba8}", "\u{fee9}", "\u{1d79e}", "\u{feec}", "\u{1d7ec}", "\u{07c0}", "\u{1d6d4}", "\u{1d64a}", "\u{0e50}", "\u{1ee84}", "\u{1fbf0}", "\u{102ab}", "\u{004f}"],
	"1": ["\u{0406}", "\u{ff4c}", "\u{23fd}", "\u{05c0}", "\u{217c}", "\u{1d6b0}", "\u{05df}", "\u{1d7f7}", "\u{1d43c}", "\u{1d4d8}", "\u{1d591}", "\u{1d661}", "\u{01c0}", "\u{fe8d}", "\u{1d5a8}", "\u{2110}", "\u{1d529}", "\u{10320}", "\u{1d7ed}", "\u{a4f2}", "\u{1d425}", "\u{1d6ea}", "\u{1d610}", "\u{07ca}", "\u{1d724}", "\u{1d4c1}", "\u{1d798}", "\u{0627}", "\u{2d4f}", "\u{2160}", "\u{1d7cf}", "\u{1d62d}", "\u{1d5f9}", "\u{ffe8}", "\u{1d4f5}", "\u{16f28}", "\u{1d459}", "\u{2111}", "\u{1d48d}", "\u{2223}", "\u{10309}", "\u{04c0}", "\u{0049}", "\u{1ee00}", "\u{0196}", "\u{16c1}", "\u{1d540}", "\u{1d5dc}", "\u{1d55d}", "\u{1ee80}", "\u{ff29}", "\u{2113}", "\u{2c92}", "\u{1d7e3}", "\u{1d678}", "\u{1d574}", "\u{1d695}", "\u{0399}", "\u{1d644}", "\u{1028a}", "\u{1d7d9}", "\u{fe8e}", "\u{ff11}", "\u{1d75e}", "\u{06f1}", "\u{007c}", "\u{1e8c7}", "\u{05d5}", "\u{006c}", "\u{1d470}", "\u{1fbf1}", "\u{0661}", "\u{1d408}", "\u{1d5c5}"],
	"2": ["\u{a644}", "\u{14bf}", "\u{1d7f8}", "\u{ff12}", "\u{03e8}", "\u{a6ef}", "\u{1fbf2}", "\u{01a7}", "\u{1d7ee}", "\u{1d7d0}", "\u{1d7e4}", "\u{1d7da}", "\u{a75a}"],
	"3": ["\u{1d7f9}", "\u{04e0}", "\u{1fbf3}", "\u{1d206}", "\u{021c}", "\u{1d7e5}", "\u{0417}", "\u{118ca}", "\u{01b7}", "\u{1d7ef}", "\u{1d7d1}", "\u{ff13}", "\u{a76a}", "\u{a7ab}", "\u{2ccc}", "\u{16f3b}", "\u{1d7db}"],
	"4": ["\u{1d7f0}", "\u{1d7fa}", "\u{ff14}", "\u{1d7d2}", "\u{1d7e6}", "\u{118af}", "\u{1fbf4}", "\u{1d7dc}", "\u{13ce}"],
	"5": ["\u{1fbf5}", "\u{1d7e7}", "\u{1d7d3}", "\u{118bb}", "\u{1d7fb}", "\u{ff15}", "\u{01bc}", "\u{1d7dd}", "\u{1d7f1}"],
	"6": ["\u{2cd2}", "\u{0431}", "\u{1d7e8}", "\u{1fbf6}", "\u{1d7de}", "\u{13ee}", "\u{118d5}", "\u{1d7fc}", "\u{ff16}", "\u{1d7f2}", "\u{1d7d4}"],
	"7": ["\u{118c6}", "\u{1d7fd}", "\u{1d7f3}", "\u{1d7df}", "\u{104d2}", "\u{1d212}", "\u{1d7d5}", "\u{1fbf7}", "\u{ff17}", "\u{1d7e9}"],
	"8": ["\u{0223}", "\u{1fbf8}", "\u{0a6a}", "\u{1031a}", "\u{0222}", "\u{1d7fe}", "\u{1d7d6}", "\u{1d7e0}", "\u{ff18}", "\u{1d7ea}", "\u{1d7f4}", "\u{0b03}", "\u{09ea}", "\u{1e8cb}"],
	"9": ["\u{1d7f5}", "\u{a76e}", "\u{09ed}", "\u{1d7e1}", "\u{0b68}", "\u{ff19}", "\u{1d7ff}", "\u{118d6}", "\u{1fbf9}", "\u{2cca}", "\u{0a67}", "\u{1d7d7}", "\u{118cc}", "\u{0d6d}", "\u{118ac}", "\u{1d7eb}"],
	"A": ["\u{16f40}", "\u{1d71c}", "\u{1d6a8}", "\u{1d504}", "\u{1d756}", "\u{0410}", "\u{1d6e2}", "\u{1d49c}", "\u{a4ee}", "\u{1d790}", "\u{15c5}", "\u{ff21}", "\u{1d00}", "\u{0391}", "\u{1d468}", "\u{1d538}", "\u{1d5d4}", "\u{1d63c}", "\u{102a0}", "\u{1d56c}", "\u{1d5a0}", "\u{1d434}", "\u{1d670}", "\u{13aa}", "\u{1d400}", "\u{1d608}", "\u{1d4d0}", "\u{ab7a}", "\u{0040}", "\u{15E9}", "\u{1f170}", "\u{5342}", "\u{039B}", "\u{FF91}", "\u{20B3}", "\u{0E04}", "\u{13D7}", "\u{1D2C}", "\u{1F130}", "\u{2200}", "\u{AA96}", "\u{0394}", "\u{2206}", "\u{1403}", "\u{10300}", "\u{2D60}", "\u{1D759}", "\u{1431}", "\u{2D37}", "\u{07E1}", "\u{1D760}", "\u{2227}", "\u{10321}", "\u{0466}", "\u{1D6B2}", "\u{212B}", "\u{22C0}", "\u{A554}", "\u{1D793}", "\u{1D6AB}", "\u{15CB}", "\u{A658}", "\u{1D79A}", "\u{1D71F}", "\u{0668}", "\u{06F8}", "\u{1D27}", "\u{1D6EC}", "\u{1D726}", "\u{0467}", "\u{A659}", "\u{1F702}", "\u{2A5C}", "\u{22CF}", "\u{29CD}", "\u{2C86}", "\u{0386}", "\u{1F1E6}", "\u{FE0F}", "\u{1F08}"],
	"B": ["\u{1d505}", "\u{0412}", "\u{13fc}", "\u{102a1}", "\u{1d63d}", "\u{1d5d5}", "\u{212c}", "\u{1d5a1}", "\u{1d469}", "\u{16d2}", "\u{1d6e3}", "\u{a4d0}", "\u{a7b4}", "\u{1d6a9}", "\u{15f7}", "\u{1d4d1}", "\u{1d791}", "\u{10282}", "\u{1d757}", "\u{13f4}", "\u{10301}", "\u{1d71d}", "\u{1d401}", "\u{0392}", "\u{1d609}", "\u{0299}", "\u{0432}", "\u{1d435}", "\u{1d56d}", "\u{ff22}", "\u{1d671}", "\u{1d539}"],
	"C": ["\u{0421}", "\u{118f2}", "\u{1d402}", "\u{03f9}", "\u{a4da}", "\u{10415}", "\u{ff23}", "\u{1d4d2}", "\u{1d436}", "\u{1d56e}", "\u{1d60a}", "\u{10302}", "\u{2ca4}", "\u{216d}", "\u{1d672}", "\u{1d5d6}", "\u{1051c}", "\u{102a2}", "\u{1d46a}", "\u{1d5a2}", "\u{13df}", "\u{118e9}", "\u{1f74c}", "\u{1d63e}", "\u{1d49e}", "\u{2102}", "\u{212d}"],
	"D": ["\u{1d673}", "\u{13a0}", "\u{1d403}", "\u{1d437}", "\u{ab70}", "\u{216e}", "\u{1d49f}", "\u{1d507}", "\u{1d56f}", "\u{2145}", "\u{15ea}", "\u{1d5a3}", "\u{1d63f}", "\u{1d4d3}", "\u{15de}", "\u{1d5d7}", "\u{1d46b}", "\u{a4d3}", "\u{1d05}", "\u{ff24}", "\u{1d53b}", "\u{1d60b}"],
	"E": ["\u{1d60c}", "\u{1d404}", "\u{1d6ac}", "\u{1d4d4}", "\u{1d438}", "\u{10286}", "\u{1d6e6}", "\u{1d508}", "\u{22ff}", "\u{118ae}", "\u{1d5a4}", "\u{0415}", "\u{1d46c}", "\u{118a6}", "\u{2d39}", "\u{1d53c}", "\u{1d570}", "\u{0395}", "\u{ab7c}", "\u{a4f0}", "\u{2130}", "\u{1d5d8}", "\u{1d75a}", "\u{1d640}", "\u{1d674}", "\u{1d720}", "\u{13ac}", "\u{1d07}", "\u{1d794}", "\u{ff25}", "\u{0454}", "\u{15F4}"],
	"F": ["\u{1d509}", "\u{10287}", "\u{118a2}", "\u{1d571}", "\u{15b4}", "\u{1d439}", "\u{1d46d}", "\u{1d641}", "\u{2131}", "\u{118c2}", "\u{ff26}", "\u{1d53d}", "\u{1d213}", "\u{1d5a5}", "\u{03dc}", "\u{1d7ca}", "\u{1d60d}", "\u{1d405}", "\u{1d5d9}", "\u{a4dd}", "\u{1d675}", "\u{a798}", "\u{10525}", "\u{102a5}", "\u{1d4d5}"],
	"G": ["\u{1d53e}", "\u{1d46e}", "\u{13c0}", "\u{1d572}", "\u{1d406}", "\u{1d5a6}", "\u{1d642}", "\u{1d5da}", "\u{13fb}", "\u{1d4d6}", "\u{1d43a}", "\u{0262}", "\u{1d4a2}", "\u{1d50a}", "\u{1d676}", "\u{ab90}", "\u{050c}", "\u{13f3}", "\u{050d}", "\u{a4d6}", "\u{ff27}", "\u{1d60e}"],
	"H": ["\u{102cf}", "\u{1d6e8}", "\u{ff28}", "\u{1d60f}", "\u{210d}", "\u{13bb}", "\u{2c8e}", "\u{1d722}", "\u{a4e7}", "\u{0397}", "\u{1d75c}", "\u{157c}", "\u{210b}", "\u{1d5db}", "\u{1d796}", "\u{1d573}", "\u{1d6ae}", "\u{029c}", "\u{1d407}", "\u{041d}", "\u{ab8b}", "\u{210c}", "\u{1d677}", "\u{1d5a7}", "\u{1d643}", "\u{043d}", "\u{1d4d7}", "\u{1d46f}", "\u{1d43b}"],
	"I": ["\u{0406}", "\u{ff4c}", "\u{23fd}", "\u{05c0}", "\u{217c}", "\u{1d6b0}", "\u{05df}", "\u{1d7f7}", "\u{1d43c}", "\u{1d4d8}", "\u{1d591}", "\u{1d661}", "\u{01c0}", "\u{fe8d}", "\u{1d5a8}", "\u{2110}", "\u{1d529}", "\u{10320}", "\u{1d7ed}", "\u{a4f2}", "\u{1d425}", "\u{1d6ea}", "\u{1d610}", "\u{07ca}", "\u{1d724}", "\u{1d4c1}", "\u{1d798}", "\u{0627}", "\u{2d4f}", "\u{2160}", "\u{1d7cf}", "\u{1d62d}", "\u{1d5f9}", "\u{ffe8}", "\u{0031}", "\u{1d4f5}", "\u{16f28}", "\u{1d459}", "\u{2111}", "\u{1d48d}", "\u{2223}", "\u{10309}", "\u{04c0}", "\u{1ee00}", "\u{0196}", "\u{16c1}", "\u{1d540}", "\u{1d5dc}", "\u{1d55d}", "\u{1ee80}", "\u{ff29}", "\u{2113}", "\u{2c92}", "\u{1d7e3}", "\u{1d678}", "\u{1d574}", "\u{1d695}", "\u{0399}", "\u{1d644}", "\u{1028a}", "\u{1d7d9}", "\u{fe8e}", "\u{ff11}", "\u{1d75e}", "\u{06f1}", "\u{007c}", "\u{1e8c7}", "\u{05d5}", "\u{006c}", "\u{1d470}", "\u{1fbf1}", "\u{0661}", "\u{1d408}", "\u{1d5c5}"],
	"J": ["\u{a4d9}", "\u{a7b2}", "\u{1d5a9}", "\u{1d4a5}", "\u{1d645}", "\u{1d5dd}", "\u{1d0a}", "\u{ab7b}", "\u{13ab}", "\u{ff2a}", "\u{1d409}", "\u{1d541}", "\u{037f}", "\u{1d471}", "\u{1d50d}", "\u{1d575}", "\u{148d}", "\u{1d4d9}", "\u{0408}", "\u{1d43d}", "\u{1d611}", "\u{1d679}"],
	"K": ["\u{1d50e}", "\u{1d75f}", "\u{039a}", "\u{1d6eb}", "\u{1d799}", "\u{1d4a6}", "\u{2c94}", "\u{041a}", "\u{1d612}", "\u{1d576}", "\u{1d542}", "\u{ff2b}", "\u{1d43e}", "\u{a4d7}", "\u{1d67a}", "\u{16d5}", "\u{1d725}", "\u{10518}", "\u{1d472}", "\u{1d4da}", "\u{1d5aa}", "\u{1d40a}", "\u{1d5de}", "\u{1d646}", "\u{1d6b1}", "\u{212a}", "\u{13e6}"],
	"L": ["\u{029f}", "\u{118a3}", "\u{1d22a}", "\u{abae}", "\u{1d647}", "\u{1041b}", "\u{1d473}", "\u{1d43f}", "\u{2cd0}", "\u{216c}", "\u{14aa}", "\u{1d4db}", "\u{10526}", "\u{1d50f}", "\u{ff2c}", "\u{10443}", "\u{1d577}", "\u{1d5df}", "\u{1d613}", "\u{1d543}", "\u{1d67b}", "\u{118b2}", "\u{1d5ab}", "\u{a4e1}", "\u{1d40b}", "\u{2112}", "\u{2cd1}", "\u{16f16}", "\u{13de}"],
	"M": ["\u{10311}", "\u{1d5ac}", "\u{1d67c}", "\u{16d6}", "\u{1d4dc}", "\u{1d474}", "\u{1d510}", "\u{2c98}", "\u{041c}", "\u{15f0}", "\u{03fa}", "\u{039c}", "\u{1d5e0}", "\u{1d578}", "\u{1d440}", "\u{ff2d}", "\u{216f}", "\u{1d6b3}", "\u{1d79b}", "\u{1d40c}", "\u{1d727}", "\u{1d544}", "\u{1d614}", "\u{1d761}", "\u{102b0}", "\u{2133}", "\u{1d6ed}", "\u{13b7}", "\u{1d648}", "\u{a4df}"],
	"N": ["\u{1d5ad}", "\u{1d40d}", "\u{ff2e}", "\u{1d6ee}", "\u{2115}", "\u{1d4dd}", "\u{1d649}", "\u{a4e0}", "\u{1d475}", "\u{1d441}", "\u{1d579}", "\u{0274}", "\u{2c9a}", "\u{1d79c}", "\u{1d615}", "\u{1d67d}", "\u{1d728}", "\u{1d5e1}", "\u{1d511}", "\u{039d}", "\u{1d4a9}", "\u{1d762}", "\u{10513}", "\u{1d6b4}"],
	"O": ["\u{feeb}", "\u{1d6b6}", "\u{2c9f}", "\u{0c82}", "\u{0030}", "\u{118d7}", "\u{1d490}", "\u{1d7f6}", "\u{fba6}", "\u{10404}", "\u{1d7d8}", "\u{a4f3}", "\u{0555}", "\u{1d6d0}", "\u{1d77e}", "\u{fbab}", "\u{10ff}", "\u{1d560}", "\u{1d698}", "\u{1d4de}", "\u{0665}", "\u{1d52c}", "\u{0966}", "\u{041e}", "\u{1d40e}", "\u{104c2}", "\u{ff2f}", "\u{1d7bc}", "\u{1d748}", "\u{1d7ce}", "\u{1d4f8}", "\u{1d764}", "\u{0b66}", "\u{1d442}", "\u{1d630}", "\u{0585}", "\u{1d5ae}", "\u{1042c}", "\u{0647}", "\u{1d594}", "\u{0d20}", "\u{118b5}", "\u{1d782}", "\u{104ea}", "\u{0ed0}", "\u{0c66}", "\u{1d6f0}", "\u{3007}", "\u{09e6}", "\u{1d70a}", "\u{1d11}", "\u{1d428}", "\u{0d82}", "\u{1d476}", "\u{1d7b8}", "\u{114d0}", "\u{0d02}", "\u{1d5fc}", "\u{fba7}", "\u{0b20}", "\u{06d5}", "\u{1d45c}", "\u{fbaa}", "\u{10292}", "\u{1d546}", "\u{1d5e2}", "\u{1d67e}", "\u{1d72a}", "\u{ab3d}", "\u{1ee24}", "\u{06be}", "\u{03bf}", "\u{0d66}", "\u{feea}", "\u{10516}", "\u{118c8}", "\u{2134}", "\u{1ee64}", "\u{1d70e}", "\u{ff4f}", "\u{06f5}", "\u{1d616}", "\u{1d0f}", "\u{043e}", "\u{1d57a}", "\u{ff10}", "\u{1d7e2}", "\u{06c1}", "\u{1d4aa}", "\u{0ce6}", "\u{2c9e}", "\u{118e0}", "\u{2d54}", "\u{1040}", "\u{1d512}", "\u{fbac}", "\u{0be6}", "\u{0c02}", "\u{1d744}", "\u{101d}", "\u{1d664}", "\u{0ae6}", "\u{006f}", "\u{039f}", "\u{fbad}", "\u{fba9}", "\u{0a66}", "\u{03c3}", "\u{12d0}", "\u{1d5c8}", "\u{05e1}", "\u{fba8}", "\u{fee9}", "\u{1d79e}", "\u{feec}", "\u{1d7ec}", "\u{07c0}", "\u{1d6d4}", "\u{1d64a}", "\u{0e50}", "\u{1ee84}", "\u{1fbf0}", "\u{102ab}", "\u{15DD}"],
	"P": ["\u{03a1}", "\u{a4d1}", "\u{1d57b}", "\u{1d29}", "\u{1d67f}", "\u{146d}", "\u{1d5e3}", "\u{1d5af}", "\u{1d477}", "\u{1d4df}", "\u{1d4ab}", "\u{0420}", "\u{abb2}", "\u{1d7a0}", "\u{13e2}", "\u{1d18}", "\u{1d40f}", "\u{2ca2}", "\u{2119}", "\u{10295}", "\u{1d617}", "\u{ff30}", "\u{1d64b}", "\u{1d766}", "\u{1d443}", "\u{1d6b8}", "\u{1d6f2}", "\u{1d513}", "\u{1d72c}"],
	"Q": ["\u{1d410}", "\u{1d514}", "\u{1d57c}", "\u{1d5e4}", "\u{ff31}", "\u{1d64c}", "\u{1d680}", "\u{1d618}", "\u{1d478}", "\u{1d4ac}", "\u{1d5b0}", "\u{2d55}", "\u{211a}", "\u{1d4e0}", "\u{1d444}"],
	"R": ["\u{1d479}", "\u{1d619}", "\u{0280}", "\u{1d57d}", "\u{1d411}", "\u{1d5e5}", "\u{13d2}", "\u{16b1}", "\u{ab71}", "\u{1d64d}", "\u{1d445}", "\u{aba2}", "\u{1587}", "\u{211c}", "\u{1d5b1}", "\u{104b4}", "\u{01a6}", "\u{1d216}", "\u{16f35}", "\u{1d681}", "\u{1d4e1}", "\u{211b}", "\u{a4e3}", "\u{211d}", "\u{13a1}", "\u{ff32}", "\u{044F}"],
	"S": ["\u{1d57e}", "\u{13da}", "\u{1d682}", "\u{13d5}", "\u{10420}", "\u{ff33}", "\u{1d516}", "\u{1d61a}", "\u{054f}", "\u{10296}", "\u{0405}", "\u{1d5b2}", "\u{1d5e6}", "\u{1d47a}", "\u{1d4e2}", "\u{1d446}", "\u{16f3a}", "\u{a4e2}", "\u{1d54a}", "\u{1d412}", "\u{1d64e}", "\u{1d4ae}"],
	"T": ["\u{22a4}", "\u{2ca6}", "\u{13a2}", "\u{1d72f}", "\u{03c4}", "\u{1d57f}", "\u{ab72}", "\u{16f0a}", "\u{1d1b}", "\u{0442}", "\u{1d70f}", "\u{1d47b}", "\u{1d683}", "\u{27d9}", "\u{1d54b}", "\u{1d517}", "\u{03a4}", "\u{10315}", "\u{1d4af}", "\u{1d5e7}", "\u{1d7a3}", "\u{1d749}", "\u{102b1}", "\u{1d413}", "\u{1d64f}", "\u{ff34}", "\u{0422}", "\u{1d5b3}", "\u{a4d4}", "\u{1d6f5}", "\u{1d61b}", "\u{1d6bb}", "\u{1d769}", "\u{1d6d5}", "\u{1d7bd}", "\u{118bc}", "\u{1f768}", "\u{1d447}", "\u{10297}", "\u{1d783}", "\u{1d4e3}"],
	"U": ["\u{054d}", "\u{222a}", "\u{118b8}", "\u{1d47c}", "\u{1d580}", "\u{a4f4}", "\u{1d414}", "\u{1d448}", "\u{1d684}", "\u{16f42}", "\u{1d518}", "\u{144c}", "\u{1d54c}", "\u{1d650}", "\u{1d4e4}", "\u{1200}", "\u{1d5e8}", "\u{1d61c}", "\u{1d5b4}", "\u{1d4b0}", "\u{22c3}", "\u{104ce}", "\u{ff35}"],
	"V": ["\u{1d581}", "\u{1d47d}", "\u{1d20d}", "\u{2d38}", "\u{a4e6}", "\u{1d5e9}", "\u{1d519}", "\u{1d4b1}", "\u{142f}", "\u{1d685}", "\u{1051d}", "\u{1d61d}", "\u{16f08}", "\u{0474}", "\u{13d9}", "\u{ff36}", "\u{1d415}", "\u{2164}", "\u{0667}", "\u{1d54d}", "\u{1d651}", "\u{118a0}", "\u{1d4e5}", "\u{a6df}", "\u{06f7}", "\u{1d5b5}", "\u{1d449}"],
	"W": ["\u{118ef}", "\u{1d686}", "\u{1d416}", "\u{1d4e6}", "\u{13b3}", "\u{1d47e}", "\u{1d5b6}", "\u{1d582}", "\u{1d44a}", "\u{1d4b2}", "\u{13d4}", "\u{1d61e}", "\u{1d5ea}", "\u{a4ea}", "\u{118e6}", "\u{ff37}", "\u{1d652}", "\u{051c}", "\u{1d51a}", "\u{1d54e}"],
	"X": ["\u{1d76c}", "\u{1d54f}", "\u{1d5eb}", "\u{1d4b3}", "\u{166d}", "\u{102b4}", "\u{1d44b}", "\u{2573}", "\u{1d47f}", "\u{10290}", "\u{ff38}", "\u{1d583}", "\u{1d7a6}", "\u{2169}", "\u{1d61f}", "\u{10527}", "\u{1d417}", "\u{1d732}", "\u{1d6f8}", "\u{1d5b7}", "\u{2d5d}", "\u{1d653}", "\u{1d687}", "\u{10322}", "\u{2cac}", "\u{1d4e7}", "\u{1d51b}", "\u{1d6be}", "\u{a4eb}", "\u{0425}", "\u{16b7}", "\u{03a7}", "\u{10317}", "\u{a7b3}", "\u{118ec}"],
	"Y": ["\u{1d418}", "\u{1d480}", "\u{1d654}", "\u{a4ec}", "\u{1d44c}", "\u{1d7a4}", "\u{13bd}", "\u{1d5ec}", "\u{1d4b4}", "\u{1d620}", "\u{1d6f6}", "\u{1d5b8}", "\u{1d4e8}", "\u{0423}", "\u{118a4}", "\u{1d76a}", "\u{16f43}", "\u{04ae}", "\u{1d688}", "\u{1d550}", "\u{1d584}", "\u{2ca8}", "\u{03d2}", "\u{1d51c}", "\u{13a9}", "\u{ff39}", "\u{1d6bc}", "\u{1d730}", "\u{03a5}", "\u{102b2}"],
	"Z": ["\u{a4dc}", "\u{1d6ad}", "\u{1d795}", "\u{102f5}", "\u{1d44d}", "\u{1d4e9}", "\u{1d75b}", "\u{0396}", "\u{1d419}", "\u{1d621}", "\u{118e5}", "\u{1d585}", "\u{1d655}", "\u{118a9}", "\u{13c3}", "\u{2124}", "\u{1d5b9}", "\u{1d721}", "\u{1d481}", "\u{1d4b5}", "\u{1d689}", "\u{1d6e7}", "\u{1d5ed}", "\u{ff3a}", "\u{2128}"],
	"a": ["\u{0061}", "\u{0430}", "\u{2090}", "\u{1d5ba}", "\u{ddba}", "\u{1d43}", "\u{1d5ee}", "\u{ddee}", "\u{1d622}", "\u{de22}", "\u{018b}", "\u{1d68a}", "\u{de8a}", "\u{1d656}", "\u{de56}", "\u{10db}", "\u{1d7c3}", "\u{dfc3}", "\u{1d41a}", "\u{dc1a}", "\u{0363}", "\u{2202}", "\u{018c}", "\u{1d789}", "\u{df89}", "\u{0105}", "\u{0251}", "\u{03b1}", "\u{1d74f}", "\u{df4f}", "\u{237a}", "\u{1d770}", "\u{df70}", "\u{1d482}", "\u{dc82}", "\u{1d7aa}", "\u{dfaa}", "\u{07e5}", "\u{1951}", "\u{1972}", "\u{1d44e}", "\u{dc4e}", "\u{10e8}", "\u{1d736}", "\u{1D6FC}", "\u{1D45}", "\u{1D586}", "\u{0EA5}", "\u{1D6C2}", "\u{1D4EA}", "\u{1D715}", "\u{0E25}"],
	"b": ["\u{0062}", "\u{10ee}", "\u{0253}", "\u{15af}", "\u{1d5bb}", "\u{ddbb}", "\u{07d5}", "\u{1d623}", "\u{de23}", "\u{042c}", "\u{1472}", "\u{0185}", "\u{1d41b}", "\u{dc1b}", "\u{1d5ef}", "\u{ddef}", "\u{0180}", "\u{1d47}", "\u{0184}", "\u{0183}", "\u{042a}", "\u{048c}", "\u{2422}", "\u{1483}", "\u{13cf}", "\u{1d6c}", "\u{1d657}", "\u{de57}", "\u{044c}", "\u{1d68b}", "\u{de8b}", "\u{10a6}", "\u{03e6}", "\u{2c13}", "\u{1d587}", "\u{dd87}", "\u{1d483}", "\u{dc83}", "\u{1d44f}", "\u{dc4f}", "\u{048d}", "\u{044a}", "\u{266d}", "\u{1473}", "\u{2c43}", "\u{a64e}", "\u{147f}", "\u{1579}", "\u{1d51f}", "\u{dd1f}", "\u{1D553}"],
	"c": ["\u{0043}", "\u{03f9}", "\u{1d5a2}", "\u{dda2}", "\u{216d}", "\u{1d5d6}", "\u{ddd6}", "\u{0421}", "\u{0063}", "\u{03f2}", "\u{2201}", "\u{0441}", "\u{1d5bc}", "\u{ddbc}", "\u{1d63e}", "\u{de3e}", "\u{217d}", "\u{1455}", "\u{1d04}", "\u{1d60a}", "\u{de0a}", "\u{1d9c}", "\u{1d624}", "\u{de24}", "\u{13df}", "\u{2ca4}", "\u{1466}", "\u{14bc}", "\u{104a8}", "\u{dca8}", "\u{1d41c}", "\u{dc1c}", "\u{1d5f0}", "\u{ddf0}", "\u{2ca5}", "\u{1d672}", "\u{de72}", "\u{1d658}", "\u{de58}", "\u{13e3}", "\u{0297}", "\u{1d68c}", "\u{de8c}", "\u{2d4e}", "\u{1d484}", "\u{dc84}", "\u{0368}", "\u{1d450}", "\u{dc50}", "\u{00e7}", "\u{1d4d2}", "\u{dcd2}", "\u{1974}", "\u{1d4ec}", "\u{00A2}", "\u{1D554}", "\u{03fe}", "\u{2e26}", "\u{096e}", "\u{037c}", "\u{1462}", "\u{2103}", "\u{1004}", "\u{122d}", "\u{1f1e8}", "\u{dde8}", "\u{531a}"],
	"d": ["\u{1d659}", "\u{ff44}", "\u{1d41d}", "\u{13e7}", "\u{a4d2}", "\u{1d4ed}", "\u{1d5bd}", "\u{1d521}", "\u{0501}", "\u{2146}", "\u{1d451}", "\u{1d485}", "\u{1d555}", "\u{1d68d}", "\u{146f}", "\u{1d5f1}", "\u{217e}", "\u{1d589}", "\u{1d625}", "\u{1d4b9}", "\u{10eb}", "\u{056a}", "\u{0500}", "\u{1d48}", "\u{053a}", "\u{0369}", "\u{1d6d}", "\u{1577}", "\u{1d6ff}", "\u{deff}", "\u{0502}", "\u{1470}", "\u{1d6db}"],
	"e": ["\u{1d556}", "\u{1d68e}", "\u{1d522}", "\u{04bd}", "\u{2147}", "\u{212e}", "\u{1d65a}", "\u{1d486}", "\u{1d5be}", "\u{1d41e}", "\u{1d626}", "\u{0435}", "\u{ab32}", "\u{1d452}", "\u{1d5f2}", "\u{1d58a}", "\u{212f}", "\u{ff45}", "\u{1d4ee}", "\u{2091}", "\u{1d49}", "\u{04d8}", "\u{0259}", "\u{04bc}", "\u{0258}", "\u{1971}", "\u{04d9}", "\u{156a}", "\u{1566}", "\u{5df3}", "\u{0c32}", "\u{5df2}", "\u{0b67}", "\u{0d32}"],
	"f": ["\u{1d65b}", "\u{1d7cb}", "\u{1d5bf}", "\u{1d523}", "\u{1d41f}", "\u{1d487}", "\u{1d627}", "\u{1d557}", "\u{a799}", "\u{1d453}", "\u{0584}", "\u{1d5f3}", "\u{1d58b}", "\u{017f}", "\u{03dd}", "\u{ff46}", "\u{1d4ef}", "\u{1d4bb}", "\u{1e9d}", "\u{1d68f}", "\u{ab35}", "\u{1da0}", "\u{2a0d}", "\u{1e9c}", "\u{2a0e}", "\u{0493}", "\u{1d73}", "\u{1d82}", "\u{2a0f}", "\u{1f761}", "\u{df61}", "\u{0562}"],
	"g": ["\u{1d558}", "\u{1d690}", "\u{0261}", "\u{1d58c}", "\u{1d83}", "\u{1d488}", "\u{0581}", "\u{1d454}", "\u{210a}", "\u{1d628}", "\u{1d65c}", "\u{1d5f4}", "\u{1d4f0}", "\u{ff47}", "\u{018d}", "\u{1d524}", "\u{1d5c0}", "\u{1d420}", "\u{1da2}", "\u{1d4d}", "\u{0551}", "\u{10d2}", "\u{100c}"],
	"h": ["\u{0570}", "\u{1d421}", "\u{1d629}", "\u{1d559}", "\u{1d525}", "\u{1d5f5}", "\u{210e}", "\u{ff48}", "\u{04bb}", "\u{1d489}", "\u{1d58d}", "\u{1d65d}", "\u{13c2}", "\u{1d4f1}", "\u{1d691}", "\u{1d5c1}", "\u{1d4bd}", "\u{10b9}", "\u{04ba}", "\u{02b0}", "\u{056b}", "\u{0266}", "\u{a727}", "\u{2095}", "\u{144b}", "\u{02b1}", "\u{a695}", "\u{0526}", "\u{0267}", "\u{2644}", "\u{10337}", "\u{df37}", "\u{a694}", "\u{045b}", "\u{036a}", "\u{0452}", "\u{210f}", "\u{0527}", "\u{10ac}", "\u{10e9}", "\u{3093}", "\u{10485}"],
	"i": ["\u{2148}", "\u{1d422}", "\u{1d6a4}", "\u{0131}", "\u{1d7b2}", "\u{1d65e}", "\u{1d4f2}", "\u{1d48a}", "\u{ff49}", "\u{0456}", "\u{1d4be}", "\u{2170}", "\u{1d55a}", "\u{1d58e}", "\u{0269}", "\u{04cf}", "\u{1d6ca}", "\u{02db}", "\u{1d5c2}", "\u{037a}", "\u{118c3}", "\u{1d456}", "\u{a647}", "\u{1d778}", "\u{2373}", "\u{1d62a}", "\u{1d73e}", "\u{ab75}", "\u{1fbe}", "\u{13a5}", "\u{026a}", "\u{2139}", "\u{1d526}", "\u{1d692}", "\u{1d5f6}", "\u{1d704}", "\u{03b9}", "\u{1d62}", "\u{a71f}", "\u{a71e}", "\u{fb4b}", "\u{1fd9}", "\u{2071}", "\u{1d09}", "\u{1fd1}", "\u{fe83}", "\u{1f30}", "\u{0623}", "\u{1f31}", "\u{03af}", "\u{fe84}", "\u{1f76}", "\u{1fd8}", "\u{1fd0}", "\u{1f77}", "\u{fe82}", "\u{1f38}", "\u{8ba0}", "\u{0f0f}", "\u{0390}"],
	"j": ["\u{1d62b}", "\u{1d55b}", "\u{1d423}", "\u{1d48b}", "\u{1d58f}", "\u{03f3}", "\u{ff4a}", "\u{1d5c3}", "\u{1d4bf}", "\u{1d65f}", "\u{0458}", "\u{1d527}", "\u{1d5f7}", "\u{1d4f3}", "\u{2149}", "\u{1d457}", "\u{1d693}", "\u{02b2}", "\u{2c7c}", "\u{029d}", "\u{14a8}", "\u{2321}", "\u{fedf}", "\u{148e}", "\u{23ad}", "\u{1d36}", "\u{fee7}", "\u{06b5}", "\u{1da8}", "\u{06b6}", "\u{0692}", "\u{06ef}", "\u{076c}", "\u{14a9}", "\u{148f}", "\u{fb8c}", "\u{0691}", "\u{0632}", "\u{149b}", "\u{14b5}", "\u{fedd}", "\u{0644}", "\u{14b4}", "\u{fede}", "\u{1042}", "\u{0698}", "\u{0630}"],
	"k": ["\u{1d458}", "\u{1d55c}", "\u{1d4c0}", "\u{1d48c}", "\u{1d4f4}", "\u{1d590}", "\u{ff4b}", "\u{1d528}", "\u{1d5c4}", "\u{1d62c}", "\u{1d5f8}", "\u{1d660}", "\u{1d424}", "\u{1d694}", "\u{1d4f}", "\u{0138}", "\u{049f}", "\u{2096}", "\u{03ba}", "\u{043a}", "\u{049a}", "\u{1030a}", "\u{df0a}", "\u{20ad}", "\u{049c}", "\u{04a0}", "\u{1d37}", "\u{1d0b}", "\u{1d779}", "\u{df79}", "\u{049b}", "\u{040c}", "\u{049e}", "\u{049d}", "\u{045c}", "\u{1d7b3}", "\u{dfb3}", "\u{051e}", "\u{1d6cb}", "\u{decb}", "\u{a5ea}", "\u{04a1}", "\u{1d84}"],
	"l": ["\u{0406}", "\u{ff4c}", "\u{23fd}", "\u{05c0}", "\u{217c}", "\u{1d6b0}", "\u{05df}", "\u{1d7f7}", "\u{1d43c}", "\u{1d4d8}", "\u{1d591}", "\u{1d661}", "\u{01c0}", "\u{fe8d}", "\u{1d5a8}", "\u{2110}", "\u{1d529}", "\u{10320}", "\u{1d7ed}", "\u{a4f2}", "\u{1d425}", "\u{1d6ea}", "\u{1d610}", "\u{07ca}", "\u{1d724}", "\u{1d4c1}", "\u{1d798}", "\u{0627}", "\u{2d4f}", "\u{2160}", "\u{1d7cf}", "\u{1d62d}", "\u{1d5f9}", "\u{ffe8}", "\u{0031}", "\u{1d4f5}", "\u{16f28}", "\u{1d459}", "\u{2111}", "\u{1d48d}", "\u{2223}", "\u{10309}", "\u{04c0}", "\u{0049}", "\u{1ee00}", "\u{0196}", "\u{16c1}", "\u{1d540}", "\u{1d5dc}", "\u{1d55d}", "\u{1ee80}", "\u{ff29}", "\u{2113}", "\u{2c92}", "\u{1d7e3}", "\u{1d678}", "\u{1d574}", "\u{1d695}", "\u{0399}", "\u{1d644}", "\u{1028a}", "\u{1d7d9}", "\u{fe8e}", "\u{ff11}", "\u{1d75e}", "\u{06f1}", "\u{007c}", "\u{1e8c7}", "\u{05d5}", "\u{1d470}", "\u{1fbf1}", "\u{0661}", "\u{1d408}", "\u{1d5c5}", "\u{2503}", "\u{258f}", "\u{2575}", "\u{2595}", "\u{1963}", "\u{257d}", "\u{a7fe}", "\u{258e}", "\u{257f}", "\u{1d85}", "\u{230a}", "\u{2759}", "\u{23ae}", "\u{056c}", "\u{a646}", "\u{09f7}", "\u{1da9}", "\u{2502}", "\u{23a2}", "\u{02e1}", "\u{239c}", "\u{23a3}", "\u{2758}", "\u{2514}", "\u{2515}", "\u{23a9}", "\u{0285}", "\u{2590}", "\u{258c}", "\u{239f}", "\u{23a5}", "\u{23aa}", "\u{1968}", "\u{a716}", "\u{3057}", "\u{053c}", "\u{1d369}", "\u{df69}", "\u{002f}", "\u{0582}", "\u{14bb}", "\u{10483}", "\u{dc83}", "\u{1d38}", "\u{2e24}", "\u{1490}", "\u{239d}", "\u{2559}", "\u{21c2}", "\u{0c79}", "\u{0964}", "\u{4e28}", "\u{0f0d}", "\u{ff5c}", "\u{2016}", "\u{038a}", "\u{0e40}", "\u{0e44}", "\u{3134}", "\u{4e5a}", "\u{3163}"],
	"m": ["\u{ff4d}", "\u{1d5fa}", "\u{ddfa}", "\u{1d426}", "\u{dc26}", "\u{1d5c6}", "\u{ddc6}", "\u{1d662}", "\u{de62}", "\u{217f}", "\u{1d62e}", "\u{de2e}", "\u{1d696}", "\u{de96}", "\u{20a5}", "\u{1d50}", "\u{0d28}", "\u{2098}", "\u{036b}", "\u{1d592}", "\u{dd92}", "\u{1320}", "\u{1dac}", "\u{10dd}", "\u{1d55e}", "\u{dd5e}", "\u{164f}", "\u{1662}", "\u{0d69}", "\u{1d48e}", "\u{dc8e}", "\u{1d6f}", "\u{163b}", "\u{2a4b}", "\u{15f6}", "\u{1d4f6}", "\u{dcf6}", "\u{264f}", "\u{1d45a}", "\u{dc5a}"],
	"n": ["\u{1d45b}", "\u{1d5fb}", "\u{1d5c7}", "\u{1d48f}", "\u{ff4e}", "\u{1d593}", "\u{1d62f}", "\u{057c}", "\u{1d663}", "\u{0578}", "\u{1d52b}", "\u{1d4f7}", "\u{1d4c3}", "\u{1d697}", "\u{1d55f}", "\u{1d427}", "\u{03B7}", "\u{041f}", "\u{1d765}", "\u{df65}", "\u{043f}", "\u{014a}", "\u{10b6}", "\u{0548}", "\u{03a0}", "\u{220f}", "\u{2229}", "\u{144e}", "\u{207f}", "\u{1d776}", "\u{df76}", "\u{22c2}", "\u{0580}", "\u{05d7}", "\u{1d28}", "\u{2099}", "\u{0273}", "\u{1952}", "\u{014b}", "\u{fb28}", "\u{1d79f}", "\u{df9f}", "\u{05ea}", "\u{1d7b0}", "\u{dfb0}", "\u{054c}", "\u{1033f}", "\u{df3f}", "\u{0572}", "\u{10340}", "\u{df40}", "\u{2ca0}", "\u{10d8}", "\u{1965}", "\u{1970}", "\u{1fc3}", "\u{10490}", "\u{dc90}", "\u{0525}", "\u{1459}", "\u{144f}", "\u{145a}", "\u{1d752}", "\u{df52}", "\u{0508}", "\u{1d7c6}", "\u{dfc6}", "\u{0564}"],
	"o": ["\u{feeb}", "\u{1d6b6}", "\u{2c9f}", "\u{0c82}", "\u{0030}", "\u{118d7}", "\u{1d490}", "\u{1d7f6}", "\u{fba6}", "\u{10404}", "\u{1d7d8}", "\u{a4f3}", "\u{0555}", "\u{1d6d0}", "\u{1d77e}", "\u{fbab}", "\u{10ff}", "\u{1d560}", "\u{1d698}", "\u{1d4de}", "\u{0665}", "\u{1d52c}", "\u{0966}", "\u{041e}", "\u{1d40e}", "\u{104c2}", "\u{ff2f}", "\u{1d7bc}", "\u{1d748}", "\u{1d7ce}", "\u{1d4f8}", "\u{1d764}", "\u{0b66}", "\u{1d442}", "\u{1d630}", "\u{0585}", "\u{1d5ae}", "\u{1042c}", "\u{0647}", "\u{1d594}", "\u{0d20}", "\u{118b5}", "\u{1d782}", "\u{104ea}", "\u{0ed0}", "\u{0c66}", "\u{1d6f0}", "\u{3007}", "\u{09e6}", "\u{1d70a}", "\u{1d11}", "\u{1d428}", "\u{0d82}", "\u{1d476}", "\u{1d7b8}", "\u{114d0}", "\u{0d02}", "\u{1d5fc}", "\u{fba7}", "\u{0b20}", "\u{06d5}", "\u{1d45c}", "\u{fbaa}", "\u{10292}", "\u{1d546}", "\u{1d5e2}", "\u{1d67e}", "\u{1d72a}", "\u{ab3d}", "\u{1ee24}", "\u{06be}", "\u{03bf}", "\u{0d66}", "\u{feea}", "\u{10516}", "\u{118c8}", "\u{2134}", "\u{1ee64}", "\u{1d70e}", "\u{ff4f}", "\u{06f5}", "\u{1d616}", "\u{1d0f}", "\u{043e}", "\u{1d57a}", "\u{ff10}", "\u{1d7e2}", "\u{06c1}", "\u{1d4aa}", "\u{0ce6}", "\u{2c9e}", "\u{118e0}", "\u{2d54}", "\u{1040}", "\u{1d512}", "\u{fbac}", "\u{0be6}", "\u{0c02}", "\u{1d744}", "\u{101d}", "\u{1d664}", "\u{0ae6}", "\u{039f}", "\u{fbad}", "\u{fba9}", "\u{0a66}", "\u{03c3}", "\u{12d0}", "\u{1d5c8}", "\u{05e1}", "\u{fba8}", "\u{fee9}", "\u{1d79e}", "\u{feec}", "\u{1d7ec}", "\u{07c0}", "\u{1d6d4}", "\u{1d64a}", "\u{0e50}", "\u{1ee84}", "\u{1fbf0}", "\u{102ab}", "\u{004f}", "\u{2092}", "\u{1d3c}", "\u{2070}", "\u{07cb}", "\u{1d52}", "\u{2b58}", "\u{26ac}", "\u{2080}", "\u{2b55}", "\u{104a0}", "\u{dca0}", "\u{03b8}", "\u{25cb}", "\u{047a}", "\u{1d7b1}", "\u{dfb1}", "\u{1d767}", "\u{df67}", "\u{274d}", "\u{2688}", "\u{1d777}", "\u{df77}", "\u{25ef}", "\u{1d7a1}", "\u{dfa1}", "\u{1d6c9}", "\u{dec9}", "\u{0298}", "\u{047b}", "\u{0718}", "\u{a668}", "\u{0398}", "\u{1d703}", "\u{df03}", "\u{2d40}", "\u{2d59}", "\u{038c}", "\u{0424}", "\u{1d73d}", "\u{df3d}", "\u{2689}", "\u{12d1}", "\u{2299}", "\u{25ce}", "\u{0e4f}", "\u{0fc0}"],
	"p": ["\u{1d4c5}", "\u{1d665}", "\u{1d754}", "\u{1d45d}", "\u{1d52d}", "\u{1d6d2}", "\u{1d5c9}", "\u{03c1}", "\u{1d429}", "\u{1d595}", "\u{0440}", "\u{1d5fd}", "\u{1d746}", "\u{2374}", "\u{1d4f9}", "\u{1d7c8}", "\u{1d7ba}", "\u{1d780}", "\u{1d6e0}", "\u{03f1}", "\u{1d491}", "\u{1d699}", "\u{ff50}", "\u{1d631}", "\u{1d561}", "\u{1d78e}", "\u{1d70c}", "\u{2ca3}", "\u{1d71a}"],
	"q": ["\u{0566}", "\u{1d562}", "\u{1d632}", "\u{051b}", "\u{1d52e}", "\u{1d596}", "\u{1d666}", "\u{1d492}", "\u{1d5fe}", "\u{0563}", "\u{1d42a}", "\u{1d5ca}", "\u{1d45e}", "\u{1d4fa}", "\u{1d4c6}", "\u{1d69a}", "\u{ff51}"],
	"r": ["\u{1d563}", "\u{ab47}", "\u{1d597}", "\u{1d26}", "\u{ab48}", "\u{1d493}", "\u{1d633}", "\u{0433}", "\u{1d4c7}", "\u{2c85}", "\u{1d45f}", "\u{ab81}", "\u{ff52}", "\u{1d42b}", "\u{1d52f}", "\u{1d69b}", "\u{1d5ff}", "\u{1d5cb}", "\u{1d4fb}", "\u{1d667}"],
	"s": ["\u{0455}", "\u{1d598}", "\u{ff53}", "\u{1d530}", "\u{1d460}", "\u{01bd}", "\u{a731}", "\u{1d5cc}", "\u{1d668}", "\u{10448}", "\u{1d564}", "\u{1d494}", "\u{1d4fc}", "\u{abaa}", "\u{1d4c8}", "\u{1d69c}", "\u{118c1}", "\u{1d42c}", "\u{1d634}", "\u{1d600}"],
	"t": ["\u{1d42d}", "\u{ff54}", "\u{1d5cd}", "\u{1d669}", "\u{1d69d}", "\u{1d4fd}", "\u{1d461}", "\u{1d4c9}", "\u{1d599}", "\u{1d601}", "\u{1d531}", "\u{1d635}", "\u{1d495}", "\u{1d565}"],
	"u": ["\u{1d602}", "\u{ab52}", "\u{1d7be}", "\u{1d1c}", "\u{028b}", "\u{104f6}", "\u{118d8}", "\u{a79f}", "\u{ab4e}", "\u{1d74a}", "\u{1d59a}", "\u{1d6d6}", "\u{1d4ca}", "\u{1d4fe}", "\u{ff55}", "\u{1d462}", "\u{1d636}", "\u{1d532}", "\u{057d}", "\u{1d566}", "\u{03c5}", "\u{1d69e}", "\u{1d42e}", "\u{1d710}", "\u{1d66a}", "\u{1d5ce}", "\u{1d496}", "\u{1d784}"],
	"v": ["\u{05d8}", "\u{1d4cb}", "\u{1d637}", "\u{1d6ce}", "\u{1d42f}", "\u{1d533}", "\u{aba9}", "\u{03bd}", "\u{1d4ff}", "\u{1d59b}", "\u{0475}", "\u{1d603}", "\u{22c1}", "\u{1d463}", "\u{1d708}", "\u{118c0}", "\u{1d742}", "\u{ff56}", "\u{1d497}", "\u{2174}", "\u{1d5cf}", "\u{1d66b}", "\u{1d7b6}", "\u{11706}", "\u{1d567}", "\u{1d77c}", "\u{2228}", "\u{1d20}", "\u{1d69f}"],
	"w": ["\u{1d500}", "\u{1d5d0}", "\u{0461}", "\u{026f}", "\u{1d66c}", "\u{1d6a0}", "\u{1d604}", "\u{1d568}", "\u{1d498}", "\u{0561}", "\u{1d4cc}", "\u{1d59c}", "\u{1170e}", "\u{1170f}", "\u{ab83}", "\u{1170a}", "\u{1d464}", "\u{1d534}", "\u{ff57}", "\u{1d21}", "\u{1d638}", "\u{051d}", "\u{1d430}"],
	"x": ["\u{1d605}", "\u{1d535}", "\u{1d59d}", "\u{1d66d}", "\u{157d}", "\u{166e}", "\u{ff58}", "\u{1d501}", "\u{2a2f}", "\u{0445}", "\u{292c}", "\u{00d7}", "\u{1541}", "\u{1d569}", "\u{2179}", "\u{1d639}", "\u{1d431}", "\u{1d4cd}", "\u{1d5d1}", "\u{292b}", "\u{1d6a1}", "\u{1d499}", "\u{1d465}"],
	"y": ["\u{1d59e}", "\u{1d502}", "\u{0443}", "\u{1d466}", "\u{118dc}", "\u{0263}", "\u{1d49a}", "\u{1d6fe}", "\u{213d}", "\u{1d56a}", "\u{1d606}", "\u{1d5d2}", "\u{1d772}", "\u{04af}", "\u{1d63a}", "\u{1d8c}", "\u{1d432}", "\u{ab5a}", "\u{1d738}", "\u{1d4ce}", "\u{028f}", "\u{1d536}", "\u{1d6c4}", "\u{03b3}", "\u{ff59}", "\u{1eff}", "\u{1d6a2}", "\u{1d66e}", "\u{10e7}", "\u{1d7ac}", "\u{02b8}", "\u{04b1}", "\u{1d67}", "\u{1d5e}", "\u{10345}", "\u{df45}", "\u{10b8}", "\u{10f8}", "\u{104a6}", "\u{dca6}", "\u{10c4}", "\u{10be}", "\u{07cc}", "\u{05e5}", "\u{045f}", "\u{05e2}", "\u{1048b}", "\u{dc8b}", "\u{10e3}", "\u{4e2b}", "\u{038e}", "\u{1f1fe}"],
	"z": ["\u{1d4cf}", "\u{1d49b}", "\u{1d63b}", "\u{1d607}", "\u{1d22}", "\u{1d56b}", "\u{1d537}", "\u{1d5d3}", "\u{1d433}", "\u{1d467}", "\u{1d66f}", "\u{1d503}", "\u{ab93}", "\u{ff5a}", "\u{118c4}", "\u{1d6a3}", "\u{1d59f}"],
};

class Homoglyph {
	replace(text, charMap = HOMOGLYPHS) {
		const output = [];
		const inputTextSymbolArray = this.makeSymbolArray(removeDiacritics(text));
		const keys = Object.keys(charMap);
		for (const char of inputTextSymbolArray) {
			let found = false;
			for (let i = keys.length - 1; i > 0; i--) {
				if (charMap[keys[i]].includes(char)) {
					output.push(keys[i]);
					found = true;
					break;
				}
			}
			if (!found) output.push(char);
		}

		return Tools.toHomoglyphWord(output.join(""));
	}

	testReplace(text, charMap = HOMOGLYPHS) {
		const output = [];
		const inputTextSymbolArray = this.makeSymbolArray(removeDiacritics(text));
		const keys = Object.keys(charMap);
		for (const char of inputTextSymbolArray) {
			let found = false;
			for (let i = keys.length - 1; i > 0; i--) {
				if (charMap[keys[i]].includes(char)) {
					output.push(keys[i]);
					found = true;
					break;
				}
			}
			if (!found) output.push(char);
		}

		return output.join("");
	}

	deepfry(text, charmap = HOMOGLYPHS) {
		const output = [];
		const inputTextSymbolArray = this.makeSymbolArray(text);
		for (let i = 0; i < inputTextSymbolArray.length; i++) {
			if (charmap[inputTextSymbolArray[i]]) {
				output.push(Tools.sampleOne(charmap[inputTextSymbolArray[i]]));
			} else {
				output.push(inputTextSymbolArray[i]);
			}
		}

		return output.join("");
	}

	makeSymbolArray(txt) {
		const a = [];
		let s;
		for (s of txt) {
			a.push(s);
		}
		return a;
	}
}

module.exports = new Homoglyph();
