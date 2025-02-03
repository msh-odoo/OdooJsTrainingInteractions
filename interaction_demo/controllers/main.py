from odoo import http
from odoo.http import request

class MyOdooModuleController(http.Controller):

    @http.route('/public_widget', type='http', auth='public', website=True)
    def public_widget(self, **kwargs):
        return request.render('interaction_demo.public_widget_page', {})

    @http.route('/interaction', type='http', auth='public', website=True)
    def interaction(self, **kwargs):
        return request.render('interaction_demo.interaction_page', {})
