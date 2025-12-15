# devops-learning-lab


## Apuntes:

### Kubernetes:
#### Conceptos basicos:

- Pod → unidad mínima (contenedor o varios contenedores)

- Deployment → cómo Kubernetes asegura réplicas, actualizaciones, rollbacks

- Service → cómo exponer un Deployment dentro del cluster

- Ingress → cómo exponer servicios al mundo externo

- ConfigMap → configs sin credenciales

- Secret → configs con credenciales

- Namespace → separar ambientes

#### Pasos:

Debido al espacio disponible en el macbook, trabajé en windows.

1. Lanzar kubernetes
```
minikube start --driver=docker
```
Especificiamente se utilizará la VM de docker debido a que es muy estable en windows.
* El sistema solicitó usar el siguiente comando para activar todos los dashboards features:
```
minikube addons enable metrics-server
```
2. Creacion de instancia.

Se puede hacer mediante la creacion de un ".yaml" en la carpeta raiz del directorio del proyecto el cual en este caso será [namespace.yaml](./namespace.yaml) o mediante el comando:

```
kubectl create namespace devops-lab
```

Debido a que estoy aprendiendo usaré el yaml.

