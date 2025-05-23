import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "../middleware/authMiddleware";
/* ROUTE IMPORT */
import tenantRoutes from "../tenant-service/routes/tenantRoutes";
import managerRoutes from "../manager-service/routes/managerRoutes";
import propertyRoutes from "../property-service/routes/propertyRoutes";
import leaseRoutes from "../lease-service/routes/leaseRoutes";
import applicationRoutes from "../application-service/routes/applicationRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

/* SERVER */
const port = Number(process.env.ROUTE_PORT) || 3007;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});