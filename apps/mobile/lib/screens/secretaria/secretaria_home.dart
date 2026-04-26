import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../admin/admin_dashboard.dart';
import '../admin/admin_ventas.dart';
import '../admin/admin_pagos.dart';
import '../admin/admin_devoluciones.dart';
import '../admin/admin_inventario.dart';
import '../admin/admin_clientes.dart';
import '../admin/admin_caja.dart';
import '../admin/admin_rutas.dart';
import '../admin/admin_reportes.dart';
import 'secretaria_precios.dart';
import 'secretaria_productos.dart';
import '../admin/admin_tracking.dart';

class SecretariaHome extends StatefulWidget {
  const SecretariaHome({super.key});
  @override
  State<SecretariaHome> createState() => _SecretariaHomeState();
}

class _SecretariaHomeState extends State<SecretariaHome> {
  int _index = 0;

  static const _sections = [
    _Section('Dashboard', Icons.dashboard_rounded, 'Resumen del día'),
    _Section('Inventario', Icons.inventory_2_rounded, 'Stock y entradas'),
    _Section('Ventas', Icons.receipt_long_rounded, 'Registro de ventas'),
    _Section('Pagos', Icons.payments_rounded, 'Cobros del día'),
    _Section('Clientes', Icons.people_rounded, 'Gestión de clientes'),
    _Section('Devoluciones', Icons.assignment_return_rounded, 'Productos devueltos'),
    _Section('Caja', Icons.point_of_sale_rounded, 'Cierre de caja'),
    _Section('Precios', Icons.sell_rounded, 'Listas de precios'),
    _Section('Productos', Icons.category_rounded, 'Catálogo'),
    _Section('Rutas', Icons.route_rounded, 'Rutas de reparto'),
    _Section('Rastreo', Icons.my_location_rounded, 'Ubicacion domiciliarios'),
    _Section('Reportes', Icons.bar_chart_rounded, 'Informes'),
  ];

  static const _pages = <Widget>[
    AdminDashboard(),
    AdminInventario(),
    AdminVentas(),
    AdminPagos(),
    AdminClientes(),
    AdminDevoluciones(),
    AdminCaja(),
    SecretariaPrecios(),
    SecretariaProductos(),
    AdminRutas(),
    AdminTracking(),
    AdminReportes(),
  ];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final initials = (user?.name ?? 'SE').split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        title: Text(_sections[_index].label, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primaryDark, fontSize: 18, letterSpacing: 1)),
      ),
      drawer: Drawer(
        backgroundColor: AppColors.surface,
        child: SafeArea(
          child: Column(
            children: [
              // Header secretaria — fondo suave
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))],
                ),
                child: Row(
                  children: [
                    Container(
                      width: 52, height: 52,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AppColors.primary, AppColors.primaryDark], begin: Alignment.topLeft, end: Alignment.bottomRight),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(child: Text(initials, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white))),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user?.name ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark)),
                          const SizedBox(height: 2),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
                            child: const Text('Secretaria', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryDark, letterSpacing: 0.5)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  children: [
                    ..._sections.asMap().entries.map((e) {
                      final selected = _index == e.key;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 2),
                        child: ListTile(
                          leading: Container(
                            width: 36, height: 36,
                            decoration: BoxDecoration(
                              color: selected ? AppColors.primaryDark : AppColors.inputBg,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(e.value.icon, color: selected ? Colors.white : AppColors.muted, size: 18),
                          ),
                          title: Text(e.value.label, style: TextStyle(fontWeight: selected ? FontWeight.w700 : FontWeight.w500, color: selected ? AppColors.primaryDark : AppColors.dark, fontSize: 14)),
                          subtitle: Text(e.value.subtitle, style: TextStyle(fontSize: 10, color: selected ? AppColors.primaryDark.withOpacity(0.6) : AppColors.muted)),
                          selected: selected,
                          selectedTileColor: AppColors.primary.withOpacity(0.06),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                          visualDensity: VisualDensity.compact,
                          onTap: () { setState(() => _index = e.key); Navigator.pop(context); },
                        ),
                      );
                    }),
                  ],
                ),
              ),
              // Logout
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => auth.logout(),
                    icon: const Icon(Icons.logout_rounded, size: 18),
                    label: const Text('Cerrar sesión'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: BorderSide(color: AppColors.error.withOpacity(0.3)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      body: _pages[_index],
    );
  }
}

class _Section {
  final String label;
  final IconData icon;
  final String subtitle;
  const _Section(this.label, this.icon, this.subtitle);
}
