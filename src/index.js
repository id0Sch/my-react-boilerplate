import React from 'react'
import { render } from 'react-dom'

import injectTapEventPlugin from 'react-tap-event-plugin'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import App from './js/containers/App'

injectTapEventPlugin()

const muiTheme = getMuiTheme({
  appBar: {
    height: 45
  }
})

render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <App/>
  </MuiThemeProvider>
  ,
  document.getElementById('root')
)
