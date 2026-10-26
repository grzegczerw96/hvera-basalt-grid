/* =====================================================================
   HVERA — shared runtime (all three versions)
   Lenis smooth scroll → ScrollTrigger, SplitText reveals, counters, parallax,
   hover-state classes (the same .is-hover / .is-h states drawn in the Figma design system),
   pins, menu and loader timelines. Version scripts call HV.ready(fn).
   ===================================================================== */
(function () {
  const { gsap, ScrollTrigger, SplitText, CustomEase, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

  const ease = CustomEase.create('hvMain', 'M0,0 C0.6,0 0,1 1,1'); // = cubic-bezier(.6, 0, 0, 1)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (sel, root = document) => (typeof sel === 'string' ? [...root.querySelectorAll(sel)] : sel ? [].concat(sel) : []);

  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.125, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const HV = (window.HV = { gsap, ScrollTrigger, ease, reduce, canHover, lenis, $$ });
  HV.data = window.HV_DATA || {};

  HV.fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  // piecewise-linear interpolation through (xs, ys)
  HV.interp = (x, xs, ys) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + ((x - xs[i - 1]) / (xs[i] - xs[i - 1])) * (ys[i] - ys[i - 1]);
    return ys[ys.length - 1];
  };
  HV.scrollTo = (target) => (lenis ? lenis.scrollTo(target, { duration: 1.4 }) : (typeof target === 'number' ? scrollTo(0, target) : target.scrollIntoView()));

  /* ---------- reveals ---------- */
  // title lines slide up out of a mask; re-split on resize (autoSplit), play once
  HV.lines = (sel, opts = {}) => $$(sel).forEach((el) => {
    if (reduce) return;
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'ln', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 1.2, stagger: 0.08, ease, delay: opts.delay || 0,
        scrollTrigger: opts.trigger === false ? undefined : { trigger: el, start: 'top 88%', once: true },
      }),
    });
  });
  // lead paragraphs: each character goes .2 → 1 opacity, scrubbed (cominvi pattern)
  HV.chars = (sel) => $$(sel).forEach((el) => {
    if (reduce) return;
    const split = SplitText.create(el, { type: 'words,chars' });
    gsap.fromTo(split.chars, { opacity: 0.2 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: true } });
  });
  // numbers: count up from 0 keeping the original format ("5,1", "1 600", "97,6%")
  HV.count = (sel) => $$(sel).forEach((el) => {
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!node || reduce) return;
    const raw = node.nodeValue;
    const m = raw.match(/[\d\s]*\d(?:,\d+)?/);
    if (!m) return;
    const decimals = (m[0].split(',')[1] || '').length;
    const target = parseFloat(m[0].replace(/\s/g, '').replace(',', '.'));
    const o = { v: 0 };
    const out = () => { const s = o.v.toFixed(decimals).replace('.', ','); node.nodeValue = raw.replace(m[0], decimals ? s : HV.fmt(o.v)); };
    out();
    gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: out, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  // images settle from 1.15 to 1 while their frame crosses the screen
  HV.parallax = (sel, from = 1.15) => $$(sel).forEach((img) => {
    if (reduce) return;
    gsap.fromTo(img, { scale: from }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  HV.fadeUp = (sel, opts = {}) => $$(sel).forEach((el) => {
    if (reduce) return;
    gsap.from(el.children.length && opts.children ? el.children : el, { y: opts.y || 40, opacity: 0, duration: 1, stagger: 0.08, ease, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  /* ---------- hover states (classes come from the design system) ---------- */
  HV.hover = (sel, cls = 'is-hover', target) => {
    if (!canHover) return;
    $$(sel).forEach((el) => {
      const t = target ? el.querySelector(target) || el : el;
      el.addEventListener('pointerenter', () => t.classList.add(cls));
      el.addEventListener('pointerleave', () => t.classList.remove(cls));
    });
  };
  // layout-changing hover (button arrow moves to the other side): toggle the class, then FLIP the children
  HV.flipHover = (sel, cls = 'is-h') => {
    if (!canHover) return;
    $$(sel).forEach((el) => {
      const kids = [...el.children];
      const flip = (on) => {
        const before = kids.map((k) => k.getBoundingClientRect().left);
        el.classList.toggle(cls, on);
        kids.forEach((k, i) => gsap.fromTo(k, { x: before[i] - k.getBoundingClientRect().left }, { x: 0, duration: 0.5, ease }));
      };
      el.addEventListener('pointerenter', () => flip(true));
      el.addEventListener('pointerleave', () => flip(false));
    });
  };

  /* ---------- pin: section stays while scroll drives progress 0 → 1 ---------- */
  HV.pin = (section, screens, onUpdate) => {
    const vp = section.closest('.vp');
    return ScrollTrigger.create({
      trigger: vp, pin: true, start: 'top top', end: () => '+=' + (screens - 1) * innerHeight, scrub: true,
      onUpdate: (self) => onUpdate(self.progress), onRefresh: (self) => onUpdate(self.progress),
    });
  };

  /* ---------- menu ---------- */
  HV.menu = ({ openers, closers, build }) => {
    const layer = document.querySelector('.menu-layer');
    if (!layer) return;
    const tl = build(layer).pause();
    let open = false;
    const set = (v) => {
      open = v;
      if (v) { layer.style.visibility = 'visible'; layer.classList.add('is-open'); lenis && lenis.stop(); tl.timeScale(1).play(); }
      else { lenis && lenis.start(); tl.timeScale(1.6).reverse().eventCallback('onReverseComplete', () => { layer.style.visibility = 'hidden'; layer.classList.remove('is-open'); }); }
    };
    $$(openers).forEach((b) => b.addEventListener('click', () => set(!open)));
    $$(closers, layer).forEach((b) => b.addEventListener('click', () => set(false)));
    addEventListener('keydown', (e) => e.key === 'Escape' && open && set(false));
    HV.closeMenu = () => open && set(false);
  };

  // nav labels → sections (labels are plain words: About, Services, Depth …)
  HV.linkNav = (sel) => $$(sel).forEach((el) => {
    const key = el.textContent.trim().toLowerCase().replace(/^\[\d+\]\s*/, '');
    const vp = document.querySelector(`main .vp[data-sec="${key === 'home' ? 'hero' : key}"]`);
    if (!vp) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => { HV.closeMenu && HV.closeMenu(); HV.scrollTo(vp); });
  });

  /* ---------- loader → intro ---------- */
  HV.loader = (intro) => {
    const el = document.querySelector('.loader');
    if (!el || reduce) { el && el.remove(); intro && intro(); return; }
    lenis && lenis.stop();
    gsap.timeline({ onComplete: () => { el.remove(); lenis && lenis.start(); } })
      .from(el.querySelector('svg'), { scale: 0.6, opacity: 0, duration: 0.6, ease })
      .to(el.querySelector('svg'), { opacity: 0, duration: 0.3 }, '+=0.25')
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease }, '-=0.1')
      .add(() => intro && intro(), '-=0.7');
  };

  HV.ready = (fn) => {
    const go = () => { fn(HV); ScrollTrigger.refresh(); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  };
})();
