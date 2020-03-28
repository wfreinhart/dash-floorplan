# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class DashFloorPlan(Component):
    """A DashFloorPlan component.
ExampleComponent is an example component.
It takes a property, `label`, and
displays it.
It renders an input with the property `value`
which is editable by the user.

Keyword arguments:
- id (string; optional): The ID used to identify this component in Dash callbacks.
- height (number; required): Height of the svg panel in pixels.
- width (number; required): Width of the svg panel in pixels.
- data (list; optional): Array of polygons to display over image.
- image (string; required): Path to image file."""
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, height=Component.REQUIRED, width=Component.REQUIRED, data=Component.UNDEFINED, image=Component.REQUIRED, **kwargs):
        self._prop_names = ['id', 'height', 'width', 'data', 'image']
        self._type = 'DashFloorPlan'
        self._namespace = 'dash_floorplan'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'height', 'width', 'data', 'image']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['height', 'width', 'image']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(DashFloorPlan, self).__init__(**args)
