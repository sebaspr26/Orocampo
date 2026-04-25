import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import rolesRouter from "./routes/roles";
import productTypesRouter from "./routes/productTypes";
import inventoryRouter from "./routes/inventory";
import clientesRouter from "./routes/clientes";
import ventasRouter from "./routes/ventas";
import pagosRouter from "./routes/pagos";
import notificationsRouter from "./routes/notifications";
import reportesRouter from "./routes/reportes";
import rutasRouter from "./routes/rutas";

const app = express();
const PORT = process.env.PORT ?? 4001;

app.use(cors({
  origin: process.env.WEB_URL ?? "http://localhost:4000",
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/roles", rolesRouter);
app.use("/product-types", productTypesRouter);
app.use("/inventory", inventoryRouter);
app.use("/clientes", clientesRouter);
app.use("/ventas", ventasRouter);
app.use("/pagos", pagosRouter);
app.use("/notifications", notificationsRouter);
app.use("/reportes", reportesRouter);
app.use("/rutas", rutasRouter);

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
