/* eslint no-magic-numbers: 0 */
import React, {Component} from 'react';
import { DashFloorPlan } from '../lib';

class App extends Component {

    constructor() {
        super();
        this.state = {
            value: '',
            data: [],
        };
        this.setProps = this.setProps.bind(this);
    }

    setProps(newProps) {
        this.setState(newProps);
    }

    render() {
        return (
            <div>
                <DashFloorPlan
                    setProps={this.setProps}
                    {...this.state}
                />
            </div>
        )
    }
}

export default App;
