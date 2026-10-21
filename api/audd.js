export default async function handler(req, res) {
	if (req.method !== "POST") {
		res.status(405).json({ status: "error", error: "Method not allowed" });
		return;
	}

	const token = process.env.AUDD_API_TOKEN;
	if (!token) {
		res.status(500).json({ status: "error", error: "AUDD_API_TOKEN is not set" });
		return;
	}

	try {
		const chunks = [];
		for await (const chunk of req) {
			chunks.push(chunk);
		}
		const audioBuffer = Buffer.concat(chunks);

		const formData = new FormData();
		formData.append("api_token", token);
		formData.append("file", new Blob([audioBuffer]), "audio.webm");
		formData.append("return", "apple_music,spotify");

		const auddResponse = await fetch("https://api.audd.io/", {
			method: "POST",
			body: formData,
		});
		const data = await auddResponse.json();

		res.status(200).json(data);
	} catch (err) {
		console.error("AudD request failed:", err);
		res.status(502).json({ status: "error", error: "Recognition request failed" });
	}
}