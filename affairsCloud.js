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
var MONTH_SLUGS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];
var MONTH_LABELS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
// AffairsCloud's month-by-month archive pages (current-affairs-<month>-
// <year>/) stopped being kept up to date at some point in 2025, so this
// plugin no longer relies on them. Instead it reads the site's own
// rolling "Current Affairs Today" hub, which is still maintained, and
// treats the whole thing as a single "novel" whose chapters are the
// most recent daily (or weekend-combined) posts \u2013 refreshed every
// time the novel is opened, the same way the PIB plugin works.
var HUB_URL = 'https://affairscloud.com/current-affairs-ca/current-affairs-today/';
// How many hub pages to pull chapters from. The hub lists roughly 15-20
// posts per page, so 3 pages covers a couple of months of history,
// which is plenty for a "latest" feed people re-open regularly. Raise
// this if you want more back-history on first install.
var HUB_PAGES_TO_FETCH = 3;
// Matches AffairsCloud's daily-post URLs and captures the day number(s),
// month name, and year straight out of the URL itself \u2013 e.g.
// "/current-affairs-23-24-august-2026/" \u2192 days=[23,24], month=august,
// year=2026. Building the chapter label this way means it doesn't matter
// what HTML structure (table, div, list...) the listing page uses; only
// the URLs on the page need to be there, which is far more stable than
// any particular row/column layout.
var DAILY_POST_RE = /\/current-affairs-(\d+(?:-\d+)*)-([a-z]+)-(\d{4})\/?(?:[?#]|$)/i;
// Fixed marketing / subscription / recap boilerplate that AffairsCloud
// repeats at the top and bottom of every single daily post. Matched
// against the OWN text of <table>, <p> and <li> elements only (never
// <div>) so we never accidentally delete a wrapper that also contains
// the real news paragraphs.
var JUNK_PHRASES = [
    'We are here for you to provide',
    'Dear Aspirants',
    'Read Current Affairs in',
    'We are Hiring',
    'Click here for Current Affairs',
    'Click here for Affairscloud Hindu',
    'CareersCloud Content Sharing',
    'AffairsCloud Recommends Oliveboard Mock Test',
    'AffairsCloud Ebook - Support Us to Grow',
    'Govt Jobs by Category',
    'Bank Jobs Notification',
    'Kindly Share the General Awareness questions',
    'all Current Affairs Hindi Content',
    'Aspirant:',
    'Current Affairs Today (AffairsCloud Today)',
];
// Turns [23, 24] into "23 & 24", [15, 16, 17] into "15, 16 & 17",
// and [22] into "22", matching how AffairsCloud names combined-day
// (usually weekend) posts.
function formatDayList(days) {
    if (days.length === 1)
        return String(days[0]);
    var strs = days.map(String);
    return "".concat(strs.slice(0, -1).join(', '), " & ").concat(strs[strs.length - 1]);
}
var AffairsCloud = /** @class */ (function () {
    function AffairsCloud() {
        this.id = 'affairscloud';
        this.name = 'AffairsCloud Current Affairs';
        this.icon = 'src/en/affairscloud/icon.png';
        this.site = 'https://affairscloud.com/';
        this.version = '2.0.0';
        this.imageRequestInit = {
            headers: { Referer: this.site },
        };
    }
    AffairsCloud.prototype.popularNovels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [
                        {
                            name: 'AffairsCloud Current Affairs \u2013 Latest',
                            path: 'latest',
                            cover: defaultCover_1.defaultCover,
                        },
                    ]];
            });
        });
    };
    AffairsCloud.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var novel, found, _loop_1, page, state_1, items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        novel = {
                            path: novelPath,
                            name: 'AffairsCloud Current Affairs \u2013 Latest',
                            cover: defaultCover_1.defaultCover,
                            summary: 'Daily current affairs digests from AffairsCloud, refreshed each time this list is opened. Weekends and multi-day gaps are combined into a single post exactly as AffairsCloud publishes them, so each chapter is one reading day (or one combined weekend).',
                            chapters: [],
                        };
                        found = new Map();
                        _loop_1 = function (page) {
                            var url, body, _b, $, matchesOnThisPage;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        url = page === 1 ? HUB_URL : "".concat(HUB_URL, "page/").concat(page, "/");
                                        body = void 0;
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, (0, fetch_1.fetchApi)(url).then(function (r) { return r.text(); })];
                                    case 2:
                                        body = _c.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _b = _c.sent();
                                        return [2 /*return*/, "break"];
                                    case 4:
                                        $ = (0, cheerio_1.load)(body);
                                        matchesOnThisPage = 0;
                                        $('a').each(function (_, el) {
                                            var href = $(el).attr('href') || '';
                                            var match = href.match(DAILY_POST_RE);
                                            if (!match)
                                                return;
                                            var dayGroup = match[1], monthSlug = match[2], year = match[3];
                                            if (!MONTH_SLUGS.includes(monthSlug.toLowerCase()))
                                                return;
                                            var path = href
                                                .replace(/^https?:\/\/[^/]+/i, '')
                                                .replace(/\/?$/, '/');
                                            if (!found.has(path)) {
                                                found.set(path, {
                                                    days: dayGroup.split('-').map(function (d) { return parseInt(d, 10); }),
                                                    month: monthSlug.toLowerCase(),
                                                    year: year,
                                                });
                                            }
                                            matchesOnThisPage++;
                                        });
                                        // Hub page had no daily-post links at all \u2013 we've likely
                                        // paginated past the end of the listing, so stop early.
                                        if (matchesOnThisPage === 0)
                                            return [2 /*return*/, "break"];
                                        return [2 /*return*/];
                                }
                            });
                        };
                        page = 1;
                        _a.label = 1;
                    case 1:
                        if (!(page <= HUB_PAGES_TO_FETCH)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(page)];
                    case 2:
                        state_1 = _a.sent();
                        if (state_1 === "break")
                            return [3 /*break*/, 4];
                        _a.label = 3;
                    case 3:
                        page++;
                        return [3 /*break*/, 1];
                    case 4:
                        items = Array.from(found.entries()).map(function (_a) {
                            var path = _a[0], info = _a[1];
                            return ({
                                path: path,
                                sortKey: parseInt(info.year, 10) * 10000 +
                                    MONTH_SLUGS.indexOf(info.month) * 100 +
                                    info.days[0],
                                label: "".concat(formatDayList(info.days), " ").concat(MONTH_LABELS[MONTH_SLUGS.indexOf(info.month)], " ").concat(info.year),
                            });
                        });
                        // Oldest first, like a normal novel's chapter order.
                        items.sort(function (a, b) { return a.sortKey - b.sortKey; });
                        novel.chapters = items.map(function (item) { return ({
                            name: "Current Affairs ".concat(item.label),
                            path: item.path.replace(/^\//, ''),
                        }); });
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    AffairsCloud.prototype.parseChapter = function (chapterPath) {
        return __awaiter(this, void 0, void 0, function () {
            var body, $, container;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(this.site + chapterPath).then(function (r) { return r.text(); })];
                    case 1:
                        body = _a.sent();
                        $ = (0, cheerio_1.load)(body);
                        container = $('.td-post-content');
                        if (container.length === 0)
                            container = $('article .entry-content');
                        if (container.length === 0)
                            container = $('article');
                        container.find('table, p, li').each(function (_, el) {
                            var text = $(el).text();
                            if (JUNK_PHRASES.some(function (phrase) { return text.includes(phrase); })) {
                                $(el).remove();
                            }
                        });
                        return [2 /*return*/, container.html() || ''];
                }
            });
        });
    };
    AffairsCloud.prototype.searchNovels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // There's only one "novel" now (the rolling latest-posts feed), so
                // there's nothing meaningful to search against.
                return [2 /*return*/, []];
            });
        });
    };
    return AffairsCloud;
}());
exports.default = new AffairsCloud();
                
