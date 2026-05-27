/* ===========================================================
   FORGE INFO 698 — emberPulse.js
   Reusable canvas effect: red heat band with rising embers and slow pulse.

   Usage:
     <canvas id="my-canvas"></canvas>
     <script src="assets/js/effects/emberPulse.js"></script>
     <script>
       EmberPulse.attach(document.getElementById('my-canvas'), {
         intensity: 2.5,
         emberRate: 2.1,
         pulse: 0.95,
       });
     </script>

   The attach() function sets up the canvas with retina-correct sizing,
   starts a requestAnimationFrame loop, and returns a controller with:
     - setOption(key, value)  - change a knob at runtime
     - stop()                 - cancel the animation loop
     - canvas                 - reference to the canvas element

   Honors prefers-reduced-motion (renders one frame and stops).
   =========================================================== */

(function (global) {
  'use strict';

  const DEFAULTS = {
    intensity: 2.50,   // overall brightness multiplier
    emberRate: 2.10,   // ember spawns per ~100ms
    pulse:     0.95,   // pulse amplitude (0 = no pulse, 1 = strong)
  };

  function attach(canvas, options) {
    if (!canvas || canvas.tagName !== 'CANVAS') {
      console.error('EmberPulse.attach: first argument must be a <canvas>');
      return null;
    }

    const opts = Object.assign({}, DEFAULTS, options || {});
    const reduceMotion = window.matchMedia &&
                        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- canvas sizing (retina-correct) ----
    let w = 0, h = 0;
    const ctx = canvas.getContext('2d');

    function fit() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();

    const resizeObserver = ('ResizeObserver' in window)
      ? new ResizeObserver(fit)
      : null;
    if (resizeObserver) resizeObserver.observe(canvas);
    else window.addEventListener('resize', fit);

    // ---- simulation state ----
    const embers = [];
    let phase = 0;
    let spawnAcc = 0;
    let lastT = performance.now();
    let rafId = null;
    let stopped = false;

    function step(now) {
      const dt = Math.min(50, now - lastT);
      lastT = now;
      phase += dt * 0.001;

      const pulseBright = 1 + Math.sin(phase * 1.4) * opts.pulse * 0.35;

      // White clear
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      // ---- heat band: red gradient rising from the bottom ----
      ctx.globalCompositeOperation = 'multiply';
      const bandGrad = ctx.createLinearGradient(0, h, 0, 0);
      bandGrad.addColorStop(0,    `rgba(220, 60, 40,  ${0.55 * opts.intensity * pulseBright})`);
      bandGrad.addColorStop(0.4,  `rgba(232, 90, 60,  ${0.32 * opts.intensity * pulseBright})`);
      bandGrad.addColorStop(0.75, `rgba(232, 130, 90, ${0.12 * opts.intensity * pulseBright})`);
      bandGrad.addColorStop(1,    `rgba(232, 130, 90, 0)`);
      ctx.fillStyle = bandGrad;
      ctx.fillRect(0, 0, w, h);

      // ---- embers ----
      ctx.globalCompositeOperation = 'lighter';
      spawnAcc += opts.emberRate * dt / 100;
      while (spawnAcc >= 1) {
        spawnAcc -= 1;
        embers.push({
          x: Math.random() * w,
          y: h * (0.85 + Math.random() * 0.1),
          vy: -(0.4 + Math.random() * 0.6),
          vx: (Math.random() - 0.5) * 0.3,
          life: 0,
          maxLife: 60 + Math.random() * 60,
          size: 1.5 + Math.random() * 2.5,
        });
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life += dt / 16.67;
        if (e.life >= e.maxLife) { embers.splice(i, 1); continue; }
        e.x += e.vx;
        e.y += e.vy;
        e.vx += (Math.random() - 0.5) * 0.03;
        const t = e.life / e.maxLife;
        const alpha = (1 - t) * 0.85 * opts.intensity;
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3);
        grad.addColorStop(0,   `rgba(255, 200, 120, ${alpha})`);
        grad.addColorStop(0.4, `rgba(255, 120, 60,  ${alpha * 0.6})`);
        grad.addColorStop(1,   `rgba(255, 60, 30,   0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';

      if (!stopped) rafId = requestAnimationFrame(step);
    }

    if (reduceMotion) {
      step(performance.now());  // render one frame, no loop
    } else {
      rafId = requestAnimationFrame(step);
    }

    // ---- controller ----
    return {
      canvas: canvas,
      setOption: function (key, value) {
        if (key in opts) opts[key] = value;
      },
      getOption: function (key) {
        return opts[key];
      },
      stop: function () {
        stopped = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener('resize', fit);
      },
    };
  }

  // ---- export ----
  global.EmberPulse = {
    attach: attach,
    DEFAULTS: DEFAULTS,
  };

})(window);
