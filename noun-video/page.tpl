<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=block" rel="stylesheet" />
    <script src="assets/gsap.min.js"></script>
    <style>
      :root {
        --ink: #2b2140;
        --pink: #e8317f;
        --yellow: #ffd23f;
        --green: #22c55e;
        --font: "Fredoka", sans-serif;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #3fb8ff; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; font-family: var(--font); color: var(--ink); }
      .scene { position: absolute; inset: 0; overflow: hidden; }

      /* ================= outdoor background ================= */
      .sky { position: absolute; inset: 0; background: linear-gradient(180deg, var(--top) 0%, var(--bot) 78%); }
      .rainbow { position: absolute; left: 50%; bottom: 170px; width: 1600px; height: 800px; margin-left: -800px; opacity: .6;
        background: radial-gradient(circle 800px at 50% 100%, transparent 0 60%, #8e5cf5 60% 64%, #2f8cff 64% 68%, #22c55e 68% 72%,
          #ffd23f 72% 76%, #ff9f1c 76% 80%, #ff4d6d 80% 84%, transparent 84%); }
      .sun { position: absolute; top: 60px; right: 100px; width: 170px; height: 170px; }
      .rays { position: absolute; inset: -70px; border-radius: 50%;
        background: repeating-conic-gradient(rgba(255, 226, 102, .8) 0 9deg, transparent 9deg 22.5deg); }
      .sun-core { position: absolute; inset: 0; border-radius: 50%; border: 7px solid #f2a900;
        background: radial-gradient(circle at 35% 30%, #fff3a6 0%, #ffd23f 45%, #ffb703 100%); }
      .se { position: absolute; top: 58px; width: 16px; height: 22px; background: var(--ink); border-radius: 50%; }
      .se.l { left: 50px; } .se.r { right: 50px; }
      .sm { position: absolute; top: 88px; left: 50%; width: 52px; height: 26px; margin-left: -26px; border: 6px solid var(--ink); border-top: none; border-radius: 0 0 40px 40px; }
      .cloud { position: absolute; width: 240px; height: 76px; background: #fff; border-radius: 60px; box-shadow: inset 0 -12px 0 rgba(160, 200, 240, .35); }
      .cloud::before, .cloud::after { content: ""; position: absolute; background: #fff; border-radius: 50%; }
      .cloud::before { width: 116px; height: 116px; left: 34px; top: -58px; }
      .cloud::after { width: 88px; height: 88px; left: 124px; top: -38px; }
      .c1 { top: 150px; left: 80px; } .c2 { top: 400px; left: 1260px; transform: scale(.75); } .c3 { top: 90px; left: 680px; transform: scale(.6); }
      .spk { position: absolute; width: calc(30px * var(--s)); height: calc(30px * var(--s)); background: #fff;
        clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%); }
      .sparkles { position: absolute; inset: 0; }
      .hill { position: absolute; border-radius: 50%; background: linear-gradient(180deg, color-mix(in srgb, var(--h) 70%, #fff) 0%, var(--h) 35%); }
      .h1 { left: -260px; bottom: 120px; width: 1300px; height: 480px; }
      .h2 { right: -320px; bottom: 100px; width: 1450px; height: 540px; }
      .tree { position: absolute; width: calc(120px * var(--s)); height: calc(170px * var(--s)); }
      .tree::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: calc(120px * var(--s)); border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #8be36b, #2f9e44 70%); }
      .tree i { position: absolute; bottom: 0; left: 50%; width: calc(22px * var(--s)); height: calc(60px * var(--s)); margin-left: calc(-11px * var(--s)); background: #8a5a35; border-radius: 6px; }
      .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 225px; background: linear-gradient(180deg, #58c04f 0%, #3c9c3c 100%); }
      .grass { position: absolute; left: 0; right: 0; top: -22px; height: 40px;
        background: radial-gradient(circle at 20px 40px, #7ad86b 21px, transparent 22px) repeat-x; background-size: 40px 40px; }
      .bfly { position: absolute; font-size: 54px; z-index: 4; }
      .b1 { left: -80px; top: 330px; } .b2 { left: 1960px; top: 220px; }
      .flowers { position: absolute; inset: 0; z-index: 6; }
      .flowers span { position: absolute; bottom: 196px; font-size: 44px; }

      /* ================= quiz stage ================= */
      .stage-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 80% at 45% 35%, #b28cff 0%, #7a45f0 38%, #3d1a99 75%, #24105e 100%); }
      .beams { position: absolute; left: 50%; top: 50%; width: 2800px; height: 2800px; margin: -1600px 0 0 -1400px; border-radius: 50%;
        background: repeating-conic-gradient(rgba(255, 255, 255, .09) 0 7deg, transparent 7deg 20deg); }
      .curtain { position: absolute; top: 0; bottom: 0; width: 150px; z-index: 2;
        background: repeating-linear-gradient(90deg, #e0284a 0 30px, #a3122e 30px 52px, #e0284a 52px 60px); }
      .curtain.l { left: 0; border-bottom-right-radius: 120px 700px; box-shadow: inset -18px 0 30px rgba(0,0,0,.35); }
      .curtain.r { right: 0; border-bottom-left-radius: 120px 700px; box-shadow: inset 18px 0 30px rgba(0,0,0,.35); }
      .valance { position: absolute; top: 0; left: 0; right: 0; height: 64px; z-index: 3;
        background: radial-gradient(circle at 60px 0, #c81d3e 58px, transparent 60px) repeat-x; background-size: 120px 64px; }
      .bulbs { position: absolute; top: 72px; left: 0; right: 0; height: 20px; z-index: 3; }
      .bulbs i { position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #fff4b0; box-shadow: 0 0 14px 4px rgba(255, 220, 80, .8); }
      .floor { position: absolute; left: -100px; right: -100px; bottom: 0; height: 270px; border-radius: 50% 50% 0 0 / 70px 70px 0 0;
        background: linear-gradient(180deg, #5b2bd6 0%, #2a0f75 100%); box-shadow: inset 0 14px 0 rgba(255,255,255,.15); }
      .stage .sparkles .spk { background: #fff6c2; }

      /* ================= characters ================= */
      .char-pos { position: absolute; bottom: 200px; width: 320px; height: 470px; margin-left: -160px;
        transform: scale(var(--sz)); transform-origin: 50% 100%; z-index: 5; }
      .shadow { position: absolute; left: 30px; top: 438px; width: 260px; height: 46px; border-radius: 50%;
        background: radial-gradient(ellipse at center, rgba(20, 10, 40, .35) 0%, rgba(20, 10, 40, 0) 70%); }
      .char-in, .char-bob { position: absolute; inset: 0; }
      .char-bob > * { position: absolute; }
      .body { top: 70px; left: 0; width: 320px; height: 300px; border: 7px solid var(--ink); border-radius: 64px; z-index: 3; overflow: hidden;
        background: radial-gradient(130% 120% at 26% 14%, var(--l) 0%, var(--c) 46%, var(--d) 100%);
        box-shadow: inset -16px -18px 0 rgba(0,0,0,.10); }
      .gloss { position: absolute; top: 16px; left: 28px; width: 92px; height: 36px; background: #fff; opacity: .4; border-radius: 50%; transform: rotate(-18deg); }
      .leg { top: 345px; width: 48px; height: 95px; background: linear-gradient(90deg, var(--c), var(--d)); border: 7px solid var(--ink); border-radius: 0 0 22px 22px; z-index: 1; }
      .leg.l { left: 86px; } .leg.r { right: 86px; }
      .shoe { position: absolute; bottom: -26px; left: -26px; width: 86px; height: 42px; background: linear-gradient(180deg, #4a3a6b, var(--ink)); border-radius: 44px 44px 18px 18px; }
      .shoe::after { content: ""; position: absolute; top: 8px; left: 16px; width: 22px; height: 9px; background: rgba(255,255,255,.35); border-radius: 50%; }
      .leg.r .shoe { left: -12px; }
      .arm { top: 185px; width: 44px; height: 150px; background: linear-gradient(90deg, var(--l), var(--c)); border: 7px solid var(--ink); border-radius: 22px; z-index: 2; transform-origin: 50% 16px; }
      .arm.l { left: -20px; } .arm.r { right: -20px; }
      .hand { position: absolute; bottom: -30px; left: -16px; width: 62px; height: 62px; background: radial-gradient(circle at 35% 30%, #fff, #e9e4f5); border: 7px solid var(--ink); border-radius: 50%; }
      .face { position: absolute; top: 44px; left: 0; right: 0; height: 180px; }
      .brow { position: absolute; top: -24px; width: 50px; height: 11px; background: var(--ink); border-radius: 8px; }
      .brow.l { left: 84px; transform: rotate(-8deg); } .brow.r { right: 84px; transform: rotate(8deg); }
      .eye { position: absolute; top: 0; width: 80px; height: 94px; background: #fff; border: 6px solid var(--ink); border-radius: 50%; overflow: hidden; }
      .eye.l { left: 70px; } .eye.r { right: 70px; }
      .pupil { position: absolute; left: 50%; top: 50%; width: 40px; height: 46px; margin: -21px 0 0 -20px; border-radius: 50%;
        background: radial-gradient(circle at 50% 60%, #4b3a7a 0%, var(--ink) 60%); }
      .pupil i { position: absolute; top: 7px; left: 8px; width: 14px; height: 14px; background: #fff; border-radius: 50%; }
      .pupil i::after { content: ""; position: absolute; top: 18px; left: 16px; width: 6px; height: 6px; background: #fff; border-radius: 50%; }
      .face[data-facing="1"] .pupil { transform: translateX(11px); }
      .face[data-facing="-1"] .pupil { transform: translateX(-11px); }
      .lid { position: absolute; inset: -2px; background: var(--c); transform-origin: 50% 0; transform: scaleY(0); }
      .cheek { position: absolute; top: 106px; width: 48px; height: 28px; background: #ff8fb1; border-radius: 50%; opacity: .8; }
      .cheek.l { left: 24px; } .cheek.r { right: 24px; }
      .mouth { position: absolute; top: 108px; left: 50%; width: 104px; height: 66px; margin-left: -52px; background: linear-gradient(180deg, #5c1230, #8a2347);
        border: 6px solid var(--ink); border-radius: 8px 8px 60px 60px; overflow: hidden; transform-origin: 50% 0; }
      .mouth::before { content: ""; position: absolute; top: 0; left: 18px; right: 18px; height: 10px; background: #fff; border-radius: 0 0 8px 8px; }
      .tongue { position: absolute; bottom: -16px; left: 18px; width: 58px; height: 38px; background: #ff7b9c; border-radius: 50%; }
      .label { position: absolute; bottom: 10px; left: 0; right: 0; text-align: center; font-weight: 700; font-size: 58px; color: #fff;
        -webkit-text-stroke: 3px var(--ink); text-shadow: 0 5px 0 rgba(0,0,0,.25); letter-spacing: 1px; }
      /* noun */
      .antenna { top: 4px; left: 153px; width: 14px; height: 76px; background: var(--ink); border-radius: 7px; z-index: 1; }
      .star { top: -44px; left: 114px; width: 92px; height: 92px; background: radial-gradient(circle at 40% 35%, #fff3a6, #ffc300); z-index: 4;
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
      /* teacher */
      .hair { top: 64px; left: -2px; width: 324px; height: 56px; background: linear-gradient(180deg, #7a4f36, #5b3a29); border: 7px solid var(--ink); border-bottom: none; border-radius: 64px 64px 0 0; z-index: 4; }
      .bun { top: 6px; left: 112px; width: 96px; height: 90px; background: radial-gradient(circle at 35% 30%, #8a5d42, #5b3a29); border: 7px solid var(--ink); border-radius: 50%; z-index: 2; }
      .glasses b { position: absolute; top: -10px; width: 112px; height: 116px; border: 7px solid var(--ink); border-radius: 50%; }
      .glasses b:first-child { left: 54px; } .glasses b:last-child { right: 54px; }
      .glasses::after { content: ""; position: absolute; top: 40px; left: 152px; width: 16px; height: 7px; background: var(--ink); }
      .shape-block .brow, .shape-school .brow { top: -26px; }
      /* school */
      .shape-school .body { border-radius: 20px; }
      .roof { top: -46px; left: -36px; width: 392px; height: 130px; background: var(--ink); z-index: 4; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
      .roof i { position: absolute; inset: 9px 14px 0; background: linear-gradient(180deg, #b23a3a, #7c1f2a); clip-path: polygon(50% 0, 100% 100%, 0 100%); }
      .bell { top: -88px; left: 140px; width: 40px; height: 46px; background: var(--yellow); border: 6px solid var(--ink); border-radius: 50% 50% 10px 10px; z-index: 4; }
      .flag { top: -150px; left: 196px; width: 60px; height: 40px; background: linear-gradient(90deg, #22c55e, #16a34a); border: 5px solid var(--ink); border-left: 7px solid var(--ink); z-index: 4; border-radius: 0 10px 10px 0; }
      .flag::before { content: ""; position: absolute; left: -12px; top: -6px; width: 7px; height: 110px; background: var(--ink); }
      /* cat */
      .ear { top: 18px; width: 110px; height: 110px; background: var(--c); z-index: 2; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
      .ear.l { left: 14px; transform: rotate(-14deg); } .ear.r { right: 14px; transform: rotate(14deg); }
      .ear i { position: absolute; left: 30px; top: 34px; width: 50px; height: 60px; background: #ff9cbc; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
      .tail { top: 210px; right: -120px; width: 170px; height: 170px; border: 30px solid transparent; border-right-color: var(--d); border-bottom-color: var(--d);
        border-radius: 50%; transform: rotate(-30deg); z-index: 0; }
      .whiskers { position: absolute; top: 100px; width: 74px; }
      .whiskers s { display: block; height: 5px; background: var(--ink); border-radius: 3px; margin: 12px 0; }
      .whiskers.l { left: -6px; } .whiskers.l s:first-child { transform: rotate(8deg); } .whiskers.l s:last-child { transform: rotate(-8deg); }
      .whiskers.r { right: -6px; } .whiskers.r s:first-child { transform: rotate(-8deg); } .whiskers.r s:last-child { transform: rotate(8deg); }
      .nose { position: absolute; top: 90px; left: 50%; width: 30px; height: 20px; margin-left: -15px; background: #ff6f9a; border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%; z-index: 2; }
      .shape-cat .mouth { top: 116px; }
      /* apple + ball */
      .shape-round .body, .shape-ball .body { border-radius: 50%; height: 320px; top: 56px; }
      .shape-round .face, .shape-ball .face { top: 62px; }
      .shape-round .label, .shape-ball .label { bottom: 26px; }
      .stem { top: 6px; left: 150px; width: 24px; height: 66px; background: #6b3b1f; border: 6px solid var(--ink); border-radius: 12px; transform: rotate(8deg); z-index: 2; }
      .leaf { top: 14px; left: 176px; width: 88px; height: 46px; background: linear-gradient(135deg, #7be36b, #2f9e44); border: 6px solid var(--ink); border-radius: 0 80px 0 80px; transform: rotate(-12deg); z-index: 4; }
      .shape-ball .body { background: radial-gradient(130% 120% at 26% 14%, transparent 0 0), linear-gradient(170deg, var(--l) 0%, var(--c) 40%, var(--c) 63%, var(--yellow) 63% 75%, var(--d) 75%); }
      .shine { top: 92px; left: 52px; width: 70px; height: 40px; background: #fff; opacity: .5; border-radius: 50%; transform: rotate(-35deg); z-index: 4; }

      /* ================= badge, cards ================= */
      .badge { position: absolute; top: 28px; left: 50%; display: flex; align-items: center; gap: 16px; padding: 8px 40px 12px 12px;
        background: linear-gradient(180deg, #fff 0%, #f4ecff 100%); border: 7px solid var(--ink); border-radius: 60px;
        box-shadow: 0 10px 0 rgba(0,0,0,.2); z-index: 20; white-space: nowrap; }
      .b-em { display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%; background: var(--bc); border: 5px solid var(--ink); font-size: 50px; line-height: 1; }
      .b-tx { font-size: 62px; font-weight: 700; color: var(--bc); letter-spacing: 3px; filter: brightness(.82); }
      .pop-row, .big-row { position: absolute; left: 0; right: 0; display: flex; justify-content: center; z-index: 15; }
      .pop-row { top: 160px; gap: 26px; padding-left: 100px; }
      #scene-intro .pop-row { top: 130px; padding-left: 0; }
      .pop-card, .big-card { background: #fff; border: 7px solid var(--ink); border-radius: 34px; text-align: center; overflow: hidden;
        box-shadow: 0 10px 0 rgba(0,0,0,.2); }
      .pop-card { width: 190px; }
      .pop-card .em { font-size: 100px; line-height: 1.25; background: radial-gradient(circle at 50% 40%, #fff 0%, #f3efff 100%); }
      .pop-card .lb, .big-card .lb { background: var(--cc); color: #fff; font-weight: 700; border-top: 6px solid var(--ink); text-shadow: 0 3px 0 rgba(0,0,0,.25); }
      .pop-card .lb { font-size: 40px; padding: 2px 0 6px; }
      .big-row { top: 150px; gap: 40px; }
      .big-card { width: 300px; }
      .big-card .em { font-size: 140px; line-height: 1.25; }
      .big-card .lb { font-size: 52px; padding: 4px 0 8px; }

      /* ================= quiz ================= */
      .qtext { position: absolute; top: 150px; left: 770px; padding: 10px 46px 16px; z-index: 16; white-space: nowrap;
        font-size: 64px; font-weight: 700; color: #fff; background: linear-gradient(180deg, #ff5fa2, #e8317f);
        border: 7px solid var(--ink); border-radius: 50px; box-shadow: 0 10px 0 rgba(0,0,0,.3); text-shadow: 0 4px 0 rgba(0,0,0,.25); }
      .big-q { left: 700px; top: 250px; font-size: 96px; background: linear-gradient(180deg, #ffd23f, #ff9f1c); color: var(--ink); text-shadow: none; }
      .meter-hint { position: absolute; top: 470px; left: 700px; display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 16;
        font-size: 90px; letter-spacing: 10px; padding: 16px 50px 20px; background: rgba(255,255,255,.95); border: 7px solid var(--ink); border-radius: 46px; box-shadow: 0 10px 0 rgba(0,0,0,.3); }
      .meter-hint span { font-size: 54px; letter-spacing: 1px; font-weight: 700; color: #7a3cf0; }
      .qarea { position: absolute; top: 280px; left: 170px; width: 1300px; height: 540px; display: flex; align-items: center; justify-content: center; z-index: 12; }
      .opt { position: relative; background: #fff; border: 8px solid var(--ink); border-radius: 40px; text-align: center;
        box-shadow: 0 12px 0 rgba(0,0,0,.28), 0 0 0 0 rgba(74, 222, 128, 0); }
      .chk { position: absolute; top: -34px; right: -30px; width: 84px; height: 84px; border-radius: 50%; background: var(--green); color: #fff; border: 7px solid var(--ink);
        font-size: 54px; font-weight: 700; line-height: 66px; transform: scale(0); z-index: 3; }
      .burst { position: absolute; left: 50%; top: 50%; width: 0; height: 0; z-index: 2; }
      .burst i { position: absolute; left: -9px; top: -9px; width: 18px; height: 18px; transform: rotate(var(--a)); }
      .burst b { position: absolute; left: 0; top: 0; width: 18px; height: 40px; border-radius: 9px; background: var(--yellow); border: 4px solid var(--ink); opacity: 0; }
      .pick-row { gap: 54px; }
      .pick { width: 340px; padding: 10px 0 20px; }
      .pick .em { font-size: 190px; line-height: 1.2; }
      .pick .lb { font-size: 80px; font-weight: 700; }
      .group { gap: 36px; }
      .item { width: 360px; padding: 6px 0 18px; text-align: center; background: linear-gradient(180deg, #fff, #fff3c4); border: 8px solid var(--ink); border-radius: 44px; box-shadow: 0 12px 0 rgba(0,0,0,.28); }
      .item .em { font-size: 210px; line-height: 1.2; }
      .item .lb { font-size: 76px; font-weight: 700; color: #7a3cf0; }
      .arrow { font-size: 96px; color: #fff; -webkit-text-stroke: 4px var(--ink); }
      .cat-grid { display: grid; grid-template-columns: 330px 330px; gap: 28px; }
      .cat { height: 160px; display: flex; align-items: center; justify-content: center; gap: 14px; background: var(--cc); }
      .cat .em { font-size: 74px; } .cat .lb { font-size: 62px; font-weight: 700; color: #fff; text-shadow: 0 4px 0 rgba(0,0,0,.3); }
      .sent { flex-direction: column; gap: 34px; }
      .pics { height: 190px; display: flex; gap: 120px; align-items: center; }
      .pic { font-size: 180px; line-height: 1; filter: drop-shadow(0 10px 0 rgba(0,0,0,.25)); }
      .pic.small { font-size: 150px; }
      .tiles { display: flex; gap: 20px; }
      .tile { font-size: 84px; font-weight: 700; padding: 8px 32px 16px; }
      .nums { display: flex; gap: 50px; margin-top: 10px; }
      .num { width: 150px; height: 150px; border-radius: 50%; font-size: 100px; font-weight: 700; line-height: 128px; background: linear-gradient(180deg, #fff, #e9e2ff); }
      .timer { position: absolute; left: 1560px; top: 170px; width: 200px; height: 200px; z-index: 18; }
      .timer svg { position: absolute; inset: 0; width: 200px; height: 200px; transform: rotate(-90deg); }
      .tr-bg { fill: #fff; stroke: var(--ink); stroke-width: 22; }
      .tr { fill: none; stroke: var(--yellow); stroke-width: 14; stroke-linecap: round; stroke-dasharray: 528; stroke-dashoffset: 0; }
      .tn { position: absolute; inset: 0; display: grid; place-items: center; font-size: 110px; font-weight: 700; color: #7a3cf0; opacity: 0; }
      .sayit { position: absolute; left: 1660px; top: 392px; padding: 6px 26px 10px; z-index: 18; white-space: nowrap; font-size: 38px; font-weight: 700;
        background: #fff; border: 6px solid var(--ink); border-radius: 30px; box-shadow: 0 8px 0 rgba(0,0,0,.25); }
      .meter { position: absolute; top: 34px; right: 190px; display: flex; gap: 6px; padding: 8px 18px 10px; z-index: 20;
        background: rgba(30, 10, 80, .55); border: 6px solid var(--ink); border-radius: 40px; }
      .ms { width: 58px; height: 58px; display: grid; place-items: center; }
      .ms b { display: block; font-size: 60px; line-height: 1; color: rgba(255,255,255,.28); }
      .ms.on b { color: var(--yellow); text-shadow: 0 0 16px rgba(255, 210, 63, .9); }

      /* ================= result ================= */
      .trophy-wrap { position: absolute; left: 700px; top: 150px; width: 400px; height: 400px; margin-left: -200px; z-index: 12; }
      .trophy-rays { position: absolute; inset: -160px; border-radius: 50%; background: repeating-conic-gradient(rgba(255, 230, 120, .45) 0 10deg, transparent 10deg 24deg); }
      .trophy { position: absolute; inset: 0; display: grid; place-items: center; font-size: 300px; filter: drop-shadow(0 16px 0 rgba(0,0,0,.3)); }
      .rstars { position: absolute; left: 700px; top: 570px; display: flex; gap: 14px; z-index: 14; transform: translateX(-50%); }
      .rs { font-size: 116px; line-height: 1; color: rgba(255,255,255,.25); -webkit-text-stroke: 4px var(--ink); }
      .medal { position: absolute; left: 700px; top: 720px; padding: 10px 50px 16px; z-index: 16; white-space: nowrap; font-size: 72px; font-weight: 700;
        color: var(--ink); background: linear-gradient(180deg, #fff3a6, #ffc300); border: 8px solid var(--ink); border-radius: 50px; box-shadow: 0 12px 0 rgba(0,0,0,.3); }

      /* ================= captions ================= */
      .caption { position: absolute; left: 0; right: 0; bottom: 26px; display: flex; justify-content: center; z-index: 50; }
      .cap-in { position: relative; max-width: 1780px; padding: 16px 44px 20px; background: linear-gradient(180deg, #fff 0%, #f6f1ff 100%); border: 7px solid var(--ink); border-radius: 44px;
        font-size: 52px; font-weight: 600; text-align: center; box-shadow: 0 10px 0 rgba(0,0,0,.2); }
      .who { position: absolute; top: -42px; left: 32px; padding: 2px 24px 6px; font-size: 32px; font-weight: 700; color: #fff; background: var(--sc); border: 5px solid var(--ink); border-radius: 22px; }
      .w { display: inline-block; color: #7d7398; }
      .kw-noun, .kw-kind { font-weight: 700; }

      /* ================= title ================= */
      .title-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; padding-top: 70px; z-index: 10; }
      .logo { display: flex; flex-direction: column; align-items: center; }
      .logo-word { display: flex; gap: 22px; }
      .tl { display: grid; place-items: center; width: 210px; height: 230px; font-size: 190px; font-weight: 700; color: #fff; line-height: 1;
        -webkit-text-stroke: 6px var(--ink); border: 9px solid var(--ink); border-radius: 44px; box-shadow: 0 16px 0 rgba(0,0,0,.25), inset -14px -16px 0 rgba(0,0,0,.12); }
      .tl:nth-child(1) { background: linear-gradient(160deg, #c4a6ff, #8e5cf5); } .tl:nth-child(2) { background: linear-gradient(160deg, #ff9fc8, #ff5fa2); }
      .tl:nth-child(3) { background: linear-gradient(160deg, #ffe17a, #ffb703); } .tl:nth-child(4) { background: linear-gradient(160deg, #8ce8d7, #21b6a8); }
      .logo-sub { margin-top: -6px; font-size: 130px; font-weight: 700; color: #fff; -webkit-text-stroke: 6px var(--ink); text-shadow: 0 10px 0 rgba(0,0,0,.2); transform: rotate(-4deg); }
      .title-pill { margin-top: 4px; padding: 6px 40px 12px; font-size: 56px; font-weight: 700; background: #fff; border: 7px solid var(--ink); border-radius: 40px; box-shadow: 0 10px 0 rgba(0,0,0,.2); }

      /* ================= outro ================= */
      .confetti { position: absolute; inset: 0; z-index: 10; pointer-events: none; }
      .cf { position: absolute; top: -60px; border-radius: 4px; }
      .end-text { position: absolute; left: 0; right: 0; top: 170px; text-align: center; font-size: 120px; font-weight: 700; color: #fff; -webkit-text-stroke: 7px var(--ink); z-index: 20;
        text-shadow: 0 10px 0 rgba(0,0,0,.2); }

      #wipe { position: absolute; left: 50%; top: 50%; width: 2500px; height: 2500px; margin: -1250px 0 0 -1250px; border-radius: 50%; z-index: 100; transform: scale(0);
        background: radial-gradient(circle, #fff 0 10%, #ffd23f 10% 26%, #ff9f1c 26% 40%, #ff5fa2 40% 55%, #8e5cf5 55% 70%, #2f8cff 70% 85%, #22c55e 85% 100%); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{{TOTAL}}" data-width="1920" data-height="1080">
{{SCENES}}
    {{CAPTIONS}}
    <div id="wipe" data-layout-allow-occlusion data-layout-allow-overlap></div>
    {{AUDIO}}
    </div>
    <script>
      const DATA = {{DATA}};
      const tl = gsap.timeline({ paused: true });
      const $ = (s, r = document) => r.querySelector(s);
      const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
      const odd = (n) => Math.max(1, Math.round(n)) | 1;
      // a looping yoyo tween that fits between t0 and t1 and ends where it began
      const loop = (target, vars, period, t0, t1) => {
        if (!target || t1 - t0 < period * 2) return;
        tl.to(target, { ...vars, duration: period, yoyo: true, repeat: odd((t1 - t0) / period - 1), ease: vars.ease || "sine.inOut" }, t0);
      };
      const pop = (el, t, ease = "back.out(2.2)", d = 0.55) => {
        if (el) tl.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: d, ease }, t);
      };
      const rig = (id) => {
        const el = document.getElementById(id);
        return { el, sh: document.getElementById(id + "-sh"), bob: $(".char-bob", el), armL: $(".arm.l", el), armR: $(".arm.r", el),
          mouth: $(".mouth", el), lids: $$(".lid", el), brows: $$(".brow", el) };
      };
      ["qtext", "badge", "medal", "meter-hint", "big-q"].forEach((c) => gsap.set("." + c, { xPercent: -50 }));
      gsap.set(".sayit", { xPercent: -50 });

      DATA.scenes.forEach((sc, si) => {
        const S = sc.start, E = sc.start + sc.dur, sid = sc.id;
        const root = document.getElementById("scene-" + sid);
        const id = (x) => document.getElementById(sid + "-" + x);

        // ---------- background life ----------
        $$(".cloud", root).forEach((c, i) => tl.fromTo(c, { x: 0 }, { x: 80 + i * 50, duration: sc.dur, ease: "none" }, S));
        const rays = $(".rays", root);
        if (rays) tl.fromTo(rays, { rotation: 0 }, { rotation: sc.dur * 12, duration: sc.dur, ease: "none" }, S);
        const beams = $(".beams", root);
        if (beams) tl.fromTo(beams, { rotation: -10 }, { rotation: 10 + sc.dur * 3, duration: sc.dur, ease: "none" }, S);
        $$(".spk", root).forEach((s, i) => {
          tl.set(s, { scale: 0.2, opacity: 0.3 }, S);
          loop(s, { scale: 1.1, opacity: 1, rotation: 90 }, 0.7 + (i % 4) * 0.18, S + (i % 5) * 0.2, E);
        });
        const bulbs = $$(".bulbs i", root);
        if (bulbs.length) {
          loop(bulbs.filter((_, i) => i % 2 === 0), { opacity: 0.35 }, 0.45, S, E);
          loop(bulbs.filter((_, i) => i % 2 === 1), { opacity: 0.35 }, 0.45, S + 0.45, E);
        }
        $$(".bfly", root).forEach((b, i) => {
          const dir = i === 0 ? 1 : -1;
          tl.fromTo(b, { x: 0 }, { x: dir * 2100, duration: sc.dur + 2, ease: "none" }, S);
          loop(b, { y: -60, scaleX: 0.7 }, 0.5, S, E);
        });
        const sun = $(".sun-core", root);
        if (sun) loop(sun, { scale: 1.06 }, 0.9, S, E);

        // ---------- scene wipe ----------
        if (si > 0) {
          tl.fromTo("#wipe", { scale: 0, rotation: 0 }, { scale: 1, rotation: 90, duration: 0.38, ease: "power2.in" }, S - 0.38);
          tl.to("#wipe", { scale: 0, rotation: 180, duration: 0.45, ease: "power2.out" }, S);
        }

        const badge = $(".badge", root);
        if (badge) {
          tl.fromTo(badge, { y: -220 }, { y: 0, duration: 0.7, ease: "back.out(2)" }, S + 0.25);
          loop($(".b-em", badge), { rotation: 10, scale: 1.08 }, 0.6, S + 1, E);
        }
        const meter = $(".meter", root);
        if (meter) tl.fromTo(meter, { y: -200 }, { y: 0, duration: 0.6, ease: "back.out(2)" }, S + 0.35);

        // ---------- title ----------
        if (sc.kind === "title") {
          tl.fromTo($$(".tl", root), { y: -800, rotation: -30 }, { y: 0, rotation: 0, duration: 0.95, stagger: 0.15, ease: "bounce.out" }, S + 0.3);
          tl.fromTo($(".logo-sub", root), { scale: 0, rotation: -40 }, { scale: 1, rotation: -4, duration: 0.7, ease: "back.out(2.5)" }, S + 1.3);
          tl.fromTo($(".title-pill", root), { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" }, S + 1.9);
          tl.to($$(".tl", root), { y: -36, duration: 0.25, stagger: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, S + 2.8);
          tl.to($$(".tl", root), { rotation: (i) => (i % 2 ? 6 : -6), duration: 0.3, stagger: 0.08, yoyo: true, repeat: 3, ease: "sine.inOut" }, S + 3.6);
        }

        // ---------- result ----------
        if (sc.kind === "result") {
          const tw = $(".trophy-wrap", root);
          tl.fromTo($(".trophy", root), { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(2.2)" }, S + 0.4);
          tl.fromTo($(".trophy-rays", root), { rotation: 0, scale: 0 }, { rotation: sc.dur * 20, scale: 1, duration: sc.dur, ease: "none" }, S + 0.4);
          loop($(".trophy", root), { y: -18 }, 0.7, S + 1.3, E);
        }

        if (!sc.chars) return;

        // ---------- characters ----------
        const enterAt = {};
        sc.lines.forEach((ln) => { if (ln.enter) enterAt[ln.speaker] = ln.start - 0.9; });
        sc.chars.forEach(([name], i) => {
          const r = rig(sid + "-" + name);
          gsap.set(r.armL, { rotation: 24 });
          gsap.set(r.armR, { rotation: -24 });
          gsap.set(r.mouth, { scaleY: 0.25 });
          const t0 = enterAt[name] ?? S + 0.1 + i * (sc.kind === "title" ? 0.18 : 0.12) + (sc.kind === "title" ? 1.2 : 0);
          tl.fromTo(r.el, { scale: 0, y: 260, transformOrigin: "50% 100%" }, { scale: 1, y: 0, duration: 0.75, ease: "back.out(1.7)" }, t0);
          tl.fromTo(r.sh, { scale: 0 }, { scale: 1, duration: 0.5 }, t0 + 0.3);
          const per = 0.62, tb = t0 + 0.75 + i * 0.2;
          loop(r.bob, { y: -14 }, per, tb, E);
          loop(r.sh, { scaleX: 0.86, opacity: 0.7 }, per, tb, E);
          for (let t = t0 + 1.3 + i * 0.57; t < E - 0.4; t += 2.9) {
            tl.to(r.lids, { scaleY: 1, duration: 0.07, yoyo: true, repeat: 1, ease: "none" }, t);
          }
          if (sc.kind === "title") {
            tl.to(r.armR, { rotation: -150, duration: 0.3 }, t0 + 0.8);
            tl.to(r.armR, { rotation: -115, duration: 0.2, yoyo: true, repeat: 5 }, t0 + 1.1);
            tl.to(r.armR, { rotation: -24, duration: 0.3 }, t0 + 2.3);
          }
        });

        // ---------- lines ----------
        sc.lines.forEach((ln, li) => {
          const T = ln.start;
          if (ln.speaker === "pause") {
            if (!ln.timer) return;
            const tm = id("timer"), say = id("sayit");
            pop(tm, T, "back.out(2.5)", 0.4);
            pop(say, T + 0.2, "back.out(2.5)", 0.4);
            loop(say, { scale: 1.08 }, 0.35, T + 0.7, T + ln.dur - 0.4);
            tl.fromTo($(".tr", tm), { strokeDashoffset: 0 }, { strokeDashoffset: 528, duration: 4, ease: "none" }, T + 0.3);
            [4, 3, 2, 1].forEach((n, k) => {
              const el = id("tn" + n), t = T + 0.3 + k;
              tl.fromTo(el, { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(3)" }, t);
              tl.to(el, { opacity: 0, duration: 0.15 }, t + 0.85);
            });
            tl.to([tm, say], { scale: 0, opacity: 0, duration: 0.3, ease: "back.in(2)" }, T + ln.dur - 0.25);
            return;
          }
          // caption + karaoke
          const cap = $("#cap-" + sid + "-" + li + " .cap-in");
          tl.fromTo(cap, { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, T);
          tl.to(cap, { opacity: 0, y: 20, duration: 0.2 }, T + ln.hold - 0.22);
          $$(".w", cap).forEach((w, k) => {
            const t = ln.wt[k] ?? T;
            const col = w.classList.contains("kw-noun") ? "#7a3cf0" : w.classList.contains("kw-kind") ? "#e8317f" : "#2b2140";
            tl.to(w, { color: col, duration: 0.1 }, t);
            tl.to(w, { y: -9, scale: 1.12, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, t);
          });

          ln.clips.forEach((cl) => {
            const r = rig(sid + "-" + cl.who);
            const step = 1 / 15;
            cl.env.forEach((v, k) => tl.to(r.mouth, { scaleY: 0.25 + 0.75 * v, duration: step, ease: "none" }, T + k * step));
            tl.to(r.mouth, { scaleY: 0.25, duration: 0.12 }, T + cl.env.length * step);
            tl.to(r.brows, { y: -10, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, T);
            tl.to(r.brows, { y: -6, duration: 0.18, yoyo: true, repeat: 1 }, T + Math.max(0.5, cl.dur - 0.6));
            tl.to(r.bob, { scaleY: 1.035, scaleX: 0.975, transformOrigin: "50% 100%", duration: 0.28, yoyo: true, repeat: odd(cl.dur / 0.28), ease: "sine.inOut" }, T);
            tl.to(r.armL, { rotation: 55, duration: 0.35, yoyo: true, repeat: odd(cl.dur / 0.35), ease: "sine.inOut" }, T);
            if (ln.act === "wave") {
              tl.to(r.armR, { rotation: -150, duration: 0.3, ease: "power2.out" }, T);
              tl.to(r.armR, { rotation: -115, duration: 0.2, yoyo: true, repeat: 5, ease: "sine.inOut" }, T + 0.3);
              tl.to(r.armR, { rotation: -24, duration: 0.35, ease: "power2.inOut" }, T + 1.5);
            }
            if (ln.act === "jump") {
              tl.to(r.el, { y: -150, duration: 0.32, yoyo: true, repeat: 3, ease: "power2.out" }, T);
              tl.to(r.sh, { scale: 0.55, duration: 0.32, yoyo: true, repeat: 3, ease: "power2.out" }, T);
            }
          });

          (ln.pops || []).forEach((p, k) => {
            const el = document.getElementById(sid + "-" + li + "-pop" + k);
            tl.fromTo(el, { scale: 0, rotation: -20, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(2.2)" }, p.at);
            loop($(".em", el), { y: -8 }, 0.5, p.at + 0.6, E);
          });
          (ln.big || []).forEach((p, k) => {
            const el = document.getElementById(sid + "-" + li + "-big" + k);
            tl.fromTo(el, { scale: 0, y: 80, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(2)" }, p.at);
            tl.to(el, { rotation: k % 2 ? 4 : -4, duration: 0.3, yoyo: true, repeat: 1 }, p.at + 0.6);
          });
          (ln.show || []).forEach((x, k) => pop(id(x), T + k * 0.15));
          (ln.opts || []).forEach((o) => {
            pop(id(o.id), o.at);
            tl.to(id(o.id), { rotation: 3, duration: 0.18, yoyo: true, repeat: 1 }, o.at + 0.55);
          });
          (ln.show_end || []).forEach((x, k) => pop(id(x), T + ln.dur + 0.1 + k * 0.15));
          (ln.show_at || []).forEach((o) => pop(id(o.id), o.at, "back.out(3)", 0.6));
          if (ln.opts && ln.opts.length) {
            // gentle wiggle while children think
            const last = ln.opts[ln.opts.length - 1].at + 0.8;
            const els = ln.opts.map((o) => id(o.id)).concat((ln.show_end || []).map(id));
            tl.to(els, { y: -10, duration: 0.4, yoyo: true, repeat: 9, stagger: 0.12, ease: "sine.inOut" }, Math.max(last, T + ln.dur + 0.5));
          }
          (ln.dim || []).forEach((x) => tl.to(id(x), { opacity: 0.3, scale: 0.88, duration: 0.4 }, T - 0.25));
          (ln.marks || []).forEach((m) => {
            const el = id(m.id);
            tl.to(el, { scale: 1.14, boxShadow: "0 12px 0 rgba(0,0,0,.28), 0 0 0 14px rgba(74, 222, 128, 1)", duration: 0.4, ease: "back.out(3)" }, m.at);
            tl.fromTo($(".chk", el), { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(3)" }, m.at + 0.1);
            tl.fromTo($$(".burst b", el), { y: 0, opacity: 1, scaleY: 1 }, { y: -170, opacity: 0, scaleY: 0.4, duration: 0.7, ease: "power2.out", immediateRender: false }, m.at + 0.05);
            loop(el, { rotation: 2.5 }, 0.3, m.at + 0.6, E - 0.3);
          });
          if (ln.star) {
            const st = id("ms" + ln.star), t = T + ln.dur * 0.5;
            tl.fromTo($("b", st), { color: "rgba(255,255,255,.28)", scale: 1 }, { color: "#ffd23f", scale: 1.8, duration: 0.3, ease: "back.out(3)" }, t);
            tl.to($("b", st), { scale: 1, duration: 0.3 }, t + 0.35);
          }
          if (ln.allstars) {
            $$(".rs", root).forEach((s, k) => {
              tl.fromTo(s, { scale: 0.3, color: "rgba(255,255,255,.25)" }, { scale: 1, color: "#ffd23f", duration: 0.45, ease: "back.out(3)" }, T + 0.2 + k * 0.22);
            });
          }
        });

        // ---------- confetti ----------
        if (sid === "outro" || sid === "result") {
          const t0 = sid === "outro" ? sc.lines[sc.lines.length - 1].start - 0.4 : sc.lines[0].start - 0.3;
          $$(".cf", root).forEach((c) => {
            const d = +c.dataset.d, sp = +c.dataset.sp;
            tl.fromTo(c, { y: 0, x: 0, rotation: 0 }, { y: 1250, x: +c.dataset.dx, rotation: +c.dataset.r, duration: sp, ease: "power1.in" }, t0 + d);
          });
        }
        if (sid === "outro") {
          const bye = sc.lines[sc.lines.length - 1];
          tl.fromTo($(".end-text", root), { scale: 0, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)" }, bye.start - 0.2);
        }
      });

      tl.set({}, {}, DATA.total);
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
