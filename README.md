# devops-learning-lab

## Apuntes

### Kubernetes

#### Conceptos basicos

- **Pod** → unidad minima (contenedor o varios contenedores)
- **Deployment** → como Kubernetes asegura replicas, actualizaciones, rollbacks
- **Service** → como exponer un Deployment dentro del cluster
- **Ingress** → como exponer servicios al mundo externo
- **ConfigMap** → configs sin credenciales
- **Secret** → configs con credenciales
- **Namespace** → separar ambientes

---

### Pasos

Se trabajará en MacOS

### 1. Lanzar Kubernetes

```bash
minikube start --driver=docker
```


El sistema solicito usar el siguiente comando para activar todos los dashboards features:

```bash
minikube addons enable metrics-server
```

### 2. Creacion de instancia

Se puede hacer mediante la creacion de un `.yaml` en la carpeta raiz del directorio del proyecto (en este caso [namespace.yaml](./namespace.yaml)) o mediante el comando:

```bash
kubectl create namespace devops-lab
```

Debido a que estoy aprendiendo, usare el yaml.

### 3. Creacion de deployment por cada servicio y creacion de pods

- No sirve crear solo pods, porque estos tienen IP dinamica; si mueren, la IP cambia. Para ello, es necesario un service por cada deployment, o sea, un service para backend y otro para frontend. El service le dara una IP estable, DNS interno y balanceo automatico.
- Un deployment crea un ReplicaSet, y este crea los pods. El `selector` indica como identifica los pods y los `labels` como los marca. Si selector != labels, no funciona.
- El deployment le dira a kubernetes: "Crea y manten X pods ejecutando ESTA imagen con ESTA configuracion".
- Se creo una carpeta `k8s` con dos carpetas: `backend` y `frontend`, donde se creo `deployment.yaml` para cada uno. Luego de estructurarlos, se hizo uso de `kubectl apply -f k8s/ -R` para crear los deployments; `-R` sirve para que sea recursivo y busque dentro de las carpetas backend y frontend, porque si no, arroja un error de compatibilidad de archivo ya que la carpeta no es yaml.
- Se puede usar `kubectl explain deployment` o `kubectl explain deployment.spec` para visualizar la estructura.
- Para visualizar el estado de los pods creados por el deployment, se puede usar `kubectl get pods`. En mi caso, por primera vez me salio que no estaban listos y estaban con status: "ImagePullBackOff". Para solucionarlo, hice `eval $(minikube docker-env)` que le indica a minikube que use docker local. Al usar `kubectl get pods` siguio sin funcionar. Tuve que volver a hacer `docker build -t backend:latest ./backend` y `docker build -t frontend:latest ./frontend`, y agregar a los `deployment.yaml` la configuracion `imagePullPolicy: Never`, la cual le dice a kubernetes que no intente descargar una imagen ya que la que cree es local y no obtenida de docker.
- Con esto solucionado, hay que actualizar los pods mediante `kubectl apply` o volver a crearlos; se eliminan y vuelven a crear mediante `kubectl delete pods --all`. Se puede usar `-w` (watch) en `kubectl get pods` para visualizar las actualizaciones del pod en tiempo real.

### 4. Creacion del service

- Se necesita un service por cada app; sin este, no se puede visualizar ni operar los pods. El frontend hablara con el backend usando el service, no localhost.
- Existira un service para el backend para que el frontend lo encuentre y un service para el frontend para exponerlo. Se tiene que hacer un port-forward al service, no al pod.
- Luego de crear los yaml en el directorio `k8s` y en sus respectivas carpetas, se vuelve a hacer `kubectl apply -f k8s/ -R`. Para visualizar el estado de estos, se puede usar `kubectl get services`. Para ver los endpoints, se puede usar `kubectl get endpoints`.
- Para poder visualizar el frontend, es necesario hacer un port-forward o configurar un ingress.

### 5. Creacion del ingress

- Si el Service es el portero de un edificio que sabe en que departamento viven los Pods, el Ingress es la recepcion principal del complejo de edificios.
- Sin el ingress, tendria que usar un port-forward por cada componente de la app, lo que a la larga es poco escalable.
- El Ingress permite que una sola direccion IP (o un solo dominio) gestione el trafico hacia multiples servicios basandose en la ruta (URL) o el host (dominio).

**Componentes del ingress:**

- **Ingress Resources**: Es el yml que se escribe para orquestar las rutas.
- **Ingress Controller**: Es el software que realiza esto (Nginx, Traefik, HAProxy). Se tiene que activar mediante `minikube addons enable ingress`.

**Configuracion:**

