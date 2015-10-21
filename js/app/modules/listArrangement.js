// Copyright 2015 Endless Mobile, Inc.

/* exported ListArrangement */

const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Arrangement = imports.app.interfaces.arrangement;
const InfiniteScrolledWindow = imports.app.widgets.infiniteScrolledWindow;
const Module = imports.app.interfaces.module;

const ListArrangement = new Lang.Class({
    Name: 'ListArrangement',
    GTypeName: 'EknListArrangement',
    Extends: InfiniteScrolledWindow.InfiniteScrolledWindow,
    Implements: [ Module.Module, Arrangement.Arrangement ],

    Properties: {
        'factory': GObject.ParamSpec.override('factory', Module.Module),
        'factory-name': GObject.ParamSpec.override('factory-name', Module.Module),
    },

    Template: 'resource:///com/endlessm/knowledge/data/widgets/listArrangement.ui',
    InternalChildren: [ 'list_box' ],

    _init: function (props={}) {
        this.parent(props);
    },

    add_card: function (widget) {
        this._list_box.add(widget);
    },

    get_cards: function () {
        return this._list_box.get_children().map((list_child) => list_child.get_child());
    },

    clear: function () {
        let children = this._list_box.get_children();
        children.forEach((child) => this._list_box.remove(child));
    },
});
