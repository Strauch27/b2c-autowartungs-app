/**
 * Multi-Browser Demo Helpers
 *
 * Infrastructure for running 3 separate browser windows side-by-side:
 *   - Customer (Phone, x=0, 360x720)
 *   - Jockey  (Phone, x=380, 360x720)
 *   - Workshop (Desktop, x=760, 660x750)
 *
 * Each browser is a separate chromium.launch() — not contexts/tabs.
 * This guarantees separate OS-level windows for presentation.
 *
 * Layout targets ~1440px total width (fits MacBook 14").
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Role = 'customer' | 'jockey' | 'workshop';

export interface DemoWindow {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  role: Role;
}

export interface DemoWindows {
  customer: DemoWindow;
  jockey: DemoWindow;
  workshop: DemoWindow;
}

// ---------------------------------------------------------------------------
// Layout constants — fits ~1440px width (MacBook 14")
// Phone viewports use 360px, Workshop gets remaining space.
// ---------------------------------------------------------------------------

const WINDOW_SPECS: Record<Role, {
  x: number; y: number;
  width: number; height: number;
  viewport: { width: number; height: number };
}> = {
  customer: {
    x: 0, y: 0,
    width: 380, height: 870,
    viewport: { width: 360, height: 720 },
  },
  jockey: {
    x: 380, y: 0,
    width: 380, height: 870,
    viewport: { width: 360, height: 720 },
  },
  workshop: {
    x: 760, y: 0,
    width: 680, height: 870,
    viewport: { width: 660, height: 750 },
  },
};

// Role colors
export const ROLE_COLORS: Record<Role, string> = {
  customer: '#3b82f6',
  jockey:   '#a855f7',
  workshop: '#10b981',
};

// Role labels for banners
const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  jockey:   'Jockey',
  workshop: 'Workshop',
};

// ---------------------------------------------------------------------------
// Screenshot state
// ---------------------------------------------------------------------------
let multiScreenshotCount = 0;

export function resetScreenshotCount() {
  multiScreenshotCount = 0;
}

// ---------------------------------------------------------------------------
// Core: Launch & Close
// ---------------------------------------------------------------------------

export async function launchDemoWindows(slowMo?: number): Promise<DemoWindows> {
  const effectiveSlowMo = slowMo ?? 200;

  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  const windows: Partial<DemoWindows> = {};

  for (const role of roles) {
    const spec = WINDOW_SPECS[role];
    const browser = await chromium.launch({
      headless: false,
      slowMo: effectiveSlowMo,
      args: [
        `--window-position=${spec.x},${spec.y}`,
        `--window-size=${spec.width},${spec.height}`,
        '--disable-infobars',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    });

    const context = await browser.newContext({
      viewport: spec.viewport,
      locale: 'en-US',
      timezoneId: 'Europe/Berlin',
    });

    const page = await context.newPage();

    windows[role] = { browser, context, page, role };
  }

  return windows as DemoWindows;
}

export async function closeDemoWindows(windows: DemoWindows) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  for (const role of roles) {
    try {
      await windows[role].context.close();
      await windows[role].browser.close();
    } catch {
      // Ignore close errors
    }
  }
}

// ---------------------------------------------------------------------------
// Global CSS — inject smooth-scroll and transition defaults into every page
// ---------------------------------------------------------------------------

const GLOBAL_DEMO_CSS = `
  html { scroll-behavior: smooth !important; }
  * { scroll-behavior: smooth !important; }
`;

async function injectGlobalCSS(page: Page) {
  await page.evaluate((css) => {
    if (document.getElementById('demo-global-css')) return;
    const style = document.createElement('style');
    style.id = 'demo-global-css';
    style.textContent = css;
    document.head.appendChild(style);
  }, GLOBAL_DEMO_CSS).catch(() => {});
}

/** Call once per window — injects global CSS and re-injects on every navigation */
export function setupGlobalCSS(windows: DemoWindows) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  for (const role of roles) {
    const page = windows[role].page;
    injectGlobalCSS(page);
    page.on('load', () => injectGlobalCSS(page).catch(() => {}));
  }
}

