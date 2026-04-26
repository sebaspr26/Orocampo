import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'config/app_theme.dart';
import 'services/connectivity_service.dart';
import 'services/sync_service.dart';
import 'services/notification_service.dart';
import 'providers/auth_provider.dart';
import 'providers/connectivity_provider.dart';
import 'providers/sync_provider.dart';
import 'providers/ventas_provider.dart';
import 'providers/pagos_provider.dart';
import 'providers/devoluciones_provider.dart';
import 'providers/ruta_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/admin/admin_home.dart';
import 'screens/secretaria/secretaria_home.dart';
import 'widgets/oro_loading.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('es');
  await ConnectivityService.instance.init();
  await NotificationService.instance.init();
  SyncService.instance.init();
  runApp(const OrocampoApp());
}

class OrocampoApp extends StatelessWidget {
  const OrocampoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
        ChangeNotifierProvider(create: (_) => ConnectivityProvider()..init()),
        ChangeNotifierProvider(create: (_) => SyncProvider()..init()),
        ChangeNotifierProvider(create: (_) => VentasProvider()),
        ChangeNotifierProvider(create: (_) => PagosProvider()),
        ChangeNotifierProvider(create: (_) => DevolucionesProvider()),
        ChangeNotifierProvider(create: (_) => RutaProvider()),
      ],
      child: MaterialApp(
        title: 'OROCAMPO',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.theme,
        home: const _AuthGate(),
      ),
    );
  }
}

class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.initialized) {
      return const Scaffold(body: Center(child: OroLoading(size: 150)));
    }
    if (!auth.isAuthenticated) return const LoginScreen();

    final role = auth.user?.role ?? '';
    if (role == 'Domiciliario') return const HomeScreen();
    if (role == 'Secretaria') return const SecretariaHome();
    return const AdminHome();
  }
}
