export default async (request, context) => {
    // 1) التعامل مع طلبات CORS (OPTIONS)
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    // 2) التحقق من طريقة الطلب (Method)
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
            status: 405,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        });
    }

    // 3) قراءة متغيرات البيئة
    const binId = process.env.BIN_ID;
    const key = process.env.MASTER_KEY;

    if (!binId || !key) {
        return new Response(JSON.stringify({ error: "Missing env vars" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }

    try {
        // 4) قراءة الـ body (JSON)
        const body = await request.json();
        const authorId = body?.authorId;

        // 5) التحقق من وجود ونوع authorId
        if (!authorId || typeof authorId !== "string") {
            return new Response(JSON.stringify({ error: "Missing authorId" }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        // 6) جلب البيانات الحالية من JSONBin
        const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: {
                "X-Master-Key": key
            }
        });

        if (!getResponse.ok) {
            throw new Error("Failed to fetch data from JSONBin");
        }

        const data = await getResponse.json();
        let record = data.record;

        // 7) معالجة وبنية البيانات
        if (Array.isArray(record)) {
            record = {
                novels: record,
                users: [],
                community: [],
                messages: []
            };
        } else if (!record || typeof record !== "object") {
            record = {
                novels: [],
                users: [],
                community: [],
                messages: []
            };
        } else {
            if (!Array.isArray(record.users)) record.users = [];
            if (!Array.isArray(record.novels)) record.novels = [];
            if (!Array.isArray(record.community)) record.community = [];
            if (!Array.isArray(record.messages)) record.messages = [];
        }

        // 8) البحث عن المستخدم
        const userIndex = record.users.findIndex(u => u.authorId === authorId);
        if (userIndex === -1) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        // 9) تحديث حقل lastSeen
        const currentTimestamp = Date.now();
        record.users[userIndex].lastSeen = currentTimestamp;

        // 10) حفظ التعديل إلى JSONBin
        const putResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": key
            },
            body: JSON.stringify(record)
        });

        if (!putResponse.ok) {
            return new Response(JSON.stringify({ error: "Failed to save" }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }

        // 11) الاستجابة النهائية عند النجاح
        return new Response(JSON.stringify({
            ok: true,
            lastSeen: currentTimestamp
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        // 12) التعامل مع أي استثناءات غير متوقعة
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
};

export const config = { path: "/api/pulse" };
