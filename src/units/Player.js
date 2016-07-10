import Phaser from 'phaser'
import _ from 'lodash'

let accelerationKeys = {}
let cursors
let baseFrame = 7

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    this.speed = 1
    this.positionX = 0
    this.roadPosition = 0

    this.game = game
    this.anchor.setTo(0.5)

    accelerationKeys.up = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    accelerationKeys.down = game.input.keyboard.addKey(Phaser.Keyboard.Z)
    cursors = game.input.keyboard.createCursorKeys()
  }

  update () {
    if (cursors.up.isDown) {
      baseFrame = 2
    }
    if (cursors.down.isDown) {
      baseFrame = 7
    }

    this.frame = _.clamp(this.frame, baseFrame - 1, baseFrame + 1)
    this.positionX = _.clamp(this.positionX, -1, 1)

    if (cursors.left.isDown || cursors.right.isDown) {
      if (cursors.left.isDown) {
        this.positionX -= .01
        this.frame--
      }
      if (cursors.right.isDown) {
        this.positionX += .01
        this.frame++
      }
    } else if (this.frame !== baseFrame) {
      this.frame += this.frame < baseFrame ? 1 : -1
    }

    if (accelerationKeys.up.isDown) {
      this.speed++
    } else {
      this.speed -= .1
    }

    this.speed = _.clamp(this.speed, 0, 50)
    this.roadPosition += this.speed

    this.x = game.roadWidth * 2 * this.positionX + game.world.centerX
  }

}
