import React from 'react'
import './App.css'
import Breakout from './Breakout'

class App extends React.Component {
  id = 'breakout-react'
  baseWidth = 480
  baseHeight = 270
  scale = 1

  componentDidMount() {
    Breakout({ id: this.id, speed: 5, level: 1, scale: this.scale })
  }

  render() {
    const style = {
      background: 'linear-gradient(177deg, #eee, #ddd 75%, #ccc)',
      display: 'block',
      margin: '0 auto',
      width: `${this.scale * this.baseWidth}px`,
      height: `${this.scale * this.baseHeight}px`,
    }

    return (
      <div className="App">
        <canvas
          id={this.id}
          width={`${this.scale * this.baseWidth * 2}`}
          height={`${this.scale * this.baseHeight * 2}`}
          style={style}
        />
      </div>
    )
  }
}

export default App
