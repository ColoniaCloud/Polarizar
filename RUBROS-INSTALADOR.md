# Rubros del instalador: automotriz y arquitectura

Un instalador puede trabajar sobre autos, sobre vidrios de edificios, o sobre las dos cosas. Hoy el
sistema asume auto en todos lados: la landing pide patente, el formulario de garantía pide tipo de
vehículo, y la agenda modela un turno de duración fija que es exactamente un auto en una bahía.

Este documento es el plan para que deje de asumirlo.

Continúa `TURNOS-POLARIZAR.md`, que es el que construyó la página pública del taller.

> **Estado: implementado (fases 1–6).** 64 aserciones contra la base real —45 a nivel de librería y 19
> por HTTP contra los endpoints—, la mitad de ellas sobre lo que **no** tiene que pasar. Verificado
> además de punta a punta en el navegador: un pedido de arquitectura entra desde la landing y llega al
> CRM con inmueble, dirección, vidrios, m², objetivo y franja, y sin vehículo ni patente.

---

## 1. La decisión de fondo: tres alturas, no un interruptor

El atajo tentador es un campo `rubro` en la ficha del instalador. Falla en el caso que más importa —el
que hace las dos cosas— porque su página tendría que preguntar patente para una ventana.

La pregunta se responde en **tres alturas distintas**, y cada una resuelve una cosa:

| Altura | Quién la contesta | Qué decide |
|---|---|---|
| **El taller** | El instalador, en Mi Taller | Cómo se **presenta** su página: título, tarjetas, secciones |
| **El servicio** | El instalador, al cargarlo | Qué se le **pregunta al cliente** que elige ese servicio |
| **El rollo** | Nadie: ya está en el sistema | Qué se le **pregunta al cliente final** al activar la garantía |

La tercera es la que más rinde y la que no cuesta nada: `Product.category` ya existe desde el día uno
con los valores `AUTOMOTIVE | ARCHITECTURAL | PPF`. La garantía de una lámina de arquitectura **puede
saber sola** que no tiene que pedir patente.

### Por qué dos booleanos y no un enum

`doesAutomotive` / `doesArchitectural`, no `Rubro { AUTOMOTRIZ, ARQUITECTURA, AMBOS }`.

Un enum con `AMBOS` son tres estados para dos hechos independientes: cada consumidor termina
escribiendo `r === AMBOS || r === AUTOMOTRIZ`, que es la forma larga de un booleano. Y cuando aparezca
un tercer rubro el enum necesita siete valores. Es el mismo patrón que ya usan
`worksAtShop / worksOnSite / worksForDealers`, y por las mismas razones.

### Decisiones que quedan tomadas

- **PPF no es un rubro.** Va sobre autos: tiene patente y tiene bahía. Es un servicio dentro de
  automotriz. Para la garantía cuenta como automotriz.
- **Arquitectura no agenda turnos: pide visitas.** Un auto entra a las 9 y sale a las 11. Una obra es
  «vamos a medir y después te presupuestamos». Meter una obra en una grilla de huecos de 90 minutos es
  prometer una precisión que no existe. El cliente elige **día y franja** (mañana/tarde), no hueco.
- **«Ambos» es una sola página.** Los servicios se agrupan en dos bloques y el formulario se
  reconfigura al elegir uno. Sin pantalla previa preguntándole al visitante qué es: elige el servicio,
  que es lo que ya sabe, y el resto se acomoda.
- **`Contact.sector` no se toca.** Es del equipo de ventas, es de un solo valor, y ya tiene basura
  (`AUTOMOTRIZ` a mano en 20 leads, un string vacío en un cliente). Que un vendedor reclasificando un
  lead cambie una página pública en vivo es un acoplamiento que no queremos.

---

## 2. Fases

### Fase 1 — CRM: el modelo

`WorkshopSettings`
- `doesAutomotive Boolean @default(true)` — el default preserva a los que ya existen
- `doesArchitectural Boolean @default(false)`

`WorkshopService`
- `category ServiceCategory @default(AUTOMOTIVE)` — los dos servicios cargados hoy son de auto

`WorkshopBooking`
- `category ServiceCategory @default(AUTOMOTIVE)` — **copiada**, no referenciada, igual que
  `serviceName`: el servicio puede cambiar de rubro después y el pedido tiene que seguir diciendo qué
  se pidió ese día
- `propertyType String?` — `CASA | OFICINA | LOCAL | EDIFICIO | OTRO`
- `glassCount Int?` — cuántos vidrios, aproximado
- `approxM2 Decimal? @db.Decimal(8,2)`
- `goal String?` — `CONTROL_SOLAR | PRIVACIDAD | SEGURIDAD | DECORATIVO`
- `siteAddress String?` — **dónde queda el inmueble**. Sin esto una visita no se puede hacer; en
  automotriz no hace falta porque el auto va al taller
