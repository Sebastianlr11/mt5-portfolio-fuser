<div align="center">

# ⚡ MT5 Portfolio Fuser

**Fusiona múltiples reportes de MetaTrader 5 en un portfolio unificado y analiza tus estrategias como una sola cartera.**

[![Deploy to GitHub Pages](https://github.com/Sebastianlr11/mt5-portfolio-fuser/actions/workflows/deploy.yml/badge.svg)](https://github.com/Sebastianlr11/mt5-portfolio-fuser/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-online-00d68f)](https://sebastianlr11.github.io/mt5-portfolio-fuser/)

[🚀 **Probar la app en vivo**](https://sebastianlr11.github.io/mt5-portfolio-fuser/)

</div>

---

## ¿Qué es?

MT5 Portfolio Fuser es una aplicación web 100% cliente que toma varios **Strategy Tester Reports** (archivos `.html`) exportados desde MetaTrader 5 y los **combina en un único portfolio**, calculando métricas profesionales de evaluación cuantitativa sobre el conjunto.

Está pensada para traders algorítmicos que quieren analizar **cómo se comporta su cartera completa de bots como un sistema único** — no como bots aislados.

> 🔒 **Privacidad total:** todo el procesamiento ocurre en tu navegador. Tus reportes nunca se suben a ningún servidor.

---

## ✨ Características

- 📂 **Importación masiva** — arrastra y suelta múltiples reportes `.html` de MT5 a la vez
- 🧠 **Magic Map** — mapea/renombra estrategias mediante un archivo de mapeo (HTML/CSV/JSON)
- 🤖 **Filtrado por bot** — incluye o excluye sistemas individuales del cálculo en tiempo real
- 📈 **Curva de equity consolidada** con drawdown visualizado
- 📊 **+30 métricas profesionales** incluyendo:
  - Profit Factor, Sharpe Ratio, Recovery Factor
  - Max Drawdown ($ y %)
  - SQN Score (Van Tharp), STR Quality Number
  - R-Expectancy, Z-Score & probabilidad de no-aleatoriedad
  - Rachas consecutivas (ganadoras / perdedoras)
  - Stagnation días y %
  - Annual Return / Drawdown Ratio
- 📅 **Tabla de rendimiento mensual** con YTD por año
- 💾 **Exportación** del informe consolidado
- 🎨 **UI dark** con animaciones (Framer Motion) optimizada para análisis denso

---

## 🛠️ Stack técnico

| Capa            | Tecnología                                |
|-----------------|-------------------------------------------|
| Framework       | React 18 + TypeScript                     |
| Build tool      | Vite 5                                    |
| Estilos         | Tailwind CSS 3                            |
| Animaciones     | Framer Motion                             |
| Gráficos        | Recharts                                  |
| Iconos          | Lucide React                              |
| Fechas          | date-fns                                  |
| Hosting         | GitHub Pages + GitHub Actions             |

---

## 🚀 Inicio rápido

### Requisitos
- [Node.js](https://nodejs.org/) 18 o superior

### Desarrollo local

```bash
# Clonar el repo
git clone https://github.com/Sebastianlr11/mt5-portfolio-fuser.git
cd mt5-portfolio-fuser

# Instalar dependencias
npm install

# Levantar el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173/mt5-portfolio-fuser/`

### Otros scripts

```bash
npm run build     # genera el bundle de producción en dist/
npm run preview   # sirve el bundle de producción localmente
npm run lint      # ejecuta ESLint
```

---

## 📖 Cómo usar la app

1. **Exporta tus backtests** desde MetaTrader 5 como **HTML** (`Strategy Tester → Report → Save as Report`).
2. **(Opcional) Prepara un Magic Map** si quieres unificar nombres de estrategias entre reportes (un HTML/CSV/JSON con `botName → magicNumber`).
3. **Importa los reportes** arrastrándolos sobre la app o vía el botón **Importar**.
4. **Carga el Magic Map** en el panel lateral (opcional).
5. **Filtra bots** activando/desactivando los checkboxes en la barra lateral para ver el efecto en las métricas en vivo.
6. **Exporta el informe consolidado** con el botón **Exportar**.

---

## 📁 Estructura del proyecto

```
mt5-portfolio-fuser/
├── src/
│   ├── components/         # UI (EquityChart, StatsGrid, MonthlyTable, BotList…)
│   ├── logic/
│   │   ├── parser.ts       # Parsea los .html de MT5 → objetos Trade
│   │   ├── processor.ts    # Calcula la curva de equity y todas las métricas
│   │   ├── exporter.ts     # Genera el informe consolidado
│   │   └── types.ts        # Modelo de datos
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .github/workflows/
│   └── deploy.yml          # CI/CD: build + deploy a GitHub Pages en cada push a main
├── vite.config.ts
└── package.json
```

---

## 🚢 Despliegue

El deploy es automático: cualquier `push` a `main` dispara el workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que builda con Vite y publica `dist/` en GitHub Pages.

**URL de producción:** [https://sebastianlr11.github.io/mt5-portfolio-fuser/](https://sebastianlr11.github.io/mt5-portfolio-fuser/)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un bug o tienes una idea, abre un [issue](https://github.com/Sebastianlr11/mt5-portfolio-fuser/issues) o envía un Pull Request.

---

## 📄 Licencia

Distribuido bajo licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

Hecho con ⚡ por [@Sebastianlr11](https://github.com/Sebastianlr11)

</div>
