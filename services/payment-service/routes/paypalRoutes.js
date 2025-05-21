"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paypalController_1 = require("../controllers/paypalController");
const router = express_1.default.Router();
// Create a payment
router.post("/execute-payment", paypalController_1.ExecutePayment); // Thực thi thanh toán
router.post("/", paypalController_1.PaypalService); // Tạo payment
exports.default = router;
