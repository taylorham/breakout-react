const pythagorize = (hyp, a = false) => {
  if (a) {
    return Math.sqrt(hyp ** 2 - a ** 2)
  } else {
    return Math.sqrt(hyp ** 2 / 2)
  }
}

const pickSome = (length, amount) => {
  const array = []
  while (--length) array.push(length)
  array.sort(() => {
    const rando = Math.random()
    return rando > 0.66 ? 1 : rando < 0.33 ? -1 : 0
  })

  return array.slice(0, amount - 1)
}

const Breakout = ({ id, speed = 3.5, level = 1, scale = 1 }) => {
  const canvas = document.getElementById(id)
  const context = canvas.getContext('2d')
  context.scale(2, 2)

  const SCALE = scale
  const WIDTH = canvas.width / 2
  const HEIGHT = canvas.height / 2
  const UNIT = (number = 1) => 0.021 / SCALE * WIDTH * number
  const SPEED = speed * UNIT(0.1)
  const MAX_SPEED = pythagorize(speed) * UNIT(0.1)

  const ballRadius = UNIT(1)
  const getInitialBalls = () => [
    { id: 0, x: WIDTH / 2, y: HEIGHT - UNIT(3), dx: MAX_SPEED, dy: -MAX_SPEED },
  ]
  let balls = getInitialBalls()

  const paddleHeight = UNIT(1)
  const getInitialPaddleWidth = () => UNIT(7.5)
  let paddleWidth = getInitialPaddleWidth()

  const getInitialPaddleX = () => (WIDTH - paddleWidth) / 2
  let paddleX = getInitialPaddleX()

  let rightPressed = false
  let leftPressed = false

  const brickPadding = UNIT(1)
  const brickHeight = UNIT(2)
  const brickOffsetTop = UNIT(3)
  const brickOffsetLeft = UNIT(3)
  const brickRowCount = 3 * SCALE
  const brickColumnCount = 5 * SCALE
  let levelColumns = brickColumnCount + (level - 1)
  let levelRows = brickRowCount + (level - 1)

  const getBrickWidth = () => (WIDTH - UNIT(6) - brickPadding * (levelColumns - 1)) / levelColumns
  let brickWidth = getBrickWidth()

  let bricks = []
  let specials = []

  let score = 0
  let lives = 3

  let paused = false

  const generateBrickArray = () => {
    levelColumns = brickColumnCount + (level - 1)
    levelRows = brickRowCount + (level - 1)
    bricks = []
    brickWidth = getBrickWidth()
    const totalBricks = levelColumns * levelRows
    const halfBricks = pickSome(totalBricks, Math.round(totalBricks / 2))
    let rando = Math.random()

    const numberOfSpecials = (rando > 0.66 ? 3 : rando > 0.33 ? 2 : 1) * SCALE + level - 1
    const specialBricks = []
    const doubleBricks = []

    const selectSpecials = () => {
      specialBricks.push(...halfBricks.slice(0, numberOfSpecials))
      doubleBricks.push(...halfBricks.slice(numberOfSpecials))
    }
    selectSpecials()

    for (let column = 0; column < levelColumns; column++) {
      bricks[column] = []
      for (let row = 0; row < levelRows; row++) {
        const brick = {
          x: column * (brickWidth + brickPadding) + brickOffsetLeft,
          y: row * (brickHeight + brickPadding) + brickOffsetTop,
          alive: 1,
          special: false,
        }

        const brickPosition = column * levelRows + row

        if (specialBricks.includes(brickPosition)) {
          brick.special = true
        }
        if (doubleBricks.includes(brickPosition)) {
          brick.alive = 2
        }

        bricks[column][row] = brick
      }
    }
  }
  generateBrickArray()

  const drawBalls = () => {
    balls.forEach(ball => {
      context.save()
      context.shadowColor = 'rgba(0,0,0,0.3)'
      context.shadowOffsetX = UNIT(0.2)
      context.shadowOffsetY = UNIT(0.2)
      context.shadowBlur = UNIT(0.5)
      context.beginPath()
      context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2, false)
      context.fillStyle = '#0085dd'
      context.fill()
      context.closePath()
      context.restore()
    })
  }

  const drawPaddle = () => {
    context.save()
    context.beginPath()
    context.rect(paddleX, HEIGHT - paddleHeight, paddleWidth, paddleHeight)
    context.fillStyle = '#777'
    context.shadowColor = 'rgba(0,0,0,0.3)'
    context.shadowOffsetX = UNIT(0.2)
    context.shadowOffsetY = UNIT(0.2)
    context.shadowBlur = UNIT(0.5)
    context.fill()
    context.closePath()
    context.restore()
  }

  const drawBricks = () => {
    for (let column = 0; column < levelColumns; column++) {
      for (let row = 0; row < levelRows; row++) {
        const brick = bricks[column][row]
        if (brick.alive) {
          context.save()
          context.beginPath()
          context.rect(brick.x, brick.y, brickWidth, brickHeight)
          context.fillStyle = brick.special ? '#71e53c' : brick.alive === 2 ? `#455885` : `#0085dd`
          context.shadowColor = 'rgba(0,0,0,0.3)'
          context.shadowOffsetX = UNIT(0.2)
          context.shadowOffsetY = UNIT(0.2)
          context.shadowBlur = UNIT(0.5)
          context.fill()
          context.closePath()
          context.restore()
        }
      }
    }
  }

  const collisionDetection = () => {
    let collisionX = []
    let collisionY = []
    let collision = false

    const ballCollider = (brick, ball, index) => {
      if (ball.x >= brick.x - ballRadius && ball.x <= brick.x + brickWidth + ballRadius) {
        if (
          (ball.y - ballRadius > brick.y + brickHeight - Math.abs(ball.dy) &&
            ball.y - ballRadius < brick.y + brickHeight + Math.abs(ball.dy)) ||
          (ball.y + ballRadius > brick.y - Math.abs(ball.dy) &&
            ball.y + ballRadius < brick.y + Math.abs(ball.dy))
        ) {
          collision = true
          collisionY.push(index)
        }
      }
      if (ball.y >= brick.y - ballRadius && ball.y <= brick.y + brickHeight + ballRadius) {
        if (
          (ball.x + ballRadius > Math.ceil(brick.x - Math.abs(ball.dx)) &&
            ball.x + ballRadius < Math.ceil(brick.x + Math.abs(ball.dx))) ||
          (ball.x - ballRadius > Math.ceil(brick.x + brickWidth - Math.abs(ball.dx)) &&
            ball.x - ballRadius < Math.ceil(brick.x + brickWidth + Math.abs(ball.dx)))
        ) {
          collision = true
          collisionX.push(index)
        }
      }

      if (collision) {
        brick.alive--
        if (brick.alive < 1) {
          if (brick.special) {
            const { x, y } = brick

            specials.push({ x: x + brickWidth / 2, y })
          }
          score++
        }
        collision = false

        if (score === levelRows * levelColumns) {
          if (level === 3) {
            drawWin()
            gameReset()
          } else {
            nextLevelReset()
            drawNextLevel()
          }
        }
      }
    }
    for (let column = 0; column < levelColumns; column++) {
      for (let row = 0; row < levelRows; row++) {
        const brick = bricks[column][row]

        if (brick.alive) {
          balls.forEach((ball, index) => ballCollider(brick, ball, index))
        }
      }
    }

    collisionX.forEach(index => {
      if (balls[index]) balls[index].dx = -balls[index].dx
    })

    collisionY.forEach(index => {
      if (balls[index]) balls[index].dy = -balls[index].dy
    })
  }

  const drawScore = () => {
    context.font = `${UNIT(1.6)}px Arial`
    context.textAlign = 'left'
    context.fillStyle = '#222'
    context.fillText(`Score: ${score}`, UNIT(0.8), UNIT(2))
  }

  const drawLives = () => {
    context.font = `${UNIT(1.6)}px Arial`
    context.textAlign = 'right'
    context.fillStyle = '#222'
    context.fillText(`Lives: ${lives}`, WIDTH - UNIT(0.8), UNIT(2))
  }

  const drawMiss = ballX => {
    paused = true
    context.font = `italic ${UNIT(1.2)}px Arial`
    context.textAlign = 'center'
    context.fillStyle = '#f00'
    context.fillText(`MISS!`, ballX, HEIGHT - UNIT(3))
  }

  const drawUserPaused = () => {
    context.beginPath()
    context.rect(0, 0, WIDTH, HEIGHT)
    context.fillStyle = 'rgba(255,255,255,0.8)'
    context.fill()
    context.closePath()
    context.save()
    context.font = `bold ${UNIT(2)}px Arial`
    context.textAlign = 'center'
    context.fillStyle = '#f70'
    context.shadowColor = 'rgba(0,0,0,0.2)'
    context.shadowOffsetX = UNIT(0.2)
    context.shadowOffsetY = UNIT(0.2)
    context.shadowBlur = UNIT(0.5)
    context.fillText('PAUSED', WIDTH / 2, HEIGHT / 2)
    context.restore()
  }

  function drawNextLevel() {
    paused = true
    context.beginPath()
    context.rect(0, 0, WIDTH, HEIGHT)
    context.fillStyle = 'rgba(0,95,255,0.8)'
    context.fill()
    context.closePath()
    context.save()
    context.font = `bold ${UNIT(4.8)}px Arial`
    context.textAlign = 'center'
    context.fillStyle = '#222'
    context.shadowColor = 'rgba(0,0,0,0.2)'
    context.shadowOffsetX = UNIT(0.4)
    context.shadowOffsetY = UNIT(0.4)
    context.shadowBlur = UNIT(0.8)
    const text = level === 2 ? 'HARDEN LEVEL' : 'TEDIUM UP!'
    context.fillText(text, WIDTH / 2, HEIGHT / 2)
    context.restore()
  }

  const drawGameOver = () => {
    paused = true
    context.beginPath()
    context.rect(0, 0, WIDTH, HEIGHT)
    context.fillStyle = 'rgba(255,0,0,0.8)'
    context.fill()
    context.closePath()
    context.save()
    context.font = `bold ${UNIT(4.8)}px Arial`
    context.textAlign = 'center'
    context.fillStyle = '#222'
    context.shadowColor = 'rgba(255,255,255,0.2)'
    context.shadowOffsetX = UNIT(0.4)
    context.shadowOffsetY = UNIT(0.4)
    context.shadowBlur = UNIT(0.8)
    context.fillText('DEATH FOR NOW', WIDTH / 2, HEIGHT / 2)
    context.restore()
  }

  function drawWin() {
    paused = true
    context.beginPath()
    context.rect(0, 0, WIDTH, HEIGHT)
    context.fillStyle = 'rgba(0,255,0,0.8)'
    context.fill()
    context.closePath()
    context.save()
    context.font = `bold ${UNIT(4.8)}px Arial`
    context.textAlign = 'center'
    context.fillStyle = '#222'
    context.shadowColor = 'rgba(0,0,0,0.2)'
    context.shadowOffsetX = UNIT(0.4)
    context.shadowOffsetY = UNIT(0.4)
    context.shadowBlur = UNIT(0.8)
    context.fillText('A WINNER IS YOU!', WIDTH / 2, HEIGHT / 2)
    context.restore()
  }

  function drawSpecials() {
    specials.forEach(special => {
      context.save()
      context.translate(special.x, special.y)
      context.shadowColor = 'rgba(190,255,190,0.8)'
      context.shadowBlur = UNIT(3)
      context.rotate(45 * Math.PI / 180)
      context.fillStyle = '#6df'
      context.fillRect(0, 0, UNIT(2), UNIT(2))
      context.restore()
    })
  }

  function addSpecialEffect() {
    const rando = Math.random()
    if (paddleWidth < UNIT(15)) {
      if (rando > .33) {
        Promise.resolve(setTimeout(spawnBall, 0)).then(setTimeout(spawnBall, 200))
      } else {
        paddleX -= UNIT(3.75)
        paddleWidth = UNIT(15)
      }
    } else {
      Promise.resolve(setTimeout(spawnBall, 0)).then(setTimeout(spawnBall, 200))
    }
  }

  function dropSpecials() {
    const dy = SPEED * 0.75
    specials.forEach((special, index) => {
      if (
        special.y + dy >= HEIGHT - paddleHeight - UNIT(0.8) &&
        special.y + dy < HEIGHT - UNIT(1.2)
      ) {
        if (special.x + UNIT(1) > paddleX && special.x - UNIT(1) < paddleX + paddleWidth) {
          addSpecialEffect()
          specials = [...specials.slice(0, index), ...specials.slice(index + 1)]
        }
      } else if (special.y + dy >= HEIGHT) {
        specials = [...specials.slice(0, index), ...specials.slice(index + 1)]
      }

      special.y += dy
    })
  }

  function missReset() {
    balls = getInitialBalls()
    paddleWidth = getInitialPaddleWidth()
    paddleX = getInitialPaddleX()
    specials = []
  }

  function nextLevelReset() {
    missReset()
    level++
    score = 0
    generateBrickArray()
  }

  function gameReset() {
    missReset()
    lives = 3
    score = 0
    level = 1
    generateBrickArray()
  }

  const draw = () => {
    if (paused) {
      return
    }

    context.clearRect(0, 0, WIDTH, HEIGHT)
    drawScore()
    drawLives()
    drawBricks()
    drawSpecials()
    drawBalls()
    drawPaddle()
    collisionDetection()

    dropSpecials()

    balls.forEach((ball, index) => {
      if (ball.x + ball.dx < ballRadius || ball.x + ball.dx > WIDTH - ballRadius) {
        ball.dx = -ball.dx
      }
      if (ball.y + ball.dy < ballRadius) {
        ball.dy = -ball.dy
      } else if (
        ball.y + ball.dy >= HEIGHT - ballRadius - paddleHeight + UNIT(0.2) &&
        ball.y + ball.dy < HEIGHT - ballRadius - paddleHeight / 2 + UNIT(0.2)
      ) {
        if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
          const contactPoint = paddleX + paddleWidth / 2 - ball.x
          const velocityLimit = MAX_SPEED * 1.1
          const velocityMultiplier = MAX_SPEED * 0.04

          if (Math.abs(velocityMultiplier * contactPoint) > velocityLimit) {
            ball.dx = -velocityLimit * Math.sign(contactPoint)
          } else {
            if (Math.abs(velocityMultiplier * contactPoint) > 1) {
              ball.dx = -velocityMultiplier * contactPoint
            } else {
              ball.dx = -Math.sign(contactPoint)
            }
          }
          ball.dy = -pythagorize(Math.sqrt(MAX_SPEED ** 2 * 2), ball.dx)
        }
      } else if (ball.y + ball.dy >= HEIGHT - ballRadius - paddleHeight + UNIT(1)) {
        if (ball.y + ball.dy > HEIGHT) {
          balls = [...balls.slice(0, index), ...balls.slice(index + 1)]

          if (balls.length < 1) {
            lives--

            if (!lives) {
              drawGameOver()
              gameReset()
            } else {
              drawMiss(ball.x)
              missReset()
            }
          }
        }
      }

      ball.x += ball.dx
      ball.y += ball.dy
    })

    if (rightPressed && paddleX < WIDTH - paddleWidth) {
      paddleX += SPEED * 2
    } else if (leftPressed && paddleX > 0) {
      paddleX -= SPEED * 2
    }

    window.requestAnimationFrame(draw)
  }

  const handlePause = () => {
    if (!paused) drawUserPaused()
    paused = !paused
    if (!paused) draw()
  }

  const spawnBall = (number = 1) => {
    while (number--) {
      balls.push({
        x: paddleX + paddleWidth / 2,
        y: HEIGHT - paddleHeight,
        dx: MAX_SPEED,
        dy: -MAX_SPEED,
      })
    }
  }

  const keyDownHandler = e => {
    if (e.keyCode === 39) {
      rightPressed = true
    }
    if (e.keyCode === 37) {
      leftPressed = true
    }
    if (e.keyCode === 32) {
      handlePause()
    }
    if (e.key === 'b') {
      spawnBall()
    }
    if (e.key === 'r') {
      gameReset()
    }
  }

  const keyUpHandler = e => {
    if (e.keyCode === 39) {
      rightPressed = false
    } else if (e.keyCode === 37) {
      leftPressed = false
    }
  }

  const mouseMoveHandler = e => {
    const relativeX = e.clientX - canvas.offsetLeft

    if (relativeX > paddleWidth / 2 && relativeX < WIDTH - paddleWidth / 2) {
      paddleX = relativeX - paddleWidth / 2
    }
  }

  document.addEventListener('keydown', keyDownHandler, false)
  document.addEventListener('keyup', keyUpHandler, false)
  document.addEventListener('mousemove', mouseMoveHandler, false)
  document.addEventListener('click', handlePause, false)

  return draw()
}

export default Breakout
