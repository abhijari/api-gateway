# 🚀 API Gateway Platform — Production-Grade DevOps Project

> **A real-world VM-based CI/CD system built the way tech companies do *before* Kubernetes.**
> Covers Docker, GitHub Actions, GHCR, AWS EC2, IAM, SSM, Secrets Manager, Terraform, Node.js, and Next.js.

---

## 📌 Why this project exists

Most “DevOps projects” online jump straight to Kubernetes without understanding:

* build vs runtime configuration
* CI vs CD separation
* secrets management
* IAM vs static credentials
* frontend vs backend config differences

This project intentionally **starts from fundamentals** and implements **industry-accurate VM-based CI/CD**, the same pattern used by teams at scale **before moving to Kubernetes**.

---

## 🧠 Architecture Overview

```
Developer
   │
   ▼
GitHub Repository
   │
   ├── CI (GitHub Actions)
   │     ├── Lint & test
   │     ├── Build Docker images
   │     └── Push images to GHCR
   │
   └── CD (GitHub Actions via SSH)
         ├── Connect to EC2
         ├── Pull latest images
         ├── Deploy via Docker Compose
         └── Zero-downtime container restart
```

---

## 🧱 Tech Stack

### Application

* **Backend**: Node.js (API Gateway)
* **Frontend**: Next.js (Dashboard)
* **Database**: PostgreSQL (Neon)
* **Cache**: Redis

### DevOps / Infra

* **Docker** (multi-stage builds)
* **Docker Compose** (VM deployment)
* **GitHub Actions** (CI & CD)
* **GitHub Container Registry (GHCR)**
* **AWS EC2**
* **AWS IAM (role-based access)**
* **AWS SSM Parameter Store**
* **AWS Secrets Manager**
* **Terraform (Infrastructure as Code)**

---

## 🔐 Security & Secrets Model (Very Important)

This project follows **production-grade security rules**:

### ❌ What is NOT used

* No `.env` files in Git
* No AWS access keys in containers
* No secrets in GitHub Actions logs
* No `localhost` fallbacks in production

### ✅ What IS used

* **IAM Role attached to EC2**
* **AWS SSM Parameter Store** for non-secret config
* **AWS Secrets Manager** for sensitive values
* **Runtime secret loading inside containers**
* **GitHub Secrets only for CI/CD credentials**

> Containers authenticate to AWS using **instance metadata**, not static keys.

---

## 🔁 CI vs CD (Clear Separation)

### Continuous Integration (CI)

Triggered on every push:

* Lint & validate code
* Build Docker images
* Push images to GHCR with commit SHA tags

🚫 CI never deploys
🚫 CI never connects to servers

---

### Continuous Deployment (CD)

Triggered after CI success:

* SSH into EC2
* Pull exact image versions
* Deploy using Docker Compose
* Clean unused images

✅ Deterministic
✅ Repeatable
✅ Rollback-ready

---

## ⚙️ Runtime Configuration Strategy

### Backend (Node.js)

* Loads config & secrets **at container runtime**
* Uses:

  * SSM → non-secrets
  * Secrets Manager → sensitive values
* No rebuild required for config changes

### Frontend (Next.js)

* Uses a **runtime config API** (`/api/runtime-config`)
* Explicitly forces:

  * Node runtime
  * Dynamic execution (no build-time caching)
* Avoids `NEXT_PUBLIC_*` in production

> This solves the classic Next.js “env baked at build time” problem.

---

## 🏗 Infrastructure as Code (Terraform)

Terraform is used to:

* Provision EC2 instances
* Create IAM roles & policies
* Create SSM parameters & secrets
* Separate **dev / prod** using:

  * Workspaces
  * `*.tfvars` files

Secrets are never committed — only templates are.

---

## 📁 Repository Structure

```
.
├── gateway/                 # Node.js API Gateway
├── dashboard/               # Next.js Dashboard
├── docker/                  # Entrypoints & runtime loaders
├── deploy/
│   └── docker-compose.prod.yml
├── infra/
│   ├── ec2/                 # Terraform (VM, IAM, SSM)
│   └── envs/
│       ├── dev.tfvars.example
│       └── prod.tfvars.example
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
└── README.md
```

---

## 🧪 What This Project Demonstrates

✔ Real CI/CD separation
✔ Secure secret management
✔ Runtime vs build-time config clarity
✔ Docker mastery (ENTRYPOINT vs CMD)
✔ IAM-first security thinking
✔ Terraform environment isolation
✔ Production-ready Next.js config handling

---

## 🚧 Why VM-Based CI/CD First?

Before Kubernetes, teams **must** understand:

* Docker deeply
* Runtime configuration
* Secrets & IAM
* Deployment failure modes
* Rollbacks

This project intentionally **does not hide complexity behind Kubernetes**.

> Kubernetes is a multiplier — not a shortcut.

---

## 🛣 Roadmap

* [x] VM-based CI/CD
* [x] Runtime secrets via SSM
* [x] Terraform infra
* [ ] Health-check gated deployments
* [ ] Blue-green deploy on VM
* [ ] Kubernetes migration (same architecture)

---

## 🧑‍💻 About This Project

This repository reflects **how modern engineering teams actually deploy systems**, not simplified tutorials.

If you understand this project, you can:

* reason about Kubernetes
* design secure pipelines
* debug real production issues

---

## ⭐ Final Note

If you’re reviewing this repo as a hiring manager:

> This project was designed to demonstrate **systems thinking**, **security awareness**, and **production-grade DevOps practices**, not just tool usage.

---

If you want, next I can:

* add architecture diagrams
* add rollout / rollback docs
* convert this into a case-study style blog
* prepare interview talking points from this project

Just say the word 🚀
