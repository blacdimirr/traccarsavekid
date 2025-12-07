# Guía de compilación de Traccar + SaveKID

Esta guía explica cómo compilar el servidor de Traccar con las extensiones SaveKID (protocolo FA66S, modelo fisiológico y recursos web personalizados) incluidas en este repositorio. Las instrucciones están orientadas a Linux, pero aplican de forma equivalente a macOS y Windows con rutas ajustadas.

## 1. Prerrequisitos

1. **Java 17 JDK** instalado y en el `PATH` (`java -version` debe mostrar 17).
2. **Node.js 20+** y **npm 10+** para construir la web moderna (`traccar-web`).
3. **Git** para obtener el código.
4. Acceso a Internet para descargar dependencias Gradle y NPM. Si usas proxy, exporta `GRADLE_OPTS` y `npm config set proxy` según corresponda.
5. Una base de datos soportada por Traccar (MySQL/MariaDB o PostgreSQL) y credenciales con permisos de creación de tablas.

## 2. Clonar el proyecto

```bash
git clone <url-del-repositorio> traccar-savekid
cd traccar-savekid
```

## 3. Preparar dependencias de la UI

El cliente web se empaqueta junto al backend. Instala dependencias y genera la salida estática:

```bash
cd traccar-web
npm ci
npm run build
cd ..
```

El resultado queda en `traccar-web/build`, que será tomado por los scripts de empaquetado.

## 4. Configurar la base de datos

1. Copia el archivo de configuración de ejemplo:

   ```bash
   cp setup/traccar.xml conf/traccar.xml
   ```

2. Edita `conf/traccar.xml` para apuntar a tu motor de base de datos (driver, URL, usuario y contraseña). Traccar aplicará automáticamente los cambios de esquema al arrancar, incluyendo la tabla `tc_savekid_health` definida en `schema/changelog-6.12.0.xml`.

## 5. Compilar el backend

Ejecuta Gradle para construir el servidor y recopilar dependencias en `target/`:

```bash
./gradlew clean assemble -x test
```

Si tu entorno bloquea descargas automáticas, añade `--no-daemon` y configura un proxy en `~/.gradle/gradle.properties`.

El artefacto principal queda en `target/`. Si el archivo generado incluye versión en el nombre (por ejemplo `tracker-server-6.10.0.jar`), renómbralo a `tracker-server.jar` para que coincida con los scripts de despliegue.

## 6. Empaquetar distribución

El script `setup/package.sh` genera una carpeta `out/` con binarios, web y configuración lista para desplegar:

```bash
cd setup
./package.sh all
cd ..
```

Requiere que `target/tracker-server.jar`, `target/lib/` y `traccar-web/build` existan. El resultado incluye `out/conf/traccar.xml`, `out/web/` (UI SaveKID) y `out/schema/` con la migración SaveKID.

## 7. Ejecutar localmente (modo desarrollo)

Para probar sin empaquetar, puedes lanzar el servidor directamente desde el directorio raíz tras compilar:

```bash
java -jar target/tracker-server.jar conf/traccar.xml
```

El servidor expondrá la API REST en `http://localhost:8082/api` y servirá la web desde el paquete construido. Los dispositivos FA66S enviarán telemetría que se persistirá en `tc_positions` y `tc_savekid_health`.

## 8. Consejos de solución de problemas

- **Descargas Gradle bloqueadas**: usa `./gradlew --no-daemon --gradle-user-home ~/.gradle` detrás de un proxy configurado.
- **Errores de NPM**: verifica versión de Node 20+ y limpia la caché con `npm ci --prefer-offline` si trabajas en red restringida.
- **Migraciones de base de datos**: revisa los logs iniciales; si no se crea `tc_savekid_health`, confirma que `conf/traccar.xml` apunta a la base de datos correcta y que el usuario tiene permisos de `ALTER`.
- **Recursos web faltantes**: asegúrate de ejecutar `npm run build` antes de empaquetar; `setup/package.sh` copia la carpeta `traccar-web/build` a `out/web`.
