const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Endless = imports.gi.Endless;

let EosKnowledge;

let _oldSearchPath = imports.searchPath;
imports.searchPath.unshift(Endless.getCurrentFileDir());

const ArticleCard = imports.articleCard;
const Card = imports.card;
const LessonCard = imports.lessonCard;
const ListCard = imports.listCard;

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

    let modulesToImport = [ArticleCard, Card, LessonCard, ListCard];
    modulesToImport.forEach(function (module) {
        // Inject the EosKnowledge module into the module being imported, to
        // avoid recursive imports
        module._EosKnowledge = EosKnowledge;
        // Copy the module's public properties into the EosKnowledge module --
        // remember to make all toplevel non-public symbols private with _
        Lang.copyPublicProperties(module, EosKnowledge);
    });
}
