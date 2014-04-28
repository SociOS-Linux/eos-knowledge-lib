const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Endless = imports.gi.Endless;

let EosKnowledge;

let _oldSearchPath = imports.searchPath;
imports.searchPath.unshift(Endless.getCurrentFileDir());

const ArticleCard = imports.articleCard;
const Card = imports.card;
const ContentObjectModel = imports.contentObjectModel;
const HomePageA = imports.homePageA;
const LessonCard = imports.lessonCard;
const Lightbox = imports.lightbox;
const ListCard = imports.listCard;
const ProgressCard = imports.progressCard;
const TableOfContents = imports.tableOfContents;
const TreeNode = imports.treeNode;

imports.searchPath = _oldSearchPath;

function _init() {
    // "this" is imports.gi.EosKnowledge
    EosKnowledge = this;

    // Hackzors. We need to load the gresource from javascript before any C
    // calls are made (to load the CSS). By referencing one of our C functions
    // here we force the C lib to be initialized along with it its gresource
    this.hello_c;

    // More hackzors. Work around bug where GList-type properties aren't
    // converted properly into JS values.
    // https://bugzilla.gnome.org/show_bug.cgi?id=727787
    Object.defineProperties(EosKnowledge.HistoryModel.prototype, {
        'back-list': {
            get: EosKnowledge.HistoryModel.prototype.get_back_list
        },
        'forward-list': {
            get: EosKnowledge.HistoryModel.prototype.get_forward_list
        },
        // Once again with underscores, because that's the most used name to
        // access properties with
        'back_list': {
            get: EosKnowledge.HistoryModel.prototype.get_back_list
        },
        'forward_list': {
            get: EosKnowledge.HistoryModel.prototype.get_forward_list
        },
        // Once again in camelCaps, because GJS supports that notation too for
        // properties
        'backList': {
            get: EosKnowledge.HistoryModel.prototype.get_back_list
        },
        'forwardList': {
            get: EosKnowledge.HistoryModel.prototype.get_forward_list
        }
    });

    EosKnowledge.ArticleCard = ArticleCard.ArticleCard;
    EosKnowledge.Card = Card.Card;
    EosKnowledge.ContentObjectModel = ContentObjectModel.ContentObjectModel;
    EosKnowledge.HomePageA = HomePageA.HomePageA;
    EosKnowledge.LessonCard = LessonCard.LessonCard;
    EosKnowledge.Lightbox = Lightbox.Lightbox;
    EosKnowledge.ListCard = ListCard.ListCard;
    EosKnowledge.ProgressCard = ProgressCard.ProgressCard;
    EosKnowledge.TableOfContents = TableOfContents.TableOfContents;
    EosKnowledge.tree_model_from_tree_node = TreeNode.tree_model_from_tree_node;
}