- El ingress actua como proxy inverso, por lo que puede hacer routing por path o por host.
- Primero se tiene que activar el ingress controller.
- Mediante `minikube ip` se obtiene la IP del cluster, la cual debe ser agregada a los host del pc mediante `sudo nano /etc/hosts`. Esto con el fin de decirle al navegador que es `devops-lab.test`. Le decimos al computador que no vaya a internet a buscar esto; si alguien escribe `devops-lab.test`, mandalo directamente a esta IP (donde vive el cluster de Minikube).
- Sin importar el orden, se tiene que crear el namespace del cluster mediante `kubectl apply -f namespace.yaml`. Luego asignar el ingress al namespace con `kubectl apply -f k8s/ingress.yaml -n devops-lab`. Con esto, tambien se deben cargar los deployments y los services al mismo namespace mediante `kubectl apply -f k8s/ -R -n devops-lab`.
- Para comprobar si el namespace se aplico, se puede hacer un ping mediante `ping devops-lab.test`. Pese a que no se recibe respuesta, la primera linea muestra "PING devops-lab.test (192.168.49.2): 56 data bytes", lo que indica que se mapeo correctamente la IP al namespace. Aun asi, dado que el ping presenta problemas con ICMP, se usa `curl -I http://devops-lab.test` para revisar si responde mediante HTTP, pero tambien arroja error. Puede ser que por macOS, la red de la VM de minikube este aislada; para ello, se usara `minikube tunnel`.
- Luego de hacer el tunnel, este se queda escuchando en la terminal. Para comprobar si el tunnel se hizo correctamente, se hizo uso de `sudo lsof -i :80`, ya que el tunnel expone explicitamente los puertos 80 y 443. Al revisar el puerto 80, se puede visualizar que el tunnel esta escuchando en localhost. Por lo que se tiene que cambiar la IP que se habia puesto en los host mediante `sudo nano /etc/hosts` para asignar al mismo nombre la IP `127.0.0.1`, la cual corresponde a localhost.
- Al hacer `curl -I http://devops-lab.test`, se obtiene un 200.

### 6. Conexion frontend con backend

- Dado que me encuentro desarrollando en un entorno local, se presentan problemas de rutas dentro del flujo frontend-backend. El frontend hace request a las rutas `localhost:3001`, y cuando Next.js envia el JS al navegador, este codigo se ejecuta fuera de la red interna de kubernetes, por lo que el navegador busca dentro del puerto 3001 del computador, no del cluster. Se presentan dos soluciones: usar la ruta relativa o la ruta completa como `http://devops-lab.test/api`. En este caso, usare las rutas relativas.
- Luego de actualizar [login-form.tsx](frontend/components/login-form.tsx), se debe reconstruir la imagen mediante `docker build -t frontend:latest ./frontend`. Dado que ya se habia conectado la terminal al docker de minikube mediante `eval $(minikube docker-env)`, deberia estar listo. Aun asi, se puede forzar el reinicio mediante `kubectl rollout restart deployment frontend-deployment -n devops-lab`.
- Finalmente, para ver si todo va bien, se puede hacer `kubectl get all -n devops-lab`, donde se puede observar que hay bastantes replicas; esto se debe a que por defecto kubernetes va guardando un historial de replicas para poder volver a una anterior si hay algun problema.

### 7. Tareas comunes y extras

#### 7.1. Verificar estado del cluster

Si se deja de desarrollar y no se sabe como continuar la app o como verificar todo:

1. Revisar estado de minikube con `minikube status`:
   - Si sale "Stopped", ejecutar `minikube start --driver=docker`
   - Si sale "Running", proceder al siguiente paso

2. Visualizar el estado de los deployments, services e ingress con `kubectl get all -n devops-lab`

3. Adicionalmente, con `kubectl get ingress -n devops-lab` se pueden visualizar las reglas de navegacion externa.

En mi caso, se presento un problema donde el campo "address" se encontraba vacio, por lo que se debe proceder a ejecutar de nuevo `sudo minikube tunnel` y ademas revisar el archivo de host mediante `nano /etc/hosts`. En mi caso, host seguia como se habia dejado la ultima vez, por lo que solo hizo falta usar el comando para realizar el tunnel.

#### 7.2. Configurar replicas dinamicas (HPA)

Para crear replicas de manera dinamica:

1. Agregar las lineas comentadas de [deployment.yaml](k8s/frontend/deployment.yaml) (Resources), donde se establecen los rangos de la maquina para crear mas replicas.

2. Crear un `HPA.yaml` (Horizontal Pod Autoscaler), el cual observa los resources determinados en deployment para definir la cantidad de replicas a generar.

3. Agregar un addon para que el HPA pueda leer la cantidad de recursos que consumen las replicas mediante `minikube addons enable metrics-server`.

Con esto, primero se mira que se necesita una replica gracias al spec de deployment, y se iran agregando mas a medida que se necesite distribuir la carga.

---

### ArgoCD

Es el puente automatizado entre el código en GitHub y la infraestructura en Minikube. Su rol es quitar la responsabilidad de "aplicar" los cambios y dar la seguridad de que lo que se ve en el repositorio es exactamente lo que está corriendo.

#### Conceptos basicos

