export default async (request, context) => {
  const binId = process.env.BIN_ID;
  const key = process.env.MASTER_KEY;

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
};

export const config = {
  path: "/api/get"
};