// ---------------------------------------------------------------------------
// Smooth scroll helper — replaces the old scrollTo with an animated version
// ---------------------------------------------------------------------------

export async function smoothScrollTo(page: Page, locator: ReturnType<Page['locator']>) {
  try {
    await locator.evaluate((el: Element) => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  } catch {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
  }
  await page.waitForTimeout(400);
}

// ---------------------------------------------------------------------------
// Dimming Overlay — marks inactive windows
// ---------------------------------------------------------------------------

export async function setActiveRole(windows: DemoWindows, activeRole: Role) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];

  const promises = roles.map(async (role) => {
    const page = windows[role].page;
    const isActive = role === activeRole;

    await page.evaluate(({ isActive, color, label }) => {
      let overlay = document.getElementById('demo-dim-overlay');
      if (isActive) {
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
        }
        return;
      }
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'demo-dim-overlay';
        document.body.appendChild(overlay);
      }
      overlay.style.cssText = `position:fixed; inset:0; z-index:99990;
        background:linear-gradient(135deg, ${color}44, ${color}22);
        backdrop-filter:blur(1px); opacity:0; pointer-events:none;
        transition:opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);`;
      overlay.innerHTML = `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
        color:white; font-family:'Inter',system-ui,sans-serif; font-size:20px; font-weight:600;
        text-shadow:0 2px 20px rgba(0,0,0,0.4); opacity:0.7; letter-spacing:3px;
        text-transform:uppercase;">${label}</div>`;
      // Trigger reflow then animate in
      void overlay.offsetHeight;
      overlay.style.opacity = '1';
    }, { isActive, color: ROLE_COLORS[role], label: ROLE_LABELS[role] }).catch(() => {});
  });

  await Promise.all(promises);
}

export async function clearAllDimming(windows: DemoWindows) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  await Promise.all(roles.map(async (role) => {
    await windows[role].page.evaluate(() => {
      const overlay = document.getElementById('demo-dim-overlay');
      if (overlay) overlay.style.opacity = '0';
    }).catch(() => {});
  }));
}

// ---------------------------------------------------------------------------
// Dashboard Refresh — reload all 3 dashboards after state changes
// ---------------------------------------------------------------------------

export async function refreshAllDashboards(
  windows: DemoWindows,
  locale: string,
  bookingId: string,
  tokens: { customer: string; jockey: string; workshop: string },
) {
  await Promise.all([
    refreshSingleDashboard(windows.customer, locale, 'customer', bookingId, tokens.customer),
    refreshSingleDashboard(windows.jockey, locale, 'jockey', bookingId, tokens.jockey),
    refreshSingleDashboard(windows.workshop, locale, 'workshop', bookingId, tokens.workshop),
  ]);
}

