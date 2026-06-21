import { SwaggerOptions } from 'swagger-ui-express';

export const swaggerCustomCss = `
  /* ─── Font ─── */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  /* ─── Top Bar ─── */
  .swagger-ui .topbar {
    background-color: #0a1628 !important;           /* single solid brand color */
    border-bottom: 3px solid #00d4ff !important;    /* accent border */
    padding: 14px 0 !important;
  }

  .swagger-ui .topbar .wrapper {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    max-width: 1400px !important;
    margin: 0 auto !important;
    padding: 0 24px !important;
    flex-wrap: wrap !important;
    gap: 12px !important;
  }

  .swagger-ui .topbar .wrapper .topbar-wrapper {
    display: flex !important;
    align-items: center !important;
    gap: 16px !important;
    flex-wrap: wrap !important;
  }

  /* ── Hide default logo image ── */
  .swagger-ui .topbar .wrapper .topbar-wrapper .link img {
    display: none !important;
  }

  /* ── Your custom logo as background ── */
  .swagger-ui .topbar .wrapper .topbar-wrapper .link {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    text-decoration: none !important;
    padding-left: 56px !important;
    background: url('/static/logos/moneycircle-logo-header.svg') left center / 44px auto no-repeat !important;
    min-height: 48px !important;
    transition: none !important;  /* remove hover scale */
  }

  .swagger-ui .topbar .wrapper .topbar-wrapper .link .brand-name {
    font-size: 24px !important;
    font-weight: 800 !important;
    letter-spacing: -0.6px !important;
    color: #ffffff !important;     /* white text */
  }

  .swagger-ui .topbar .wrapper .topbar-wrapper .link .brand-name .highlight {
    color: #00d4ff !important;    /* accent for "Circle" or highlight */
  }

  .swagger-ui .topbar .wrapper .topbar-wrapper .tagline {
    color: #b0c4de !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    background: rgba(255,255,255,0.08) !important;
    padding: 4px 14px !important;
    border-radius: 20px !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    white-space: nowrap !important;
  }

  /* ─── Authorize Button ─── */
  .swagger-ui .btn.authorize {
    border: 2px solid #00d4ff !important;
    color: #00d4ff !important;
    background: transparent !important;
    border-radius: 6px !important;
    padding: 6px 16px !important;
    font-weight: 600 !important;
  }
  .swagger-ui .btn.authorize:hover {
    background: rgba(0,212,255,0.1) !important;
  }

  /* ─── Operation Blocks ─── */
  .swagger-ui .opblock {
    border-radius: 8px !important;
    border: 1px solid #e0e5ea !important;
    margin: 12px 0 !important;
    overflow: hidden !important;
  }
  .swagger-ui .opblock .opblock-summary {
    padding: 14px 18px !important;
    background: #fafbfc !important;
  }
  .swagger-ui .opblock .opblock-summary-method {
    border-radius: 4px !important;
    font-weight: 700 !important;
    font-size: 13px !important;
    padding: 4px 12px !important;
  }
  /* All methods use the accent color */
  .swagger-ui .opblock.opblock-get .opblock-summary-method,
  .swagger-ui .opblock.opblock-post .opblock-summary-method,
  .swagger-ui .opblock.opblock-put .opblock-summary-method,
  .swagger-ui .opblock.opblock-delete .opblock-summary-method,
  .swagger-ui .opblock.opblock-patch .opblock-summary-method {
    background: #00d4ff !important;
    color: #0a1628 !important;
  }

  .swagger-ui .opblock .opblock-summary-path {
    font-weight: 500 !important;
    color: #1a2a4a !important;
  }

  /* ─── Response Codes ─── */
  .swagger-ui .response-col_status .response-status-200,
  .swagger-ui .response-col_status .response-status-201 {
    color: #00a86b !important;
  }
  .swagger-ui .response-col_status .response-status-400,
  .swagger-ui .response-col_status .response-status-401,
  .swagger-ui .response-col_status .response-status-404,
  .swagger-ui .response-col_status .response-status-500 {
    color: #d1453b !important;  /* single red for errors */
  }

  /* ─── Models ─── */
  .swagger-ui .models {
    border-radius: 8px !important;
    border: 1px solid #e0e5ea !important;
    background: #fafbfc !important;
    padding: 14px !important;
    margin: 20px 0 !important;
  }
  .swagger-ui .models .model .property .name {
    color: #0a1628 !important;
    font-weight: 600 !important;
  }
  .swagger-ui .models .model .property .arrow {
    color: #00d4ff !important;
  }

  /* ─── Tabs ─── */
  .swagger-ui .opblock-tabs {
    border-top: 1px solid #e0e5ea !important;
    background: #fafbfc !important;
  }
  .swagger-ui .opblock-tabs .tab-item.active {
    font-weight: 600 !important;
    color: #0a1628 !important;
    border-bottom: 3px solid #00d4ff !important;
  }

  /* ─── Scrollbar ─── */
  ::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
  }
  ::-webkit-scrollbar-track {
    background: #f0f2f5 !important;
    border-radius: 10px !important;
  }
  ::-webkit-scrollbar-thumb {
    background: #00d4ff !important;
    border-radius: 10px !important;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #0099cc !important;
  }

  /* ─── Responsive ─── */
  @media (max-width: 768px) {
    .swagger-ui .topbar .wrapper {
      flex-direction: column !important;
      align-items: flex-start !important;
      padding: 0 16px !important;
    }
    .swagger-ui .topbar .wrapper .topbar-wrapper .link .brand-name {
      font-size: 20px !important;
    }
    .swagger-ui .topbar .wrapper .topbar-wrapper .tagline {
      font-size: 11px !important;
      padding: 2px 10px !important;
      white-space: normal !important;
    }
    .swagger-ui .info .title {
      font-size: 24px !important;
      flex-wrap: wrap !important;
    }
    .swagger-ui .opblock .opblock-summary {
      padding: 10px 14px !important;
    }
    .swagger-ui .opblock .opblock-summary-path {
      font-size: 13px !important;
    }
  }

  @media (max-width: 480px) {
    .swagger-ui .topbar .wrapper .topbar-wrapper .link {
      padding-left: 40px !important;
      background-size: 32px auto !important;
      min-height: 36px !important;
    }
    .swagger-ui .topbar .wrapper .topbar-wrapper .link .brand-name {
      font-size: 16px !important;
    }
  }
`;

export const swaggerOptions: SwaggerOptions = {
  customCss: swaggerCustomCss,
  customfavIcon: '/static/logos/favicon.svg',
  customSiteTitle: 'MoneyCircle API – Peer-to-Peer Lending Platform',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    displayRequestDuration: true,
    defaultModelExpandDepth: 1,
    defaultModelsExpandDepth: 1,
    tryItOutEnabled: false,
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'method',
    syntaxHighlight: {
      activated: true,
      theme: 'monokai',
    },
  },
};