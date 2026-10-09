# Entorno de desarrollo de la demo; no ejecuta la exportación heredada.
FROM node:22.22.3-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force
COPY --chown=node:node . .

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/', {signal: AbortSignal.timeout(5000)}).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
