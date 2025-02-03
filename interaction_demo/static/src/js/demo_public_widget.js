import { _t } from "@web/core/l10n/translation";
import { Component } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.DemoPublicWidget = publicWidget.Widget.extend({
    selector: '.o_public_widget',
    // t-att-class="{'btn-primary': !addedInCart, 'btn-outline-primary': addedInCart}"
    // t-att-class="{'is-invalid': inError}"
    // t-on-click.prevent="onToggleSubscribeClick"
    // t-on-click="onImageClick"
    // t-att-class="{'btn-primary': !addedInCart, 'btn-outline-primary': addedInCart}"
    // <t t-out="addedInCart ? _t('Added') : _t('Add To Cart')"/>

    events: {
        'click .image-zoom': 'onImageZoomClick',
        'click .o_add_cart_btn': 'onAddToCartClick',
    },

    init: function (parent, action) {
        this._super(parent, action);
        this.addedInCart = false;
        this.inError = false;
    },

    start: function () {
        this._super.apply(this, arguments);
        this._setupDynamicContent();
    },

    _setupDynamicContent: function () {
        this.el.querySelectorAll('.form-control').forEach((el) => {
            el.classList.toggle("is-invalid", this.inError)
        });
        this.el.querySelectorAll('.o_add_cart_btn').forEach((btn) => {
            btn.classList.toggle('btn-primary', !this.addedInCart);
            btn.classList.toggle('btn-outline-primary', this.addedInCart);
            btn.textContent = this.addedInCart ? _t("Remove From Cart") : _t("Add To Cart");
        });
    },

    onAddToCartClick: function (ev) {
        ev.preventDefault();
        const val = parseInt(this.el.querySelector('.o_quantity').value)
        this.inError = false;
        if (!val || val < 0) {
            this.inError = true;
        }
        if (!this.inError) {
            this.addedInCart = !this.addedInCart;
        }
        this._setupDynamicContent();
    },

    onImageZoomClick: function (ev) {
        this._openImageZoom(ev.currentTarget.getAttribute('src'));
    },

    _openImageZoom: function (imageSrc) {
        // Logic to display the zoomed image
        this.call('dialog', 'add', ZoomImageDialog, {
            imageSrc: imageSrc,
        });
    },
});

publicWidget.registry.PublicWidgetPage = publicWidget.Widget.extend({
    selector: '.o_public_widget_page',

    start: function () {
        this._super.apply(this, arguments);
        document.addEventListener('click', (ev) => {
            const dialogEl = document.querySelector(".o-main-components-container .modal-dialog");
            if (dialogEl && !dialogEl.contains(ev.target)) {
                this.call('dialog', 'closeAll');
            }
        });
    },
});

export class ZoomImageDialog extends Component {
    static template = "interaction_demo.image_zoomer";
    static props = {
        close: Function,
        imageSrc: String,
    };
    static components = {
        Dialog,
    };
}

// Create public widget for o_wblog_author_avatar_date, when user clicks on image open zoom image, when user clicks outside we will close zoom popup
// Here Window/DOM/body click event is used to close the popup
// we will add some events on root element, i.e. when user clicks on image
// add some events inside root element using selector, like ".o_portal_invoice_print": { "t-on-click.prevent.withTarget": this.onInvoicePrintClick },
// We will add some attributes like t-att-class
// We will add t-out

// dynamicContent = {
//     _root: {
//         "t-att-class": () => ({ "o_has_error": this.inError }),
//     },
//     ".form-control, .form-select": {
//         "t-att-class": () => ({ "is-invalid": this.inError }),
//     },
//     ".o_mg_subscribe_btn": {
//         "t-on-click.prevent": this.onToggleSubscribeClick,
//         "t-att-class": () => ({
//             "btn-primary": !this.isMember,
//             "btn-outline-primary": this.isMember,
//         }),
//         "t-out": () => this.isMember ? _t("Unsubscribe") : _t("Subscribe"),
//     },
// };

// We will implement above thing with public widget first and then we will convert it with Interaction
