import { _t } from "@web/core/l10n/translation";
import { Component, onMounted, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { renderToElement } from "@web/core/utils/render";
import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

// t-att-class="{'btn-primary': !addedInCart, 'btn-outline-primary': addedInCart}"
// t-att-class="{'is-invalid': inError}"
// t-on-click.prevent="onToggleSubscribeClick"
// t-on-click="onImageClick"
// t-att-class="{'btn-primary': !addedInCart, 'btn-outline-primary': addedInCart}"
// <t t-out="addedInCart ? _t('Added') : _t('Add To Cart')"/>
// _root: { "t-att-class": (el) => ({ "o_added": this.addedInCart, }),

class DemoInteraction extends Interaction {
    static selector = ".o_interaction";
    dynamicContent = {
        _root: {
            "t-att-class": (el) => ({ "o_added": this.addedInCart, }),
        },
        ".image-zoom": {
            "t-on-click.stop": this.onImageZoomClick,
        },
        "o_add_cart_btn": {
            "t-on-click.prevent": this.onAddToCartClick,
        },
        ".form-control": {
            "t-att-class": () => ({ "is-invalid": this.inError }),
        },
        "o_add_cart_btn": {
            "t-att-class": () => ({ "btn-primary": !this.addedInCart, "btn-outline-primary": this.addedInCart }),
            "t-out": () => this.addedInCart ? _t("Remove From Cart") : _t("Add To Cart"),
        },
    };

    setup() {
        this.addedInCart = false;
        this.inError = false;
    }

    _openImageZoom(imageSrc) {
        // Logic to display the zoomed image
        this.env.services.dialog.add(ZoomImageDialog, {
            imageSrc: imageSrc,
        });
    }

    onAddToCartClick(ev) {
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
    }

    onImageZoomClick(ev) {
        this._openImageZoom(ev.currentTarget.getAttribute('src'));
    }
}

registry
    .category("public.interactions")
    .add("interaction_demo.demo_interaction", DemoInteraction);


class SidebarCartComponent extends Component {
    static template = "interaction_demo.cart_details";

    setup() {
        super.setup();
        this.cartItems = useState([]);
        onMounted(() => {
            Component.env.bus.addEventListener('cart_updated', this._onCartUpdated.bind(this));
        });
    }

    _onCartUpdated(ev) {
        this.cartItems.push({id: 1, name: "Product 1", quantity: 1});
        this.env.bus.trigger('item_added', {item: {'id': 1, 'name': 'Product 1', 'quantity': 1}});
    }
}

class InteractionPage extends Interaction {
    static selector = ".o_interaction_page";
    dynamicContent = {
        _document: {
            "t-on-click": this.onDocumentClick,
        },
    }

    setup() {
        const sidebarCartEl = this.el.querySelector('.o_sidebar_cart');
        this.mountComponent(sidebarCartEl, SidebarCartComponent);
        this.env.bus.addEventListener('item_added', this._onItemAdded.bind(this));
    }

    onDocumentClick(ev) {
        const dialogEl = document.querySelector(".o-main-components-container .modal-dialog");
        if (dialogEl && !dialogEl.contains(ev.target)) {
            this.call('dialog', 'closeAll');
        }
    }

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
}

registry
    .category("public.interactions")
    .add("interaction_demo.interaction_page", InteractionPage);

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