async function refreshSingleDashboard(
  win: DemoWindow,
  locale: string,
  role: Role,
  bookingId: string,
  token: string,
) {
  const page = win.page;
  const dashboardUrls: Record<Role, string> = {
    customer: `/${locale}/customer/dashboard`,
    jockey:   `/${locale}/jockey/dashboard`,
    workshop: `/${locale}/workshop/dashboard`,
  };

  const tokenKey = `auth_token_${role}`;
  await page.evaluate(([t, k]) => localStorage.setItem(k, t), [token, tokenKey] as const);
  await page.goto(dashboardUrls[role]);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

export async function refreshSelectiveDashboards(
  windows: DemoWindows,
  locale: string,
  roles: Role[],
  bookingId: string,
  tokens: { customer: string; jockey: string; workshop: string },
) {
  await Promise.all(roles.map((role) =>
    refreshSingleDashboard(windows[role], locale, role, bookingId, tokens[role]),
  ));
}

// ---------------------------------------------------------------------------
// Token injection & navigation
// ---------------------------------------------------------------------------

export async function injectTokenAndNavigate(
  page: Page,
  token: string,
  locale: string,
  url: string,
) {
  await page.goto(`/${locale}`);
  const parts = url.split('/');
  const urlRole = parts.find(p => ['customer', 'jockey', 'workshop'].includes(p)) || '';
  const key = urlRole ? `auth_token_${urlRole}` : 'auth_token';
  await page.evaluate(([t, k]) => localStorage.setItem(k, t), [token, key] as const);
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

// ---------------------------------------------------------------------------
// Narration — Phase Banner & Step Banner (on active window only)
// Polished glass-morphism design with smooth entrance/exit animations.
// ---------------------------------------------------------------------------

export async function showPhaseBannerOnActive(
  windows: DemoWindows,
  activeRole: Role,
  phase: string,
  narration: string,
  color: string,
) {
  const page = windows[activeRole].page;
  const isPhone = activeRole !== 'workshop';

  await page.evaluate(({ phase, narration, color, isPhone }) => {
    const stepBanner = document.getElementById('demo-step-banner');
    if (stepBanner) {
      stepBanner.style.opacity = '0';
      stepBanner.style.transform = 'translateX(-50%) translateY(-8px)';
    }

    let banner = document.getElementById('demo-phase-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-phase-banner';
      document.body.appendChild(banner);
    }
    const titleSize = isPhone ? '13px' : '15px';
    const narrationSize = isPhone ? '10px' : '11px';
    const pad = isPhone ? '12px 20px' : '16px 32px';

    banner.style.cssText = `position:fixed; top:12px; left:50%; z-index:99999;
      transform:translateX(-50%) translateY(-12px) scale(0.97);
      padding:${pad}; border-radius:16px; color:white;
      font-family:'Inter',system-ui,-apple-system,sans-serif; text-align:center;
      opacity:0; pointer-events:none; max-width:88%;
      transition:all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      background:linear-gradient(135deg, ${color}ee, ${color}cc);
      backdrop-filter:blur(20px) saturate(1.5);
      box-shadow:0 8px 40px ${color}44, 0 2px 8px rgba(0,0,0,0.15),
                 inset 0 1px 0 rgba(255,255,255,0.15);
      border:1px solid rgba(255,255,255,0.12);`;

    banner.innerHTML = `
      <div style="font-size:9px;opacity:0.7;letter-spacing:3px;font-weight:500;text-transform:uppercase">DEMO</div>
      <div style="font-size:${titleSize};font-weight:700;margin:6px 0 4px;letter-spacing:-0.2px;line-height:1.3">${phase}</div>
      <div style="font-size:${narrationSize};opacity:0.85;line-height:1.5;font-weight:400">${narration}</div>`;

    void banner.offsetHeight;
    banner.style.opacity = '1';
    banner.style.transform = 'translateX(-50%) translateY(0) scale(1)';
  }, { phase, narration, color, isPhone });
}

export async function hidePhaseBannerOnActive(windows: DemoWindows, activeRole: Role) {
  await windows[activeRole].page.evaluate(() => {
    const banner = document.getElementById('demo-phase-banner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateX(-50%) translateY(-12px) scale(0.97)';
    }
  }).catch(() => {});
}

export async function showStepOnActive(
  windows: DemoWindows,
  activeRole: Role,
  text: string,
  color: string,
  actionMs: number,
) {
  const page = windows[activeRole].page;
  const isPhone = activeRole !== 'workshop';
  const fontSize = isPhone ? '10px' : '11.5px';
  const pad = isPhone ? '7px 16px' : '8px 22px';

  await page.evaluate(({ text, color, fontSize, pad }) => {
    let banner = document.getElementById('demo-step-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'demo-step-banner';
      document.body.appendChild(banner);
    }

    // Reset position for enter animation
    banner.style.cssText = `position:fixed; top:12px; left:50%; z-index:99998;
      transform:translateX(-50%) translateY(-8px);
      padding:${pad}; border-radius:10px; color:white;
      font-family:'Inter',system-ui,-apple-system,sans-serif; text-align:center;
      opacity:0; pointer-events:none; max-width:92%; font-size:${fontSize};
      font-weight:500; letter-spacing:0.1px; line-height:1.4;
      transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      background:linear-gradient(135deg, ${color}dd, ${color}bb);
      backdrop-filter:blur(16px) saturate(1.4);
      box-shadow:0 4px 24px ${color}33, 0 1px 4px rgba(0,0,0,0.1),
                 inset 0 1px 0 rgba(255,255,255,0.12);
      border:1px solid rgba(255,255,255,0.1);`;

    banner.textContent = text;

    void banner.offsetHeight;
    banner.style.opacity = '1';
    banner.style.transform = 'translateX(-50%) translateY(0)';
  }, { text, color, fontSize, pad });

  await page.waitForTimeout(actionMs);
}

// ---------------------------------------------------------------------------
// Screenshots — one per window with {counter}-{role}-{name}.png
// ---------------------------------------------------------------------------

async function hideOverlaysForScreenshot(page: Page) {
  await page.evaluate(() => {
    const phaseBanner = document.getElementById('demo-phase-banner');
    if (phaseBanner) phaseBanner.style.opacity = '0';
    const stepBanner = document.getElementById('demo-step-banner');
    if (stepBanner) stepBanner.style.opacity = '0';
    // Hide yellow dev overlays
    document.querySelectorAll('.bg-yellow-400, [class*="bg-yellow-"]').forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });
    const portal = document.querySelector('nextjs-portal');
    if (portal) (portal as HTMLElement).style.display = 'none';
    document.querySelectorAll('[data-nextjs-toast]').forEach(el => (el as HTMLElement).style.display = 'none');
  }).catch(() => {});
  await page.waitForTimeout(200);
}

