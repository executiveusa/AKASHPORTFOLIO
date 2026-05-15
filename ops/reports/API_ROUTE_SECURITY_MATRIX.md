# API Route Security Matrix

Default policy: AUTHENTICATED.

Use `npm run audit:routes` to list all route files and then classify each as PUBLIC/AUTHENTICATED/OPERATOR_OR_ADMIN/ADMIN_ONLY/CRON_ONLY/WEBHOOK_SIGNED/DISABLED_UNTIL_CONFIGURED.

High-risk domains (synthia, herald dispatch/execute, agent-zero, swarm, cli, openfang, shell/write/deploy/social/email/payment mutation routes) must be ADMIN_ONLY.
