import { _t } from "@web/core/l10n/translation";
import { Component, onMounted, useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { renderToElement } from "@web/core/utils/render";
import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

// Note: I don't have good example of waitFor here but benefit of using waiFor is it calls updateContent once promise is resolved, it wraps promise inside promise

class DemoInteraction extends Interaction {
    static selector = ".o_interaction";
    dynamicContent = {
        _root: {
            "t-att-class": (el) => ({ "o_added": this.addedInCart, }),
            "t-att-data-quantity": () => 1,
        },
        ".image-zoom": {
            "t-on-click.stop": this.onImageZoomClick,
        },
        ".o_add_cart_btn": {
            "t-on-click.prevent": this.onAddToCartClick,
            "t-att-class": () => ({ "btn-primary": !this.addedInCart, "btn-outline-primary": this.addedInCart }),
            "t-out": () => this.addedInCart ? _t("Remove From Cart") : _t("Add To Cart"),
        },
        ".form-control": {
            "t-att-class": () => ({ "is-invalid": this.inError }),
        },
        ".o_wishlist_btn": {
            "t-on-click.prevent": this.onWishlistClick,
            "t-att-class": () => ({ "wishlisted": this.isInWishlist }),
        },
    };

    setup() {
        this.addedInCart = false;
        this.inError = false;
        this.isInWishlist = false;
    }

    _openImageZoom(imageSrc) {
        // Logic to display the zoomed image
        this.env.services.dialog.add(ZoomImageDialog, {
            imageSrc: imageSrc,
        });
    }

    onAddToCartClick(ev) {
        const val = parseInt(this.el.querySelector('.o_quantity').value)
        this.inError = false;
        if (!val || val < 0) {
            this.inError = true;
        }
        if (!this.inError) {
            this.addedInCart = !this.addedInCart;
            this.env.bus.trigger('cart_updated', {item: {'id': parseInt(Math.random() * 100), 'name': 'Product 1', 'quantity': 1}});
        }
    }

    onWishlistClick(ev) {
        this.isInWishlist = !this.isInWishlist;
        this.env.bus.trigger('item_wishlisted', {wishlistItem: {'id': 1, 'name': 'Product 1', 'quantity': 1}});
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
            this.env.bus.addEventListener('cart_updated', this._onCartUpdated.bind(this));
        });
    }

    _onCartUpdated(ev) {
        this.cartItems.push(ev.detail.item);
        this.env.bus.trigger('item_added', {item: {'id': 1, 'name': 'Product 1', 'quantity': 1}});
    }
}

class InteractionPage extends Interaction {
    static selector = ".o_interaction_page";
    dynamicContent = {
        _document: {
            "t-on-click": this.onDocumentClick,
        },
        ".o_wishlist_no_items": {
            "t-att-class": () => ({ "d-none": this.wishlistHasItems }),
        },
        ".o_wishlist_items": {
            "t-att-class": () => ({ "d-none": !this.wishlistHasItems }),
        },
        ".o_remove_wishlist": {
            "t-on-click": this.onWishlistRemoveClick,
        },
    };

    onDocumentClick(ev) {
        const dialogEl = document.querySelector(".o-main-components-container .modal-dialog");
        if (dialogEl && !dialogEl.contains(ev.target)) {
            this.call('dialog', 'closeAll');
        }
    }

    setup() {
        this.wishlistHasItems = false;
        const sidebarCartEl = this.el.querySelector('.o_sidebar_cart');
        this.mountComponent(sidebarCartEl, SidebarCartComponent);
        this.env.bus.addEventListener('item_added', this._onItemAdded.bind(this));
        this.env.bus.addEventListener('item_wishlisted', this._onItemWishlisted.bind(this));
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

        this.waitForTimeout(() => {
            animationEl.classList.add('fade-out');
            animationEl.addEventListener('transitionend', () => {
                animationEl.remove();
            });
        }, 1000);
    }

    _onItemWishlisted(ev) {
        this.wishlistHasItems = true;
        const wishlistContainer = this.el.querySelector('.o_sidebar_wishlist');
        const wishlistDetails = renderToElement("interaction_demo.wishlist_items", {
            wishlistItem: ev.detail.wishlistItem,
        });
        // wishlistContainer.appendChild(wishlistDetails); // If we add through appendChild, delegated events will not work
        this.insert(wishlistDetails, this.el.querySelector(".o_wishlist_items"));
    }

    onWishlistRemoveClick(ev) {
        // Logic to remove item from wishlist
        ev.target.closest('li').remove();
        const wishlistContainer = this.el.querySelector('.o_sidebar_wishlist');
        if (!wishlistContainer.querySelectorAll("li").length) {
            this.wishlistHasItems = false;
        }
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