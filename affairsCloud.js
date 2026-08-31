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
// InsightsIAS's "Insights into Editorials" page is a single hand-
// maintained archive: a heading per month ("August EDITORIALS – 2026")
// followed by a <ul> of that month's posts, repeating back through
// years. Each post is InsightsIAS's own original write-up analysing a
// current issue (structured intro / findings / multi-dimensional
// analysis / way forward / practice question) -- not a reproduction of
// any newspaper's editorial -- built from public reporting on the
// underlying event, in InsightsIAS's own words and structure.
var LISTING_URL = 'https://www.insightsonindia.com/editorials/';
// The site runs WordPress's stock "Twenty Seventeen" theme (visible in
// its own asset paths), whose article body is reliably wrapped in
// `.entry-content` -- unlike a customized theme, this is standard,
// well-documented WordPress markup, not a guess.
var CONTENT_SELECTOR = '.entry-content';
var MONTHS_PER_PAGE = 12;
var MONTH_PATTERN = /(January|February|March|April|May|June|July|August|September|October|November|December)\D{0,15}(\d{4})/i;
var InsightsIASEditorials = /** @class */ (function () {
    function InsightsIASEditorials() {
        this.id = 'insightsias-editorials';
        this.name = 'InsightsIAS Editorial Analysis';
        this.icon = 'src/en/insightsiaseditorials/icon.png';
        this.site = 'https://www.insightsonindia.com/';
        this.version = '1.2.0';
    }
    InsightsIASEditorials.prototype.fetchMonthGroups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body, $, content, groups, current;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, fetch_1.fetchApi)(LISTING_URL).then(function (r) { return r.text(); })];
                    case 1:
                        body = _a.sent();
                        $ = (0, cheerio_1.load)(body);
                        content = $(CONTENT_SELECTOR);
                        if (content.length === 0)
                            content = $('article');
                        groups = [];
                        current = null;
                        // Walk headings and lists in DOCUMENT ORDER via .find(), not
                        // .children(). The page's month heading + list pairs aren't
                        // guaranteed to be direct children of the content container (e.g.
                        // a block editor can wrap each pair in its own <div>), and .find()
                        // still returns matches in reading order regardless of how deep
                        // they're nested, so this works either way.
                        content.find('h1, h2, h3, h4, h5, h6, ul').each(function (_, el) {
                            var _a;
                            var $el = $(el);
                            var tag = ((_a = el.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                            if (/^h[1-6]$/.test(tag)) {
                                var text = $el.text().trim();
                                var match = text.match(MONTH_PATTERN);
                                if (match) {
                                    var monthName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
                                    var year = match[2];
                                    current = {
                                        label: "".concat(monthName, " ").concat(year),
                                        slug: "".concat(monthName.toLowerCase(), "-").concat(year),
                                        items: [],
                                    };
                                    groups.push(current);
                                }
                                return;
                            }
                            // tag === 'ul'. Skip a <ul> nested inside another <ul> we've
                            // already processed (its <a> tags would otherwise be double
                            // counted once by the outer list and again here).
                            if (current && $el.parents('ul').length === 0) {
                                $el.find('a[href]').each(function (_, a) {
                                    var href = $(a).attr('href') || '';
                                    var name = $(a).text().trim();
                                    if (!href || !name)
                                        return;
                                    current.items.push({
                                        name: name,
                                        path: href.replace(_this.site, ''),
                                    });
                                });
                            }
                        });
                        return [2 /*return*/, groups];
                }
            });
        });
    };
    InsightsIASEditorials.prototype.popularNovels = function (pageNo) {
        return __awaiter(this, void 0, void 0, function () {
            var groups, start;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchMonthGroups()];
                    case 1:
                        groups = _a.sent();
                        start = (pageNo - 1) * MONTHS_PER_PAGE;
                        return [2 /*return*/, groups.slice(start, start + MONTHS_PER_PAGE).map(function (g) { return ({
                                name: "Editorial Analysis \u2013 ".concat(g.label),
                                path: g.slug,
                                cover: defaultCover_1.defaultCover,
                            }); })];
                }
            });
        });
    };
    InsightsIASEditorials.prototype.parseNovel = function (novelPath) {
        return __awaiter(this, void 0, void 0, function () {
            var groups, group, novel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchMonthGroups()];
                    case 1:
                        groups = _a.sent();
                        group = groups.find(function (g) { return g.slug === novelPath; });
                        novel = {
                            path: novelPath,
                            name: group
                                ? "Editorial Analysis \u2013 ".concat(group.label)
                                : 'Editorial Analysis',
                            cover: defaultCover_1.defaultCover,
                            summary: "InsightsIAS's own original UPSC-focused analysis of major issues in the news that month -- structured background, findings, multi-dimensional analysis, and a practice question -- not a reproduction of any newspaper's editorial.",
                            chapters: ((group === null || group === void 0 ? void 0 : group.items) || []).map(function (item) { return ({
                                name: item.name,
                                path: item.path,
                            }); }),
                        };
                        // Listing order is newest-first within the month; reverse for
                        // chronological reading order.
                        novel.chapters.reverse();
                        return [2 /*return*/, novel];
                }
            });
        });
    };
    InsightsIASEditorials.prototype.parseChapter = function (chapterPath) {
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
                            container = $('article');
                        // Drop images and every link, text included. NOTE: unlike
                        // AffairsCloud's bulletin-style posts, InsightsIAS's editorials
                        // are prose analysis and are somewhat more likely to have a
                        // meaningful inline link (e.g. to a source or a related
                        // InsightsIAS post) inside a real paragraph, so this is a slightly
                        // blunter tool here than on the other plugins. If you notice a
                        // chapter missing something that reads like it belonged, this
                        // blanket removal is the first place to loosen.
                        container.find('img').remove();
                        container.find('a').remove();
                        // Clean up anything left empty once its only content was a
                        // stripped link or image (this also removes the printfriendly
                        // "PDF & Email" widget, which was pure image/link chrome).
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
    InsightsIASEditorials.prototype.searchNovels = function (searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var term, groups;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        term = searchTerm.toLowerCase();
                        return [4 /*yield*/, this.fetchMonthGroups()];
                    case 1:
                        groups = _a.sent();
                        return [2 /*return*/, groups
                                .filter(function (g) { return g.label.toLowerCase().includes(term); })
                                .map(function (g) { return ({
                                name: "Editorial Analysis \u2013 ".concat(g.label),
                                path: g.slug,
                                cover: defaultCover_1.defaultCover,
                            }); })];
                }
            });
        });
    };
    return InsightsIASEditorials;
}());
exports.default = new InsightsIASEditorials();
