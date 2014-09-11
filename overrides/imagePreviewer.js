const Gdk = imports.gi.Gdk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Mainloop = imports.mainloop;

/**
 * Class: ImagePreviewer
 *
 * A private class used by the Previewer. Will display an image in a widget.
 * Unlike GtkImage this widget will size down its image to the available
 * space, which is where most of the complexity in this class comes from.
 */
const ImagePreviewer = Lang.Class({
    Name: 'ImagePreviewer',
    GTypeName: 'EknImagePreviewer',
    Extends: Gtk.Widget,
    Properties: {
        /**
         * Property: file
         *
         * Just like file on the Previewer widget it self. Sets the GFile to
         * be previewed.
         */
        'file': GObject.ParamSpec.object('file', 'File', 'File to preview',
            GObject.ParamFlags.READABLE | GObject.ParamFlags.WRITABLE | GObject.ParamFlags.CONSTRUCT,
            GObject.Object),
        /**
         * Property: aspect
         *
         * The aspect aspect the previewer widget should display at
         */
        'aspect': GObject.ParamSpec.float('aspect', 'Aspect',
            'Aspect ratio of previewer content',
            GObject.ParamFlags.READABLE,
            false)
    },

    _init: function (props) {
        props = props || {};
        props["app-paintable"] = true;
        this.parent(props);
        this.set_has_window(false);

        this._file = null;
        this._animation = null;
        this._animation_iter = null;
        this._animation_callback_source = 0;
        this._pixbuf = null;
        this._scaled_pixbuf = null;
        this._aspect = 1.0;
        this._natural_width = 0;
        this._natural_height = 0;
        this._min_percentage = 0.0;
        this._max_percentage = 1.0;

        let formats = GdkPixbuf.Pixbuf.get_formats();
        this._supported_types = formats.reduce(function(type_list, format) {
            return type_list.concat(format.get_mime_types());
        }, []);

        this.show_all();
    },

    /**
     * Method: supports_type
     *
     * True if the given mime type is supported by the image previewer.
     */
    supports_type: function (type) {
        return this._supported_types.indexOf(type) != -1;
    },

    set file (v) {
        if (v === this._file)
            return;
        this._file = v;
        if (this._file === null)
            return;

        this._animation = this._load_animation();
        if (this._animation !== null) {
            if (this._animation.is_static_image()) {
                this._pixbuf = this._animation.get_static_image();
            }
            this._natural_width = this._animation.get_width();
            this._natural_height = this._animation.get_height();
            this._aspect = this._natural_width / this._natural_height;
        }

        this.queue_draw();
        this.notify('file');
    },

    get file () {
        return this._file;
    },

    get aspect () {
        return this._aspect;
    },

    /**
     * Method: set_min_percentage
     *
     * Sets the minimum percentage of the natural image width the image
     * previewer should scale down to. A range from 0 to 1. Defaults to 0, or
     * allowing the image to size down to zero size.
     */
    set_min_percentage: function (min_percentage) {
        this._min_percentage = min_percentage;
    },

    /**
     * Method: set_max_percentage
     *
     * Sets the maximum percentage of the natural image width the image
     * previewer should scale down to. A range from 0 to 1. Defaults to 0, or
     * allowing the image to size down to zero size.
     */
    set_max_percentage: function (max_percentage) {
        this._max_percentage = max_percentage;
    },

    vfunc_get_request_mode: function () {
        return Gtk.SizeRequestMode.CONSTANT_SIZE;
    },

    vfunc_get_preferred_width: function () {
        return [this._min_percentage * this._natural_width, this._max_percentage * this._natural_width];
    },

    vfunc_get_preferred_height: function () {
        return [this._min_percentage * this._natural_height, this._max_percentage * this._natural_height];
    },

    _load_animation: function () {
        // GdkPixbuf.Pixbuf has not from_uri methods so we are stuck checking
        // the scheme ourselves
        let scheme = this._file.get_uri_scheme();
        if (scheme === "file") {
            return GdkPixbuf.PixbufAnimation.new_from_file(this._file.get_path());
        } else if (scheme === "resource") {
            let resource = this._file.get_uri().split("resource://")[1];
            return GdkPixbuf.PixbufAnimation.new_from_resource(resource);
        }
        return null;
    },

    _animation_timeout: function () {
        if (this._animation_iter === null) {
            this._animation_iter = this._animation.get_iter(null);
        } else {
            this._animation_iter.advance(null);
            this.queue_draw();
        }

        let delay_time = this._animation_iter.get_delay_time();
        if (delay_time > 0) {
            this._animation_callback_source = Mainloop.timeout_add(delay_time, this._animation_timeout.bind(this));
        } else {
            this._reset_animation_timeout();
        }
        return false;
    },

    _reset_animation_timeout: function () {
        this._animation_iter = null;
        this._animation_callback_source = 0;
    },

    _draw_scaled_pixbuf: function (cr) {
        if (this._pixbuf === null)
            return;
        let allocation = this.get_allocation();
        if (this._pixbuf !== this._last_pixbuf || allocation !== this._last_allocation) {
            this._last_pixbuf = this._pixbuf;
            this._last_allocation = allocation;
            let width = Math.min(allocation.width, this._max_percentage * this._natural_width);
            let height = Math.min(allocation.height, this._max_percentage * this._natural_height);
            this._scaled_pixbuf = this._pixbuf.scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR);
        }

        // Center the pixbuf in the allocation
        let x = (allocation.width - this._scaled_pixbuf.width) / 2;
        let y = (allocation.height - this._scaled_pixbuf.height) / 2;
        Gdk.cairo_set_source_pixbuf(cr, this._scaled_pixbuf, x, y);
        cr.paint();
    },

    vfunc_unmap: function () {
        if (this._animation_callback_source > 0)
            Mainloop.source_remove(this._animation_callback_source);
        this._reset_animation_timeout();
        this.parent();
    },

    vfunc_draw: function (cr) {
        if (this._animation !== null) {
            if (!this._animation.is_static_image()) {
                if (this._animation_callback_source === 0)
                    this._animation_timeout();
                this._pixbuf = this._animation_iter.get_pixbuf();
            }
            this._draw_scaled_pixbuf(cr);
        }
        // We need to manually call dispose on cairo contexts. This is somewhat related to the bug listed here
        // https://bugzilla.gnome.org/show_bug.cgi?id=685513 for the shell. We should see if they come up with
        // a better fix in the future, i.e. fix this through gjs.
        cr.$dispose();
        return true;
    }
});
