# Análisis de Contexto del Sistema - EventoYa

## 1. Información General del Proyecto
- **Nombre del Proyecto:** EventoYa
- **Materia:** Arquitectura de Sistemas (ASI-2026-2)
- **Grupo:** Grupo 2
- **Autor del Aporte:** Jhovanny Rodríguez

---

## 2. Descripción General
El sistema **EventoYa** es una plataforma orientada a la gestión, reserva y organización de eventos en tiempo real. Este documento presenta el análisis de contexto del sistema, identificando los actores principales, las fronteras del sistema y las interacciones clave con servicios externos.

---

## 3. Actores del Sistema

### 3.1 Actores Principales (Usuarios)
- **Usuario Final / Asistente:** Persona que busca, reserva y adquiere entradas para eventos.
- **Organizador de Eventos:** Usuario o entidad encargada de crear, gestionar y monitorear la logística y venta de boletos.
- **Administrador de la Plataforma:** Encargado del soporte, moderación de contenidos, gestión de usuarios y métricas globales.

### 3.2 Actores Secundarios (Sistemas Externos)
- **Pasarela de Pagos (e.g., Wompi, PSE, Stripe):** Procesa las transacciones financieras de compra de entradas de forma segura.
- **Proveedor de Notificaciones (e.g., Twilio, SendGrid):** Envía confirmaciones de compra, boletos digitales y alertas por correo o SMS.
- **Servicio de Autenticación Externa (e.g., Google OAuth, Auth0):** Facilita el inicio de sesión rápido y seguro para los usuarios.

---

## 4. Fronteras del Sistema e Interacciones
El sistema se delimita entre la interfaz de usuario (móvil y web) y los servicios centrales del backend. 

1. **Entrada de Datos:** El usuario interactúa mediante la Web/App para seleccionar eventos y asientos.
2. **Procesamiento:** El backend valida disponibilidad, aplica reglas de negocio y procesa la reserva.
3. **Integración:** Se realiza la llamada a la pasarela de pagos.
4. **Salida:** Se genera la confirmación y el código QR del boleto digital que se envía al usuario.
