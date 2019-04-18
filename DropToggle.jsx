import React, { Component} from 'react';

import './DropToggle.css';

class DropToggle extends Component {
    state = {
        iconClass: this.props.className?this.props.className:'drop-toggle-down'
    }
    handleClick = (fn) => {
        let {changeState} = this.props;
        changeState = changeState!==undefined?changeState:true;
        let iconClass = this.state.iconClass;
        if(changeState){
            iconClass === 'drop-toggle-down' ? iconClass = 'drop-toggle-up' : iconClass = 'drop-toggle-down';
            this.setState({iconClass: iconClass});
        }
        fn&&fn();
    }
    render() {
        const {iconColor,onToggleClick,toggleText,praTitleSpanColor} = this.props;
        const {iconClass} = this.state;
        return(
            <div className='toggle-module' onClick={this.handleClick.bind(this,onToggleClick)}>
              {toggleText&&<p style={{color:praTitleSpanColor}}>{toggleText}</p>}
              <div className={iconClass} style={{borderColor:iconColor,borderTopColor:praTitleSpanColor,borderBottomColor:praTitleSpanColor}}></div>
            </div>
        )

    }
}
export default DropToggle;