export async function shotMulti(
  windows: DemoWindows,
  name: string,
  screenshotDir: string,
  roles?: Role[],
) {
  multiScreenshotCount++;
  const prefix = String(multiScreenshotCount).padStart(3, '0');
  const targetRoles = roles || (['customer', 'jockey', 'workshop'] as Role[]);

  await Promise.all(targetRoles.map(async (role) => {
    const page = windows[role].page;
    await hideOverlaysForScreenshot(page);

    const isPhone = role !== 'workshop';
    const filename = `${prefix}-${role}-${name}.png`;
    await page.screenshot({
      path: path.join(screenshotDir, filename),
      fullPage: !isPhone,
    });
    console.log(`    [screenshot] ${filename}`);
  }));
}

export async function shotActive(
  windows: DemoWindows,
  activeRole: Role,
  name: string,
  screenshotDir: string,
) {
  multiScreenshotCount++;
  const prefix = String(multiScreenshotCount).padStart(3, '0');
  const page = windows[activeRole].page;

  await hideOverlaysForScreenshot(page);

  const isPhone = activeRole !== 'workshop';
  const filename = `${prefix}-${activeRole}-${name}.png`;
  await page.screenshot({
    path: path.join(screenshotDir, filename),
    fullPage: !isPhone,
  });
  console.log(`    [screenshot] ${filename}`);
}

// ---------------------------------------------------------------------------
// Device Frame — REMOVED (was cosmetic phone bezel)
// These are now no-ops for backward compatibility with the spec file.
// ---------------------------------------------------------------------------

export async function injectDeviceFrames(_windows: DemoWindows) {
  // No-op: device frames removed
}

export function setupFrameReinjection(_windows: DemoWindows) {
  // No-op: device frames removed
}

// ---------------------------------------------------------------------------
// Role Label — persistent bottom-left label showing which portal this is
// Upgraded with better styling and smooth entrance animation.
// ---------------------------------------------------------------------------

