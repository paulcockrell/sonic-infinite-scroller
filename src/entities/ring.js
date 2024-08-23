import k from "../kaplayCtx";

export function makeRing(pos) {
  const ring = k.add([
    k.sprite("ring", { anim: "spin" }),
    k.scale(4),
    k.area({ shape: new k.Rect(k.vec2(-5, 0), 32, 32) }),
    k.anchor("center"),
    k.pos(pos),
    k.offscreen(),
    "ring",
  ]);

  return ring;
}
