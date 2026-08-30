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
// Earliest year AffairsCloud's "Monthly CA" archive pages are assumed to
// cover. If a generated month has no page yet (too old, or the current
// month hasn't started), parseNovel below just returns an empty chapter
// list instead of throwing. Lower this if you find older months exist.
var START_YEAR = 2016;
var MONTHS_PER_PAGE = 12;
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
        this.version = '1.0.0';
        this.imageRequestInit = {
            headers: { Referer: this.site },
        };
    }
    // Full descending list of "Month Year" entries, from the current
    // month back to START_YEAR. Each one is treated as a "novel" whose
    // "chapters" are that month's individual daily (or weekend-combined)
    // current affairs posts.
    AffairsCloud.prototype.buildMonthList = function () {
        var now = new Date();
        var months = [];
        for (var year = now.getFullYear(); year >= START_YEAR; year--) {
            var maxMonth = year === now.getFullYear() ? now.getMonth() : 11;
            for (var m = maxMonth; m >= 0; m--) {
                months.push({
                    name: "Current Affairs \u2013 ".concat(MONTH_LABELS[m], " ").concat(year),
                    path: "current-affairs/current-affairs-".concat(MONTH_SLUGS[m], "-").concat(year, "/"),
                });
            }
        }
        return months;
    };
    AffairsCloud.prototype.popularNovels = function (pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var all, start;
            return __generator(this, function (_a) {
                all = this.buildMonthList();
                start = (pageNo - 1) * MONTHS_PER_PAGE;
                return [2 /*return*/, all.slice(start, start + MONTHS_PER_PAGE).map(function (m) { return ({
                        name: m.name,
                        path: m.path,
                        cover: defaultCover_1.defaultCover,
                    }); })];
            });
        });
    };
    AffairsCloud.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var monthMatch, label, novel, body, _a, $, targetMonthSlug, targetYear, DAILY_POST_RE, found, items;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        monthMatch = novelPath.match(/current-affairs-([a-z]+)-(\d{4})/i);
                        label = monthMatch
                            ? "Current Affairs \u2013 ".concat(monthMatch[1].charAt(0).toUpperCase()).concat(monthMatch[1].slice(1).toLowerCase(), " ").concat(monthMatch[2])
                            : 'Current Affairs';
                        novel = {
                            path: novelPath,
                            name: label,
                            cover: defaultCover_1.defaultCover,
                            summary: 'Daily current affairs digests from AffairsCloud for this month. Weekends and multi-day gaps are combined into a single post exactly as AffairsCloud publishes them, so each chapter is one reading day (or one combined weekend).',
                            chapters: [],
                        };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, fetch_1.fetchApi)(this.site + novelPath).then(function (r) { return r.text(); })];
                    case 2:
                        body = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        // Month page does not exist (too far in the future, or older than
                        // the site's archive). Return the novel with no chapters instead
                        // of throwing, so browsing the catalog doesn't break.
                        return [2 /*return*/, novel];
                    case 4:
                        $ = (0, cheerio_1.load)(body);
                        if (!monthMatch) {
                            novel.chapters = [];
                            return [2 /*return*/, novel];
                        }
                        targetMonthSlug = monthMatch[1].toLowerCase();
                        targetYear = monthMatch[2];
                        DAILY_POST_RE = /\/current-affairs-(\d+(?:-\d+)*)-([a-z]+)-(\d{4})\/?(?:[?#]|$)/i;
                        found = new Map();
                        $('a').each(function (_, el) {
                            var href = $(el).attr('href') || '';
                            var match = href.match(DAILY_POST_RE);
                            if (!match)
                                return;
                            var dayGroup = match[1], monthSlug = match[2], year = match[3];
                            if (monthSlug.toLowerCase() !== targetMonthSlug ||
                                year !== targetYear ||
                                !MONTH_SLUGS.includes(monthSlug.toLowerCase())) {
                                return;
                            }
                            // Normalize to an absolute-path key so http/https or trailing
                            // slash differences don't create duplicate chapters.
                            var path = href.replace(/^https?:\/\/[^/]+/i, '').replace(/\/?$/, '/');
                            if (found.has(path))
                                return;
                            found.set(path, {
                                days: dayGroup.split('-').map(function (d) { return parseInt(d, 10); }),
                                month: monthSlug.toLowerCase(),
                                year: year,
                            });
                        });
                        items = Array.from(found.entries()).map(function (_a) {
                            var path = _a[0], info = _a[1];
                            return ({
                                path: path,
                                days: info.days,
                                label: "".concat(formatDayList(info.days), " ").concat(MONTH_LABELS[MONTH_SLUGS.indexOf(info.month)], " ").concat(info.year),
                            });
                        });
                        // Oldest day first, like a normal novel's chapter order.
                        items.sort(function (a, b) { return a.days[0] - b.days[0]; });
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
    AffairsCloud.prototype.searchNovels = function (searchTerm, pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var term, yearMatch, monthMatch, matches, start;
            return __generator(this, function (_a) {
                term = searchTerm.toLowerCase();
                yearMatch = term.match(/\d{4}/);
                monthMatch = MONTH_SLUGS.find(function (m) { return term.includes(m); });
                if (!yearMatch && !monthMatch)
                    return [2 /*return*/, []];
                matches = this.buildMonthList().filter(function (m) {
                    var matchesYear = yearMatch ? m.path.includes(yearMatch[0]) : true;
                    var matchesMonth = monthMatch
                        ? m.path.includes("-".concat(monthMatch, "-"))
                        : true;
                    return matchesYear && matchesMonth;
                });
                start = (pageNo - 1) * MONTHS_PER_PAGE;
                return [2 /*return*/, matches.slice(start, start + MONTHS_PER_PAGE).map(function (m) { return ({
                        name: m.name,
                        path: m.path,
                        cover: defaultCover_1.defaultCover,
                    }); })];
            });
        });
    };
    return AffairsCloud;
}());
exports.default = new AffairsCloud();
                    
