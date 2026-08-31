"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio_1 = require("cheerio");
var fetch_1 = require("@libs/fetch");
var defaultCover_1 = require("@libs/defaultCover");
// PIB's "All Releases" listing (allRel.aspx) only ever server-renders
// TODAY's releases; its ministry/date filters are client-side postback
// and don't respond to plain GET requests, so there is no reliable way
// to deep-link an older date or month here (unlike AffairsCloud). This
// plugin is therefore a single rolling "novel" of the latest releases,
// refreshed every time it's opened, rather than a browsable archive.
var LISTING_URL = 'https://www.pib.gov.in/allRel.aspx';
// Every PIB page has a `#pageContent` landmark (see the sitewide
// "Skip to Content" link), so scoping to it keeps us inside the
// actual article and out of the header/footer/mega-menu entirely.
var CONTENT_SELECTOR = '#pageContent';
// The release body is duplicated a second time inside a <table>
// (used for the page's built-in "share by email" feature) and is
// followed by share-button links and a footer line. These are
// matched by their own fixed, distinctive text and removed.
var JUNK_PHRASES = [
    'Share on facebook',
    'Share on twitter',
    'Share on whatsapp',
    'Share on email',
    'Share on linkedin',
    'Read this release in',
    'Visitor Counter',
];
var PIBIndia = /** @class */ (function () {
    function PIBIndia() {
        this.id = 'pib-india';
        this.name = 'PIB India (Press Releases)';
        this.icon = 'src/en/pibindia/icon.png';
        this.site = 'https://www.pib.gov.in/';
        this.version = '1.1.0';
    }
    PIBIndia.prototype.popularNovels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [
                        {
                            name: 'PIB Press Releases \u2013 Latest',
                            path: 'latest',
                            cover: defaultCover_1.defaultCover,
                        },
                    ]];
            });
        });
    };
    PIBIndia.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var novel, body, $, items, seen;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        novel = {
                            path: novelPath,
                            name: 'PIB Press Releases \u2013 Latest',
                            cover: defaultCover_1.defaultCover,
                            summary: 'Official Government of India press releases from the Press Information Bureau, refreshed each time this list is opened. PIB does not expose an easy static archive by date, so this is a rolling feed of the latest releases rather than a fixed monthly catalog.',
                            chapters: [],
                        };
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(LISTING_URL).then(function (r) { return r.text(); })];
                    case 1:
                        body = _a.sent();
                        $ = (0, cheerio_1.load)(body);
                        items = [];
                        seen = new Set();
                        $('a[href*="PRID="]').each(function (_, el) {
                            var _a;
                            var href = $(el).attr('href') || '';
                            var match = href.match(/PRID=(\d+)/);
                            if (!match)
                                return;
                            var prid = parseInt(match[1], 10);
                            if (seen.has(prid))
                                return;
                            var name = $(el).text().trim() || ((_a = $(el).attr('title')) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                            if (!name)
                                return;
                            seen.add(prid);
                            items.push({ prid: prid, name: name });
                        });
                        // Higher PRID numbers were published more recently; ascending
                        // order reads oldest-to-newest like a normal novel.
                        items.sort(function (a, b) { return a.prid - b.prid; });
                        novel.chapters = items.map(function (item) { return ({
                            name: item.name,
                            path: "PressReleasePage.aspx?PRID=".concat(item.prid),
                        }); });
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    PIBIndia.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var url, body, $, container;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = chapterPath.startsWith('http')
                            ? chapterPath
                            : this.site + chapterPath;
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url).then(function (r) { return r.text(); })];
                    case 1:
                        body = _a.sent();
                        $ = (0, cheerio_1.load)(body);
                        container = $(CONTENT_SELECTOR);
                        if (container.length === 0)
                            container = $('body');
                        // Kills the duplicated "email share" copy of the whole release.
                        container.find('table').remove();
                        // Fixed chrome text (share buttons, language switcher, visitor
                        // counter) matched on leaf-ish elements only, so we never risk
                        // deleting a wrapper that also holds real article paragraphs.
                        container.find('p, li').each(function (_, el) {
                            var text = $(el).text();
                            if (JUNK_PHRASES.some(function (phrase) { return text.includes(phrase); })) {
                                $(el).remove();
                            }
                        });
                        // Drop images and every remaining link (text included). PIB
                        // releases don't embed meaningful inline links in the actual
                        // release text; what's left after the removals above is share
                        // icons, the language-switcher links, and similar navigation.
                        container.find('img').remove();
                        container.find('a').remove();
                        // Clean up anything left empty once its only content was a
                        // stripped link or image.
                        container.find('p, li').each(function (_, el) {
                            if ($(el).text().trim() === '' && $(el).find('img').length === 0) {
                                $(el).remove();
                            }
                        });
                        return [2 /*return*/, container.html() || ''];
                }
            });
        });
    };
    PIBIndia.prototype.searchNovels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // PIB isn't meaningfully searchable through a static endpoint;
                // the one "novel" always shows up via popularNovels instead.
                return [2 /*return*/, []];
            });
        });
    };
    return PIBIndia;
}());
exports.default = new PIBIndia();
