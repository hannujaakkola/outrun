/* globals __DEV__ */
import Phaser from 'phaser'
import Player from '../units/Player'
import {setResponsiveWidth} from '../utils'

export default class extends Phaser.State {
  init() {}
  preload() {
    game.load.spritesheet('ferrari', 'assets/images/ferrari.png', 88, 64, 11, 4)
  }

  create() {
    game.physics.startSystem(Phaser.Physics.ARCADE)

    let banner = this.add.text(this.game.world.centerX, this.game.height - 30, 'Phaser + ES6 + Webpack')
    banner.font = 'Nunito'
    banner.fontSize = 40
    banner.fill = '#77BFA3'
    banner.anchor.setTo(0.5)

    this.player = new Player({
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.centerY + 100,
      asset: 'ferrari'
    })
    game.add.existing(this.player)
  }

  render() {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player, 32, 32)
    }
  }
}
