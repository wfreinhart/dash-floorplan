import dash_floorplan
import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import pathlib
import os

cwd = pathlib.Path(__file__).parent.absolute()
app = dash.Dash(__name__)

room_data = {
            'A': 0.3,
            'B': 0.4,
            'C': 0.5,
            'D': 0.6,
            'E': 0.7,
            'F': 0.8,
            'G': 0.9,
            'H': 1.0,
        }

shape_data = [
            {'name': 'A', 'points': [{'x': 0.6494140625, 'y': 0.9453125}, {'x': 0.98828125, 'y': 0.9479166666666666}, {'x': 0.9892578125, 'y': 0.5859375}, {'x': 0.65234375, 'y': 0.5885416666666666}]},
            {'name': None, 'points': [{'x': 0.009765625, 'y': 0.515625}, {'x': 0.3779296875, 'y': 0.5182291666666666}, {'x': 0.3818359375, 'y': 0.14713541666666666}, {'x': 0.010749999433755875, 'y': 0.14979166785875955}]},
            {'name': None, 'points': [{'x': 0.38671875, 'y': 0.14713541666666666}, {'x': 0.6455078125, 'y': 0.14453125}, {'x': 0.6455078125, 'y': 0.07291666666666667}, {'x': 0.9853515625, 'y': 0.08072916666666667}, {'x': 0.98828125, 'y': 0.5885416666666666}, {'x': 0.37890625, 'y': 0.5872395833333334}]},
            {'name': 'D', 'points': [{'x': 0.3779296875, 'y': 0.5885416666666666}, {'x': 0.642578125, 'y': 0.5911458333333334}, {'x': 0.6416015625, 'y': 0.9466145833333334}, {'x': 0.3837890625, 'y': 0.9427083333333334}]},
            {'name': 'E', 'points': [{'x': 0.0068359375, 'y': 0.9453125}, {'x': 0.189453125, 'y': 0.9453125}, {'x': 0.185546875, 'y': 0.76171875}, {'x': 0.2177734375, 'y': 0.7630208333333334}, {'x': 0.21484375, 'y': 0.5234375}, {'x': 0.009765625, 'y': 0.5234375}]},
            {'name': None, 'points': [{'x': 0.193359375, 'y': 0.7669270833333334}, {'x': 0.375, 'y': 0.7682291666666666}, {'x': 0.373046875, 'y': 0.94921875}, {'x': 0.1943359375, 'y': 0.9479166666666666}]},
            {'name': 'G', 'points': [{'x': 0.220703125, 'y': 0.5221354166666666}, {'x': 0.376953125, 'y': 0.5234375}, {'x': 0.37890625, 'y': 0.7604166666666666}, {'x': 0.2197265625, 'y': 0.7565104166666666}]},
            # {'name': 'H', 'points': [{'x': 0.12109375, 'y': 0.048177083333333336}, {'x': 0.2763671875, 'y': 0.046875}, {'x': 0.2734375, 'y': 0.14322916666666666}, {'x': 0.1220703125, 'y': 0.14453125}]}
        ]

urls = ['https://online.visual-paradigm.com/repository/images/e5728e49-09ce-4c95-b83c-482deee24386.png',
        'https://images.squarespace-cdn.com/content/v1/5283ecd9e4b01ee65ae9d2be/1555602434441-SAXE031PUQ04WPC8IIDI/ke17ZwdGBToddI8pDm48kNMIMLR5HyT8T-Jl3SGhJah7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0qf8NdpI93-hxF8MNE9FzPo_HfB-tFCGNagDiClHrC5aCYTMbo5wUeomy5kNGMSdfw/423-Elizabeth-Floorplan+%281%29.png?format=1500w',
        ]
image_url = urls[0]

app.layout = html.Div([
    html.Button('Force update', id='button', n_clicks=0),
    dash_floorplan.DashFloorPlan(
        id='input',
        width=1024,
        height=768,
        selection=None,
        update=False,
        shapes=shape_data,
        data=room_data,
        image=image_url,
    ),
    html.Div(id='output')
])


@app.callback(Output('output', 'children'), [Input('input', 'shapes')])
def display_output(value):
    return 'Current polygons: %s' % str(value)


@app.callback([Output('input', 'update'), Output('input', 'image')], [Input('button', 'n_clicks')])
def update_polygons(value):
    return True, urls[value % 2]


if __name__ == '__main__':
    app.run_server(debug=True)
