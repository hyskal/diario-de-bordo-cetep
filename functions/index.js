const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

setGlobalOptions({maxInstances: 10});

const SML_API_KEY = defineSecret("SML_API_KEY");
const SML_BASE = "https://us-east1-sml-storage.cloudfunctions.net";

const CONTENT_TYPES = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

exports.smlUpload = onRequest(
    {
        secrets: ["SML_API_KEY"],
        cors: [
            "https://diario-de-bordo-cetep.web.app",
            "https://diario-de-bordo-cetep.firebaseapp.com",
            "http://localhost",
        ],
    },
    async (req, res) => {
        if (req.method !== "POST") {
            return res.status(405).json({success: false, error: "Method not allowed"});
        }

        try {
            const {filename, turma, aluno, fileBase64} = req.body;

            if (!filename) {
                return res.status(400).json({success: false, error: "filename é obrigatório"});
            }

            const apiKey = SML_API_KEY.value();

            // Passo 1 — solicitar signed URL
            const urlRes = await fetch(`${SML_BASE}/getUploadUrl`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "x-api-key": apiKey},
                body: JSON.stringify({
                    projeto: "cetep",
                    filename,
                    tag1: turma || "",
                    tag2: aluno || "",
                    tag3: "",
                }),
            });

            const urlData = await urlRes.json();
            if (!urlData.success) {
                logger.error("smlUpload getUploadUrl falhou", urlData);
                return res.status(500).json({success: false, error: urlData.error});
            }

            const {uploadUrl, docId} = urlData;
            const ext = filename.split(".").pop().toLowerCase();
            const contentType = CONTENT_TYPES[ext] || "application/pdf";

            // Passo 2 — PUT direto ao Storage
            const fileBuffer = Buffer.from(fileBase64, "base64");
            const putRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: {"Content-Type": contentType},
                body: fileBuffer,
            });

            if (!putRes.ok) {
                logger.error("smlUpload PUT falhou", putRes.status);
                return res.status(500).json({success: false, error: `PUT falhou: ${putRes.status}`});
            }

            // Passo 3 — confirmar upload
            const confirmRes = await fetch(`${SML_BASE}/confirmUpload`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "x-api-key": apiKey},
                body: JSON.stringify({docId}),
            });

            const result = await confirmRes.json();
            if (!result.success) {
                logger.error("smlUpload confirmUpload falhou", result);
                return res.status(500).json({success: false, error: result.error});
            }

            logger.info("smlUpload concluído", {filename, url: result.url});
            return res.status(200).json({success: true, url: result.url});
        } catch (err) {
            logger.error("smlUpload erro interno", err);
            return res.status(500).json({success: false, error: err.message});
        }
    }
);
