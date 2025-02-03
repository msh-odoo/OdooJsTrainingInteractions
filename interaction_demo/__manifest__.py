{
    "name": "My Odoo Module",
    "version": "1.0",
    "category": "Website",
    "summary": "A module that features a public widget with various events.",
    "description": "This module provides a website page with a public widget that includes dynamic content and user interaction events.",
    "author": "Your Name",
    "website": "http://www.yourwebsite.com",
    "depends": ["website"],
    "data": [
        "data/interaction_demo_data.xml",
        "views/interaction_templates.xml",
        # "views/interaction_views.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            "interaction_demo/static/src/xml/demo_public_widget.xml",
            "interaction_demo/static/src/js/demo_public_widget.js",
            "interaction_demo/static/src/scss/demo_public_widget.scss",
            "interaction_demo/static/src/interactions/demo_interaction.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False
}
