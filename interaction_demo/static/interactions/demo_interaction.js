

// t-att-class="{'btn-primary': !addedInCart, 'btn-outline-primary': addedInCart}"
// t-att-class="{'is-invalid': inError}"
// t-on-click.prevent="onToggleSubscribeClick"
// t-on-click="onImageClick"
// t-att-class="{'btn-primary': !addedInCart, 'btn-outline-primary': addedInCart}"
// <t t-out="addedInCart ? _t('Added') : _t('Add To Cart')"/>
// _root: { "t-att-class": (el) => ({ "o_added": this.addedInCart, }),

class Test extends Interaction {
    static selector = ".test";
    dynamicContent = {
        _root: { "t-on-click": () => clicked++ },
    };
}