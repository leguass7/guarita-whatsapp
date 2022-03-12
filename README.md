# guarita-whatsapp

[![.github/workflows/deploy-ssh.yml](https://github.com/leguass7/guarita-whatsapp/actions/workflows/deploy-ssh.yml/badge.svg)](https://github.com/leguass7/guarita-whatsapp/actions/workflows/deploy-ssh.yml) [![.github/workflows/develop.yml](https://github.com/leguass7/guarita-whatsapp/actions/workflows/develop.yml/badge.svg?branch=develop)](https://github.com/leguass7/guarita-whatsapp/actions/workflows/develop.yml)

Serviço para entrega de mensagem no whatsapp via [MAXBOT](https://mbr.maxbot.com.br/doc-api-v1.php)

## Motivação

Estamos tendo problemas nas entragas de mensagens pelo servidor da AVATAR, está muito dificil depurar o motivo.
Precisamos de um server responsável apenas por essas entregas.

---

### [Escopo do projeto](./docs/scope.md)

## Referências

 - Actions Github
   - https://hoohoo.top/blog/20210525232300-github-action-auto-ssh-to-host-and-excute-script/
   - https://zellwk.com/blog/github-actions-deploy/
   - https://firefart.at/post/using-mysql-service-with-github-actions/
   - https://www.vultr.com/?ref=8956372-8H

---

### Cron

[Cron generator](https://crontab.cronhub.io/)

```bash

# ┌──────────── minute
# │ ┌────────── hour
# │ │ ┌──────── day of month
# │ │ │ ┌────── month
# │ │ │ │ ┌──── day of week
# │ │ │ │ │
# │ │ │ │ │
# * * * * * 
```

```javascript
// Repeat payment job once every day at 3:15 (am)
queue.add(paymentsData, { repeat: { cron: '15 3 * * *' } });

// Every 5 minutes
queue.add(paymentsData, { repeat: { cron: '*/5 * * * *' } });
```