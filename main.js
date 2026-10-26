/* V1 — Basalt Grid: page behaviour */
HV.ready(({ gsap, ScrollTrigger, ease, $$, data, reduce, canHover }) => {
  const nav = document.querySelector('.ui-layer .nav');

  /* nav colour follows the section under it */
  const dark = ['hero', 'depth', 'contact'];
  $$('main .vp[data-sec]').forEach((vp) => ScrollTrigger.create({
    trigger: vp, start: 'top 40px', end: 'bottom 40px',
    onToggle: (s) => s.isActive && nav.classList.toggle('is-ink', !dark.includes(vp.dataset.sec)),
  }));
  HV.linkNav('.ui-layer .nav__links .mono, .menu__links li');

  /* reveals */
  HV.lines('main .t-hero:not(.hero__title), main .contact .t-xxl');
  HV.chars('main .lead .t-xl');
  HV.count('.stat .t-num, .impact__nums .t-num, .feature__data .t-l');
  HV.parallax('.about__img img, .impact__img img, .careers__img img, .feature > img');
  HV.fadeUp('.services__grid, .stats, .plist, .roles, .impact__nums', { children: true, y: 30 });
  if (!reduce) {
    gsap.from('.bar i', { width: 0, duration: 1.4, ease, stagger: 0.12, scrollTrigger: { trigger: '.bars', start: 'top 85%', once: true } });
    gsap.to('.hero__bg img', { scale: 1.12, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* hover states */
  HV.flipHover('.btn');
  HV.hover('.svc');
  HV.hover('.role');
  HV.hover('.card-sm', 'is-hover', '.card-sm__btn');
  HV.hover('.menu__links li');

  /* projects: row highlight + thumbnail that follows the cursor */
  const list = document.querySelector('.plist');
  if (list && canHover) {
    const float = document.createElement('div');
    float.className = 'pfloat';
    float.innerHTML = '<img alt="">';
    list.parentElement.appendChild(float);
    const img = float.querySelector('img');
    const qx = gsap.quickTo(float, 'x', { duration: 0.6, ease: 'power3' });
    const qy = gsap.quickTo(float, 'y', { duration: 0.6, ease: 'power3' });
    const box = () => list.parentElement.getBoundingClientRect();
    list.addEventListener('pointermove', (e) => { const b = box(); qx(e.clientX - b.left - float.offsetWidth / 2); qy(e.clientY - b.top - float.offsetHeight * 0.75); });
    $$('.prow', list).forEach((row, i) => {
      row.addEventListener('pointerenter', () => { row.classList.add('is-hover'); img.src = data.projects[i].img; gsap.to(float, { opacity: 1, rotate: -3, scale: 1, duration: 0.4, ease }); });
      row.addEventListener('pointerleave', () => row.classList.remove('is-hover'));
    });
    list.addEventListener('pointerleave', () => gsap.to(float, { opacity: 0, scale: 0.9, duration: 0.3 }));
  }

  /* depth: pinned for 3 screens, scroll drives 0 → 5 100 m */
  const sec = document.querySelector('.depth');
  if (sec) {
    const L = data.layers;
    const bounds = [0, 300, 900, 2200, 3500, 5100];
    const temps = [10, 45, 110, 240, 300, 400];
    const imgs = $$('.depth__bg img', sec);
    const rows = $$('.layer', sec);
    const num = sec.querySelector('.depth__count .t-xxl').firstChild;
    const temp = sec.querySelector('.depth__temp b');
    const label = sec.querySelector('.depth__desc > .mono');
    const desc = sec.querySelector('.depth__desc p');
    const bars = $$('.depth__progress i', sec);
    const ticks = $$('.gauge i', sec);
    const pin = sec.querySelector('.gauge__pin');
    const pinLabel = pin.querySelector('span');
    let active = -1;
    const update = (p) => {
      const m = p * 5100;
      let i = 4;
      for (let k = 0; k < 5; k++) if (m < bounds[k + 1]) { i = k; break; }
      const shown = HV.fmt(Math.round(m / 10) * 10);
      num.nodeValue = shown;
      pinLabel.textContent = shown + ' m';
      temp.textContent = (m > 5050 ? '400+' : Math.round(HV.interp(m, bounds, temps))) + ' °C';
      pin.style.top = p * 100 + '%';
      pin.style.transform = `translateY(-${p * 100}%)`;
      ticks.forEach((t, k) => t.classList.toggle('is-done', k / (ticks.length - 1) <= p));
      if (i !== active) {
        active = i;
        rows.forEach((r, k) => { r.classList.toggle('is-on', k === i); r.classList.toggle('is-past', k < i); });
        bars.forEach((b, k) => b.classList.toggle('is-on', k <= i));
        imgs.forEach((im, k) => { im.style.opacity = k === i ? 1 : 0; });
        label.textContent = `0${i + 1} / 05 — ${L[i].t}`;
        desc.textContent = L[i].d;
      }
    };
    HV.pin(sec, 3, update);
    update(0);
  }

  /* menu: circle grows from the burger, links rise one by one */
  HV.menu({
    openers: '.ui-layer .nav__right',
    closers: '.nav__right',
    build: (layer) => gsap.timeline()
      .to(layer.querySelector('.menu'), { clipPath: 'circle(150% at calc(100% - 3.5em) 3em)', duration: 0.8, ease })
      .from($$('.menu__links li', layer), { yPercent: 60, opacity: 0, duration: 0.6, stagger: 0.05, ease }, '-=0.45')
      .from(layer.querySelector('.menu__side'), { opacity: 0, y: 20, duration: 0.5 }, '-=0.4'),
  });

  /* loader → hero intro */
  HV.loader(() => {
    HV.lines('.hero__title', { trigger: false });
    if (!reduce) gsap.from('.hero__side, .hero__top', { opacity: 0, y: 24, duration: 1, stagger: 0.1, ease, delay: 0.3 });
  });
});
