# Medical SMARTBOX — Frontend Web Application

Frontend web de la plataforma **Medical SMARTBOX**, orientada al monitoreo en tiempo real, supervisión de telemetría IoT y trazabilidad de la cadena de custodia en el transporte médico asistencial. Proyecto desarrollado por el equipo **NeonCode** para el curso de **Aplicaciones Web (1ASI0730)** de la Universidad Peruana de Ciencias Aplicadas (UPC).

La aplicación está construida sobre **Vue 3** y **Vite**, implementando una arquitectura basada en **Domain-Driven Design (DDD)** con separación estricta de responsabilidades por Bounded Contexts.

---

## Tecnologías Utilizadas

- **Vue 3**: Framework progresivo utilizando Composition API y sintaxis `<script setup>`.
- **Vite**: Herramienta de compilación y servidor de desarrollo local.
- **Pinia**: Manejador centralizado de estado para la capa de aplicación.
- **Vue Router**: Enrutamiento declarativo para Single Page Applications (SPA), modularizado por contextos.
- **PrimeVue**: Librería de componentes UI junto con PrimeIcons y PrimeFlex para estilos de diseño.
- **Axios**: Cliente HTTP para la comunicación con servicios RESTful.
- **Vue I18n**: Soporte de internacionalización y cambio de idioma (Español / Inglés).
- **JSON Server**: Servidor mock local para desarrollo y pruebas de integración (`/api/v1/*`).

---

## Arquitectura del Proyecto

El código fuente (`src/`) se encuentra estructurado bajo principios de Domain-Driven Design (DDD), desacoplando la lógica de negocio en Bounded Contexts autónomos. Cada contexto implementa un esquema de 4 capas:

```text
src/
├── <bounded-context>/
│   ├── domain/               # Entidades de negocio, clases puras y comandos (sin dependencias de Vue ni HTTP)
│   ├── application/          # Stores de Pinia (use<Context>Store) que orquestan los casos de uso
│   ├── infrastructure/       # Clientes de API (Axios), Resources (DTOs) y Assemblers de mapeo
│   └── presentation/         # Vistas (.vue), componentes reutilizables y definición de rutas
└── shared/                   # Kernel compartido (BaseApi, BaseEndpoint, Layout y componentes transversales)
```

### Bounded Contexts

1. **IAM (`src/iam/`)**: Gestión de identidad, autenticación (sign-in, sign-up), perfiles de usuario y catálogo de planes de suscripción.
2. **Telemetry (`src/telemetry/`)**: Monitoreo de contenedores inteligentes (*Smart Containers*) y lecturas de telemetría IoT en tiempo real (temperatura interna/externa, batería, humedad).
3. **Transport (`src/transport/`)**: Planificación operativa de traslados médicos, órdenes de despacho y asignación de ambulancias.
4. **Alerting (`src/alerting/`)**: Detección y gestión de incidentes críticos por fluctuaciones térmicas o anomalías en ruta.
5. **Custody (`src/custody/`)**: Trazabilidad y cadena de custodia digital, control de entregas y actas de transferencia con verificación OTP.
6. **Shared (`src/shared/`)**: Servicios base (`BaseApi`, `BaseEndpoint`), layout principal (header, footer, navegación), landing page institucional y utilidades comunes.

---

## Requisitos Previos

- **Node.js**: Versión 18.0.0 o superior (compatible con Vite y Vue 3).
- **npm**: Versión 9.0.0 o superior.

---

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio y posicionarse en la rama develop

```bash
git clone https://github.com/NeonCode-UPC/frontend.git
cd frontend
git checkout develop
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor mock (JSON Server)

En una primera terminal, ejecute:

```bash
npm run server
```

El servidor mock quedará a la escucha en `http://localhost:3000/api/v1` consumiendo los datos definidos en `server/db.json` según el archivo de rutas `server/routes.json`.

### 4. Iniciar la aplicación web en modo desarrollo

En una segunda terminal, ejecute:

```bash
npm run dev
```

La aplicación estará disponible de forma local en `http://localhost:5173`.

---

## Scripts del Proyecto

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite con Hot Module Replacement (HMR). |
| `npm run server` | Inicia JSON Server en el puerto 3000 con soporte de rutas API REST. |
| `npm run build` | Compila y optimiza los activos de la aplicación para producción en el directorio `dist/`. |
| `npm run preview` | Levanta un servidor local para previsualizar la compilación de producción. |

---

## Variables de Entorno

El proyecto incluye archivos de configuración para diferentes entornos:

- `.env.development`: Configuración para entorno de desarrollo local apuntando a `http://localhost:3000/api/v1`.
- `.env.production`: Configuración para entorno de producción o despliegue en Vercel.

Principales variables configuradas:
- `VITE_API_URL`: URL base del backend o mock server.
- `VITE_CONTAINERS_ENDPOINT_PATH`: Ruta del recurso de contenedores IoT.
- `VITE_TELEMETRY_ENDPOINT_PATH`: Ruta del recurso de logs de telemetría.
- `VITE_TRANSPORTS_ENDPOINT_PATH`: Ruta del recurso de órdenes de transporte.
- `VITE_AMBULANCES_ENDPOINT_PATH`: Ruta del recurso de ambulancias.
- `VITE_INCIDENTS_ENDPOINT_PATH`: Ruta del recurso de incidentes críticos.
- `VITE_CUSTODY_ENDPOINT_PATH`: Ruta del recurso de cadena de custodia.

---

## Flujo de Trabajo y Convenciones

### GitFlow

El equipo trabaja bajo el modelo de ramificación GitFlow:
- `main`: Rama de producción que almacena versiones estables y liberadas.
- `develop`: Rama central de desarrollo e integración continua.
- `feature/<nombre>`: Ramas de trabajo creadas a partir de `develop` para la implementación de cada historia de usuario o componente. Una vez culminadas, se integran mediante Pull Request con revisión de código hacia `develop`.

### Conventional Commits

Los mensajes de confirmación siguen el estándar de Conventional Commits con el formato `<tipo>(<alcance>): <descripción>`:

- **Tipos**: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`.
- **Alcances sugeridos**: `iam`, `telemetry`, `transport`, `alerting`, `custody`, `shared`.
- **Ejemplos**:
  - `feat(telemetry): add live temperature chart component`
  - `fix(transport): correct ambulance status filter in dispatch view`
  - `docs: update execution steps in readme`

---

## Información del Equipo

**Equipo:** NeonCode  
**Curso:** Aplicaciones Web (1ASI0730) — NRC 8150  
**Docente:** Velásquez Núñez, Ángel Augusto  
**Periodo:** 2026-2  

### Integrantes

- Espinoza Flores, Aaron André — u202222859
- Gargate Paredes, Santiago — u20211b556
- Jaramillo Mayta, Jhon Jordy — u202520310
- Munayco Apolaya, Maria Luisa — u20231c995
- Santos Minaya, Renzo Piero — u202114790
