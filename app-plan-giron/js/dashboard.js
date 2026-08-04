/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Motor de dashboard y tarjetas resumen
   ========================================================== */

const DASHBOARD = {

    obtenerBase() {
        return window.BASE_CONOCIMIENTO || {};
    },

    obtenerPresupuesto() {
        const base = this.obtenerBase();
        return base.presupuesto || null;
    },

    obtenerSectores() {
        const base = this.obtenerBase();

        if (
            base.sectores &&
            base.sectores.sectores
        ) {
            return base.sectores.sectores;
        }

        return [];
    },

    obtenerEstadisticas() {
        const base = this.obtenerBase();
        return base.estadisticas || null;
    },

    crearCard(titulo, valor, descripcion, icono) {
        return `
            <div class="dashboard-card">
                <div class="icono">${icono || "📊"}</div>
                <div class="valor">${valor}</div>
                <div class="titulo">${titulo}</div>
                <p class="texto-suave">${descripcion || ""}</p>
            </div>
        `;
    },

    renderResumenGeneral(contenedorId) {
        const contenedor = document.getElementById(contenedorId);

        if (!contenedor) return;

        const presupuesto = this.obtenerPresupuesto();
        const sectores = this.obtenerSectores();

        const totalPlan =
            presupuesto &&
            presupuesto.totalesPorVigencia
                ? presupuesto.totalesPorVigencia.totalCuatrienio
                : "Sin dato";

        contenedor.innerHTML = `
            <div class="dashboard">
                ${this.crearCard("Municipio", "Girón", "Santander", "📍")}
                ${this.crearCard("Periodo", "2024-2027", "Plan de Desarrollo Municipal", "📅")}
                ${this.crearCard("Sectores", sectores.length, "Sectores estratégicos identificados", "🏛️")}
                ${this.crearCard("Presupuesto", "$ " + totalPlan, "Millones de pesos", "💰")}
            </div>
        `;
    },

    renderRankingPresupuesto(contenedorId) {
        const contenedor = document.getElementById(contenedorId);

        if (!contenedor) return;

        const presupuesto = this.obtenerPresupuesto();

        if (
            !presupuesto ||
            !presupuesto.sectores
        ) {
            contenedor.innerHTML = `
                <p class="texto-suave">
                    No hay información presupuestal disponible.
                </p>
            `;
            return;
        }

        contenedor.innerHTML = presupuesto.sectores.map(item => `
            <div class="presupuesto-lista-item card-mini">
                <h4>${item.ranking}. ${item.sector}</h4>
                <p><strong>Total:</strong> $ ${item.totalCuatrienio} millones</p>
                <p><strong>Participación:</strong> ${item.participacionPorcentual}</p>
            </div>
        `).join("");
    },

    renderSectoresDestacados(contenedorId) {
        const contenedor = document.getElementById(contenedorId);

        if (!contenedor) return;

        const sectores = this.obtenerSectores();

        if (sectores.length === 0) {
            contenedor.innerHTML = `
                <p class="texto-suave">
                    No hay sectores disponibles.
                </p>
            `;
            return;
        }

        contenedor.innerHTML = sectores.slice(0, 6).map(sector => `
            <div class="card-sector" onclick="ROUTER.irSector('${sector.id}')">
                <div>
                    <div class="card-sector-icono">${sector.icono || "📌"}</div>
                    <h3>${sector.nombre}</h3>
                    <p>${sector.descripcion || ""}</p>
                </div>
                <div class="card-sector-footer">
                    <span>Eje ${sector.ejePrincipal || ""}</span>
                    <a>Ver detalle</a>
                </div>
            </div>
        `).join("");
    },

    renderTotalesPorVigencia(contenedorId) {
        const contenedor = document.getElementById(contenedorId);

        if (!contenedor) return;

        const presupuesto = this.obtenerPresupuesto();

        if (
            !presupuesto ||
            !presupuesto.totalesPorVigencia
        ) {
            contenedor.innerHTML = `
                <p class="texto-suave">
                    No hay totales por vigencia disponibles.
                </p>
            `;
            return;
        }

        const vigencias = presupuesto.totalesPorVigencia;

        contenedor.innerHTML = `
            <div class="grid-4">
                ${this.crearCard("2024", "$ " + vigencias["2024"], "Millones de pesos", "💰")}
                ${this.crearCard("2025", "$ " + vigencias["2025"], "Millones de pesos", "💰")}
                ${this.crearCard("2026", "$ " + vigencias["2026"], "Millones de pesos", "💰")}
                ${this.crearCard("2027", "$ " + vigencias["2027"], "Millones de pesos", "💰")}
            </div>
        `;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        DASHBOARD.renderResumenGeneral("dashboardResumen");
        DASHBOARD.renderRankingPresupuesto("dashboardPresupuesto");
        DASHBOARD.renderSectoresDestacados("dashboardSectores");
        DASHBOARD.renderTotalesPorVigencia("dashboardVigencias");
    }, 400);
});