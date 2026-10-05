export default async (request, context) => {
  if (request.method !== "PUT" && request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const binId = process.env.BIN_ID;
  const key = process.env.MASTER_KEY;

  if (!binId || !key) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const body = await request.text();

  const r = await fetch("https://api.jsonbin.io/v3/b/" + binId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": key
    },
    body: body
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
  path: "/api/save"
};
