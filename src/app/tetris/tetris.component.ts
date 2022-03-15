import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.scss']
})
export class TetrisComponent implements OnInit {

  @ViewChild('board', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  points: number;
  lines: number;
  level: number;
  numRows: number;
  numCols: number;
  arena: number[][];
  sumTime: number = 0;
  lastTime: number = 0;
  dropTime: number = 1000;
  colors: string[] = [
    'black',
    'purple',
    'yellow',
    'orange',
    'blue',
    'cyan',
    'green',
    'red',
  ]
  player = {
    pos: { x: 0, y: 0 },
    matrix: null,
  }
  playerDrop = {
    pos: { x: 0, y: 0 },
    matrix: null,
  }

  @HostListener('window:keydown', ['$event'])
  keyPress(e: KeyboardEvent) {
    if (e.keyCode === 37) {
      this.playerMove(-1);
    } else if (e.keyCode === 39) {
      this.playerMove(1);
    } else if (e.keyCode === 40) {
      this.drop();
    } else if (e.keyCode === 38) {
      this.hardDrop(this.player, true);
    } else if (e.keyCode === 81) {
      this.playerRotate(-1);
    } else if (e.keyCode === 87) {
      this.playerRotate(1);
    }
  }

  ngOnInit(): void {
    this.numRows = 15;
    this.numCols = 10;
    this.initArena();
    this.arena = this.generateBoard();
  }

  initArena() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.canvas.width = this.numCols * 50;
    this.ctx.canvas.height = this.numRows * 50;
    this.ctx.scale(50, 50);
  }

  generateBoard() {
    const rows = [];
    for (let i = 0; i < this.numRows; i++) {
      rows.push(Array.from(Array(this.numCols), () => 0));
    }
    return rows;
  }

  drop() {
    this.player.pos.y++;
    if (this.collide(this.arena, this.player)) {
      this.player.pos.y--;
      this.merge(this.arena, this.player);
      this.playerReset();
      this.arenaSweep();
    }
    this.sumTime = 0;
  }

  hardDrop = (player, bool: boolean) => {
    while (!this.collide(this.arena, player)) {
      player.pos.y++;
    }
    player.pos.y--;
    if (bool) {
      this.merge(this.arena, player);
      this.playerReset();
      this.arenaSweep();
    }
  }

  playerMove = (dir) => {
    this.player.pos.x += dir;
    if (this.collide(this.arena, this.player)) {
      this.player.pos.x -= dir;
    }
    this.playerDrop.pos = { x: this.player.pos.x, y: this.player.pos.y };
    this.hardDrop(this.playerDrop, false);
  }

  playerRotate = (dir) => {
    const pos = this.player.pos.x;
    let offset = 1;
    this.rotate(this.player.matrix, dir);
    while (this.collide(this.arena, this.player)) {
      this.player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > this.player.matrix[0].length) {
        this.rotate(this.player.matrix, -dir);
        this.player.pos.x = pos;
        return;
      }
    }
    this.playerDrop.matrix = this.player.matrix;
    this.playerDrop.pos = { x: this.player.pos.x, y: this.player.pos.y };
    this.hardDrop(this.playerDrop, false);
  }

  rotate = (matrix, dir) => {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < y; x++) {
        [
          matrix[x][y],
          matrix[y][x],
        ] = [
            matrix[y][x],
            matrix[x][y],
          ];

      }
    }
    if (dir > 0) {
      matrix.forEach(row => row.reverse());
    } else {
      matrix.reverse();
    }
  }

  arenaSweep = () => {
    let rowCount = 1;
    outer: for (let y = this.arena.length - 1; y > 0; y--) {
      for (let x = 0; x < this.arena[y].length; x++) {
        if (this.arena[y][x] === 0) {
          continue outer;
        }
      }
      const row = this.arena.splice(y, 1)[0].fill(0);
      this.arena.unshift(row);
      y++;
      this.points += rowCount * 10;
      rowCount *= 2;
    }
  }

  playerReset() {
    this.player.matrix = this.createPiece(Math.floor(Math.random() * 7) + 1);
    this.player.pos.y = 0;
    this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);
    if (this.collide(this.arena, this.player)) {  // reset game
      this.arena.forEach(row => row.fill(0));
      this.points = 0;
      this.level = 1;
    }
    this.playerDrop.matrix = this.player.matrix;
    this.playerDrop.pos = { x: this.player.pos.x, y: this.player.pos.y };
    this.hardDrop(this.playerDrop, false);
  }

  collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] != 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) != 0) {
          return true;
        }
      }
    }
    return false;
  }

  merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value != 0 && value) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      })
    })
  }

  draw(now = 0) {
    this.sumTime += now - this.lastTime;
    this.lastTime = now;
    if (this.sumTime > this.dropTime) this.drop();
    for (let i = 0; i < this.numRows; i++) {
      for (let j = 0; j < this.numCols; j++) {
        this.drawPiece(j, i, { x: 0, y: 0 });
      }
    }
    for (let i = 0; i < this.player.matrix.length; i++) {
      for (let j = 0; j < this.player.matrix[i].length; j++) {
        if (this.player.matrix[i][j] != 0) {
          this.drawPlayer(j, i, this.player.pos);
        }
      }
    }
    for (let i = 0; i < this.playerDrop.matrix.length; i++) {
      for (let j = 0; j < this.playerDrop.matrix[i].length; j++) {
        if (this.playerDrop.matrix[i][j] != 0) {
          this.drawPlayerDrop(j, i, this.playerDrop.pos);
        }
      }
    }
    this.updateLevel();
    requestAnimationFrame(this.draw.bind(this));
  }

  drawPlayerDrop(x: number, y: number, offset: { x: number, y: number }) {
    this.ctx.globalAlpha = 0.2;
    this.ctx.fillStyle = this.colors[this.player.matrix[y][x]];
    this.ctx.fillRect(offset.x + x, offset.y + y, 1, 1);
  }

  drawPlayer(x: number, y: number, offset: { x: number, y: number }) {
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = this.colors[this.player.matrix[y][x]];
    this.ctx.fillRect(offset.x + x, offset.y + y, 1, 1);
  }

  drawPiece(x: number, y: number, offset: { x: number, y: number }) {
    this.ctx.globalAlpha = 1;
    this.ctx.fillStyle = this.colors[this.arena[y][x]];
    this.ctx.fillRect(offset.x + x, offset.y + y, 1, 1);
  }

  updateLevel() {
    if(this.points > this.level * 100) {
      this.level++;
      this.dropTime = Math.max(500, this.dropTime - 100);
    }
  }

  createPiece(type: number) {
    switch (type) {
      case 1:
        return [
          [0, 0, 0],
          [1, 1, 1],
          [0, 1, 0],
        ];
      case 2:
        return [
          [2, 2],
          [2, 2],
        ];
      case 3:
        return [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ];
      case 4:
        return [
          [0, 4, 0],
          [0, 4, 0],
          [4, 4, 0],
        ];
      case 5:
        return [
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 5, 0, 0],
        ];
      case 6:
        return [
          [0, 6, 6],
          [6, 6, 0],
          [0, 0, 0],
        ];
      case 7:
        return [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ];
      default: return null;
    }
  }

  start() {
    this.arena = this.generateBoard();
    this.points = 0;
    this.lines = 0;
    this.level = 1;
    this.playerReset();
    this.draw();
  }

  

  log(msg: any) {
    console.log(msg);
  }
}
