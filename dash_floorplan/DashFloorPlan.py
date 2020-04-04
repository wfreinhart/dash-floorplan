# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class DashFloorPlan(Component):
    """A DashFloorPlan component.


Keyword arguments:
- id (string; required): The ID used to identify this component in Dash callbacks.
- selection (boolean | number | string | dict | list; optional): Currently selected polygon.
- height (number; required): Height of the svg panel in pixels.
- width (number; required): Width of the svg panel in pixels.
- shapes (list; required): Array of polygons to display over image.
- data (dict; required): Dict of data to associated with the polygons.
- image (string; required): Path to image file."""
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, selection=Component.UNDEFINED, height=Component.REQUIRED, width=Component.REQUIRED, shapes=Component.REQUIRED, data=Component.REQUIRED, image=Component.REQUIRED, **kwargs):
        self._prop_names = ['id', 'selection', 'height', 'width', 'shapes', 'data', 'image']
        self._type = 'DashFloorPlan'
        self._namespace = 'dash_floorplan'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'selection', 'height', 'width', 'shapes', 'data', 'image']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id', 'height', 'width', 'shapes', 'data', 'image']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(DashFloorPlan, self).__init__(**args)
