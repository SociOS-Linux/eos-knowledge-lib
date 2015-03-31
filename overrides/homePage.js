// Copyright 2014 Endless Mobile, Inc.

/* global private_imports */

const Endless = imports.gi.Endless;
const EosKnowledge = imports.gi.EosKnowledge;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

GObject.ParamFlags.READWRITE = GObject.ParamFlags.READABLE | GObject.ParamFlags.WRITABLE;

const ImagePreviewer = private_imports.imagePreviewer;

/**
 * Class: HomePage
 *
 * This represents the abstract class for the home page of the knowledge apps.
 * It has a title image URI and list of article cards to show.
 *
 * To work properly, subclasses will want to implement the 'pack_widgets'
 * and 'pack_cards' methods.
 */
const HomePage = new Lang.Class({
    Name: 'HomePage',
    GTypeName: 'EknHomePage',
    Extends: Gtk.Grid,
    Properties: {
        /**
         * Property: title-image-uri
         * A URI to the title image. Defaults to an empty string.
         */
        'title-image-uri': GObject.ParamSpec.string('title-image-uri', 'Page Title Image URI',
            'URI to the title image',
            GObject.ParamFlags.READWRITE, ''),
        /**
         * Property: search-box
         *
         * The <SearchBox> widget created by this widget. Read-only,
         * modify using the <SearchBox> API. Use to type search queries and to display the last
         * query searched.
         */
        'search-box': GObject.ParamSpec.object('search-box', 'Search Box',
            'The Search box of this view widget',
            GObject.ParamFlags.READABLE,
            Endless.SearchBox),
        /**
         * Property: cards
         * A list of Card objects representing the cards to be displayed on this page.
         * It is set as a normal javascript object since GJS does not support setting
         * objects using ParamSpec.
         */
    },

    Signals: {
        /**
         * Event: article-selected
         *
         * This event is triggered when an article is selected from the autocomplete menu.
         */
        'article-selected': {
            param_types: [GObject.TYPE_STRING]
        },
        /**
         * Event: search-entered
         * This event is triggered when the search box is activated. The parameter
         * is the search query.
         */
        'search-entered': {
            param_types: [GObject.TYPE_STRING]
        },

        /**
         * Event: search-text-changed
         * This event is triggered when the text in the search box is changed. The parameter
         * is the search box.
         */
        'search-text-changed': {
            param_types: [GObject.TYPE_OBJECT]
        },
        /**
         * Event: show-categories
         * This event is triggered when the categories button is clicked.
         */
        'show-categories': {}
    },

    _init: function (props) {
        props = props || {};
        this._title_image = new ImagePreviewer.ImagePreviewer();
        this._title_image.set_min_percentage(0.4);
        this._title_image.set_max_percentage(0.7);

        this._cards = null;
        this._title_image_uri = null;

        // Not using a SearchEntry since that comes with
        // the 'x' as secondary icon, which we don't want
        this._search_box = new Endless.SearchBox();

        this._search_box.connect('text-changed', Lang.bind(this, function (search_entry) {
            this.emit('search-text-changed', search_entry);
        }));

        this._search_box.connect('activate', Lang.bind(this, function (search_entry) {
            this.emit('search-entered', search_entry.text);
        }));

        this._search_box.connect('menu-item-selected', Lang.bind(this, function (search_entry, article_id) {
            this.emit('article-selected', article_id);
        }));

        this.parent(props);

        this.get_style_context().add_class(EosKnowledge.STYLE_CLASS_HOME_PAGE);
        this._title_image.get_style_context().add_class(EosKnowledge.STYLE_CLASS_HOME_PAGE_TITLE_IMAGE);
        this._search_box.get_style_context().add_class(EosKnowledge.STYLE_CLASS_SEARCH_BOX);

        this.pack_widgets(this._title_image, this._search_box);
        this.show_all();
    },

    /**
     * Method: pack_widgets
     *
     * A virtual function to be overridden in subclasses. _init will set up
     * two widgets: title_image and seach_box, and then call into this virtual
     * function.
     *
     * The title_image is a GtkImage, and the search_box is a GtkEntry all
     * connectified for homePage search signals. They can be packed into this
     * widget along with any other widgetry for the subclass in this function.
     */
    pack_widgets: function (title_image, search_box) {
        this.attach(title_image, 0, 0, 3, 1);
        this.attach(search_box, 0, 1, 3, 1);
    },

    /**
     * Method: pack_cards
     *
     * A virtual function to be overridden in subclasses. This will be called,
     * whenever the card list changes with a new list of cards to be packed in
     * the widget
     */
    pack_cards: function (cards) {
        // no-op
    },

    set title_image_uri (v) {
        if (this._title_image_uri === v) return;

        this._title_image.file = Gio.File.new_for_uri(v);

        // only actually set the image URI if we successfully set the image
        this._title_image_uri = v;
        this.notify('title-image-uri');
    },

    get title_image_uri () {
        if (this._title_image_uri)
            return this._title_image_uri;
        return '';
    },

    set cards (v) {
        if (this._cards === v)
            return;
        this._cards = v;
        if (this._cards === null) {
            this.pack_cards([]);
        } else {
            this.pack_cards(this._cards);
        }
    },

    get cards () {
        return this._cards;
    },

    get search_box () {
        return this._search_box;
    },

    _on_search_entered: function (widget) {
        this.emit('search-entered', widget.text);
    },
});