- **GitOps:** Es la metodología donde Git es la única fuente de verdad. Si quieres cambiar algo en el cluster, no usas la terminal; cambias el archivo en Git y ArgoCD se encarga del resto.
- **Application (Recurso de Argo):** Es un objeto dentro de ArgoCD que conecta un repositorio de Git con un Namespace de Kubernetes. Le dice: "Mira esta carpeta en GitHub y asegurate de que el cluster se vea exactamente igual".
- **Sync (Sincronización):** Es el proceso de comparar el estado deseado (Git) con el estado real (Kubernetes).
- **Out of Sync:** Hiciste un cambio en Git que aún no llega al cluster (o alguien metio mano manualmente con kubectl).
- **Self-Healing (Auto-curación):** Si alguien borra un Pod o un Service manualmente con la terminal, ArgoCD lo detecta y lo vuelve a crear automaticamente para que coincida con Git.

---

#### 1. Preparacion del entorno

- Crear el namespace para ArgoCD:

```bash
kubectl create namespace argocd
```

- Instalar ArgoCD:

```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

- Visualizar el estado de la descarga con `kubectl get pods -n argocd -w`.
- Dado que ArgoCD cuenta con una interfaz grafica, se debe hacer un port-forward para visualizarlo ya que el entorno local no permite visualizar el puerto del cluster:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Tambien se podria hacer un ingress para redirigir el trafico, pero no es necesario.

- Para ingresar, usar el usuario `admin` y obtener la contraseña mediante:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
``` 
#### 2. Conexion del repositorio

1. Luego de iniciar sesion, conectar el repo con ArgoCD:
   - Ir a "settings" → "+connect repo"
   - En mi caso, hice la conexion mediante HTTP/HTTPS

2. Crear una nueva aplicacion:
   - Ir a "Applications" → "+NEW APP"
   - Configurar los siguientes parametros:

**GENERAL:**
- Application name: `devops-lab-app`
- Project Name: `default`
- Sync Policy: `automatic`
  - Enable auto-sync ✓
  - Prune Resources ✓ (si se borra algo en Git, se borra en el cluster)
  - Self Heal ✓ (si se borra algo manual en el cluster, Argo lo restaura)

**SOURCE:**
- Repository URL: `https://github.com/HugoosZ/devops-learning-lab`
- Revision: `HEAD`
- Path: `k8s`

**DESTINATION:**
- Cluster URL: (defecto)
- Namespace: `devops-lab`

**DIRECTORY:**
- DIRECTORY RECURSE ✓ (indica que k8s contiene mas directorios)
    

---

### GitHub Actions

En este paso, se busca automatizar el flujo de trabajo con ArgoCD para que traiga las versiones desde DockerHub en lugar de traerlas desde el entorno local.

#### 1. Configuracion de deployments

Es necesario modificar los deployments del [backend](k8s/backend/deployment.yaml) y [frontend](k8s/frontend/deployment.yaml) para que ArgoCD intente buscar la imagen en DockerHub inicialmente. Es necesario poner el nombre de usuario antes del repositorio para cumplir con las reglas de DockerHub. Con esto, aseguramos que ArgoCD siempre tenga la ultima version de la app.

#### 2. Crear workflows

Crear dos archivos:
- [backend](.github/workflows/backend.yml)
- [frontend](.github/workflows/frontend.yml)

Estos workflows se ejecutaran al realizar commits a git. El objetivo es que cuando se detecte un cambio en la rama `main`, solo si hay cambios en las carpetas `backend`, `frontend` o `k8s`, se realicen las actualizaciones correspondientes a los repositorios de DockerHub y GitHub.

El pipeline funciona de la siguiente manera:
1. Clonar el repositorio de GitHub
2. Iniciar sesion en DockerHub
3. Subir los cambios de cada componente de manera independiente
4. Cambiar el deployment de cada componente con el mismo tag del commit
5. Subir los cambios a Docker y a Git

#### 3. Obtener credenciales

**Docker Hub:**
- Usuario de DockerHub
- Token: crear en "Foto de perfil" → "Settings" → "Personal access tokens"
  - Dar acceso a: Read, write, delete
  - Sin fecha de expiracion

**GitHub:**
- Primero, permitir cambios de escritura en el repositorio cuando se ejecuten workflows:
  - Ir a "Repo" → "Settings" → "Actions" → "General" → "Workflow permissions" → "Read and write permissions" ✓
- Crear token en: "Foto de perfil" → "Settings" → "Developer settings" → "Personal access tokens" → "Tokens (classic)" → "Generate new token (classic)"
  - Seleccionar: "Repo" ✓

#### 4. Configurar variables de entorno

En el repositorio, ir a "Repo" → "Settings" → "Secrets and variables" → "Actions" → "New repository secret" y crear las siguientes variables:

- `DOCKERHUB_TOKEN`: Token de DockerHub (para que GitHub escriba en DockerHub)
- `DOCKERHUB_USERNAME`: Usuario de DockerHub
- `GH_PAT`: Personal Access Token de GitHub (para que escriba en el repo)

#### 5. Resultado

Con esto, al subir algun cambio a git, se ejecuta la automatizacion y la imagen se actualiza con cada nuevo commit subido a git. 



