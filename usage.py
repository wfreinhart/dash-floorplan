import dash_floorplan
import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import pathlib
import os

cwd = pathlib.Path(__file__).parent.absolute()
print('image exists? ' + str(os.path.isfile('%s/dash-logo.png' % cwd)))
app = dash.Dash(__name__)

app.layout = html.Div([
    dash_floorplan.DashFloorPlan(
        id='input',
        value='my-value',
        label='my-label',
        width=1024,
        height=768,
        # data=[
        #     {"points": [{"x": 0.616, "y": 0.424}, {"x": 0.951, "y": 0.424}, {"x": 0.951, "y": 0.030}, {"x": 0.616, "y": 0.030}], "color": 0.4},
        #     {"points": [{"x": 0.042, "y": 0.424}, {"x": 0.350, "y": 0.424}, {"x": 0.350, "y": 0.030}, {"x": 0.042, "y": 0.030}], "color": 0.8},
        #     ],
        image='%s/dash-logo.png' % cwd,
    ),
    html.Div(id='output')
])

#todo: link the callback from react to the web page
@app.callback(Output('output', 'children'), [Input('input', 'data')])
def display_output(value):
    return 'Current polygons: %s' % str(value)


if __name__ == '__main__':
    app.run_server(debug=True)
