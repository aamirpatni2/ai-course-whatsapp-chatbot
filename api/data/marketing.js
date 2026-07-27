const GRAPH_API_VERSION = "v20.0";
const CACHE_TTL_MS = 15 * 60 * 1000;

let cache = null;

function isConfigured() {
  return Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);
}

function actionValue(actions, matchType) {
  if (!Array.isArray(actions)) {
    return 0;
  }
  const match = actions.find((action) => action.action_type === matchType);
  return match ? Number(match.value) : 0;
}

function costForAction(costPerActionType, matchType) {
  if (!Array.isArray(costPerActionType)) {
    return null;
  }
  const match = costPerActionType.find((entry) => entry.action_type === matchType);
  return match ? Number(match.value) : null;
}

const LEAD_ACTION_TYPES = [
  "onsite_conversion.messaging_conversation_started_7d",
  "lead",
  "onsite_conversion.lead_grouped"
];

function extractLeads(row) {
  for (const actionType of LEAD_ACTION_TYPES) {
    const value = actionValue(row.actions, actionType);
    if (value > 0) {
      return {
        count: value,
        label: actionType,
        costPerLead: costForAction(row.cost_per_action_type, actionType)
      };
    }
  }
  return { count: 0, label: null, costPerLead: null };
}

export function formatAccountInsights(row) {
  if (!row) {
    return null;
  }
  const leads = extractLeads(row);
  return {
    spend: Number(row.spend || 0),
    impressions: Number(row.impressions || 0),
    clicks: Number(row.clicks || 0),
    cpc: row.cpc ? Number(row.cpc) : null,
    cpm: row.cpm ? Number(row.cpm) : null,
    ctr: row.ctr ? Number(row.ctr) : null,
    reach: Number(row.reach || 0),
    leads: leads.count,
    leadLabel: leads.label,
    costPerLead: leads.costPerLead,
    dateStart: row.date_start,
    dateStop: row.date_stop
  };
}

export function formatCampaignInsights(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((row) => {
    const leads = extractLeads(row);
    return {
      id: row.campaign_id,
      name: row.campaign_name,
      spend: Number(row.spend || 0),
      impressions: Number(row.impressions || 0),
      clicks: Number(row.clicks || 0),
      leads: leads.count,
      leadLabel: leads.label,
      costPerLead: leads.costPerLead
    };
  });
}

async function fetchGraphApi(path, params) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok || body.error) {
    const message = body.error ? body.error.message : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return body;
}

export async function getMarketingInsights({ forceRefresh = false } = {}) {
  if (!isConfigured()) {
    return { connected: false };
  }

  if (!forceRefresh && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const accountId = process.env.META_AD_ACCOUNT_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  try {
    const [accountBody, campaignBody] = await Promise.all([
      fetchGraphApi(`act_${accountId}/insights`, {
        fields: "spend,impressions,clicks,cpc,cpm,ctr,reach,actions,cost_per_action_type",
        date_preset: "last_30d",
        access_token: accessToken
      }),
      fetchGraphApi(`act_${accountId}/insights`, {
        level: "campaign",
        fields: "campaign_id,campaign_name,spend,impressions,clicks,actions,cost_per_action_type",
        date_preset: "last_30d",
        access_token: accessToken
      })
    ]);

    const data = {
      connected: true,
      error: null,
      account: formatAccountInsights(accountBody.data && accountBody.data[0]),
      campaigns: formatCampaignInsights(campaignBody.data)
    };

    cache = { data, fetchedAt: Date.now() };
    return data;
  } catch (error) {
    return { connected: true, error: error.message, account: null, campaigns: [] };
  }
}
