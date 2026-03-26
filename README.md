# Wapika

Application de suivi de colis pour agence de livraison.

## Objectif

Permettre à une agence de livraison de tenir ses clients informés de l'état de leurs colis, depuis l'expédition jusqu'à la réception.

L'agence enregistre chaque client (nom, téléphone, email) ainsi que le numéro de suivi de son colis. À chaque mise à jour de statut, le client reçoit automatiquement une notification par **WhatsApp** et par **email**.

## Ce que fait l'application

- **Vitrine publique** : présente les services de l'agence aux visiteurs
- **Back-office** : permet aux agents de gérer les clients, enregistrer les colis et mettre à jour leur traçabilité

## Stack

- **AdonisJS** (backend & templating)
- **PostgreSQL** (base de données)
- **WhatsApp** via WasenderAPI
- **Email** via API (Resend et Mailtrap)
