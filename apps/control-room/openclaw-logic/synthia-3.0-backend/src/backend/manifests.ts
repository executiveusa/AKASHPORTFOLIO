import type { CapabilityManifest } from './contracts';

export const capabilityManifests: CapabilityManifest[] = [
  {
    id: 'aionui.assistant.surface',
    name: 'Aion UI Assistant Surface',
    version: '1.0.0',
    provider: 'AionUi-main',
    modulePath: 'Synthia-3.0-opensource/AionUi-main',
    description: 'Conversational assistant UX surfaces and interaction workflows.',
    tags: ['assistant', 'ui', 'workflow', 'chat'],
    interfaces: {
      kind: 'http',
      entrypoint: '/capabilities/aionui',
    },
    economics: {
      baseCostUsd: 0.007,
      avgLatencyMs: 850,
    },
    security: {
      dataClassification: 'internal',
      requiredScopes: ['capability:aionui:execute'],
    },
    tenancy: {
      supportsWhitelabel: true,
      supportsLocales: ['en', 'es'],
    },
  },
  {
    id: 'postiz.social.automation',
    name: 'Postiz Social Automation',
    version: '1.0.0',
    provider: 'postiz-app-main',
    modulePath: 'Synthia-3.0-opensource/postiz-app-main',
    description: 'Content scheduling, social automation, and publishing orchestration.',
    tags: ['social', 'automation', 'publishing', 'content'],
    interfaces: {
      kind: 'http',
      entrypoint: '/capabilities/postiz',
    },
    economics: {
      baseCostUsd: 0.012,
      avgLatencyMs: 1100,
    },
    security: {
      dataClassification: 'restricted',
      requiredScopes: ['capability:postiz:execute'],
    },
    tenancy: {
      supportsWhitelabel: true,
      supportsLocales: ['en', 'es', 'pt'],
    },
  },
  {
    id: 'gastown.content.pipeline',
    name: 'Gastown Content Pipeline',
    version: '1.0.0',
    provider: 'gastown-main',
    modulePath: 'Synthia-3.0-opensource/gastown-main',
    description: 'Deterministic content processing and transformation pipeline.',
    tags: ['content', 'pipeline', 'processing'],
    interfaces: {
      kind: 'cli',
      entrypoint: 'cmd/gastown',
    },
    economics: {
      baseCostUsd: 0.004,
      avgLatencyMs: 500,
    },
    security: {
      dataClassification: 'internal',
      requiredScopes: ['capability:gastown:execute'],
    },
    tenancy: {
      supportsWhitelabel: true,
      supportsLocales: ['en', 'es'],
    },
  },
  {
    id: 'pauli.story.toolkit',
    name: 'Pauli Story Toolkit',
    version: '1.0.0',
    provider: 'pauli-story-tool-kit-main',
    modulePath: 'Synthia-3.0-opensource/pauli-story-tool-kit-main',
    description: 'Narrative generation and story editing utilities.',
    tags: ['story', 'narrative', 'editing', 'content'],
    interfaces: {
      kind: 'sdk',
      entrypoint: 'storytoolkitai',
    },
    economics: {
      baseCostUsd: 0.003,
      avgLatencyMs: 450,
    },
    security: {
      dataClassification: 'internal',
      requiredScopes: ['capability:pauli:execute'],
    },
    tenancy: {
      supportsWhitelabel: true,
      supportsLocales: ['en', 'es'],
    },
  },
];
