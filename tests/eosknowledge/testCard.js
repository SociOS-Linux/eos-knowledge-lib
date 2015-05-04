const EosKnowledge = imports.gi.EosKnowledge;
const Gtk = imports.gi.Gtk;

Gtk.init(null);

const CssClassMatcher = imports.CssClassMatcher;

describe('Card widget', function () {
    let card;

    beforeEach(function () {
        jasmine.addMatchers(CssClassMatcher.customMatchers);

        card = new EosKnowledge.Card();
    });

    describe('Style class of card', function () {
        it('has card class', function () {
            expect(card).toHaveCssClass('card');
        });
        it('has a descendant with title class', function () {
            expect(card).toHaveDescendantWithCssClass('card-title');
        });
        it('has a descendant with synopsis class', function () {
            expect(card).toHaveDescendantWithCssClass('card-synopsis');
        });
        it('has a descendant with thumbnail class', function () {
            expect(card).toHaveDescendantWithCssClass('thumbnail');
        });
    });
});
