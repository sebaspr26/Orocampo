import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/ventas_provider.dart';
import '../providers/pagos_provider.dart';
import '../providers/devoluciones_provider.dart';
import '../providers/ruta_provider.dart';
import '../widgets/connectivity_banner.dart';
import '../widgets/sync_indicator.dart';
import '../services/location_service.dart';
import 'tabs/dashboard_tab.dart';
import 'tabs/ruta_tab.dart';
import 'tabs/ventas_tab.dart';
import 'tabs/pagos_tab.dart';
import 'tabs/devoluciones_tab.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  bool _dataLoaded = false;

  final _tabs = const [DashboardTab(), RutaTab(), VentasTab(), PagosTab(), DevolucionesTab()];

  @override
  void initState() {
    super.initState();
    LocationService.instance.start();
  }

  @override
  void dispose() {
    LocationService.instance.stop();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_dataLoaded) {
      _dataLoaded = true;
      _loadAllData();
    }
  }

  Future<void> _loadAllData() async {
    final ventas = context.read<VentasProvider>();
    final pagos = context.read<PagosProvider>();
    final devoluciones = context.read<DevolucionesProvider>();
    final ruta = context.read<RutaProvider>();

    await Future.wait([
      ventas.loadData(),
      pagos.loadData(),
      devoluciones.loadData(),
      ruta.loadRuta(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final initials = (auth.user?.name ?? 'DO').split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: const Text(
          'OROCAMPO',
          style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.primaryDark, fontSize: 18, letterSpacing: 3),
        ),
        actions: [
          const SyncIndicator(),
          const SizedBox(width: 8),
          PopupMenuButton<String>(
            offset: const Offset(0, 48),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            onSelected: (value) {
              if (value == 'logout') auth.logout();
            },
            itemBuilder: (_) => [
              PopupMenuItem(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(auth.user?.name ?? '', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.dark, fontSize: 14)),
                    Text(auth.user?.email ?? '', style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(value: 'logout', child: Row(
                children: [
                  Icon(Icons.logout_rounded, size: 18, color: AppColors.error),
                  SizedBox(width: 8),
                  Text('Cerrar sesión', style: TextStyle(color: AppColors.error)),
                ],
              )),
            ],
            child: Container(
              margin: const EdgeInsets.only(right: 16),
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.15),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary.withOpacity(0.3), width: 1.5),
              ),
              child: Center(
                child: Text(initials, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          const ConnectivityBanner(),
          Expanded(child: _tabs[_currentIndex]),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.black12,
        elevation: 8,
        indicatorColor: AppColors.primary.withOpacity(0.18),
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined, color: AppColors.muted), selectedIcon: Icon(Icons.dashboard_rounded, color: AppColors.primaryDark), label: 'Panel'),
          NavigationDestination(icon: Icon(Icons.route_outlined, color: AppColors.muted), selectedIcon: Icon(Icons.route_rounded, color: AppColors.primaryDark), label: 'Ruta'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined, color: AppColors.muted), selectedIcon: Icon(Icons.receipt_long_rounded, color: AppColors.primaryDark), label: 'Ventas'),
          NavigationDestination(icon: Icon(Icons.payments_outlined, color: AppColors.muted), selectedIcon: Icon(Icons.payments_rounded, color: AppColors.primaryDark), label: 'Pagos'),
          NavigationDestination(icon: Icon(Icons.assignment_return_outlined, color: AppColors.muted), selectedIcon: Icon(Icons.assignment_return_rounded, color: AppColors.primaryDark), label: 'Devol.'),
        ],
      ),
    );
  }
}
