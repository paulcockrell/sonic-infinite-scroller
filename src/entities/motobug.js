import k from "../kaplayCtx";

export function makeMotobug(pos) {
  const motoBug = k.add([
    k.sprite("motobug", { anim: "run" }),
    k.scale(4),
    k.area({ shape: new k.Rect(k.vec2(-5, 0), 32, 32) }),
    k.anchor("center"),
    k.pos(pos),
    k.offscreen(),
    "motobug",
  ]);

  return motoBug;
}
