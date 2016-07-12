import Phaser from 'phaser'
import _ from 'lodash'

let accelerationKeys = {}
let cursors
let baseFrame = 7

const maxSpeed = [200, 300]

var centrifugal = 0.1   // centrifugal force multiplier when going around curves

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    this.speed = 1
    this.positionX = 0
    this.roadPosition = 0
    this.gear = 0

    this.game = game
    this.anchor.setTo(0.5)

    accelerationKeys.up = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    accelerationKeys.down = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
    cursors = game.input.keyboard.createCursorKeys()
  }

  update () {
    let speedPercent = this.speed / maxSpeed[this.gear];
    let turnRate = speedPercent * 0.001

    if (cursors.up.isDown) {
      baseFrame = 2
      this.gear = 1
    }
    if (cursors.down.isDown) {
      baseFrame = 7
      this.gear = 0
    }

    this.frame = _.clamp(this.frame, baseFrame - 1, baseFrame + 1)

    if (cursors.left.isDown || cursors.right.isDown) {
      if (cursors.left.isDown) {
        this.positionX -= turnRate
        this.frame--
      }
      if (cursors.right.isDown) {
        this.positionX += turnRate
        this.frame++
      }
    } else if (this.frame !== baseFrame) {
      this.frame += this.frame < baseFrame ? 1 : -1
    }

    if (accelerationKeys.up.isDown) {
      this.speed++
    } else if (accelerationKeys.down.isDown) {
      this.speed -= 2
    } else {
      this.speed--
    }

    this.speed = _.clamp(this.speed, 0, maxSpeed[this.gear])

    this.roadPosition += this.speed

    this.positionX = this.positionX - (turnRate * speedPercent * game.playerSegment.curve * centrifugal)
    this.x = game.roadWidth * 2 * this.positionX + game.world.centerX

    this.positionX = _.clamp(this.positionX, -1, 1)
  }

}

