export async function onRequest(context) {
  const { env } = context;
  const binId = env.BIN_ID;
  const key = env.MASTER_KEY;

  if (!binId || !key) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const r = await fetch("https://api.jsonbin.io/v3/b/" + binId + "/latest", {
    headers: { "X-Master-Key": key },
    cache: "no-store"
  });

  const data = await r.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
