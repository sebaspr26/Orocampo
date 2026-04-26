import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import 'admin_dashboard.dart';
import 'admin_ventas.dart';
import 'admin_pagos.dart';
import 'admin_devoluciones.dart';
import 'admin_inventario.dart';
import 'admin_clientes.dart';
import 'admin_caja.dart';
import 'admin_rutas.dart';
import 'admin_motos.dart';
import 'admin_reportes.dart';
import 'admin_tracking.dart';

class AdminHome extends StatefulWidget {
  const AdminHome({super.key});
  @override
  State<AdminHome> createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  int _index = 0;

  static const _sections = [
    _Section('Dashboard', Icons.dashboard_rounded),
    _Section('Ventas', Icons.receipt_long_rounded),
    _Section('Pagos', Icons.payments_rounded),
    _Section('Devoluciones', Icons.assignment_return_rounded),
    _Section('Inventario', Icons.inventory_2_rounded),
    _Section('Clientes', Icons.people_rounded),
    _Section('Caja', Icons.point_of_sale_rounded),
    _Section('Rutas', Icons.route_rounded),
    _Section('Motos', Icons.two_wheeler_rounded),
    _Section('Rastreo', Icons.my_location_rounded),
    _Section('Reportes', Icons.bar_chart_rounded),
  ];

  static const _pages = <Widget>[
    AdminDashboard(),
    AdminVentas(),
    AdminPagos(),
    AdminDevoluciones(),
    AdminInventario(),
    AdminClientes(),
    AdminCaja(),
    AdminRutas(),
    AdminMotos(),
    AdminTracking(),
    AdminReportes(),
  ];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final initials = (user?.name ?? 'AD').split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        title: Text(_sections[_index].label, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primaryDark, fontSize: 18, letterSpacing: 1)),
      ),
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: SafeArea(
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [AppColors.primaryDark, Color(0xFF8B7300)]),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(14)),
                      child: Center(child: Text(initials, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white))),
                    ),
                    const SizedBox(height: 12),
                    Text(user?.name ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                    Text(user?.role ?? '', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.7))),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  padding: EdgeInsets.zero,
                  children: [
                    ..._sections.asMap().entries.map((e) => ListTile(
                      leading: Icon(e.value.icon, color: _index == e.key ? AppColors.primaryDark : AppColors.muted, size: 22),
                      title: Text(e.value.label, style: TextStyle(fontWeight: _index == e.key ? FontWeight.w700 : FontWeight.w500, color: _index == e.key ? AppColors.primaryDark : AppColors.dark, fontSize: 14)),
                      selected: _index == e.key,
                      selectedTileColor: AppColors.primary.withOpacity(0.08),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 2),
                      onTap: () { setState(() => _index = e.key); Navigator.pop(context); },
                    )),
                    const Divider(height: 32),
                    ListTile(
                      leading: const Icon(Icons.logout_rounded, color: AppColors.error, size: 22),
                      title: const Text('Cerrar sesión', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600, fontSize: 14)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                      onTap: () => auth.logout(),
                    ),
                  ],
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
  const _Section(this.label, this.icon);
}
