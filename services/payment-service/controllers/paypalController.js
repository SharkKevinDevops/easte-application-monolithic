"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutePayment = exports.PaypalService = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const baseURL = process.env.PAYPAL_API;
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${baseURL}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: "grant_type=client_credentials",
        });
        if (!response.ok) {
            throw new Error("Failed to get access token");
        }
        const data = yield response.json();
        return data.access_token;
    });
}
const PaypalService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    function createPayment(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${baseURL}/v1/payments/payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    intent: "sale",
                    payer: {
                        payment_method: "paypal",
                    },
                    transactions: [
                        {
                            amount: {
                                total: req.body.amount,
                                currency: "USD",
                            },
                            description: "Payment description",
                            invoice_number: req.body.applicationId,
                        },
                    ],
                    redirect_urls: {
                        return_url: `http://localhost:3000/tenants/applications?applicationId=${req.body.applicationId}`,
                        cancel_url: "http://localhost:3000/tenants/applications",
                    },
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to create payment");
            }
            const data = yield response.json();
            return data;
        });
    }
    try {
        const accessToken = yield getAccessToken();
        const payment = yield createPayment(accessToken);
        res.json(payment);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating payment: ${error.message}` });
    }
});
exports.PaypalService = PaypalService;
const ExecutePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId, payerId, applicationId } = req.body;
    try {
        const accessToken = yield getAccessToken();
        const response = yield fetch(`${baseURL}/v1/payments/payment/${paymentId}/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ payer_id: payerId }),
        });
        if (!response.ok) {
            const errorData = yield response.json();
            return res.status(400).json({ message: "Payment execution failed", error: errorData });
        }
        // Thanh toán thành công, cập nhật trạng thái ứng dụng
        yield prisma.application.update({
            where: { id: applicationId },
            data: { status: "Approved" },
        });
        res.status(200).json({ message: "Payment executed and application updated" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.ExecutePayment = ExecutePayment;