async function injectSingleRoleLabel(page: Page, role: Role) {
  await page.evaluate(({ label, color }) => {
    let el = document.getElementById('demo-role-label');
    if (!el) {
      el = document.createElement('div');
      el.id = 'demo-role-label';
      el.style.opacity = '0';
      document.body.appendChild(el);
    }
    el.style.cssText = `position:fixed; bottom:10px; left:10px; z-index:99995;
      padding:5px 14px; border-radius:8px; color:white;
      font-family:'Inter',system-ui,-apple-system,sans-serif;
      font-size:11px; font-weight:600; letter-spacing:0.8px; text-transform:uppercase;
      pointer-events:none; opacity:0;
      transition:opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      background:linear-gradient(135deg, ${color}dd, ${color}bb);
      backdrop-filter:blur(8px);
      box-shadow:0 2px 8px ${color}33;
      border:1px solid rgba(255,255,255,0.1);`;
    el.textContent = label;
    void el.offsetHeight;
    el.style.opacity = '0.9';
  }, { label: ROLE_LABELS[role], color: ROLE_COLORS[role] }).catch(() => {});
}

export async function injectRoleLabels(windows: DemoWindows) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  await Promise.all(roles.map((role) => injectSingleRoleLabel(windows[role].page, role)));
}

export function setupLabelReinjection(windows: DemoWindows) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  for (const role of roles) {
    windows[role].page.on('load', () => {
      injectSingleRoleLabel(windows[role].page, role).catch(() => {});
    });
  }
}

// ---------------------------------------------------------------------------
// Helper: dismiss confirm() dialogs automatically (for Jockey actions)
// ---------------------------------------------------------------------------

export function setupAutoConfirm(windows: DemoWindows) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  for (const role of roles) {
    windows[role].page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  }
}

// ---------------------------------------------------------------------------
// Click Indicator — shows a ripple + dot wherever a click happens.
// Uses context.addInitScript() so it runs before any page JS on every
// navigation automatically — no re-injection needed.
// ---------------------------------------------------------------------------

const CLICK_INDICATOR_SCRIPT = `
(() => {
  if (window.__demoClickSetup) return;
  window.__demoClickSetup = true;

  // Inject keyframes + classes once the DOM is ready
  function ensureCSS() {
    if (document.getElementById('demo-click-css')) return;
    const s = document.createElement('style');
    s.id = 'demo-click-css';
    s.textContent = \`
      @keyframes dcr { 0%{transform:translate(-50%,-50%) scale(0);opacity:.7} 60%{opacity:.35} 100%{transform:translate(-50%,-50%) scale(1);opacity:0} }
      @keyframes dcd { 0%{transform:translate(-50%,-50%) scale(1);opacity:.9} 100%{transform:translate(-50%,-50%) scale(0);opacity:0} }
      .dcr{position:fixed;pointer-events:none;z-index:99999;width:40px;height:40px;border-radius:50%;border:2.5px solid rgba(255,255,255,.85);box-shadow:0 0 12px rgba(0,0,0,.2),0 0 4px rgba(255,255,255,.4);animation:dcr .5s cubic-bezier(.16,1,.3,1) forwards}
      .dcd{position:fixed;pointer-events:none;z-index:99999;width:8px;height:8px;border-radius:50%;background:white;box-shadow:0 0 8px rgba(0,0,0,.3);animation:dcd .35s cubic-bezier(.4,0,.2,1) .1s forwards}
    \`;
    (document.head || document.documentElement).appendChild(s);
  }

  function showRipple(x, y) {
    ensureCSS();
    const r = document.createElement('div');
    r.className = 'dcr';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);

    const d = document.createElement('div');
    d.className = 'dcd';
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    document.body.appendChild(d);

    setTimeout(() => { r.remove(); d.remove(); }, 600);
  }

  document.addEventListener('mousedown', (e) => showRipple(e.clientX, e.clientY), true);
  document.addEventListener('pointerdown', (e) => showRipple(e.clientX, e.clientY), true);
})();
`;

/**
 * Enables a visual click ripple on all 3 windows.
 * Uses addInitScript on each BrowserContext so it auto-runs on every page load.
 */
export async function setupClickIndicators(windows: DemoWindows) {
  const roles: Role[] = ['customer', 'jockey', 'workshop'];
  for (const role of roles) {
    await windows[role].context.addInitScript(CLICK_INDICATOR_SCRIPT);
  }
}
