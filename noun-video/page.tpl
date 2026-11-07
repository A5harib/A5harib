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
        --pink: #d6246f;
        --yellow: #ffd23f;
        --font: "Fredoka", sans-serif;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #7fd3ff; }
      #root { position: relative; width: 1920px; height: 1080px; overflow: hidden; font-family: var(--font); color: var(--ink); }
      .scene { position: absolute; inset: 0; overflow: hidden; }

      /* ---------- background ---------- */
      .sky { position: absolute; inset: 0; background: linear-gradient(180deg, var(--sky) 0%, #ffffff 115%); }
      .sun { position: absolute; top: 70px; right: 110px; width: 160px; height: 160px; }
      .rays { position: absolute; inset: -60px; border-radius: 50%;
        background: repeating-conic-gradient(rgba(255, 224, 102, .75) 0 10deg, transparent 10deg 20deg); }
      .sun-core { position: absolute; inset: 0; border-radius: 50%; background: #ffd23f; border: 7px solid #f2a900; }
      .cloud { position: absolute; width: 230px; height: 74px; background: #fff; border-radius: 60px; opacity: .95; }
      .cloud::before, .cloud::after { content: ""; position: absolute; background: #fff; border-radius: 50%; }
      .cloud::before { width: 110px; height: 110px; left: 34px; top: -54px; }
      .cloud::after { width: 84px; height: 84px; left: 118px; top: -36px; }
      .c1 { top: 150px; left: 90px; } .c2 { top: 380px; left: 1240px; transform: scale(.8); } .c3 { top: 90px; left: 700px; transform: scale(.65); }
      .hill { position: absolute; border-radius: 50%; }
      .h1 { left: -260px; bottom: 120px; width: 1300px; height: 480px; background: #79d66f; }
      .h2 { right: -320px; bottom: 100px; width: 1450px; height: 540px; background: #63c45c; }
      .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 225px; background: #4cae4c; border-top: 14px solid #8fe07f; }
      .flowers span { position: absolute; bottom: 160px; font-size: 46px; z-index: 6; }
      .flowers { position: absolute; inset: 0; z-index: 6; }

      /* ---------- characters ---------- */
      .char-pos { position: absolute; bottom: 200px; width: 320px; height: 470px; margin-left: -160px;
        transform: scale(var(--sz)); transform-origin: 50% 100%; z-index: 5; }
      .char-in, .char-bob { position: absolute; inset: 0; }
      .char-bob > * { position: absolute; }
      .body { top: 70px; left: 0; width: 320px; height: 300px; background: var(--c); border: 7px solid var(--ink);
        border-radius: 60px; z-index: 3;
        box-shadow: inset -20px -20px 0 rgba(0,0,0,.12), inset 16px 16px 0 rgba(255,255,255,.22); }
      .leg { top: 345px; width: 48px; height: 95px; background: var(--d); border: 7px solid var(--ink); border-radius: 0 0 22px 22px; z-index: 1; }
      .leg.l { left: 86px; } .leg.r { right: 86px; }
      .shoe { position: absolute; bottom: -26px; left: -26px; width: 86px; height: 42px; background: var(--ink); border-radius: 44px 44px 18px 18px; }
      .leg.r .shoe { left: -12px; }
      .arm { top: 185px; width: 44px; height: 150px; background: var(--c); border: 7px solid var(--ink); border-radius: 22px; z-index: 2; transform-origin: 50% 16px; }
      .arm.l { left: -20px; } .arm.r { right: -20px; }
      .hand { position: absolute; bottom: -30px; left: -16px; width: 62px; height: 62px; background: #fff; border: 7px solid var(--ink); border-radius: 50%; }
      .face { position: absolute; top: 44px; left: 0; right: 0; height: 180px; }
      .eye { position: absolute; top: 0; width: 80px; height: 94px; background: #fff; border: 6px solid var(--ink); border-radius: 50%; overflow: hidden; }
      .eye.l { left: 70px; } .eye.r { right: 70px; }
      .pupil { position: absolute; left: 50%; top: 50%; width: 38px; height: 44px; margin: -20px 0 0 -19px; background: var(--ink); border-radius: 50%; }
      .pupil i { position: absolute; top: 7px; left: 8px; width: 13px; height: 13px; background: #fff; border-radius: 50%; }
      .face[data-facing="1"] .pupil { transform: translateX(11px); }
      .face[data-facing="-1"] .pupil { transform: translateX(-11px); }
      .lid { position: absolute; inset: -2px; background: var(--c); transform-origin: 50% 0; transform: scaleY(0); }
      .cheek { position: absolute; top: 108px; width: 46px; height: 28px; background: #ff8fb1; border-radius: 50%; opacity: .75; }
      .cheek.l { left: 26px; } .cheek.r { right: 26px; }
      .mouth { position: absolute; top: 108px; left: 50%; width: 104px; height: 66px; margin-left: -52px; background: #7a1f3d;
        border: 6px solid var(--ink); border-radius: 8px 8px 60px 60px; overflow: hidden; transform-origin: 50% 0; }
      .tongue { position: absolute; bottom: -16px; left: 18px; width: 58px; height: 38px; background: #ff7b9c; border-radius: 50%; }
      .label { position: absolute; bottom: 10px; left: 0; right: 0; text-align: center; font-weight: 700; font-size: 58px; color: #fff;
        -webkit-text-stroke: 3px var(--ink); text-shadow: 0 5px 0 rgba(0,0,0,.25); letter-spacing: 1px; }

      /* noun */
      .antenna { top: 4px; left: 153px; width: 14px; height: 76px; background: var(--ink); border-radius: 7px; z-index: 1; }
      .star { top: -42px; left: 116px; width: 88px; height: 88px; background: var(--yellow); z-index: 4;
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
      /* teacher */
      .hair { top: 64px; left: -2px; width: 324px; height: 54px; background: #5b3a29; border: 7px solid var(--ink); border-bottom: none; border-radius: 64px 64px 0 0; z-index: 4; }
      .bun { top: 6px; left: 112px; width: 96px; height: 90px; background: #5b3a29; border: 7px solid var(--ink); border-radius: 50%; z-index: 2; }
      .glasses b { position: absolute; top: -10px; width: 112px; height: 116px; border: 7px solid var(--ink); border-radius: 50%; }
      .glasses b:first-child { left: 54px; } .glasses b:last-child { right: 54px; }
      .glasses::after { content: ""; position: absolute; top: 40px; left: 152px; width: 16px; height: 7px; background: var(--ink); }
      /* school */
      .shape-school .body { border-radius: 18px; }
      .roof { top: -44px; left: -34px; width: 388px; height: 128px; background: #8b2d2d; z-index: 4; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
      .bell { top: -86px; left: 140px; width: 40px; height: 46px; background: var(--yellow); border: 6px solid var(--ink); border-radius: 50% 50% 10px 10px; z-index: 4; }
      .door { display: none; }
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
      .shape-round .face, .shape-ball .face { top: 58px; }
      .shape-round .label, .shape-ball .label { bottom: 26px; }
      .stem { top: 6px; left: 150px; width: 24px; height: 66px; background: #6b3b1f; border: 6px solid var(--ink); border-radius: 12px; transform: rotate(8deg); z-index: 2; }
      .leaf { top: 14px; left: 176px; width: 88px; height: 46px; background: #4fc94f; border: 6px solid var(--ink); border-radius: 0 80px 0 80px; transform: rotate(-12deg); z-index: 4; }
      .shape-ball .body { background: radial-gradient(circle at 50% 50%, transparent 0 0), linear-gradient(170deg, var(--c) 0 64%, var(--yellow) 64% 76%, var(--c) 76%); }
      .stripe { display: none; }
      .shine { top: 92px; left: 52px; width: 70px; height: 40px; background: #fff; opacity: .55; border-radius: 50%; transform: rotate(-35deg); z-index: 4; }

      /* ---------- text & cards ---------- */
      .badge { position: absolute; top: 34px; left: 50%; display: flex; align-items: center; gap: 18px; padding: 10px 44px 14px;
        background: #fff; border: 7px solid var(--ink); border-radius: 60px; box-shadow: 0 10px 0 rgba(0,0,0,.18); z-index: 20; white-space: nowrap; }
      .b-em { font-size: 64px; line-height: 1; }
      .b-tx { font-size: 64px; font-weight: 700; color: var(--pink); letter-spacing: 3px; }
      .pop-row, .big-row, .quiz-row { position: absolute; left: 0; right: 0; display: flex; justify-content: center; z-index: 15; }
      .pop-row { top: 160px; gap: 26px; padding-left: 100px; }
      #scene-intro .pop-row { top: 130px; padding-left: 0; }
      .pop-card, .big-card { background: #fff; border: 7px solid var(--ink); border-radius: 36px; text-align: center; box-shadow: 0 10px 0 rgba(0,0,0,.18); }
      .pop-card { width: 190px; padding: 12px 0 10px; }
      .pop-card .em { font-size: 104px; line-height: 1.15; }
      .pop-card .lb { font-size: 42px; font-weight: 700; }
      .big-row { top: 150px; gap: 40px; }
      .big-card { width: 300px; padding: 14px 0 12px; }
      .big-card .em { font-size: 150px; line-height: 1.12; }
      .big-card .lb { font-size: 54px; font-weight: 700; color: var(--pink); }
      .quiz-row { top: 170px; gap: 60px; }
      .qcard { font-size: 96px; font-weight: 700; padding: 18px 64px 26px; background: #fff; border: 8px solid var(--ink); border-radius: 44px; box-shadow: 0 12px 0 rgba(0,0,0,.18); }
      .count { position: absolute; left: 0; right: 0; top: 380px; text-align: center; font-size: 300px; font-weight: 700; color: #fff;
        -webkit-text-stroke: 10px var(--ink); z-index: 30; opacity: 0; }

      .caption { position: absolute; left: 0; right: 0; bottom: 26px; display: flex; justify-content: center; z-index: 50; }
      .cap-in { position: relative; max-width: 1760px; padding: 16px 44px 20px; background: #fff; border: 7px solid var(--ink); border-radius: 44px;
        font-size: 52px; font-weight: 600; text-align: center; box-shadow: 0 10px 0 rgba(0,0,0,.18); }
      .who { position: absolute; top: -40px; left: 32px; padding: 2px 24px 6px; font-size: 32px; font-weight: 700; color: #fff; border: 5px solid var(--ink); border-radius: 22px; }
      .hl-noun { color: #8e5cf5; font-weight: 700; }
      .hl-kind { color: var(--pink); font-weight: 700; }

      /* title */
      .title-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 120px; z-index: 10; }
      .title-top { font-size: 92px; font-weight: 700; color: #fff; -webkit-text-stroke: 4px var(--ink); }
      .title-word { display: flex; gap: 8px; margin: -10px 0 0; }
      .tl { display: inline-block; font-size: 280px; font-weight: 700; line-height: 1.05; color: #fff; -webkit-text-stroke: 10px var(--ink); text-shadow: 0 16px 0 rgba(0,0,0,.2); }
      .tl:nth-child(1) { color: #8e5cf5; } .tl:nth-child(2) { color: #ff5fa2; } .tl:nth-child(3) { color: #ffd23f; } .tl:nth-child(4) { color: #3bceac; } .tl:nth-child(5) { color: #2f8cff; }
      .title-sub { font-size: 110px; letter-spacing: 30px; }

      /* outro */
      .confetti { position: absolute; inset: 0; z-index: 25; pointer-events: none; }
      .cf { position: absolute; top: -60px; border-radius: 4px; }
      .end-text { position: absolute; left: 0; right: 0; top: 170px; text-align: center; font-size: 140px; font-weight: 700; color: #fff; -webkit-text-stroke: 7px var(--ink); z-index: 20; }

      #wipe { position: absolute; left: 50%; top: 50%; width: 2400px; height: 2400px; margin: -1200px 0 0 -1200px; border-radius: 50%;
        background: var(--yellow); border: 60px solid var(--pink); z-index: 100; transform: scale(0); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{{TOTAL}}" data-width="1920" data-height="1080">
{{SCENES}}
    {{CAPTIONS}}
    <div id="wipe"></div>
    {{AUDIO}}
    </div>
    <script>
      const DATA = {{DATA}};
      const tl = gsap.timeline({ paused: true });
      const $ = (s, r = document) => r.querySelector(s);
      const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

      function rig(id) {
        const el = document.getElementById(id);
        return {
          el, bob: $(".char-bob", el), armL: $(".arm.l", el), armR: $(".arm.r", el),
          mouth: $(".mouth", el), lids: $$(".lid", el),
        };
      }

      // ---------- title ----------
      tl.fromTo(".title-top", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.5)" }, 0.15);
      tl.fromTo(".tl", { y: -700, rotation: -25 }, { y: 0, rotation: 0, duration: 0.9, stagger: 0.13, ease: "bounce.out" }, 0.35);
      tl.to(".tl", { y: -40, duration: 0.25, stagger: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, 2.0);
      tl.fromTo(".title-sub", { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(2)" }, 1.6);

      DATA.scenes.forEach((sc, si) => {
        const S = sc.start, E = sc.start + sc.dur, sid = sc.id;
        const root = document.getElementById("scene-" + sid);

        // background life
        $$(".cloud", root).forEach((c, i) => tl.fromTo(c, { x: 0 }, { x: 90 + i * 40, duration: sc.dur, ease: "none" }, S));
        tl.fromTo($(".rays", root), { rotation: 0 }, { rotation: sc.dur * 14, duration: sc.dur, ease: "none" }, S);

        // scene wipe
        if (si > 0) {
          tl.fromTo("#wipe", { scale: 0 }, { scale: 1, duration: 0.35, ease: "power2.in" }, S - 0.35);
          tl.to("#wipe", { scale: 0, duration: 0.45, ease: "power2.out" }, S);
        }

        const badge = $(".badge", root);
        if (badge) {
          gsap.set(badge, { xPercent: -50 });
          tl.fromTo(badge, { y: -200 }, { y: 0, duration: 0.7, ease: "back.out(2)" }, S + 0.25);
        }
        if (!sc.chars) return;

        // characters: entrance, idle bob, blinks
        const enterAt = {};
        sc.lines.forEach((ln) => { if (ln.enter) enterAt[ln.speaker] = ln.start - 0.9; });
        sc.chars.forEach(([name], i) => {
          const r = rig(sid + "-" + name);
          gsap.set([r.armL], { rotation: 24 });
          gsap.set([r.armR], { rotation: -24 });
          gsap.set(r.mouth, { scaleY: 0.25 });
          const t0 = enterAt[name] ?? S + 0.1 + i * 0.12;
          tl.fromTo(r.el, { scale: 0, y: 240, transformOrigin: "50% 100%" },
            { scale: 1, y: 0, duration: 0.75, ease: "back.out(1.7)" }, t0);
          const per = 0.62, n = Math.max(1, Math.floor((E - t0) / per));
          tl.to(r.bob, { y: -12, duration: per, repeat: n - (n % 2 ? 0 : 1), yoyo: true, ease: "sine.inOut" }, t0 + 0.75 + i * 0.2);
          for (let t = t0 + 1.3 + i * 0.57; t < E - 0.4; t += 2.9) {
            tl.to(r.lids, { scaleY: 1, duration: 0.07, yoyo: true, repeat: 1, ease: "none" }, t);
          }
        });

        sc.lines.forEach((ln, li) => {
          const T = ln.start;
          if (ln.speaker === "pause") {
            for (let k = 0; k < 3; k++) {
              const c = "#" + sid + "-count" + k, t = T + 0.2 + k * 1.1;
              tl.fromTo(c, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(3)" }, t);
              tl.to(c, { scale: 1.5, opacity: 0, duration: 0.25 }, t + 0.8);
            }
            return;
          }
          // caption
          const cap = $("#cap-" + sid + "-" + li + " .cap-in");
          tl.fromTo(cap, { y: 60, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, T);
          tl.to(cap, { opacity: 0, y: 20, duration: 0.2 }, T + ln.hold - 0.22);

          ln.clips.forEach((cl) => {
            const r = rig(sid + "-" + cl.who);
            const step = 1 / 15;
            cl.env.forEach((v, k) => {
              tl.to(r.mouth, { scaleY: 0.25 + 0.75 * v, duration: step, ease: "none" }, T + k * step);
            });
            tl.to(r.mouth, { scaleY: 0.25, duration: 0.12 }, T + cl.env.length * step);
            // talking squash + gesture
            const reps = Math.max(1, Math.round(cl.dur / 0.28)) | 1;
            tl.to(r.bob, { scaleY: 1.035, scaleX: 0.975, transformOrigin: "50% 100%", duration: 0.28, yoyo: true, repeat: reps, ease: "sine.inOut" }, T);
            tl.to(r.armL, { rotation: 55, duration: 0.35, yoyo: true, repeat: Math.max(1, Math.round(cl.dur / 0.35)) | 1, ease: "sine.inOut" }, T);
            if (ln.act === "wave") {
              tl.to(r.armR, { rotation: -150, duration: 0.3, ease: "power2.out" }, T);
              tl.to(r.armR, { rotation: -115, duration: 0.2, yoyo: true, repeat: 5, ease: "sine.inOut" }, T + 0.3);
              tl.to(r.armR, { rotation: -24, duration: 0.35, ease: "power2.inOut" }, T + 1.5);
            }
            if (ln.act === "jump") {
              tl.to(r.el, { y: -150, duration: 0.32, yoyo: true, repeat: 3, ease: "power2.out" }, T);
            }
          });

          (ln.pops || []).forEach((p, k) => {
            tl.fromTo("#" + sid + "-" + li + "-pop" + k, { scale: 0, rotation: -20, opacity: 0 },
              { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: "back.out(2.2)" }, p.at);
          });
          (ln.big || []).forEach((p, k) => {
            tl.fromTo("#" + sid + "-" + li + "-big" + k, { scale: 0, y: 80, opacity: 0 },
              { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(2)" }, p.at);
            tl.to("#" + sid + "-" + li + "-big" + k, { rotation: k % 2 ? 4 : -4, duration: 0.3, yoyo: true, repeat: 1 }, p.at + 0.6);
          });
          if (ln.quiz) {
            tl.fromTo(".qcard", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.25, ease: "back.out(2.2)" }, T + 0.6);
            tl.to(".qcard", { rotation: 3, duration: 0.25, yoyo: true, repeat: 7, stagger: 0.1, ease: "sine.inOut" }, T + ln.dur + 0.4);
          }
          if (ln.answer) {
            tl.to("#q-ball", { scale: 1.25, backgroundColor: "#7ee07e", duration: 0.4, ease: "back.out(3)" }, T - 0.25);
            tl.to(["#q-jump", "#q-happy"], { opacity: 0.3, scale: 0.85, duration: 0.4 }, T - 0.25);
          }
        });

        if (sid === "outro") {
          const bye = sc.lines[sc.lines.length - 1];
          tl.fromTo(".end-text", { scale: 0, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2.5)" }, bye.start - 0.2);
          $$(".cf", root).forEach((c) => {
            const d = +c.dataset.d, sp = +c.dataset.sp;
            tl.fromTo(c, { y: 0, x: 0, rotation: 0 }, { y: 1250, x: +c.dataset.dx, rotation: +c.dataset.r, duration: sp, ease: "power1.in" }, bye.start - 0.4 + d);
          });
          gsap.set(".end-text", { scale: 0 });
        }
      });

      tl.set({}, {}, DATA.total);
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
