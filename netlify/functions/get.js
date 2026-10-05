export default async (request, context) => {
  return new Response(JSON.stringify({
    hasBinId: !!process.env.BIN_ID,
    hasMasterKey: !!process.env.MASTER_KEY,
    binIdValue: process.env.BIN_ID ? process.env.BIN_ID.substring(0, 5) + "..." : null,
    nodeEnv: process.env.NODE_ENV || "none",
    allKeys: Object.keys(process.env).filter(k => 
      k.includes("BIN") || k.includes("MASTER") || k.includes("KEY")
    )
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

export const config = {
  path: "/api/get"
};
