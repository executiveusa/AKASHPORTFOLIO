#!/usr/bin/env python3
"""Probe provider credentials pulled from Infisical. Prints names + status only. Usage: INFISICAL_TOKEN=... python3 scripts/probe-secrets.py [workspaceId] [env]"""
import os,sys,json,urllib.request,urllib.parse
tok=os.environ['INFISICAL_TOKEN']; ws=sys.argv[1] if len(sys.argv)>1 else '76894224-eb02-4c6f-8ebe-d25fd172c861'; env=sys.argv[2] if len(sys.argv)>2 else 'prod'
q=urllib.parse.urlencode({'workspaceId':ws,'environment':env,'secretPath':'/','recursive':'true'})
d=json.load(urllib.request.urlopen(urllib.request.Request(f'https://app.infisical.com/api/v3/secrets/raw?{q}',headers={'Authorization':f'Bearer {tok}'})))
S={s['secretKey']:s['secretValue'] for s in d['secrets']}
def call(url,h): 
    try:
        with urllib.request.urlopen(urllib.request.Request(url,headers=h),timeout=15) as x: return x.status
    except urllib.error.HTTPError as e: return e.code
    except Exception as e: return type(e).__name__
B=lambda k,u,x=None: call(u,{**{'Authorization':f'Bearer {S[k]}'},**(x or {})}) if k in S else 'MISSING'
P={'ANTHROPIC_API_KEY':lambda:call('https://api.anthropic.com/v1/models',{'x-api-key':S.get('ANTHROPIC_API_KEY',''),'anthropic-version':'2023-06-01'}),
'OPEN_ROUTER_API':lambda:B('OPEN_ROUTER_API','https://openrouter.ai/api/v1/auth/key'),'OPENAI_API_KEY':lambda:B('OPENAI_API_KEY','https://api.openai.com/v1/models'),
'RIME_API_TOKEN':lambda:B('RIME_API_TOKEN','https://users.rime.ai/data/voices/all-v2.json'),'STRIPE_SECRET_KEY':lambda:B('STRIPE_SECRET_KEY','https://api.stripe.com/v1/balance'),
'GH_PAT':lambda:B('GH_PAT','https://api.github.com/user'),'NOTION_API_TOKEN':lambda:B('NOTION_API_TOKEN','https://api.notion.com/v1/users/me',{'Notion-Version':'2022-06-28'}),
'VERCEL_API_TOKEN':lambda:B('VERCEL_API_TOKEN','https://api.vercel.com/v2/user'),'FIRECRAWL_API_TOKEN':lambda:B('FIRECRAWL_API_TOKEN','https://api.firecrawl.dev/v1/team/credit-usage'),
'SUPABASE':lambda:call(S.get('SUPABASE_URL','').rstrip('/')+'/auth/v1/health',{'apikey':S.get('NEXT_PUBLIC_SUPABASE_ANON_KEY','')}) if S.get('SUPABASE_URL') else 'MISSING',
'MERCURY2_API_TOKEN':lambda:B('MERCURY2_API_TOKEN','https://api.inceptionlabs.ai/v1/models'),'DEEPSEEK_API_KEY':lambda:B('DEEPSEEK_API_KEY','https://api.deepseek.com/models'),
'RESEND_API_TOKEN':lambda:B('RESEND_API_TOKEN','https://api.resend.com/domains'),'HEY_GEN_API':lambda:call('https://api.heygen.com/v2/user/remaining_quota',{'X-Api-Key':S.get('HEY_GEN_API','')}),
'RUNWAY_API_KEY':lambda:B('RUNWAY_API_KEY','https://api.dev.runwayml.com/v1/organization',{'X-Runway-Version':'2024-11-06'})}
for k,f in P.items():
    s=f(); print(f"{k:28} {'OK' if s in (200,201) else s}")
