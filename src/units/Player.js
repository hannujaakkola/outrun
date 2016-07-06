import Phaser from 'phaser'
import _ from 'lodash'

const movementKeys = {}
const gearKeys = {}
let baseFrame = 7

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.setTo(0.5)

    this.speed = 0

    gearKeys.up = game.input.keyboard.addKey(Phaser.Keyboard.W)
    gearKeys.down = game.input.keyboard.addKey(Phaser.Keyboard.S)
    movementKeys.left = game.input.keyboard.addKey(Phaser.Keyboard.A)
    movementKeys.right = game.input.keyboard.addKey(Phaser.Keyboard.D)
  }

  update () {
    if (gearKeys.up.isDown) {
      baseFrame = 2
    }
    if (gearKeys.down.isDown) {
      baseFrame = 7
    }

    this.frame = _.clamp(this.frame, baseFrame - 1, baseFrame + 1)

    if (movementKeys.left.isDown || movementKeys.right.isDown) {
      if (movementKeys.left.isDown) {
        this.x--
        this.frame--
      }
      if (movementKeys.right.isDown) {
        this.x++
        this.frame++
      }
    } else if (this.frame !== baseFrame) {
      this.frame += this.frame < baseFrame ? 1 : -1
    }
  }

}
