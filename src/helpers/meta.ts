export const getMetaAdSpendForCurrentMonth = async () => {
  const accessToken = process.env.META_ADS_ACCESS_TOKEN;
  const adAccountId = process.env.META_ADS_ACCOUNT_ID; // incluye "act_" al principio

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const url = `https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=spend&time_range[since]=${start}&time_range[until]=${end}&access_token=${accessToken}`;

  const res = await fetch(url);
  const data = await res.json();
  console.log({ data });
  if (!res.ok || !data.data) {
    console.error(" gasto en Ads de Meta", data);
    return 0;
  }

  return parseFloat(data.data[0]?.spend ?? "0");
};
