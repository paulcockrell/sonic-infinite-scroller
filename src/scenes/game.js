import { makeMotobug } from "../entities/motobug";
import { makeRing } from "../entities/ring";
import { makeSonic } from "../entities/sonic";
import k from "../kaplayCtx";

export default function game() {
  k.setGravity(3100);
  const citySfx = k.play("city", { volume: 0.2, loop: true });

  const bgPieceWidth = 1920;
  const bgPieces = [
    k.add([k.sprite("chemical-bg"), k.pos(0, 0), k.scale(2), k.opacity(0.8)]),
    k.add([
      k.sprite("chemical-bg"),
      k.pos(bgPieceWidth * 2, 0),
      k.scale(2),
      k.opacity(0.8),
    ]),
  ];

  const platformWidth = 1280;
  const platforms = [
    k.add([k.sprite("platforms"), k.pos(0, 450), k.scale(4)]),
    k.add([k.sprite("platforms"), k.pos(platformWidth * 4, 450), k.scale(4)]),
  ];

  let score = 0;
  let scoreMultiplier = 0;

  const scoreText = k.add([
    k.text("SCORE: 0", { font: "mania", size: 72 }),
    k.pos(20, 20),
  ]);

  const sonic = makeSonic(k.vec2(200, 745));
  sonic.setControls();
  sonic.setEvents();
  sonic.onCollide("motobug", (motobug) => {
    if (!sonic.isGrounded()) {
      k.play("destroy", { volume: 0.5 });
      k.play("hyper-ring", { volume: 0.5 });
      k.destroy(motobug);
      sonic.play("jump");
      sonic.jump();
      scoreMultiplier += 1;
      score += 10 * scoreMultiplier;
      scoreText.text = `SCORE: ${score}`;

      if (scoreMultiplier > 1) {
        sonic.ringCollectUI.text = `x${scoreMultiplier}`;
      } else {
        sonic.ringCollectUI.text = "+10";
      }

      k.wait(1, () => (sonic.ringCollectUI.text = ""));

      return;
    }

    k.play("hurt", { volume: 0.5 });
    k.setData("current-score", score);
    k.go("game-over", citySfx);
  });
  sonic.onCollide("ring", (ring) => {
    k.play("ring", { volume: 0.5 });
    k.destroy(ring);

    score++;
    scoreText.text = `SCORE: ${score}`;
    sonic.ringCollectUI.text = "+1";
    k.wait(1, () => (sonic.ringCollectUI.text = ""));
  });

  let gameSpeed = 150;
  // Every second make game speed up
  k.loop(1, () => {
    gameSpeed += 150;
    if (gameSpeed > 40000) {
      gameSpeed = 40000;
    }
  });

  const spawnMotobug = () => {
    const motobug = makeMotobug(k.vec2(1950, 773));
    motobug.onUpdate(() => {
      // while the platform speed is low we move the motobugs faster than the
      // platform, giving the impression they are heading towards us but when
      // the platform moves fast we have the motobugs stationairy relative to
      // the platform to make gameplay easier
      if (gameSpeed < 3000) {
        motobug.move(-(gameSpeed + 300), 0);
        return;
      }

      motobug.move(-gameSpeed, 0);
    });

    motobug.onExitScreen(() => {
      // if motobug exited left hand side of screen we destroy the entity
      if (motobug.pos.x < 0) {
        motobug.destroy();
      }
    });

    const waitTimeUpper = gameSpeed < 3000 ? 2.5 : 1.5;
    const waitTime = k.rand(0.5, waitTimeUpper);
    k.wait(waitTime, spawnMotobug);
  };

  spawnMotobug();

  const spawnRing = () => {
    const ring = makeRing(k.vec2(1950, 745));
    ring.onUpdate(() => {
      ring.move(-gameSpeed, 0);
    });

    ring.onExitScreen(() => {
      // if motobug exited left hand side of screen we destroy the entity
      if (ring.pos.x < 0) {
        ring.destroy();
      }
    });

    const waitTimeUpper = gameSpeed < 3000 ? 3.0 : 1.5;
    const waitTime = k.rand(0.5, waitTimeUpper);
    k.wait(waitTime, spawnRing);
  };

  spawnRing();

  k.add([
    k.rect(1920, 3000),
    k.opacity(0),
    k.area(),
    k.pos(0, 832),
    k.body({ isStatic: true }),
  ]);

  k.onUpdate(() => {
    if (sonic.isGrounded()) {
      scoreMultiplier = 0;
    }

    if (bgPieces[1].pos.x < 0) {
      bgPieces[0].moveTo(bgPieces[1].pos.x + bgPieceWidth * 2, 0);
      bgPieces.push(bgPieces.shift());
    }

    bgPieces[0].move(-100, 0);
    bgPieces[1].moveTo(bgPieces[0].pos.x + bgPieceWidth * 2, 0);

    if (platforms[1].pos.x < 0) {
      platforms[0].moveTo(platforms[1].pos.x + platformWidth * 4, 450);
      platforms.push(platforms.shift());
    }

    platforms[0].move(-gameSpeed, 0);
    platforms[1].moveTo(platforms[0].pos.x + platformWidth * 4, 450);
  });
}
