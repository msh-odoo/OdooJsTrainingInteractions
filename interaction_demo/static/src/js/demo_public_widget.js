import { _t } from "@web/core/l10n/translation";
import { Component } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import publicWidget from "@web/legacy/js/public/public_widget";
import { renderToElement } from "@web/core/utils/render";

publicWidget.registry.DemoPublicWidget = publicWidget.Widget.extend({
    selector: '.o_public_widget',

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

    _openImageZoom: function (imageSrc) {
        // Logic to display the zoomed image
        this.call('dialog', 'add', ZoomImageDialog, {
            imageSrc: imageSrc,
        });
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
        this.el.classList.toggle('o_added', this.addedInCart);
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
            Component.env.bus.trigger('cart_updated', {item: {'id': 1, 'name': 'Product 1', 'quantity': 1}});
        }
        this._setupDynamicContent();
    },

    onImageZoomClick: function (ev) {
        this._openImageZoom(ev.currentTarget.getAttribute('src'));
    },
});

const SidebarCartWidget = publicWidget.Widget.extend({
    template: 'interaction_demo.cart_details',

    init: function (parent, action) {
        this._super(parent, action);
        this.cartItems = [];
    },
    start() {
        Component.env.bus.addEventListener('cart_updated', this._onCartUpdated.bind(this));
        return this._super(...arguments);
    },

    _updateUI() {
        // Update the UI with the cart items
        const cartContainer = this.el.querySelector('.o_cart_details');
        const cartDetails = renderToElement("interaction_demo.cart_details", {
            cartItems: this.cartItems,
        });
        cartContainer.innerHTML = cartDetails.innerHTML;
    },

    _onCartUpdated: function (ev) {
        this.cartItems.push({id: 1, name: "Product 1", quantity: 1});
        this.trigger_up('item_added', {item: {'id': 1, 'name': 'Product 1', 'quantity': 1}});
        this._updateUI();
    }
});

publicWidget.registry.PublicWidgetPage = publicWidget.Widget.extend({
    selector: '.o_public_widget_page',
    custom_events: {
        'item_added': '_onItemAdded',
    },

    init: function (parent, action) {
        this._super(parent, action);
        this.sidebarCart = new SidebarCartWidget(this);
    },
    start: function () {
        this._super.apply(this, arguments);
        this.sidebarCart.attachTo(this.el.querySelector('.o_sidebar_cart'));
        document.addEventListener('click', (ev) => {
            const dialogEl = document.querySelector(".o-main-components-container .modal-dialog");
            if (dialogEl && !dialogEl.contains(ev.target)) {
                this.call('dialog', 'closeAll');
            }
        });
    },

    /**
     * Display animation when item is added.
     *
     * @param {OdooEvent} ev 
     */
    _onItemAdded(ev) {
        // display item added animation here
        const animationEl = document.createElement('div');
        animationEl.className = 'item-added-animation';
        const imgEl = document.createElement("img");
        imgEl.setAttribute("src", "/interaction_demo/static/img/thumpsup.png");
        animationEl.appendChild(imgEl);
        document.body.appendChild(animationEl);

        setTimeout(() => {
            animationEl.classList.add('fade-out');
            animationEl.addEventListener('transitionend', () => {
                animationEl.remove();
            });
        }, 1000);
    }
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
