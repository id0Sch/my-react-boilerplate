import PropTypes from 'prop-types'
import React, { Component } from 'react'

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      message: 'Hello world!'
    }
  }

  render () {

    const {message} = this.state

    return (
      <div>
        <p>{message}</p>
      </div>
    )
  }
}

App.contextTypes = {
  muiTheme: PropTypes.object
}
export default App
