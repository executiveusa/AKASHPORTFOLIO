/**
 * Site Factory HERALD Tool Registration
 * Registers all 6 Site Factory tools in the HERALD tool registry
 */

import { registerTool } from '../herald/tool-registry';

export async function registerSiteFactoryTools(): Promise<void> {
  const backendBase = process.env.NEXT_PUBLIC_SYNTHIA_BACKEND ?? 'http://localhost:8080';

  const tools = [
    {
      tool_id: 'firecrawl_scrape_real',
      tool_name: 'FireCrawl Business Scraper',
      executor_kind: 'http_api' as const,
      capabilities: ['scraping', 'competitor_intel', 'seo_audit', 'copy_extraction'],
      cli_signature: 'firecrawl --url <url> [--competitor-mode] [--niche <niche>] [--city <city>]',
      auth_required: true,
      auth_env_key: 'FIRECRAWL_API_KEY',
      executor_config: {
        base_url: backendBase,
        path_template: '/firecrawl/scrape',
        method: 'POST',
      },
      version: '2.0.0',
    },
    {
      tool_id: 'kupuri_research_full',
      tool_name: 'Kupuri Competitor Intelligence',
      executor_kind: 'http_api' as const,
      capabilities: ['competitor_intel', 'site_factory', 'latam_research', 'blueprint_generation'],
      cli_signature: 'kupuri-research --niche <niche> --city <city> [--url <url>] [--business-name <name>]',
      auth_required: true,
      auth_env_key: 'FIRECRAWL_API_KEY',
      executor_config: {
        base_url: backendBase,
        path_template: '/kupuri/research',
        method: 'POST',
      },
      version: '2.0.0',
    },
    {
      tool_id: 'nano_banana_2_image',
      tool_name: 'Nano Banana 2 Hero Image Generator',
      executor_kind: 'http_api' as const,
      capabilities: ['image_generation', 'site_factory', 'hero_images', 'nano_banana', 'gemini'],
      cli_signature: 'nano-banana-2 --prompt <prompt> [--style photorealistic] [--resolution 2K] [--aspect-ratio 16:9]',
      auth_required: true,
      auth_env_key: 'GEMINI_API_KEY',
      executor_config: {
        base_url: backendBase,
        path_template: '/site-factory/generate-image',
        method: 'POST',
      },
      version: '1.0.0',
    },
    {
      tool_id: 'kling_3_animation',
      tool_name: 'Kling 3.0 Hero Animator',
      executor_kind: 'http_api' as const,
      capabilities: ['video_generation', 'site_factory', 'hero_animation', 'before_after', 'kling'],
      cli_signature: 'kling-animate --before <url> --after <url> --niche <niche> [--duration 5]',
      auth_required: true,
      auth_env_key: 'FAL_API_KEY',
      executor_config: {
        base_url: backendBase,
        path_template: '/site-factory/animate-hero',
        method: 'POST',
      },
      version: '1.0.0',
    },
    {
      tool_id: 'site_factory_batch',
      tool_name: 'Site Factory Batch Runner',
      executor_kind: 'http_api' as const,
      capabilities: ['site_factory', 'batch_build', 'auto_deploy', 'latam_sites'],
      cli_signature: 'site-factory --niche <niche> --city <city> [--count 10] [--auto-deploy]',
      auth_required: false,
      executor_config: {
        base_url: backendBase,
        path_template: '/site-factory/batch',
        method: 'POST',
      },
      version: '1.0.0',
    },
    {
      tool_id: 'google_maps_discovery',
      tool_name: 'Google Maps Business Discovery',
      executor_kind: 'http_api' as const,
      capabilities: ['business_discovery', 'site_factory', 'google_maps', 'latam'],
      cli_signature: 'discover-businesses --niche <niche> --city <city> [--count 10]',
      auth_required: true,
      auth_env_key: 'GOOGLE_MAPS_API_KEY',
      executor_config: {},
      version: '2.0.0',
    },
  ];

  for (const tool of tools) {
    await registerTool(tool);
  }

  console.log(`[herald] 🏭 ${tools.length} Site Factory tools registered`);
}
