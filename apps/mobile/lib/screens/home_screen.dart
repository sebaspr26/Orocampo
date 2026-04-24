import 'package:flutter/material.dart';
import 'tabs/dashboard_tab.dart';
import 'tabs/ventas_tab.dart';
import 'tabs/pagos_tab.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const _gold = Color(0xFFD4AF37);
  static const _darkGold = Color(0xFF735C00);

  int _currentIndex = 0;

  final _tabs = const [DashboardTab(), VentasTab(), PagosTab()];

  void _logout() {
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCF9F8),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFCF9F8),
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        title: const Text(
          'OROCAMPO',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            color: _darkGold,
            fontSize: 18,
            letterSpacing: 3,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Color(0xFF1C1B1B)),
            onPressed: () {},
          ),
          GestureDetector(
            onTap: _logout,
            child: Container(
              margin: const EdgeInsets.only(right: 16),
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: _gold.withOpacity(0.15),
                shape: BoxShape.circle,
                border: Border.all(color: _gold.withOpacity(0.3), width: 1.5),
              ),
              child: const Center(
                child: Text(
                  'DO',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: _darkGold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: _tabs[_currentIndex],
      bottomNavigationBar: NavigationBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.black12,
        elevation: 8,
        indicatorColor: _gold.withOpacity(0.18),
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined, color: Color(0xFF7F7663)),
            selectedIcon: Icon(Icons.dashboard_rounded, color: _darkGold),
            label: 'Panel',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined, color: Color(0xFF7F7663)),
            selectedIcon: Icon(Icons.receipt_long_rounded, color: _darkGold),
            label: 'Ventas',
          ),
          NavigationDestination(
            icon: Icon(Icons.payments_outlined, color: Color(0xFF7F7663)),
            selectedIcon: Icon(Icons.payments_rounded, color: _darkGold),
            label: 'Pagos',
          ),
        ],
      ),
    );
  }
}