- `timeWindow String?` — `MANANA | TARDE` para las visitas, donde la hora exacta no significa nada

Enum nuevo: `ServiceCategory { AUTOMOTIVE ARCHITECTURAL }`. Deliberadamente **no** reusa
`ProductCategory`, que tiene `PPF`: un servicio PPF es automotriz, y ofrecer PPF como tercera opción
en el selector del taller invitaría a clasificarlo mal.

`db:push`, nunca `migrate dev` (Windows sin shadow DB).

### Fase 2 — CRM: lógica y API

- `getWorkshopServices` y la proyección pública devuelven `category`
- `createWorkshopService` / `updateWorkshopService` la aceptan y la validan
- `getPublicWorkshop` expone `rubros: { automotriz, arquitectura }`
- `createBooking` **deriva la categoría del servicio elegido** y valida por rubro:
  automotriz exige `vehicleType`; arquitectura exige `propertyType` y `siteAddress`
- `/slots` responde vacío para un servicio de arquitectura, en vez de inventar huecos
- `confirmBooking` crea el `WorkshopAsset` con el `AssetType` que corresponde —`VEHICLE` o
  `BUILDING`—, que ya existe en el enum y ya viaja a `WarrantyInstallation.assetType`
- `settings` PATCH acepta los dos booleanos y **rechaza que los dos queden en false**

### Fase 3 — kristall-web: Mi Taller

- `PublicPageForm`: checklist «¿Sobre qué trabajás?» con las dos opciones, guardado al tocar, con el
  mismo patrón que «¿Cómo trabajás?». Al menos una obligatoria.
- `ServicesForm`: selector de rubro por servicio, visible **solo si el taller marcó los dos** — a
  quien hace una sola cosa no se le pregunta lo que ya contestó.
- `BookingsInbox`: los pedidos de arquitectura muestran inmueble, vidrios, m², objetivo y dirección
  en vez de vehículo y patente.

### Fase 4 — polarizar: la landing

- Servicios agrupados en dos bloques: «Para tu vehículo» / «Para tu casa u oficina». Con un solo
  rubro no hay títulos de bloque: agrupar una sola cosa es ruido.
- El formulario se reconfigura según el servicio elegido:
  - automotriz → vehículo (obligatorio), patente, «¿ya está polarizado?», foto, hueco de agenda
  - arquitectura → tipo de inmueble (obligatorio), dirección (obligatoria), cantidad de vidrios, m²,
    qué busca, «¿ya tiene lámina?», foto, y **día + franja** en vez de hueco
- Modalidades: la cuarta tarjeta. Un taller que hace arquitectura suma «Visita para medir y
  presupuestar» con botón «Pedir una visita». Uno que hace **solo** arquitectura muestra únicamente
  esa: «Servicio en el taller — dejás el vehículo y lo retirás listo» no es información para alguien
  con una ventana, es ruido.
- Metadata y textos del hero según rubro.

### Fase 5 — La garantía

Lo más chico y lo que más rinde, porque el modelo ya estaba preparado: `AssetType` ya tiene
`WINDOW | BUILDING`, `WarrantyInstallation.assetType` ya existe, y `ActivationForm` ya sabe pedirlo.
Lo único que falta es que el rubro **llegue**.

- `verifyWarranty` agrega `category` al select del producto
- `pickPublicStatus` lo expone como `productCategory`
- `ActivationForm`: con `ARCHITECTURAL` ofrece `WINDOW | BUILDING | OTRO` y arranca en `WINDOW`; con
  automotriz sigue como está
- `InstallationSummary`: sin ícono de vehículo ni fila de patente cuando es arquitectura

### Fase 6 — Verificación y documentación

Script contra la base real, self-cleaning, con aserciones de lo que **no** tiene que filtrarse.
Actualizar `CLIENT_PORTAL_API.md` y `WARRANTY_API.md` **en los dos repos** (crm-polarizados y
kristall-web) — es el doc espejo que se desincroniza sin que se note.

---

## 3. Lo que NO se hace

- **No se reescriben los datos viejos.** Los servicios y pedidos existentes quedan `AUTOMOTIVE` por
  default, que es lo que efectivamente son.
- **No se toca `Contact.sector`** ni la pantalla de leads.
- **No se separan las páginas** (`/carlos` y `/carlos-arquitectura`). Si el negocio de arquitectura
  resulta ser muy distinto en tono y público, se puede hacer después sin deshacer nada de esto.
- **No se toca la agenda de automotriz.** El cálculo de huecos queda igual; arquitectura simplemente
  no lo usa.
