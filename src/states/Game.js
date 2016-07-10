/* globals __DEV__ */
import Phaser from 'phaser'
import Player from '../units/Player'
import {setResponsiveWidth} from '../utils'

const COLORS = {
  GRASS: { bg: '0x271e39', line: '0xd94b6d' },
  LIGHT:  { road: '0x6B6B6B', grass: '0x271e39', rumble: '0x555555', lane: '0xCCCCCC'  },
  DARK: { road: '0x696969', grass: '0xd94b6d', rumble: '0xBBBBBB' }
}

const segmentLength = 200   // length of a single segment
const rumbleLength  = 3    // number of segments per red/white rumble strip
const lanes         = 3    // number of lanes
const fieldOfView   = 50        // angle (degrees) for field of view
const cameraHeight  = 150 // z height of camera
const cameraDepth     = 1 / Math.tan((fieldOfView/2) * Math.PI/180); // z distance camera is from screen (computed)
const drawDistance  = 300  // number of segments to draw
const playerZ = cameraHeight * cameraDepth

export default class extends Phaser.State {
  init() {}
  preload() {
    game.load.spritesheet('ferrari', 'assets/images/ferrari.png', 88, 64, 11, 4)
    game.time.advancedTiming = true
  }

  create() {
    game.roadWidth = 100

    game.stage.backgroundColor = 0x081e2c

    this.player = new Player({
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.centerY + 300,
      asset: 'ferrari'
    })
    game.add.existing(this.player)

    resetRoad(this)

    game.graphics = game.add.graphics(0, 0)
  }

  update() {
    game.graphics.clear()

    game.graphics.beginFill(COLORS.GRASS.bg)
    game.graphics.drawRect(0, game.height / 2, game.width, game.height / 2)

    let baseSegment = findSegment(this.segments, this.player.roadPosition)
    let maxy        = game.height

    for(let n = 0; n < drawDistance; n++) {
      let segment = this.segments[(baseSegment.index + n) % this.segments.length];

      project(segment.p1, (this.player.positionX * game.roadWidth), cameraHeight, this.player.roadPosition, cameraDepth, game.width, game.height, game.roadWidth)
      project(segment.p2, (this.player.positionX * game.roadWidth), cameraHeight, this.player.roadPosition, cameraDepth, game.width, game.height, game.roadWidth)

      if ((segment.p1.camera.z <= cameraDepth) || // behind us
          (segment.p2.screen.y >= maxy))          // clip by (already rendered) segment
        continue;

      renderSegment(game, game.width, lanes, segment.p1.screen, segment.p2.screen, segment.color);

      maxy = segment.p2.screen.y;
    }

    this.player.bringToTop()
  }

  render() {
    if (__DEV__) {
      game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
      // this.game.debug.spriteInfo(this.player, 32, 32)
    }
  }
}


function renderSegment(game, width, lanes, p1, p2, color) {

  let rumble1 = Render.rumbleWidth(p1.w, lanes),
      rumble2 = Render.rumbleWidth(p2.w, lanes),
      l1 = Render.laneMarkerWidth(p1.w, lanes),
      l2 = Render.laneMarkerWidth(p2.w, lanes),
      lanew1, lanew2, lanex1, lanex2, lane

  game.graphics.beginFill(COLORS.GRASS.line)
  game.graphics.drawRect(0, p2.y, width, (p1.y - p2.y) / 10)

  game.graphics.beginFill(color.rumble)
  game.graphics.moveTo(p1.x-p1.w-rumble1, p1.y)
  game.graphics.lineTo(p1.x-p1.w, p1.y)
  game.graphics.lineTo(p2.x-p2.w, p2.y)
  game.graphics.lineTo(p2.x-p2.w-rumble2, p2.y)
  game.graphics.endFill()

  game.graphics.beginFill(color.rumble)
  game.graphics.moveTo(p1.x+p1.w+rumble1, p1.y)
  game.graphics.lineTo(p1.x+p1.w, p1.y)
  game.graphics.lineTo(p2.x+p2.w, p2.y)
  game.graphics.lineTo(p2.x+p2.w+rumble2, p2.y)
  game.graphics.endFill()

  game.graphics.beginFill(color.road)
  game.graphics.moveTo(p1.x-p1.w, p1.y)
  game.graphics.lineTo(p1.x+p1.w, p1.y)
  game.graphics.lineTo(p2.x+p2.w, p2.y)
  game.graphics.lineTo(p2.x-p2.w, p2.y)
  game.graphics.endFill()

  if (color.lane) {
    lanew1 = p1.w * 2 / lanes
    lanew2 = p2.w * 2 / lanes
    lanex1 = p1.x - p1.w + lanew1
    lanex2 = p2.x - p2.w + lanew2
    for(lane = 1 ; lane < lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++) {
      game.graphics.beginFill(color.lane);
      game.graphics.moveTo(lanex1 - l1 / 2, p1.y)
      game.graphics.lineTo(lanex1 + l1 / 2, p1.y)
      game.graphics.lineTo(lanex2 + l2 / 2, p2.y)
      game.graphics.lineTo(lanex2 - l2 / 2, p2.y)
      game.graphics.endFill()
    }
  }
}

let Render = {
  rumbleWidth:     function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(6,  2*lanes); },
  laneMarkerWidth: function(projectedRoadWidth, lanes) { return projectedRoadWidth/Math.max(32, 8*lanes); }
}

function project(p, cameraX, cameraY, cameraZ, cameraDepth, width, height, roadWidth) {
  p.camera.x     = (p.world.x || 0) - cameraX;
  p.camera.y     = (p.world.y || 0) - cameraY;
  p.camera.z     = (p.world.z || 0) - cameraZ;
  p.screen.scale = cameraDepth/p.camera.z;
  p.screen.x     = Math.round((width/2)  + (p.screen.scale * p.camera.x  * width/2));
  p.screen.y     = Math.round((height/2) - (p.screen.scale * p.camera.y  * height/2));
  p.screen.w     = Math.round(             (p.screen.scale * roadWidth   * width/2));
}

function resetRoad(game) {
  game.segments = []
  for(let n = 0; n < 500; n++) { // arbitrary road length
    game.segments.push({
      index: n,
      p1: { world: { z:  n   *segmentLength }, camera: {}, screen: {} },
      p2: { world: { z: (n+1)*segmentLength }, camera: {}, screen: {} },
      color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
    })
  }

}

function findSegment(segments, z) {
  return segments[Math.floor(z/segmentLength) % segments.length];
}
