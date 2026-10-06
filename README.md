# Medical SMARTBOX — Frontend Web Application (`NeonCode-UPC`)

Plataforma Web y Landing Page orientada al monitoreo en tiempo real, supervisión térmica IoT y cadena de custodia para el transporte médico asistencial de órganos, hemoderivados y vacunas en Lima Metropolitana.

Desarrollada bajo los principios de **Domain-Driven Design (DDD)** y **Clean Architecture** impartidos en clase, utilizando **Vue 3**, **Vite**, **Pinia** y **PrimeVue**.

---

## 🚀 Tecnologías y Dependencias

* **Framework:** [Vue 3](https://vuejs.org/) (Composition API con `<script setup>`)
* **Empaquetador:** [Vite](https://vitejs.dev/)
* **Librería de Componentes:** [PrimeVue](https://primevue.org/) con tema Material + [PrimeIcons](https://primefaces.org/primeicons/) + [PrimeFlex](https://primeflex.org/)
* **Gestor de Estado Global:** [Pinia](https://pinia.vuejs.org/)
* **Enrutamiento:** [Vue Router](https://router.vuejs.org/) (modularizado por Bounded Contexts con lazy loading)
* **Internacionalización:** [Vue I18n](https://vue-i18n.intlify.dev/) (Español / Inglés)
* **Cliente HTTP:** [Axios](https://axios-http.com/)
* **Mock Backend:** [JSON Server](https://github.com/typicode/json-server) (API REST local en `/api/v1/*`)

---

## 📁 Arquitectura del Proyecto (DDD por Bounded Contexts)

Cada Bounded Context está desacoplado en `src/` para que cada integrante del equipo trabaje en su respectiva carpeta sin conflictos:

```text
src/
├── iam/                   # Bounded Context: Identity, Access & Subscriptions (Login, Registro, Planes)
│   ├── domain/            # Entidades puras (User, SubscriptionPlan) y comandos
│   ├── application/       # Pinia Store (useIamStore)
│   ├── infrastructure/    # IamApi (extiende BaseApi), assemblers
│   └── presentation/      # Vistas (sign-in, sign-up, plans) y rutas modulares (iam-routes.js)
│
├── telemetry/             # Bounded Context: Smart Container & Telemetry Monitoring (IoT Core)
│   ├── domain/            # Entidades (SmartContainer, TelemetryLog)
│   ├── application/       # Pinia Store (useTelemetryStore)
│   ├── infrastructure/    # TelemetryApi, container.assembler.js
│   └── presentation/      # Vistas (container-list, telemetry-monitor) y componentes (telemetry-card)
│
├── transport/             # Bounded Context: Medical Transport Planning & Dispatching (Core Operativo)
│   ├── domain/            # Entidades (TransportOrder, Ambulance)
│   ├── application/       # Pinia Store (useTransportStore)
│   ├── infrastructure/    # TransportApi, transport.assembler.js
│   └── presentation/      # Vistas (order-list, ambulance-list) y rutas (transport-routes.js)
│
├── alerting/              # Bounded Context: Critical Alerting & Incident Response (Soporte Reactivo)
│   ├── domain/            # Entidades (CriticalIncident)
│   ├── application/       # Pinia Store (useAlertingStore)
│   ├── infrastructure/    # AlertingApi, incident.assembler.js
│   └── presentation/      # Vistas (incidents-monitor) y rutas (alerting-routes.js)
│
├── custody/               # Bounded Context: Chain of Custody & Traceability (Core Regulatorio)
│   ├── domain/            # Entidades (CustodyTransfer, DigitalAuditManifest)
│   ├── application/       # Pinia Store (useCustodyStore)
│   ├── infrastructure/    # CustodyApi, custody.assembler.js
│   └── presentation/      # Vistas (traceability-timeline) y rutas (custody-routes.js)
│
├── shared/                # Shared Kernel y Elementos Transversales
│   ├── infrastructure/    # BaseApi (Axios centralizado), BaseEndpoint (CRUD genérico)
│   └── presentation/      # Layout general, Header, Footer, Selector de idioma, Landing Page (US04/05/06)
│
├── locales/               # Diccionarios de internacionalización (es.json, en.json)
├── router.js              # Enrutador principal que unifica todas las rutas de los contextos
├── main.js                # Bootstrap de la aplicación y registro de componentes pv-*
└── style.css              # Tipografía (Bricolage Grotesque, Inter) y colores institucionales
```

---

## 🛠️ Instalación y Ejecución Local

### 1. Clonar el repositorio y cambiar a la rama `develop`:
```bash
git clone https://github.com/NeonCode-UPC/frontend.git
cd frontend
git checkout develop
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Iniciar el servidor mock (JSON Server) en una terminal:
```bash
npm run server
```
*API Mock disponible en:* `http://localhost:3000/api/v1`

### 4. Iniciar la aplicación web (Vite) en otra terminal:
```bash
npm run dev
```
*Aplicación disponible en:* `http://localhost:5173`

---

## 🌿 Flujo de Trabajo del Equipo: GitFlow

> [!IMPORTANT]
> **REGLA DE ORO:** Nadie hace commits ni push directo a `main` ni a `develop`. Todo desarrollo se realiza en una rama `feature/*` creada a partir de `develop`.

### Pasos para desarrollar tu historia de usuario / vista:

1. **Actualizar tu rama `develop` local:**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Crear tu rama de trabajo:**
   Usa el prefijo `feature/` seguido de la historia de usuario o contexto asignado:
   ```bash
   git checkout -b feature/US01-registro-institucion
   # o por ejemplo:
   # git checkout -b feature/telemetry-gauge-card
   ```

3. **Realizar tus cambios y hacer commits con Conventional Commits:**
   ```bash
   git add .
   git commit -m "feat(iam): implement hospital registration form and validation"
   ```

4. **Subir tu rama a GitHub:**
   ```bash
   git push -u origin feature/US01-registro-institucion
   ```

5. **Abrir un Pull Request (PR):**
   * En GitHub, abre un Pull Request desde tu rama `feature/...` hacia la rama **`develop`**.
   * Solicita la revisión de un compañero de equipo antes del merge.

---

## 📝 Convención de Mensajes de Commit (Conventional Commits)

Formato: `<tipo>(<alcance>): <descripción>`

### Tipos permitidos:
* `feat`: Nueva funcionalidad o vista para el usuario.
* `fix`: Corrección de un fallo o error.
* `docs`: Modificación en documentación o README.
* `style`: Cambios cosméticos (espacios, formato CSS) sin afectar lógica.
* `refactor`: Reestructuración de código sin agregar funciones ni arreglar bugs.
* `chore`: Mantenimiento de configuración, dependencias o tooling.

### Alcances recomendados (`scopes`):
* `iam` (Autenticación, roles, registro, planes)
* `telemetry` (Contenedores inteligentes, lecturas IoT de sensores)
* `transport` (Órdenes de traslado, despacho de ambulancias)
* `alerting` (Alertas críticas, contingencias de temperatura)
* `custody` (Cadena de custodia, verificación OTP, actas)
* `landing` (Página pública, propuesta de valor, FAQ, contacto)
* `shared` (Layout, navegación, estilos globales)

### Ejemplos:
* `feat(telemetry): add live temperature gauge to container monitoring`
* `feat(transport): integrate ambulance assignment dropdown in orders view`
* `fix(custody): correct otp input validation length`
* `docs: add instructions for running mock api in readme`
